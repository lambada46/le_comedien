import ShowWorkspace, {
  type CandidateScore,
  type PieceObjectAssignment,
  type PiecePerformer,
  type ShowMember,
  type ShowObjectInstance,
  type Transition,
} from "@/components/shows/show-workspace";
import { supabase } from "@/lib/supabase/client";

type PageProps = {
  params: Promise<{
    showId: string;
  }>;
};

type Piece = {
  id: string;
  name: string;
  order_index: number;
};

type Show = {
  id: string;
  name: string;
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
    .select(
      `
      id,
      order_index,
      transition_type,
      from_piece_id,
      to_piece_id,
      from_piece:from_piece_id(name),
      to_piece:to_piece_id(name),
      actions (
        id,
        name,
        action_type,
        order_index
      )
    `,
    )
    .eq("show_id", showId)
    .order("order_index");

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

  const pieceIds = (pieces ?? []).map((piece) => piece.id);

  const { data: piecePerformers, error: piecePerformersError } =
    pieceIds.length > 0
      ? await supabase
          .from("piece_performers")
          .select("piece_id, user_id")
          .in("piece_id", pieceIds)
      : { data: [], error: null };

  const { data: pieceObjectAssignments, error: pieceObjectAssignmentsError } =
    pieceIds.length > 0
      ? await supabase
          .from("piece_object_instances")
          .select("id, piece_id, object_instance_id, position_notes")
          .in("piece_id", pieceIds)
      : { data: [], error: null };

  const typedTransitions = ((transitions ?? []) as unknown as RawTransition[]).map(
    (transition) => ({
      ...transition,
      from_piece: getRelatedPiece(transition.from_piece),
      to_piece: getRelatedPiece(transition.to_piece),
    }),
  );
  const actionIds = typedTransitions.flatMap((transition) =>
    transition.actions.map((action) => action.id),
  );

  const { data: candidateScores } =
    actionIds.length > 0
      ? await supabase
          .from("action_candidate_scores")
          .select(
            "action_id, action_name, user_id, user_name, state, available, unavailable_reason, score",
          )
          .in("action_id", actionIds)
          .order("score", { ascending: false })
      : { data: [] };

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

  if (
    showError ||
    piecesError ||
    transitionsError ||
    showMembersError ||
    showObjectInstancesError ||
    piecePerformersError ||
    pieceObjectAssignmentsError ||
    !show
  ) {
    return (
      <main className="p-8">
        <p>Error loading show / Erreur de chargement</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen px-5 py-8 sm:px-8">
      <div className="mx-auto max-w-6xl">
      <ShowWorkspace
        show={show as Show}
        pieces={(pieces ?? []) as Piece[]}
        transitions={typedTransitions}
        candidateScores={(candidateScores ?? []) as CandidateScore[]}
        members={typedShowMembers}
        objectInstances={typedShowObjectInstances}
        piecePerformers={(piecePerformers ?? []) as PiecePerformer[]}
        pieceObjectAssignments={
          (pieceObjectAssignments ?? []) as PieceObjectAssignment[]
        }
      />
      </div>
    </main>
  );
}

type RawTransition = Omit<Transition, "from_piece" | "to_piece"> & {
  from_piece: { name: string } | { name: string }[] | null;
  to_piece: { name: string } | { name: string }[] | null;
};

function getRelatedPiece(
  piece: { name: string } | { name: string }[] | null,
): { name: string } | null {
  if (Array.isArray(piece)) {
    return piece[0] ?? null;
  }

  return piece;
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
