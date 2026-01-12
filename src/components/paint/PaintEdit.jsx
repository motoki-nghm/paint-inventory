import PaintForm from "@/components/paint/PaintForm";

export default function PaintEdit({ initial, onSubmit, onCancel }) {
  return <PaintForm initial={initial} submitLabel="更新する" onSubmit={onSubmit} onCancel={onCancel} />;
}
