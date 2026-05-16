import { useMemo } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { ToolCard } from "@/components/tool/tool-card";
import {
  TOOL_CATEGORIES,
  TOOL_CATEGORY_LABELS,
  type Tool,
} from "@/types/tool";

const CATEGORY_ORDER: readonly string[] = TOOL_CATEGORIES;

interface ToolListProps {
  items: Tool[];
}

export function ToolList({ items }: ToolListProps) {
  const { keys, groups, defaultOpen } = useMemo(() => {
    const map = new Map<string, Tool[]>();
    for (const it of items) {
      const k = it.category || "other";
      const arr = map.get(k);
      if (arr) arr.push(it);
      else map.set(k, [it]);
    }
    const keysSorted = Array.from(map.keys()).sort((a, b) => {
      const ia = CATEGORY_ORDER.indexOf(a);
      const ib = CATEGORY_ORDER.indexOf(b);
      return (
        (ia === -1 ? 999 : ia) - (ib === -1 ? 999 : ib) ||
        a.localeCompare(b, "ja")
      );
    });
    const open = keysSorted.slice(0, 2).map((k) => `cat:${k}`);
    return { keys: keysSorted, groups: map, defaultOpen: open };
  }, [items]);

  if (items.length === 0) return null;

  return (
    <Accordion type="multiple" defaultValue={defaultOpen} className="space-y-2">
      {keys.map((k) => {
        const groupItems = groups.get(k) ?? [];
        const value = `cat:${k}`;
        return (
          <AccordionItem key={value} value={value}>
            <AccordionTrigger>
              <div className="flex min-w-0 flex-1 items-center gap-2 pr-3">
                <span className="truncate text-sm font-semibold">
                  {TOOL_CATEGORY_LABELS[k as keyof typeof TOOL_CATEGORY_LABELS] ?? k}
                </span>
                <span className="ml-auto shrink-0 text-xs text-muted-foreground">
                  {groupItems.length} 件
                </span>
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <div className="space-y-2">
                {groupItems.map((item) => (
                  <ToolCard key={item.id} item={item} />
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>
        );
      })}
    </Accordion>
  );
}
