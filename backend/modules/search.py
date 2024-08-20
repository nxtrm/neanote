from flask import g, jsonify, request
from flask_jwt_extended import jwt_required
import psycopg2

from utils import process_universal_notes, token_required
from word2vec import combine_strings_to_vector


def search_routes(app, conn, model):
    @app.route('/api/search', methods=['GET'])
    @jwt_required()
    @token_required
    def search():
        try:
            user_id = g.userId
            cur = conn.cursor(cursor_factory=psycopg2.extras.DictCursor)
            search_query = request.args.get('searchQuery')
            search_mode = request.args.get('searchMode')
            page = int(request.args.get('pageParam', 1))
            per_page = int(request.args.get('perPage', 5))
            offset = (page - 1) * per_page

            if search_mode == "approximate":
                query_vector = combine_strings_to_vector([search_query], model, False)

                cur.execute("""
                    SELECT n.id AS note_id, n.title, n.content, n.type,
                    t.id AS tagid,
                    t.name,
                    t.color,
                    cosine_similarity(n.vector, %s) as similarity
                    FROM Notes n
                    LEFT JOIN NoteTags nt ON n.id = nt.note_id
                    LEFT JOIN Tags t ON nt.tag_id = t.id
                    WHERE n.user_id = %s AND n.archived = FALSE AND n.vector IS NOT NULL
                    ORDER BY similarity DESC
                    LIMIT %s OFFSET %s;
                """, (query_vector, user_id, per_page, offset))

            else:
                cur.execute("""
                    SELECT n.id AS note_id, n.title, n.content, n.type,
                        t.id AS tagid,
                        t.name,
                        t.color
                    FROM Notes n
                        LEFT JOIN NoteTags nt ON n.id = nt.note_id
                        LEFT JOIN Tags t ON nt.tag_id = t.id
                    WHERE n.user_id = %s AND n.archived = FALSE
                        AND (n.title ILIKE %s OR n.content ILIKE %s)
                    LIMIT %s OFFSET %s;
                """, (user_id, f"%{search_query}%", f"%{search_query}%", per_page, offset))

            rows = cur.fetchall()

            # Get the total number of results for pagination
            if search_mode == "approximate":
                cur.execute("""
                    SELECT COUNT(*) FROM Notes n
                    WHERE n.user_id = %s AND n.archived = FALSE AND n.vector IS NOT NULL;
                """, (user_id,))
            else:
                cur.execute("""
                    SELECT COUNT(*) FROM Notes n
                    WHERE n.user_id = %s AND n.archived = FALSE
                        AND (n.title ILIKE %s OR n.content ILIKE %s);
                """, (user_id, f"%{search_query}%", f"%{search_query}%"))
            
            total = cur.fetchone()[0]
            next_page = page + 1 if offset + per_page < total else None

            notes=process_universal_notes(rows,cur)

            return jsonify({'message': 'Notes retrieved successfully', 'data': notes,
                            'pagination': {
                                    'total': total,
                                    'page': page,
                                    'perPage': per_page,
                                    'nextPage': next_page
                                }
                            }), 200
        except Exception as e:
            conn.rollback()
            print(f"An error occurred: {e}")
            return jsonify({'message': 'An error occurred', 'error': str(e)}), 500
        finally:
            cur.close()