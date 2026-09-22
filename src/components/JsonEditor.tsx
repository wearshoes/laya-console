"use client";

export function JsonEditor({
  value,
  onChange,
  rows = 10,
}: {
  value: string;
  onChange: (value: string) => void;
  rows?: number;
}) {
  const lines = Math.max(rows, value.split("\n").length);
  return (
    <div className="overflow-hidden rounded-lg border border-neutral-200 bg-neutral-50 shadow-inner transition focus-within:border-neutral-400 focus-within:shadow-sm">
      <div className="flex">
        <div
          aria-hidden
          className="select-none border-r border-neutral-200 bg-neutral-100/80 px-2 py-3 text-right font-mono text-[11px] leading-5 text-neutral-400"
        >
          {Array.from({ length: lines }, (_, i) => (
            <div key={i}>{i + 1}</div>
          ))}
        </div>
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          spellCheck={false}
          rows={rows}
          className="min-h-[180px] w-full resize-y bg-transparent px-3 py-3 font-mono text-[12px] leading-5 text-neutral-800 outline-none"
        />
      </div>
    </div>
  );
}
