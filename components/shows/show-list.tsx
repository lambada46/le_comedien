import Link from "next/link";

type Show = {
  id: string;
  name: string;
};

export default function ShowList({ shows }: { shows: Show[] }) {
  if (shows.length === 0) {
    return (
      <p className="text-zinc-500">
        No shows yet / Aucun spectacle pour le moment
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {shows.map((show) => (
        <Link
          key={show.id}
          href={`/shows/${show.id}`}
          className="block rounded-lg border p-4 hover:bg-zinc-50"
        >
          <h2 className="font-medium">{show.name}</h2>
          <p className="text-sm text-zinc-500">
            Open show / Ouvrir le spectacle
          </p>
        </Link>
      ))}
    </div>
  );
}