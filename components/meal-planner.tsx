'use client'

import { useMemo, useState } from 'react'
import { ArrowRight, Check, Clock3, LoaderCircle, Sparkles, Sun, Utensils, Moon } from 'lucide-react'
import type { Recipe } from '@/lib/supabase/server'

type Guide = {
  title: string
  whyItFits: string
  prepAhead: { item: string; timing: string; detail: string }[]
  ingredients: string[]
  steps: { step: number; title: string; instruction: string; cue: string }[]
  substitutions: string[]
  safety: string[]
}

type MealType = 'breakfast' | 'lunch' | 'dinner'

const mealTypes: { id: MealType; label: string; description: string; icon: typeof Sun }[] = [
  { id: 'breakfast', label: 'Breakfast', description: 'Start the day well', icon: Sun },
  { id: 'lunch', label: 'Lunch', description: 'A satisfying midday meal', icon: Utensils },
  { id: 'dinner', label: 'Dinner', description: 'Slow down and gather', icon: Moon },
]

function matchesMealType(recipe: Recipe, mealType: MealType) {
  const value = `${recipe.category ?? ''} ${recipe.title} ${recipe.description ?? ''}`.toLowerCase()
  return value.includes(mealType)
}

export function MealPlanner({ recipes }: { recipes: Recipe[] }) {
  const [mealType, setMealType] = useState<MealType | null>(null)
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null)
  const [guide, setGuide] = useState<Guide | null>(null)
  const [loading, setLoading] = useState(false)

  const suggestions = useMemo(() => {
    if (!mealType) return []
    const matched = recipes.filter((recipe) => matchesMealType(recipe, mealType))
    return (matched.length ? matched : recipes).slice(0, 6)
  }, [mealType, recipes])

  async function createGuide(recipe: Recipe) {
    setSelectedRecipe(recipe)
    setGuide(null)
    setLoading(true)
    try {
      const response = await fetch('/api/cooking-guide', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...recipe, mealType }),
      })
      if (response.ok) setGuide(await response.json())
    } finally {
      setLoading(false)
    }
  }

  return (
    <section id="meal-planner" className="border-y border-[#ded9cf] bg-[#25352d] px-6 py-16 text-[#f8f6f1] lg:px-10 lg:py-20">
      <div className="mx-auto max-w-7xl">
        <div className="max-w-2xl">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#df9776]">Your cooking companion</p>
          <h2 className="mt-3 font-serif text-4xl tracking-tight sm:text-5xl">What are you in the mood to cook?</h2>
          <p className="mt-5 text-lg leading-8 text-[#c4cbc3]">Tell us which meal you are planning. We&apos;ll suggest recipes from your collection, then walk you through every prep and cooking step.</p>
        </div>

        <div className="mt-10 grid gap-4 md:grid-cols-3" aria-label="Choose a meal">
          {mealTypes.map(({ id, label, description, icon: Icon }) => {
            const active = mealType === id
            return (
              <button key={id} type="button" onClick={() => { setMealType(id); setSelectedRecipe(null); setGuide(null) }} className={`group rounded-2xl border p-5 text-left transition ${active ? 'border-[#df9776] bg-[#b25537]' : 'border-white/15 bg-white/5 hover:border-white/35'}`} aria-pressed={active}>
                <div className="flex items-start justify-between gap-4"><span className={`flex size-11 items-center justify-center rounded-full ${active ? 'bg-white text-[#b25537]' : 'bg-white/10 text-[#df9776]'}`}><Icon className="size-5" /></span><ArrowRight className={`size-5 transition ${active ? 'translate-x-1' : 'opacity-50 group-hover:translate-x-1'}`} /></div>
                <span className="mt-7 block font-serif text-2xl">{label}</span>
                <span className={`mt-1 block text-sm ${active ? 'text-white/80' : 'text-[#c4cbc3]'}`}>{description}</span>
              </button>
            )
          })}
        </div>

        {mealType && <div className="mt-12 grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
          <div>
            <div className="flex items-end justify-between gap-4"><div><p className="text-xs font-bold uppercase tracking-[0.18em] text-[#df9776]">{mealType} ideas</p><h3 className="mt-2 font-serif text-3xl">Choose a recipe</h3></div><span className="text-sm text-[#aeb8ae]">{suggestions.length} suggestions</span></div>
            <div className="mt-5 flex flex-col gap-3">{suggestions.length ? suggestions.map((recipe) => <button key={recipe.id} type="button" onClick={() => createGuide(recipe)} className={`flex items-center gap-4 rounded-2xl border p-4 text-left transition ${selectedRecipe?.id === recipe.id ? 'border-[#df9776] bg-[#b25537]' : 'border-white/15 bg-white/5 hover:border-white/35'}`}><span className="flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-white/10">{recipe.image_url ? <img src={recipe.image_url} alt="" className="size-full object-cover" /> : <Utensils className="size-5 text-[#df9776]" />}</span><span className="min-w-0 flex-1"><span className="block truncate font-serif text-xl">{recipe.title}</span><span className="mt-1 flex items-center gap-2 text-xs text-[#c4cbc3]">{recipe.category ?? 'Recipe'}{recipe.prep_time != null && <><span aria-hidden="true">·</span><Clock3 className="size-3" /> {recipe.prep_time} min</>}</span></span>{selectedRecipe?.id === recipe.id && <Check className="size-5" />}</button>) : <div className="rounded-2xl border border-dashed border-white/20 bg-white/5 p-6 text-sm leading-6 text-[#c4cbc3]">No recipes are available yet. Add authorized recipes to Supabase and they will appear here as {mealType} suggestions.</div>}</div>
          </div>

          <div className="rounded-2xl bg-[#f8f6f1] p-6 text-[#25231f] lg:p-8">
            {!selectedRecipe && <div className="flex min-h-64 flex-col items-center justify-center text-center"><span className="flex size-14 items-center justify-center rounded-full bg-[#eadbd2] text-[#b25537]"><Sparkles className="size-6" /></span><h3 className="mt-5 font-serif text-2xl">Your cooking guide is here</h3><p className="mt-2 max-w-sm text-sm leading-6 text-[#6e6a61]">Select a {mealType} recipe to get prep-ahead tasks, ingredients, and step-by-step instructions.</p></div>}
            {selectedRecipe && <div><div className="flex items-start justify-between gap-4"><div><p className="text-xs font-bold uppercase tracking-[0.18em] text-[#b25537]">Cooking guide</p><h3 className="mt-2 font-serif text-3xl leading-tight">{selectedRecipe.title}</h3></div><Sparkles className="size-5 shrink-0 text-[#b25537]" /></div>{loading && <div className="mt-8 flex items-center gap-2 text-sm text-[#6e6a61]"><LoaderCircle className="size-4 animate-spin" /> Preparing your step-by-step guide...</div>}{guide && <div className="mt-7 flex flex-col gap-7"><p className="text-sm leading-6 text-[#6e6a61]">{guide.whyItFits}</p>{guide.prepAhead.length > 0 && <div><h4 className="font-serif text-2xl">Before you cook</h4><div className="mt-3 flex flex-col gap-3">{guide.prepAhead.map((item) => <div key={item.item} className="rounded-xl bg-[#eee9df] p-3"><p className="text-sm font-semibold">{item.item} <span className="font-normal text-[#b25537]">· {item.timing}</span></p><p className="mt-1 text-sm leading-5 text-[#6e6a61]">{item.detail}</p></div>)}</div></div>}<div><h4 className="font-serif text-2xl">Cook it step by step</h4><ol className="mt-3 flex flex-col gap-4">{guide.steps.map((step) => <li key={step.step} className="flex gap-3"><span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-[#25352d] text-xs font-bold text-white">{step.step}</span><div><p className="text-sm font-semibold">{step.title}</p><p className="mt-1 text-sm leading-6 text-[#6e6a61]">{step.instruction}</p><p className="mt-1 text-xs italic text-[#b25537]">Look for: {step.cue}</p></div></li>)}</ol></div>{guide.safety.length > 0 && <div className="rounded-xl border border-[#dfc8bb] bg-[#f7eee9] p-4"><h4 className="text-sm font-semibold text-[#8d432d]">Kitchen notes</h4><ul className="mt-2 flex list-disc flex-col gap-1 pl-5 text-sm text-[#6e6a61]">{guide.safety.map((note) => <li key={note}>{note}</li>)}</ul></div>}</div>}</div>}
          </div>
        </div>}
      </div>
    </section>
  )
}
