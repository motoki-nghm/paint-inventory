import PaintCard from "@/components/paint/PaintCard";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { COLOR_PRESETS, colorLabel } from "@/lib/db";

function groupLabel(groupBy, key) {
  if (!key) return "未設定";
  if (groupBy === "color") return colorLabel(key);
  return key;
}

function getGroupKey(item, groupBy) {
  if (groupBy === "type") return item.type || "other";
  if (groupBy === "brand") return (item.brand || "").trim() || "未設定";

  if (groupBy === "color") {
    const c = (item.color || "").trim();
    if (!c) return "未設定";
    return COLOR_PRESETS.includes(c) ? c : "（手入力の色）";
  }

  return "未設定";
}

function sortGroupKeys(keys, groupBy) {
  if (groupBy === "type") {
    const order = ["paint", "surfacer", "clear", "thinner", "other"];
    return keys.sort((a, b) => {
      const ia = order.indexOf(a);
      const ib = order.indexOf(b);
      return (ia === -1 ? 999 : ia) - (ib === -1 ? 999 : ib) || a.localeCompare(b);
    });
  }
  return keys.sort((a, b) => a.localeCompare(b, "ja"));
}

export default function PaintList({ items = [], groupBy = "type" }) {
  const map = new Map();
  for (const it of items) {
    const key = getGroupKey(it, groupBy);
    if (!map.has(key)) map.set(key, []);
    map.get(key).push(it);
  }

  const keys = sortGroupKeys(Array.from(map.keys()), groupBy);
  const defaultOpen = keys.slice(0, 1).map((k) => `${groupBy}:${k}`);

  return (
    <Accordion type="multiple" defaultValue={defaultOpen} className="space-y-2">
      {keys.map((k) => {
        const groupItems = map.get(k) || [];
        const value = `${groupBy}:${k}`;

        return (
          <AccordionItem
            key={value}
            value={value}
            className="rounded-lg border border-border bg-card text-card-foreground"
          >
            <AccordionTrigger className="px-3 py-2 hover:no-underline">
              <div className="flex w-full items-center justify-between pr-2">
                <div className="text-sm font-semibold truncate">{groupLabel(groupBy, k)}</div>
                <div className="text-xs text-muted-foreground shrink-0">{groupItems.length} 件</div>
              </div>
            </AccordionTrigger>

            <AccordionContent className="px-3 pb-3">
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
