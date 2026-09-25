import * as z from 'zod'

export const ProductSchema = z.object({
	id: z.string(),
	name: z.string().min(1),
	price: z.number().positive(),
	image: z.string().min(1),
	amountInStock: z.number().int().min(0),
	description: z.string().min(1),
	category: z.string().min(1),
	createdAt: z.string(),
	updatedAt: z.string()
})

export type Product = z.infer<typeof ProductSchema>

export const ProductSchemaWithoutId = ProductSchema.omit({ 
	id: true, 
	createdAt: true, 
	updatedAt: true 
})

export type ProductWithoutId = z.infer<typeof ProductSchemaWithoutId>

export const ProductFromDbSchema = z.object({
	sk: z.string(),
	pk: z.string(),
	type: z.literal("PRODUCT"),
	id: z.string(),
	price: z.number(),
	name: z.string().min(1),
	image: z.string().min(1),
	amountInStock: z.number().int().min(0),
	description: z.string().min(1),
	category: z.string().min(1),
	createdAt: z.string(),
	updatedAt: z.string()
})

export const ProductListFromDbSchema = z.array(ProductFromDbSchema)
export type ProductFromDb = z.infer<typeof ProductFromDbSchema>