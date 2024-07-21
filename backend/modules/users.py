from datetime import datetime, timedelta
from flask import Blueprint, g, jsonify, request
from flask_jwt_extended import create_access_token, jwt_required
from MySQLdb.cursors import DictCursor
from marshmallow import ValidationError
from formsValidation import LoginSchema, TagSchema, UserSchema
from utils import token_required, verify_tag_ownership

def user_routes(app,mysql):
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