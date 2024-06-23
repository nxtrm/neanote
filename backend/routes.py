from flask import Flask, jsonify, request
from flask_cors import CORS
from flask_jwt_extended import JWTManager, create_access_token
from flask_mysqldb import MySQL
from datetime import datetime
from MySQLdb.cursors import DictCursor
import jwt

def register_routes(app):
    @app.route('/api/login', methods=['POST'])
    def login():
        try: 
            username = request.json['username']
            password = request.json['password']

            cur = app.mysql.connection.cursor()
            cur.execute("SELECT * FROM users WHERE username = %s AND password = %s", (username, password))
            user = cur.fetchone()
            cur.close()

            if user:
                #Creating the user access token

                userId = str(user[0])
                try:
                    access_token = create_access_token(identity=userId)
                except Exception as e:
                    print(e)
                
                # Adding token to a cookie
                response = jsonify({'message': 'Login successful', 'userId': userId})
                response.set_cookie('token', access_token)
                return response, 200
            else:
                return jsonify({'message': 'User not found'}), 401
        except Exception as error:
            app.mysql.connection.rollback()
            cur.close()
            print('Error during user login', error)
            return jsonify({'message': 'Error logging the user in'}), 500

    @app.route('/api/register', methods=['POST'])
    def register():
        try:
            username = request.json['username']
            email = request.json['email']
            password = request.json['password']

            cur = app.mysql.connection.cursor()

            cur.execute("SELECT * FROM users WHERE username = %s OR email = %s", (username, email))
            existing_user = cur.fetchone()


            if existing_user:
                return jsonify({'message': 'User with this username or email already exists'}), 400
            cur.execute("INSERT INTO users ( username, email, password) VALUES ( %s, %s, %s)", ( username, email, password))
            cur.execute("SELECT LAST_INSERT_ID()")
            userId = cur.fetchone()[0]

            app.mysql.connection.commit()
            cur.close()

            access_token = create_access_token(identity=str(userId))
            response.set_cookie('token', access_token)
            response = jsonify({'message': 'User created successfully', 'userId': userId})
            return response
        except Exception as error:
            app.mysql.connection.rollback()
            cur.close()
            print('Error during user creation', error)
            return jsonify({'message': 'Error creating user'}), 500
        


    @app.route('/api/tasks', methods=['POST'])
    def create_task():
        data = request.get_json()
        userId = data['userId']
        title = data['taskTitle'] # AND TASK TABLES, FIX NOTES NOT ADDED
        tags = data['tags']
        textField = data['textField']
        subtasks = data['subtasks']
        dueDate = data['dueDate']
        dueTime = data['dueTime']
        print(data)
    
        cur = app.mysql.connection.cursor()

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
                
            app.mysql.connection.commit()
            return jsonify({'message': 'Task created successfully'}), 200
        except Exception as error:
            app.mysql.connection.rollback()
            cur.close()
            print('Error during transaction', error)
            return jsonify({'message': 'Error creating task'}), 500
            
    @app.route('/api/tasks/<userId>', methods=['GET'])
    def getAllPreviews(userId): #split into multiple functions, FIX VULNERABILITY WITH USER ID BEING SENT INSTEAD OF TOKEN, DECODE TOKEN HERE
        if userId:
            cur = app.mysql.connection.cursor(cursorclass=DictCursor)

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
                        'id': row['note_id'],
                        'title': row['note_title'],
                        'content': row['note_content'],
                        'completed': row['task_completed'],
                        'due_date': row['task_due_date'],
                        'subtasks': [],
                        'tags': []
                        },
                
                # Append subtasks if they exist
                if row['subtask_id'] and row['subtask_description'] not in [subtask['description'] for subtask in tasks[note_id]['task']['subtasks']]:
                    tasks[note_id]['subtasks'].append({
                        'id': row['subtask_id'],
                        'description': row['subtask_description'],
                        'completed': row['subtask_completed']
                    })

                # Append tags if they exist
                if row['tag_id'] and row['tag_name'] not in [tag['name'] for tag in tasks[note_id]['tags']]:
                    tasks[note_id]['tags'].append({
                        'id': row['tag_id'],
                        'name': row['tag_name'],
                        'color': row['tag_color']
                    })

            cur.close()
            # Convert tasks dictionary to a list to match expected output format
            tasks_list = [value for key, value in tasks.items()]
            return jsonify(tasks_list)
        else:
            return jsonify({'message': 'User ID not provided'}), 400