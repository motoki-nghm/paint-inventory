import { useMemo } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { PaintCard } from "@/components/paint/paint-card";
import { ColorSwatch } from "@/components/paint/color-swatch";
import { colorLabel, isPresetColor, normalizeColor } from "@/lib/color";
import { PAINT_TYPE_LABELS, type GroupBy, type Paint } from "@/types/paint";

interface PaintListProps {
  items: Paint[];
  groupBy: GroupBy;
}

function getGroupKey(item: Paint, groupBy: GroupBy): string {
  if (groupBy === "type") return item.type || "other";
  if (groupBy === "brand") return (item.brand || "").trim() || "未設定";
  if (groupBy === "color") {
    const canon = normalizeColor(item.color);
    return canon || "未設定";
  }
  return "未設定";
}

function groupHeading(groupBy: GroupBy, key: string) {
  if (groupBy === "type") {
    const k = key as keyof typeof PAINT_TYPE_LABELS;
    return PAINT_TYPE_LABELS[k] ?? key;
  }
  if (groupBy === "color") {
    return isPresetColor(key) ? colorLabel(key) : `${key}（手入力）`;
  }
  return key;
}

const TYPE_ORDER = ["paint", "surfacer", "clear", "thinner", "other"];

function sortKeys(keys: string[], groupBy: GroupBy) {
  if (groupBy === "type") {
    return [...keys].sort((a, b) => {
      const ia = TYPE_ORDER.indexOf(a);
      const ib = TYPE_ORDER.indexOf(b);
      return (
        (ia === -1 ? 999 : ia) - (ib === -1 ? 999 : ib) ||
        a.localeCompare(b, "ja")
      );
    });
  }
  return [...keys].sort((a, b) => a.localeCompare(b, "ja"));
}

export function PaintList({ items, groupBy }: PaintListProps) {
  const { keys, groups, defaultOpen } = useMemo(() => {
    const map = new Map<string, Paint[]>();
    for (const it of items) {
      const k = getGroupKey(it, groupBy);
      const arr = map.get(k);
      if (arr) arr.push(it);
      else map.set(k, [it]);
    }
    const keysSorted = sortKeys(Array.from(map.keys()), groupBy);
    const open = keysSorted.slice(0, 1).map((k) => `${groupBy}:${k}`);
    return { keys: keysSorted, groups: map, defaultOpen: open };
  }, [items, groupBy]);

  if (items.length === 0) return null;

  return (
    <Accordion
      type="multiple"
      defaultValue={defaultOpen}
      key={groupBy}
      className="space-y-2"
    >
      {keys.map((k) => {
        const groupItems = groups.get(k) ?? [];
        const value = `${groupBy}:${k}`;
        return (
          <AccordionItem key={value} value={value}>
            <AccordionTrigger>
              <div className="flex min-w-0 flex-1 items-center gap-2 pr-3">
                {groupBy === "color" ? (
                  <ColorSwatch value={k} size="md" />
                ) : null}
                <span className="truncate text-sm font-semibold">
                  {groupHeading(groupBy, k)}
                </span>
                <span className="ml-auto shrink-0 text-xs text-muted-foreground">
                  {groupItems.length} 件
                </span>
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <div className="space-y-2">
                {groupItems.map((item) => (
                  <PaintCard key={item.id} item={item} />
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>
        );
      })}
    </Accordion>
  );
}
