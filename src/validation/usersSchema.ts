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
// Used when creating or replacing a user. // id and timestamps are generated/controlled by the server.
export const UserWithoutIdSchema = UserSchema.omit({
	id: true,
	createdAt: true,
	updatedAt: true,
  });

export type UserWithoutId = z.infer<typeof UserWithoutIdSchema>;

// Describes how a user is stored in DynamoDB
export const UserFromDbSchema = z.object({
	pk: z.string(),
	sk: z.string(),
	type: z.literal("USER"),
	id: z.string(),
	name: z.string().min(1),
	role: z.enum(["customer", "admin"]),
	email: z.email(),
	phone: z.string().min(1),
	createdAt: z.string(),
	updatedAt: z.string(),
});
export const UserListFromDbSchema = z.array(UserFromDbSchema);

export type UserFromDb = z.infer<typeof UserFromDbSchema>;
