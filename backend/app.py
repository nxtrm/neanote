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

CORS(app, resources={r"/api/*": {"origins": ["http://localhost:5173"]}} , supports_credentials=True)
mysql = MySQL(app)
jwt = JWTManager(app)

#Registering routes
register_routes(app, mysql, jwt)

#Centralized error handler
@app.errorhandler(Exception)
def handle_exception(error):
    # Handle specific exceptions or return a generic response
    return jsonify({'message': 'An error occurred', 'details': str(error)}), 500

if __name__ == '__main__':
    app.run(debug=True, port=5000)