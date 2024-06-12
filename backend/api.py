from flask import Flask, jsonify, request
from flask_cors import CORS
from flask_mysqldb import MySQL

app = Flask(__name__)

CORS(app, resources={r"/*": {"origins": "*"}}, supports_credentials=True)
mysql = MySQL(app)

# MySQL configurations
app.config['MYSQL_HOST'] = 'localhost'
app.config['MYSQL_PORT'] = 3306
app.config['MYSQL_USER'] = 'root'
app.config['MYSQL_PASSWORD'] = "a9H2xGcjJ5kKeu"
app.config['MYSQL_DB'] = 'neanote'

@app.route('/api/login', methods=['POST'])
def login():
    username = request.json['username']
    password = request.json['password']

    cur = mysql.connection.cursor()
    cur.execute("SELECT * FROM users WHERE username = %s AND password = %s", (username, password))
    user = cur.fetchone()
    cur.close()

    if user:
        return jsonify({'message': 'Login successful'})
    else:
        return jsonify({'message': 'Login failed'}), 401

@app.route('/api/register', methods=['POST'])
def register():
    username = request.json['username']
    email = request.json['email']
    password = request.json['password']

    cur = mysql.connection.cursor()

    cur.execute("SELECT * FROM users WHERE username = %s OR email = %s", (username, email))
    existing_user = cur.fetchone()


    if existing_user:
        return jsonify({'message': 'User with this username or email already exists'}), 400
    id = str(1)
    cur.execute("INSERT INTO users (id, username, email, password) VALUES (%s, %s, %s, %s)", (id, username, email, password))
    mysql.connection.commit()
    cur.close()

    return jsonify({'message': 'User created successfully'})

if __name__ == '__main__':
    app.run(debug=True)