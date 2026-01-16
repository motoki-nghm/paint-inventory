import PaintForm from "@/components/paint/PaintForm";
import { usePaints } from "@/lib/usePaints";

export default function PaintAdd({ initial = {}, onSubmit, onCancel, hint, bindSubmit }) {
  const { brands } = usePaints();
  const base = {
    name: "",
    brand: "",
    type: "paint",
    color: "",
    note: "",
    capacity: "",
    qty: 1,
    barcode: "",
    purchasedAt: "",
    imageUrl: undefined,
    imageDataUrl: undefined,
    system: "unknown",
    ...initial,
  };

  return (
    <PaintForm
      initial={base}
      submitLabel="保存する"
      onSubmit={onSubmit}
      onCancel={onCancel}
      hint={hint}
      brandOptions={brands}
      bindSubmit={bindSubmit}
    />
  );
}
