import express, { type Router } from "express";
import db from "../aws.ts";

import {
	cartFromDbSchema,
	cartSchema,
	cartWithoutIdSchema,
	type Cart,
} from "../validation/cartSchema.ts";

import {
	ScanCommand,
	GetCommand,
	PutCommand,
	DeleteCommand,
	UpdateCommand,
} from "@aws-sdk/lib-dynamodb";

import { randomUUID } from "node:crypto";
import { ConditionalCheckFailedException } from "@aws-sdk/client-dynamodb";


const router: Router = express.Router();

const TABLE_NAME = "grupparbete-backend";

type IdParam = {
	userId: string;
	id: string;
};

type IdResponse = {
	id: string;
};


// GET /api/cart

router.get<{}, Cart[]>("/", async (req, res) => {

	const command = new ScanCommand({
		TableName: TABLE_NAME,
		FilterExpression: "#type = :type",
		ExpressionAttributeValues: {
			":type": "CART",
		},
		ExpressionAttributeNames: {
			"#type": "type",
		},
	});

	try {

		const result = await db.send(command);

		const carts: Cart[] = (result.Items ?? []).map((item) => {
			const cartFromDb = cartFromDbSchema.parse(item);

			return {
				id: cartFromDb.id,
				userId: cartFromDb.userId,
				productId: cartFromDb.productId,
				amount: cartFromDb.amount,
				addedAt: cartFromDb.addedAt,
				updatedAt: cartFromDb.updatedAt,
			};
		});

		res.status(200).send(carts);

	} catch (error) {

		console.error("GET /api/cart error:", error);
		res.sendStatus(500);
	}
});


// GET /api/cart/:userId/:id

router.get<IdParam, Cart>("/:userId/:id", async (req, res) => {

	const userId: string = req.params.userId;
	const id: string = req.params.id;

	const command = new GetCommand({
		TableName: TABLE_NAME,
		Key: {
			pk: `USER#${userId}`,
			sk: `CART#${id}`,
		},
	});

	try {

		const result = await db.send(command);

		if (!result.Item) {
			res.sendStatus(404);
			return;
		}

		const cartFromDb = cartFromDbSchema.parse(result.Item);

		const cart: Cart = {
			id: cartFromDb.id,
			userId: cartFromDb.userId,
			productId: cartFromDb.productId,
			amount: cartFromDb.amount,
			addedAt: cartFromDb.addedAt,
			updatedAt: cartFromDb.updatedAt,
		};

		res.status(200).send(cart);

	} catch (error) {

		console.error("GET /api/cart/:userId/:id error:", error);
		res.sendStatus(500);
	}
});


// POST /api/cart

router.post<{}, IdResponse>("/", async (req, res) => {

	let body: Omit<Cart, "id" | "addedAt" | "updatedAt">;

	try {

		body = cartWithoutIdSchema.parse(req.body);

	} catch {

		res.sendStatus(400);
		return;
	}

	const id = `cart-${randomUUID()}`;
	const now = new Date().toISOString();

	const command = new PutCommand({
		TableName: TABLE_NAME,

		Item: {
			pk: `USER#${body.userId}`,
			sk: `CART#${id}`,
			type: "CART",

			id,
			...body,

			addedAt: now,
			updatedAt: now,
		},
	});

	try {

		await db.send(command);

		res.status(201).send({ id });

	} catch (error) {

		console.error("POST /api/cart error:", error);
		res.sendStatus(500);
	}
});


// PUT /api/cart/:userId/:id

router.put<IdParam, void>("/:userId/:id", async (req, res) => {

	let body: Omit<Cart, "id" | "addedAt" | "updatedAt">;

	try {

		body = cartWithoutIdSchema.parse(req.body);

	} catch {

		res.sendStatus(400);
		return;
	}

	const userId: string = req.params.userId;
	const id: string = req.params.id;

	const command = new UpdateCommand({
		TableName: TABLE_NAME,

		Key: {
			pk: `USER#${userId}`,
			sk: `CART#${id}`,
		},

		UpdateExpression:
			"SET productId = :productId, amount = :amount, updatedAt = :updatedAt",

		ConditionExpression:
			"attribute_exists(pk) AND attribute_exists(sk)",

		ExpressionAttributeValues: {
			":productId": body.productId,
			":amount": body.amount,
			":updatedAt": new Date().toISOString(),
		},
	});

	try {

		await db.send(command);

		res.sendStatus(200);

	} catch (error) {

		if (error instanceof ConditionalCheckFailedException) {
			res.sendStatus(404);
			return;
		}

		console.error("PUT /api/cart/:userId/:id error:", error);
		res.sendStatus(500);
	}
});


// DELETE /api/cart/:userId/:id

router.delete<IdParam>("/:userId/:id", async (req, res) => {

	const userId: string = req.params.userId;
	const id: string = req.params.id;

	const command = new DeleteCommand({
		TableName: TABLE_NAME,

		Key: {
			pk: `USER#${userId}`,
			sk: `CART#${id}`,
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

		console.error("DELETE /api/cart/:userId/:id error:", error);
		res.sendStatus(500);
	}
});


export default router;