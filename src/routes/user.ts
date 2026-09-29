import express, { type Router } from "express";
import db from "../aws.js";

//import { QueryCommand } from '@aws-sdk/lib-dynamodb';

import {
	UserSchema,
	UserFromDbSchema,
	UserListFromDbSchema,
	UserWithoutIdSchema,
	type User,
	type UserWithoutId,
} from "../validation/usersSchema.js";

import { randomUUID } from "node:crypto";

import {
	ScanCommand,
	GetCommand,
	PutCommand,
	DeleteCommand,
	UpdateCommand,
} from "@aws-sdk/lib-dynamodb";

const router: Router = express.Router();
const TABLE_NAME = "grupparbete-backend";
type IdParam = { id: string };
type IdResponse = { id: string };

// GET /api/users
// scan + filter type user
router.get<{}, User[]>("/", async (req, res) => {
	const command = new ScanCommand({
		TableName: TABLE_NAME,
		FilterExpression: "#type = :type",
		ExpressionAttributeNames: { "#type": "type" },
		ExpressionAttributeValues: { ":type": "USER" },
	});
	try {
		const result = await db.send(command);
		const usersFromDb = UserListFromDbSchema.parse(result.Items ?? []);
		const users: User[] = usersFromDb.map((user) => ({
			id: user.id,
			name: user.name,
			role: user.role,
			email: user.email,
			phone: user.phone,
			createdAt: user.createdAt,
			updatedAt: user.updatedAt,
		}));
		res.status(200).send(users);
	} catch (error) {
		console.error("GET /api/users error:", error);
		res.sendStatus(500);
	}
});

// GET /api/users/:id
router.get<IdParam, User>("/:id", async (req, res) => {
	const id: string = req.params.id;
	const command = new GetCommand({
		TableName: TABLE_NAME,
		Key: {
			pk: `USER#${id}`,
			sk: `USER#${id}`,
		},
	});
	try {
		const result = await db.send(command);
		//as DynamoDB doesn't throw an error when the item doesn't exist:
		if (!result.Item) {
			res.sendStatus(404);
			return;
		}
		const userFromDb = UserFromDbSchema.parse(result.Item);
		const user: User = {
			id: userFromDb.id,
			name: userFromDb.name,
			role: userFromDb.role,
			email: userFromDb.email,
			phone: userFromDb.phone,
			createdAt: userFromDb.createdAt,
			updatedAt: userFromDb.updatedAt,
		};
		res.status(200).send(user);
	} catch (error) {
		console.error("GET /api/users/:id error:", error);
		res.sendStatus(500);
	}
});

//POST /api/users

router.post<{}, IdResponse, UserWithoutId>("/", async (req, res) => {
	let body: UserWithoutId;

	try {
		body = UserWithoutIdSchema.parse(req.body);
	} catch {
		res.sendStatus(400);
		return;
	}

	const id = `user-${randomUUID()}`;
	const now = new Date().toISOString();

	const command = new PutCommand({
		TableName: TABLE_NAME,
		Item: {
			pk: `USER#${id}`,
			sk: `USER#${id}`,
			type: "USER",
			id,
			...body,
			createdAt: now,
			updatedAt: now,
		},
	});

	try {
		await db.send(command);
		res.status(201).send({ id });
	} catch (error) {
		console.error("POST /api/users error:", error);
		res.sendStatus(500);
	}
});

// PUT /api/users/:id
router.put<IdParam, User, UserWithoutId>("/:id", async (req, res) => {
	const id: string = req.params.id;

	let body: UserWithoutId;

	try {
		body = UserWithoutIdSchema.parse(req.body);
	} catch {
		res.sendStatus(400);
		return;
	}

	const updatedAt = new Date().toISOString();

	const command = new UpdateCommand({
		TableName: TABLE_NAME,
		Key: {
			pk: `USER#${id}`,
			sk: `USER#${id}`,
		},
		UpdateExpression:
			"SET #name = :name, #role = :role, #email = :email, #phone = :phone, updatedAt = :updatedAt",
		ExpressionAttributeNames: {
			"#name": "name",
			"#role": "role",
			"#email": "email",
			"#phone": "phone",
		},
		ExpressionAttributeValues: {
			":name": body.name,
			":role": body.role,
			":email": body.email,
			":phone": body.phone,
			":updatedAt": updatedAt,
		},
		ConditionExpression: "attribute_exists(pk)",
		ReturnValues: "ALL_NEW",
	});

	try {
		const result = await db.send(command);

		const userFromDb = UserFromDbSchema.parse(result.Attributes);

		const user: User = {
			id: userFromDb.id,
			name: userFromDb.name,
			role: userFromDb.role,
			email: userFromDb.email,
			phone: userFromDb.phone,
			createdAt: userFromDb.createdAt,
			updatedAt: userFromDb.updatedAt,
		};

		res.status(200).send(user);
	} catch (error: any) {
		if (error.name === "ConditionalCheckFailedException") {
			res.sendStatus(404);
			return;
		}

		console.error("PUT /api/users/:id error:", error);
		res.sendStatus(500);
	}
});




// DELETE /api/users/:id
router.delete<IdParam>("/:id", async (req, res) => {
	const id: string = req.params.id;

	const command = new DeleteCommand({
		TableName: TABLE_NAME,
		//500 testing:
		//TableName: "wrong-table-name",
		Key: {
			pk: `USER#${id}`,
			sk: `USER#${id}`,
		},
		ReturnValues: "ALL_OLD",
	});

	try {
		const result = await db.send(command);

		if (result.Attributes) {
			res.sendStatus(204);
		} else {
			res.sendStatus(404);
		}
	} catch (error) {
		console.error("DELETE /api/users/:id error:", error);
		res.sendStatus(500);
	}
});

// DELETE existing user  204 tested (must remove USER# from id)
// DELETE nonexistent user  404
// DynamoDB error  500








export default router;
