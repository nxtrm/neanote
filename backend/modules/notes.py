
from datetime import datetime
import os
import sys
from flask import Blueprint, g, jsonify, request
from flask_jwt_extended import jwt_required
from MySQLdb.cursors import DictCursor

from modules.universal import BaseNote
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

                with self.conn.cursor(cursor_factory=psycopg2.extras.DictCursor) as cur:

                    cur.execute("""
                        UPDATE Notes
                        SET title = %s, content = %s
                        WHERE id = %s AND user_id = %s
                    """, (title, content, note_id, userId))

                    cur.execute("DELETE FROM NoteTags WHERE note_id = %s", (note_id,))
                    for tag in note.get('tags', []):
                        cur.execute("""
                            INSERT INTO NoteTags (note_id, tag_id)
                            VALUES (%s, %s)
                        """, (note_id, str(tag)))

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
                noteId = data['noteid']
                with self.conn.cursor(cursor_factory=psycopg2.extras.DictCursor) as cur:
                    cur.execute("DELETE FROM NoteTags WHERE note_id = %s", (noteId,))
                    cur.execute("DELETE FROM Notes WHERE id = %s AND user_id = %s", (noteId,userId,))

                self.tokenization_manager.delete_note_by_id(noteId)
                self.conn.commit()
                return jsonify({'message': 'Note deleted successfully', 'data': None}), 200
            except Exception as e:
                self.conn.rollback()
                raise
            finally:
                cur.close()


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
                    cur.execute("""
                        SELECT COUNT(DISTINCT n.id) AS total
                        FROM Notes n
                        WHERE n.user_id = %s AND n.type = 'note' AND n.archived = FALSE
                    """, (userId,))
                    total = cur.fetchone()['total']

                    cur.execute("""
                        SELECT
                            n.id AS note_id,
                            n.title AS title,
                            n.content AS content,
                            n.type AS type,
                            tg.id AS tagid,
                            tg.name AS tag_name,
                            tg.color AS tag_color
                        FROM Notes n
                        LEFT JOIN NoteTags nt ON n.id = nt.note_id
                        LEFT JOIN Tags tg ON nt.tag_id = tg.id
                        WHERE n.user_id = %s AND n.type = 'note' AND n.archived = FALSE
                        ORDER BY n.updated_at DESC
                        LIMIT %s OFFSET %s
                    """, (userId, per_page
                        , offset
                        ))

                    rows = cur.fetchall()
                    notes = {}
                    for row in rows:
                        note_id = row['note_id']
                        if note_id not in notes:
                            notes[note_id] = {
                                'noteid': row['note_id'],
                                'title': row['title'][:100] + '...' if len(row['title']) > 100 else row['title'],
                                'content': row['content'][:200] + '...' if len(row['content']) > 200 else row['content'],
                                'tags': []
                            }
                        if row['tagid'] is not None:
                            is_tag_present = any(tag['tagid'] == row['tagid'] for tag in notes[note_id]['tags'])
                            if not is_tag_present:
                                notes[note_id]['tags'].append({
                                    'tagid': row['tagid'],
                                    'name': row['tag_name'],
                                    'color': row['tag_color']
                                })

                    notes_list = list(notes.values())
                    nextPage = page + 1 if (offset + per_page) < total else None

                    return jsonify({"notes": notes_list,
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
                    cur.execute("""
                        SELECT
                            n.id AS note_id,
                            n.title AS note_title,
                            n.content AS note_content,
                            n.created_at AS note_created_at,
                            n.type AS note_type,
                            tg.id AS tagid,
                            tg.name AS tag_name,
                            tg.color AS tag_color
                        FROM Notes n
                        LEFT JOIN NoteTags nt ON n.id = nt.note_id
                        LEFT JOIN Tags tg ON nt.tag_id = tg.id
                        WHERE n.user_id = %s AND n.id = %s AND n.type = 'note' AND n.archived = FALSE
                    """, (userId, noteid))

                    rows = cur.fetchall()
                    if not rows:
                        return jsonify({'message': "Note not found"}), 404

                    note = {
                        'noteid': rows[0]['note_id'],
                        'title': rows[0]['note_title'],
                        'content': rows[0]['note_content'],
                        'tags': []
                    }

                    for row in rows:
                        if row['tagid'] is not None:
                            note['tags'].append(
                                row['tagid']
                            )
                    self.recents_manager.add_note_for_user(userId, noteid)
                    return jsonify({"note": note, 'message': "Note fetched successfully"}), 200

            except Exception as e:
                self.conn.rollback()
                print(f"An error occurred: {e}")
                return jsonify({'message': 'An error occurred', 'error': str(e)}), 500

            finally:
                cur.close()