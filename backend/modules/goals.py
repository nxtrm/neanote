
import os
import sys
from datetime import datetime

from flask import Blueprint, g, jsonify, request
from flask_jwt_extended import jwt_required

from modules.universal import BaseNote
from utils.userDeleteGraph import delete_user_data_with_backoff

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), os.path.pardir)))
import psycopg2.extras

from formsValidation import GoalSchema
from utils.utils import (token_required, verify_goal_ownership,
                         verify_milestone_ownership)


class GoalApi(BaseNote):
    def __init__(self, app, conn, tokenization_manager, recents_manager):
        super().__init__(app, conn, tokenization_manager, recents_manager)
        self.goal_schema = GoalSchema()
        self.goal_routes()
        self.milestones_cte = """MilestonesCTE AS (
                            SELECT
                                m.goal_id,
                                json_agg(json_build_object(
                                    'milestoneid', m.id,
                                    'description', m.description,
                                    'completed', m.completed,
                                    'index', m.ms_index
                                )) AS milestones
                            FROM Milestones m
                            GROUP BY m.goal_id
                        )"""

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
                    total, nextPage = self.fetch_total_notes(cur, 'goal', userId, page, offset, per_page)

                    query = f"""
                           WITH {self.milestones_cte},
                            {self.tags_cte}
                            SELECT
                                n.id AS note_id,
                                n.title AS title,
                                n.content AS content,
                                n.type AS type,
                                g.id AS goal_id,
                                g.due_date AS due_date,
                                COALESCE(milestones_cte.milestones, '[]') AS milestones,
                                COALESCE(tags_cte.tags, '[]') AS tags
                            FROM Notes n
                            LEFT JOIN Goals g ON n.id = g.note_id
                            LEFT JOIN MilestonesCTE milestones_cte ON g.id = milestones_cte.goal_id
                            LEFT JOIN TagsCTE tags_cte ON n.id = tags_cte.note_id
                            WHERE n.user_id = %s AND n.type = 'goal' AND n.archived = FALSE
                            ORDER BY n.created_at DESC
                            LIMIT %s OFFSET %s
                        """

                    cur.execute(query, (userId, per_page, offset))
                    rows = cur.fetchall()

                    goals = []
                    for row in rows:
                        goal = {
                            'noteid': row['note_id'],
                            'goalid': row['goal_id'],
                            'title': row['title'][:50] + '...' if len(row['title']) > 50 else row['title'],
                            'content': row['content'][:100] + '...' if len(row['content']) > 100 else row['content'],
                            'due_date': row['due_date'].isoformat() if row['due_date'] else None,
                            'tags': row['tags'],
                            'milestones': row['milestones']
                        }
                        goals.append(goal)

                    self.conn.commit()

                return jsonify({"goals": goals,
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

                    query = f"""
                        WITH {self.milestones_cte},
                        {self.tags_cte}
                        SELECT
                            n.id AS note_id,
                            n.title AS title,
                            n.content AS content,
                            g.id AS goal_id,
                            g.due_date AS due_date,
                            COALESCE(milestones_cte.milestones, '[]') AS milestones,
                            COALESCE(tags_cte.tags, '[]') AS tags
                        FROM Notes n
                        LEFT JOIN Goals g ON n.id = g.note_id
                        LEFT JOIN MilestonesCTE milestones_cte ON g.id = milestones_cte.goal_id
                        LEFT JOIN TagsCTE tags_cte ON n.id = tags_cte.note_id
                        WHERE n.user_id = %s AND n.type = 'goal' AND n.id = %s AND n.archived = FALSE
                    """

                    cur.execute(query, (userId, noteid))
                    row = cur.fetchone()

                    if not row:
                        return jsonify({'message': "Goal not found"}), 404

                    goal = {
                        'noteid': row['note_id'],
                        'goalid': row['goal_id'],
                        'title': row['title'],
                        'content': row['content'],
                        'due_date': row['due_date'].isoformat() if row['due_date'] else None,
                        'tags': row['tags'],
                        'milestones': row['milestones']
                    }


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
                    # Check if the milestone was the last one at this goal
                    cur.execute("""
                        WITH milestone_counts AS (
                            SELECT 
                                goal_id,
                                COUNT(*) FILTER (WHERE completed = TRUE) AS completed_milestones,
                                COUNT(*) AS total_milestones
                            FROM Milestones
                            WHERE goal_id = (SELECT goal_id FROM Milestones WHERE id = %s)
                            GROUP BY goal_id
                        )
                        UPDATE Goals
                        SET completion_timestamp = NOW()
                        WHERE id = (SELECT goal_id FROM Milestones WHERE id = %s)
                        AND (SELECT completed_milestones FROM milestone_counts) = (SELECT total_milestones FROM milestone_counts)
                    """, (milestone_id, milestone_id))

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
                tags = data.get('tags')
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

                    self.update_notetags(cur, note_id, tags)

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

                stack = [6, 5, 4, 12, 2]  # milestones, goalhistory, goals, notetags, notes
                stack.reverse()
                 # Use the delete_user_data_with_backoff function to delete related data
                if delete_user_data_with_backoff(self.conn, userId, stack):
                    self.tokenization_manager.delete_note_by_id(note_id)
                    return jsonify({'message': 'Goal deleted successfully'}), 200
                else:
                    return jsonify({'message': 'Failed to delete goal data after multiple retries'}), 500

                return jsonify({'message': 'Goal deleted successfully'}), 200
            except Exception as e:
                self.conn.rollback()
                raise
            finally:
                cur.close()