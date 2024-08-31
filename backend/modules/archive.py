import os
import sys
from flask import g, jsonify, request
from flask_jwt_extended import jwt_required
import psycopg2
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), os.path.pardir)))
from utils.utils import process_universal_notes, token_required


def archive_routes(app,conn, model):

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
            return jsonify({'message': 'Note archived successfully'}), 200
        except Exception as e:
            conn.rollback()
            raise
        finally:
            cur.close()

    @app.route('/api/notes/restore', methods=['PUT'])
    @jwt_required()
    @token_required
    def restore():
        try:
            userId = g.userId
            cur = conn.cursor()
            data = request.get_json()
            note_id = data.get('noteId')
            cur.execute(
                "UPDATE Notes SET archived = FALSE WHERE id = %s AND user_id = %s",
                (note_id, userId)
            )
            conn.commit()
            return jsonify({'message': 'Note restored successfully'}), 200
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

            cur.execute("""
                    SELECT COUNT(DISTINCT n.id) AS total
                    FROM Notes n
                    WHERE n.user_id = %s AND n.archived = TRUE
                """, (userId,))
            total = cur.fetchone()['total']

            cur.execute(
                """
                SELECT n.id AS note_id, n.title, n.content, n.type,
                t.id AS tagid,
                t.name,
                t.color
                FROM Notes n
                LEFT JOIN NoteTags nt ON n.id = nt.note_id
                LEFT JOIN Tags t ON nt.tag_id = t.id
                WHERE n.user_id = %s AND n.archived = TRUE
                LIMIT %s OFFSET %s
                """,
                (userId, per_page + 1, offset)  # Fetch one more note than the limit
            )
            rows = cur.fetchall()
            if rows:
                notes = process_universal_notes(rows,cur)

            # Determine if there is a next page
            if len(notes) > per_page:
                next_page = page + 1
                notes = notes[:per_page]  # Return only the number of notes requested
            else:
                next_page = None

            return jsonify({'message': 'Archived notes retrieved successfully', 'data': notes, 
                            'pagination': {
                                    'total': total,
                                    'page': page,
                                    'perPage': per_page,
                                    'nextPage': next_page
                                }}), 200
        except Exception as e:
            conn.rollback()
            raise
        finally:
            cur.close()