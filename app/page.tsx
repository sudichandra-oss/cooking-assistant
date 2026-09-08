import { Search, Clock3, Users, SlidersHorizontal, ChefHat, ArrowRight } from 'lucide-react'
import { MealPlanner } from '@/components/meal-planner'
import { createClient, type Recipe } from '@/lib/supabase/server'

async function getRecipes() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('recipes')
    .select('id, title, description, image_url, category, prep_time, cook_time, servings, difficulty')
    .order('created_at', { ascending: false })
    .limit(12)

  if (error) return []
  return (data ?? []) as Recipe[]
}

export default async function Page() {
  const recipes = await getRecipes()
  const categories = [...new Set(recipes.map((recipe) => recipe.category).filter(Boolean))]

  return (
    <main className="min-h-screen bg-[#f8f6f1] text-[#25231f]">
      <header className="border-b border-[#ded9cf] bg-[#f8f6f1]/95">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5 lg:px-10">
          <a href="#top" className="flex items-center gap-3" aria-label="Mise home">
            <span className="flex size-10 items-center justify-center rounded-full bg-[#25352d] text-[#f8f6f1]"><ChefHat className="size-5" /></span>
            <span className="font-serif text-2xl tracking-tight">mise</span>
          </a>
          <nav className="hidden items-center gap-8 text-sm font-medium md:flex" aria-label="Main navigation">
            <a href="#recipes" className="hover:text-[#b25537]">Browse recipes</a>
            <a href="#categories" className="hover:text-[#b25537]">Categories</a>
            <a href="#about" className="hover:text-[#b25537]">About</a>
          </nav>
          <a href="#recipes" className="rounded-full bg-[#b25537] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#934329]">Explore recipes</a>
        </div>
      </header>

      <section id="top" className="mx-auto max-w-7xl px-6 pb-14 pt-16 lg:px-10 lg:pb-20 lg:pt-24">
        <div className="max-w-3xl">
          <p className="mb-5 text-xs font-bold uppercase tracking-[0.25em] text-[#b25537]">Good food, made simple</p>
          <h1 className="font-serif text-5xl leading-[0.98] tracking-[-0.04em] sm:text-7xl">Cook something<br /><em className="font-normal text-[#b25537]">worth remembering.</em></h1>
          <p className="mt-7 max-w-xl text-lg leading-8 text-[#6e6a61]">Thoughtful recipes for everyday cooking. Find your next favorite dish, plan with confidence, and make every meal count.</p>
        </div>
        <form className="mt-10 flex max-w-2xl items-center gap-3 rounded-2xl border border-[#ded9cf] bg-white p-2 shadow-[0_10px_40px_rgba(37,35,31,0.06)]" action="#recipes">
          <Search className="ml-3 size-5 text-[#8d887d]" aria-hidden="true" />
          <input name="q" className="min-w-0 flex-1 bg-transparent px-2 py-3 outline-none placeholder:text-[#9a958b]" placeholder="Search recipes, ingredients, or cuisines" aria-label="Search recipes" />
          <button className="rounded-xl bg-[#25352d] px-5 py-3 text-sm font-semibold text-white hover:bg-[#19271f]" type="submit">Search</button>
        </form>
      </section>

      <section id="recipes" className="border-t border-[#ded9cf] bg-white px-6 py-14 lg:px-10 lg:py-20">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
            <div><p className="text-xs font-bold uppercase tracking-[0.2em] text-[#b25537]">From the kitchen</p><h2 className="mt-3 font-serif text-4xl tracking-tight">Latest recipes</h2></div>
            <button className="flex items-center gap-2 self-start rounded-full border border-[#ded9cf] px-4 py-2.5 text-sm font-semibold hover:border-[#b25537] hover:text-[#b25537]"><SlidersHorizontal className="size-4" /> Filter</button>
          </div>
          {recipes.length === 0 ? <div className="mt-10 rounded-2xl border border-dashed border-[#cfc8bc] bg-[#f8f6f1] px-6 py-16 text-center"><h3 className="font-serif text-2xl">Your recipe collection is ready for its first dish.</h3><p className="mx-auto mt-3 max-w-md text-[#6e6a61]">Add recipes in Supabase and they will appear here automatically. Nothing is being served from placeholder data.</p></div> : <div className="mt-10 grid gap-7 sm:grid-cols-2 lg:grid-cols-3">{recipes.map((recipe) => <article key={recipe.id} className="group overflow-hidden rounded-2xl border border-[#e5e0d7] bg-[#f8f6f1]"><div className="aspect-[4/3] overflow-hidden bg-[#ded9cf]">{recipe.image_url ? <img src={recipe.image_url} alt={recipe.title} className="size-full object-cover transition duration-500 group-hover:scale-105" /> : <div className="flex size-full items-center justify-center text-[#9a958b]"><ChefHat className="size-10" /></div>}</div><div className="p-5"><div className="flex items-center justify-between gap-3 text-xs font-semibold uppercase tracking-wider text-[#b25537]"><span>{recipe.category ?? 'Recipe'}</span><span>{recipe.difficulty ?? ''}</span></div><h3 className="mt-3 font-serif text-2xl leading-tight">{recipe.title}</h3>{recipe.description && <p className="mt-2 line-clamp-2 text-sm leading-6 text-[#6e6a61]">{recipe.description}</p>}<div className="mt-5 flex items-center gap-4 border-t border-[#ded9cf] pt-4 text-xs text-[#6e6a61]">{recipe.prep_time != null && <span className="flex items-center gap-1.5"><Clock3 className="size-4" /> {recipe.prep_time} min</span>}{recipe.servings != null && <span className="flex items-center gap-1.5"><Users className="size-4" /> {recipe.servings}</span>}</div></div></article>)}</div>}
        </div>
      </section>

      <MealPlanner recipes={recipes} />

      <section id="categories" className="mx-auto max-w-7xl px-6 py-16 lg:px-10"><div className="flex flex-col justify-between gap-8 md:flex-row md:items-end"><div><p className="text-xs font-bold uppercase tracking-[0.2em] text-[#b25537]">Find your flavor</p><h2 className="mt-3 font-serif text-4xl tracking-tight">Browse categories</h2></div><a href="#recipes" className="flex items-center gap-2 text-sm font-semibold text-[#b25537]">View all <ArrowRight className="size-4" /></a></div><div className="mt-8 flex flex-wrap gap-3">{categories.length ? categories.map((category) => <a key={category} href={`#recipes-${category}`} className="rounded-full border border-[#cfc8bc] bg-white px-5 py-3 text-sm font-medium hover:border-[#b25537] hover:text-[#b25537]">{category}</a>) : <p className="text-[#6e6a61]">Categories will appear here as your Supabase recipes are added.</p>}</div></section>

      <footer id="about" className="border-t border-[#ded9cf] bg-[#25352d] px-6 py-10 text-[#e8e4da] lg:px-10"><div className="mx-auto flex max-w-7xl flex-col justify-between gap-5 sm:flex-row sm:items-center"><p className="font-serif text-2xl">mise</p><p className="text-sm text-[#b8bdb5]">A better way to cook, one recipe at a time.</p></div></footer>
    </main>
  )
}
