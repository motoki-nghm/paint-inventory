import { BrowserMultiFormatReader, type IScannerControls } from "@zxing/browser";

export interface ScanHandle {
  stop: () => void;
  /** Toggle the device torch when supported. Returns the new state, or null if unsupported. */
  setTorch?: (on: boolean) => Promise<boolean | null>;
}

export interface StartScanOptions {
  video: HTMLVideoElement;
  onResult: (code: string) => void;
  onError?: (message: string) => void;
  /** ms to wait before re-emitting the same code */
  repeatGuardMs?: number;
}

const VIDEO_CONSTRAINTS: MediaTrackConstraints = {
  facingMode: { ideal: "environment" },
  width: { ideal: 1280 },
  height: { ideal: 720 },
};

function isSecureContextOk() {
  return window.isSecureContext || location.hostname === "localhost";
}

async function tryEnableContinuousFocus(stream: MediaStream | null) {
  try {
    const track = stream?.getVideoTracks()[0];
    const caps = track?.getCapabilities?.() as
      | (MediaTrackCapabilities & { focusMode?: string[] })
      | undefined;
    if (caps?.focusMode?.includes("continuous")) {
      await track!.applyConstraints({
        advanced: [{ focusMode: "continuous" } as MediaTrackConstraintSet],
      });
    }
  } catch {
    // ignore
  }
}

function makeTorchControl(stream: MediaStream | null) {
  return async (on: boolean) => {
    try {
      const track = stream?.getVideoTracks()[0];
      const caps = track?.getCapabilities?.() as
        | (MediaTrackCapabilities & { torch?: boolean })
        | undefined;
      if (!caps?.torch) return null;
      await track!.applyConstraints({
        advanced: [{ torch: on } as MediaTrackConstraintSet],
      });
      return on;
    } catch {
      return null;
    }
  };
}

interface NativeBarcodeDetector {
  detect: (source: ImageBitmapSource) => Promise<{ rawValue: string }[]>;
}

export async function startBarcodeScan({
  video,
  onResult,
  onError,
  repeatGuardMs = 1500,
}: StartScanOptions): Promise<ScanHandle> {
  if (!isSecureContextOk()) {
    onError?.("カメラは HTTPS（または localhost）でのみ利用できます。");
    return { stop: () => {} };
  }

  let lastCode = "";
  let lastAt = 0;
  let stopped = false;
  let stream: MediaStream | null = null;
  let zxingControls: IScannerControls | null = null;
  let raf = 0;

  const stopAll = () => {
    if (stopped) return;
    stopped = true;
    cancelAnimationFrame(raf);
    try {
      zxingControls?.stop();
    } catch {
      // ignore
    }
    zxingControls = null;
    try {
      stream?.getTracks().forEach((t) => t.stop());
    } catch {
      // ignore
    }
    stream = null;
    try {
      video.srcObject = null;
    } catch {
      // ignore
    }
  };

  const emit = (raw: string) => {
    const t = Date.now();
    if (raw && (raw !== lastCode || t - lastAt > repeatGuardMs)) {
      lastCode = raw;
      lastAt = t;
      onResult(raw);
    }
  };

  const NativeBD = (
    window as unknown as {
      BarcodeDetector?: new (opts: { formats: string[] }) => NativeBarcodeDetector;
    }
  ).BarcodeDetector;

  if (NativeBD) {
    try {
      stream = await navigator.mediaDevices.getUserMedia({
        video: VIDEO_CONSTRAINTS,
        audio: false,
      });
      video.srcObject = stream;
      await video.play();
      await tryEnableContinuousFocus(stream);

      const detector = new NativeBD({
        formats: ["ean_13", "ean_8", "upc_a", "upc_e", "code_128", "qr_code"],
      });

      const tick = async () => {
        if (stopped) return;
        try {
          const bitmap = await createImageBitmap(video);
          const codes = await detector.detect(bitmap);
          bitmap.close?.();
          if (codes && codes.length > 0) {
            const raw = codes[0]?.rawValue ?? "";
            if (raw) emit(raw);
          }
        } catch {
          // ignore per-frame errors
        }
        raf = requestAnimationFrame(tick);
      };
      raf = requestAnimationFrame(tick);

      return { stop: stopAll, setTorch: makeTorchControl(stream) };
    } catch {
      onError?.("ネイティブ検出が使えないため、互換モードで再試行します。");
      stopAll();
      stopped = false;
    }
  }

  try {
    const reader = new BrowserMultiFormatReader();
    zxingControls = await reader.decodeFromConstraints(
      { audio: false, video: VIDEO_CONSTRAINTS },
      video,
      (result, err) => {
        if (stopped) return;
        if (result) emit(result.getText());
        if (err && String(err).toLowerCase().includes("notfound")) return;
      },
    );
    // grab the active stream so torch control works in the zxing path
    stream = (video.srcObject as MediaStream | null) ?? null;
    return { stop: stopAll, setTorch: makeTorchControl(stream) };
  } catch (e) {
    const msg =
      e instanceof Error
        ? e.message
        : "カメラの起動に失敗しました。権限・ブラウザ対応をご確認ください。";
    onError?.(msg);
    stopAll();
    return { stop: () => {} };
  }
}
