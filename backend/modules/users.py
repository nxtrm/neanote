from datetime import datetime, timedelta
import json
import bcrypt
from flask import Blueprint, g, jsonify, request
from flask_jwt_extended import create_access_token, jwt_required
from marshmallow import ValidationError
from psycopg2 import sql
import psycopg2

import os
import sys
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), os.path.pardir)))
from formsValidation import LoginSchema, TagSchema, UserSchema
from utils.utils import token_required, verify_tag_ownership
from utils.userDeleteGraph import delete_with_dfs  # Import with a different name

def user_routes(app, conn):
    @app.route('/api/login', methods=['POST'])
    def login():
        try:
            login_schema = LoginSchema()
            data = login_schema.load(request.json)
            username = data['username']
            password = data['password']

            cur = conn.cursor(cursor_factory=psycopg2.extras.DictCursor)
            cur.execute("SELECT * FROM users WHERE username = %s", (username,))
            user = cur.fetchone()

            if (user 
                and bcrypt.checkpw(password.encode('utf-8'), user['password'].encode('utf-8'))
                ):

                userId = str(user['id'])
                access_token = create_access_token(identity=userId, expires_delta=timedelta(days=1))

                response = jsonify({'message': 'Login successful', 'preferences': user['preferences']})
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
            hashed_password = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt(rounds=12)).decode('utf-8')

            cur = conn.cursor()
            cur.execute("SELECT * FROM users WHERE username = %s OR email = %s", (username, email))
            existing_user = cur.fetchone()

            if existing_user:
                return jsonify({'message': 'User with this username or email already exists'}), 400

            preferences = json.dumps({"theme": "light", "model": "default"})
            cur.execute("INSERT INTO users (username, email, password, preferences) VALUES (%s, %s, %s, %s) RETURNING id",
                        (username, email, hashed_password, preferences))
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
            data = request.get_json()

            with conn.cursor() as cur:
                if 'username' in data and 'email' in data:
                    cur.execute(
                        """UPDATE users SET username = %s, email = %s WHERE id = %s""",
                        (data['username'], data['email'], userId)
                    )
                if 'preferences' in data:
                    cur.execute(
                        """UPDATE users SET preferences = %s WHERE id = %s""",
                        (json.dumps(data['preferences']), userId)
                    )
                conn.commit()
                return jsonify({'message': 'User data updated successfully'}), 200

        except Exception as e:
            raise

    @app.route('/api/user/password', methods=['PUT'])
    @jwt_required()
    @token_required
    def update_password():
        try:
            userId = g.userId
            data = request.get_json()
            password = data['password']
            new_password = data['newpassword']

            with conn.cursor() as cur:
                cur.execute(
                    '''SELECT password FROM users WHERE id = %s''',
                    (userId,)
                )
                user = cur.fetchone()
                if not user:
                    return jsonify({'message': 'Invalid user credentials'}), 401
                elif bcrypt.checkpw(password.encode('utf-8'), user[0].encode('utf-8')):
                    if password == new_password:
                        return jsonify({'message': 'New password cannot be the same as the old password'}), 400

                    hashed_newpassword = bcrypt.hashpw(new_password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
                    cur.execute(
                        """UPDATE users SET password = %s WHERE id = %s""",
                        (hashed_newpassword, userId)
                    )
                    conn.commit()
                    return jsonify({'message': 'Password updated successfully'}), 200
                else:
                    return jsonify({'message': 'Invalid user credentials'}), 401
        except Exception as e:
            raise



    @app.route('/api/user/delete', methods=['DELETE'])
    @jwt_required()
    @token_required
    def delete_user():
        try:
            userId = g.userId
            data = request.get_json()
            password = data['password']

            with conn.cursor() as cur:
                cur.execute(
                    '''SELECT password FROM users WHERE id = %s''',
                    (userId,)
                )
                user = cur.fetchone()
                if not user:
                    return jsonify({'message': 'Invalid user credentials'}), 401
                elif bcrypt.checkpw(password.encode('utf-8'), user[0].encode('utf-8')):
                    delete_with_dfs(conn, userId)  # Use the imported function with its new name
                    return jsonify({'message': 'User deleted successfully'}), 200
                else:
                    return jsonify({'message': 'Invalid user credentials'}), 401
        except Exception as e:
            conn.rollback()
            raise
