import { z } from 'zod'

export const {{camel}}BodySchema = z.object({
  // TODO: campos de entrada
})

export type {{Pascal}}Body = z.infer<typeof {{camel}}BodySchema>
