"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import {
  type Locale,
  type PieceObjectAssignment,
  type PiecePerformer,
  type ShowMember,
  type ShowObjectInstance,
} from "@/components/shows/show-workspace";

type DetailTab = "members" | "objects" | "incidents";

type Piece = {
  id: string;
  name: string;
  order_index: number;
};

type Incident = {
  id: string;
  name: string;
};

type PieceIncident = {
  piece_id: string;
  incident_id: string;
};

type Props = {
  piece: Piece;
  members: ShowMember[];
  objectInstances: ShowObjectInstance[];
  incidents: Incident[];
  piecePerformers: PiecePerformer[];
  pieceObjectAssignments: PieceObjectAssignment[];
  pieceIncidents: PieceIncident[];
};

const copy = {
  en: {
    language: "Language",
    members: "Comédiens",
    objects: "Objects",
    incidents: "Incidents",
    noMembers: "No performers in this show yet",
    noObjects: "No objects in this show yet",
    noIncidents: "No incidents yet",
    addIncident: "Add incident",
    adding: "Adding...",
    incidentName: "Incident name, ex: Water",
    unnamed: "Unnamed",
    unknownType: "Unknown type",
  },
  fr: {
    language: "Langue",
    members: "Comédiens",
    objects: "Objets",
    incidents: "Incidents",
    noMembers: "Aucun performer dans ce spectacle pour le moment",
    noObjects: "Aucun objet dans ce spectacle pour le moment",
    noIncidents: "Aucun incident pour le moment",
    addIncident: "Ajouter un incident",
    adding: "Ajout...",
    incidentName: "Nom de l'incident, ex: Eau",
    unnamed: "Sans nom",
    unknownType: "Type inconnu",
  },
};

export default function PieceDetailWorkspace({
  piece,
  members,
  objectInstances,
  incidents,
  piecePerformers,
  pieceObjectAssignments,
  pieceIncidents,
}: Props) {
  const [locale, setLocale] = useState<Locale>("en");
  const [activeTab, setActiveTab] = useState<DetailTab>("members");
  const t = copy[locale];

  return (
    <div className="space-y-6">
      <nav className="rounded-2xl border border-stone-200 bg-white p-2 shadow-sm">
        <div className="grid gap-2 sm:grid-cols-3">
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
          <TabButton
            isActive={activeTab === "incidents"}
            onClick={() => setActiveTab("incidents")}
          >
            {t.incidents}
          </TabButton>
        </div>
      </nav>

      <div className="flex justify-end">
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

      {activeTab === "members" && (
        <PieceMembers
          piece={piece}
          members={members}
          piecePerformers={piecePerformers}
          emptyText={t.noMembers}
        />
      )}
      {activeTab === "objects" && (
        <PieceObjects
          piece={piece}
          objectInstances={objectInstances}
          pieceObjectAssignments={pieceObjectAssignments}
          emptyText={t.noObjects}
          unnamedText={t.unnamed}
          unknownTypeText={t.unknownType}
        />
      )}
      {activeTab === "incidents" && (
        <PieceIncidents
          piece={piece}
          incidents={incidents}
          pieceIncidents={pieceIncidents}
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

function PieceMembers({
  piece,
  members,
  piecePerformers,
  emptyText,
}: {
  piece: Piece;
  members: ShowMember[];
  piecePerformers: PiecePerformer[];
  emptyText: string;
}) {
  const performerMembers = members.filter(
    (member) => (member.role ?? "performer") === "performer",
  );
  const selectedIds = useMemo(
    () =>
      new Set(
        piecePerformers
          .filter((performer) => performer.piece_id === piece.id)
          .map((performer) => performer.user_id),
      ),
    [piece.id, piecePerformers],
  );

  if (performerMembers.length === 0) {
    return (
      <p className="rounded-2xl border border-dashed border-stone-300 bg-white p-8 text-center text-sm text-stone-500 shadow-sm">
        {emptyText}
      </p>
    );
  }

  return (
    <CheckboxList
      items={performerMembers.map((member) => ({
        id: member.user_id,
        label: member.user?.name ?? "Unnamed",
        checked: selectedIds.has(member.user_id),
      }))}
      onToggle={async (userId, checked) => {
        return checked
          ? await supabase.from("piece_performers").insert({
              piece_id: piece.id,
              user_id: userId,
            })
          : await supabase
              .from("piece_performers")
              .delete()
              .match({ piece_id: piece.id, user_id: userId });
      }}
    />
  );
}

function PieceObjects({
  piece,
  objectInstances,
  pieceObjectAssignments,
  emptyText,
  unnamedText,
  unknownTypeText,
}: {
  piece: Piece;
  objectInstances: ShowObjectInstance[];
  pieceObjectAssignments: PieceObjectAssignment[];
  emptyText: string;
  unnamedText: string;
  unknownTypeText: string;
}) {
  const selectedIds = useMemo(
    () =>
      new Set(
        pieceObjectAssignments
          .filter((assignment) => assignment.piece_id === piece.id)
          .map((assignment) => assignment.object_instance_id),
      ),
    [piece.id, pieceObjectAssignments],
  );

  if (objectInstances.length === 0) {
    return (
      <p className="rounded-2xl border border-dashed border-stone-300 bg-white p-8 text-center text-sm text-stone-500 shadow-sm">
        {emptyText}
      </p>
    );
  }

  return (
    <CheckboxList
      items={objectInstances.map((showObjectInstance) => ({
        id: showObjectInstance.object_instance_id,
        label: `${
          showObjectInstance.object_instance?.label ?? unnamedText
        } · ${
          showObjectInstance.object_instance?.object?.name ?? unknownTypeText
        }`,
        checked: selectedIds.has(showObjectInstance.object_instance_id),
      }))}
      onToggle={async (objectInstanceId, checked) => {
        return checked
          ? await supabase.from("piece_object_instances").insert({
              piece_id: piece.id,
              object_instance_id: objectInstanceId,
            })
          : await supabase
              .from("piece_object_instances")
              .delete()
              .match({
                piece_id: piece.id,
                object_instance_id: objectInstanceId,
              });
      }}
    />
  );
}

function PieceIncidents({
  piece,
  incidents,
  pieceIncidents,
  locale,
}: {
  piece: Piece;
  incidents: Incident[];
  pieceIncidents: PieceIncident[];
  locale: Locale;
}) {
  const router = useRouter();
  const t = copy[locale];
  const [name, setName] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const selectedIds = useMemo(
    () =>
      new Set(
        pieceIncidents
          .filter((incident) => incident.piece_id === piece.id)
          .map((incident) => incident.incident_id),
      ),
    [piece.id, pieceIncidents],
  );

  async function createIncident(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const trimmedName = name.trim();
    if (!trimmedName) return;

    setIsSaving(true);
    setError(null);

    const { data: incident, error: incidentError } = await supabase
      .from("incidents")
      .insert({ name: trimmedName })
      .select("id")
      .single();

    if (incidentError) {
      setError(incidentError.message);
      setIsSaving(false);
      return;
    }

    const { error: pieceIncidentError } = await supabase
      .from("piece_incidents")
      .insert({ piece_id: piece.id, incident_id: incident.id });

    setIsSaving(false);

    if (pieceIncidentError) {
      setError(pieceIncidentError.message);
      return;
    }

    setName("");
    router.refresh();
  }

  return (
    <div className="space-y-4">
      <form
        onSubmit={createIncident}
        className="rounded-2xl border border-stone-200 bg-white p-4 shadow-sm sm:grid sm:grid-cols-[1fr_auto] sm:gap-2"
      >
        <input
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder={t.incidentName}
          className="h-10 rounded-xl border border-stone-300 bg-white px-3 text-sm outline-none transition focus:border-stone-500 focus:ring-4 focus:ring-stone-200"
        />
        <button
          type="submit"
          disabled={isSaving}
          className="mt-2 h-10 rounded-xl bg-stone-950 px-4 text-sm font-medium text-white transition hover:bg-stone-800 disabled:opacity-50 sm:mt-0"
        >
          {isSaving ? t.adding : t.addIncident}
        </button>
        {error && <p className="text-sm text-red-600 sm:col-span-2">{error}</p>}
      </form>

      {incidents.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-stone-300 bg-white p-8 text-center text-sm text-stone-500 shadow-sm">
          {t.noIncidents}
        </p>
      ) : (
        <CheckboxList
          items={incidents.map((incident) => ({
            id: incident.id,
            label: incident.name,
            checked: selectedIds.has(incident.id),
          }))}
          onToggle={async (incidentId, checked) => {
            return checked
              ? await supabase.from("piece_incidents").insert({
                  piece_id: piece.id,
                  incident_id: incidentId,
                })
              : await supabase
                  .from("piece_incidents")
                  .delete()
                  .match({ piece_id: piece.id, incident_id: incidentId });
          }}
        />
      )}
    </div>
  );
}

function CheckboxList({
  items,
  onToggle,
}: {
  items: { id: string; label: string; checked: boolean }[];
  onToggle: (
    id: string,
    checked: boolean,
  ) => Promise<{ error: { message: string } | null }>;
}) {
  const router = useRouter();
  const [savingId, setSavingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  return (
    <div className="space-y-3">
      <div className="grid gap-3 sm:grid-cols-2">
        {items.map((item) => (
          <label
            key={item.id}
            className={`flex items-center gap-3 rounded-2xl border p-4 text-sm shadow-sm transition ${
              item.checked
                ? "border-stone-900 bg-white text-stone-950"
                : "border-stone-200 bg-white text-stone-600 hover:border-stone-300"
            }`}
          >
            <input
              type="checkbox"
              checked={item.checked}
              disabled={savingId === item.id}
              className="h-4 w-4 accent-stone-950"
              onChange={async (event) => {
                setSavingId(item.id);
                setError(null);

                const { error: mutationError } = await onToggle(
                  item.id,
                  event.target.checked,
                );

                setSavingId(null);

                if (mutationError) {
                  setError(mutationError.message);
                  return;
                }

                router.refresh();
              }}
            />
            <span className="font-medium">{item.label}</span>
          </label>
        ))}
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
}
