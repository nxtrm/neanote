#TAG MODULE
from datetime import datetime
from flask import Blueprint, g, jsonify, request
from flask_jwt_extended import jwt_required
from MySQLdb.cursors import DictCursor
from formsValidation import TagSchema
from utils import token_required, verify_tag_ownership

def tag_routes(app,mysql):

    @app.route('/api/tags/create', methods=['POST'])
    @jwt_required()
    @token_required
    def create_tag():
        userId = g.userId
        tag_schema = TagSchema()
        data = tag_schema.load(request.get_json())
        tag_name = data['name']
        tag_color = data['color']

        cur = mysql.connection.cursor()
        try:
            cur.execute(
                "INSERT INTO Tags (name, color, user_id) VALUES (%s, %s, %s)",
                (tag_name, tag_color, userId)
            )
            mysql.connection.commit()
            return jsonify({'message': 'Tag created successfully', 'data': None}), 200
        except Exception as error:
            mysql.connection.rollback()
            print('Error during transaction', error)
            raise
        finally:
            cur.close()
        
    @app.route('/api/tags/', methods=['GET'])
    @jwt_required()
    @token_required
    def getAll_tags():
        userId = g. userId
        
        cur = mysql.connection.cursor(cursorclass=DictCursor)   
        try:
            cur.execute(
                "SELECT id AS tagid, name, color FROM Tags WHERE user_id = %s",
                (userId,)
            )
            tags = cur.fetchall()
            mysql.connection.commit()
            return jsonify({'message': 'Tags fetched successfully', 'data': tags}), 200
        except Exception as e:
            mysql.connection.rollback()
            raise
        finally:
            cur.close()
        
    @app.route('/api/tags/<int:note_id>', methods=['GET'])
    @jwt_required()
    @token_required
    def getTags():
        userId = g. userId

        cur = mysql.connection.cursor(cursorclass=DictCursor)
        note_id = request.args.get('note_id')
        try:
            cur.execute(
                "SELECT t.id AS t.tagid, t.name, t.color FROM Tags t JOIN NoteTags nt ON t.id = nt.tag_id WHERE nt.note_id = %s AND t.user_id = %s",
                (note_id, userId)
            )
            tags = cur.fetchall()
            mysql.connection.commit()
            return jsonify({'message': 'Tags fetched successfully', 'data': tags}), 200
        except Exception as e:
            mysql.connection.rollback()
            raise
        finally:
            cur.close()

    @app.route('/api/tags/add', methods=['POST'])
    @jwt_required()
    @token_required
    def addTag():
        userId = g. userId
        cur = mysql.connection.cursor()
        data = request.get_json()
        note_id = data['note_id']
        tag_id = data['tagid']
        if verify_tag_ownership(userId, tag_id, cur) is False:
            return jsonify({'message': 'You do not have permission to update this tag'}), 403
        try:
            cur.execute (
                "INSERT INTO NoteTags (note_id, tag_id) VALUES (%s, %s)", (note_id, tag_id),
            )
            mysql.connection.commit()
            cur.close()
            return jsonify({'message': 'Tag added successfully', 'data': None}), 200
        except Exception as e:
            mysql.connection.rollback()
            cur.close()
            raise
        
    @app.route('/api/tags/edit', methods=['PUT'])
    @jwt_required()
    @token_required
    def editTag():
        tag_schema = TagSchema()
        userId = g.userId
        data = tag_schema.load(request.get_json())
        tag_id = data['tagid']
        name = data['name']
        color = data['color']
        cur = mysql.connection.cursor(cursorclass=DictCursor)
        if verify_tag_ownership(userId, tag_id, cur) is False:
            return jsonify({'message': 'You do not have permission to update this tag'}), 403
        try:
            cur.execute (
                "UPDATE Tags SET name = %s, color = %s WHERE id = %s", (name, color, tag_id),
            )
            mysql.connection.commit()
            cur.close()
            return jsonify({'message': 'Tag updated successfully', 'data': None}), 200
        except Exception as e:
            mysql.connection.rollback()
            raise
        finally:
            cur.close()

    @app.route('/api/tags/delete', methods=['PUT'])
    @jwt_required()
    @token_required
    def deleteTag():
        userId = g.userId
        
        # Initialize cursor outside try block
        cur = mysql.connection.cursor()
        
        try:
            data = request.get_json()
            tag_id = data['tagid']
            if not verify_tag_ownership(userId, tag_id, cur):
                return jsonify({'message': 'You do not have permission to update this tag'}), 403
            
            # Perform deletion operations
            cur.execute("DELETE FROM Tags WHERE id = %s AND user_id = %s", (tag_id, userId))
            cur.execute("DELETE FROM NoteTags WHERE tag_id = %s", (tag_id,))
            mysql.connection.commit()
            
            return jsonify({'message': 'Tag deleted successfully', 'data': None}), 200
        except Exception as e:
            mysql.connection.rollback()
            raise
        finally:
            cur.close()
            