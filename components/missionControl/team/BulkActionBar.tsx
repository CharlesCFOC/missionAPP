"use client";

type BulkActionBarProps = {
  count: number;
  onRemove: () => void;
  onArchive: () => void;
  onEmail: () => void;
};

export default function BulkActionBar({ count, onRemove, onArchive, onEmail }: BulkActionBarProps) {
  if (count === 0) return null;

  return (
    <div className="fixed inset-x-0 bottom-4 z-30">
      <div className="mx-auto max-w-4xl rounded-2xl border border-white/15 bg-white/10 px-4 py-3 shadow-xl backdrop-blur-xl">
        <div className="flex flex-wrap items-center justify-between gap-3 text-white">
          <p className="text-sm text-white/80">
            {count} member{count > 1 ? "s" : ""} selected
          </p>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={onRemove}
              className="rounded-lg bg-red-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-400"
            >
              Remove
            </button>
            <button
              type="button"
              onClick={onArchive}
              className="rounded-lg bg-amber-400 px-4 py-2 text-sm font-semibold text-[#080313] transition hover:bg-amber-300"
            >
              Archive
            </button>
            <button
              type="button"
              onClick={onEmail}
              className="rounded-lg bg-blue-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-400"
            >
              Email
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
