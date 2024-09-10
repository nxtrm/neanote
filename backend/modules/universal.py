from datetime import datetime
import os
import sys

import psycopg2
from flask import g, jsonify, request
from flask_jwt_extended import jwt_required

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), os.path.pardir)))

from flask import g, jsonify, request
from flask_jwt_extended import jwt_required

from formsValidation import GeminiSummarySchema
from utils.utils import process_universal_notes, token_required
from utils.word2vec import combine_strings_to_vector


class BaseNote:
    def __init__(self, app, conn, tokenization_manager, recents_manager):
        self.app = app
        self.conn = conn
        self.tokenization_manager = tokenization_manager
        self.recents_manager = recents_manager

        self.tags_cte = """TagsCTE AS (
                            SELECT
                                nt.note_id,
                                json_agg(json_build_object(
                                    'tagid', tg.id,
                                    'name', tg.name,
                                    'color', tg.color
                                )) AS tags
                            FROM NoteTags nt
                            JOIN Tags tg ON nt.tag_id = tg.id
                            GROUP BY nt.note_id
                        )"""

    def create_note(self, cur, userId, title, content, noteType, tags):
        cur.execute( # Insert into Notes table
            "INSERT INTO Notes (user_id, title, content, type) VALUES (%s, %s, %s, %s) RETURNING id",
            (userId, title, content, noteType)
        )
        noteId = str(cur.fetchone()[0])

        self.update_notetags(cur, noteId,tags, withDelete=False)

        return noteId
    def fetch_total_notes(self, cur,note_type, userId, page,offset,per_page):
        cur.execute("""
                        SELECT COUNT(DISTINCT n.id) AS total
                        FROM Notes n
                        WHERE n.user_id = %s AND n.type = %s AND n.archived = FALSE
                    """, (userId,note_type,))
        total = cur.fetchone()['total']
        nextPage = page + 1 if (offset + per_page) < total else None
        return total, nextPage

    def update_notetags(self, cur, note_id, tags, withDelete=True):

        if withDelete:
            cur.execute("DELETE FROM NoteTags WHERE note_id = %s", (note_id,))
        if tags:
            tag_tuples = [(note_id, str(tagId)) for tagId in tags]
            cur.executemany(
                """
                INSERT INTO NoteTags (note_id, tag_id)
                VALUES (%s, %s)
                """,
                tag_tuples
            )

def universal_routes(app, conn, model, recents_manager,
                    #  genai
                     ):
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
                query_vector = combine_strings_to_vector(search_query.split(), model, False)

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

            if rows:
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

    @app.route('/api/recents', methods=['GET'])
    @jwt_required()
    @token_required
    def get_recents():
        try:
            userId=g.userId
            noteIds = recents_manager.get_recent_notes_for_user(userId)
            cur = conn.cursor(cursor_factory=psycopg2.extras.DictCursor)

            notes = []
            for note_id in noteIds:
                cur.execute("""
                    SELECT n.id AS note_id, n.title, n.content, n.type,
                        t.id AS tagid,
                        t.name,
                        t.color
                    FROM Notes n
                        LEFT JOIN NoteTags nt ON n.id = nt.note_id
                        LEFT JOIN Tags t ON nt.tag_id = t.id
                    WHERE n.user_id = %s AND n.id = %s;
                """, (userId, note_id))

                row = cur.fetchone()
                if row:
                    note = process_universal_notes([row], cur)[0]
                    notes.append(note)

            return jsonify({'message': 'Recent notes retrieved successfully', 'data': notes}), 200
        except Exception as e:
            conn.rollback()
            raise

    @app.route('/api/calendar', methods=['GET'])
    @jwt_required()
    @token_required
    def get_calendar_notes():
        try:
            userId = g.userId
            start_date = request.args.get('startDate')
            end_date = request.args.get('endDate')

            # Convert start and end dates to datetime objects
            start_date = datetime.fromisoformat(str(start_date))
            end_date = datetime.fromisoformat(str(end_date))

            with conn.cursor(cursor_factory=psycopg2.extras.DictCursor) as cur:
                # Fetch notes from goals table
                cur.execute("""
                    SELECT n.id AS note_id, n.title, n.content, n.type, g.due_date
                    FROM Notes n
                    JOIN Goals g ON n.id = g.note_id
                    WHERE n.user_id = %s AND g.due_date BETWEEN %s AND %s
                """, (userId, start_date, end_date))
                goal_notes = cur.fetchall()

                # Fetch notes from tasks table
                cur.execute("""
                    SELECT n.id AS note_id, n.title, n.type, n.content, t.due_date
                    FROM Notes n
                    JOIN Tasks t ON n.id = t.note_id
                    WHERE n.user_id = %s AND t.due_date BETWEEN %s AND %s
                """, (userId, start_date, end_date))
                task_notes = cur.fetchall()

                # Combine results
                notes = []
                for row in goal_notes + task_notes:
                    note = {
                        'noteid': row['note_id'],
                        'title': row['title'][:50] + '...' if len(row['title']) > 50 else row['title'],
                        'content': row['content'],
                        'due_date': row['due_date'],
                        'type': row['type'],
                        'tags' : []
                    }
                    #Select tags
                    cur.execute("""
                        SELECT
                            json_agg(json_build_object(
                                'tagid', tg.id,
                                'name', tg.name,
                                'color', tg.color
                            )) AS tags
                        FROM NoteTags nt
                        JOIN Tags tg ON nt.tag_id = tg.id
                        WHERE nt.note_id = %s
                        GROUP BY nt.note_id
                    """, (row['note_id'],))
                    note['tags'] = cur.fetchone()
                    notes.append(note)

                return jsonify({'message': 'Notes retrieved successfully', 'data': notes}), 200

        except Exception as e:
            conn.rollback()
            print(f"An error occurred: {e}")
            return jsonify({'message': 'An error occurred', 'error': str(e)}), 500



    # Note summarization model using Google's Gemini LLM's API
    @app.route('/api/summarize', methods=['POST'])
    @jwt_required()
    @token_required
    def summarize():
            try:
                #Commented out for now as api not avalible in my region
                                                                                        
                # gemini_schema = GeminiSummarySchema()
                # data = gemini_schema.load(request.json)
                # title  = data['title']
                # selection =  data['selection']

                # model = genai.GenerativeModel("gemini-1.5-flash")
                # response = model.generate_content("""
                #     Please summarize the following extract from a note titled {title}, delimeted by three backticks:

                #     ```{selection}```

                #     Please include:

                #         Key points: What are the most important things mentioned in the extract?

                #         Context: How does this extract relate to the note as a whole?

                #         Purpose: What is the purpose of this particular extract within the note?

                #     Keep the summary concise, clear and below 1000 characters.
                #     """.format(title=title, selection=selection),
                #     # stream=True,
                #     generation_config = genai.types.GenerationConfig(
                #         temperature=0.2,
                #         top_p=0.95,
                #         top_k=40,
                #         stop_sequences=["\n", "\n\n"],
                #         max_output_tokens=256,
                #     ),

                #     )
                response = "This is a dummy response for now as the API is not available in my region at the moment but it should work fine in your region blah blah blah."
                return jsonify({'message': 'Summary generated successfully', 'data': response}), 200
            except Exception as e:
                raise


