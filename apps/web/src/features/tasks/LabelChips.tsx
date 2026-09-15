import { useLabels } from "./useLabels";

export function LabelChips({ labelIds, className }: { labelIds: string[]; className?: string }) {
  const { data } = useLabels();
  if (labelIds.length === 0) return null;
  const map = new Map((data?.labels ?? []).map((l) => [l.id, l]));

  return (
    <div className={className ?? "flex flex-wrap gap-1"}>
      {labelIds.map((id) => {
        const label = map.get(id);
        const color = label?.color ?? "#71717a";
        return (
          <span
            key={id}
            style={{ backgroundColor: `${color}22`, color, borderColor: `${color}55` }}
            className="rounded-full border px-1.5 py-0.5 text-[10px] font-medium leading-none"
          >
            {label?.name ?? id}
          </span>
        );
      })}
    </div>
  );
}
