import { ArrowLeft, ChevronLeft, ChevronRight } from "lucide-react";

interface ChapterToolbarProps {
  storyTitle: string;
  chapterTitle: string;
  chapterNumber: number;
  chapterCount: number;
  progress: number;
  canGoPrevious: boolean;
  canGoNext: boolean;
  onBack: () => void;
  onSelectChapter: (chapterNumber: number) => void;
  onPrevious: () => void;
  onNext: () => void;
}

export function ChapterToolbar({
  storyTitle,
  chapterTitle,
  chapterNumber,
  chapterCount,
  progress,
  canGoPrevious,
  canGoNext,
  onBack,
  onSelectChapter,
  onPrevious,
  onNext,
}: ChapterToolbarProps) {
  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-white/10 bg-zinc-950/95 text-white shadow-xl backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-7xl items-center gap-2 px-2 sm:px-4">
        <button type="button" onClick={onBack} className="rounded-lg p-2 text-zinc-300 hover:bg-white/10 hover:text-white" aria-label="Quay lại">
          <ArrowLeft className="h-5 w-5" />
        </button>

        <div className="min-w-0 flex-1">
          <p className="truncate text-xs font-bold sm:text-sm">{storyTitle}</p>
          <p className="truncate text-[10px] font-medium text-violet-300">{chapterTitle}</p>
        </div>

        <button type="button" onClick={onPrevious} disabled={!canGoPrevious} className="rounded-lg p-2 text-zinc-300 hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-30" aria-label="Chương trước">
          <ChevronLeft className="h-5 w-5" />
        </button>

        <select
          value={chapterNumber}
          onChange={(event) => onSelectChapter(Number(event.target.value))}
          className="h-9 max-w-28 rounded-lg border border-white/10 bg-zinc-900 px-2 text-xs font-bold text-white outline-none focus:border-violet-500 sm:max-w-40"
          aria-label="Chọn chương"
        >
          {Array.from({ length: chapterCount }, (_, index) => index + 1).map((number) => (
            <option key={number} value={number}>Chương {number}</option>
          ))}
        </select>

        <button type="button" onClick={onNext} disabled={!canGoNext} className="rounded-lg p-2 text-zinc-300 hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-30" aria-label="Chương sau">
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>

      <div className="h-0.5 bg-zinc-800">
        <div className="h-full bg-violet-500 transition-[width] duration-150" style={{ width: `${progress}%` }} />
      </div>
    </header>
  );
}
