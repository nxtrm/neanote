from flask import g, jsonify, request
from flask_jwt_extended import jwt_required
import psycopg2

from utils import token_required


def archive_routes(app,conn):

    @app.route('/api/notes/archive', methods=['PUT'])
    @jwt_required()
    @token_required
    def archive():
        try:
            userId = g.userId
            cur = conn.cursor()
            data = request.get_json()
            note_id = data.get('noteId')
            print(note_id)
            cur.execute(
                "UPDATE Notes SET archived = TRUE WHERE id = %s AND user_id = %s",
                (note_id, userId)
            )
            conn.commit()
            return jsonify({'message': 'Note archived successfully', 'data': None}), 200
        except Exception as e:
            conn.rollback()
            raise
        finally:
            cur.close()

    @app.route('/api/notes/archive', methods=['GET'])
    @jwt_required()
    @token_required
    def getAll():
        try:
            userId = g.userId
            page = request.args.get('pageParam', 1, type=int)
            per_page = request.args.get('per_page', 10, type=int)
            offset = (page - 1) * per_page

            cur = conn.cursor(cursor_factory=psycopg2.extras.DictCursor)
            cur.execute(
                """
                SELECT id AS note_id, title, content, type 
                FROM Notes 
                WHERE user_id = %s AND archived = TRUE 
                LIMIT %s OFFSET %s
                """,
                (userId, per_page + 1, offset)  # Fetch one more note than the limit
            )
            notes = []
            rows = cur.fetchall()

            for row in rows:
                notes.append({
                        'noteid': row['note_id'],
                        'title': row['title'][:50] + '...' if len(row['title']) > 50 else row['title'],
                        'content': row['content'][:100] + '...' if len(row['content']) > 100 else row['content'],
                        'type': row['type'],
                        # 'tags': [],
                    })

            # Determine if there is a next page
            if len(notes) > per_page:
                next_page = page + 1
                notes = notes[:per_page]  # Return only the number of notes requested
            else:
                next_page = None

            return jsonify({'message': 'Archived notes retrieved successfully', 'data': notes, 'nextPage': next_page}), 200
        except Exception as e:
            conn.rollback()
            raise
        finally:
            cur.close()