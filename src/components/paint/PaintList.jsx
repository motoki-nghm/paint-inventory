import PaintCard from "@/components/paint/PaintCard";

export default function PaintList({ items }) {
  if (items.length === 0) {
    return (
      <div className="rounded-lg border border-[rgb(var(--border))] p-4 text-sm text-[rgb(var(--muted-fg))]">
        まだ登録がありません。右上の「追加」または「スキャン」から登録してください。
      </div>
    );
  }
  return (
    <div className="space-y-2">
      {items.map((p) => (
        <PaintCard key={p.id} item={p} />
      ))}
    </div>
  );
}
