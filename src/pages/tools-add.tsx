import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Container } from "@/components/layout/container";
import { FixedFooter } from "@/components/layout/fixed-footer";
import { Button } from "@/components/ui/button";
import { ToolForm } from "@/components/tool/tool-form";
import { ToolCatalogSearch } from "@/components/tool/tool-catalog-search";
import { useToolsStore } from "@/stores/tools-store";
import { toast } from "@/components/ui/toaster";
import { cn } from "@/lib/utils";
import type { ToolDraft } from "@/types/tool";

const BLANK: ToolDraft = {
  name: "",
  brand: "",
  category: "nipper",
  condition: "good",
  qty: 1,
};

type Tab = "search" | "manual";

export function ToolsAddPage() {
  const nav = useNavigate();
  const add = useToolsStore((s) => s.add);
  const bulkAdd = useToolsStore((s) => s.bulkAdd);
  const submitRef = useRef<(() => Promise<boolean>) | null>(null);
  const [tab, setTab] = useState<Tab>("search");
  const [bulkSubmitting, setBulkSubmitting] = useState(false);

  return (
    <>
      <Container className="space-y-3 pb-32">
        <div role="tablist" className="grid grid-cols-2 gap-1 rounded-xl bg-muted p-1">
          {[
            { id: "search" as const, label: "商品検索" },
            { id: "manual" as const, label: "手入力" },
          ].map((t) => (
            <button
              key={t.id}
              role="tab"
              type="button"
              aria-selected={tab === t.id}
              onClick={() => setTab(t.id)}
              className={cn(
                "rounded-lg py-2 text-sm font-medium transition",
                tab === t.id
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground",
              )}
            >
              {t.label}
            </button>
          ))}
        </div>

        {tab === "search" ? (
          <ToolCatalogSearch
            submitting={bulkSubmitting}
            onBulkSubmit={async (drafts) => {
              setBulkSubmitting(true);
              const added = bulkAdd(drafts);
              setBulkSubmitting(false);
              if (added.length === 0) {
                toast.error("追加に失敗しました");
                return;
              }
              toast.success(`${added.length} 件を追加しました`);
              nav("/tools");
            }}
          />
        ) : (
          <ToolForm
            initial={BLANK}
            submitLabel="登録する"
            onCancel={() => nav("/tools")}
            bindSubmit={(fn) => {
              submitRef.current = fn;
            }}
            onSubmit={async (draft) => {
              add(draft);
              toast.success("登録しました");
              nav("/tools");
            }}
          />
        )}
      </Container>

      {tab === "manual" ? (
        <FixedFooter>
          <Button
            className="w-full"
            size="lg"
            onClick={() => submitRef.current?.()}
          >
            登録する
          </Button>
        </FixedFooter>
      ) : null}
    </>
  );
}
