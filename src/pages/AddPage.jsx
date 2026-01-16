import Container from "@/components/layout/Container";
import FixedFooter from "@/components/layout/FixedFooter";
import PaintAdd from "@/components/paint/PaintAdd";
import { Button } from "@/components/ui/button";
import { usePaints } from "@/lib/PaintsProvider";
import { useNavigate } from "react-router-dom";
import { useRef } from "react";

export default function AddPage() {
  const nav = useNavigate();
  const { add } = usePaints();
  const submitRef = useRef(null);


return (
    <>
      {/* フォーム */}
      <Container className="pb-28">
        <PaintAdd
          onSubmit={(draft) => {
            add(draft);
            nav("/");
          }}
          onCancel={() => nav("/")}
          bindSubmit={(fn) => {
            submitRef.current = fn;
          }}
        />
      </Container>

      {/* fixed 登録ボタン */}
      <FixedFooter>
        <Button
          className="w-full h-12 text-base"
          onClick={() => submitRef.current?.()}
        >
          登録する
        </Button>
      </FixedFooter>
    </>
  );
}
