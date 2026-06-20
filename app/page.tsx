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
    <main className="max-w-4xl mx-auto p-8">
      <h1 className="mb-8 text-3xl font-bold">Le Comédien</h1>

      <CreateShowForm />

      <ShowList shows={shows ?? []} />
    </main>
  );
}