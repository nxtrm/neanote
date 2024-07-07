
from datetime import datetime
from functools import wraps
import jwt
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

def verify_task_ownership(user_id, task_id, cur):
    
    query = """
    SELECT Notes.user_id
    FROM Tasks
    JOIN Notes ON Tasks.note_id = Notes.id
    WHERE Tasks.id = %s
    """
    cur.execute(query, (task_id,))
    result = cur.fetchone()

    if (len(result)<1) or (int(result['user_id']) != int(user_id)):
        print("False")
        return False
    return True

def verify_subtask_ownership(user_id, subtask_id, cur):
    query = """
    SELECT Notes.user_id
    FROM Subtasks
    JOIN Tasks ON Subtasks.task_id = Tasks.id
    JOIN Notes ON Tasks.note_id = Notes.id
    WHERE Subtasks.id = %s
    """
    cur.execute(query, (subtask_id,))
    result = cur.fetchone()
    print(subtask_id)

    if (len(result)<1) or (int(result['user_id']) != int(user_id)):
        return False
    return True

def verify_tag_ownership(user_id, tag_id, cur):
    query = """
    SELECT user_id
    FROM Tags
    WHERE id = %s
    """
    cur.execute(query, (tag_id,))
    result = cur.fetchone()

    if not result or result['user_id'] != user_id:
        return False
    return True