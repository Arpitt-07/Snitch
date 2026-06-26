import * as z from 'zod';

const registerSchema = z.object({
    username: z.string().min(3, "Username must be at least 3 characters long"),
    email: z.string().email("Invalid email address"),
    password: z.string().min(6, "Password must be at least 6 characters long"),
    phone: z.string().regex(/^\d{10}$/, "Phone number must be exactly 10 digits"),
    isSeller: z.coerce.boolean().default(false)
});

const loginSchema = z.object({
    email: z.string().email("Invalid email address"),
    password: z.string().min(6, "Password must be at least 6 characters long")
});


export { registerSchema, loginSchema };