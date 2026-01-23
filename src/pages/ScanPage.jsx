import { useRef } from "react";
import { useNavigate } from "react-router-dom";
import ScanAdd from "@/components/paint/ScanAdd";
import { usePaints } from "@/lib/PaintsProvider";
import Container from "@/components/layout/Container";
import FixedFooter from "@/components/layout/FixedFooter";
import { Button } from "@/components/ui/button";

export default function ScanPage() {
  const nav = useNavigate();
  const { add, brands, pinnedBrands } = usePaints();
  const submitRef = useRef(null);

  return (
    <>
      {/* fixed分の下余白 */}
      <Container className="py-3 space-y-3 pb-28">
        <ScanAdd
          onCancel={() => nav("/")}
          onSave={async (draft) => {
            try {
              const r = await add(draft);

              // ✅ 重複で「キャンセル」されたら add() が null を返す
              if (!r) {
                // ScanAddの入力を確実にクリアしたいので、/scan に再遷移して実質リマウント
                nav(`/scan?reset=${Date.now()}`, { replace: true });
                return;
              }

              nav("/"); // 保存 or qty+1 更新後は一覧へ
            } catch (e) {
              console.error(e);
              alert("保存に失敗しました。もう一度お試しください。");
            }
          }}
          bindSubmit={(fn) => {
            submitRef.current = fn;
          }}
          brandOptions={brands}
          pinnedBrandOptions={pinnedBrands}
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
