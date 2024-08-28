
from datetime import datetime
import os
import sys
from flask import Blueprint, g, jsonify, request
from flask_jwt_extended import jwt_required

from modules.universal import BaseNote
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), os.path.pardir)))
from formsValidation import  GoalSchema
from utils.utils import token_required, verify_milestone_ownership, verify_goal_ownership
import psycopg2.extras

class GoalApi(BaseNote):
    def __init__(self, app, conn, tokenization_manager, recents_manager):
        super().__init__(app, conn, tokenization_manager, recents_manager)
        self.goal_schema = GoalSchema()
        self.goal_routes()

    def tokenize(self,noteId,title,content,milestones):
        text = [title, content] + [milestone['description'] for milestone in milestones] if milestones else [title, content]
        priority = sum(len(string) for string in text)
        self.tokenization_manager.add_note(
            text=text,
            priority=priority,
            note_id=noteId
            )

    def goal_routes(self):

    #GOALS MODULE
        @self.app.route('/api/goals/create', methods=['POST'])
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

                with self.conn.cursor(cursor_factory=psycopg2.extras.DictCursor) as cur:

                    noteId = self.create_note(cur, userId, title, content, 'goal', tags)

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

                    self.conn.commit()

                self.tokenize(noteId,title,content,milestones)

                return jsonify({
                    'message': 'Goal created successfully',
                    'data': {
                        'noteid': noteId,
                        'goalid': goalId,
                        'milestones': new_milestones
                    }
                }), 200

            except Exception as e:
                self.conn.rollback()
                raise

        @self.app.route('/api/goals/previews', methods=['GET'])
        @jwt_required()
        @token_required
        def get_goal_previews():
            try:
                userId = str(g.userId)  # Convert userId to string if it is a UUID
                # Pagination
                page = int(request.args.get('page', 1))  # Default to page 1
                per_page = int(request.args.get('per_page', 5))  # Default to 5 items per page
                offset = (page - 1) * per_page

                with self.conn.cursor(cursor_factory=psycopg2.extras.DictCursor) as cur:

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
                    self.conn.commit()
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
                self.conn.rollback()
                print(f"An error occurred: {e}")
                raise
            finally:
                cur.close()

        @self.app.route('/api/goal', methods=['GET'])
        @jwt_required()
        @token_required
        def get_goal():
            try:
                userId = g.userId
                noteid = request.args.get('noteId')

                with self.conn.cursor(cursor_factory=psycopg2.extras.DictCursor) as cur:

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
                            tag = row['tagid']
                            goal['tags'].append(tag)
                            tag_ids.add(row['tagid'])


                self.conn.commit()
                self.recents_manager.add_note_for_user(userId, noteid)

                return jsonify({"goal": goal, 'message': "Goal fetched successfully"}), 200

            except Exception as e:
                self.conn.rollback()
                print(f"An error occurred: {e}")
                raise

            finally:
                cur.close()

        @self.app.route('/api/goals/milestone/complete', methods=['PUT'])
        @jwt_required()
        @token_required
        def complete_milestone():
            try:
                userId = g.userId
                data = request.get_json()
                milestone_id = data['milestoneid']

                with self.conn.cursor(cursor_factory=psycopg2.extras.DictCursor) as cur:
                    if not verify_milestone_ownership(userId, milestone_id, cur):
                        return jsonify({'message': 'You do not have permission to update this milestone'}), 403

                    cur.execute("""
                        UPDATE Milestones
                        SET completed = NOT completed
                        WHERE id = %s
                    """, (milestone_id,))
                    self.conn.commit()
                    return jsonify({'message': 'Milestone toggled successfully'}), 200

            except Exception as e:
                self.conn.rollback()
                print(f"An error occurred: {e}")
                raise


        @self.app.route('/api/goals/update', methods=['PUT'])
        @jwt_required()
        @token_required
        def update_goal():
            try:
                user_id = str(g.userId)

                data = self.goal_schema.load(request.get_json())

                note_id = str(data['noteid'])  # Convert UUID to string
                goal_id = str(data['goalid'])
                title = data['title']
                content = data['content']
                due_date = data.get('due_date')
                tags = data['tags']
                milestones = data['milestones']

                with self.conn.cursor(cursor_factory=psycopg2.extras.DictCursor) as cur:

                    # if not verify_goal_ownership(user_id, goal_id, cur):
                    #     return jsonify({'message': 'You do not have permission to update this goal'}), 403

                    cur.execute("""
                        UPDATE Notes
                        SET title = %s, content = %s
                        WHERE id = %s AND user_id = %s
                    """, (title, content, note_id, user_id))

                    cur.execute("""
                        UPDATE Goals
                        SET due_date = %s
                        WHERE note_id = %s
                    """, (due_date, note_id))

                    cur.execute("DELETE FROM NoteTags WHERE note_id = %s", (note_id,))
                    for tag_id in tags:
                        cur.execute("""
                            INSERT INTO NoteTags (note_id, tag_id)
                            VALUES (%s, %s)
                        """, (note_id, str(tag_id)))  # Convert UUID to string if tag_id is a UUID

                    for milestone in milestones:  # would not work if new milestone is resaved
                        milestone_id = milestone.get('milestoneid')
                        description = milestone['description']
                        completed = milestone['completed']
                        index = milestone['index']

                        if milestone_id:
                            cur.execute("""
                                UPDATE Milestones
                                SET description = %s, completed = %s, ms_index = %s
                                WHERE id = %s
                            """, (description, completed, index, str(milestone_id)))
                        else:
                            cur.execute("""
                                INSERT INTO Milestones (goal_id, description, completed, ms_index)
                                VALUES (%s, %s, %s, %s)
                                RETURNING id
                            """, (goal_id, description, completed, index))

                    self.conn.commit()
                    self.tokenize(note_id, title, content, milestones)

                    return jsonify({'message': 'Goal updated successfully'}), 200

            except Exception as e:
                self.conn.rollback()
                print(f"An error occurred: {e}")
                raise

            finally:
                if 'cur' in locals():  # Check if 'cur' is defined
                    cur.close()

        @self.app.route('/api/goals/delete', methods=['DELETE'])
        @jwt_required()
        @token_required
        def delete_goal():
            userId = g.userId
            note_id = request.args.get('noteid')
            goal_id = request.args.get('goalid')

            try:
                cur = self.conn.cursor(cursor_factory = psycopg2.extras.DictCursor)

                # FIXME: This is not working
                if not verify_goal_ownership(userId, goal_id, cur):
                    return jsonify({'message': 'You do not have permission to update this goal'}), 403

                # Use a transaction to ensure all deletions are successful or none are
                with self.conn:
                    cur.execute("DELETE FROM Milestones WHERE goal_id = %s", (goal_id,))
                    cur.execute("DELETE FROM Goals WHERE id = %s", (goal_id,))
                    cur.execute("DELETE FROM NoteTags WHERE note_id = %s", (note_id,))
                    cur.execute("DELETE FROM Notes WHERE id = %s", (note_id,))
                    self.conn.commit()

                self.tokenization_manager.delete_note_by_id(note_id)
                return jsonify({'message': 'Goal deleted successfully'}), 200
            except Exception as e:
                self.conn.rollback()
                raise
            finally:
                cur.close()