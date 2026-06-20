"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export default function CreateShowForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function createShow(event: React.FormEvent) {
    event.preventDefault();

    if (!name.trim()) return;

    setIsCreating(true);
    setError(null);

    const { data, error } = await supabase
      .from("shows")
      .insert({
        name: name.trim(),
      })
      .select("id")
      .single();

    setIsCreating(false);

    if (error) {
      setError(error.message);
      return;
    }

    setName("");
    router.refresh();

    if (data?.id) {
      router.push(`/shows/${data.id}`);
    }
  }

  return (
    <form onSubmit={createShow} className="mb-6 grid gap-3 sm:grid-cols-[1fr_auto]">
      <input
        value={name}
        onChange={(event) => setName(event.target.value)}
        placeholder="Show name / Nom du spectacle"
        className="h-11 rounded-xl border border-stone-300 bg-white px-4 text-sm outline-none transition focus:border-stone-500 focus:ring-4 focus:ring-stone-200"
      />

      <button
        type="submit"
        disabled={isCreating}
        className="h-11 rounded-xl bg-stone-950 px-5 text-sm font-medium text-white transition hover:bg-stone-800 disabled:opacity-50"
      >
        {isCreating ? "Creating..." : "+ New Show"}
      </button>

      {error && <p className="text-sm text-red-600 sm:col-span-2">{error}</p>}
    </form>
  );
}
