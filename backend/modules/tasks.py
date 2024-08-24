
from datetime import datetime
import os
import sys
from flask import Blueprint, g, jsonify, request
from flask_jwt_extended import jwt_required
from MySQLdb.cursors import DictCursor
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), os.path.pardir)))
from formsValidation import TaskSchema
from utils.utils import token_required, verify_subtask_ownership, verify_task_ownership
import psycopg2

from utils.databaseManager import DatabaseManager
class TaskManager:
    def __init__(self, db_manager):
        self.db_manager = db_manager
    
    def create_task(self,title,tags,content,subtasks,due_date,user_id):
            # Insert into Notes table
            note_id = self.db_manager.execute_query(
                "INSERT INTO Notes (user_id, title, content, type) VALUES (%s, %s, %s, %s) RETURNING id",
                (user_id, title, content, 'task')
            )[0][0]
            # Commit the transaction to ensure the insert is finalized
            self.db_manager.commit()

            task_id = self.db_manager.execute_query(
                "INSERT INTO Tasks (note_id, completed, due_date) VALUES (%s, %s, %s) RETURNING id",
                (note_id, False, due_date)
            )[0][0]

            new_subtasks = None

            if subtasks:
                subtask_tuples = [
                    (task_id, subtask['description'], False, subtask['index'])
                    for subtask in subtasks
                ]
                self.db_manager.executemany(
                    """
                    INSERT INTO Subtasks (task_id, description, completed, st_index)
                    VALUES (%s, %s, %s, %s)
                    RETURNING id, task_id, description, completed, st_index
                    """,
                    subtask_tuples
                )

                subtasks = self.db_manager.fetchall()

            if tags:
                tag_tuples = [(note_id, str(tagId)) for tagId in tags]  # Convert tagId to string if it's a UUID
                self.db_manager.executemany(
                    """
                    INSERT INTO NoteTags (note_id, tag_id)
                    VALUES (%s, %s)
                    """,
                    tag_tuples
                )
            self.db_manager.commit()
            return note_id, task_id, subtasks


def task_routes(app, conn, tokenization_manager,recents_manager):
    db_manager = DatabaseManager(conn)
    task_manager = TaskManager(db_manager)

    #TASK MODULE
    @app.route('/api/tasks/create', methods=['POST'])
    @jwt_required()
    @token_required
    def create_task():
        try:
            userId = str(g.userId)  # Convert UUID to string if userId is a UUID
            task_schema = TaskSchema()
            data = task_schema.load(request.get_json())

            title = data['title']
            tags = data['tags']
            content = data['content']
            subtasks = data['subtasks']
            due_date = data.get('due_date')

            note_id, task_id, subtasks = task_manager.create_task(data, userId)

            text = [title, content] + [subtask['description'] for subtask in subtasks] if subtasks else [title, content]
            priority = sum(len(string) for string in text)

            tokenization_manager.add_note(
            text=text,
            priority=priority,
            note_id=note_id
            )

            return jsonify({
                'message': 'Task created successfully',
                'data': {
                    'noteid': note_id,
                    'taskid': task_id,
                    'subtasks': subtasks
                }
            }), 200

        except Exception as error:
            db_manager.rollback()
            print('Error during transaction', error)
            raise
        finally:
            db_manager.close()

    @app.route('/api/tasks/update', methods=['PUT'])
    @jwt_required()
    @token_required
    def update_task():
        try:
            userId = str(g.userId)  # Convert userId to string
            task_schema = TaskSchema()
            task = task_schema.load(request.get_json())

            note_id = str(task['noteid'])  # Convert note_id to string
            task_id = str(task['taskid'])  # Convert task_id to string
            title = task['title']
            content = task['content']
            due_date = task.get('due_date')

            with conn.cursor(cursor_factory=psycopg2.extras.DictCursor) as cur:
                if not verify_task_ownership(userId, task_id, cur):
                    return jsonify({'message': 'You do not have permission to update this task'}), 403

                cur.execute("""
                    UPDATE Notes
                    SET title = %s, content = %s
                    WHERE id = %s AND user_id = %s
                """, (title, content, note_id,  userId))

                cur.execute("""
                    UPDATE Tasks
                    SET due_date = %s
                    WHERE id = %s
                """, (due_date, task_id))

                cur.execute("DELETE FROM Subtasks WHERE task_id = %s", (task_id,))
                for subtask in task.get('subtasks', []):
                    cur.execute("""
                        INSERT INTO Subtasks (task_id, description, completed, st_index)
                        VALUES (%s, %s, %s, %s)
                    """, (task_id, subtask['description'], subtask['completed'], subtask['index']))

                cur.execute("DELETE FROM NoteTags WHERE note_id = %s", (note_id,))
                for tag in task.get('tags', []):
                    cur.execute("""
                        INSERT INTO NoteTags (note_id, tag_id)
                        VALUES (%s, %s)
                    """, (note_id, str(tag)))

                text = [title, content] + [subtask['description'] for subtask in task.get('subtasks')] if task.get('subtasks') else [title, content]
                priority = sum(len(string) for string in text)
                tokenization_manager.add_note(
                text=text,
                note_id=note_id,
                priority=priority,
                )
                conn.commit()

                return jsonify({'message': 'Task updated successfully', 'data': None}), 200
        except Exception as e:
            conn.rollback()
            print(f"An error occurred: {e}")
            raise
        finally:
            if 'cur' in locals():  # Check if 'cur' is defined
                cur.close()

    @app.route('/api/tasks/delete', methods=['PUT'])
    @jwt_required()
    @token_required
    def delete_task():
        try:
            userId = g.userId
            data = request.get_json()
            taskId = data['taskId']
            noteId = data['noteId']
            cur = conn.cursor(cursor_factory=psycopg2.extras.DictCursor)
            if verify_task_ownership(userId, taskId, cur) == False:
                return jsonify({'message': 'You do not have permission to update this task'}), 403
            cur.execute("DELETE FROM NoteTags WHERE note_id = %s", (noteId,))
            cur.execute("DELETE FROM Subtasks WHERE task_id = %s", (taskId,))
            cur.execute("DELETE FROM Tasks WHERE note_id = %s", (noteId,))
            cur.execute("DELETE FROM Notes WHERE id = %s", (noteId,))

            tokenization_manager.delete_note_by_id(noteId)
            conn.commit()
            cur.close()
            return jsonify({'message': 'Task deleted successfully', 'data': None}), 200
        except Exception as e:
            conn.rollback()
            raise
        finally:
            cur.close()


    @app.route('/api/tasks/toggle', methods=['PUT'])
    @jwt_required()
    @token_required
    def toggle_task_fields():
        try:
            userId = g.userId
            data = request.get_json()
            taskId = data.get('taskid')
            subtaskId = data.get('subtaskid')

            with conn.cursor(cursor_factory=psycopg2.extras.DictCursor) as cur:
                if not verify_task_ownership(userId, taskId, cur):
                    return jsonify({'message': 'You do not have permission to update this task'}), 403

                if not subtaskId:
                    toggle_task_sql = """
                        UPDATE Tasks
                        SET completed = NOT completed,
                            completion_timestamp = CASE
                                WHEN completed THEN NULL  -- If the task is being uncompleted, set timestamp to NULL
                                ELSE CURRENT_TIMESTAMP    -- If the task is being completed, set timestamp to current date and time
                            END
                        WHERE id = %s
                    """
                    cur.execute(toggle_task_sql, (taskId,))

                if subtaskId and verify_subtask_ownership(userId, subtaskId, cur):
                    toggle_subtask_sql = """
                        UPDATE Subtasks
                        SET completed = NOT completed
                        WHERE id = %s AND task_id = %s
                    """
                    cur.execute(toggle_subtask_sql, (subtaskId, taskId))

                conn.commit()
                return jsonify({'message': 'Field toggled successfully', "data": None}), 200

        except Exception as e:
            conn.rollback()
            print(f"An error occurred: {e}")
            return jsonify({'message': 'An error occurred', 'error': str(e)}), 500

        finally:
            cur.close()


    @app.route('/api/tasks/previews', methods=['GET'])
    @jwt_required()
    @token_required
    def get_task_previews():
        try:
            userId = g.userId
            # Pagination
            page = int(request.args.get('pageParam', 1))  # Default to page 1
            per_page = int(request.args.get('per_page', 5))  # Default to 10 items per page
            offset = (page - 1) * per_page

            with conn.cursor(cursor_factory=psycopg2.extras.DictCursor) as cur:
                # Fetch the total count of tasks for pagination metadata
                cur.execute("""
                    SELECT COUNT(DISTINCT n.id) AS total
                    FROM Notes n
                    WHERE n.user_id = %s AND n.type = 'task' AND n.archived = FALSE
                """, (userId,))
                total = cur.fetchone()['total']

                cur.execute("""
                    SELECT
                        n.id AS note_id,
                        n.title AS title,
                        n.content AS content,
                        n.type AS type,
                        t.id AS task_id,
                        t.completed AS task_completed,
                        t.due_date AS task_due_date,
                        st.id AS subtaskid,
                        st.description AS subtask_description,
                        st.completed AS subtask_completed,
                        st.st_index AS subtask_index,
                        tg.id AS tagid,
                        tg.name AS tag_name,
                        tg.color AS tag_color
                    FROM Notes n
                    LEFT JOIN Tasks t ON n.id = t.note_id
                    LEFT JOIN Subtasks st ON t.id = st.task_id
                    LEFT JOIN NoteTags nt ON n.id = nt.note_id
                    LEFT JOIN Tags tg ON nt.tag_id = tg.id
                    WHERE n.user_id = %s AND n.type = 'task' AND n.archived = FALSE
                    ORDER BY n.updated_at DESC
                    LIMIT %s OFFSET %s
                """, (userId, per_page
                      , offset
                      ))

                rows = cur.fetchall()
                tasks = {}
                for row in rows:
                    note_id = row['note_id']
                    if note_id not in tasks:
                        tasks[note_id] = {
                            'noteid': row['note_id'],
                            'taskid': row['task_id'],
                            'title': row['title'][:100] + '...' if len(row['title']) > 100 else row['title'],
                            'content': row['content'][:200] + '...' if len(row['content']) > 200 else row['content'],
                            'completed': row['task_completed'],
                            'due_date': row['task_due_date'],
                            'subtasks': [],
                            'tags': []
                        }

                    if row['subtaskid'] is not None:
                        is_subtask_present = any(subtask['subtaskid'] == row['subtaskid'] for subtask in tasks[note_id]['subtasks'])
                        if not is_subtask_present:
                            tasks[note_id]['subtasks'].append({
                                'subtaskid': row['subtaskid'],
                                'description': row['subtask_description'][:200] + '...' if len(row['subtask_description']) > 200 else row['subtask_description'],
                                'index': row['subtask_index'],
                                'completed': row['subtask_completed']
                            })

                    if row['tagid'] is not None:
                        is_tag_present = any(tag['tagid'] == row['tagid'] for tag in tasks[note_id]['tags'])
                        if not is_tag_present:
                            tasks[note_id]['tags'].append({
                                'tagid': row['tagid'],
                                'name': row['tag_name'],
                                'color': row['tag_color']
                            })

                tasks_list = list(tasks.values())
                nextPage = page + 1 if (offset + per_page) < total else None

                return jsonify({"tasks": tasks_list,
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

    @app.route('/api/task', methods=['GET'])
    @jwt_required()
    @token_required
    def get_task():
        try:
            userId = g.userId
            noteid = request.args.get('noteid')

            with conn.cursor(cursor_factory=psycopg2.extras.DictCursor) as cur:
                cur.execute("""
                    SELECT
                        n.id AS note_id,
                        n.title AS note_title,
                        n.content AS note_content,
                        n.created_at AS task_created_at,
                        n.type AS note_type,
                        t.id AS task_id,
                        t.completed AS task_completed,
                        t.due_date AS task_due_date,
                        st.id AS subtask_id,
                        st.description AS subtask_description,
                        st.completed AS subtask_completed,
                        st.st_index AS subtask_index,
                        tg.id AS tagid,
                        tg.name AS tag_name,
                        tg.color AS tag_color
                    FROM Notes n
                    LEFT JOIN Tasks t ON n.id = t.note_id
                    LEFT JOIN Subtasks st ON t.id = st.task_id
                    LEFT JOIN NoteTags nt ON n.id = nt.note_id
                    LEFT JOIN Tags tg ON nt.tag_id = tg.id
                    WHERE n.user_id = %s AND n.id = %s AND n.type = 'task' AND n.archived = FALSE
                """, (userId, noteid))

                rows = cur.fetchall()
                if not rows:
                    return jsonify({'message': "Task not found"}), 404

                task = {
                    'noteid': rows[0]['note_id'],
                    'taskid': rows[0]['task_id'],
                    'title': rows[0]['note_title'],
                    'content': rows[0]['note_content'],
                    'completed': rows[0]['task_completed'],
                    'due_date': rows[0]['task_due_date'],
                    'subtasks': [],
                    'tags': []
                }

                for row in rows:
                    if row['subtask_id'] is not None:
                        task['subtasks'].append({
                            'subtaskid': row['subtask_id'],
                            'description': row['subtask_description'],
                            'completed': row['subtask_completed'],
                            'index': row['subtask_index']
                        })
                    if row['tagid'] is not None:
                        task['tags'].append(
                            row['tagid']
                        )
                recents_manager.add_note_for_user(userId, noteid)
                return jsonify({"task": task, 'message': "Task fetched successfully"}), 200

        except Exception as e:
            conn.rollback()
            print(f"An error occurred: {e}")
            return jsonify({'message': 'An error occurred', 'error': str(e)}), 500

        finally:
            cur.close()