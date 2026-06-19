import { supabase } from "@/lib/supabase/client";
import ShowList from "@/components/shows/show-list";

export default async function Home() {
  const { data: shows, error } = await supabase
    .from("shows")
    .select("id,name")
    .order("name");

  if (error) {
    return (
      <main className="p-8">
        Error: {error.message}
      </main>
    );
  }

  return (
    <main className="max-w-4xl mx-auto p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">
          Le Comédien
        </h1>

        <button
          className="
            rounded-lg
            bg-black
            text-white
            px-4
            py-2
          "
        >
          + New Show
        </button>
      </div>

      <ShowList shows={shows ?? []} />
    </main>
  );
}