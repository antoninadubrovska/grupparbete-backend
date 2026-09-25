import * as z from 'zod'

export const cartSchema = z.object({
  id: z.string(),
  userId: z.string(),
  productId: z.string(),
  amount: z.number(),
  addedAt: z.string(),
  updatedAt: z.string()
})

// we need this is post
// export const cartWithoutIdSchema = cartSchema.omit({ id: true })

export type Cart = z.infer<typeof cartSchema>


