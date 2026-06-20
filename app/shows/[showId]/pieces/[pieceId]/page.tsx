import Link from "next/link";
import PieceDetailWorkspace from "@/components/shows/piece-detail-workspace";
import {
  type PieceObjectAssignment,
  type PiecePerformer,
  type ShowMember,
  type ShowObjectInstance,
} from "@/components/shows/show-workspace";
import { supabase } from "@/lib/supabase/client";

type PageProps = {
  params: Promise<{
    showId: string;
    pieceId: string;
  }>;
};

export default async function PiecePage({ params }: PageProps) {
  const { showId, pieceId } = await params;

  const { data: show, error: showError } = await supabase
    .from("shows")
    .select("id, name")
    .eq("id", showId)
    .single();

  const { data: piece, error: pieceError } = await supabase
    .from("pieces")
    .select("id, name, order_index")
    .eq("id", pieceId)
    .eq("show_id", showId)
    .single();

  const { data: showMembers, error: showMembersError } = await supabase
    .from("show_members")
    .select(
      `
      user_id,
      role,
      user:users (
        id,
        name
      )
    `,
    )
    .eq("show_id", showId);

  const { data: showObjectInstances, error: showObjectInstancesError } =
    await supabase
      .from("show_object_instances")
      .select(
        `
        id,
        notes,
        object_instance_id,
        object_instance:object_instances (
          id,
          label,
          status,
          notes,
          object:objects (
            id,
            name,
            category
          )
        )
      `,
      )
      .eq("show_id", showId);

  const { data: incidents, error: incidentsError } = await supabase
    .from("incidents")
    .select("id, name")
    .order("name");

  const { data: piecePerformers, error: piecePerformersError } = await supabase
    .from("piece_performers")
    .select("piece_id, user_id")
    .eq("piece_id", pieceId);

  const { data: pieceObjectAssignments, error: pieceObjectAssignmentsError } =
    await supabase
      .from("piece_object_instances")
      .select("id, piece_id, object_instance_id, position_notes")
      .eq("piece_id", pieceId);

  const { data: pieceIncidents, error: pieceIncidentsError } = await supabase
    .from("piece_incidents")
    .select("piece_id, incident_id")
    .eq("piece_id", pieceId);

  if (
    showError ||
    pieceError ||
    showMembersError ||
    showObjectInstancesError ||
    incidentsError ||
    piecePerformersError ||
    pieceObjectAssignmentsError ||
    pieceIncidentsError ||
    !show ||
    !piece
  ) {
    return (
      <main className="p-8">
        <p>Error loading piece</p>
      </main>
    );
  }

  const typedShowMembers = (
    (showMembers ?? []) as unknown as RawShowMember[]
  ).map((member) => ({
    ...member,
    user: getRelatedItem(member.user),
  }));

  const typedShowObjectInstances = (
    (showObjectInstances ?? []) as unknown as RawShowObjectInstance[]
  ).map((showObjectInstance) => ({
    ...showObjectInstance,
    object_instance: normalizeObjectInstance(
      showObjectInstance.object_instance,
    ),
  }));

  return (
    <main className="min-h-screen px-5 py-8 sm:px-8">
      <div className="mx-auto max-w-5xl space-y-8">
        <header className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
          <Link
            href={`/shows/${show.id}`}
            className="text-sm font-medium text-stone-500 hover:text-stone-950"
          >
            Back
          </Link>

          <div className="mt-5">
            <p className="mb-2 text-xs font-medium uppercase tracking-[0.18em] text-stone-500">
              {show.name}
            </p>
            <h1 className="text-4xl font-semibold tracking-tight text-stone-950">
              {piece.name}
            </h1>
          </div>
        </header>

        <PieceDetailWorkspace
          piece={piece}
          members={typedShowMembers}
          objectInstances={typedShowObjectInstances}
          incidents={incidents ?? []}
          piecePerformers={(piecePerformers ?? []) as PiecePerformer[]}
          pieceObjectAssignments={
            (pieceObjectAssignments ?? []) as PieceObjectAssignment[]
          }
          pieceIncidents={pieceIncidents ?? []}
        />
      </div>
    </main>
  );
}

type RawShowMember = Omit<ShowMember, "user"> & {
  user: { id: string; name: string } | { id: string; name: string }[] | null;
};

type RawShowObjectInstance = Omit<
  ShowObjectInstance,
  "object_instance"
> & {
  object_instance:
    | RawObjectInstance
    | RawObjectInstance[]
    | null;
};

type RawObjectInstance = Omit<
  NonNullable<ShowObjectInstance["object_instance"]>,
  "object"
> & {
  object:
    | { id: string; name: string; category: string | null }
    | { id: string; name: string; category: string | null }[]
    | null;
};

function getRelatedItem<T>(item: T | T[] | null): T | null {
  if (Array.isArray(item)) {
    return item[0] ?? null;
  }

  return item;
}

function normalizeObjectInstance(
  instance: RawObjectInstance | RawObjectInstance[] | null,
): ShowObjectInstance["object_instance"] {
  const relatedInstance = getRelatedItem(instance);

  if (!relatedInstance) {
    return null;
  }

  return {
    ...relatedInstance,
    object: getRelatedItem(relatedInstance.object),
  };
}
