
from datetime import datetime
from flask import Blueprint, g, jsonify, request
from flask_jwt_extended import jwt_required
from MySQLdb.cursors import DictCursor
from formsValidation import GoalCreateSchema, GoalUpdateSchema
from utils import token_required, verify_milestone_ownership, verify_goal_ownership


def goal_routes(app, mysql):

    #GOALS MODULE
#GOALS MODULE
    @app.route('/api/goals/create', methods=['POST'])
    @jwt_required()
    @token_required
    def create_goal():
        userId = g.userId

        goal_schema = GoalCreateSchema()
        data = goal_schema.load(request.get_json())
        
        try:

            title = data['title']
            content = data['content']
            tags = data['tags']
            milestones= data['milestones']
            due_date = data.get('due_date')
            

            cur = mysql.connection.cursor()

            if due_date is not None:
                due_date = datetime.fromisoformat(due_date.rstrip("Z"))


            cur.execute(
                "INSERT INTO Notes (user_id, title, content, type) VALUES (%s, %s, %s, %s)",
                (userId, title, content, 'goal')
            )

            cur.execute("SELECT LAST_INSERT_ID()")
            noteId = cur.fetchone()[0]

            cur.execute(
                "INSERT INTO Goals (note_id, due_date) VALUES (%s, %s)",
                (noteId, due_date,)
            )
            cur.execute("SELECT LAST_INSERT_ID()")
            goalId = cur.fetchone()[0]

            if len(milestones)>0:
                for milestone in milestones:
                    cur.execute(
                        "INSERT INTO Milestones (goal_id, description, completed, ms_index) VALUES (%s, %s, %s, %s)",
                        (goalId, milestone['description'], False, milestone['index'])
                    )

            if len(tags)>0:
                for tagId in tags:
                    cur.execute(
                        "INSERT INTO NoteTags (note_id, tag_id) VALUES (%s, %s)",
                        (noteId, tagId)
                    )
           
            mysql.connection.commit()
            return jsonify({'message': 'Task created successfully', 'data' : {'noteId': noteId, 'goalId': goalId}}), 200
        except Exception as e:
            mysql.connection.rollback()
            raise

    @app.route('/api/goals/previews', methods=['GET'])
    @jwt_required()
    @token_required
    def get_goal_previews():
        userId = g.userId
        try:
            # Pagination
            page = int(request.args.get('page', 1))  # Default to page 1
            per_page = int(request.args.get('per_page', 10))  # Default to 10 items per page
            offset = (page - 1) * per_page

            cur = mysql.connection.cursor(cursorclass=DictCursor)

            # Fetch the total count of goals for pagination metadata
            cur.execute(""" 
                SELECT COUNT(DISTINCT n.id) AS total
                FROM Notes n
                WHERE n.user_id = %s AND n.type = 'goal'
            """, (userId,))
            total = cur.fetchone()['total']

            query = """ 
                SELECT 
                    n.id AS note_id, 
                    n.title AS title, 
                    n.content AS content, 
                    g.id AS goal_id, 
                    g.due_date AS due_date,
                    m.id AS milestone_id, 
                    m.description AS description, 
                    m.completed AS completed, 
                    m.ms_index AS ms_index,
                    tg.id AS tagid, 
                    tg.name AS tag_name, 
                    tg.color AS tag_color
                FROM Notes n
                LEFT JOIN Goals g ON n.id = g.note_id
                LEFT JOIN Milestones m ON g.id = m.goal_id
                LEFT JOIN NoteTags nt ON n.id = nt.note_id
                LEFT JOIN Tags tg ON nt.tag_id = tg.id
                WHERE n.user_id = %s AND n.type = 'goal'
                ORDER BY n.created_at DESC
                LIMIT %s OFFSET %s
            """

            cur.execute(query, (userId, per_page, offset))
            rows = cur.fetchall()

            goals = {}
            for row in rows:
                note_id = row['note_id']
                if note_id not in goals:
                    goals[note_id] = {
                        'noteid': row['note_id'],
                        'goalid': row['goal_id'],
                        'title': row['title'][:50] + '...' if len(row['title']) > 50 else row['title'],
                        'content': row['content'][:100] + '...' if len(row['content']) > 100 else row['content'],
                        'due_date': row['due_date'].isoformat() if row['due_date'] else None,
                        'tags': [],
                        'milestones': []
                    }

                if row['milestone_id'] is not None:
                    milestone = {
                        'milestoneid': row['milestone_id'],
                        'description': row['description'][:100] + '...' if len(row['description']) > 100 else row['description'],
                        'completed': row['completed'] == 1,
                        'index': row['ms_index']
                    }
                    goals[note_id]['milestones'].append(milestone)

                if row['tagid'] is not None:
                    tag = {
                        'tagid': row['tagid'],
                        'name': row['tag_name'],
                        'color': row['tag_color']
                    }
                    if tag not in goals[note_id]['tags']:
                        goals[note_id]['tags'].append(tag)

            goals_list = [value for key, value in goals.items()]
            mysql.connection.commit()
            nextPage = page + 1 if (offset + per_page) < total else None

            return jsonify({"goals": goals_list, 'nextPage': nextPage, 'message': "Goals fetched successfully"}), 200
        except Exception as e:
            mysql.connection.rollback()
            print(f"An error occurred: {e}")  
            raise
        finally:
            cur.close()

    @app.route('/api/goal', methods=['GET'])
    @jwt_required()
    @token_required
    def get_goal():
        userId = g.userId
        try:
            noteid=request.args.get('noteId')
            cur = mysql.connection.cursor(cursorclass=DictCursor)

            query = """ 
                SELECT 
                    n.id AS note_id, 
                    n.title AS title, 
                    n.content AS content, 
                    g.id AS goal_id, 
                    g.due_date AS due_date,
                    m.id AS milestone_id, 
                    m.description AS description, 
                    m.completed AS completed, 
                    m.ms_index AS ms_index,
                    tg.id AS tagid, 
                    tg.name AS tag_name, 
                    tg.color AS tag_color
                FROM Notes n
                LEFT JOIN Goals g ON n.id = g.note_id
                LEFT JOIN Milestones m ON g.id = m.goal_id
                LEFT JOIN NoteTags nt ON n.id = nt.note_id
                LEFT JOIN Tags tg ON nt.tag_id = tg.id
                WHERE n.user_id = %s AND n.type = 'goal' AND n.id = %s
            """

            cur.execute(query, (userId, noteid))
            rows = cur.fetchall()

            goal = None
            for row in rows:
                if goal is None:
                    goal = {
                        'noteid': row['note_id'],
                        'goalid': row['goal_id'],
                        'title': row['title'],
                        'content': row['content'],
                        'due_date': (row['due_date'].isoformat()) if row['due_date'] else None,
                        'tags': [],
                        'milestones': []
                    }

                if row['milestone_id'] is not None:
                    milestone = {
                        'milestoneid': row['milestone_id'],
                        'description': row['description'],
                        'completed': row['completed'] == 1,
                        'index': row['ms_index']
                    }
                    goal['milestones'].append(milestone)

                if row['tagid'] is not None:
                    tag = {
                        'tagid': row['tagid'],
                        'name': row['tag_name'],
                        'color': row['tag_color']
                    }
                    if tag not in goal['tags']:
                        goal['tags'].append(tag)

            mysql.connection.commit()

            if goal:
                return jsonify({"goal": goal, 'message': "Goal fetched successfully"}), 200
            else:
                return jsonify({'message': "Goal not found"}), 404
        except Exception as e:
            mysql.connection.rollback()
            print(f"An error occurred: {e}")  
            raise
        finally:
            cur.close()

    @app.route('/api/goals/milestone/complete', methods=['PUT'])
    @jwt_required()
    @token_required   
    def complete_milestone():
        userId = g.userId
        try:
            cur = mysql.connection.cursor(cursorclass=DictCursor)
            data = request.get_json()
            milestone_id = data['milestoneid']
            goal_id = data['goalid']

            if not verify_milestone_ownership(userId, milestone_id, cur):
                return jsonify({'message': 'You do not have permission to update this milestone'}), 403
            
            cur.execute("""UPDATE Milestones SET completed = CASE 
                                            WHEN completed = 1 THEN 0 
                                            ELSE 1 
                                        END  = TRUE WHERE id = %s""", (milestone_id,))
            mysql.connection.commit()
            return jsonify({'message': 'Milestone toggled successfully'}), 200
        except Exception as e:
            mysql.connection.rollback()
            print(f"An error occurred: {e}")  
            raise
        finally:
            cur.close()

    @app.route('/api/goals/update', methods=['PUT'])  
    @jwt_required()
    @token_required
    def update_goal():
        userId = g.userId

        goal_schema = GoalUpdateSchema()
        data = goal_schema.load(request.get_json())

        cur = mysql.connection.cursor(cursorclass=DictCursor)
        try:
            note_id = data['noteid']
            goal_id = data['goalid']
            due_date = data.get('due_date')

            if verify_goal_ownership(userId, goal_id, cur) == False:
                return jsonify({'message': 'You do not have permission to update this goal'}), 403

            query = """
                    UPDATE Notes
                    SET title = %s, content = %s
                    WHERE id = %s AND user_id = %s
                    """
            cur.execute(query, (data['title'], data['content'], note_id, userId))

            if due_date is not None:
                parsed_date = datetime.strptime(due_date, "%Y-%m-%dT%H:%M:%S.%fZ")
                formatted_date = parsed_date.strftime("%Y-%m-%d")
                cur.execute(
                    "UPDATE Goals SET due_date = %s WHERE note_id = %s",
                    (formatted_date, note_id)
                )
            else:
                cur.execute(
                    "UPDATE Goals SET due_date = NULL WHERE note_id = %s",
                    (note_id,)
                )


            cur.execute("DELETE FROM NoteTags WHERE note_id = %s", (note_id,))
            for tagId in data['tags']:
                cur.execute(
                    "INSERT INTO NoteTags (note_id, tag_id) VALUES (%s, %s)",
                    (note_id, tagId)
                )
            
            if data.get('milestones') is not None:
                for milestone in data['milestones']:
                    cur.execute(
                        "UPDATE Milestones SET description=%s, completed=%s, ms_index=%s WHERE id = %s",
                        (milestone['description'], milestone['completed'], milestone['index'], milestone['milestoneid'])
                    )
            
            mysql.connection.commit()
            return jsonify({'message': 'Goal updated successfully'}), 200
        except Exception as e:
            mysql.connection.rollback()
            raise
        finally:
            cur.close()

    @app.route('/api/goals/delete', methods=['DELETE'])
    @jwt_required()
    @token_required
    def delete_goal():
        userId = g.userId
        cur = mysql.connection.cursor(cursorclass=DictCursor)
        try:
            note_id =request.args.get('noteid')
            goal_id =request.args.get('goalid')

            if verify_goal_ownership(userId, goal_id, cur) == False:
                return jsonify({'message': 'You do not have permission to update this goal'}), 403
            
            cur.execute("DELETE FROM Milestones WHERE goal_id = %s", (goal_id,))
            cur.execute("DELETE FROM Goals WHERE id = %s", (goal_id,))
            cur.execute("DELETE FROM Notes WHERE id = %s", (note_id,))
            cur.execute("DELETE FROM NoteTags WHERE note_id = %s", (note_id,))
                        
            mysql.connection.commit()
            return jsonify({'message': 'Goal deleted successfully'}), 200
        except Exception as e:
            if mysql.connection:
                mysql.connection.rollback()
            raise
        finally:
            cur.close()