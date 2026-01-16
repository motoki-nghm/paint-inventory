import { useRef } from "react";
import { useNavigate } from "react-router-dom";
import ScanAdd from "@/components/paint/ScanAdd";
import { usePaints } from "@/lib/PaintsProvider";
import Container from "@/components/layout/Container";
import FixedFooter from "@/components/layout/FixedFooter";
import { Button } from "@/components/ui/button";

export default function ScanPage() {
  const nav = useNavigate();
  const { add } = usePaints();
  const submitRef = useRef(null);

  return (
    <>
      {/* fixed分の下余白 */}
      <Container className="py-3 space-y-3 pb-28">
        <ScanAdd
          onCancel={() => nav("/")}
          onSave={async (draft) => {
            try {
              await add(draft);
              nav("/"); // 保存後は一覧へ（おすすめUX）
            } catch (e) {
              console.error(e);
              alert("保存に失敗しました。もう一度お試しください。");
            }
          }}
          bindSubmit={(fn) => {
            submitRef.current = fn;
          }}
        />
      </Container>

      <FixedFooter>
        <div className="flex gap-2">
          <Button variant="secondary" className="w-full h-12" onClick={() => nav("/")}>
            戻る
          </Button>
          <Button className="w-full h-12 text-base" onClick={() => submitRef.current?.()}>
            登録する
          </Button>
        </div>
      </FixedFooter>
    </>
  );
}
