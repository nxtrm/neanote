from flask import Flask, jsonify, request
from flask_cors import CORS
from flask_jwt_extended import JWTManager, create_access_token
from flask_mysqldb import MySQL
from datetime import datetime
from MySQLdb.cursors import DictCursor
import jwt
from config import Config
from routes import register_routes
  
app = Flask(__name__)
app.config.from_object(Config)

CORS(app, resources={r"/*": {"origins": "*"}}, supports_credentials=True)
mysql = MySQL(app)
jwt = JWTManager(app)

#Registering routes
register_routes(app)


if __name__ == '__main__':
    app.run(debug=True)