import express, { type Router } from "express"
import * as z from "zod"
import db from "../aws.ts"
import {
	ProductFromDbSchema,
	ProductListFromDbSchema,
	ProductSchemaWithoutId,
	type Product,
	type ProductWithoutId,
} from "../validation/productsSchema.js"
import {
	QueryCommand,
	PutCommand,
	DeleteCommand,
} from "@aws-sdk/lib-dynamodb"
import { randomUUID } from "node:crypto"

const router: Router = express.Router()
const TABLE_NAME = "grupparbete-backend"

type IdParam = { id: string }
type IdResponse = { id: string }

const SearchQuerySchema = z.object({ q: z.string().trim().min(1) })

async function findProductItem(id: string) {
	const result = await db.send(
		new QueryCommand({
			TableName: TABLE_NAME,
			KeyConditionExpression: "pk = :pk AND begins_with(sk, :sk)",
			FilterExpression: "id = :id",
			ExpressionAttributeValues: {
				":pk": "PRODUCTS",
				":sk": "CATEGORY#",
				":id": id,
			},
		}),
	)

	return result.Items?.[0]
}

// GET /api/products
router.get<{}, Product[]>("/", async (req, res) => {
	const command = new QueryCommand({
		TableName: TABLE_NAME,
		KeyConditionExpression: "pk = :pk AND begins_with(sk, :sk)",
		ExpressionAttributeValues: {
			":pk": "PRODUCTS",
			":sk": "CATEGORY#",
		},
	})

	try {
		const result = await db.send(command)
		const productsFromDb = ProductListFromDbSchema.parse(result.Items ?? [])

		const products: Product[] = productsFromDb.map((product) => ({
			id: product.id,
			name: product.name,
			price: product.price,
			image: product.image,
			amountInStock: product.amountInStock,
			description: product.description,
			category: product.category,
			createdAt: product.createdAt,
			updatedAt: product.updatedAt,
		}))

		res.status(200).send(products)
	} catch (error) {
		console.error("GET /api/products error:", error)
		res.sendStatus(500)
	}
})

// GET /api/products/search?q=sony 
router.get<{}, Product[], {}, { q?: string }>("/search", async (req, res) => {
	const parsed = SearchQuerySchema.safeParse(req.query)

	if (!parsed.success) {
		res.sendStatus(400)
		return
	}

	const q = parsed.data.q.toLowerCase()

	const command = new QueryCommand({
		TableName: TABLE_NAME,
		KeyConditionExpression: "pk = :pk AND begins_with(sk, :sk)",
		ExpressionAttributeValues: {
			":pk": "PRODUCTS",
			":sk": "CATEGORY#",
		},
	})

	try {
		const result = await db.send(command)
		const productsFromDb = ProductListFromDbSchema.parse(result.Items ?? [])

		const products: Product[] = productsFromDb
			.filter((product) => product.name.toLowerCase().includes(q))
			.map((product) => ({
				id: product.id,
				name: product.name,
				price: product.price,
				image: product.image,
				amountInStock: product.amountInStock,
				description: product.description,
				category: product.category,
				createdAt: product.createdAt,
				updatedAt: product.updatedAt,
			}))

		res.status(200).send(products)
	} catch (error) {
		console.error("GET /api/products/search error:", error)
		res.sendStatus(500)
	}
})

// GET /api/products/:id
router.get<IdParam, Product>("/:id", async (req, res) => {
	const id: string = req.params.id

	try {
		const item = await findProductItem(id)

		if (!item) {
			res.sendStatus(404)
			return
		}

		const productFromDb = ProductFromDbSchema.parse(item)
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
		}

		res.status(200).send(product)
	} catch (error) {
		console.error("GET /api/products/:id error:", error)
		res.sendStatus(500)
	}
})

// POST /api/products
router.post<{}, IdResponse, ProductWithoutId>("/", async (req, res) => {
	let body: ProductWithoutId

	try {
		body = ProductSchemaWithoutId.parse(req.body)
	} catch {
		res.sendStatus(400)
		return
	}

	const id = `product-${randomUUID()}`
	const now = new Date().toISOString()

	const command = new PutCommand({
		TableName: TABLE_NAME,
		Item: {
			pk: "PRODUCTS",
			sk: `CATEGORY#${body.category}#PRODUCT#${id}`,
			type: "PRODUCT",
			id,
			...body,
			createdAt: now,
			updatedAt: now,
		},
	})

	try {
		await db.send(command)
		res.status(201).send({ id })
	} catch (error) {
		console.error("POST /api/products error:", error)
		res.sendStatus(500)
	}
})

// PUT /api/products/:id
router.put<IdParam, void, ProductWithoutId>("/:id", async (req, res) => {
	let body: ProductWithoutId

	try {
		body = ProductSchemaWithoutId.parse(req.body)
	} catch {
		res.sendStatus(400)
		return
	}

	const id: string = req.params.id

	try {
		const existing = await findProductItem(id)

		if (!existing) {
			res.sendStatus(404)
			return
		}

		const newSk = `CATEGORY#${body.category}#PRODUCT#${id}`

		await db.send(
			new PutCommand({
				TableName: TABLE_NAME,
				Item: {
					pk: "PRODUCTS",
					sk: newSk,
					type: "PRODUCT",
					id,
					...body,
					createdAt: existing.createdAt,
					updatedAt: new Date().toISOString(),
				},
			}),
		)

		
		if (newSk !== existing.sk) {
			await db.send(
				new DeleteCommand({
					TableName: TABLE_NAME,
					Key: { pk: existing.pk, sk: existing.sk },
				}),
			)
		}

		res.sendStatus(200)
	} catch (error) {
		console.error("PUT /api/products/:id error:", error)
		res.sendStatus(500)
	}
})

// DELETE /api/products/:id
router.delete<IdParam>("/:id", async (req, res) => {
	const id: string = req.params.id

	try {
		const existing = await findProductItem(id)

		if (!existing) {
			res.sendStatus(404)
			return
		}

		await db.send(
			new DeleteCommand({
				TableName: TABLE_NAME,
				Key: { pk: existing.pk, sk: existing.sk },
			}),
		)

		res.sendStatus(204)
	} catch (error) {
		console.error("DELETE /api/products/:id error:", error)
		res.sendStatus(500)
	}
})

export default router