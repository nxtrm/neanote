from datetime import datetime, timedelta

from flask import Flask, jsonify, request
from flask_cors import CORS
from flask_jwt_extended import (JWTManager, create_access_token,
                                get_jwt_identity, jwt_required)
from MySQLdb.cursors import DictCursor

from utils import decodeToken, generateToken


def register_routes(app, mysql, jwt):
    @app.route('/api/login', methods=['POST'])
    def login():
        try: 
            username = request.json['username']
            password = request.json['password']

            cur = mysql.connection.cursor()
            cur.execute("SELECT * FROM users WHERE username = %s AND password = %s", (username, password))
            user = cur.fetchone()
            cur.close()

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
            cur.close()
            print('Error during user login', error)
            return jsonify({'message': 'Error logging the user in'}), 500

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
                print(e)

            response.set_cookie('token', access_token)
            response = jsonify({'message': 'User created successfully', 'userId': userId})
            return response
        except Exception as error:
            mysql.connection.rollback()
            cur.close()
            print('Error during user creation', error)
            return jsonify({'message': 'Error creating user'}), 500
        

#TASK MODULE
    @app.route('/api/tasks/create', methods=['POST'])
    @jwt_required()
    def create_task():
        try:
                token = request.cookies.get('token')
                userId = decodeToken(token)
        except:
            return jsonify({'message': 'User not authenticated'}), 401

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
                # Default dueTime to "08:00" if it's undefined
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
            cur.close()
            print('Error during transaction', error)
            return jsonify({'message': 'Error creating task', 'data': None}), 500
        
    @app.route('/api/tasks/update', methods=['POST'])
    @jwt_required()
    def update_task():
        task = request.get_json()

        cur = mysql.connection.cursor()
        try:
            note_id = task['noteid']
            task_id = task['taskid']

            query = """
            UPDATE Notes
            SET title = %s, content = %s
            WHERE id = %s
            """

            due_date = task.get('dueDate') #add funcitonality to update Tasks table later
            due_time = task.get('dueTime', '')

            cur.execute(query, (task['title'], task['content'], note_id))
            
            # Delete existing subtasks and tags before inserting new ones
            cur.execute("DELETE FROM Subtasks WHERE task_id = %s", (task_id,))
            # cur.execute("DELETE FROM TaskTags WHERE task_id = %s", (task_id,))

            for subtask in task.get('subtasks', []):
                cur.execute("INSERT INTO Subtasks (task_id, description, completed) VALUES (%s, %s, %s)", (task_id, subtask['description'], subtask['completed']))
            
            # # Insert tags
            # for tag in task_details.get('tags', []):  # Use .get() to avoid KeyError if 'tags' is missing
            #     cur.execute("INSERT INTO TaskTags (task_id, tag) VALUES (%s, %s)", (task_id, tag))


            mysql.connection.commit()
            cur.close()
            return jsonify({'message': 'Task updated successfully', 'data': None}), 200
        except Exception as e:
            mysql.connection.rollback()
            return jsonify({'message': f"An error occurred: {e}", 'data': None}), 400
    
        
    @app.route('/api/tasks/toggle', methods=['POST'])
    @jwt_required()
    def toggleTaskFields():
        try:
            data = request.get_json()
            taskId = data.get('taskId') 
            subtaskId = data.get('subtaskId')  # Correctly extract subtaskId, if present

            cur = mysql.connection.cursor()
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
            else:
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
            cur.close()
            return jsonify({'message': 'Field toggled successfully', "data": None}), 200

        except Exception as e:
            mysql.connection.rollback()  # Ensure to rollback in case of error
            return jsonify({'message': f'An error occurred: {str(e)}'}), 400
            

            
    @app.route('/api/tasks/', methods=['GET'])
    @jwt_required()
    def getAllPreviews(): 
            try:
                    token = request.cookies.get('token')
                    userId = decodeToken(token)
            except:
                    return jsonify({'message': 'User not authenticated'}), 401
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
            # Convert tasks dictionary to a list to match expected output format
            tasks_list = [value for key, value in tasks.items()]
            return jsonify({"data": tasks_list, 'message': "Tasks fetched successfully"}), 200

#TAG MODULE
    @app.route('/api/tasks/', methods=['GET'])
    @jwt_required()
    def create_tag():
        try:
            token = request.cookies.get('token')
            user_id = decodeToken(token)
        except:
            return jsonify({'message': 'User not authenticated'}), 401

        data = request.get_json()
        tag_name = data['name']
        tag_color = data['color']
    
        cur = mysql.connection.cursor()

        try:
            cur.execute(
                "INSERT INTO Tags (name, color, user_id) VALUES (%s, %s, %s)",
                (tag_name, tag_color, user_id)
            )
            mysql.connection.commit()
            cur.close()
            return jsonify({'message': 'Tag created successfully', 'data': None}), 200
        except Exception as error:
            mysql.connection.rollback()
            cur.close()
            print('Error during transaction', error)
            return jsonify({'message': 'Error creating tag', 'data': None}), 500
        
    @app.route('/api/tags/', methods=['GET'])
    @jwt_required()
    def getAll_tags():
        try:
            token = request.cookies.get('token')
            user_id = decodeToken(token)
        except:
            return jsonify({'message': 'User not authenticated'}), 401
        
        cur = mysql.connection.cursor(cursorclass=DictCursor)   
        try:
            cur.execute(
                "SELECT * FROM Tags WHERE user_id = %s",
                (user_id,)
            )
            tags = cur.fetchall()
            mysql.connection.commit()
            cur.close()
            return jsonify({'message': 'Tags fetched successfully', 'data': tags}), 200
        except Exception as e:
            mysql.connection.rollback()
            cur.close()
            return jsonify({'message': f"An error occurred: {e}", 'data': None}), 400
        
    @app.route('/api/tags/<int:note_id>', methods=['GET'])
    @jwt_required()
    def getTags():
        try:
            token = request.cookies.get('token')
            user_id = decodeToken(token)
        except:
            return jsonify({'message': 'User not authenticated'}), 401
    
        cur = mysql.connection.cursor(cursorclass=DictCursor)
        note_id = request.args.get('note_id')
        try:
            cur.execute(
                "SELECT t.id t.name, t.color FROM Tags t JOIN NoteTags nt ON t.id = nt.tag_id WHERE nt.note_id = %s",
                (note_id,)
            )
            tags = cur.fetchall()
            mysql.connection.commit()
            cur.close()
            return jsonify({'message': 'Tags fetched successfully', 'data': tags}), 200
        except Exception as e:
            mysql.connection.rollback()
            cur.close()
            return jsonify({'message': f"An error occurred: {e}", 'data': None}), 400
    
    @app.route('/api/tags/add', methods=['POST'])
    @jwt_required()
    def addTag():
        try:
            token = request.cookies.get('token')
            user_id = decodeToken(token)
        except:
            return jsonify({'message': 'User not authenticated'}), 401
        cur = mysql.connection.cursor()
        data = request.get_json()
        note_id = data['note_id']
        tag_id = data['tag_id']
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
            return jsonify({'message': f"An error occurred: {e}", 'data': None}), 400