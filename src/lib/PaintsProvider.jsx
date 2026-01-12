import React, { createContext, useContext } from "react";
import { usePaints as usePaintsHook } from "@/lib/usePaints";

const PaintsCtx = createContext(null);

export function PaintsProvider({ children }) {
  const paints = usePaintsHook();
  return <PaintsCtx.Provider value={paints}>{children}</PaintsCtx.Provider>;
}

export function usePaints() {
  const v = useContext(PaintsCtx);
  if (!v) throw new Error("usePaints must be used within PaintsProvider");
  return v;
}
