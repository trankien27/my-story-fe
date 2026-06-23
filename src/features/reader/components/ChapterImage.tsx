import { useEffect, useRef, useState } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";
import { ChapterPage } from "../types/chapter.types";

interface ChapterImageProps {
  key?: string;
  page: ChapterPage;
  isFirst: boolean;
  onNear: (pageIndex: number) => void;
  onVisible: (pageIndex: number) => void;
}

export function ChapterImage({ page, isFirst, onNear, onVisible }: ChapterImageProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const nearReported = useRef(false);
  const [status, setStatus] = useState<"loading" | "loaded" | "error">("loading");
  const [retryKey, setRetryKey] = useState(0);

  useEffect(() => {
    const element = containerRef.current;
    if (!element) return;

    const nearObserver = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !nearReported.current) {
        nearReported.current = true;
        onNear(page.index);
      }
    }, { rootMargin: "800px 0px" });

    const visibleObserver = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) onVisible(page.index);
    }, { rootMargin: "-35% 0px -35% 0px", threshold: 0 });

    nearObserver.observe(element);
    visibleObserver.observe(element);
    return () => {
      nearObserver.disconnect();
      visibleObserver.disconnect();
    };
  }, [onNear, onVisible, page.index]);

  const retry = () => {
    setStatus("loading");
    setRetryKey((key) => key + 1);
  };

  return (
    <div
      ref={containerRef}
      data-reader-page-index={page.index}
      className="relative mx-auto w-full overflow-hidden bg-zinc-900"
      style={{ aspectRatio: `${page.width} / ${page.height}` }}
    >
      {status === "loading" && (
        <div className="absolute inset-0 z-10 animate-pulse bg-zinc-900">
          {page.placeholderUrl ? (
            <img
              src={page.placeholderUrl}
              alt=""
              aria-hidden="true"
              className="h-full w-full scale-105 object-cover opacity-40 blur-xl"
            />
          ) : (
            <div className="flex h-full items-center justify-center">
              <div className="h-9 w-9 animate-spin rounded-full border-4 border-zinc-700 border-t-violet-500" />
            </div>
          )}
        </div>
      )}

      {status === "error" && (
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-3 bg-zinc-900 px-6 text-center">
          <AlertTriangle className="h-8 w-8 text-amber-400" />
          <p className="text-sm font-semibold text-zinc-300">Không tải được trang {page.index + 1}</p>
          <button
            type="button"
            onClick={retry}
            className="flex h-10 items-center gap-2 rounded-xl bg-violet-600 px-4 text-xs font-bold text-white hover:bg-violet-500"
          >
            <RefreshCw className="h-4 w-4" /> Thử lại
          </button>
        </div>
      )}

      <img
        key={retryKey}
        src={page.imageUrl}
        alt={`Trang ${page.index + 1}`}
        width={page.width}
        height={page.height}
        loading={isFirst ? "eager" : "lazy"}
        fetchPriority={isFirst ? "high" : "auto"}
        decoding={isFirst ? "auto" : "async"}
        onLoad={() => setStatus("loaded")}
        onError={() => setStatus("error")}
        className={`block h-auto w-full object-contain transition-opacity duration-300 ${status === "loaded" ? "opacity-100" : "opacity-0"}`}
      />
    </div>
  );
}
