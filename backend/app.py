from flask import Flask, g, jsonify, request
from flask_cors import CORS
from flask_jwt_extended import JWTManager, jwt_required
import jwt
import psycopg2 
from config import Config
from modules.archive import archive_routes
from modules.habits import habit_routes
from modules.tasks import task_routes
from modules.goals import goal_routes
from modules.tags import tag_routes
from modules.users import user_routes
from utils import token_required
from word2vec import combine_strings_to_vector, load_or_train_model


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

# Load or train the tokenization model when the Flask app starts
model = load_or_train_model()

task_routes(app, conn, model)
habit_routes(app, conn, model)
goal_routes(app,  conn, model)
tag_routes(app, conn, model) 
user_routes(app, conn)
archive_routes(app, conn, model)

@app.route('/api/search', methods=['GET'])
@jwt_required()
@token_required
def search():
    try:
        userId = g.userId
        cur = conn.cursor(cursor_factory=psycopg2.extras.DictCursor)
        search_query = request.args.get('searchQuery')
        search_mode = request.args.get('searchMode')

        if search_mode == "approximate":
            query_vector = combine_strings_to_vector([search_query], model)

            cur.execute("""
                SELECT n.id AS note_id, n.title, n.content, n.type, 
                t.id AS tagid, 
                t.name, 
                t.color, 
                cosine_similarity(n.vector, %s) as similarity 
                FROM Notes n
                LEFT JOIN NoteTags nt ON n.id = nt.note_id
                LEFT JOIN Tags t ON nt.tag_id = t.id
                WHERE n.user_id = %s AND n.archived = FALSE AND n.vector IS NOT NULL
                ORDER BY similarity DESC
                LIMIT 5;
            """, (query_vector, userId,))
            
        else :
            cur.execute(
                """
                SELECT n.id AS note_id, n.title, n.content, n.type, 
                t.id AS tagid, 
                t.name, 
                t.color
                FROM Notes n
                LEFT JOIN NoteTags nt ON n.id = nt.note_id
                LEFT JOIN Tags t ON nt.tag_id = t.id
                WHERE n.user_id = %s AND n.archived = FALSE
                AND (n.title ILIKE %s OR n.content ILIKE %s)""",
                (userId, f"%{search_query}%", f"%{search_query}%"))
            
        rows = cur.fetchall()    

        notes_dict = {}
        for row in rows:
            note_id = row['note_id']
            if note_id not in notes_dict:
                notes_dict[note_id] = {
                    'noteid': note_id,
                    'title': row['title'][:50] + '...' if len(row['title']) > 50 else row['title'],
                    'content': row['content'][:100] + '...' if len(row['content']) > 100 else row['content'],
                    'type': row['type'],
                    'tags': []
                }
            if row['tagid']:
                notes_dict[note_id]['tags'].append({
                    'tagid': row['tagid'],
                    'name': row['name'],
                    'color': row['color']
                })

            # Fetch the secondary ID based on the type
            for note in notes_dict.values():
                if note['type'] == 'task':
                    cur.execute("SELECT id AS taskid FROM Tasks WHERE note_id = %s", (note['noteid'],))
                    secondary_id = cur.fetchone()
                    note['secondaryid'] = secondary_id['taskid'] if secondary_id else None
                elif note['type'] == 'habit':
                    cur.execute("SELECT id AS habitid FROM Habits WHERE note_id = %s", (note['noteid'],))
                    secondary_id = cur.fetchone()
                    note['secondaryid'] = secondary_id['habitid'] if secondary_id else None
                elif note['type'] == 'goal':
                    cur.execute("SELECT id AS goalid FROM Goals WHERE note_id = %s", (note['noteid'],))
                    secondary_id = cur.fetchone()
                    note['secondaryid'] = secondary_id['goalid'] if secondary_id else None
                # Add any other types here

        notes = list(notes_dict.values())

        return jsonify({'message': 'Archived notes retrieved successfully', 'data': notes, 
                        # 'pagination': {
                        #         'total': total,
                        #         'page': page,
                        #         'perPage': per_page,
                        #         'nextPage': next_page
                        #     }
                        }), 200
    except Exception as e:
        conn.rollback()
        print(f"An error occurred: {e}") 
        return jsonify({'message': 'An error occurred', 'error': str(e)}), 500
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