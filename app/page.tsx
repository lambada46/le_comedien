import { supabase } from "@/lib/supabase/client";
import ShowList from "@/components/shows/show-list";
import CreateShowForm from "@/components/shows/create-show-form";

export default async function Home() {
  const { data: shows, error } = await supabase
    .from("shows")
    .select("id,name")
    .order("name");

  if (error) {
    return <main className="p-8">Error: {error.message}</main>;
  }

  return (
    <main className="min-h-screen px-5 py-8 sm:px-8">
      <div className="mx-auto max-w-5xl space-y-8">
        <header className="rounded-2xl border border-stone-200 bg-white p-8 shadow-sm">
          <p className="mb-3 text-sm font-medium uppercase tracking-[0.18em] text-stone-500">
            École Jacques Lecoq
          </p>
          <div className="max-w-2xl space-y-3">
            <h1 className="text-4xl font-semibold tracking-tight text-stone-950">
              Le Comédien
            </h1>
            <p className="text-lg leading-7 text-stone-600">
              Organize shows, pieces, stage objects, transitions, and backstage
              tasks in one shared workspace.
            </p>
          </div>
        </header>

        <section className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
          <div className="mb-5 flex flex-wrap items-end justify-between gap-4">
            <div>
              <h2 className="text-xl font-semibold text-stone-950">Shows</h2>
              <p className="text-sm text-stone-500">
                Create a new workspace or continue organizing an existing show.
              </p>
            </div>
          </div>

          <CreateShowForm />

          <ShowList shows={shows ?? []} />
        </section>
      </div>
    </main>
  );
}
