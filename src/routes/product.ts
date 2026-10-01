import express, { type Router } from "express"
import db from "../aws.ts"
import {
	ProductFromDbSchema,
	ProductListFromDbSchema,
	ProductSchemaWithoutId,
	type Product,
	type ProductWithoutId,
} from "../validation/productsSchema.ts"
import {
	QueryCommand,
	ScanCommand,
	GetCommand,
	PutCommand,
	DeleteCommand,
	UpdateCommand,
} from "@aws-sdk/lib-dynamodb";

import { randomUUID } from "node:crypto"
import { ConditionalCheckFailedException } from "@aws-sdk/client-dynamodb";

const router: Router = express.Router()
const TABLE_NAME = "grupparbete-backend"
type IdParam = { id: string }
type IdResponse = { id: string }

// GET /api/products
router.get<{}, Product[]> ("/", async (req, res) => {
	const command = new QueryCommand ({
		TableName: TABLE_NAME,
		KeyConditionExpression: "pk = :pk AND begins_with(sk, :sk",
		// FilterExpression: "#type = :type",
		// ExpressionAttributeValues: { ":type": "PRODUCT"},
		// ExpressionAttributeNames: {"#type": "type"}
		ExpressionAttributeValues: {
			":pk": "PRODUCTS",
			":sk": "CATEGORY#Electronics"
		}
	});
	try{
		const result = await db.send(command);
		const productsFromDb = ProductListFromDbSchema.parse(result.Items ?? []);
		const products: Product[] = productsFromDb.map((product) => ({
			id: product.id,
			name: product.name,
			price: product.price,
			image: product.image,
			amountInStock: product.amountInStock,
			description: product.description,
			category: product.category,
			createdAt: product.createdAt,
			updatedAt: product.updatedAt
		}));
		res.status(200).send(products);
	} catch (error) {
		console.error("GET /api/products error: ", error);
		res.sendStatus(500);
	}
});

// GET /api/products/:id

router.get<IdParam, Product>("/:id", async (req, res) =>{
	const id: string = req.params.id;
	const command = new GetCommand({
		TableName: TABLE_NAME,
		Key: {
			pk: `PRODUCT#${id}`,
			sk: `PRODUCT#${id}`
		},
	});
	try {
		const result = await db.send(command);
		if (!result.Item){
			res.sendStatus(404);
			return;
		}
		const productFromDb = ProductFromDbSchema.parse(result.Item);
		const product: Product = {
			id: productFromDb.id,
			name: productFromDb.name,
			price: productFromDb.price,
			image: productFromDb.image,
			amountInStock: productFromDb.amountInStock,
			description: productFromDb.description,
			category: productFromDb.category,
			createdAt: productFromDb.createdAt,
			updatedAt: productFromDb.updatedAt,
		};
		res.status(200).send(product);
	} catch( error ) {
		console.error("GET /api/products/:id error:", error);
		res.sendStatus(500);
	}
});

//POST /api/products

router.post<{}, IdResponse, ProductWithoutId>("/", async (req, res) => {
	let body: ProductWithoutId;

	try{
		body = ProductSchemaWithoutId.parse(req.body)
	} catch {
		res.sendStatus(400)
		return
	}

	const id = `product-${randomUUID()}`;
	const now = new Date().toISOString();

	const command = new PutCommand({
		TableName: TABLE_NAME,
		Item: {
			pk: `PRODUCT#${id}`,
			sk: `PRODUCT#${id}`,
			type: "PRODUCT",
			id,
			...body,
			createdAt: now, 
			updatedAt: now,
		}
	})

	try{
		await db.send(command)
		res.status(201).send({id})
	} catch(error){
		console.error("POST /api/products error", error)
		res.sendStatus(500)
	}
});

// PUT /api/products/:id
router.put<IdParam, void, ProductWithoutId>("/:id", async (req, res ) => {
	let body: ProductWithoutId

	try{
		body = ProductSchemaWithoutId.parse(req.body)
	} catch{
		res.sendStatus(400)
		return
	}

	const id: string = req.params.id;
	const command = new UpdateCommand({
		TableName: TABLE_NAME,
		Key: {
			pk: `PRODUCT#${id}`,
			sk: `PRODUCT#${id}`
		}, 

		UpdateExpression: "SET #name = :name, price = :price, image = :image, amountInStock = :amountInStock, description = :description, category = :category, updatedAt = :updatedAt",
		ConditionExpression: "attribute_exists(pk) AND attribute_exists(sk)",
		ExpressionAttributeNames: {"#name": "name"},
		ExpressionAttributeValues: {
			":name": body.name,
			":price": body.price,
			":image": body.image,
			":amountInStock": body.amountInStock,
			":description": body.description,
			":category": body.category,
			":updatedAt": new Date().toISOString(),
		}
	});

	try{
		await db.send(command)
		res.sendStatus(200);
	} catch (error){
		if (error instanceof ConditionalCheckFailedException) {
			res.sendStatus(404)
			return
		}
		console.error("PUT /api/products/:id error", error)
		res.sendStatus(500)
	}
});

// DELETE /api/products/:id
router.delete<IdParam>("/:id", async(req, res) => {
	const id: string = req.params.id;
	const command = new DeleteCommand({
		TableName: TABLE_NAME,
		Key: {
			pk: `PRODUCT#${id}`,
			sk: `PRODUCT#${id}`,
		},
		ReturnValues: "ALL_OLD"
	});

	try{
		const result = await db.send(command);
		if (result.Attributes) {
			res.sendStatus(204)
		} else {
			res.sendStatus(404)
		}
	} catch (error) {
		console.error("DELETE /api/products/:id error", error)
		res.sendStatus(500)
	}
})
export default router