import Container from "@/components/layout/Container";
import FixedFooter from "@/components/layout/FixedFooter";
import PaintAdd from "@/components/paint/PaintAdd";
import { Button } from "@/components/ui/button";
import { usePaints } from "@/lib/PaintsProvider";
import { useNavigate } from "react-router-dom";
import { useRef } from "react";

export default function AddPage() {
  const nav = useNavigate();
  const { add, brands, pinnedBrands } = usePaints();
  const submitRef = useRef(null);

  return (
    <>
      {/* フォーム */}
      <Container className="pb-28">
        <PaintAdd
          onSubmit={(draft) => {
            console.log("AddPage onSubmit draft", draft);
            const r = add(draft);
            console.log("add() returned", r);
            add(draft);
            nav("/");
          }}
          onCancel={() => nav("/")}
          brandOptions={brands}
          pinnedBrands={pinnedBrands}
          bindSubmit={(fn) => {
            submitRef.current = fn;
          }}
        />
      </Container>

      {/* fixed 登録ボタン */}
      <FixedFooter>
        <Button
          className="w-full h-12 text-base"
          onClick={async () => {
            const ok = await submitRef.current?.();
            // ok が false のときはバリデーションで止まってる
          }}
        >
          登録する
        </Button>
      </FixedFooter>
    </>
  );
}
