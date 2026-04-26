import { z } from "zod";

export const registerSchema = z.object({
  username: z
    .string()
    .trim()
    .min(3, "Username must be at least 3 characters long")
    .max(20, "Username must be at most 20 characters long")
    .regex(/^[a-zA-Z0-9_]+$/, "Username can only contain letters, numbers and underscores"),

  email: z
    .string()
    .trim()
    .toLowerCase()
    .email("Invalid email format"),

  password: z
    ..string({
        required_error: "Password is required",
      })
    .min(6, "Password must be at least 6 characters long")
    .max(100)
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/,
      "Password must contain uppercase, lowercase and number"
    ),

  phone: z
    .string()
    .trim()
    .optional()
    .refine((val) => {
      if (!val) return true;
      return /^\+?[0-9]{10,15}$/.test(val);
    }, "Invalid phone number format"),

  website: z
    .string()
    .trim()
    .optional()
    .refine((val) => {
      if (!val) return true;
      return /^https?:\/\/[\w\-]+(\.[\w\-]+)+[/#?]?.*$/.test(val);
    }, "Invalid website URL"),

  fullName: z
    .string()
    .trim()
    .max(50, "Full name is too long")
    .optional(),
});
