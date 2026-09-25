import * as z from 'zod'

// describes cart-object
export const cartSchema = z.object({
  id: z.string(),
  userId: z.string(),
  productId: z.string(),
  amount: z.number(),
  addedAt: z.string(),
  updatedAt: z.string()
})

// we need this is post?
// are we adding "addedAt & updatedAt"?
export const cartWithoutIdSchema = cartSchema.omit({
   id: true,
   addedAt: true,
   updatedAt: true 
  })

export type Cart = z.infer<typeof cartSchema>

// describes how cart saved in dynamoDB
export const cartFromDbSchema = z.object({
    pk: z.string(),
    sk: z.string(),
    type: z.literal("CART"),

    id: z.string(),
    userId: z.string(),
    productId: z.string(),
    amount: z.number(),
    addedAt: z.string(),
    updatedAt: z.string()
})

export type CartFromDb = z.infer<typeof cartFromDbSchema>