from flask import Flask, g, jsonify, request
from flask_cors import CORS
from flask_jwt_extended import JWTManager, jwt_required
import jwt
import psycopg2
from config import Config
from modules.archive import archive_routes
from modules.habits import HabitApi
from modules.notes import NoteApi
from utils.priorityQueue import TokenizationTaskManager
from utils.recentsListHash import RecentNotesManager
from utils.word2vec import  load_or_train_model
from modules.universal import universal_routes
from modules.tasks import TaskApi
from modules.goals import GoalApi
from modules.tags import tag_routes
from modules.users import user_routes
import google.generativeai as genai
from modules.widgets import widget_routes

app = Flask(__name__)
app.config.from_object(Config)

CORS(app, resources={
    r"/api/*": {
        "origins": ["http://localhost:5173"],
        "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        "allow_headers": ["Content-Type", "Authorization"]
    }
}, supports_credentials=True)

jwt = JWTManager(app)
# genai.configure(api_key = Config.GEMINI_API_KEY)

conn = psycopg2.connect(
    host=Config.host,
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

# Load or train the tokenization model when the Flask app starts
model = load_or_train_model()
tokenization_manager = TokenizationTaskManager(Config,model)
#Initialize the recent notes manager
recents_manager = RecentNotesManager()

#Initialize routes
notes = NoteApi(app, conn, tokenization_manager, recents_manager)
tasks = TaskApi(app, conn, tokenization_manager, recents_manager)
habits = HabitApi(app, conn, tokenization_manager, recents_manager)
goals = GoalApi(app,  conn, tokenization_manager, recents_manager)

tag_routes(app, conn, tokenization_manager)
user_routes(app, conn)
archive_routes(app, conn, tokenization_manager)
widget_routes(app, conn)

universal_routes(app, conn, model, recents_manager) #small routes that do not require a separate file

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