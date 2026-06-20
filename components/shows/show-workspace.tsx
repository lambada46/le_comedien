"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";

type ActionType = "install" | "remove" | "move" | "clean" | "help" | "other";
type TransitionType = "hidden" | "open";
type MemberRole = "performer" | "manager";
export type Locale = "en" | "fr";
type WorkspaceTab = "pieces" | "members" | "objects";

type Show = {
  id: string;
  name: string;
};

type Piece = {
  id: string;
  name: string;
  order_index: number;
};

export type PiecePerformer = {
  piece_id: string;
  user_id: string;
};

export type PieceObjectAssignment = {
  id: string;
  piece_id: string;
  object_instance_id: string;
  position_notes: string | null;
};

type Action = {
  id: string;
  name: string;
  action_type: ActionType;
  order_index: number;
};

export type Transition = {
  id: string;
  order_index: number;
  transition_type: TransitionType;
  from_piece_id: string | null;
  to_piece_id: string | null;
  from_piece: { name: string } | null;
  to_piece: { name: string } | null;
  actions: Action[];
};

export type CandidateScore = {
  action_id: string;
  action_name: string;
  user_id: string;
  user_name: string;
  state: "EXITING" | "ENTERING" | "STAYING" | "OFFSTAGE" | null;
  available: boolean;
  unavailable_reason:
    | "lights"
    | "sound"
    | "costume_change"
    | "on_stage"
    | "other"
    | null;
  score: number;
};

export type ShowMember = {
  user_id: string;
  role: MemberRole | string | null;
  user: {
    id: string;
    name: string;
  } | null;
};

export type ShowObjectInstance = {
  id: string;
  notes: string | null;
  object_instance_id: string;
  object_instance: {
    id: string;
    label: string;
    status: string | null;
    notes: string | null;
    object: {
      id: string;
      name: string;
      category: string | null;
    } | null;
  } | null;
};

type Props = {
  show: Show;
  pieces: Piece[];
  transitions: Transition[];
  candidateScores: CandidateScore[];
  members: ShowMember[];
  objectInstances: ShowObjectInstance[];
  piecePerformers: PiecePerformer[];
  pieceObjectAssignments: PieceObjectAssignment[];
};

const copy = {
  en: {
    back: "Back",
    language: "Language",
    pieces: "Pieces",
    members: "Comédiens",
    objects: "Objects",
    showOverview: "Show overview",
    addPiece: "Add piece",
    adding: "Adding...",
    pieceName: "Piece name",
    noPieces: "No pieces yet",
    runningOrder: "Running order",
    edit: "Save",
    delete: "Delete",
    details: "Details",
    order: "Order",
    membersSubtitle: "People involved in this show",
    noMembers: "No comédiens yet",
    addMember: "Add comédien",
    name: "Name",
    objectsSubtitle: "Available physical objects by category",
    noObjects: "No objects yet",
    addObject: "Add object",
    objectType: "Type, ex: Chair",
    category: "Category",
    physicalLabel: "Physical label",
    uncategorized: "Uncategorized",
    unnamed: "Unnamed",
    unknownType: "Unknown type",
  },
  fr: {
    back: "Retour",
    language: "Langue",
    pieces: "Pièces",
    members: "Comédiens",
    objects: "Objets",
    showOverview: "Vue du spectacle",
    addPiece: "Ajouter une pièce",
    adding: "Ajout...",
    pieceName: "Nom de la pièce",
    noPieces: "Aucune pièce pour le moment",
    runningOrder: "Ordre du spectacle",
    edit: "Enregistrer",
    delete: "Supprimer",
    details: "Détails",
    order: "Ordre",
    membersSubtitle: "Personnes impliquées dans ce spectacle",
    noMembers: "Aucun comédien pour le moment",
    addMember: "Ajouter un comédien",
    name: "Nom",
    objectsSubtitle: "Objets physiques disponibles par catégorie",
    noObjects: "Aucun objet pour le moment",
    addObject: "Ajouter un objet",
    objectType: "Type, ex: Chaise",
    category: "Catégorie",
    physicalLabel: "Nom physique",
    uncategorized: "Sans catégorie",
    unnamed: "Sans nom",
    unknownType: "Type inconnu",
  },
};

export default function ShowWorkspace({
  show,
  pieces,
  members,
  objectInstances,
}: Props) {
  const [activeTab, setActiveTab] = useState<WorkspaceTab>("pieces");
  const [locale, setLocale] = useState<Locale>("en");
  const t = copy[locale];

  return (
    <div className="space-y-8">
      <header className="space-y-3">
        <Link href="/" className="text-sm text-zinc-500 hover:underline">
          {t.back}
        </Link>
        <div>
          <h1 className="text-3xl font-bold">{show.name}</h1>
          <p className="text-zinc-500">{t.showOverview}</p>
        </div>
      </header>

      <nav className="flex flex-wrap items-center justify-between gap-3 border-b pb-3">
        <div className="flex flex-wrap gap-2">
          <TabButton
            isActive={activeTab === "pieces"}
            onClick={() => setActiveTab("pieces")}
          >
            {t.pieces}
          </TabButton>
          <TabButton
            isActive={activeTab === "members"}
            onClick={() => setActiveTab("members")}
          >
            {t.members}
          </TabButton>
          <TabButton
            isActive={activeTab === "objects"}
            onClick={() => setActiveTab("objects")}
          >
            {t.objects}
          </TabButton>
        </div>

        <label className="flex items-center gap-2 text-sm text-zinc-500">
          {t.language}
          <select
            value={locale}
            onChange={(event) => setLocale(event.target.value as Locale)}
            className="rounded-lg border px-3 py-2 text-sm text-foreground"
          >
            <option value="en">English</option>
            <option value="fr">Français</option>
          </select>
        </label>
      </nav>

      {activeTab === "pieces" && (
        <PiecesTab
          show={show}
          pieces={pieces}
          locale={locale}
        />
      )}

      {activeTab === "members" && (
        <MembersTab show={show} members={members} locale={locale} />
      )}

      {activeTab === "objects" && (
        <ObjectsTab
          show={show}
          objectInstances={objectInstances}
          locale={locale}
        />
      )}
    </div>
  );
}

function TabButton({
  children,
  isActive,
  onClick,
}: {
  children: React.ReactNode;
  isActive: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-lg px-3 py-2 text-sm ${
        isActive ? "bg-black text-white" : "border text-zinc-600"
      }`}
    >
      {children}
    </button>
  );
}

function PiecesTab({
  show,
  pieces,
  locale,
}: {
  show: Show;
  pieces: Piece[];
  locale: Locale;
}) {
  const t = copy[locale];

  return (
    <section className="space-y-3">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold">{t.pieces}</h2>
          <p className="text-sm text-zinc-500">{t.runningOrder}</p>
        </div>

        <CreatePieceForm showId={show.id} locale={locale} />
      </div>

      {pieces.length === 0 ? (
        <p className="rounded-lg border border-dashed p-4 text-sm text-zinc-500">
          {t.noPieces}
        </p>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {pieces.map((piece) => (
            <PieceCard
              key={piece.id}
              showId={show.id}
              piece={piece}
              locale={locale}
            />
          ))}
        </div>
      )}
    </section>
  );
}

function PieceCard({
  showId,
  piece,
  locale,
}: {
  showId: string;
  piece: Piece;
  locale: Locale;
}) {
  const router = useRouter();
  const t = copy[locale];
  const [name, setName] = useState(piece.name);
  const [orderIndex, setOrderIndex] = useState(String(piece.order_index));
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function updatePiece(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsSaving(true);

    const trimmedName = name.trim();
    const nextOrderIndex = Number(orderIndex);

    if (!trimmedName || !Number.isInteger(nextOrderIndex)) {
      setIsSaving(false);
      return;
    }

    const updateError = await updatePieceOrderSafely(
      showId,
      piece,
      trimmedName,
      nextOrderIndex,
    );

    if (updateError) {
      setError(updateError);
      setIsSaving(false);
      return;
    }

    const syncError = await syncTransitions(showId);
    setIsSaving(false);

    if (syncError) {
      setError(syncError);
      return;
    }

    router.refresh();
  }

  async function deletePiece() {
    setIsSaving(true);
    setError(null);

    const resetError = await deleteShowTransitions(showId);

    if (resetError) {
      setError(resetError);
      setIsSaving(false);
      return;
    }

    await supabase.from("piece_performers").delete().eq("piece_id", piece.id);
    await supabase
      .from("piece_object_instances")
      .delete()
      .eq("piece_id", piece.id);
    await supabase.from("piece_incidents").delete().eq("piece_id", piece.id);

    const { error: deleteError } = await supabase
      .from("pieces")
      .delete()
      .eq("id", piece.id);

    if (deleteError) {
      setError(deleteError.message);
      setIsSaving(false);
      return;
    }

    const syncError = await syncTransitions(showId);
    setIsSaving(false);

    if (syncError) {
      setError(syncError);
      return;
    }

    router.refresh();
  }

  return (
    <div className="space-y-4 rounded-lg border p-4">
      <form onSubmit={updatePiece} className="grid gap-3">
        <div className="flex items-center justify-between gap-3">
          <span className="text-sm text-zinc-500">#{piece.order_index}</span>
          <Link
            href={`/shows/${showId}/pieces/${piece.id}`}
            className="text-sm text-zinc-500 hover:underline"
          >
            {t.details}
          </Link>
        </div>

        <input
          value={name}
          onChange={(event) => setName(event.target.value)}
          className="rounded-lg border px-3 py-2 text-sm"
        />
        <label className="grid gap-1 text-sm text-zinc-500">
          {t.order}
          <input
            type="number"
            min="1"
            value={orderIndex}
            onChange={(event) => setOrderIndex(event.target.value)}
            className="rounded-lg border px-3 py-2 text-sm text-foreground"
          />
        </label>

        <div className="flex flex-wrap gap-2">
          <button
            type="submit"
            disabled={isSaving}
            className="rounded-lg bg-black px-3 py-2 text-sm text-white disabled:opacity-50"
          >
            {t.edit}
          </button>
          <button
            type="button"
            disabled={isSaving}
            onClick={deletePiece}
            className="rounded-lg border px-3 py-2 text-sm text-red-600 disabled:opacity-50"
          >
            {t.delete}
          </button>
        </div>
      </form>

      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
}

function MembersTab({
  show,
  members,
  locale,
}: {
  show: Show;
  members: ShowMember[];
  locale: Locale;
}) {
  const t = copy[locale];

  return (
    <section className="space-y-3">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold">{t.members}</h2>
          <p className="text-sm text-zinc-500">{t.membersSubtitle}</p>
        </div>

        <CreateMemberForm showId={show.id} locale={locale} />
      </div>

      {members.length === 0 ? (
        <p className="rounded-lg border border-dashed p-4 text-sm text-zinc-500">
          {t.noMembers}
        </p>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {members.map((member) => (
            <div key={member.user_id} className="rounded-lg border p-4">
              <h3 className="font-medium">
                {member.user?.name ?? "Unnamed / Sans nom"}
              </h3>
              <p className="text-sm text-zinc-500">
                {member.role ?? "performer"}
              </p>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

function ObjectsTab({
  show,
  objectInstances,
  locale,
}: {
  show: Show;
  objectInstances: ShowObjectInstance[];
  locale: Locale;
}) {
  const t = copy[locale];
  const objectsByCategory = useMemo(() => {
    return objectInstances.reduce<Record<string, ShowObjectInstance[]>>(
      (groups, objectInstance) => {
        const category =
          objectInstance.object_instance?.object?.category?.trim() ||
          t.uncategorized;

        groups[category] = groups[category] ?? [];
        groups[category].push(objectInstance);
        return groups;
      },
      {},
    );
  }, [objectInstances, t.uncategorized]);

  const categories = Object.keys(objectsByCategory).sort((a, b) =>
    a.localeCompare(b),
  );

  return (
    <section className="space-y-3">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold">{t.objects}</h2>
          <p className="text-sm text-zinc-500">{t.objectsSubtitle}</p>
        </div>

        <CreateObjectForm showId={show.id} locale={locale} />
      </div>

      {categories.length === 0 ? (
        <p className="rounded-lg border border-dashed p-4 text-sm text-zinc-500">
          {t.noObjects}
        </p>
      ) : (
        <div className="space-y-6">
          {categories.map((category) => (
            <div key={category} className="space-y-2">
              <h3 className="font-semibold">{category}</h3>
              <div className="grid gap-3 sm:grid-cols-2">
                {objectsByCategory[category].map((showObjectInstance) => (
                  <div
                    key={showObjectInstance.id}
                    className="rounded-lg border p-4"
                  >
                    <p className="font-medium">
                      {showObjectInstance.object_instance?.label ??
                        t.unnamed}
                    </p>
                    <p className="text-sm text-zinc-500">
                      {showObjectInstance.object_instance?.object?.name ??
                        t.unknownType}
                    </p>
                    {showObjectInstance.object_instance?.status && (
                      <p className="mt-2 text-xs uppercase tracking-wide text-zinc-500">
                        {showObjectInstance.object_instance.status}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

function CreateMemberForm({
  showId,
  locale,
}: {
  showId: string;
  locale: Locale;
}) {
  const router = useRouter();
  const t = copy[locale];
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<MemberRole>("performer");
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function createMember(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const trimmedName = name.trim();
    const trimmedEmail = email.trim().toLowerCase();
    if (!trimmedName || !trimmedEmail) return;

    setIsSaving(true);
    setError(null);

    const { data: user, error: userError } = await supabase
      .from("users")
      .insert({ name: trimmedName, email: trimmedEmail })
      .select("id")
      .single();

    if (userError) {
      setError(userError.message);
      setIsSaving(false);
      return;
    }

    const { error: memberError } = await supabase.from("show_members").insert({
      show_id: showId,
      user_id: user.id,
      role,
    });

    setIsSaving(false);

    if (memberError) {
      setError(memberError.message);
      return;
    }

    setName("");
    setEmail("");
    setRole("performer");
    router.refresh();
  }

  return (
    <form onSubmit={createMember} className="flex flex-wrap gap-2">
      <input
        value={name}
        onChange={(event) => setName(event.target.value)}
        placeholder={t.name}
        className="min-w-64 rounded-lg border px-3 py-2 text-sm"
      />
      <input
        type="email"
        value={email}
        onChange={(event) => setEmail(event.target.value)}
        placeholder="Email"
        className="min-w-64 rounded-lg border px-3 py-2 text-sm"
      />
      <select
        value={role}
        onChange={(event) => setRole(event.target.value as MemberRole)}
        className="rounded-lg border px-3 py-2 text-sm"
      >
        <option value="performer">performer</option>
        <option value="manager">manager</option>
      </select>
      <button
        type="submit"
        disabled={isSaving}
        className="rounded-lg bg-black px-3 py-2 text-sm text-white disabled:opacity-50"
      >
        {isSaving ? t.adding : t.addMember}
      </button>
      {error && <p className="basis-full text-sm text-red-600">{error}</p>}
    </form>
  );
}

function CreateObjectForm({
  showId,
  locale,
}: {
  showId: string;
  locale: Locale;
}) {
  const router = useRouter();
  const t = copy[locale];
  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [label, setLabel] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function createObject(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const trimmedName = name.trim();
    const trimmedCategory = category.trim();
    const trimmedLabel = label.trim();

    if (!trimmedName) return;

    setIsSaving(true);
    setError(null);

    const { data: object, error: objectError } = await supabase
      .from("objects")
      .insert({
        name: trimmedName,
        category: trimmedCategory || null,
      })
      .select("id")
      .single();

    if (objectError) {
      setError(objectError.message);
      setIsSaving(false);
      return;
    }

    const { data: objectInstance, error: instanceError } = await supabase
      .from("object_instances")
      .insert({
        object_id: object.id,
        label: trimmedLabel || `${trimmedName} #1`,
      })
      .select("id")
      .single();

    if (instanceError) {
      setError(instanceError.message);
      setIsSaving(false);
      return;
    }

    const { error: showObjectError } = await supabase
      .from("show_object_instances")
      .insert({
        show_id: showId,
        object_instance_id: objectInstance.id,
      });

    setIsSaving(false);

    if (showObjectError) {
      setError(showObjectError.message);
      return;
    }

    setName("");
    setCategory("");
    setLabel("");
    router.refresh();
  }

  return (
    <form onSubmit={createObject} className="grid gap-2 sm:grid-cols-4">
      <input
        value={name}
        onChange={(event) => setName(event.target.value)}
        placeholder={t.objectType}
        className="rounded-lg border px-3 py-2 text-sm"
      />
      <input
        value={category}
        onChange={(event) => setCategory(event.target.value)}
        placeholder={t.category}
        className="rounded-lg border px-3 py-2 text-sm"
      />
      <input
        value={label}
        onChange={(event) => setLabel(event.target.value)}
        placeholder={t.physicalLabel}
        className="rounded-lg border px-3 py-2 text-sm"
      />
      <button
        type="submit"
        disabled={isSaving}
        className="rounded-lg bg-black px-3 py-2 text-sm text-white disabled:opacity-50"
      >
        {isSaving ? t.adding : t.addObject}
      </button>
      {error && <p className="sm:col-span-4 text-sm text-red-600">{error}</p>}
    </form>
  );
}

function CreatePieceForm({
  showId,
  locale,
}: {
  showId: string;
  locale: Locale;
}) {
  const router = useRouter();
  const t = copy[locale];
  const [name, setName] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function createPiece(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const trimmedName = name.trim();
    if (!trimmedName) return;

    setIsSaving(true);
    setError(null);

    const { data: lastPiece, error: orderError } = await supabase
      .from("pieces")
      .select("order_index")
      .eq("show_id", showId)
      .order("order_index", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (orderError) {
      setError(orderError.message);
      setIsSaving(false);
      return;
    }

    const nextOrderIndex = (lastPiece?.order_index ?? 0) + 1;

    const { error: insertError } = await supabase.from("pieces").insert({
      show_id: showId,
      name: trimmedName,
      order_index: nextOrderIndex,
    });

    if (insertError) {
      setError(insertError.message);
      setIsSaving(false);
      return;
    }

    const syncError = await syncTransitions(showId);

    if (syncError) {
      setError(syncError);
      setIsSaving(false);
      return;
    }

    setName("");
    setIsSaving(false);
    router.refresh();
  }

  return (
    <form onSubmit={createPiece} className="flex flex-wrap gap-2">
      <input
        value={name}
        onChange={(event) => setName(event.target.value)}
        placeholder={t.pieceName}
        className="min-w-64 rounded-lg border px-3 py-2 text-sm"
      />
      <button
        type="submit"
        disabled={isSaving}
        className="rounded-lg bg-black px-3 py-2 text-sm text-white disabled:opacity-50"
      >
        {isSaving ? t.adding : t.addPiece}
      </button>
      {error && <p className="basis-full text-sm text-red-600">{error}</p>}
    </form>
  );
}

async function syncTransitions(showId: string): Promise<string | null> {
  const { data: pieces, error: piecesError } = await supabase
    .from("pieces")
    .select("id, order_index")
    .eq("show_id", showId)
    .order("order_index");

  if (piecesError) return piecesError.message;
  if (!pieces || pieces.length === 0) return null;

  const { data: transitions, error: transitionsError } = await supabase
    .from("transitions")
    .select("id, from_piece_id, to_piece_id, order_index")
    .eq("show_id", showId);

  if (transitionsError) return transitionsError.message;

  const desiredTransitions = [
    {
      from_piece_id: null,
      to_piece_id: pieces[0].id,
      order_index: 1,
    },
    ...pieces.slice(0, -1).map((piece, index) => ({
      from_piece_id: piece.id,
      to_piece_id: pieces[index + 1].id,
      order_index: index + 2,
    })),
    {
      from_piece_id: pieces[pieces.length - 1].id,
      to_piece_id: null,
      order_index: pieces.length + 1,
    },
  ];

  for (const desiredTransition of desiredTransitions) {
    const existingTransition = transitions?.find(
      (transition) =>
        transition.from_piece_id === desiredTransition.from_piece_id &&
        transition.to_piece_id === desiredTransition.to_piece_id,
    );

    if (existingTransition) {
      if (existingTransition.order_index !== desiredTransition.order_index) {
        const { error } = await supabase
          .from("transitions")
          .update({ order_index: desiredTransition.order_index })
          .eq("id", existingTransition.id);

        if (error) return error.message;
      }

      continue;
    }

    const { error } = await supabase.from("transitions").insert({
      show_id: showId,
      from_piece_id: desiredTransition.from_piece_id,
      to_piece_id: desiredTransition.to_piece_id,
      order_index: desiredTransition.order_index,
      transition_type: "hidden",
    });

    if (error) return error.message;
  }

  return null;
}

async function updatePieceOrderSafely(
  showId: string,
  piece: Piece,
  name: string,
  orderIndex: number,
): Promise<string | null> {
  if (orderIndex === piece.order_index) {
    const { error } = await supabase
      .from("pieces")
      .update({ name, order_index: orderIndex })
      .eq("id", piece.id);

    return error?.message ?? null;
  }

  const temporaryOrderIndex = -Math.abs(Date.now());

  const { error: temporaryError } = await supabase
    .from("pieces")
    .update({ order_index: temporaryOrderIndex })
    .eq("id", piece.id);

  if (temporaryError) return temporaryError.message;

  const { data: existingPiece, error: existingError } = await supabase
    .from("pieces")
    .select("id")
    .eq("show_id", showId)
    .eq("order_index", orderIndex)
    .maybeSingle();

  if (existingError) return existingError.message;

  if (existingPiece) {
    const { error: swapError } = await supabase
      .from("pieces")
      .update({ order_index: piece.order_index })
      .eq("id", existingPiece.id);

    if (swapError) return swapError.message;
  }

  const { error: finalError } = await supabase
    .from("pieces")
    .update({ name, order_index: orderIndex })
    .eq("id", piece.id);

  return finalError?.message ?? null;
}

async function deleteShowTransitions(showId: string): Promise<string | null> {
  const { data: transitions, error: transitionsError } = await supabase
    .from("transitions")
    .select("id")
    .eq("show_id", showId);

  if (transitionsError) return transitionsError.message;

  const transitionIds = transitions?.map((transition) => transition.id) ?? [];
  if (transitionIds.length === 0) return null;

  const { data: actions, error: actionsError } = await supabase
    .from("actions")
    .select("id")
    .in("transition_id", transitionIds);

  if (actionsError) return actionsError.message;

  const actionIds = actions?.map((action) => action.id) ?? [];

  if (actionIds.length > 0) {
    const { error: actionObjectsError } = await supabase
      .from("action_object_instances")
      .delete()
      .in("action_id", actionIds);

    if (actionObjectsError) return actionObjectsError.message;

    const { error: assigneesError } = await supabase
      .from("action_assignees")
      .delete()
      .in("action_id", actionIds);

    if (assigneesError) return assigneesError.message;

    const { error: actionDeleteError } = await supabase
      .from("actions")
      .delete()
      .in("id", actionIds);

    if (actionDeleteError) return actionDeleteError.message;
  }

  const { error: availabilityError } = await supabase
    .from("transition_availability")
    .delete()
    .in("transition_id", transitionIds);

  if (availabilityError) return availabilityError.message;

  const { error: transitionDeleteError } = await supabase
    .from("transitions")
    .delete()
    .in("id", transitionIds);

  return transitionDeleteError?.message ?? null;
}
