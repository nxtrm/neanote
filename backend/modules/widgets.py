from collections import defaultdict
from datetime import datetime, timedelta
import json
import bcrypt
from flask import Blueprint, g, jsonify, request
from flask_jwt_extended import create_access_token, jwt_required
from marshmallow import ValidationError
from psycopg2 import sql
import psycopg2

import os
import sys
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), os.path.pardir)))
from formsValidation import LoginSchema, TagSchema, UserSchema
from utils.utils import token_required, verify_tag_ownership

def widget_routes(app, conn):

    @app.route('/widgets', methods=['GET'])
    @jwt_required()
    def get_widgets():
        try:
            cur = conn.cursor()
            cur.execute('SELECT * FROM widgets WHERE user_id = %s', (g.user['id'],))
            widgets = cur.fetchall()
            cur.close()
            return jsonify(widgets)
        except psycopg2.Error as e:
            return jsonify({'error': str(e)}), 500

    @app.route('/api/user_widgets', methods=['GET'])
    @jwt_required()
    @token_required
    def get_user_widgets():
        try:
            user_id = g.userId
            cur = conn.cursor(cursor_factory=psycopg2.extras.DictCursor)

            cur.execute("""
                SELECT
                    w.id,
                    w.widget_id,
                    w.title,
                    w.data_source_type,
                    w.data_source_id,
                    w.configuration
                FROM user_widgets w
                WHERE w.user_id = %s
            """, (user_id,))
            widgets = cur.fetchall()

            # Convert the result to a list of dictionaries
            widgets = [dict(widget) for widget in widgets]

            for i in widgets:
                # Initialize source_data as an empty dictionary
                i['source_data'] = {}

                if i['widget_id'] == 'Number':
                    if i['data_source_type'] == 'habit':
                        cur.execute('SELECT streak FROM habits WHERE note_id = %s', (i['data_source_id'],))
                        streak = cur.fetchone()
                        if streak:
                            i['source_data']['streak'] = streak[0]
                elif i['widget_id'] == 'Progress':
                        # Fetch total milestones
                        cur.execute('SELECT COUNT(*) FROM milestones WHERE goal_id = %s', (i['data_source_id'],))
                        milestones = cur.fetchone()
                        if milestones:
                            i['source_data']['total_milestones'] = int(milestones[0])
                        else:
                            i['source_data']['total_milestones'] = 0

                        # Fetch completed milestones
                        cur.execute('''
                            SELECT COUNT(*)
                            FROM milestones m
                            JOIN goals g ON m.goal_id = g.id
                            WHERE g.note_id = %s AND m.completed = FALSE
                        ''', (i['data_source_id'],))
                        completedmilestones = cur.fetchone()
                        if completedmilestones:
                            i['source_data']['completed_milestones'] = int(completedmilestones[0])
                        else:
                            i['source_data']['completed_milestones'] = 0
                elif i['widget_id'] == 'HabitWeek':
                    cur.execute("""
                        SELECT completion_date
                        FROM habitcompletion
                        WHERE habit_id = %s AND completion_date >= %s
                        ORDER BY completion_date
                    """, (i['data_source_id'], datetime.now() - timedelta(days=7)))
                    completions = cur.fetchall()
                    habit_week = [False] * 7
                    for completion in completions:
                        day_index = (datetime.now() - completion['completion_date']).days
                        if 0 <= day_index < 7:
                            habit_week[day_index] = True
                    i['source_data']['weekly_completions'] = habit_week
                elif i['widget_id'] == 'Chart':
                    # Define mapping for different data sources
                    source_mapping = {
                        'task': ('tasks', 'completion_timestamp'),
                        'habit': ('habitcompletion', 'completion_date'),
                        'goal': ('goals', 'completion_timestamp')
                    }

                    if i['data_source_type'] in source_mapping:
                        table, date_column = source_mapping[i['data_source_type']]

                        query = f"""
                            SELECT t.{date_column}
                            FROM {table} t, notes n
                            WHERE t.note_id = n.id AND n.user_id = %s AND t.{date_column} IS NOT NULL
                            ORDER BY t.{date_column} DESC
                        """

                        cur.execute(query, (user_id,))
                        completions = cur.fetchall()

                        # Initialize a dictionary to store the counts
                        completion_counts = defaultdict(int)

                        # Get the current date and the date 6 months ago
                        current_date = datetime.now()
                        six_months_ago = current_date - timedelta(days=6*30)

                        # Process each completion timestamp
                        for completion in completions:
                            completion_date = completion[date_column]
                            if completion_date >= six_months_ago:
                                month_year = completion_date.strftime('%b %Y')
                                completion_counts[month_year] += 1

                        # Create the result array
                        result = []
                        for j in range(6):
                            month_date = current_date - timedelta(days=j*30)
                            month_year = month_date.strftime('%b %Y')
                            result.append({
                                'month': month_year,
                                'completed': completion_counts[month_year]
                            })

                        result.reverse()
                        i['source_data']['monthly_data'] = result

            cur.close()
            return jsonify(widgets)
        except psycopg2.Error as e:
            return jsonify({'error': str(e)}), 500

    @app.route('/api/user_widgets/create', methods=['POST'])
    @jwt_required()
    @token_required
    def create_user_widget():
        try:
            data = request.get_json()
            user_id = g.userId

            cur = conn.cursor()
            cur.execute(
                """
                INSERT INTO user_widgets
                (user_id, widget_id, title, data_source_type, data_source_id, configuration)
                VALUES (%s, %s, %s, %s, %s, %s)
                RETURNING *
                """,
                (user_id, data['widget_id'],data['configuration']['title'] , data['data_source_type'],
                 data.get('data_source_id') if len(data.get('data_source_id'))>12 else None, json.dumps(data['configuration']))
            )

            widget = cur.fetchone()
            conn.commit()
            return jsonify(widget)
        except Exception as e:
            conn.rollback()
            return jsonify({'error': str(e)}), 500
        finally:
            cur.close()

    @app.route('/user_widgets/<int:user_widget_id>', methods=['GET'])
    @jwt_required()
    @token_required
    def get_user_widget(user_widget_id):
        try:
            cur = conn.cursor()
            cur.execute('SELECT * FROM user_widgets WHERE id = %s AND user_id = %s', (user_widget_id, g.user['id']))
            user_widget = cur.fetchone()
            cur.close()
            if user_widget:
                return jsonify(user_widget)
            return jsonify({'error': 'User widget not found'}), 404
        except psycopg2.Error as e:
            conn.rollback()
            return jsonify({'error': str(e)}), 500

    @app.route('/user_widgets/<int:user_widget_id>', methods=['PUT'])
    @jwt_required()
    @token_required
    def update_user_widget(user_widget_id):
        try:
            data = request.get_json()
            cur = conn.cursor()
            cur.execute('UPDATE user_widgets SET widget_id = %s, data_source_type = %s, data_source_id = %s, configuration = %s WHERE id = %s AND user_id = %s RETURNING *',
                        (data['widget_id'], data['data_source_type'], data['data_source_id'], json.dumps(data['configuration']), user_widget_id, g.user['id']))
            user_widget = cur.fetchone()
            conn.commit()
            cur.close()
            if user_widget:
                return jsonify(user_widget)
            return jsonify({'error': 'User widget not found'}), 404
        except psycopg2.Error as e:
            return jsonify({'error': str(e)}), 500

    @app.route('/api/user_widgets/<widget_id>', methods=['DELETE'])
    @jwt_required()
    @token_required
    def delete_user_widget(widget_id):
        try:
            user_id = g.userId
            cur = conn.cursor()

            # First verify the widget belongs to the user
            cur.execute(
                'SELECT id FROM user_widgets WHERE id = %s AND user_id = %s',
                (widget_id, user_id)
            )
            widget = cur.fetchone()

            if not widget:
                return jsonify({'error': 'Widget not found or unauthorized'}), 404

            # Delete the widget
            cur.execute(
                'DELETE FROM user_widgets WHERE id = %s AND user_id = %s',
                (widget_id, user_id)
            )

            conn.commit()
            return jsonify({'success': True, 'message': 'Widget deleted successfully'})

        except Exception as e:
            conn.rollback()
            return jsonify({'error': str(e)}), 500
        finally:
            cur.close()

    @app.route('/api/widgets/datasources/<widget_type>', methods=['GET'])
    @jwt_required()
    @token_required
    def get_widget_data_sources(widget_type):
        cur = None
        try:
            user_id = g.userId
            cur = conn.cursor(cursor_factory=psycopg2.extras.DictCursor)

            if widget_type == 'Chart':
                cur.execute("""
                    SELECT json_build_object(
                        'id', type,
                        'title', type || ' (' || count || ' items)',
                        'type', type
                    ) as source
                    FROM (
                        SELECT 'task' as type, COUNT(*) as count FROM Notes
                        WHERE user_id = %s AND type = 'task'
                        UNION ALL
                        SELECT 'habit', COUNT(*) FROM Notes
                        WHERE user_id = %s AND type = 'habit'
                        UNION ALL
                        SELECT 'goal', COUNT(*) FROM Notes
                        WHERE user_id = %s AND type = 'goal'
                    ) as counts
                """, (user_id, user_id, user_id))

            elif widget_type == 'Progress':
                cur.execute("""
                    SELECT json_build_object(
                        'id', n.id,
                        'title', n.title || ' (' || COUNT(m.id) || ' milestones)',
                        'type', 'goal'
                    ) as source
                    FROM Notes n
                    JOIN Goals g ON n.id = g.note_id
                    JOIN Milestones m ON g.id = m.goal_id
                    WHERE n.user_id = %s
                    GROUP BY n.id, n.title
                    HAVING COUNT(m.id) > 0
                """, (user_id,))

            elif widget_type == 'Number':
                cur.execute("""
                    SELECT json_build_object(
                        'id', n.id,
                        'title', n.title || ' (streak: ' || h.streak || ')',
                        'type', 'habit'
                    ) as source
                    FROM Notes n
                    JOIN Habits h ON n.id = h.note_id
                    WHERE n.user_id = %s AND h.streak > 0
                """, (user_id,))

            elif widget_type == 'HabitWeek':
                cur.execute("""
                    SELECT json_build_object(
                        'id', n.id,
                        'title', n.title,
                        'type', 'habit'
                    ) as source
                    FROM Notes n
                    JOIN Habits h ON n.id = h.note_id
                    WHERE n.user_id = %s
                """, (user_id,))

            sources = [row['source'] for row in cur.fetchall()]
            return jsonify({'sources': sources})

        except Exception as e:
            return jsonify({'error': str(e)}), 500
        finally:
            if cur is not None:
                cur.close()
