from email.utils import parsedate_to_datetime
from marshmallow import ValidationError
from flask import Flask, g, jsonify, request
from flask_cors import CORS
from flask_jwt_extended import (JWTManager, create_access_token,
                                get_jwt_identity, jwt_required)
from MySQLdb.cursors import DictCursor
from dateutil.relativedelta import relativedelta
from formsValidation import GoalCreateSchema, GoalUpdateSchema, HabitCreateSchema, HabitUpdateSchema, LoginSchema, TagSchema, TaskCreateSchema, TaskSchema, UserSchema
from utils import  token_required, verify_goal_ownership, verify_habit_ownership, verify_milestone_ownership, verify_subtask_ownership, verify_tag_ownership, verify_task_ownership
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

        task_schema = TaskCreateSchema()
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
            per_page = int(request.args.get('per_page', 5))  # Default to 10 items per page
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

            
    @app.route('/api/task', methods=['GET'])
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
            cur.execute("SELECT LAST_INSERT_ID()")
            habitId = cur.fetchone()[0]

            if len(tags)>0:
                for tagId in tags:
                    cur.execute(
                        "INSERT INTO NoteTags (note_id, tag_id) VALUES (%s, %s)",
                        (noteId, tagId)
                    )
           
            mysql.connection.commit()
            return jsonify({'message': 'Task created successfully', 'data' : {noteId, habitId}}), 200
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
    
    @app.route('/api/habits/previews', methods=['GET'])
    @jwt_required()
    @token_required
    def get_habit_previews():
        userId = g.userId
        try:
            cur = mysql.connection.cursor(cursorclass=DictCursor)
            query = '''
                SELECT 
                    n.id AS note_id, 
                    n.title, 
                    n.content, 
                    h.id AS habit_id, 
                    h.streak, 
                    GROUP_CONCAT(DISTINCT t.id) AS tagids, 
                    GROUP_CONCAT(DISTINCT t.name) AS names, 
                    GROUP_CONCAT(DISTINCT t.color) AS colors, 
                    MAX(IF(hc.completion_date IS NOT NULL AND hc.completion_date = CURDATE(), TRUE, FALSE)) AS completed 
                FROM Notes n 
                JOIN Habits h ON n.id = h.note_id 
                LEFT JOIN HabitCompletion hc ON h.id = hc.habit_id AND hc.completion_date = CURDATE()
                LEFT JOIN NoteTags nt ON n.id = nt.note_id 
                LEFT JOIN Tags t ON nt.tag_id = t.id 
                WHERE n.user_id = %s AND n.type = %s
                GROUP BY n.id, h.id
            '''
            
            cur.execute(query, (userId, "habit"))
            rows = cur.fetchall()
            habits = {}
            for row in rows:
                note_id = row['note_id']
                if note_id not in habits:
                    habits[note_id] = {
                        'noteid': row['note_id'],
                        'habitid': row['habit_id'],
                        'title': row['title'][:50] + '...' if len(row['title']) > 50 else row['title'],
                        'content': row['content'][:100] + '...' if len(row['content']) > 100 else row['content'],
                        'streak': row['streak'],
                        'completed_today': row['completed'],
                        'tags': [],
                    }

                tag_ids = row['tagids'].split(',') if row['tagids'] else []
                tag_names = row['names'].split(',') if row['names'] else []
                tag_colors = row['colors'].split(',') if row['colors'] else []

                for tag_id, tag_name, tag_color in zip(tag_ids, tag_names, tag_colors):
                    habits[note_id]['tags'].append({
                        'tagid': tag_id,
                        'name': tag_name,
                        'color': tag_color
                    })

            habits_list = [value for key, value in habits.items()]
            mysql.connection.commit()
            return jsonify({'message': 'Habit previews fetched successfully', 'data': habits_list}), 200
        except Exception as e:
            mysql.connection.rollback()
            print(f"An error occurred: {e}")  
            raise
        finally:
            cur.close()
                

    @app.route('/api/habit', methods=['GET'])
    @jwt_required()
    @token_required
    def get_habit():
        userId = g.userId
        noteid = request.args.get('noteid')
        cur = mysql.connection.cursor(cursorclass=DictCursor)

        try:
            habit = None

            # Main query to fetch the specific habit and its linked tasks
            cur.execute(
                '''SELECT n.id AS note_id, n.title, n.content, h.id AS habit_id, h.reminder_time, h.repetition, h.streak, 
                IF(hc.completion_date IS NOT NULL AND DATE(hc.completion_date) = CURDATE(), TRUE, FALSE) AS completed_today, 
                t.id AS tagid, t.name, t.color, 
                ln.id AS linked_note_id, ln.title AS linked_note_title, ln.content AS linked_note_content, 
                lt.id AS linked_task_id, lt.completed AS linked_task_completed, lt.due_date AS linked_task_due_date, 
                lst.id AS linked_subtask_id, lst.description AS linked_subtask_description, lst.completed AS linked_subtask_completed
                FROM Notes n 
                JOIN Habits h ON n.id = h.note_id 
                LEFT JOIN HabitCompletion hc ON h.id = hc.habit_id
                LEFT JOIN HabitTasks ht ON h.id = ht.habit_id
                LEFT JOIN Notes ln ON ht.task_id = ln.id
                LEFT JOIN Tasks lt ON ln.id = lt.note_id
                LEFT JOIN Subtasks lst ON lt.id = lst.task_id
                LEFT JOIN NoteTags nt ON n.id = nt.note_id 
                LEFT JOIN Tags t ON nt.tag_id = t.id 
                WHERE n.user_id = %s AND n.type = %s AND n.id = %s''',
                (userId, "habit", noteid)
            )

            rows = cur.fetchall()
            for row in rows:
                if habit is None:
                    habit = {
                        'noteid': row['note_id'],
                        'habitid': row['habit_id'],
                        'title': row['title'],
                        'content': row['content'],
                        'streak': row['streak'],
                        'reminder': {'reminder_time': datetime.strptime(str(row['reminder_time']), '%H:%M:%S').strftime('%H:%M'), 'repetition': row['repetition']},
                        'completed_today': row['completed_today'],
                        'tags': [],
                        'linked_tasks': []
                    }

                if row['tagid'] is not None:
                    is_tag_present = any(tag['tagid'] == row['tagid'] for tag in habit['tags'])
                    if not is_tag_present:
                        habit['tags'].append({
                            'tagid': row['tagid'],
                            'name': row['name'],
                            'color': row['color']
                        })
                
                if row['linked_task_id'] is not None:
                    linked_task = next((task for task in habit['linked_tasks'] if task['taskid'] == row['linked_task_id']), None)
                    if not linked_task:
                        linked_task = {
                            'noteid': row['linked_note_id'],
                            'taskid': row['linked_task_id'],
                            'title': row['linked_note_title'],
                            'content': row['linked_note_content'],
                            'completed': row['linked_task_completed'] == 1,
                            'due_date': row['linked_task_due_date'],
                            'tags': [],
                            'subtasks': []
                        }
                        habit['linked_tasks'].append(linked_task)
                    
                    if row['linked_subtask_id'] is not None:
                        is_subtask_present = any(subtask['subtask_id'] == row['linked_subtask_id'] for subtask in linked_task['subtasks'])
                        if not is_subtask_present:
                            linked_task['subtasks'].append({
                                'subtask_id': row['linked_subtask_id'],
                                'description': row['linked_subtask_description'],
                                'completed': row['linked_subtask_completed'] == 1
                            })

            mysql.connection.commit()
            if habit:
                return jsonify({'message': 'Habit fetched successfully', 'data': habit}), 200
            else:
                return jsonify({'message': 'Habit not found'}), 404

        except Exception as e:
            mysql.connection.rollback()
            print(f"An error occurred: {e}")  # Improved error logging
            raise
        finally:
            cur.close()

    
    @app.route('/api/habits/delete', methods=['PUT'])
    @jwt_required()
    @token_required
    def delete_habit():
        userId = g.userId
        cur = mysql.connection.cursor(cursorclass=DictCursor)
        try:
            data = request.get_json()
            habit_id = data['habitid']
            note_id = data['noteid']

            if verify_habit_ownership(userId, habit_id, cur) == False:
                return jsonify({'message': 'You do not have permission to update this habit'}), 403
            
            cur.execute("DELETE FROM NoteTags WHERE note_id = %s", (note_id,))
            cur.execute("DELETE FROM HabitTasks WHERE habit_id = %s", (habit_id,))
            cur.execute("DELETE FROM HabitCompletion WHERE habit_id = %s", (habit_id,))
            cur.execute("DELETE FROM Habits WHERE id = %s", (habit_id,))
            cur.execute("DELETE FROM Notes WHERE id = %s", (note_id,))
                        
            mysql.connection.commit()
            return jsonify({'message': 'Habit deleted successfully'}), 200
        except Exception as e:
            if mysql.connection:
                mysql.connection.rollback()
            raise
        finally:
            cur.close()
    


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
                    elif gap <= 1 and today_date != last_date:
                        cur.execute("UPDATE Habits SET streak = streak + 1 WHERE id = %s", (habit_id,))
                        # Move the INSERT INTO HabitCompletion here, inside the condition to increase streak
                        cur.execute("INSERT INTO HabitCompletion (habit_id, completion_date) VALUES (%s, %s)", (habit_id, today_date))
            else:
                cur.execute("UPDATE Habits SET streak = 1 WHERE id = %s", (habit_id,))
                # If there's no last completion date, it means it's the first completion. Insert it.
                cur.execute("INSERT INTO HabitCompletion (habit_id, completion_date) VALUES (%s, %s)", (habit_id, today_date))

            mysql.connection.commit()
            return jsonify({'message': 'Habit completed successfully'}), 200
        except Exception as e:
            mysql.connection.rollback()
            raise
        finally:
            cur.close()

    @app.route('/api/habits/link', methods=['PUT'])
    @jwt_required()
    @token_required
    def link_habit():
        userId = g.userId

        cur = mysql.connection.cursor(cursorclass=DictCursor)
        data = request.get_json()
        habit_id = data['habitid']
        task_id = data['taskid']
        action_type = data['type']

        try:


            if action_type == "link":
                cur.execute("INSERT INTO HabitTasks VALUES (%s, %s)", (habit_id, task_id))
            elif action_type == "unlink":
                if not verify_habit_ownership(userId, habit_id, cur):
                    return jsonify({'message': 'You do not have permission to update this habit'}), 403
                cur.execute("DELETE FROM HabitTasks WHERE habit_id = %s AND task_id = %s", (habit_id, task_id,))

            mysql.connection.commit()
            return jsonify({'message': 'Habit linked successfully'}), 200
        except Exception as e:
            mysql.connection.rollback()
            raise
        finally:
            cur.close()

    #GOALS MODULE
    @app.route('/api/goals/create', methods=['POST'])
    @jwt_required()
    @token_required
    def create_goal():
        userId = g.userId

        goal_schema = GoalCreateSchema()
        data = goal_schema.load(request.get_json())
        
        try:

            title = data['title']
            content = data['content']
            tags = data['tags']
            milestones= data['milestones']
            due_date = data.get('due_date')
            

            cur = mysql.connection.cursor()

            if due_date is not None:
                due_date = datetime.fromisoformat(due_date.rstrip("Z"))


            cur.execute(
                "INSERT INTO Notes (user_id, title, content, type) VALUES (%s, %s, %s, %s)",
                (userId, title, content, 'goal')
            )

            cur.execute("SELECT LAST_INSERT_ID()")
            noteId = cur.fetchone()[0]

            cur.execute(
                "INSERT INTO Goals (note_id, due_date) VALUES (%s, %s)",
                (noteId, due_date,)
            )
            cur.execute("SELECT LAST_INSERT_ID()")
            goalId = cur.fetchone()[0]

            if len(milestones)>0:
                for milestone in milestones:
                    cur.execute(
                        "INSERT INTO Milestones (goal_id, description, completed, ms_index) VALUES (%s, %s, %s, %s)",
                        (goalId, milestone['description'], False, milestone['index'])
                    )

            if len(tags)>0:
                for tagId in tags:
                    cur.execute(
                        "INSERT INTO NoteTags (note_id, tag_id) VALUES (%s, %s)",
                        (noteId, tagId)
                    )
           
            mysql.connection.commit()
            return jsonify({'message': 'Task created successfully', 'data' : {'noteId': noteId, 'goalId': goalId}}), 200
        except Exception as e:
            mysql.connection.rollback()
            raise

    @app.route('/api/goals/previews', methods=['GET'])
    @jwt_required()
    @token_required
    def get_goal_previews():
        userId = g.userId
        try:
            # Pagination
            page = int(request.args.get('page', 1))  # Default to page 1
            per_page = int(request.args.get('per_page', 5))  # Default to 10 items per page
            offset = (page - 1) * per_page

            cur = mysql.connection.cursor(cursorclass=DictCursor)

            # Fetch the total count of goals for pagination metadata
            cur.execute(""" 
                SELECT COUNT(DISTINCT n.id) AS total
                FROM Notes n
                WHERE n.user_id = %s AND n.type = 'goal'
            """, (userId,))
            total = cur.fetchone()['total']

            query = """ 
                SELECT 
                    n.id AS note_id, 
                    n.title AS title, 
                    n.content AS content, 
                    g.id AS goal_id, 
                    g.due_date AS due_date,
                    m.id AS milestone_id, 
                    m.description AS description, 
                    m.completed AS completed, 
                    m.ms_index AS ms_index,
                    tg.id AS tagid, 
                    tg.name AS tag_name, 
                    tg.color AS tag_color
                FROM Notes n
                LEFT JOIN Goals g ON n.id = g.note_id
                LEFT JOIN Milestones m ON g.id = m.goal_id
                LEFT JOIN NoteTags nt ON n.id = nt.note_id
                LEFT JOIN Tags tg ON nt.tag_id = tg.id
                WHERE n.user_id = %s AND n.type = 'goal'
                ORDER BY n.created_at DESC
                LIMIT %s OFFSET %s
            """

            cur.execute(query, (userId, per_page, offset))
            rows = cur.fetchall()

            goals = {}
            for row in rows:
                note_id = row['note_id']
                if note_id not in goals:
                    goals[note_id] = {
                        'noteid': row['note_id'],
                        'goalid': row['goal_id'],
                        'title': row['title'][:50] + '...' if len(row['title']) > 50 else row['title'],
                        'content': row['content'][:100] + '...' if len(row['content']) > 100 else row['content'],
                        'due_date': row['due_date'].isoformat() if row['due_date'] else None,
                        'tags': [],
                        'milestones': []
                    }

                if row['milestone_id'] is not None:
                    milestone = {
                        'milestoneid': row['milestone_id'],
                        'description': row['description'][:100] + '...' if len(row['description']) > 100 else row['description'],
                        'completed': row['completed'] == 1,
                        'index': row['ms_index']
                    }
                    goals[note_id]['milestones'].append(milestone)

                if row['tagid'] is not None:
                    tag = {
                        'tagid': row['tagid'],
                        'name': row['tag_name'],
                        'color': row['tag_color']
                    }
                    if tag not in goals[note_id]['tags']:
                        goals[note_id]['tags'].append(tag)

            goals_list = [value for key, value in goals.items()]
            mysql.connection.commit()
            nextPage = page + 1 if (offset + per_page) < total else None

            return jsonify({"goals": goals_list, 'nextPage': nextPage, 'message': "Goals fetched successfully"}), 200
        except Exception as e:
            mysql.connection.rollback()
            print(f"An error occurred: {e}")  
            raise
        finally:
            cur.close()

    @app.route('/api/goal', methods=['GET'])
    @jwt_required()
    @token_required
    def get_goal():
        userId = g.userId
        try:
            noteid=request.args.get('noteId')
            cur = mysql.connection.cursor(cursorclass=DictCursor)

            query = """ 
                SELECT 
                    n.id AS note_id, 
                    n.title AS title, 
                    n.content AS content, 
                    g.id AS goal_id, 
                    g.due_date AS due_date,
                    m.id AS milestone_id, 
                    m.description AS description, 
                    m.completed AS completed, 
                    m.ms_index AS ms_index,
                    tg.id AS tagid, 
                    tg.name AS tag_name, 
                    tg.color AS tag_color
                FROM Notes n
                LEFT JOIN Goals g ON n.id = g.note_id
                LEFT JOIN Milestones m ON g.id = m.goal_id
                LEFT JOIN NoteTags nt ON n.id = nt.note_id
                LEFT JOIN Tags tg ON nt.tag_id = tg.id
                WHERE n.user_id = %s AND n.type = 'goal' AND n.id = %s
            """

            cur.execute(query, (userId, noteid))
            rows = cur.fetchall()

            goal = None
            for row in rows:
                if goal is None:
                    goal = {
                        'noteid': row['note_id'],
                        'goalid': row['goal_id'],
                        'title': row['title'],
                        'content': row['content'],
                        'due_date': (row['due_date'].isoformat()) if row['due_date'] else None,
                        'tags': [],
                        'milestones': []
                    }

                if row['milestone_id'] is not None:
                    milestone = {
                        'milestoneid': row['milestone_id'],
                        'description': row['description'],
                        'completed': row['completed'] == 1,
                        'index': row['ms_index']
                    }
                    goal['milestones'].append(milestone)

                if row['tagid'] is not None:
                    tag = {
                        'tagid': row['tagid'],
                        'name': row['tag_name'],
                        'color': row['tag_color']
                    }
                    if tag not in goal['tags']:
                        goal['tags'].append(tag)

            mysql.connection.commit()

            if goal:
                return jsonify({"goal": goal, 'message': "Goal fetched successfully"}), 200
            else:
                return jsonify({'message': "Goal not found"}), 404
        except Exception as e:
            mysql.connection.rollback()
            print(f"An error occurred: {e}")  
            raise
        finally:
            cur.close()

    @app.route('/api/goals/milestone/complete', methods=['PUT'])
    @jwt_required()
    @token_required   
    def complete_milestone():
        userId = g.userId
        try:
            cur = mysql.connection.cursor(cursorclass=DictCursor)
            data = request.get_json()
            milestone_id = data['milestoneid']
            goal_id = data['goalid']

            if not verify_milestone_ownership(userId, milestone_id, cur):
                return jsonify({'message': 'You do not have permission to update this milestone'}), 403
            
            cur.execute("""UPDATE Milestones SET completed = CASE 
                                            WHEN completed = 1 THEN 0 
                                            ELSE 1 
                                        END  = TRUE WHERE id = %s""", (milestone_id,))
            mysql.connection.commit()
            return jsonify({'message': 'Milestone toggled successfully'}), 200
        except Exception as e:
            mysql.connection.rollback()
            print(f"An error occurred: {e}")  
            raise
        finally:
            cur.close()

    @app.route('/api/goals/update', methods=['PUT'])  
    @jwt_required()
    @token_required
    def update_goal():
        userId = g.userId

        goal_schema = GoalUpdateSchema()
        data = goal_schema.load(request.get_json())

        cur = mysql.connection.cursor(cursorclass=DictCursor)
        try:
            note_id = data['noteid']
            goal_id = data['goalid']
            due_date = data.get('due_date')

            if verify_goal_ownership(userId, goal_id, cur) == False:
                return jsonify({'message': 'You do not have permission to update this goal'}), 403

            query = """
                    UPDATE Notes
                    SET title = %s, content = %s
                    WHERE id = %s AND user_id = %s
                    """
            cur.execute(query, (data['title'], data['content'], note_id, userId))

            if due_date is not None:
                parsed_date = datetime.strptime(due_date, "%Y-%m-%dT%H:%M:%S.%fZ")
                formatted_date = parsed_date.strftime("%Y-%m-%d")
                cur.execute(
                    "UPDATE Goals SET due_date = %s WHERE note_id = %s",
                    (formatted_date, note_id)
                )
            else:
                cur.execute(
                    "UPDATE Goals SET due_date = NULL WHERE note_id = %s",
                    (note_id,)
                )


            cur.execute("DELETE FROM NoteTags WHERE note_id = %s", (note_id,))
            for tagId in data['tags']:
                cur.execute(
                    "INSERT INTO NoteTags (note_id, tag_id) VALUES (%s, %s)",
                    (note_id, tagId)
                )
            
            if data.get('milestones') is not None:
                for milestone in data['milestones']:
                    cur.execute(
                        "UPDATE Milestones SET description=%s, completed=%s, ms_index=%s WHERE id = %s",
                        (milestone['description'], milestone['completed'], milestone['index'], milestone['milestoneid'])
                    )
            
            mysql.connection.commit()
            return jsonify({'message': 'Goal updated successfully'}), 200
        except Exception as e:
            mysql.connection.rollback()
            raise
        finally:
            cur.close()

    @app.route('/api/goals/delete', methods=['DELETE'])
    @jwt_required()
    @token_required
    def delete_goal():
        userId = g.userId
        cur = mysql.connection.cursor(cursorclass=DictCursor)
        try:
            note_id =request.args.get('noteid')
            goal_id =request.args.get('goalid')

            if verify_goal_ownership(userId, goal_id, cur) == False:
                return jsonify({'message': 'You do not have permission to update this goal'}), 403
            
            cur.execute("DELETE FROM Milestones WHERE goal_id = %s", (goal_id,))
            cur.execute("DELETE FROM Goals WHERE id = %s", (goal_id,))
            cur.execute("DELETE FROM Notes WHERE id = %s", (note_id,))
            cur.execute("DELETE FROM NoteTags WHERE note_id = %s", (note_id,))
                        
            mysql.connection.commit()
            return jsonify({'message': 'Goal deleted successfully'}), 200
        except Exception as e:
            if mysql.connection:
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
            