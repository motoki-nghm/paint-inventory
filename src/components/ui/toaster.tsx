import { Toaster as SonnerToaster } from "sonner";

export function Toaster() {
  return (
    <SonnerToaster
      position="top-center"
      richColors
      closeButton
      duration={3000}
      theme="dark"
      toastOptions={{
        classNames: {
          toast:
            "group toast bg-card text-card-foreground border border-border shadow-lg rounded-xl",
          description: "text-muted-foreground",
        },
      }}
    />
  );
}

export { toast } from "sonner";
