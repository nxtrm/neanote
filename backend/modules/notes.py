
from datetime import datetime
import os
import sys
from flask import Blueprint, g, jsonify, request
from flask_jwt_extended import jwt_required
from MySQLdb.cursors import DictCursor
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), os.path.pardir)))
from formsValidation import BaseSchema
from utils.utils import token_required
import psycopg2


def note_routes(app, conn, tokenization_manager,recents_manager):

    #NOTE MODULE
    @app.route('/api/notes/create', methods=['POST'])
    @jwt_required()
    @token_required
    def create_note():
        try:
            userId = str(g.userId) 
            note_schema = BaseSchema()
            data = note_schema.load(request.get_json())
            title = data['title']
            tags = data['tags']
            content = data['content']
            cur = conn.cursor(cursor_factory=psycopg2.extras.DictCursor)
            # Insert into Notes table
            cur.execute(
                "INSERT INTO Notes (user_id, title, content, type) VALUES (%s, %s, %s, %s) RETURNING id",
                (userId, title, content, 'note')
            )
            conn.commit()
            noteId = cur.fetchone()[0]
            if tags:
                tag_tuples = [(noteId, str(tagId)) for tagId in tags]
                cur.executemany(
                    """
                    INSERT INTO NoteTags (note_id, tag_id)
                    VALUES (%s, %s)
                    """,
                    tag_tuples
                )
            text = [title, content]
            priority = sum(len(string) for string in text)
            tokenization_manager.add_note(
            text=text,
            priority=priority,
            note_id=noteId
            )
            conn.commit()
            return jsonify({
                'message': 'Note created successfully',
                'data': {
                    'noteid': noteId,
                }
            }), 200
        except Exception as error:
            conn.rollback()
            print('Error during transaction', error)
            raise
        finally:
            cur.close()

    @app.route('/api/notes/update', methods=['PUT'])
    @jwt_required()
    @token_required
    def update_note():
        try:
            userId = str(g.userId)  # Convert userId to string
            note_schema = BaseSchema()
            note = note_schema.load(request.get_json())

            note_id = str(note['noteid'])
            title = note['title']
            content = note['content']

            with conn.cursor(cursor_factory=psycopg2.extras.DictCursor) as cur:

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

                text = [title, content]
                priority = sum(len(string) for string in text)
                tokenization_manager.add_note(
                text=text,
                note_id=note_id,
                priority=priority,
                )
                conn.commit()

                return jsonify({'message': 'Note updated successfully', 'data': None}), 200
        except Exception as e:
            conn.rollback()
            print(f"An error occurred: {e}")
            raise
        finally:
            if 'cur' in locals():
                cur.close()

    @app.route('/api/notes/delete', methods=['PUT'])
    @jwt_required()
    @token_required
    def delete_note():
        try:
            userId = g.userId
            data = request.get_json()
            noteId = data['noteid']
            cur = conn.cursor(cursor_factory=psycopg2.extras.DictCursor)
            cur.execute("DELETE FROM NoteTags WHERE note_id = %s", (noteId,))
            cur.execute("DELETE FROM Notes WHERE id = %s", (noteId,))

            tokenization_manager.delete_note_by_id(noteId)
            conn.commit()
            cur.close()
            return jsonify({'message': 'Note deleted successfully', 'data': None}), 200
        except Exception as e:
            conn.rollback()
            raise
        finally:
            cur.close()


    @app.route('/api/notes/previews', methods=['GET'])
    @jwt_required()
    @token_required
    def get_note_previews():
        try:
            userId = g.userId
            # Pagination
            page = int(request.args.get('pageParam', 1))  # Default to page 1
            per_page = int(request.args.get('per_page', 5))  # Default to 10 items per page
            offset = (page - 1) * per_page

            with conn.cursor(cursor_factory=psycopg2.extras.DictCursor) as cur:
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
                    LEFT JOIN Notes t ON n.id = t.note_id
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
            conn.rollback()
            print(f"An error occurred: {e}")
            return jsonify({'message': 'An error occurred', 'error': str(e)}), 500

        finally:
            cur.close()

    @app.route('/api/note', methods=['GET'])
    @jwt_required()
    @token_required
    def get_note():
        try:
            userId = g.userId
            noteid = request.args.get('noteid')

            with conn.cursor(cursor_factory=psycopg2.extras.DictCursor) as cur:
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
                    LEFT JOIN Notes t ON n.id = t.note_id
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
                    'completed': rows[0]['note_completed'],
                    'due_date': rows[0]['note_due_date'],
                    'subnotes': [],
                    'tags': []
                }

                for row in rows:
                    if row['tagid'] is not None:
                        note['tags'].append(
                            row['tagid']
                        )
                recents_manager.add_note_for_user(userId, noteid)
                return jsonify({"note": note, 'message': "Note fetched successfully"}), 200

        except Exception as e:
            conn.rollback()
            print(f"An error occurred: {e}")
            return jsonify({'message': 'An error occurred', 'error': str(e)}), 500

        finally:
            cur.close()