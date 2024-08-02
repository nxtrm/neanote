from flask import Flask, g, jsonify, request
from flask_cors import CORS
from flask_jwt_extended import JWTManager, jwt_required
import jwt
import psycopg2 
from config import Config
from modules.habits import habit_routes
from modules.tasks import task_routes
from modules.goals import goal_routes
from modules.tags import tag_routes
from modules.users import user_routes
from utils import token_required


app = Flask(__name__)
app.config.from_object(Config)

CORS(app, resources={r"/api/*": {"origins": ["http://localhost:5173"]}} , supports_credentials=True)
jwt = JWTManager(app)

conn = psycopg2.connect(
    host="localhost",
    database=Config.database,
    user=Config.user,
    password=Config.password,
    port=Config.port

)

# limiter = Limiter( 
#     get_remote_address,
#     app=app,
#     default_limits=["500 per day", "100 per hour"]  # Default rate limit for all routes
# )


task_routes(app, conn)
habit_routes(app, conn)
goal_routes(app,  conn)
tag_routes(app, conn) 
user_routes(app, conn)

# UNIVERSAL ROUTES
@app.route('/api/notes/archive', methods=['PUT'])
@jwt_required()
@token_required
def archive():
    try:
        userId = g.userId
        cur = conn.cursor()
        note_id = request.args.get('noteid')
        cur.execute(
            "UPDATE Notes SET archived = TRUE WHERE id = %s AND user_id = %s", #fix this not setting the note as archived
            (note_id, userId)
        )
        conn.commit()
        return jsonify({'message': 'Note archived successfully', 'data': None}), 200
    except Exception as e:
        conn.rollback()
        raise
    finally:
        cur.close()


#Centralized error handler
@app.errorhandler(Exception)
def handle_exception(error):
    # Handle specific exceptions or return a generic response
    return jsonify({'message': 'An error occurred', 'details': str(error)}), 500

@app.errorhandler(429)
def ratelimit_handler(e):
    return jsonify({'message': 'An error occurred', 'details' : "Rate limit exceeded"}), 429

if __name__ == '__main__':
    app.run(debug=True, port=5000)