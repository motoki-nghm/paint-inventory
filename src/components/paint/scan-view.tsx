import { useEffect, useMemo, useRef, useState } from "react";
import { Camera, Flashlight, FlashlightOff, RotateCcw, Search } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { startBarcodeScan, type ScanHandle } from "@/lib/barcode";
import { productLookup } from "@/lib/product-lookup";
import { isLikelyJan } from "@/lib/validators";

type ScanStatus = "idle" | "scanning" | "lookup" | "ready" | "error";

export interface ScanResult {
  barcode: string;
  name: string;
  imageUrl: string;
  source: string;
}

interface ScanViewProps {
  onResult: (result: ScanResult) => void;
  onCancel?: () => void;
  /** Called whenever the user wants to start a fresh scan from the parent. */
  resetSignal?: number;
}

export function ScanView({ onResult, resetSignal = 0 }: ScanViewProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const handleRef = useRef<ScanHandle | null>(null);
  const [status, setStatus] = useState<ScanStatus>("idle");
  const [message, setMessage] = useState("");
  const [torchOn, setTorchOn] = useState(false);
  const [torchAvailable, setTorchAvailable] = useState(false);

  const hint = useMemo(() => {
    if (status === "scanning") return "枠の中にバーコードを合わせてください";
    if (status === "lookup") return "商品情報を取得中…";
    if (status === "ready") return "結果を反映しました";
    if (status === "error") return message || "カメラ起動に失敗しました";
    return "カメラを起動しています…";
  }, [status, message]);

  async function start() {
    setStatus("scanning");
    setMessage("");
    const video = videoRef.current;
    if (!video) return;

    const handle = await startBarcodeScan({
      video,
      repeatGuardMs: 1500,
      onError: (m) => {
        setStatus("error");
        setMessage(m);
      },
      onResult: async (raw) => {
        if (!isLikelyJan(raw)) return;

        try {
          handleRef.current?.stop();
        } catch {
          // ignore
        }
        handleRef.current = null;
        setTorchAvailable(false);
        setTorchOn(false);

        setStatus("lookup");
        let name = "";
        let imageUrl = "";
        let source = "";
        try {
          const r = await productLookup(raw);
          if (r) {
            name = r.name;
            imageUrl = r.imageUrl;
            source = r.source;
          }
        } catch {
          // ignore
        }
        setStatus("ready");
        onResult({ barcode: raw, name, imageUrl, source });
      },
    });
    handleRef.current = handle;

    if (handle.setTorch) {
      // Probe torch availability without actually turning it on
      const probed = await handle.setTorch(false);
      setTorchAvailable(probed !== null);
    }
  }

  useEffect(() => {
    void start();
    return () => {
      try {
        handleRef.current?.stop();
      } catch {
        // ignore
      }
      handleRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resetSignal]);

  const variant =
    status === "error" ? "danger" : status === "ready" ? "success" : "info";

  return (
    <div className="space-y-3">
      <Alert variant={variant}>{hint}</Alert>

      <Card>
        <CardContent className="space-y-3 p-3">
          <div className="relative overflow-hidden rounded-xl border border-border bg-black">
            <video
              ref={videoRef}
              className="h-[280px] w-full object-cover"
              muted
              playsInline
              aria-label="カメラプレビュー"
            />
            <ScannerOverlay status={status} />
            <div className="absolute left-2 top-2 flex flex-wrap gap-1.5">
              <Badge variant="default" className="bg-black/55 backdrop-blur">
                <Camera className="h-3 w-3" aria-hidden />
                {status === "scanning"
                  ? "スキャン中"
                  : status === "lookup"
                    ? "検索中"
                    : status === "ready"
                      ? "完了"
                      : status === "error"
                        ? "停止"
                        : "起動中"}
              </Badge>
            </div>
          </div>

          <div className="flex gap-2">
            <Button
              variant="secondary"
              className="w-full"
              onClick={async () => {
                try {
                  handleRef.current?.stop();
                } catch {
                  // ignore
                }
                handleRef.current = null;
                await start();
              }}
            >
              <RotateCcw className="h-4 w-4" aria-hidden />
              再スキャン
            </Button>
            {torchAvailable ? (
              <Button
                variant="secondary"
                className="w-full"
                onClick={async () => {
                  const next = !torchOn;
                  const r = await handleRef.current?.setTorch?.(next);
                  if (r === null) return;
                  setTorchOn(next);
                }}
              >
                {torchOn ? (
                  <FlashlightOff className="h-4 w-4" aria-hidden />
                ) : (
                  <Flashlight className="h-4 w-4" aria-hidden />
                )}
                ライト
              </Button>
            ) : null}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function ScannerOverlay({ status }: { status: ScanStatus }) {
  return (
    <div className="pointer-events-none absolute inset-0">
      <div className="absolute inset-0 grid place-items-center">
        <div className="relative h-40 w-64 rounded-xl">
          <span className="absolute -left-px -top-px h-6 w-6 rounded-tl-xl border-l-2 border-t-2 border-primary" />
          <span className="absolute -right-px -top-px h-6 w-6 rounded-tr-xl border-r-2 border-t-2 border-primary" />
          <span className="absolute -bottom-px -left-px h-6 w-6 rounded-bl-xl border-b-2 border-l-2 border-primary" />
          <span className="absolute -bottom-px -right-px h-6 w-6 rounded-br-xl border-b-2 border-r-2 border-primary" />
          {status === "scanning" ? (
            <span
              aria-hidden
              className="absolute left-2 right-2 top-1/2 h-px bg-primary shadow-[0_0_8px_2px_hsl(var(--primary))]"
            />
          ) : null}
          {status === "lookup" ? (
            <span className="absolute inset-0 grid place-items-center">
              <Search
                className="h-7 w-7 text-primary animate-pulse"
                aria-hidden
              />
            </span>
          ) : null}
        </div>
      </div>
    </div>
  );
}
