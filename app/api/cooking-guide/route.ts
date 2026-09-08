import { generateObject } from 'ai'
import { createGateway } from 'ai'
import { z } from 'zod'

const guideSchema = z.object({
  title: z.string(),
  whyItFits: z.string(),
  prepAhead: z.array(z.object({ item: z.string(), timing: z.string(), detail: z.string() })),
  ingredients: z.array(z.string()),
  steps: z.array(z.object({ step: z.number(), title: z.string(), instruction: z.string(), cue: z.string() })),
  substitutions: z.array(z.string()),
  safety: z.array(z.string()),
})

export async function POST(request: Request) {
  const body = await request.json()
  const recipe = body?.recipe
  if (!recipe?.title) return Response.json({ error: 'Choose a recipe first.' }, { status: 400 })

  const gateway = createGateway()
  const { object } = await generateObject({
    model: gateway('openai/gpt-4o-mini'),
    schema: guideSchema,
    system: 'You are a careful home-cooking teacher. Create practical, concise guidance from the supplied recipe record. Never invent missing ingredients as if they came from the database: clearly label reasonable pantry assumptions. Include make-ahead prep, mise en place, step-by-step cooking cues, substitutions, and food safety. Do not claim to have browsed the web.',
    prompt: `Build a cooking guide for this database recipe. The user wants four-meal-plan suggestions and help knowing what to prepare before cooking. Recipe record: ${JSON.stringify(recipe)}`,
  })
  return Response.json(object)
}

export const maxDuration = 30
