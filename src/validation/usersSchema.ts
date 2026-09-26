import * as z from "zod";

export const UserSchema = z.object({
	id: z.string(),
	name: z.string(),
	role: z.enum(["customer", "admin"]),
	email: z.email(),
	phone: z.string(),
	createdAt: z.string(),
	updatedAt: z.string(),
});

export type User = z.infer<typeof UserSchema>;

// Good practice - utgå från befintlig typ i stället för att göra två nästan likadana scheman :)
export const UserWithoutIdSchema = UserSchema.omit({ id: true });

export type UserWithoutId = z.infer<typeof UserWithoutIdSchema>;

export const UserFromDbSchema = z.object({
	pk: z.string(),
	sk: z.string(),
	type: z.literal("USER"),
	id: z.string(),
	name: z.string(),
	role: z.enum(["customer", "admin"]),
	email: z.email(),
	phone: z.string(),
	createdAt: z.string(),
	updatedAt: z.string(),
});
export const UserListFromDbSchema = z.array(UserFromDbSchema);

export type UserFromDb = z.infer<typeof UserFromDbSchema>;
