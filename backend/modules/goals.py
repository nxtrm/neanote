
from datetime import datetime
from flask import Blueprint, g, jsonify, request
from flask_jwt_extended import jwt_required
from formsValidation import  GoalSchema
from utils import token_required, verify_milestone_ownership, verify_goal_ownership
import psycopg2.extras


def goal_routes(app, conn):

#GOALS MODULE
    @app.route('/api/goals/create', methods=['POST'])
    @jwt_required()
    @token_required
    def create_goal():
        try:
            userId = str(g.userId)  # Convert userId to string if it is a UUID

            goal_schema = GoalSchema()
            data = goal_schema.load(request.get_json())

            title = data['title']
            content = data['content']
            tags = data['tags']
            milestones = data['milestones']
            due_date = data.get('due_date')

            cur = conn.cursor(cursor_factory=psycopg2.extras.DictCursor)

            cur.execute(
                """
                INSERT INTO Notes (user_id, title, content, type)
                VALUES (%s, %s, %s, %s) RETURNING id
                """,
                (userId, title, content, 'goal')
            )
            noteId = cur.fetchone()[0]

            cur.execute(
                """
                INSERT INTO Goals (note_id, due_date)
                VALUES (%s, %s) RETURNING id
                """,
                (noteId, due_date)
            )
            goalId = cur.fetchone()[0]

            new_milestones = None

            if milestones:
                milestone_tuples = [
                    (goalId, milestone['description'], False, milestone['index'])
                    for milestone in milestones
                ]
                cur.executemany(
                    """
                    INSERT INTO Milestones (goal_id, description, completed, ms_index)
                    VALUES (%s, %s, %s, %s)
                    RETURNING id, goal_id, description, completed, ms_index
                    """,
                    milestone_tuples
                )
                cur.execute(
                    """
                    SELECT id, goal_id, description, completed, ms_index
                    FROM Milestones
                    WHERE goal_id = %s
                    """,
                    (goalId,)
                )

                new_milestones = cur.fetchall()

            if tags:
                tag_tuples = [(noteId, tagId) for tagId in tags]
                cur.executemany(
                    """
                    INSERT INTO NoteTags (note_id, tag_id)
                    VALUES (%s, %s)
                    """,
                    tag_tuples
                )

            conn.commit()

            return jsonify({
                'message': 'Goal created successfully',
                'data': {
                    'noteId': noteId,
                    'goalId': goalId,
                    'milestones': new_milestones  
                }
            }), 200

        except Exception as e:
            conn.rollback()
            raise

    @app.route('/api/goals/previews', methods=['GET'])
    @jwt_required()
    @token_required
    def get_goal_previews():
        try:
            userId = str(g.userId)  # Convert userId to string if it is a UUID
            # Pagination
            page = int(request.args.get('page', 1))  # Default to page 1
            per_page = int(request.args.get('per_page', 1))  # Default to 10 items per page
            offset = (page - 1) * per_page

            cur = conn.cursor(cursor_factory=psycopg2.extras.DictCursor)

            # Fetch the total count of goals for pagination metadata
            cur.execute(""" 
                SELECT COUNT(DISTINCT n.id) AS total
                FROM Notes n
                WHERE n.user_id = %s AND n.type = 'goal' AND n.archived = FALSE
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
                WHERE n.user_id = %s AND n.type = 'goal' AND n.archived = FALSE
                ORDER BY n.created_at DESC
                LIMIT %s OFFSET %s
            """

            cur.execute(query, (userId, per_page
                                , offset
                                ))
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
            conn.commit()
            nextPage = page + 1 if (offset + per_page) < total else None

            return jsonify({"goals": goals_list, 
                            'pagination': {
                                    'total': total,
                                    'page': page,
                                    'perPage': per_page,
                                    'nextPage': nextPage
                                }, 
                            'message': "Goals fetched successfully"}), 200
        except Exception as e:
            conn.rollback()
            print(f"An error occurred: {e}")  
            raise
        finally:
            cur.close()

    @app.route('/api/goal', methods=['GET'])
    @jwt_required()
    @token_required
    def get_goal():
        try:
            userId = g.userId
            noteid = request.args.get('noteId')
            
            cur = conn.cursor(cursor_factory=psycopg2.extras.DictCursor)

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
                WHERE n.user_id = %s AND n.type = 'goal' AND n.id = %s AND n.archived = FALSE
            """

            cur.execute(query, (userId, noteid))
            rows = cur.fetchall()

            if not rows:
                return jsonify({'message': "Goal not found"}), 404

            goal = {
                'noteid': rows[0]['note_id'],
                'goalid': rows[0]['goal_id'],
                'title': rows[0]['title'],
                'content': rows[0]['content'],
                'due_date': rows[0]['due_date'].isoformat() if rows[0]['due_date'] else None,
                'tags': [],
                'milestones': []
            }
            milestone_ids = set()
            tag_ids = set()

            for row in rows:
                if row['milestone_id'] is not None and row['milestone_id'] not in milestone_ids:
                    milestone = {
                        'milestoneid': row['milestone_id'],
                        'description': row['description'],
                        'completed': row['completed'],
                        'index': row['ms_index']
                    }
                    goal['milestones'].append(milestone)
                    milestone_ids.add(row['milestone_id'])

                if row['tagid'] is not None and row['tagid'] not in tag_ids:
                    tag = {
                        'tagid': row['tagid'],
                        'name': row['tag_name'],
                        'color': row['tag_color']
                    }
                    goal['tags'].append(tag)
                    tag_ids.add(row['tagid'])


            conn.commit()

            return jsonify({"goal": goal, 'message': "Goal fetched successfully"}), 200

        except Exception as e:
            conn.rollback()
            print(f"An error occurred: {e}")
            raise

        finally:
            cur.close()

    @app.route('/api/goals/milestone/complete', methods=['PUT'])
    @jwt_required()
    @token_required   
    def complete_milestone():
        try:
            userId = g.userId
            data = request.get_json()
            milestone_id = data['milestoneid']

            with conn.cursor(cursor_factory=psycopg2.extras.DictCursor) as cur:
                if not verify_milestone_ownership(userId, milestone_id, cur):
                    return jsonify({'message': 'You do not have permission to update this milestone'}), 403

                cur.execute("""
                    UPDATE Milestones 
                    SET completed = NOT completed
                    WHERE id = %s
                """, (milestone_id,))
                conn.commit()
                return jsonify({'message': 'Milestone toggled successfully'}), 200

        except Exception as e:
            conn.rollback()
            print(f"An error occurred: {e}")
            raise


    @app.route('/api/goals/update', methods=['PUT'])
    @jwt_required()
    @token_required
    def update_goal():
        try:
            userId = str(g.userId)  # Convert UUID to string if g.userId is a UUID

            goal_schema = GoalSchema()
            data = goal_schema.load(request.get_json())

            note_id = str(data['noteid'])  # Convert UUID to string
            goal_id = str(data['goalid'])  # Convert UUID to string
            due_date = data.get('due_date')

            with conn.cursor(cursor_factory=psycopg2.extras.DictCursor) as cur:

                if not verify_goal_ownership(userId, goal_id, cur):
                    return jsonify({'message': 'You do not have permission to update this goal'}), 403

                cur.execute("""
                    UPDATE Notes
                    SET title = %s, content = %s
                    WHERE id = %s AND user_id = %s
                """, (data['title'], data['content'], str(note_id), str(userId)))

                cur.execute("""
                        UPDATE Goals 
                        SET due_date = %s 
                        WHERE note_id = %s
                    """, (due_date, note_id))

                cur.execute("DELETE FROM NoteTags WHERE note_id = %s", (str(note_id),))

                for tag_id in data['tags']:
                    cur.execute("""
                        INSERT INTO NoteTags (note_id, tag_id) 
                        VALUES (%s, %s)
                    """, (note_id, str(tag_id)))  # Convert UUID to string if tag_id is a UUID

                
                for milestone in data['milestones']: #would not work if new milestone is resaved
                    if milestone.get('milestoneid'):
                        cur.execute("""
                            UPDATE Milestones
                            SET description = %s, completed = %s, ms_index = %s
                            WHERE id = %s
                        """, (milestone['description'], milestone['completed'], milestone['index'], str(milestone['milestoneid'])))

                    else:
                        cur.execute("""
                            INSERT INTO Milestones (goal_id, description, completed, ms_index)
                            VALUES (%s, %s, %s, %s)
                            RETURNING id
                        """, (goal_id, milestone['description'], milestone['completed'], milestone['index']))
                        new_milestone_id = cur.fetchone()[0]
                        conn.commit()
                
                return jsonify({'message': 'Goal updated successfully'}), 200

        except Exception as e:
            conn.rollback()
            print(f"An error occurred: {e}")
            raise

        finally:
            if 'cur' in locals():  # Check if 'cur' is defined
                cur.close()

    @app.route('/api/goals/delete', methods=['DELETE'])
    @jwt_required()
    @token_required
    def delete_goal():
        userId = g.userId
        note_id = request.args.get('noteid')
        goal_id = request.args.get('goalid')

        # Initialize cursor outside of try block to ensure it's defined for the finally block
        cur = None
        try:
            cur = conn.cursor(cursor_factory = psycopg2.extras.DictCursor)

            # FIXME: This is not working
            if not verify_goal_ownership(userId, goal_id, cur):
                return jsonify({'message': 'You do not have permission to update this goal'}), 403

            # Use a transaction to ensure all deletions are successful or none are
            with conn:
                cur.execute("DELETE FROM Milestones WHERE goal_id = %s", (goal_id,))
                cur.execute("DELETE FROM Goals WHERE id = %s", (goal_id,))
                cur.execute("DELETE FROM NoteTags WHERE note_id = %s", (note_id,))
                cur.execute("DELETE FROM Notes WHERE id = %s", (note_id,))

            return jsonify({'message': 'Goal deleted successfully'}), 200
        except Exception as e:
            # Log the exception e
            conn.rollback()
            raise
        finally:
            if cur:
                cur.close()