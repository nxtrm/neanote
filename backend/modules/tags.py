#TAG MODULE
from datetime import datetime
from flask import Blueprint, g, jsonify, request
from flask_jwt_extended import jwt_required
from formsValidation import TagSchema
from utils import token_required, verify_tag_ownership
import psycopg2.extras

def tag_routes(app,conn):

    @app.route('/api/tags/create', methods=['POST'])
    @jwt_required()
    @token_required
    def create_tag():
        cur = None  # Initialize cur to None
        try:
            userId = g.userId
            tag_schema = TagSchema()
            data = tag_schema.load(request.get_json())
            tag_name = data['name']
            tag_color = data['color']

            cur = conn.cursor()
            cur.execute(
                "INSERT INTO Tags (name, color, user_id) VALUES (%s, %s, %s) RETURNING id",
                (tag_name, tag_color, userId)
            )
            tag_id = cur.fetchone()[0]

            conn.commit()
            return jsonify({'message': 'Tag created successfully', 'data': {'id': tag_id}}), 200
        except Exception as error:
            if conn:
                conn.rollback()
            print('Error during transaction', error)
            return jsonify({'message': 'Failed to create tag'}), 500 
        finally:
            if cur:
                cur.close()
        
    @app.route('/api/tags/', methods=['GET'])
    @jwt_required()
    @token_required
    def getAll_tags():
        try:
            userId = g.userId
            with conn:
                with conn.cursor(cursor_factory=psycopg2.extras.DictCursor) as cur:
                    cur.execute(
                        "SELECT id AS tagid, name, color FROM Tags WHERE user_id = %s",
                        (userId,)
                    )
                    rows = cur.fetchall()
                    tags = [{'tagid':row['tagid'], 'name': row['name'], 'color': row['color']} for row in rows]

            return jsonify({'message': 'Tags fetched successfully', 'data': tags}), 200
        except Exception as e:
            # It's good practice to log the exception e
            return jsonify({'message': 'Failed to fetch tags'}), 500
        
    @app.route('/api/tags/<int:note_id>', methods=['GET'])
    @jwt_required()
    @token_required
    def getTags():
        try:
            userId = g. userId

            cur = conn.cursor(cursorclass=psycopg2.extras.DictCursor)

            note_id = request.args.get('note_id')
            cur.execute(
                "SELECT t.id AS t.tagid, t.name, t.color FROM Tags t JOIN NoteTags nt ON t.id = nt.tag_id WHERE nt.note_id = %s AND t.user_id = %s",
                (note_id, userId)
            )
            tags = cur.fetchall()
            conn.commit()
            return jsonify({'message': 'Tags fetched successfully', 'data': tags}), 200
        except Exception as e:
            conn.rollback()
            raise
        finally:
            cur.close()

    @app.route('/api/tags/add', methods=['POST'])
    @jwt_required()
    @token_required
    def addTag():
        try:
            userId = g. userId
            cur = conn.cursor()
            data = request.get_json()
            note_id = data['note_id']
            tag_id = data['tagid']
            if verify_tag_ownership(userId, tag_id, cur) is False:
                return jsonify({'message': 'You do not have permission to update this tag'}), 403
            
            cur.execute (
                "INSERT INTO NoteTags (note_id, tag_id) VALUES (%s, %s)", (note_id, tag_id),
            )
            conn.commit()
            cur.close()
            return jsonify({'message': 'Tag added successfully', 'data': None}), 200
        except Exception as e:
            conn.rollback()
            cur.close()
            raise
        
    @app.route('/api/tags/edit', methods=['PUT'])
    @jwt_required()
    @token_required
    def editTag():
        try:
            tag_schema = TagSchema()
            userId = g.userId
            data = tag_schema.load(request.get_json())
            tag_id = data['tagid']
            name = data['name']
            color = data['color']
            cur = conn.cursor(cursorclass=psycopg2.extras.DictCursor)
            if verify_tag_ownership(userId, tag_id, cur) is False:
                return jsonify({'message': 'You do not have permission to update this tag'}), 403
            
            cur.execute (
                "UPDATE Tags SET name = %s, color = %s WHERE id = %s", (name, color, tag_id),
            )
            conn.commit()
            cur.close()
            return jsonify({'message': 'Tag updated successfully', 'data': None}), 200
        except Exception as e:
            conn.rollback()
            raise
        finally:
            cur.close()

    @app.route('/api/tags/delete', methods=['PUT'])
    @jwt_required()
    @token_required
    def deleteTag():
        try:
            userId = g.userId
            
            cur = conn.cursor()
            data = request.get_json()
            tag_id = data['tagid']

            if not verify_tag_ownership(userId, tag_id, cur):
                return jsonify({'message': 'You do not have permission to update this tag'}), 403
            
            # Perform deletion operations
            cur.execute("DELETE FROM Tags WHERE id = %s AND user_id = %s", (tag_id, userId))
            cur.execute("DELETE FROM NoteTags WHERE tag_id = %s", (tag_id,))
            conn.commit()
            
            return jsonify({'message': 'Tag deleted successfully', 'data': None}), 200
        except Exception as e:
            conn.rollback()
            raise
        finally:
            cur.close()



            