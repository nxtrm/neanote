from marshmallow import ValidationError
from flask import Flask, g, jsonify, request
from flask_cors import CORS
from flask_jwt_extended import (JWTManager, create_access_token,
                                get_jwt_identity, jwt_required)
from MySQLdb.cursors import DictCursor
from dateutil.relativedelta import relativedelta
from formsValidation import HabitCreateSchema, HabitUpdateSchema, LoginSchema, TagSchema, TaskSchema, UserSchema
from utils import token_required, verify_habit_ownership, verify_subtask_ownership, verify_tag_ownership, verify_task_ownership
from datetime import datetime, timedelta


def register_routes(app, mysql, jwt):
    @app.route('/api/login', methods=['POST'])
    def login():
        try: #implement password hashing later
            login_schema = LoginSchema()

            data = login_schema.load(request.json)
            username = data['username']
            password = data['password']

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
        except ValidationError as err:
            return jsonify(err.messages), 400
        except Exception as error:
            mysql.connection.rollback()
            raise
        finally:
            cur.close()

    @app.route('/api/register', methods=['POST'])
    def register():
        try:
            user_schema = UserSchema()
            result = user_schema.load(request.json)

            username = result['username']
            email = result['email']
            password = result['password']
            

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
        except ValidationError as err:
            return jsonify(err.messages), 400
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
        userId = g.userId

        task_schema = TaskSchema()
        data = task_schema.load(request.get_json())
        title = data['title']
        tags = data['tags']
        content = data['content']
        subtasks = data['subtasks']
        due_date = data.get('due_date')
        print(data)
    
        cur = mysql.connection.cursor()

        try:
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
        userId = g.userId

        cur = mysql.connection.cursor(cursorclass=DictCursor)

        task_schema = TaskSchema()
        task = task_schema.load(request.get_json())
        
        try:
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
                    tg.id AS tagid, 
                    tg.name AS tag_name, 
                    tg.color AS tag_color
                FROM Notes n
                LEFT JOIN Tasks t ON n.id = t.note_id
                LEFT JOIN Subtasks st ON t.id = st.task_id
                LEFT JOIN NoteTags nt ON n.id = nt.note_id
                LEFT JOIN Tags tg ON nt.tag_id = tg.id
                WHERE n.user_id = %s AND n.type = 'task'
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
                            'description': row['subtask_description'],
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
            return jsonify({"data": tasks_list, 'message': "Tasks fetched successfully"}), 200
        except Exception as e:
            mysql.connection.rollback()
            print(f"An error occurred: {e}")  # Improved error logging
            raise
        finally:
            cur.close()


#HABITS MODULE
    @app.route('/api/habits/create', methods=['POST'])
    @jwt_required()
    @token_required
    def create_habit():
        userId = g.userId

        habit_schema = HabitCreateSchema()
        data = habit_schema.load(request.get_json())

        title = data['title']
        content = data['content']
        tags = data['tags']
        reminder_time = data['reminder']['reminder_time']
        repetition = data['reminder']['repetition']

        cur = mysql.connection.cursor()
        try:
            cur.execute(
                "INSERT INTO Notes (user_id, title, content, type) VALUES (%s, %s, %s, %s)",
                (userId, title, content, 'habit')
            )

            cur.execute("SELECT LAST_INSERT_ID()")
            noteId = cur.fetchone()[0]

            cur.execute(
                "INSERT INTO Habits (note_id, reminder_time, streak, repetition, completed_today) VALUES (%s, %s, %s, %s, %s)",
                (noteId, (reminder_time+':00'), 0, repetition, False)
            )

            if len(tags)>0:
                for tagId in tags:
                    cur.execute(
                        "INSERT INTO NoteTags (note_id, tag_id) VALUES (%s, %s)",
                        (noteId, tagId)
                    )
           
            mysql.connection.commit()
            return jsonify({'message': 'Task created successfully'}), 200
        except Exception as e:
            mysql.connection.rollback()
            raise

    @app.route('/api/habits/update', methods=['PUT'])  
    @jwt_required()
    @token_required
    def update_habit():
        userId = g.userId

        habit_schema = HabitUpdateSchema()
        data = habit_schema.load(request.get_json())

        cur = mysql.connection.cursor(cursorclass=DictCursor)
        try:
            note_id = data['noteid']
            habit_id = data['habitid']

            if verify_habit_ownership(userId, habit_id, cur) == False:
                return jsonify({'message': 'You do not have permission to update this habit'}), 403

            query = """
                    UPDATE Notes
                    SET title = %s, content = %s
                    WHERE id = %s AND user_id = %s
                    """
            cur.execute(query, (data['title'], data['content'], note_id, userId))

            reminder_time = data['reminder']['reminder_time']
            repetition = data['reminder']['repetition']

            cur.execute(
                "UPDATE Habits SET reminder_time = %s, repetition = %s WHERE note_id = %s",
                (reminder_time, repetition, note_id)
            )

            cur.execute("DELETE FROM NoteTags WHERE note_id = %s", (note_id,))
            for tag in data['tags']:
                cur.execute(
                    "INSERT INTO NoteTags (note_id, tag_id) VALUES (%s, %s)",
                    (note_id, tag['tagid'])
                )
            
            mysql.connection.commit()
            return jsonify({'message': 'Habit updated successfully'}), 200
        except Exception as e:
            mysql.connection.rollback()
            raise
        finally:
            cur.close()
        
    @app.route('/api/habits', methods=['GET'])
    @jwt_required()
    @token_required
    def getAll_habits(): #fix months and weeks completion
        userId = g.userId

        cur= mysql.connection.cursor(cursorclass=DictCursor)

        try:
            habits={}
            today_date = datetime.now().date()
            cur.execute(
                '''SELECT n.id AS note_id, n.title, n.content, h.id AS habit_id, h.reminder_time, h.repetition, h.streak, 
                IF(hc.completion_date IS NOT NULL AND DATE(hc.completion_date) = %s, TRUE, FALSE) AS completed_today, 
                t.id AS tagid, t.name, t.color 
                FROM Notes n 
                JOIN Habits h ON n.id = h.note_id 
                LEFT JOIN HabitCompletion hc ON h.id = hc.habit_id AND DATE(hc.completion_date) = %s
                JOIN NoteTags nt ON n.id = nt.note_id 
                JOIN Tags t ON nt.tag_id = t.id 
                WHERE n.user_id = %s AND n.type = %s''',
                (today_date, today_date, userId, "habit",)
            )
            rows = cur.fetchall() 
            for row in rows:

                note_id = row['note_id']
                if note_id not in habits:
                    habits[note_id] = {
                        'noteid': row['note_id'],
                        'habitid': row['habit_id'],
                        'title': row['title'],
                        'content': row['content'],
                        'streak': row['streak'],
                        'reminder': {'reminder_time': datetime.strptime(str(row['reminder_time']), '%H:%M:%S').strftime('%H:%M'), 'repetition': row['repetition']},
                        'completed_today': row['completed_today'],
                        'tags': []
                    }

                if row['tagid'] is not None:
                    is_tag_present = any(tag['tagid'] == row['tagid'] for tag in habits[note_id]['tags'])
                    if not is_tag_present:
                        habits[note_id]['tags'].append({
                            'tagid': row['tagid'],
                            'name': row['name'],
                            'color': row['color']
                        })
            
            habits_list = [value for key, value in habits.items()]
            mysql.connection.commit()
            return jsonify({'message': 'Habits fetched successfully', 'data': habits_list}), 200
        except Exception as e:
            mysql.connection.rollback()
            raise
        finally:
            cur.close()
    
    @app.route('/api/habits/delete', methods=['PUT']) #make it archive instead of deleting later
    @jwt_required()
    @token_required
    def delete_habit():
        userId = g.userId
        try:
            cur = mysql.connection.cursor(cursorclass=DictCursor)
            data = request.get_json()
            habit_id = data['habitid']
            note_id = data['noteid']

            if verify_habit_ownership(userId, habit_id, cur) == False:
                return jsonify({'message': 'You do not have permission to update this habit'}), 403

            cur.execute("DELETE FROM HabitCompletion WHERE habit_id = %s", (habit_id,))
            cur.execute("DELETE FROM Habits WHERE id = %s", (habit_id,))
            cur.execute("DELETE FROM Notes WHERE id = %s", (note_id,))
            mysql.connection.commit()
            cur.close()
            return jsonify({'message': 'Habit deleted successfully'}), 200
        except Exception as e:
            mysql.connection.rollback()
            raise
    


    @app.route('/api/habits/complete', methods=['PUT'])
    @jwt_required()
    @token_required
    def complete_habit():
        userId = g.userId

        cur = mysql.connection.cursor(cursorclass=DictCursor)
        data = request.get_json()
        habit_id = data['habitid']

        try:
            if not verify_habit_ownership(userId, habit_id, cur):
                return jsonify({'message': 'You do not have permission to update this habit'}), 403
            
            # Retrieve habit repetition type and the most recent completion date
            cur.execute("SELECT repetition, MAX(completion_date) AS last_completion_date FROM HabitCompletion JOIN Habits ON Habits.id = HabitCompletion.habit_id WHERE habit_id = %s GROUP BY repetition", (habit_id,))
            habit_info = cur.fetchone()
            
            today_date = datetime.now().date()
            if habit_info and habit_info['last_completion_date']:
                last_date = habit_info['last_completion_date'] 
                repetition = habit_info['repetition']
                gap = None

                if repetition == 'daily':
                    gap = (today_date - last_date).days - 1
                elif repetition == 'weekly':
                    gap = (today_date - last_date).days // 7
                elif repetition == 'monthly':
                    gap = relativedelta(today_date, last_date).months + 12 * relativedelta(today_date, last_date).years

                if gap is not None:
                    if gap > 1:
                        cur.execute("UPDATE Habits SET streak = 0 WHERE id = %s", (habit_id,))
                    elif gap <= 1:
                        cur.execute("UPDATE Habits SET streak = streak + 1 WHERE id = %s", (habit_id,))
            else:
                cur.execute("UPDATE Habits SET streak = 1 WHERE id = %s", (habit_id,))
            
            # Insert the new completion
            cur.execute("INSERT INTO HabitCompletion (habit_id, completion_date) VALUES (%s, %s)", (habit_id, today_date))
            mysql.connection.commit()
            return jsonify({'message': 'Habit completed successfully'}), 200
        except Exception as e:
            mysql.connection.rollback()
            raise
        finally:
            cur.close()


#TAG MODULE
    @app.route('/api/tags/create', methods=['POST'])
    @jwt_required()
    @token_required
    def create_tag():
        userId = g.userId

        tag_schema = TagSchema()
        data = tag_schema.load(request.get_json())
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
        tag_id = data['tagid']
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
        
    @app.route('/api/tags/edit', methods=['PUT'])
    @jwt_required()
    @token_required
    def editTag():
        tag_schema = TagSchema()
        userId = g.userId

        data = tag_schema.load(request.get_json())

        tag_id = data['tagid']
        name = data['name']
        color = data['color']

        cur = mysql.connection.cursor(cursorclass=DictCursor)

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
    
    @app.route('/api/tags/delete', methods=['PUT'])
    @jwt_required()
    @token_required
    def deleteTag():
        userId = g.userId
        
        # Initialize cursor outside try block
        cur = mysql.connection.cursor()
        
        try:
            data = request.get_json()
            tag_id = data['tagid']

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
            