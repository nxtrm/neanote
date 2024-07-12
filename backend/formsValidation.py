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
    content = fields.Str(required=False)
    due_date = fields.Str(required=False)
    tags = fields.List(fields.Nested(TagSchema), required=False)  # Nested TagSchema for list of tags WILL NOT WORK WITH CREATE TASK, FIX
    subtasks = fields.List(fields.Nested(SubtaskSchema), required=False)  # Nested SubtaskSchema for list of subtasks
    completed = fields.Bool(required=True)

    noteid = fields.Int(required=False)
    taskid = fields.Int(required=False)

class ReminderSchema(Schema):
    reminder_time = fields.Str(required=True)
    repetition = fields.Str(required=True)

class HabitCreateSchema(Schema):
    title = fields.Str(required=True, validate=lambda s: len(s) > 0)
    content = fields.Str(required=False)
    tags = fields.List(fields.Int(), required=False) 
    reminder = fields.Nested(ReminderSchema, required=True)

class HabitUpdateSchema(Schema):
    title = fields.Str(required=True, validate=lambda s: len(s) > 0)
    content = fields.Str(required=False)
    tags = fields.List(fields.Nested(TagSchema), required=False) 
    reminder = fields.Nested(ReminderSchema, required=True)
    streak = fields.Int(required=True)

    noteid = fields.Int(required=True)
    habitid = fields.Int(required=True)   

