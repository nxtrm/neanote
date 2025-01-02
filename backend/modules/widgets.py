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

    @app.route('/user_widgets', methods=['GET'])
    @jwt_required()
    def get_user_widgets():
        try:
            cur = conn.cursor()
            cur.execute('SELECT * FROM user_widgets WHERE user_id = %s', (g.user['id'],))
            user_widgets = cur.fetchall()
            cur.close()
            return jsonify(user_widgets)
        except psycopg2.Error as e:
            return jsonify({'error': str(e)}), 500

    @app.route('/user_widgets', methods=['POST'])
    @jwt_required()
    def create_user_widget():
        try:
            data = request.get_json()
            cur = conn.cursor()
            cur.execute('INSERT INTO user_widgets (user_id, widget_id, data_source_type, data_source_id, configuration) VALUES (%s, %s, %s, %s, %s) RETURNING *', 
                        (g.user['id'], data['widget_id'], data['data_source_type'], data['data_source_id'], json.dumps(data['configuration'])))
            user_widget = cur.fetchone()
            conn.commit()
            cur.close()
            return jsonify(user_widget)
        except psycopg2.Error as e:
            return jsonify({'error': str(e)}), 500

    @app.route('/user_widgets/<int:user_widget_id>', methods=['GET'])
    @jwt_required()
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
            return jsonify({'error': str(e)}), 500

    @app.route('/user_widgets/<int:user_widget_id>', methods=['PUT'])
    @jwt_required()
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

    @app.route('/user_widgets/<int:user_widget_id>', methods=['DELETE'])
    @jwt_required()
    def delete_user_widget(user_widget_id):
        try:
            cur = conn.cursor()
            cur.execute('DELETE FROM user_widgets WHERE id = %s AND user_id = %s RETURNING *', (user_widget_id, g.user['id']))
            user_widget = cur.fetchone()
            conn.commit()
            cur.close()
            if user_widget:
                return jsonify({'message': 'User widget deleted'})
            return jsonify({'error': 'User widget not found'}), 404
        except psycopg2.Error as e:
            return jsonify({'error': str(e)}), 500
