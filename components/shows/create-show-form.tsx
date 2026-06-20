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
    <form onSubmit={createShow} className="mb-8 flex gap-3">
      <input
        value={name}
        onChange={(event) => setName(event.target.value)}
        placeholder="Show name / Nom du spectacle"
        className="flex-1 rounded-lg border px-4 py-2"
      />

      <button
        type="submit"
        disabled={isCreating}
        className="rounded-lg bg-black px-4 py-2 text-white disabled:opacity-50"
      >
        {isCreating ? "Creating..." : "+ New Show"}
      </button>

      {error && <p className="text-red-500">{error}</p>}
    </form>
  );
}