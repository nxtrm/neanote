from marshmallow import Schema, fields, ValidationError

class UserSchema(Schema):
    username = fields.Str(required=True, validate=lambda s: len(s) > 4)
    email = fields.Email(required=True)
    password = fields.Str(required=True, validate=lambda s: len(s) >= 6)

class LoginSchema(Schema):
    username = fields.Str(required=True, validate=lambda s: len(s) > 4)
    password = fields.Str(required=True, validate=lambda s: len(s) >= 6)


class SubtaskSchema(Schema):
    description = fields.Str(required=True, validate=lambda s: len(s) > 0)

    completed = fields.Bool(required=True)
    task_id = fields.Int(required=False)
    subtask_id = fields.Int(required=True)

class TagSchema(Schema):
    name = fields.Str(required=True, validate=lambda s: len(s) > 0)
    color = fields.Str(required=True, validate=lambda s: len(s) == 7)
    tagid = fields.Int(required=False)  

class TaskSchema(Schema):
    title = fields.Str(required=True, validate=lambda s: len(s) > 0)
    content = fields.Str(required=False, validate=lambda s: len(s) > 0)
    due_date = fields.Str(required=False)
    tags = fields.List(fields.Nested(TagSchema), required=False)  # Nested TagSchema for list of tags
    subtasks = fields.List(fields.Nested(SubtaskSchema), required=False)  # Nested SubtaskSchema for list of subtasks
    completed = fields.Bool(required=True)

    noteid = fields.Int(required=False)
    taskid = fields.Int(required=False)
