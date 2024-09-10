import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

// Reusable validation rules
const usernameSchema = z.string().min(4, {
  message: "Username must be at least 4 characters.",
});

const passwordSchema = z.string().min(6, {
  message: "Password must be at least 6 characters.",
}).regex(
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
  "Password must contain at least one uppercase letter, one lowercase letter, one digit, and one special character."
);

const emailSchema = z.string().email({
  message: "Invalid email address.",
});

const uuidSchema = z.string().uuid();

const titleSchema = z.string().min(1, "Title is required").max(100, "Title cannot exceed 100 characters");

const contentSchema = z.string().max(1000, "Content cannot exceed 1000 characters");

const descriptionSchema = z.string().min(1, "Description is required");

const completedSchema = z.boolean();

// Main schemas
export const registerFormSchema = z.object({
  username: usernameSchema,
  password: passwordSchema,
  email: emailSchema,
});

export const loginFormSchema = z.object({
  username: usernameSchema,
  password: passwordSchema,
});

export const SubtaskSchema = z.object({
  subtask_id: z.number(),
  description: descriptionSchema,
  completed: completedSchema,
});

export const TaskSchema = z.object({
  taskid: uuidSchema,
  noteid: uuidSchema,
  title: titleSchema,
  content: contentSchema,
  subtasks: z.array(
    z.object({
      subtaskid: uuidSchema,
      description: descriptionSchema.max(500, "Subtask description cannot exceed 500 characters"),
      completed: completedSchema,
      index: z.number(),
      isNew: z.boolean().optional(),
    })
  ),
  due_date: z.date().optional(),
  completed: completedSchema,
});

export const NoteSchema = z.object({
  noteid: uuidSchema,
  title: titleSchema,
  // tags: z.array(uuidSchema), // tag ids
  content: contentSchema,
});

export const UserSettingsSchema = z.object({
  username: usernameSchema.optional(),
  email: emailSchema.optional(),
});

export const PasswordSchema = z.object({
  password: passwordSchema,
  newpassword: passwordSchema,
});

export const GoalSchema = z.object({
  goalid: uuidSchema,
  noteid: uuidSchema,
  title: titleSchema,
  content: contentSchema,
  milestones: z.array(
    z.object({
      milestoneid: uuidSchema,
      description: descriptionSchema.max(500, "Milestone description cannot exceed 500 characters"),
      completed: completedSchema,
      index: z.number(),
      isNew: z.boolean().optional(),
    })
  ),
  due_date: z.date().optional(),
});

export const HabitSchema = z.object({
  habitid: uuidSchema,
  noteid: uuidSchema,
  title: titleSchema,
  content: contentSchema,
  reminder: z.object({
    reminder_time: z.string().min(4, "Reminder time is required"),
    repetition: z.string().min(1, "Repetition is required"),
  }),
  streak: z.number(),
  completed_today: completedSchema,
});