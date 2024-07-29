import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
 
export const registerFormSchema = z.object({
    username: z.string().min(4, {
    message: "Username must be at least 4 characters.",
      }),
    password: z.string().min(6, {
    message: "Password must be at least 6 characters.",
    }).regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
        "Password must contain at least one uppercase letter, one lowercase letter, one digit, and one special character."
    ),
    email: z.string().email({
    message: "Invalid email address.",
    }),
})

export const loginFormSchema = z.object({
    username: z.string().min(4, {
      message: "Username must be at least 4 characters.",
    }),
    password: z.string().min(6, {
      message: "Password must be at least 6 characters.",
})})


export const SubtaskSchema = z.object({
    subtask_id: z.number(),
    description: z.string().min(1, "Description is required"),
    completed: z.boolean(),
  });

export const TaskSchema = z.object({
    taskid: z.string().uuid(),
    noteid: z.string().uuid(),
    title: z.string().min(1, "Title is required").max(100, "Title cannot exceed 100 characters"),
    tags: z.array(z.string().uuid()), //tag ids
    content: z.string().max(1000, "Content cannot exceed 1000 characters"),
    subtasks: z.array(
      z.object({
        subtaskid: z.string().uuid(),
        description: z.string().min(1, "Subtask description is required").max(500, "Subtask description cannot exceed 500 characters"),
        completed: z.boolean(),
        index: z.number(),
        isNew: z.boolean().optional(),
      })
    ),
    due_date: z.date().optional(),
    completed: z.boolean(),
});


export const GoalSchema = z.object({
    goalid: z.string().uuid(),
    noteid: z.string().uuid(),
    title: z.string().min(1, "Title is required").max(100, "Title cannot exceed 100 characters"),
    // tags: z.array(z.string().uuid()), //tag ids
    content: z.string().max(1000, "Content cannot exceed 1000 characters"),
    milestones: z.array(
      z.object({
        milestoneid: z.string().uuid(),
        description: z.string().min(1, "Milestone description is required").max(500, "Milestone description cannot exceed 500 characters"),
        completed: z.boolean(),
        index: z.number(),
        isNew: z.boolean().optional(),
      })
    ),
    due_date: z.date().optional(),
});

export const HabitSchema = z.object({
  habitid: z.string().uuid(),
  noteid: z.string().uuid(),
  title: z.string().min(1, "Title is required").max(100, "Title cannot exceed 100 characters"),
  // tags: z.array(z.string().uuid()), //tag ids
  content: z.string().max(1000, "Content cannot exceed 1000 characters"),
  reminder: z.object({
    reminder_time: z.string().optional(),
    repetition: z.string().optional(),
  }),
  streak: z.number(),
  completed_today: z.boolean(),
  
});