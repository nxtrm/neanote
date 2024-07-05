from datetime import datetime, timedelta

from flask import Flask, g, jsonify, request
from flask_cors import CORS
from flask_jwt_extended import (JWTManager, create_access_token,
                                get_jwt_identity, jwt_required)
from MySQLdb.cursors import DictCursor

from utils import token_required, verify_subtask_ownership, verify_tag_ownership, verify_task_ownership


def register_routes(app, mysql, jwt):
    @app.route('/api/login', methods=['POST'])
    def login():
        try: 
            username = request.json['username']
            password = request.json['password']

            cur = mysql.connection.cursor()
            cur.execute("SELECT * FROM users WHERE username = %s AND password = %s", (username, password))
            user = cur.fetchone()
            if user:
                userId = str(user[0])
                access_token = create_access_token(identity=userId, expires_delta=timedelta(days=1))

                response = jsonify({'message': 'Login successful', 'userId': userId})
                response.set_cookie('token', access_token)
                return response, 200
            else:
                return jsonify({'message': 'User not found'}), 401
        except Exception as error:
            mysql.connection.rollback()
            raise
        finally:
            cur.close()

    @app.route('/api/register', methods=['POST'])
    def register():
        try:
            username = request.json['username']
            email = request.json['email']
            password = request.json['password']

            cur = mysql.connection.cursor()

            cur.execute("SELECT * FROM users WHERE username = %s OR email = %s", (username, email))
            existing_user = cur.fetchone()


            if existing_user:
                return jsonify({'message': 'User with this username or email already exists'}), 400
            cur.execute("INSERT INTO users ( username, email, password) VALUES ( %s, %s, %s)", ( username, email, password))
            cur.execute("SELECT LAST_INSERT_ID()")
            userId = cur.fetchone()[0]

            mysql.connection.commit()
            cur.close()

            try:
                access_token = create_access_token(exp=(datetime.datetime.utcnow() + datetime.timedelta(days=1)),identity=userId)
            except Exception as e:
                raise

            response.set_cookie('token', access_token)
            response = jsonify({'message': 'User created successfully', 'userId': userId})
            return response
        except Exception as error:
            mysql.connection.rollback()
            raise
        finally:
            cur.close()
        

#TASK MODULE
    @app.route('/api/tasks/create', methods=['POST'])
    @jwt_required()
    @token_required
    def create_task():
        userId = g. userId

        data = request.get_json()
        title = data['taskTitle']
        tags = data['tags']
        textField = data['textField']
        subtasks = data['subtasks']
        dueDate = data['dueDate']
        dueTime = data['dueTime']
        print(data)
    
        cur = mysql.connection.cursor()

        try:
            # Insert into Notes table
            cur.execute(
                "INSERT INTO Notes (user_id, title, content, type) VALUES (%s, %s, %s, %s)",
                (userId, title, textField, 'task')  # Replace userId with the actual user ID
            )
            cur.execute("SELECT LAST_INSERT_ID()")
            noteId = cur.fetchone()[0]

            if dueDate:
                due_date_obj = datetime.fromisoformat(dueDate.rstrip("Z"))

                if dueTime is None:
                    dueTime = "08:00"
                # Combine dueDate and dueTime
                due_datetime = due_date_obj.strftime('%Y-%m-%d') + ' ' + dueTime + ':00'

            if textField is not None:
                cur.execute(
                    "INSERT INTO Tasks (note_id, completed, due_date) VALUES (%s, %s, %s)",
                    (noteId, False, due_datetime)
                )
            
            cur.execute("SELECT LAST_INSERT_ID()")
        
            taskId = cur.fetchone()[0]

            if subtasks:
                for i in subtasks:
                    cur.execute(
                        "INSERT INTO Subtasks (task_id, description, completed) VALUES (%s, %s, %s)",
                        (taskId, i['text'], False)
                    )

            if tags:
                for tagName in tags:
                    cur.execute("SELECT id FROM Tags WHERE name = %s", (tagName,))
                    tagResult = cur.fetchone()
                    if tagResult is None:
                        cur.execute(
                            "INSERT INTO Tags (name) VALUES (%s)",
                            (tagName,)  # Default color
                        )
                        cur.execute("SELECT LAST_INSERT_ID()")
                        tagId = cur.fetchone()[0]
                    else:
                        tagId = tagResult[0]
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
        
    @app.route('/api/tasks/update', methods=['POST'])
    @jwt_required()
    @token_required
    def update_task():
        task = request.get_json()
        userId = g.userId
        cur = mysql.connection.cursor(cursorclass=DictCursor)

        try:
            note_id = task['noteid']
            task_id = task['taskid']

            # if verify_task_ownership(userId, task_id, cur) is False:
            #     return jsonify({'message': 'You do not have permission to update this task'}), 403
            
            query = """
                    UPDATE Notes
                    SET title = %s, content = %s
                    WHERE id = %s AND user_id = %s
                    """
            cur.execute(query, (task['title'], task['content'], note_id, userId))

            dueDate = task.get('dueDate') 

            if dueDate:
                # Convert react Date format to mysql Date format
                parsed_date = datetime.strptime(dueDate, "%Y-%m-%dT%H:%M:%S.%fZ")
                mysql_datetime_str = parsed_date.strftime("%Y-%m-%d %H:%M:%S")
                cur.execute("UPDATE Tasks SET due_date = %s WHERE id = %s", (mysql_datetime_str, task_id))
            
            # Delete existing subtasks and tags before inserting new ones
            cur.execute("DELETE FROM Subtasks WHERE task_id = %s", (task_id,))

            for subtask in task.get('subtasks', []):
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
        
    @app.route('/api/tasks/delete', methods=['POST'])
    @jwt_required()
    @token_required
    def delete_task():
        try:
            userId = g. userId
            data = request.get_json()
            taskId = data['taskId']
            noteId = data['noteId']
            cur = mysql.connection.cursor()

            if not verify_task_ownership(userId, taskId, cur):
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
    
        
    @app.route('/api/tasks/toggle', methods=['POST'])
    @jwt_required()
    @token_required
    def toggleTaskFields():
        try:
            userId = g.userId
            data = request.get_json()
            taskId = data.get('taskId')
            subtaskId = data.get('subtaskId')  # Correctly extract subtaskId, if present

            cur = mysql.connection.cursor()
            if (verify_task_ownership(userId, taskId, cur) and verify_subtask_ownership(userId, subtaskId, cur)) is False:
                return jsonify({'message': 'You do not have permission to update this task'}), 403
            
            if subtaskId:
                toggle_sql = """
                        UPDATE Subtasks 
                        SET completed = CASE 
                                            WHEN completed = 1 THEN 0 
                                            ELSE 1 
                                        END 
                        WHERE id = %s AND task_id = %s
                        """
                cur.execute(toggle_sql, (subtaskId, taskId))  # Correctly pass as tuple
                toggle_sql = """
                        UPDATE Tasks 
                        SET completed = CASE 
                                            WHEN completed = 1 THEN 0 
                                            ELSE 1 
                                        END 
                        WHERE id = %s
                        """
                cur.execute(toggle_sql, (taskId,)) 

            mysql.connection.commit()
            return jsonify({'message': 'Field toggled successfully', "data": None}), 200
        except Exception as e:
            mysql.connection.rollback()  # Ensure to rollback in case of error
            raise
        finally:
            cur.close()
            

            
    @app.route('/api/tasks/', methods=['GET'])
    @jwt_required()
    @token_required
    def getAllPreviews(): 
        try:
            userId = g.userId
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
                    tg.id AS tag_id, 
                    tg.name AS tag_name, 
                    tg.color AS tag_color
                FROM Notes n
                LEFT JOIN Tasks t ON n.id = t.note_id
                LEFT JOIN Subtasks st ON t.id = st.task_id
                LEFT JOIN NoteTags nt ON n.id = nt.note_id
                LEFT JOIN Tags tg ON nt.tag_id = tg.id
                WHERE n.user_id = %s
            """, (userId,)) 

            rows = cur.fetchall()

            tasks = {}
            for row in rows:
                note_id = row['note_id']
                if note_id not in tasks:
                    tasks[note_id] = {
                        'noteid': row['note_id'],
                        'taskid': row['task_id'],
                        'title': row['note_title'],
                        'content': row['note_content'],
                        'completed': True if row['task_completed'] == 1 else False,
                        'due_date': row['task_due_date'],
                        'subtasks': [],
                        'tags': []
                        }
                # Append subtasks if they exist
                is_subtask_present = row['subtask_id'] and any(
                subtask['description'] == row['subtask_description'] for subtask in tasks[note_id]['subtasks']
                )

                # If the subtask is not already present, append it to the subtasks list
                if not is_subtask_present:
                    new_subtask = {
                        'subtaskid': row['subtask_id'],
                        'description': row['subtask_description'],
                        'completed': True if row['subtask_completed'] == 1 else False
                    }
                    tasks[note_id]['subtasks'].append(new_subtask)

                # Append tags if they exist
                if row['tag_id'] and row['tag_name'] not in [tag['name'] for tag in tasks[note_id]['tags']]:
                    tasks[note_id]['tags'].append({
                        'tagid': row['tag_id'],
                        'name': row['tag_name'],
                        'color': row['tag_color']
                    })

            cur.close()
            tasks_list = [value for key, value in tasks.items()]
            return jsonify({"data": tasks_list, 'message': "Tasks fetched successfully"}), 200
        except Exception as e:
            mysql.connection.rollback()
            raise

#TAG MODULE
    @app.route('/api/tags/create', methods=['POST'])
    @jwt_required()
    @token_required
    def create_tag():
        userId = g.userId
        data = request.get_json()
        tag_name = data['name']
        tag_color = data['color']
    
        cur = mysql.connection.cursor()

        try:
            cur.execute(
                "INSERT INTO Tags (name, color, user_id) VALUES (%s, %s, %s)",
                (tag_name, tag_color, userId)
            )
            mysql.connection.commit()
            return jsonify({'message': 'Tag created successfully', 'data': None}), 200
        except Exception as error:
            mysql.connection.rollback()
            print('Error during transaction', error)
            raise
        finally:
            cur.close()
        
    @app.route('/api/tags/', methods=['GET'])
    @jwt_required()
    @token_required
    def getAll_tags():
        userId = g. userId
        
        cur = mysql.connection.cursor(cursorclass=DictCursor)   
        try:
            cur.execute(
                "SELECT id AS tagid, name, color FROM Tags WHERE user_id = %s",
                (userId,)
            )
            tags = cur.fetchall()
            mysql.connection.commit()
            return jsonify({'message': 'Tags fetched successfully', 'data': tags}), 200
        except Exception as e:
            mysql.connection.rollback()
            raise
        finally:
            cur.close()
        
    @app.route('/api/tags/<int:note_id>', methods=['GET'])
    @jwt_required()
    @token_required
    def getTags():
        userId = g. userId
    
        cur = mysql.connection.cursor(cursorclass=DictCursor)
        note_id = request.args.get('note_id')
        try:
            cur.execute(
                "SELECT t.id AS t.tagid, t.name, t.color FROM Tags t JOIN NoteTags nt ON t.id = nt.tag_id WHERE nt.note_id = %s AND t.user_id = %s",
                (note_id, userId)
            )
            tags = cur.fetchall()
            mysql.connection.commit()
            return jsonify({'message': 'Tags fetched successfully', 'data': tags}), 200
        except Exception as e:
            mysql.connection.rollback()
            raise
        finally:
            cur.close()
    
    @app.route('/api/tags/add', methods=['POST'])
    @jwt_required()
    @token_required
    def addTag():
        userId = g. userId
        cur = mysql.connection.cursor()
        data = request.get_json()
        note_id = data['note_id']
        tag_id = data['tag_id']
        if verify_tag_ownership(userId, tag_id, cur) is False:
            return jsonify({'message': 'You do not have permission to update this tag'}), 403
        try:
            cur.execute (
                "INSERT INTO NoteTags (note_id, tag_id) VALUES (%s, %s)", (note_id, tag_id),
            )
            mysql.connection.commit()
            cur.close()
            return jsonify({'message': 'Tag added successfully', 'data': None}), 200
        except Exception as e:
            mysql.connection.rollback()
            cur.close()
            raise
        
    @app.route('/api/tags/edit', methods=['POST'])
    @jwt_required()
    @token_required
    def editTag():
        userId = g.userId
        cur = mysql.connection.cursor()
        data = request.get_json()
        tag_id = data['tagId']
        name = data['name']
        color = data['color']

        if verify_tag_ownership(userId, tag_id, cur) is False:
            return jsonify({'message': 'You do not have permission to update this tag'}), 403
        try:
            cur.execute (
                "UPDATE Tags SET name = %s, color = %s WHERE id = %s", (name, color, tag_id),
            )
            mysql.connection.commit()
            cur.close()
            return jsonify({'message': 'Tag updated successfully', 'data': None}), 200
        except Exception as e:
            mysql.connection.rollback()
            raise
        finally:
            cur.close()
    
    @app.route('/api/tags/delete', methods=['POST'])
    @jwt_required()
    @token_required
    def deleteTag():
        userId = g.userId
        
        # Initialize cursor outside try block
        cur = mysql.connection.cursor()
        
        try:
            data = request.get_json()
            tag_id = data['tagId']

            if not verify_tag_ownership(userId, tag_id, cur):
                return jsonify({'message': 'You do not have permission to update this tag'}), 403
            
            # Perform deletion operations
            cur.execute("DELETE FROM Tags WHERE id = %s AND user_id = %s", (tag_id, userId))
            cur.execute("DELETE FROM NoteTags WHERE tag_id = %s", (tag_id,))
            mysql.connection.commit()
            
            return jsonify({'message': 'Tag deleted successfully', 'data': None}), 200
        except Exception as e:
            mysql.connection.rollback()
            raise
        finally:
            cur.close()
            