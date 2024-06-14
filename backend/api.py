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
            print('user:', user)
            userId = str(user[0])
            print('userId:', userId)
            try:
                access_token = create_access_token(identity=userId)
            except Exception as e:
                print(e)
            print('access_token:', access_token)    
            
            # Adding token to a cookie
            response = jsonify({'message': 'Login successful'})
            response.set_cookie('token', access_token)
            return response, 200
        else:
            return jsonify({'message': 'User not found'}), 401
    except:
        return jsonify({'message': 'An error occurred'}), 500

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
    userId = id(object())
    cur.execute("INSERT INTO users (id, username, email, password) VALUES (%s, %s, %s, %s)", (id, username, email, password))
    mysql.connection.commit()
    cur.close()

    access_token = create_access_token(identity=str(userId))
    response.set_cookie('token', access_token)
    response = jsonify({'message': 'User created successfully'})
    return response

if __name__ == '__main__':
    app.run(debug=True)