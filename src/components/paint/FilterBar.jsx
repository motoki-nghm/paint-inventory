import { PAINT_TYPES, PAINT_SYSTEMS, PAINT_SYSTEM_LABELS } from "@/lib/db";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function FilterBar({ filters, brands, onChange }) {
  return (
    <div className="space-y-2">
      <Input
        placeholder="検索（商品名/メーカー/色/メモ/バーコード）"
        value={filters.q}
        onChange={(e) => onChange({ ...filters, q: e.target.value })}
      />
      <div className="grid grid-cols-2 gap-2">
        <Select value={filters.type} onValueChange={(v) => onChange({ ...filters, type: v })}>
          <SelectTrigger>
            <SelectValue placeholder="種類" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">すべて</SelectItem>
            {PAINT_TYPES.map((t) => (
              <SelectItem key={t} value={t}>
                {t}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={filters.brand} onValueChange={(v) => onChange({ ...filters, brand: v })}>
          <SelectTrigger>
            <SelectValue placeholder="メーカー" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">すべて</SelectItem>
            {brands.map((b) => (
              <SelectItem key={b} value={b}>
                {b}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={filters.system} onValueChange={(v) => onChange({ ...filters, system: v })}>
          <SelectTrigger>
            <SelectValue placeholder="系統" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">すべて</SelectItem>
            {PAINT_SYSTEMS.map((s) => (
              <SelectItem key={s} value={s}>
                {PAINT_SYSTEM_LABELS[s] ?? s}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
