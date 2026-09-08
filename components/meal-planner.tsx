'use client'

import { useMemo, useState } from 'react'
import { ChefHat, Check, LoaderCircle, Sparkles } from 'lucide-react'
import type { Recipe } from '@/lib/supabase/server'

type Guide = { title: string; whyItFits: string; prepAhead: { item: string; timing: string; detail: string }[]; ingredients: string[]; steps: { step: number; title: string; instruction: string; cue: string }[]; substitutions: string[]; safety: string[] }

export function MealPlanner({ recipes }: { recipes: Recipe[] }) {
  const [selected, setSelected] = useState<string[]>([])
  const [activeRecipe, setActiveRecipe] = useState<Recipe | null>(null)
  const [guide, setGuide] = useState<Guide | null>(null)
  const [loading, setLoading] = useState(false)
  const plan = useMemo(() => selected.map((id) => recipes.find((recipe) => recipe.id === id)).filter(Boolean) as Recipe[], [selected, recipes])

  function toggleRecipe(id: string) {
    setSelected((current) => current.includes(id) ? current.filter((item) => item !== id) : current.length < 4 ? [...current, id] : current)
  }

  async function createGuide(recipe: Recipe) {
    setActiveRecipe(recipe); setGuide(null); setLoading(true)
    const response = await fetch('/api/cooking-guide', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(recipe) })
    if (response.ok) setGuide(await response.json())
    setLoading(false)
  }

  if (!recipes.length) return null
  return <section id="meal-planner" className="border-y border-[#ded9cf] bg-[#25352d] px-6 py-16 text-[#f8f6f1] lg:px-10 lg:py-20">
    <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[0.8fr_1.2fr]">
      <div><p className="text-xs font-bold uppercase tracking-[0.2em] text-[#df9776]">Plan your week</p><h2 className="mt-3 font-serif text-4xl tracking-tight sm:text-5xl">Four meals, one calm kitchen.</h2><p className="mt-5 max-w-md leading-7 text-[#c4cbc3]">Choose up to four recipes from your collection. We will turn them into a simple meal plan, then give you an AI cooking guide for the dish you are making today.</p><div className="mt-8 rounded-2xl border border-white/15 bg-white/5 p-5"><p className="text-sm font-semibold">Your four-meal plan</p>{plan.length ? <ol className="mt-4 flex flex-col gap-3">{plan.map((recipe, index) => <li key={recipe.id} className="flex items-center gap-3 text-sm text-[#e8e4da]"><span className="flex size-7 items-center justify-center rounded-full bg-[#b25537] text-xs font-bold">{index + 1}</span>{recipe.title}</li>)}</ol> : <p className="mt-3 text-sm text-[#aeb8ae]">Select recipes on the right to start planning.</p>}</div></div>
      <div><div className="grid gap-3 sm:grid-cols-2">{recipes.slice(0, 8).map((recipe) => <button key={recipe.id} onClick={() => toggleRecipe(recipe.id)} className={`flex items-start gap-3 rounded-2xl border p-4 text-left transition ${selected.includes(recipe.id) ? 'border-[#df9776] bg-[#b25537]' : 'border-white/15 bg-white/5 hover:border-white/35'}`}><span className={`mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full border ${selected.includes(recipe.id) ? 'border-white bg-white text-[#b25537]' : 'border-white/40'}`}>{selected.includes(recipe.id) && <Check className="size-3" />}</span><span><span className="block font-serif text-xl leading-tight">{recipe.title}</span><span className="mt-1 block text-xs text-[#c4cbc3]">{recipe.category ?? 'Recipe'}{recipe.prep_time ? ` · ${recipe.prep_time} min prep` : ''}</span></span></button>)}</div><div className="mt-6 rounded-2xl bg-[#f8f6f1] p-6 text-[#25231f]"><div className="flex items-center gap-3"><Sparkles className="size-5 text-[#b25537]" /><div><p className="font-semibold">Need help cooking one?</p><p className="text-sm text-[#6e6a61]">Select a recipe for a step-by-step prep and cooking guide.</p></div></div><div className="mt-4 flex flex-wrap gap-2">{plan.map((recipe) => <button key={recipe.id} onClick={() => createGuide(recipe)} className="rounded-full border border-[#cfc8bc] px-4 py-2 text-sm font-semibold hover:border-[#b25537] hover:text-[#b25537]">Guide: {recipe.title}</button>)}</div>{loading && <div className="mt-5 flex items-center gap-2 text-sm text-[#6e6a61]"><LoaderCircle className="size-4 animate-spin" /> Preparing your kitchen guide...</div>}{guide && activeRecipe && <div className="mt-6 border-t border-[#ded9cf] pt-6"><p className="text-xs font-bold uppercase tracking-[0.18em] text-[#b25537]">{guide.title}</p><p className="mt-2 text-sm leading-6 text-[#6e6a61]">{guide.whyItFits}</p><div className="mt-5 grid gap-5 sm:grid-cols-2"><div><h3 className="font-serif text-2xl">Before you cook</h3><ul className="mt-3 flex flex-col gap-3 text-sm">{guide.prepAhead.map((item) => <li key={item.item}><strong>{item.item}</strong><span className="block text-[#6e6a61]">{item.timing} — {item.detail}</span></li>)}</ul></div><div><h3 className="font-serif text-2xl">Ingredients</h3><ul className="mt-3 list-disc pl-5 text-sm text-[#6e6a61]"><>{guide.ingredients.map((item) => <li key={item}>{item}</li>)}</></ul></div></div><div className="mt-6"><h3 className="font-serif text-2xl">Cook, step by step</h3><ol className="mt-3 flex flex-col gap-4">{guide.steps.map((step) => <li key={step.step} className="flex gap-3 text-sm"><span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-[#25352d] text-white">{step.step}</span><span><strong>{step.title}</strong><span className="block leading-6 text-[#6e6a61]">{step.instruction}</span><span className="mt-1 block text-xs font-semibold text-[#b25537]">Look for: {step.cue}</span></span></li>)}</ol></div></div>}</div></div>
    </div>
  </section>
}
