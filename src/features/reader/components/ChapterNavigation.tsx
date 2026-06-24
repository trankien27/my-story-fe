import { ChevronLeft, ChevronRight } from "lucide-react";

interface ChapterNavigationProps {
  chapterNumber: number;
  chapterCount: number;
  canGoPrevious: boolean;
  canGoNext: boolean;
  onPrevious: () => void;
  onNext: () => void;
  onBack: () => void;
}

export function ChapterNavigation({
  chapterNumber,
  chapterCount,
  canGoPrevious,
  canGoNext,
  onPrevious,
  onNext,
  onBack,
}: ChapterNavigationProps) {
  return (
    <nav className="mx-auto flex max-w-3xl flex-col items-center gap-4 px-4 py-12 text-white">
      <p className="text-xs font-bold text-zinc-400">Chương {chapterNumber} • {chapterCount} chương</p>
      <div className="flex w-full max-w-md gap-3">
        <button type="button" onClick={onPrevious} disabled={!canGoPrevious} className="flex h-11 flex-1 items-center justify-center gap-1 rounded-xl border border-white/10 bg-zinc-900 text-xs font-bold hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-30">
          <ChevronLeft className="h-4 w-4" /> Chương trước
        </button>
        <button type="button" onClick={onNext} disabled={!canGoNext} className="flex h-11 flex-1 items-center justify-center gap-1 rounded-xl bg-violet-600 text-xs font-bold hover:bg-violet-500 disabled:cursor-not-allowed disabled:opacity-30">
          Chương sau <ChevronRight className="h-4 w-4" />
        </button>
      </div>
      <button type="button" onClick={onBack} className="text-xs font-semibold text-zinc-400 hover:text-violet-300 hover:underline">
        Quay lại trang truyện
      </button>
    </nav>
  );
}
