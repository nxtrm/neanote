from datetime import datetime
import os
import sys
from flask import  g, jsonify, request
from flask_jwt_extended import jwt_required
import psycopg2.extras
from formsValidation import HabitSchema
from utils.userDeleteGraph import delete_notes_with_backoff, delete_user_data_with_backoff
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), os.path.pardir)))
from modules.universal import BaseNote
from utils.utils import calculate_gap, token_required, verify_habit_ownership

class HabitApi():
    def __init__(self, app, conn, tokenization_manager, recents_manager):
        super().__init__(app, conn, tokenization_manager, recents_manager)
        self.habit_schema = HabitSchema()
        self.habit_routes()

        self.base_note = BaseNote(app, conn, tokenization_manager, recents_manager) #add composition

    def tokenize(self,noteId,title,content):
        text = [title, content]
        priority = sum(len(string) for string in text)
        self.base_note.tokenization_manager.add_note(
            text=text,
            priority=priority,
            note_id=noteId
            )

    def habit_routes(self):
        #HABITS MODULE
        @self.app.route('/api/habits/create', methods=['POST'])
        @jwt_required()
        @token_required
        def create_habit():
            try:
                userId = str(g.userId)  # Convert UUID to string if g.userId is a UUID
                data = self.habit_schema.load(request.get_json())
                title = data['title']
                content = data['content']
                tags = data.get('tags', [])
                reminder = data.get('reminder', {})

                reminder_time = reminder.get('reminder_time')
                repetition = reminder.get('repetition')


                with self.base_note.conn.cursor(cursor_factory=psycopg2.extras.DictCursor) as cur:
                    noteId = self.create_note(cur, userId, title, content, 'habit', tags)

                    cur.execute(
                        """
                        INSERT INTO Habits (note_id, reminder_time, repetition, streak)
                        VALUES (%s, %s, %s, %s) RETURNING id
                        """,
                        (noteId, reminder_time,  repetition, 0)
                    )
                    habitId = cur.fetchone()[0]

                    self.base_note.conn.commit()

                    self.tokenize(noteId,title,content)

                    return jsonify({
                        'message': 'Habit created successfully',
                        'data': {
                            'noteid': noteId,
                            'habitid': habitId,
                        }
                    }), 200

            except Exception as e:
                self.base_note.conn.rollback()
                print(f"An error occurred: {e}")
                raise

        @self.app.route('/api/habits/update', methods=['PUT'])
        @jwt_required()
        @token_required
        def update_habit():
            try:
                userId = str(g.userId)  # Convert UUID to string if g.userId is a UUID

                habit_schema = HabitSchema()
                data = habit_schema.load(request.get_json())

                note_id = str(data['noteid'])
                habit_id = str(data['habitid'])
                tags = data.get('tags', [])

                with self.base_note.conn.cursor(cursor_factory=psycopg2.extras.DictCursor) as cur:
                    if not verify_habit_ownership(userId, habit_id, cur):
                        return jsonify({'message': 'You do not have permission to update this habit'}), 403

                    cur.execute(
                        """
                        UPDATE Notes
                        SET title = %s, content = %s
                        WHERE id = %s AND user_id = %s
                        """,
                        (data['title'], data['content'], note_id, userId)
                    )

                    reminder_time = data['reminder']['reminder_time']
                    repetition = data['reminder']['repetition']

                    cur.execute(
                        "UPDATE Habits SET reminder_time = %s, repetition = %s WHERE note_id = %s",
                        (reminder_time, repetition, note_id)
                    )

                    self.update_notetags(cur, note_id, tags)

                    self.base_note.conn.commit()
                    self.tokenize(note_id,data['title'],data['content'])
                    return jsonify({'message': 'Habit updated successfully'}), 200

            except Exception as e:
                self.base_note.conn.rollback()
                print(f"An error occurred: {e}")
                raise

        @self.app.route('/api/habits/previews', methods=['GET'])
        @jwt_required()
        @token_required
        def get_habit_previews():
            try:
                userId = str(g.userId)  # Convert UUID to string if g.userId is a UUID

                # Pagination
                page = int(request.args.get('pageParam', 1))  # Default to page 1
                per_page = int(request.args.get('per_page', 5))  # Default to 10 items per page
                offset = (page - 1) * per_page

                with self.base_note.conn.cursor(cursor_factory=psycopg2.extras.DictCursor) as cur:
                    # Fetch the total count of habits for pagination metadata
                    total,nextPage = self.fetch_total_notes(cur, 'habit', userId, page, offset, per_page)

                    cur.execute(f'''
                        WITH {self.base_note.tags_cte}
                        SELECT
                            n.id AS note_id,
                            n.title,
                            n.content,
                            h.id AS habit_id,
                            h.streak,
                            EXISTS (
                                SELECT 1
                                FROM HabitCompletion hc
                                WHERE hc.habit_id = h.id AND hc.completion_date = CURRENT_DATE
                            ) AS completed,
                            COALESCE(tags_cte.tags, '[]') AS tags
                        FROM Notes n
                        JOIN Habits h ON n.id = h.note_id
                        LEFT JOIN TagsCTE tags_cte ON n.id = tags_cte.note_id
                        WHERE n.user_id = %s AND n.type = %s AND n.archived = FALSE
                        ORDER BY n.created_at DESC
                        LIMIT %s OFFSET %s
                    ''', (userId, "habit", per_page, offset))

                    rows = cur.fetchall()
                    habits = []
                    for row in rows:
                        habit = {
                            'noteid': row['note_id'],
                            'habitid': row['habit_id'],
                            'title': row['title'][:50] + '...' if len(row['title']) > 50 else row['title'],
                            'content': row['content'][:100] + '...' if len(row['content']) > 100 else row['content'],
                            'streak': row['streak'],
                            'completed_today': row['completed'],
                            'tags': row['tags']
                        }
                        habits.append(habit)

                    self.base_note.conn.commit()
                    return jsonify({
                        'message': 'Habit previews fetched successfully',
                        'data': habits,
                        'pagination': {
                            'total': total,
                            'page': page,
                            'per_page': per_page,
                            'next_page': nextPage
                        }
                    }), 200
            except Exception as e:
                self.base_note.conn.rollback()
                print(f"An error occurred: {e}")
                raise


        @self.app.route('/api/habit', methods=['GET'])
        @jwt_required()
        @token_required

        def get_habit():
            try:
                userId = g.userId
                noteid = request.args.get('noteid')

                with self.base_note.conn.cursor(cursor_factory=psycopg2.extras.DictCursor) as cur:
                    cur.execute(
                        '''
                        SELECT
                            n.id AS note_id,
                            n.title,
                            n.content,
                            h.id AS habit_id,
                            h.reminder_time,
                            h.repetition,
                            h.streak,
                            COALESCE(BOOL_OR(hc.completion_date = CURRENT_DATE),FALSE) AS completed_today,
                            t.id AS tagid,
                            t.name,
                            t.color,
                            ln.id AS linked_note_id,
                            ln.title AS linked_note_title,
                            ln.content AS linked_note_content,
                            lt.id AS linked_task_id,
                            lt.completed AS linked_task_completed,
                            lt.due_date AS linked_task_due_date,
                            lst.id AS linked_subtask_id,
                            lst.description AS linked_subtask_description,
                            lst.completed AS linked_subtask_completed
                        FROM Notes n
                        JOIN Habits h ON n.id = h.note_id
                        LEFT JOIN HabitCompletion hc ON h.id = hc.habit_id
                        LEFT JOIN HabitTasks ht ON h.id = ht.habit_id
                        LEFT JOIN Notes ln ON ht.task_id = ln.id
                        LEFT JOIN Tasks lt ON ln.id = lt.note_id
                        LEFT JOIN Subtasks lst ON lt.id = lst.task_id
                        LEFT JOIN NoteTags nt ON n.id = nt.note_id
                        LEFT JOIN Tags t ON nt.tag_id = t.id
                        WHERE n.user_id = %s AND n.type = %s AND n.archived = FALSE AND n.id = %s
                        GROUP BY n.id, h.id, t.id, ln.id, lt.id, lst.id
                        ''',
                        (userId, 'habit', noteid)
                    )

                    rows = cur.fetchall()
                    habit = None
                    for row in rows:
                        if habit is None:
                            habit = {
                                'noteid': row['note_id'],
                                'habitid': row['habit_id'],
                                'title': row['title'],
                                'content': row['content'],
                                'streak': row['streak'],
                                'reminder': {
                                    'reminder_time': row['reminder_time'].strftime('%H:%M') if row['reminder_time'] else None,
                                    'repetition': row['repetition']
                                },
                                'completed_today': row['completed_today'],
                                'tags': [],
                                'linked_tasks': []
                            }

                        if row['tagid'] is not None:
                            habit['tags'].base_note.append(
                                row['tagid']
                            )

                        # if row['linked_task_id']:
                        #     linked_task = next((task for task in habit['linked_tasks'] if task['taskid'] == row['linked_task_id']), None)
                        #     if not linked_task:
                        #         linked_task = {
                        #             'noteid': row['linked_note_id'],
                        #             'taskid': row['linked_task_id'],
                        #             'title': row['linked_note_title'],
                        #             'content': row['linked_note_content'],
                        #             'completed': row['linked_task_completed'],
                        #             'due_date': row['linked_task_due_date'],
                        #             'subtasks': []
                        #         }
                        #         habit['linked_tasks'].base_note.append(linked_task)

                        #     if row['linked_subtask_id']:
                        #         if not any(subtask['subtask_id'] == row['linked_subtask_id'] for subtask in linked_task['subtasks']):
                        #             linked_task['subtasks'].base_note.append({
                        #                 'subtask_id': row['linked_subtask_id'],
                        #                 'description': row['linked_subtask_description'],
                        #                 'completed': row['linked_subtask_completed']
                        #             })

                    self.base_note.conn.commit()
                    self.base_note.recents_manager.add_note_for_user(userId, noteid)
                    if habit:
                        return jsonify({'message': 'Habit fetched successfully', 'data': habit}), 200
                    else:
                        return jsonify({'message': 'Habit not found'}), 404

            except Exception as e:
                self.base_note.conn.rollback()
                print(f"An error occurred: {e}")
                raise
            finally:
                cur.close()


        @self.app.route('/api/habits/delete', methods=['DELETE'])
        @jwt_required()
        @token_required
        def delete_habit():
            cur = None
            try:
                userId = g.userId
                with self.base_note.conn.cursor(cursor_factory=psycopg2.extras.DictCursor) as cur:
                    habit_id = request.args.get('habitid')
                    note_id = request.args.get('noteid')

                    if not verify_habit_ownership(userId, habit_id, cur):
                        return jsonify({'message': 'You do not have permission to update this habit'}), 403

                    stack = [2, 7, 8, 9, 12]
                    if delete_notes_with_backoff(self.base_note.conn, note_id, stack):
                        self.base_note.tokenization_manager.delete_note_by_id(note_id)
                        return jsonify({'message': 'Habit deleted successfully'}), 200
                    else:
                        return jsonify({'message': 'Failed to delete Habit data after multiple retries'}), 500
            except Exception as e:
                self.base_note.conn.rollback()
                raise
            finally:
                cur.close()


        @self.app.route('/api/habits/complete', methods=['PUT'])
        @jwt_required()
        @token_required
        def complete_habit():
            try:
                userId = g.userId
                data = request.get_json()
                habit_id = str(data['habitid'])

                with self.base_note.conn.cursor(cursor_factory=psycopg2.extras.DictCursor) as cur:
                    if not verify_habit_ownership(userId, habit_id, cur):
                        return jsonify({'message': 'You do not have permission to update this habit'}), 403

                    cur.execute("""
                        SELECT repetition, MAX(completion_date) AS last_completion_date
                        FROM HabitCompletion
                        JOIN Habits ON Habits.id = HabitCompletion.habit_id
                        WHERE habit_id = %s
                        GROUP BY repetition
                    """, (habit_id,))
                    habit_info = cur.fetchone()

                    today_date = datetime.now().date()
                    streak = 1  # Initialize streak

                    if habit_info and habit_info['last_completion_date']:
                        last_date = habit_info['last_completion_date']
                        repetition = habit_info['repetition']
                        gap = calculate_gap(repetition, today_date, last_date)

                        if gap > 1:
                            cur.execute("UPDATE Habits SET streak = 1 WHERE id = %s", (habit_id,))
                        elif gap <= 1 and today_date != last_date:
                            cur.execute("UPDATE Habits SET streak = streak + 1 WHERE id = %s", (habit_id,))
                            streak = "+"
                        elif gap > 1 and today_date == last_date:
                            cur.execute("UPDATE Habits SET streak = 1 WHERE id = %s", (habit_id,))
                        else:
                            cur.execute("UPDATE Habits SET streak = 1 WHERE id = %s", (habit_id,))

                    cur.execute("INSERT INTO HabitCompletion (habit_id, completion_date) VALUES (%s, %s)", (habit_id, today_date))

                    self.base_note.conn.commit()
                    return jsonify({'message': 'Habit completed successfully', 'data': streak}), 200
            except Exception as e:
                self.base_note.conn.rollback()
                print(f"An error occurred: {e}")
                return jsonify({'message': 'An error occurred while completing the habit'}), 500


        @self.app.route('/api/habits/link', methods=['PUT'])
        @jwt_required()
        @token_required
        def link_habit():
            cur = None
            try:
                userId = g.userId

                with self.base_note.conn.cursor(cursor_factory=psycopg2.extras.DictCursor) as cur:
                    data = request.get_json()
                    habit_id = data['habitid']
                    task_id = data['taskid']
                    action_type = data['type']

                    if action_type == "link":
                        cur.execute("INSERT INTO HabitTasks VALUES (%s, %s)", (habit_id, task_id))
                    elif action_type == "unlink":
                        if not verify_habit_ownership(userId, habit_id, cur):
                            return jsonify({'message': 'You do not have permission to update this habit'}), 403
                        cur.execute("DELETE FROM HabitTasks WHERE habit_id = %s AND task_id = %s", (habit_id, task_id,))

                self.base_note.conn.commit()
                return jsonify({'message': 'Habit linked successfully'}), 200
            except Exception as e:
                self.base_note.conn.rollback()
                raise
            finally:
                cur.close()
