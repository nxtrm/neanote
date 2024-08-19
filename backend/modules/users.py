from datetime import datetime, timedelta
import bcrypt
from flask import Blueprint, g, jsonify, request
from flask_jwt_extended import create_access_token, jwt_required
from marshmallow import ValidationError
import psycopg2
from formsValidation import LoginSchema, TagSchema, UserSchema
from utils import token_required, verify_tag_ownership

def user_routes(app, conn):
    @app.route('/api/login', methods=['POST'])
    def login():
        try:
            login_schema = LoginSchema()
            data = login_schema.load(request.json)
            username = data['username']
            password = data['password']

            cur = conn.cursor()
            cur.execute("SELECT * FROM users WHERE username = %s", (username,))
            user = cur.fetchone()

            if user and bcrypt.checkpw(password.encode('utf-8'), user[3].encode('utf-8')):  # Assuming password is the 4th column
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
            conn.rollback()
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

            # Hash the password
            hashed_password = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt())

            cur = conn.cursor()
            cur.execute("SELECT * FROM users WHERE username = %s OR email = %s", (username, email))
            existing_user = cur.fetchone()

            if existing_user:
                return jsonify({'message': 'User with this username or email already exists'}), 400

            cur.execute("INSERT INTO users (username, email, password) VALUES (%s, %s, %s) RETURNING id", 
                        (username, email, hashed_password))
            userId = cur.fetchone()[0]

            try:
                access_token = create_access_token(identity=userId)
            except Exception as e:
                conn.rollback()
                raise

            conn.commit()
            cur.close()

            response = jsonify({'message': 'User created successfully', 'userId': userId})
            response.set_cookie('token', access_token)
            return response
        except ValidationError as err:
            return jsonify(err.messages), 400
        except Exception as error:
            conn.rollback()
            raise
        finally:
            cur.close()

    @app.route('/api/user', methods=['GET'])
    @jwt_required()
    @token_required
    def get_user():
        try:
            userId = g.userId

            with conn.cursor(cursor_factory=psycopg2.extras.DictCursor) as cur:
                cur.execute(
                    """SELECT username, email, preferences FROM users WHERE id = %s""", (userId,)
                )
                data = cur.fetchone()
                user = {
                    'username': data['username'],
                    'email': data['email'],
                    'preferences': data['preferences']
                }
                return jsonify({'data': user, 'message': 'User data retrieved successfully'}), 200
        except Exception as e:
            raise
    
    @app.route('/api/user', methods=['PUT'])
    @jwt_required()
    @token_required
    def update_user():
        try:
            userId = g.userId
            # user_schema = UserSchema()
            # data = user_schema.load(request.json)
            data = request.get_json()

            with conn.cursor() as cur:
                cur.execute(
                    """UPDATE users SET username = %s, email = %s WHERE id = %s""",
                    (data['username'], data['email'], userId)
                )
                conn.commit()
                return jsonify({'message': 'User data updated successfully'}), 200

        except Exception as e:
            raise