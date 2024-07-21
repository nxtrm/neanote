from datetime import datetime
from flask import Blueprint, g, jsonify, request
from flask_jwt_extended import jwt_required
from MySQLdb.cursors import DictCursor
from formsValidation import HabitCreateSchema, HabitUpdateSchema
from utils import token_required, verify_habit_ownership
from dateutil.relativedelta import relativedelta

def habit_routes(app,mysql):
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
