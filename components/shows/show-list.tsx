import Link from "next/link";

type Show = {
  id: string;
  name: string;
};

export default function ShowList({ shows }: { shows: Show[] }) {
  if (shows.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-stone-300 bg-stone-50 p-8 text-center">
        <p className="text-sm font-medium text-stone-700">No shows yet</p>
        <p className="mt-1 text-sm text-stone-500">
          Create your first show to start adding pieces, people, and objects.
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {shows.map((show) => (
        <Link
          key={show.id}
          href={`/shows/${show.id}`}
          className="group block rounded-2xl border border-stone-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-stone-300 hover:shadow-md"
        >
          <h2 className="font-semibold text-stone-950">{show.name}</h2>
          <p className="mt-2 text-sm text-stone-500">
            Open workspace
            <span className="ml-2 transition group-hover:ml-3">→</span>
          </p>
        </Link>
      ))}
    </div>
  );
}
