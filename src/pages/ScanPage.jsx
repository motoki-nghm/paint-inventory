import { useNavigate } from "react-router-dom";
import ScanAdd from "@/components/paint/ScanAdd";
import { usePaints } from "@/lib/PaintsProvider";
import Container from "@/components/layout/Container";

export default function ScanPage() {
  const nav = useNavigate();
  const { add } = usePaints();

  return (
    <Container className="py-3 space-y-3">
      <ScanAdd
        onCancel={() => nav("/")}
        onSave={async (draft) => {
          try {
            // draft: PaintFormから来る { name, brand, type, barcode, imageUrl, imageDataUrl... }
            await add(draft);
            nav("/"); // ✅ 保存後は一覧へ
          } catch (e) {
            console.error(e);
            alert("保存に失敗しました。もう一度お試しください。");
          }
        }}
      />
    </Container>
  );
}
