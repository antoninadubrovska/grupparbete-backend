import { users } from "./data/users.js";
import { products } from "./data/products.js";
import { carts } from "./data/carts.js";

import { UserSchema, UserFromDbSchema } from "./validation/usersSchema.js";

import {
	ProductSchema,
	ProductFromDbSchema,
} from "./validation/productsSchema.js";

import { cartSchema, cartFromDbSchema } from "./validation/cartSchema.js";

import { PutCommand, DeleteCommand, ScanCommand } from "@aws-sdk/lib-dynamodb";
import db from "./aws.js";

const TABLE_NAME = "grupparbete-backend";

async function seed() {
	console.log("Validating seed data...");

	// Validate users
	for (const user of users) {
		UserSchema.parse(user);
	}
	console.log("Users validated");

	// Validate products
	for (const product of products) {
		ProductSchema.parse(product);
	}
	console.log("Products validated");

	// Validate cart items
	for (const cart of carts) {
		cartSchema.parse(cart);
	}
	console.log("Cart items validated");

	console.log("All seed data is valid");

	// Seed users
	for (const user of users) {
		const item = {
			pk: `USER#${user.id}`,
			sk: `USER#${user.id}`,
			type: "USER" as const,
			...user,
		};

		UserFromDbSchema.parse(item);

		await db.send(
			new PutCommand({
				TableName: TABLE_NAME,
				Item: item,
			}),
		);
		console.log(`Seeded user: ${user.id}`);
	}
	console.log("All users seeded");

	// Delete existing products
	const existingProducts = await db.send(
		new ScanCommand({
			TableName: TABLE_NAME,
			FilterExpression: "#type = :type",
			ExpressionAttributeNames: {
				"#type": "type",
			},
			ExpressionAttributeValues: {
				":type": "PRODUCT",
			},
		}),
	);

	for (const product of existingProducts.Items ?? []) {
		await db.send(
			new DeleteCommand({
				TableName: TABLE_NAME,
				Key: {
					pk: product.pk,
					sk: product.sk,
				},
			}),
		);

		console.log(`Deleted old product: ${product.id}`);
	}

	console.log("All old products deleted");

	// Seed products
	for (const product of products) {
		const item = {
			pk: "PRODUCTS",
			sk: `CATEGORY#${product.category}#PRODUCT#${product.id}`,
			type: "PRODUCT" as const,
			...product,
		};

		ProductFromDbSchema.parse(item);

		await db.send(
			new PutCommand({
				TableName: TABLE_NAME,
				Item: item,
			}),
		);

		console.log(`Seeded product: ${product.id}`);
	}

	console.log("All products seeded");

	// Seed cart items
	for (const cart of carts) {
		const item = {
			pk: `USER#${cart.userId}`,
			sk: `CART#${cart.id}`,
			type: "CART" as const,
			...cart,
		};

		cartFromDbSchema.parse(item);

		await db.send(
			new PutCommand({
				TableName: TABLE_NAME,
				Item: item,
			}),
		);

		console.log(`Seeded cart item: ${cart.id}`);
	}

	console.log("All cart items seeded");
}

seed().catch((error) => {
	console.error("Seeding failed:", error);
	process.exit(1);
});
