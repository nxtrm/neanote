from marshmallow import Schema, fields, ValidationError

# Base Schema for common fields
class BaseSchema(Schema):
    title = fields.Str(required=True, validate=lambda s: 100 >= len(s) > 0)
    content = fields.Str(required=False, validate=lambda s: len(s) <= 1000)
    tags = fields.List(fields.UUID(), required=False)
    noteid = fields.UUID(required=False)

# User Schema
class UserSchema(Schema):
    username = fields.Str(required=True, validate=lambda s: len(s) > 4)
    email = fields.Email(required=True)
    password = fields.Str(required=True, validate=lambda s: len(s) >= 6)

# Login Schema
class LoginSchema(Schema):
    username = fields.Str(required=True, validate=lambda s: len(s) > 4)
    password = fields.Str(required=True, validate=lambda s: len(s) >= 6)

# Tag Schema
class TagSchema(Schema):
    name = fields.Str(required=True, validate=lambda s: len(s) > 0)
    color = fields.Str(required=True, validate=lambda s: len(s) == 7)
    tagid = fields.UUID(required=False)

# Subtask Schema
class SubtaskSchema(Schema):
    subtaskid = fields.UUID(required=False)
    description = fields.Str(required=True, validate=lambda s: 500 >= len(s) > 0)
    completed = fields.Bool(required=True)
    index = fields.Int(required=True)

# Task Schema
class TaskSchema(BaseSchema):
    taskid = fields.UUID(required=False)
    due_date = fields.Str(required=False, allow_none=True)
    subtasks = fields.List(fields.Nested(SubtaskSchema), required=False, allow_none=True)
    completed = fields.Bool(required=False)

# Reminder Schema
class ReminderSchema(Schema):
    reminder_time = fields.Str(required=True)
    repetition = fields.Str(required=True)

# Habit Schema
class HabitSchema(BaseSchema):
    completed_today = fields.Bool(required=False)
    reminder = fields.Nested(ReminderSchema, required=True)
    streak = fields.Int(required=False)
    linked_tasks = fields.List(fields.UUID(), required=False)
    habitid = fields.UUID(required=False)

# Milestone Schema
class MilestoneSchema(Schema):
    description = fields.Str(required=True, validate=lambda s: 500 >= len(s) > 0)
    completed = fields.Bool(required=True)
    index = fields.Int(required=True)
    milestoneid = fields.UUID(required=False)

# Goal Schema
class GoalSchema(BaseSchema):
    due_date = fields.Str(required=False, allow_none=True)
    milestones = fields.List(fields.Nested(MilestoneSchema), required=False, allow_none=True)
    goalid = fields.UUID(required=False)

# Gemini Summary Schema
class GeminiSummarySchema(Schema):
    title = fields.Str(required=False, validate=lambda s: 100 >= len(s) > 0)
    text = fields.Str(required=False, validate=lambda s: 1000 >= len(s) > 100)