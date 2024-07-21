
from datetime import datetime
from flask import Blueprint, g, jsonify, request
from flask_jwt_extended import jwt_required
from MySQLdb.cursors import DictCursor
from formsValidation import TaskCreateSchema, TaskSchema
from utils import token_required, verify_subtask_ownership, verify_task_ownership

def task_routes(app, mysql):

    #TASK MODULE
    @app.route('/api/tasks/create', methods=['POST'])
    @jwt_required()
    @token_required
    def create_task():
        try:
            userId = g.userId
            task_schema = TaskCreateSchema()
            data = task_schema.load(request.get_json())
            title = data['title']
            tags = data['tags']
            content = data['content']
            subtasks = data['subtasks']
            due_date = data.get('due_date')

            cur = mysql.connection.cursor()
            # Insert into Notes table
            cur.execute(
                "INSERT INTO Notes (user_id, title, content, type) VALUES (%s, %s, %s, %s)",
                (userId, title, content, 'task')  # Replace userId with the actual user ID
            )
            cur.execute("SELECT LAST_INSERT_ID()")
            noteId = cur.fetchone()[0]
            if due_date is not None:
                due_date_obj = datetime.fromisoformat(due_date.rstrip("Z"))
                cur.execute(
                    "INSERT INTO Tasks (note_id, due_date) VALUES (%s,  %s)",
                    (noteId,  due_date_obj)
                )
            cur.execute(
                "INSERT INTO Tasks (note_id, completed) VALUES (%s, %s)",
                (noteId, False)
            )
            
            cur.execute("SELECT LAST_INSERT_ID()")
        
            taskId = cur.fetchone()[0]
            if len(subtasks)>0:
                for i in subtasks:
                    cur.execute(
                        "INSERT INTO Subtasks (task_id, description, completed) VALUES (%s, %s, %s)",
                        (taskId, i['description'], False)
                    )
            if len(tags)>0:
                for tagId in tags:
                    cur.execute(
                        "INSERT INTO NoteTags (note_id, tag_id) VALUES (%s, %s)",
                        (noteId, tagId)
                    )
                
            mysql.connection.commit()
            return jsonify({'message': 'Task created successfully', 'data': None}), 200
        except Exception as error:
            mysql.connection.rollback()
            print('Error during transaction', error)
            raise
        finally:
            cur.close()
        
    @app.route('/api/tasks/update', methods=['PUT'])
    @jwt_required()
    @token_required
    def update_task():
        try:
            userId = g.userId
            cur = mysql.connection.cursor(cursorclass=DictCursor)
            task_schema = TaskSchema()
            task = task_schema.load(request.get_json())
        
            note_id = task['noteid']
            task_id = task['taskid']
            if verify_task_ownership(userId, task_id, cur) == False:
                return jsonify({'message': 'You do not have permission to update this task'}), 403
            
            query = """
                    UPDATE Notes
                    SET title = %s, content = %s
                    WHERE id = %s AND user_id = %s
                    """
            cur.execute(query, (task['title'], task['content'], note_id, userId))
            dueDate = task.get('due_date') 
            if dueDate:
                # Convert ISO 8601 format to mysql Date format
                parsed_date = datetime.strptime(dueDate, "%Y-%m-%dT%H:%M:%S.%fZ")
                mysql_datetime_str = parsed_date.strftime("%Y-%m-%d %H:%M:%S")
                cur.execute("UPDATE Tasks SET due_date = %s WHERE id = %s", (mysql_datetime_str, task_id))
            
            # Delete existing subtasks and tags before inserting new ones
            cur.execute("DELETE FROM Subtasks WHERE task_id = %s", (task_id,))
            for subtask in task.get('subtasks', []): #implement update
                cur.execute("INSERT INTO Subtasks (task_id, description, completed) VALUES (%s, %s, %s)", (task_id, subtask['description'], subtask['completed']))
                
            cur.execute("DELETE FROM NoteTags WHERE note_id = %s", (note_id,))
                # Insert tags
            if task['tags']:
                for tag in task['tags']:
                    print(tag['tagid'])
                    cur.execute("INSERT INTO NoteTags (note_id, tag_id) VALUES (%s, %s)", (note_id, tag['tagid']))
            mysql.connection.commit()
            return jsonify({'message': 'Task updated successfully', 'data': None}), 200
        except Exception as e:
            mysql.connection.rollback()
            raise
        finally:        
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
            cur = mysql.connection.cursor(cursorclass=DictCursor)
            if verify_task_ownership(userId, taskId, cur) == False:
                return jsonify({'message': 'You do not have permission to update this task'}), 403
            cur.execute("DELETE FROM NoteTags WHERE note_id = %s", (noteId,))
            cur.execute("DELETE FROM Subtasks WHERE task_id = %s", (taskId,))
            cur.execute("DELETE FROM Tasks WHERE note_id = %s", (noteId,))
            cur.execute("DELETE FROM Notes WHERE id = %s", (noteId,))
            mysql.connection.commit()
            cur.close()
            return jsonify({'message': 'Task deleted successfully', 'data': None}), 200
        except Exception as e:
            mysql.connection.rollback()
            raise
        finally:
            cur.close()

        
    @app.route('/api/tasks/toggle', methods=['PUT'])
    @jwt_required()
    @token_required
    def toggleTaskFields():
        try:
            userId = g.userId
            data = request.get_json()
            taskId = data.get('taskid')
            subtaskId = data.get('subtaskid')  # Correctly extract subtaskId, if present
            cur = mysql.connection.cursor(cursorclass=DictCursor)
            if (verify_task_ownership(userId, taskId, cur)) == False:
                return jsonify({'message': 'You do not have permission to update this task'}), 403 #to be fixed
            toggle_sql = """
                        UPDATE Tasks 
                        SET completed = CASE 
                                            WHEN completed = 1 THEN 0 
                                            ELSE 1 
                                        END 
                        WHERE id = %s
                        """
            cur.execute(toggle_sql, (taskId,)) 
            
            if subtaskId and verify_subtask_ownership(userId, subtaskId, cur):
                toggle_sql = """
                        UPDATE Subtasks 
                        SET completed = CASE 
                                            WHEN completed = 1 THEN 0 
                                            ELSE 1 
                                        END 
                        WHERE id = %s AND task_id = %s
                        """
                cur.execute(toggle_sql, (subtaskId, taskId))  # Correctly pass as tuple

            mysql.connection.commit()
            return jsonify({'message': 'Field toggled successfully', "data": None}), 200
        except Exception as e:
            mysql.connection.rollback()  # Ensure to rollback in case of error
            raise
        finally:
            cur.close()
            
            
    @app.route('/api/tasks/previews', methods=['GET'])
    @jwt_required()
    @token_required
    def get_task_previews(): 
        try:
            userId = g.userId
            # Pagination
            page = int(request.args.get('page', 1))  # Default to page 1
            per_page = int(request.args.get('per_page', 10))  # Default to 10 items per page
            offset = (page - 1) * per_page
            cur = mysql.connection.cursor(cursorclass=DictCursor)
            # Fetch the total count of tasks for pagination metadata
            cur.execute(""" 
                SELECT COUNT(DISTINCT n.id) AS total
                FROM Notes n
                WHERE n.user_id = %s AND n.type = 'task'
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
                    st.id AS subtask_id, 
                    st.description AS subtask_description, 
                    st.completed AS subtask_completed, 
                    tg.id AS tagid, 
                    tg.name AS tag_name, 
                    tg.color AS tag_color
                FROM Notes n
                LEFT JOIN Tasks t ON n.id = t.note_id
                LEFT JOIN Subtasks st ON t.id = st.task_id
                LEFT JOIN NoteTags nt ON n.id = nt.note_id
                LEFT JOIN Tags tg ON nt.tag_id = tg.id
                WHERE n.user_id = %s AND n.type = 'task'
                ORDER BY n.created_at DESC
                LIMIT %s OFFSET %s
            """, (userId, per_page, offset)) 
            rows = cur.fetchall()
            tasks = {}
            for row in rows:
                note_id = row['note_id']
                if note_id not in tasks:
                    tasks[note_id] = {
                        'noteid': row['note_id'],
                        'taskid': row['task_id'],
                        'title': row['title'][:50] + '...' if len(row['title']) > 50 else row['title'],
                        'content': row['content'][:100] + '...' if len(row['content']) > 100 else row['content'],
                        'completed': row['task_completed'] == 1,
                        'due_date': row['task_due_date'],
                        'subtasks': [],
                        'tags': []
                    }
                if row['subtask_id'] is not None:
                    is_subtask_present = any(subtask['subtask_id'] == row['subtask_id'] for subtask in tasks[note_id]['subtasks'])
                    if not is_subtask_present:
                        tasks[note_id]['subtasks'].append({
                            'subtask_id': row['subtask_id'],
                            'description': row['subtask_description'][:100] + '...' if len(row['subtask_description']) > 100 else row['subtask_description'],
                            'completed': row['subtask_completed'] == 1
                        })
                if row['tagid'] is not None:
                    is_tag_present = any(tag['tagid'] == row['tagid'] for tag in tasks[note_id]['tags'])
                    if not is_tag_present:
                        tasks[note_id]['tags'].append({
                            'tagid': row['tagid'],
                            'name': row['tag_name'],
                            'color': row['tag_color']
                        })
            tasks_list = [value for key, value in tasks.items()]
            
            nextPage = page + 1 if (offset + per_page) < total else None
            
            return jsonify({"tasks": tasks_list, 'nextPage': nextPage, 'message': "Tasks fetched successfully"}), 200
        except Exception as e:
            mysql.connection.rollback()
            print(f"An error occurred: {e}") 
            return jsonify({'message': 'An error occurred', 'error': str(e)}), 500
        finally:
            cur.close()
            
    @app.route('/api/tasks/task', methods=['GET'])
    @jwt_required()
    @token_required
    def get_task():
        try:
            userId = g.userId
            noteid = request.args.get('noteid')
            cur = mysql.connection.cursor(cursorclass=DictCursor)
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
                    tg.id AS tagid, 
                    tg.name AS tag_name, 
                    tg.color AS tag_color
                FROM Notes n
                LEFT JOIN Tasks t ON n.id = t.note_id
                LEFT JOIN Subtasks st ON t.id = st.task_id
                LEFT JOIN NoteTags nt ON n.id = nt.note_id
                LEFT JOIN Tags tg ON nt.tag_id = tg.id
                WHERE n.user_id = %s AND n.id = %s AND n.type = 'task'
            """, (userId, noteid)) 
            rows = cur.fetchall()
            task = None
            for row in rows:
                if task is None:
                    task = {
                        'noteid': row['note_id'],
                        'taskid': row['task_id'],
                        'title': row['note_title'],
                        'content': row['note_content'],
                        'completed': row['task_completed'] == 1,
                        'due_date': row['task_due_date'],
                        'subtasks': [],
                        'tags': []
                    }
                if row['subtask_id'] is not None:
                    task['subtasks'].append({
                        'subtask_id': row['subtask_id'],
                        'description': row['subtask_description'],
                        'completed': row['subtask_completed'] == 1
                    })
                if row['tagid'] is not None:
                    task['tags'].append({
                        'tagid': row['tagid'],
                        'name': row['tag_name'],
                        'color': row['tag_color']
                    })
            if task:
                return jsonify({"data": task, 'message': "Task fetched successfully"}), 200
            else:
                return jsonify({'message': "Task not found"}), 404
        except Exception as e:
            mysql.connection.rollback()
            print(f"An error occurred: {e}") 
            raise
        finally:
            cur.close()