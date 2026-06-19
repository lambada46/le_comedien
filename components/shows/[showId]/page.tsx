import Link from "next/link";
import { supabase } from "@/lib/supabase/client";

type PageProps = {
  params: Promise<{
    showId: string;
  }>;
};

export default async function ShowPage({ params }: PageProps) {
  const { showId } = await params;

  const { data: show, error: showError } = await supabase
    .from("shows")
    .select("id, name")
    .eq("id", showId)
    .single();

  const { data: pieces, error: piecesError } = await supabase
    .from("pieces")
    .select("id, name, order_index")
    .eq("show_id", showId)
    .order("order_index");

  const { data: transitions, error: transitionsError } = await supabase
    .from("transitions")
    .select(`
      id,
      order_index,
      transition_type,
      from_piece:from_piece_id(name),
      to_piece:to_piece_id(name),
      actions (
        id,
        name,
        action_type,
        order_index
      )
    `)
    .eq("show_id", showId)
    .order("order_index");

  if (showError || piecesError || transitionsError) {
    return (
      <main className="p-8">
        <p>Error loading show / Erreur de chargement</p>
      </main>
    );
  }

  return (
    <main className="max-w-5xl mx-auto p-8 space-y-8">
      <Link href="/" className="text-sm text-zinc-500 hover:underline">
        ← Back / Retour
      </Link>

      <header>
        <h1 className="text-3xl font-bold">{show?.name}</h1>
        <p className="text-zinc-500">
          Show overview / Vue du spectacle
        </p>
      </header>

      <section>
        <h2 className="text-xl font-semibold mb-3">
          Pieces / Pièces
        </h2>

        <div className="space-y-2">
          {pieces?.map((piece) => (
            <div key={piece.id} className="rounded-lg border p-4">
              <span className="text-sm text-zinc-500">
                #{piece.order_index}
              </span>
              <h3 className="font-medium">{piece.name}</h3>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-3">
          Transitions / Transitions
        </h2>

        <div className="space-y-4">
          {transitions?.map((transition: any) => (
            <div key={transition.id} className="rounded-lg border p-4">
              <div className="mb-3">
                <p className="text-sm text-zinc-500">
                  Transition #{transition.order_index} · {transition.transition_type}
                </p>
                <h3 className="font-medium">
                  {transition.from_piece?.name ?? "Entrance"} →{" "}
                  {transition.to_piece?.name ?? "End"}
                </h3>
              </div>

              <div className="space-y-2">
                {transition.actions?.map((action: any) => (
                  <div
                    key={action.id}
                    className="rounded bg-zinc-50 px-3 py-2 text-sm"
                  >
                    {action.name}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}