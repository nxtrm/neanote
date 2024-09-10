
from datetime import datetime
import os
import sys
from flask import Blueprint, g, jsonify, request
from flask_jwt_extended import jwt_required

from modules.universal import BaseNote
from utils.userDeleteGraph import delete_notes_with_backoff, delete_user_data_with_backoff
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), os.path.pardir)))
from formsValidation import BaseSchema
from utils.utils import token_required
import psycopg2

class NoteApi(BaseNote):
    def __init__(self, app, conn, tokenization_manager, recents_manager):
        super().__init__(app, conn, tokenization_manager, recents_manager)
        self.note_schema = BaseSchema()
        self.note_routes()

    def tokenize(self,noteId,title,content):
        text = [title, content]
        priority = sum(len(string) for string in text)
        self.tokenization_manager.add_note(
            text=text,
            priority=priority,
            note_id=noteId
            )

    def note_routes(self):

        @self.app.route('/api/notes/create', methods=['POST'])
        @jwt_required()
        @token_required
        def create_note():
            try:
                userId = str(g.userId)
                data = self.note_schema.load(request.get_json())
                title = data['title']
                tags = data['tags']
                content = data['content']
                with self.conn.cursor(cursor_factory=psycopg2.extras.DictCursor) as cur:
                    noteId = self.create_note(cur, userId, title, content, 'note', tags)

                self.tokenize(noteId,title,content)
                self.conn.commit()

                return jsonify({
                    'message': 'Note created successfully',
                    'data': {
                        'noteid': noteId,
                    }
                }), 200
            except Exception as error:
                self.conn.rollback()
                print('Error during transaction', error)
                raise
            finally:
                cur.close()

        @self.app.route('/api/notes/update', methods=['PUT'])
        @jwt_required()
        @token_required
        def update_note():
            try:
                userId = str(g.userId)  # Convert userId to string
                note = self.note_schema.load(request.get_json())

                note_id = str(note['noteid'])
                title = note['title']
                content = note['content']
                tags = note.get('tags', [])

                with self.conn.cursor(cursor_factory=psycopg2.extras.DictCursor) as cur:

                    cur.execute("""
                        UPDATE Notes
                        SET title = %s, content = %s
                        WHERE id = %s AND user_id = %s
                    """, (title, content, note_id, userId))

                    self.update_notetags(cur, note_id, tags)

                    self.tokenize(note_id, title, content)
                    self.conn.commit()

                    return jsonify({'message': 'Note updated successfully', 'data': None}), 200
            except Exception as e:
                self.conn.rollback()
                print(f"An error occurred: {e}")
                raise
            finally:
                cur.close()

        @self.app.route('/api/notes/delete', methods=['PUT'])
        @jwt_required()
        @token_required
        def delete_note():
            try:
                userId = g.userId
                data = request.get_json()
                note_id = data['noteId']
                stack = [12,2] #NoteTags, Notes
                stack.reverse()
                if delete_notes_with_backoff(self.conn, note_id, stack):
                    self.tokenization_manager.delete_note_by_id(note_id)
                    return jsonify({'message': 'Note deleted successfully'}), 200
                else:
                    return jsonify({'message': 'Failed to delete note data after multiple retries'}), 500
            except Exception as e:
                self.conn.rollback()
                raise


        @self.app.route('/api/notes/previews', methods=['GET'])
        @jwt_required()
        @token_required
        def get_note_previews():
            try:
                userId = g.userId
                # Pagination
                page = int(request.args.get('pageParam', 1))  # Default to page 1
                per_page = int(request.args.get('per_page', 5))  # Default to 10 items per page
                offset = (page - 1) * per_page

                with self.conn.cursor(cursor_factory=psycopg2.extras.DictCursor) as cur:
                    # Fetch the total count of notes for pagination metadata
                    total,nextPage = self.fetch_total_notes(cur, 'note', userId, page, offset, per_page)

                    cur.execute(f"""
                        WITH {self.tags_cte}
                        SELECT
                            n.id AS note_id,
                            n.title AS title,
                            n.content AS content,
                            n.type AS type,
                            COALESCE(tags_cte.tags, '[]') AS tags
                        FROM Notes n
                        LEFT JOIN TagsCTE tags_cte ON n.id = tags_cte.note_id
                        WHERE n.user_id = %s AND n.type = 'note' AND n.archived = FALSE
                        ORDER BY n.updated_at DESC
                        LIMIT %s OFFSET %s
                    """, (userId, per_page, offset))

                    rows = cur.fetchall()
                    notes = []
                    for row in rows:
                        note = {
                            'noteid': row['note_id'],
                            'title': row['title'][:100] + '...' if len(row['title']) > 100 else row['title'],
                            'content': row['content'][:200] + '...' if len(row['content']) > 200 else row['content'],
                            'tags': row['tags']
                        }
                        notes.append(note)

                    return jsonify({"notes": notes,
                                    'pagination': {
                                        'total': total,
                                        'page': page,
                                        'perPage': per_page,
                                        'nextPage': nextPage
                                    }}), 200

            except Exception as e:
                self.conn.rollback()
                print(f"An error occurred: {e}")
                return jsonify({'message': 'An error occurred', 'error': str(e)}), 500

            finally:
                cur.close()

        @self.app.route('/api/note', methods=['GET'])
        @jwt_required()
        @token_required
        def get_note():
            try:
                userId = g.userId
                noteid = request.args.get('noteid')

                with self.conn.cursor(cursor_factory=psycopg2.extras.DictCursor) as cur:

                    cur.execute(f"""
                        WITH {self.tags_cte}
                        SELECT
                            n.id AS note_id,
                            n.title AS note_title,
                            n.content AS note_content,
                            n.created_at AS note_created_at,
                            n.type AS note_type,
                            COALESCE(tags_cte.tags, '[]') AS tags
                        FROM Notes n
                        LEFT JOIN TagsCTE tags_cte ON n.id = tags_cte.note_id
                        WHERE n.user_id = %s AND n.id = %s AND n.type = 'note' AND n.archived = FALSE
                    """, (userId, noteid))

                    row = cur.fetchone()
                    if not row:
                        return jsonify({'message': "Note not found"}), 404

                    note = {
                        'noteid': row['note_id'],
                        'title': row['note_title'],
                        'content': row['note_content'],
                        'tags': row['tags']
                    }
                    self.recents_manager.add_note_for_user(userId, noteid)
                    return jsonify({"note": note, 'message': "Note fetched successfully"}), 200

            except Exception as e:
                self.conn.rollback()
                print(f"An error occurred: {e}")
                return jsonify({'message': 'An error occurred', 'error': str(e)}), 500

            finally:
                cur.close()