from marshmallow import Schema, fields, ValidationError

class UserSchema(Schema):
    username = fields.Str(required=True, validate=lambda s: len(s) > 4)
    email = fields.Email(required=True)
    password = fields.Str(required=True, validate=lambda s: len(s) >= 6)

class LoginSchema(Schema):
    username = fields.Str(required=True, validate=lambda s: len(s) > 4)
    password = fields.Str(required=True, validate=lambda s: len(s) >= 6)

class TaskSchema(Schema):
    title = fields.Str(required=True, validate=lambda s: len(s) > 0)
    content = fields.Str(required=False, validate=lambda s: len(s) > 0)
    due_date = fields.Date(required=False)
    tags = fields.List(fields.Str(), required=False)
    subtasks = fields.List(fields.Str(), required=False)

    note_id = fields.Int(required=False)
    task_id = fields.Int(required=False)

class TagSchema(Schema):
    name = fields.Str(required=True, validate=lambda s: len(s) > 0)
    color = fields.Str(required=True, validate=lambda s: len(s) == 7)
    tagId = fields.Int(required=False)  