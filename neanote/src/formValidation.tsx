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
      title: z.string().min(1, "Title is required"),
      content: z.string().optional(),
      due_date: z.date().optional(),
      subtasks: z.array(SubtaskSchema),
    });