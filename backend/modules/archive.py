from flask import g, jsonify, request
from flask_jwt_extended import jwt_required
import psycopg2

from utils import token_required


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
            notes_dict = {}
            for row in rows:
                note_id = row['note_id']
                if note_id not in notes_dict:
                    notes_dict[note_id] = {
                        'noteid': note_id,
                        'title': row['title'][:50] + '...' if len(row['title']) > 50 else row['title'],
                        'content': row['content'][:100] + '...' if len(row['content']) > 100 else row['content'],
                        'type': row['type'],
                        'tags': []
                    }
                if row['tagid']:
                    notes_dict[note_id]['tags'].append({
                        'tagid': row['tagid'],
                        'name': row['name'],
                        'color': row['color']
                    })

                # Fetch the secondary ID based on the type
                for note in notes_dict.values():
                    if note['type'] == 'task':
                        cur.execute("SELECT id AS taskid FROM Tasks WHERE note_id = %s", (note['noteid'],))
                        secondary_id = cur.fetchone()
                        note['secondaryid'] = secondary_id['taskid'] if secondary_id else None
                    elif note['type'] == 'habit':
                        cur.execute("SELECT id AS habitid FROM Habits WHERE note_id = %s", (note['noteid'],))
                        secondary_id = cur.fetchone()
                        note['secondaryid'] = secondary_id['habitid'] if secondary_id else None
                    elif note['type'] == 'goal':
                        cur.execute("SELECT id AS goalid FROM Goals WHERE note_id = %s", (note['noteid'],))
                        secondary_id = cur.fetchone()
                        note['secondaryid'] = secondary_id['goalid'] if secondary_id else None
                    # Add any other types here

            notes = list(notes_dict.values())

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