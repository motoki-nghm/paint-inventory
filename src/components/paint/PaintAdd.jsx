import PaintForm from "@/components/paint/PaintForm";

export default function PaintAdd({ initial = {}, onSubmit, onCancel, hint }) {
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
    ...initial,
  };

  return <PaintForm initial={base} submitLabel="保存する" onSubmit={onSubmit} onCancel={onCancel} hint={hint} />;
}
