import { useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Container } from "@/components/layout/container";
import { FixedFooter } from "@/components/layout/fixed-footer";
import { Button } from "@/components/ui/button";
import { ToolForm } from "@/components/tool/tool-form";
import { useToolsStore } from "@/stores/tools-store";
import { toast } from "@/components/ui/toaster";
import type { ToolDraft } from "@/types/tool";

const BLANK: ToolDraft = {
  name: "",
  brand: "",
  category: "nipper",
  condition: "good",
  qty: 1,
};

export function ToolsAddPage() {
  const nav = useNavigate();
  const add = useToolsStore((s) => s.add);
  const submitRef = useRef<(() => Promise<boolean>) | null>(null);

  return (
    <>
      <Container className="space-y-3 pb-32">
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
      </Container>

      <FixedFooter>
        <Button
          className="w-full"
          size="lg"
          onClick={() => submitRef.current?.()}
        >
          登録する
        </Button>
      </FixedFooter>
    </>
  );
}
