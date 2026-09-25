
import * as z from "zod";

export const UserSchema = z.object({
	id: z.string(),
	name: z.string(),
	role: z.enum(["customer", "admin"]),
	email: z.string().email(),
	phone: z.string(),
	createdAt: z.string(),
	updatedAt: z.string(),
});

export type User = z.infer<typeof UserSchema>;

// Good practice - utgå från befintlig typ i stället för att göra två nästan likadana scheman :)
export const UserWithoutIdSchema = UserSchema.omit({ id: true });

export type UserWithoutId = z.infer<typeof UserWithoutIdSchema>;





// UserFromDbSchema