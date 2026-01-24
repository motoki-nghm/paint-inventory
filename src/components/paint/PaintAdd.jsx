import PaintForm from "@/components/paint/PaintForm";

export default function PaintAdd({
  initial,
  onSubmit,
  onCancel,
  hint,
  brandOptions = [],
  pinnedBrands = [],
  bindSubmit,
}) {
  const baseInitial = initial ?? {
    name: "",
    brand: "",
    type: "paint",
    system: "unknown",
    color: "unknown",
    note: "",
    capacity: "",
    qty: 1,
    barcode: "",
    purchasedAt: "",
    imageUrl: "",
    imageDataUrl: "",
  };

  return (
    <PaintForm
      initial={baseInitial}
      submitLabel="登録"
      onSubmit={onSubmit}
      onCancel={onCancel}
      hint={hint}
      brandOptions={brandOptions}
      pinnedBrands={pinnedBrands}
      bindSubmit={bindSubmit}
    />
  );
}
