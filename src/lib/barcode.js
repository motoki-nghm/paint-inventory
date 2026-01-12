import { BrowserMultiFormatReader } from "@zxing/browser";

function isSecureContextOk() {
  return window.isSecureContext || location.hostname === "localhost";
}

export async function startBarcodeScan({ video, onResult, onError, repeatGuardMs = 1500 }) {
  if (!isSecureContextOk()) {
    onError?.("カメラは HTTPS（または localhost）でのみ利用できます。Vercel 等にデプロイしてお試しください。");
    return { stop: () => {} };
  }

  let lastCode = "";
  let lastAt = 0;

  const hasNative = "BarcodeDetector" in window && typeof window.BarcodeDetector === "function";

  let zxingControls = null;
  let stream = null;
  let stopped = false;

  const stopAll = () => {
    if (stopped) return;
    stopped = true;

    try {
      zxingControls?.stop();
    } catch {}
    zxingControls = null;

    try {
      stream?.getTracks().forEach((t) => t.stop());
    } catch {}
    stream = null;

    try {
      video.srcObject = null;
    } catch {}
  };

  if (hasNative) {
    try {
      stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: "environment" } },
        audio: false,
      });
      video.srcObject = stream;
      await video.play();

      const detector = new window.BarcodeDetector({
        formats: ["ean_13", "ean_8", "upc_a", "upc_e", "code_128", "qr_code"],
      });

      let raf = 0;
      const tick = async () => {
        if (stopped) return;
        try {
          const bitmap = await createImageBitmap(video);
          const codes = await detector.detect(bitmap);
          bitmap.close?.();
          if (codes && codes.length > 0) {
            const raw = codes[0]?.rawValue || "";
            const t = Date.now();
            if (raw && (raw !== lastCode || t - lastAt > repeatGuardMs)) {
              lastCode = raw;
              lastAt = t;
              onResult(raw);
            }
          }
        } catch {}
        raf = requestAnimationFrame(tick);
      };
      raf = requestAnimationFrame(tick);

      return {
        stop: () => {
          cancelAnimationFrame(raf);
          stopAll();
        },
      };
    } catch (e) {
      onError?.("ネイティブ検出が使えなかったため、互換モードでスキャンします。");
      stopAll();
    }
  }

  try {
    const reader = new BrowserMultiFormatReader();
    zxingControls = await reader.decodeFromConstraints(
      {
        audio: false,
        video: { facingMode: { ideal: "environment" } },
      },
      video,
      (result, err) => {
        if (stopped) return;

        if (result) {
          const raw = result.getText();
          const t = Date.now();
          if (raw && (raw !== lastCode || t - lastAt > repeatGuardMs)) {
            lastCode = raw;
            lastAt = t;
            onResult(raw);
          }
        }

        if (err && String(err).toLowerCase().includes("notfound")) return;
      }
    );

    return { stop: stopAll };
  } catch (e) {
    const msg = e instanceof Error ? e.message : "カメラの起動に失敗しました。権限やブラウザ対応をご確認ください。";
    onError?.(msg);
    stopAll();
    return { stop: () => {} };
  }
}
