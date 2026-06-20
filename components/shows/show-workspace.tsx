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
    quantity: "Quantity",
    category: "Category",
    newCategory: "New category",
    createCategory: "Create category",
    selectCategory: "Select category",
    uncategorized: "Uncategorized",
    unnamed: "Unnamed",
    unknownType: "Unknown type",
    instances: "physical objects",
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
    quantity: "Quantité",
    category: "Catégorie",
    newCategory: "Nouvelle catégorie",
    createCategory: "Créer catégorie",
    selectCategory: "Choisir catégorie",
    uncategorized: "Sans catégorie",
    unnamed: "Sans nom",
    unknownType: "Type inconnu",
    instances: "objets physiques",
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
      <header className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
        <Link href="/" className="text-sm font-medium text-stone-500 hover:text-stone-950">
          {t.back}
        </Link>
        <div className="mt-5 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="mb-2 text-xs font-medium uppercase tracking-[0.18em] text-stone-500">
              Le Comédien
            </p>
            <h1 className="text-4xl font-semibold tracking-tight text-stone-950">
              {show.name}
            </h1>
            <p className="mt-2 text-stone-500">{t.showOverview}</p>
          </div>

          <label className="flex items-center gap-2 text-sm text-stone-500">
            {t.language}
            <select
              value={locale}
              onChange={(event) => setLocale(event.target.value as Locale)}
              className="h-10 rounded-xl border border-stone-300 bg-white px-3 text-sm text-stone-950 outline-none transition focus:border-stone-500 focus:ring-4 focus:ring-stone-200"
            >
              <option value="en">English</option>
              <option value="fr">Français</option>
            </select>
          </label>
        </div>
      </header>

      <nav className="rounded-2xl border border-stone-200 bg-white p-2 shadow-sm">
        <div className="grid gap-2 sm:grid-cols-3">
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
      className={`rounded-xl px-4 py-3 text-sm font-medium transition ${
        isActive
          ? "bg-stone-950 text-white shadow-sm"
          : "text-stone-600 hover:bg-stone-100 hover:text-stone-950"
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
    <section className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight text-stone-950">
            {t.pieces}
          </h2>
          <p className="mt-1 text-sm text-stone-500">{t.runningOrder}</p>
        </div>

        <CreatePieceForm showId={show.id} locale={locale} />
      </div>

      {pieces.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-stone-300 bg-stone-50 p-8 text-center text-sm text-stone-500">
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
    <div className="rounded-2xl border border-stone-200 bg-stone-50/60 p-4">
      <form onSubmit={updatePiece} className="grid gap-3">
        <div className="flex items-center justify-between gap-3">
          <span className="rounded-full bg-white px-3 py-1 text-xs font-medium text-stone-500">
            #{piece.order_index}
          </span>
          <Link
            href={`/shows/${showId}/pieces/${piece.id}`}
            className="text-sm font-medium text-stone-500 hover:text-stone-950"
          >
            {t.details}
          </Link>
        </div>

        <input
          value={name}
          onChange={(event) => setName(event.target.value)}
          className="h-10 rounded-xl border border-stone-300 bg-white px-3 text-sm outline-none transition focus:border-stone-500 focus:ring-4 focus:ring-stone-200"
        />
        <label className="grid gap-1 text-sm text-stone-500">
          {t.order}
          <input
            type="number"
            min="1"
            value={orderIndex}
            onChange={(event) => setOrderIndex(event.target.value)}
            className="h-10 rounded-xl border border-stone-300 bg-white px-3 text-sm text-stone-950 outline-none transition focus:border-stone-500 focus:ring-4 focus:ring-stone-200"
          />
        </label>

        <div className="flex flex-wrap gap-2">
          <button
            type="submit"
            disabled={isSaving}
            className="rounded-xl bg-stone-950 px-4 py-2 text-sm font-medium text-white transition hover:bg-stone-800 disabled:opacity-50"
          >
            {t.edit}
          </button>
          <button
            type="button"
            disabled={isSaving}
            onClick={deletePiece}
            className="rounded-xl border border-red-200 bg-white px-4 py-2 text-sm font-medium text-red-600 transition hover:bg-red-50 disabled:opacity-50"
          >
            {t.delete}
          </button>
        </div>
      </form>

      {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
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
    <section className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight text-stone-950">
            {t.members}
          </h2>
          <p className="mt-1 text-sm text-stone-500">{t.membersSubtitle}</p>
        </div>

        <CreateMemberForm showId={show.id} locale={locale} />
      </div>

      {members.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-stone-300 bg-stone-50 p-8 text-center text-sm text-stone-500">
          {t.noMembers}
        </p>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {members.map((member) => (
            <div
              key={member.user_id}
              className="rounded-2xl border border-stone-200 bg-stone-50/60 p-5"
            >
              <h3 className="font-semibold text-stone-950">
                {member.user?.name ?? "Unnamed / Sans nom"}
              </h3>
              <p className="mt-1 text-sm capitalize text-stone-500">
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
  const [extraCategories, setExtraCategories] = useState<string[]>([]);
  const objectGroupsByCategory = useMemo(() => {
    const groupsByObject = objectInstances.reduce<Record<string, ObjectGroup>>(
      (groups, showObjectInstance) => {
        const object = showObjectInstance.object_instance?.object;
        if (!object) return groups;

        groups[object.id] = groups[object.id] ?? {
          objectId: object.id,
          name: object.name,
          category: object.category,
          instances: [],
        };
        groups[object.id].instances.push(showObjectInstance);
        return groups;
      },
      {},
    );

    return Object.values(groupsByObject).reduce<Record<string, ObjectGroup[]>>(
      (groups, objectGroup) => {
        const category = objectGroup.category?.trim() || t.uncategorized;

        groups[category] = groups[category] ?? [];
        groups[category].push(objectGroup);
        return groups;
      },
      {},
    );
  }, [objectInstances, t.uncategorized]);

  const categories = Object.keys(objectGroupsByCategory).sort((a, b) =>
    a.localeCompare(b),
  );
  const categoryOptions = Array.from(
    new Set(
      [
        ...objectInstances
          .map((objectInstance) =>
            objectInstance.object_instance?.object?.category?.trim(),
          )
          .filter((category): category is string => Boolean(category)),
        ...extraCategories,
      ].sort((a, b) => a.localeCompare(b)),
    ),
  );

  return (
    <section className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight text-stone-950">
            {t.objects}
          </h2>
          <p className="mt-1 text-sm text-stone-500">{t.objectsSubtitle}</p>
        </div>

        <CreateObjectForm
          showId={show.id}
          locale={locale}
          categories={categoryOptions}
          onCreateCategory={(category) =>
            setExtraCategories((currentCategories) =>
              currentCategories.includes(category)
                ? currentCategories
                : [...currentCategories, category],
            )
          }
        />
      </div>

      {categories.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-stone-300 bg-stone-50 p-8 text-center text-sm text-stone-500">
          {t.noObjects}
        </p>
      ) : (
        <div className="space-y-6">
          {categories.map((category) => (
            <div key={category} className="space-y-2">
              <h3 className="text-sm font-semibold uppercase tracking-[0.16em] text-stone-500">
                {category}
              </h3>
              <div className="grid gap-3 sm:grid-cols-2">
                {objectGroupsByCategory[category].map((objectGroup) => (
                  <ObjectGroupCard
                    key={objectGroup.objectId}
                    showId={show.id}
                    objectGroup={objectGroup}
                    locale={locale}
                    categories={categoryOptions}
                    onCreateCategory={(category) =>
                      setExtraCategories((currentCategories) =>
                        currentCategories.includes(category)
                          ? currentCategories
                          : [...currentCategories, category],
                      )
                    }
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

type ObjectGroup = {
  objectId: string;
  name: string;
  category: string | null;
  instances: ShowObjectInstance[];
};

function ObjectGroupCard({
  showId,
  objectGroup,
  locale,
  categories,
  onCreateCategory,
}: {
  showId: string;
  objectGroup: ObjectGroup;
  locale: Locale;
  categories: string[];
  onCreateCategory: (category: string) => void;
}) {
  const router = useRouter();
  const t = copy[locale];
  const [name, setName] = useState(objectGroup.name);
  const [category, setCategory] = useState(objectGroup.category ?? "");
  const [quantity, setQuantity] = useState(String(objectGroup.instances.length));
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function updateObject(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const trimmedName = name.trim();
    const trimmedCategory = category.trim();
    const nextQuantity = Number(quantity);

    if (!trimmedName || !Number.isInteger(nextQuantity) || nextQuantity < 1) {
      return;
    }

    setIsSaving(true);
    setError(null);

    const { error: objectError } = await supabase
      .from("objects")
      .update({
        name: trimmedName,
        category: trimmedCategory || null,
      })
      .eq("id", objectGroup.objectId);

    if (objectError) {
      setError(objectError.message);
      setIsSaving(false);
      return;
    }

    const quantityError = await reconcileObjectQuantity(
      showId,
      objectGroup,
      trimmedName,
      nextQuantity,
    );

    setIsSaving(false);

    if (quantityError) {
      setError(quantityError);
      return;
    }

    router.refresh();
  }

  async function deleteObject() {
    setIsSaving(true);
    setError(null);

    const deleteError = await deleteObjectGroup(objectGroup);

    setIsSaving(false);

    if (deleteError) {
      setError(deleteError);
      return;
    }

    router.refresh();
  }

  return (
    <div className="rounded-2xl border border-stone-200 bg-stone-50/60 p-4">
      <form onSubmit={updateObject} className="grid gap-3">
        <input
          value={name}
          onChange={(event) => setName(event.target.value)}
          className="h-10 rounded-xl border border-stone-300 bg-white px-3 text-sm outline-none transition focus:border-stone-500 focus:ring-4 focus:ring-stone-200"
        />
        <CategoryPicker
          category={category}
          categories={categories}
          locale={locale}
          onCategoryChange={setCategory}
          onCreateCategory={onCreateCategory}
        />
        <label className="grid gap-1 text-sm text-stone-500">
          {t.quantity}
          <input
            type="number"
            min="1"
            value={quantity}
            onChange={(event) => setQuantity(event.target.value)}
            className="h-10 rounded-xl border border-stone-300 bg-white px-3 text-sm text-stone-950 outline-none transition focus:border-stone-500 focus:ring-4 focus:ring-stone-200"
          />
        </label>

        <p className="text-sm text-stone-500">
          {objectGroup.instances.length} {t.instances}
        </p>

        <div className="flex flex-wrap gap-2">
          <button
            type="submit"
            disabled={isSaving}
            className="rounded-xl bg-stone-950 px-4 py-2 text-sm font-medium text-white transition hover:bg-stone-800 disabled:opacity-50"
          >
            {t.edit}
          </button>
          <button
            type="button"
            disabled={isSaving}
            onClick={deleteObject}
            className="rounded-xl border border-red-200 bg-white px-4 py-2 text-sm font-medium text-red-600 transition hover:bg-red-50 disabled:opacity-50"
          >
            {t.delete}
          </button>
        </div>
      </form>

      <div className="flex flex-wrap gap-2">
        {objectGroup.instances.map((showObjectInstance) => (
          <span
            key={showObjectInstance.id}
            className="rounded-full border border-stone-200 bg-white px-3 py-1 text-xs text-stone-600"
          >
            {showObjectInstance.object_instance?.label ?? t.unnamed}
          </span>
        ))}
      </div>

      {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
    </div>
  );
}

function CategoryPicker({
  category,
  categories,
  locale,
  onCategoryChange,
  onCreateCategory,
}: {
  category: string;
  categories: string[];
  locale: Locale;
  onCategoryChange: (category: string) => void;
  onCreateCategory: (category: string) => void;
}) {
  const t = copy[locale];
  const [isCreating, setIsCreating] = useState(false);
  const [newCategory, setNewCategory] = useState("");
  const normalizedCategories = Array.from(
    new Set(
      [
        ...categories,
        category.trim() && !categories.includes(category.trim())
          ? category.trim()
          : "",
      ]
        .filter(Boolean)
        .sort((a, b) => a.localeCompare(b)),
    ),
  );

  function createCategory() {
    const trimmedCategory = newCategory.trim();
    if (!trimmedCategory) return;

    onCreateCategory(trimmedCategory);
    onCategoryChange(trimmedCategory);
    setNewCategory("");
    setIsCreating(false);
  }

  return (
    <div className="grid gap-2">
      <select
        value={category}
        onChange={(event) => onCategoryChange(event.target.value)}
        className="h-10 rounded-xl border border-stone-300 bg-white px-3 text-sm outline-none transition focus:border-stone-500 focus:ring-4 focus:ring-stone-200"
      >
        <option value="">{t.selectCategory}</option>
        {normalizedCategories.map((categoryOption) => (
          <option key={categoryOption} value={categoryOption}>
            {categoryOption}
          </option>
        ))}
      </select>

      {isCreating ? (
        <div className="flex gap-2">
          <input
            value={newCategory}
            onChange={(event) => setNewCategory(event.target.value)}
            placeholder={t.newCategory}
            className="min-w-0 flex-1 rounded-xl border border-stone-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-stone-500 focus:ring-4 focus:ring-stone-200"
          />
          <button
            type="button"
            onClick={createCategory}
            className="rounded-xl border border-stone-300 bg-white px-3 py-2 text-sm font-medium transition hover:bg-stone-50"
          >
            {t.createCategory}
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setIsCreating(true)}
          className="justify-self-start text-sm font-medium text-stone-500 hover:text-stone-950"
        >
          {t.newCategory}
        </button>
      )}
    </div>
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
    <form onSubmit={createMember} className="grid gap-2 sm:grid-cols-[1fr_1fr_auto_auto]">
      <input
        value={name}
        onChange={(event) => setName(event.target.value)}
        placeholder={t.name}
        className="h-10 rounded-xl border border-stone-300 bg-white px-3 text-sm outline-none transition focus:border-stone-500 focus:ring-4 focus:ring-stone-200"
      />
      <input
        type="email"
        value={email}
        onChange={(event) => setEmail(event.target.value)}
        placeholder="Email"
        className="h-10 rounded-xl border border-stone-300 bg-white px-3 text-sm outline-none transition focus:border-stone-500 focus:ring-4 focus:ring-stone-200"
      />
      <select
        value={role}
        onChange={(event) => setRole(event.target.value as MemberRole)}
        className="h-10 rounded-xl border border-stone-300 bg-white px-3 text-sm outline-none transition focus:border-stone-500 focus:ring-4 focus:ring-stone-200"
      >
        <option value="performer">performer</option>
        <option value="manager">manager</option>
      </select>
      <button
        type="submit"
        disabled={isSaving}
        className="h-10 rounded-xl bg-stone-950 px-4 text-sm font-medium text-white transition hover:bg-stone-800 disabled:opacity-50"
      >
        {isSaving ? t.adding : t.addMember}
      </button>
      {error && <p className="text-sm text-red-600 sm:col-span-4">{error}</p>}
    </form>
  );
}

function CreateObjectForm({
  showId,
  locale,
  categories,
  onCreateCategory,
}: {
  showId: string;
  locale: Locale;
  categories: string[];
  onCreateCategory: (category: string) => void;
}) {
  const router = useRouter();
  const t = copy[locale];
  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [quantity, setQuantity] = useState("1");
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function createObject(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const trimmedName = name.trim();
    const trimmedCategory = category.trim();
    const parsedQuantity = Number(quantity);

    if (
      !trimmedName ||
      !Number.isInteger(parsedQuantity) ||
      parsedQuantity < 1
    ) {
      return;
    }

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

    const instancesToCreate = Array.from(
      { length: parsedQuantity },
      (_, index) => ({
        object_id: object.id,
        label: `${trimmedName} #${index + 1}`,
      }),
    );

    const { data: objectInstances, error: instanceError } = await supabase
      .from("object_instances")
      .insert(instancesToCreate)
      .select("id");

    if (instanceError) {
      setError(instanceError.message);
      setIsSaving(false);
      return;
    }

    const { error: showObjectError } = await supabase
      .from("show_object_instances")
      .insert(
        (objectInstances ?? []).map((objectInstance) => ({
          show_id: showId,
          object_instance_id: objectInstance.id,
        })),
      );

    setIsSaving(false);

    if (showObjectError) {
      setError(showObjectError.message);
      return;
    }

    setName("");
    setCategory("");
    setQuantity("1");
    router.refresh();
  }

  return (
    <form onSubmit={createObject} className="grid gap-2 lg:grid-cols-[1fr_1fr_8rem_auto]">
      <input
        value={name}
        onChange={(event) => setName(event.target.value)}
        placeholder={t.objectType}
        className="h-10 rounded-xl border border-stone-300 bg-white px-3 text-sm outline-none transition focus:border-stone-500 focus:ring-4 focus:ring-stone-200"
      />
      <CategoryPicker
        category={category}
        categories={categories}
        locale={locale}
        onCategoryChange={setCategory}
        onCreateCategory={onCreateCategory}
      />
      <input
        type="number"
        min="1"
        value={quantity}
        onChange={(event) => setQuantity(event.target.value)}
        placeholder={t.quantity}
        className="h-10 rounded-xl border border-stone-300 bg-white px-3 text-sm outline-none transition focus:border-stone-500 focus:ring-4 focus:ring-stone-200"
      />
      <button
        type="submit"
        disabled={isSaving}
        className="h-10 rounded-xl bg-stone-950 px-4 text-sm font-medium text-white transition hover:bg-stone-800 disabled:opacity-50"
      >
        {isSaving ? t.adding : t.addObject}
      </button>
      {error && <p className="text-sm text-red-600 lg:col-span-4">{error}</p>}
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
    <form onSubmit={createPiece} className="grid gap-2 sm:grid-cols-[1fr_auto]">
      <input
        value={name}
        onChange={(event) => setName(event.target.value)}
        placeholder={t.pieceName}
        className="h-10 rounded-xl border border-stone-300 bg-white px-3 text-sm outline-none transition focus:border-stone-500 focus:ring-4 focus:ring-stone-200"
      />
      <button
        type="submit"
        disabled={isSaving}
        className="h-10 rounded-xl bg-stone-950 px-4 text-sm font-medium text-white transition hover:bg-stone-800 disabled:opacity-50"
      >
        {isSaving ? t.adding : t.addPiece}
      </button>
      {error && <p className="text-sm text-red-600 sm:col-span-2">{error}</p>}
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

async function reconcileObjectQuantity(
  showId: string,
  objectGroup: ObjectGroup,
  objectName: string,
  quantity: number,
): Promise<string | null> {
  const currentQuantity = objectGroup.instances.length;

  if (quantity === currentQuantity) {
    return null;
  }

  if (quantity > currentQuantity) {
    const instancesToCreate = Array.from(
      { length: quantity - currentQuantity },
      (_, index) => ({
        object_id: objectGroup.objectId,
        label: `${objectName} #${currentQuantity + index + 1}`,
      }),
    );

    const { data: newInstances, error: instanceError } = await supabase
      .from("object_instances")
      .insert(instancesToCreate)
      .select("id");

    if (instanceError) return instanceError.message;

    const { error: showObjectError } = await supabase
      .from("show_object_instances")
      .insert(
        (newInstances ?? []).map((instance) => ({
          show_id: showId,
          object_instance_id: instance.id,
        })),
      );

    return showObjectError?.message ?? null;
  }

  const instancesToDelete = objectGroup.instances
    .slice(quantity)
    .map((instance) => instance.object_instance_id);

  return await deleteObjectInstances(instancesToDelete);
}

async function deleteObjectGroup(
  objectGroup: ObjectGroup,
): Promise<string | null> {
  const instanceIds = objectGroup.instances.map(
    (instance) => instance.object_instance_id,
  );

  const instanceDeleteError = await deleteObjectInstances(instanceIds);

  if (instanceDeleteError) {
    return instanceDeleteError;
  }

  const { error: objectError } = await supabase
    .from("objects")
    .delete()
    .eq("id", objectGroup.objectId);

  return objectError?.message ?? null;
}

async function deleteObjectInstances(
  objectInstanceIds: string[],
): Promise<string | null> {
  if (objectInstanceIds.length === 0) {
    return null;
  }

  const { error: pieceObjectError } = await supabase
    .from("piece_object_instances")
    .delete()
    .in("object_instance_id", objectInstanceIds);

  if (pieceObjectError) return pieceObjectError.message;

  const { error: actionObjectError } = await supabase
    .from("action_object_instances")
    .delete()
    .in("object_instance_id", objectInstanceIds);

  if (actionObjectError) return actionObjectError.message;

  const { error: showObjectError } = await supabase
    .from("show_object_instances")
    .delete()
    .in("object_instance_id", objectInstanceIds);

  if (showObjectError) return showObjectError.message;

  const { error: instanceError } = await supabase
    .from("object_instances")
    .delete()
    .in("id", objectInstanceIds);

  return instanceError?.message ?? null;
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
