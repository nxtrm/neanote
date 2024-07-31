from marshmallow import Schema, fields, ValidationError

class UserSchema(Schema):
    username = fields.Str(required=True, validate=lambda s: len(s) > 4)
    email = fields.Email(required=True)
    password = fields.Str(required=True, validate=lambda s: len(s) >= 6)

class LoginSchema(Schema):
    username = fields.Str(required=True, validate=lambda s: len(s) > 4)
    password = fields.Str(required=True, validate=lambda s: len(s) >= 6)

class TagSchema(Schema):
    name = fields.Str(required=True, validate=lambda s: len(s) > 0)
    color = fields.Str(required=True, validate=lambda s: len(s) == 7)
    tagid = fields.UUID(required=False)  

    
class SubtaskSchema(Schema):
    subtaskid = fields.UUID(required=False)
    description = fields.Str(required=True, validate=lambda s: 500 >= len(s) > 0)
    completed = fields.Bool(required=True)
    index = fields.Int(required=True)

class TaskSchema(Schema):
    noteid = fields.UUID(required=False)
    taskid = fields.UUID(required=False)
    title = fields.Str(required=True, validate=lambda s: 100 >= len(s) > 0)
    content = fields.Str(required=False, validate=lambda s: len(s) <= 1000)
    due_date = fields.Str(required=False, allow_none=True)
    tags = fields.List(fields.UUID(), required=False)  # Nested TagSchema for list of tags WILL NOT WORK WITH CREATE TASK, FIX
    subtasks = fields.List(fields.Nested(SubtaskSchema), required=False, allow_none=True)  # Nested SubtaskSchema for list of subtasks
    completed = fields.Bool(required=False)


class ReminderSchema(Schema):
    reminder_time = fields.Str(required=True)
    repetition = fields.Str(required=True)

class HabitSchema(Schema):
    title = fields.Str(required=True, validate=lambda s: 100 >= len(s) > 0)
    content = fields.Str(required=False, validate=lambda s: len(s) <= 1000)
    tags = fields.List(fields.UUID(), required=False) 
    completed_today = fields.Bool(required=False)
    reminder = fields.Nested(ReminderSchema, required=True)
    streak = fields.Int(required=False)

    noteid =  fields.UUID(required=False)
    habitid = fields.UUID(required=False)

class MilestoneSchema(Schema) :
    description = fields.Str(required=True, validate=lambda s: 500 >= len(s) > 0)
    completed = fields.Bool(required=True)
    index = fields.Int(required=True)

    milestoneid = fields.UUID(required=False)

class GoalSchema(Schema):
    title = fields.Str(required=True, validate=lambda s: 100 >= len(s) > 0)
    content = fields.Str(required=False, validate=lambda s: len(s) <= 1000)
    due_date = fields.Str(required=False,allow_none=True)
    tags = fields.List(fields.UUID(), required=False) 
    milestones = fields.List(fields.Nested(MilestoneSchema), required=False, allow_none=True)

    noteid = fields.UUID(required=False)
    goalid = fields.UUID(required=False)   
