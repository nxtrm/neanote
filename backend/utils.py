
from datetime import datetime
from dateutil.relativedelta import relativedelta
from email.utils import parsedate_to_datetime
from functools import wraps
import jwt
import psycopg2
from config import Config
from flask import jsonify, request, g


def decodeToken(token): #deprecated
    try:
        decoded = jwt.decode(token, Config.JWT_SECRET_KEY, algorithms=['HS256'])
        userId = decoded.get('sub')
        return userId
    except Exception as e:
        print('Error decoding token', e)
        return None


def generateToken(userId):
    try:
        exp = datetime.datetime.utcnow() + datetime.timedelta(days=1)
        payload = {
            'identity': str(userId),
            'exp': exp
        }
        token = jwt.encode(payload, Config.JWT_SECRET_KEY, algorithm='HS256')
        print("Token generated: ", token)
        return token
    except Exception as e:
        print('Error generating token', e)
        return None

# Decorator for authentication

def token_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        token = request.cookies.get('token')
        if not token:
            return jsonify({'message': 'Token is missing!'}), 403
        try:
            decoded = jwt.decode(token, Config.JWT_SECRET_KEY, algorithms=['HS256'])
            g.userId = decoded.get('sub')  # Store decoded token data in Flask's g object

        except jwt.ExpiredSignatureError:
            return jsonify({'message': 'Token has expired'}), 403
        except jwt.InvalidTokenError:
            return jsonify({'message': 'Invalid token'}), 403
        return f(*args, **kwargs)
    return decorated_function

def calculate_gap(repetition, today_date, last_date):
    if repetition == 'daily':
        return (today_date - last_date).days - 1
    elif repetition == 'weekly':
        return (today_date - last_date).days // 7
    elif repetition == 'monthly':
        delta = relativedelta(today_date, last_date)
        return delta.months + 12 * delta.years
    return None

def verify_task_ownership(user_id, task_id, cur):
    
    query = """
    SELECT Notes.user_id
    FROM Tasks
    JOIN Notes ON Tasks.note_id = Notes.id
    WHERE Tasks.id = %s
    """
    cur.execute(query, (task_id,))
    result = cur.fetchone()

    if (len(result)<1) or (result['user_id'] != user_id):
        print("False")
        return False
    return True

def verify_habit_ownership(user_id, habit_id, cur):
    
    query = """
    SELECT Notes.user_id
    FROM Habits
    JOIN Notes ON Habits.note_id = Notes.id
    WHERE Habits.id = %s
    """
    cur.execute(query, (habit_id,))
    result = cur.fetchone()

    if (len(result)<1) or (str(result['user_id']) != str(user_id)):
        print("False")
        return False
    return True

def verify_goal_ownership(user_id, goal_id, cur):
    
    query = """
    SELECT Notes.user_id
    FROM Goals
    JOIN Notes ON Goals.note_id = Notes.id
    WHERE Goals.id = %s
    """
    cur.execute(query, (goal_id,))
    result = cur.fetchone()

    if (len(result)<1) or (str(result['user_id']) != str(user_id)):
        return False
    return True

def verify_milestone_ownership(user_id, milestone_id, cur):
    query = """
        SELECT Notes.user_id
        FROM Milestones
        JOIN Goals ON Milestones.goal_id = Goals.id
        JOIN Notes ON Goals.note_id = Notes.id
        WHERE Milestones.id = %s
    """
    cur.execute(query, (milestone_id,))
    result = cur.fetchone()
    print(result)

    if (len(result)<1) or (result['user_id'] != user_id):
        return False
    return True

def remove_overdue_archived_notes(conn):
    cur = conn.cursor(cursor_factory=psycopg2.extras.DictCursor)
    deleted_notes = 0
    cur.execute("""
        SELECT id, type FROM Notes
        WHERE archived = TRUE AND updated_at < NOW() - INTERVAL '1 month'
    """)
    notes_to_remove = cur.fetchall()
    for note in notes_to_remove:
        if note['type'] == 'task':
            cur.execute("""
                DELETE FROM Subtasks WHERE task_id IN (
                    SELECT id FROM Tasks WHERE note_id = %s
                )"""), (note['id'],)
            cur.execute("""
                DELETE FROM Tasks WHERE note_id = %s
            """, (note['id'],))
        elif note['type'] == 'habit':
            cur.execute("""
                DELETE FROM HabitsTasks WHERE habit_id IN (
                        SELECT id FROM Habits WHERE note_id = %s
                )""",(note['id'],))
            cur.execute("""
                DELETE FROM Habits WHERE note_id = %s
            """, (note['id'],))
        elif note['type'] == 'goal':
            cur.execute("""
                DELETE FROM Milestones WHERE goal_id IN (
                    SELECT id FROM Goals WHERE note_id = %s
                )
            """, (note['id'],))
            cur.execute("""
                DELETE FROM Goals WHERE note_id = %s
            """, (note['id'],))
        cur.execute(""" DELETE FROM NoteTags WHERE note_id = %s """, (note['id'],))
        cur.execute("""
            DELETE FROM Notes WHERE id = %s
        """, (note['id'],))
        deleted_notes += 1
    print(f"Number of removed notes: {deleted_notes}")

def verify_subtask_ownership(user_id, subtask_id, cur):
    cur.execute("""
        SELECT st.id 
        FROM Subtasks st
        JOIN Tasks t ON st.task_id = t.id
        JOIN Notes n ON t.note_id = n.id
        WHERE st.id = %s AND n.user_id = %s
    """, (subtask_id, user_id))
    return cur.fetchone() is not None

def verify_tag_ownership(user_id, tag_id, cur):
    query = """
    SELECT user_id
    FROM Tags
    WHERE id = %s
    """
    cur.execute(query, (tag_id,))
    result = cur.fetchone()

    if (len(result)<1) or (result['user_id'] != user_id):
        return False
    return True

def process_universal_notes(rows,cur):
    notes_dict = {}
    for row in rows:
        note_id = row['note_id']
        if note_id not in notes_dict:
            notes_dict[note_id] = {
                'noteid': note_id,
                'title': row['title'][:50] + '...' if len(row['title']) > 50 else row['title'],
                'content': row['content'][:100] + '...' if len(row['content']) > 100 else row['content'],
                'type': row['type'],
                'tags': []
            }
        if row['tagid']:
            notes_dict[note_id]['tags'].append({
                'tagid': row['tagid'],
                'name': row['name'],
                'color': row['color']
            })
    # Fetch the secondary ID based on the type
    for note in notes_dict.values():
        if note['type'] == 'task':
            cur.execute("SELECT id AS taskid FROM Tasks WHERE note_id = %s", (note['noteid'],))
            secondary_id = cur.fetchone()
            note['secondaryid'] = secondary_id['taskid'] if secondary_id else None
        elif note['type'] == 'habit':
            cur.execute("SELECT id AS habitid FROM Habits WHERE note_id = %s", (note['noteid'],))
            secondary_id = cur.fetchone()
            note['secondaryid'] = secondary_id['habitid'] if secondary_id else None
        elif note['type'] == 'goal':
            cur.execute("SELECT id AS goalid FROM Goals WHERE note_id = %s", (note['noteid'],))
            secondary_id = cur.fetchone()
            note['secondaryid'] = secondary_id['goalid'] if secondary_id else None
        # Add any other types here
    notes = list(notes_dict.values())
    return notes
