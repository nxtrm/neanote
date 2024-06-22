from flask import Flask, jsonify, request
from flask_cors import CORS
from flask_jwt_extended import JWTManager, create_access_token
from flask_mysqldb import MySQL
import jwt

app = Flask(__name__)

CORS(app, resources={r"/*": {"origins": "*"}}, supports_credentials=True)
mysql = MySQL(app)
jwt = JWTManager(app)

# MySQL configurations
app.config['MYSQL_HOST'] = 'localhost'
app.config['MYSQL_PORT'] = 3306
app.config['MYSQL_USER'] = 'root'
app.config['MYSQL_PASSWORD'] = "a9H2xGcjJ5kKeu"
app.config['JWT_SECRET_KEY'] = 'sdg(weh3328!!@#)'
app.config['MYSQL_DB'] = 'neanote'

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

        access_token = create_access_token(identity=str(userId))
        response.set_cookie('token', access_token)
        response = jsonify({'message': 'User created successfully', 'userId': userId})
        return response
    except Exception as error:
        mysql.connection.rollback()
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
    
    cur = mysql.connection.cursor()

    try:
        # Insert into Notes table
        cur.execute(
            "INSERT INTO Notes (user_id, title, content, type) VALUES (%s, %s, %s, %s)",
            (userId, title, textField, 'task')  # Replace userId with the actual user ID
        )
        cur.execute("SELECT LAST_INSERT_ID()")
        noteId = cur.fetchone()[0]

        if textField is not None:
            cur.execute(
                "INSERT INTO Tasks (note_id, completed, due_date, due_time) VALUES (%s, %s, %s, %s)",
                (noteId, False, dueDate, dueTime)
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
        return jsonify({'message': 'Task created successfully'}), 200
    except Exception as error:
        mysql.connection.rollback()
        cur.close()
        print('Error during transaction', error)
        return jsonify({'message': 'Error creating task'}), 500

if __name__ == '__main__':
        app.run(debug=True)