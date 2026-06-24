import { ArrowLeft, ChevronLeft, ChevronRight, Maximize2, Minimize2, Settings, X } from "lucide-react";

export type ReaderWidth = "compact" | "standard" | "wide" | "full";
export type ReaderTheme = "dark" | "light" | "sepia";

interface ChapterToolbarProps {
  storyTitle: string;
  chapterTitle: string;
  chapterNumber: number;
  chapterNumbers: number[];
  progress: number;
  canGoPrevious: boolean;
  canGoNext: boolean;
  isVisible: boolean;
  isSettingsOpen: boolean;
  imageWidth: ReaderWidth;
  readingTheme: ReaderTheme;
  isFullscreen: boolean;
  onBack: () => void;
  onSelectChapter: (chapterNumber: number) => void;
  onPrevious: () => void;
  onNext: () => void;
  onToggleSettings: () => void;
  onSetImageWidth: (width: ReaderWidth) => void;
  onSetReadingTheme: (theme: ReaderTheme) => void;
  onToggleFullscreen: () => void;
}

export function ChapterToolbar({
  storyTitle,
  chapterTitle,
  chapterNumber,
  chapterNumbers,
  progress,
  canGoPrevious,
  canGoNext,
  isVisible,
  isSettingsOpen,
  imageWidth,
  readingTheme,
  isFullscreen,
  onBack,
  onSelectChapter,
  onPrevious,
  onNext,
  onToggleSettings,
  onSetImageWidth,
  onSetReadingTheme,
  onToggleFullscreen,
}: ChapterToolbarProps) {
  return (
    <>
      <header
        className={`fixed inset-x-0 top-0 z-50 border-b border-white/10 bg-zinc-950/95 text-white shadow-xl backdrop-blur-md transition-transform duration-300 ${isVisible ? "translate-y-0" : "-translate-y-full"}`}
      >
        <div className="mx-auto flex h-14 max-w-7xl items-center gap-2 px-2 sm:px-4">
          <button type="button" onClick={onBack} className="shrink-0 rounded-lg p-2 text-zinc-300 hover:bg-white/10 hover:text-white" aria-label="Quay lại trang truyện" title="Quay lại trang truyện">
            <ArrowLeft className="h-5 w-5" />
          </button>

          <div className="min-w-0 flex-1">
            <p className="truncate text-xs font-bold sm:text-sm">{storyTitle}</p>
            <p className="truncate text-[10px] font-medium text-violet-300">
              Chương {chapterNumber}<span className="hidden sm:inline"> · {chapterTitle}</span>
            </p>
          </div>

          <span className="shrink-0 rounded-md bg-white/5 px-2 py-1 text-[10px] font-bold tabular-nums text-zinc-300" aria-label={`Đã đọc ${Math.round(progress)} phần trăm`}>
            {Math.round(progress)}%
          </span>

          <div className="hidden items-center gap-2 sm:flex">
            <button type="button" onClick={onPrevious} disabled={!canGoPrevious} className="rounded-lg p-2 text-zinc-300 hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-30" aria-label="Chương trước" title="Chương trước">
              <ChevronLeft className="h-5 w-5" />
            </button>

            <select
              value={chapterNumber}
              onChange={(event) => onSelectChapter(Number(event.target.value))}
              className="h-9 max-w-40 rounded-lg border border-white/10 bg-zinc-900 px-2 text-xs font-bold text-white outline-none focus:border-violet-500"
              aria-label="Chọn chương"
            >
              {chapterNumbers.map((number) => (
                <option key={number} value={number}>Chương {number}</option>
              ))}
            </select>

            <button type="button" onClick={onNext} disabled={!canGoNext} className="rounded-lg p-2 text-zinc-300 hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-30" aria-label="Chương sau" title="Chương sau">
              <ChevronRight className="h-5 w-5" />
            </button>

            <button type="button" onClick={onToggleSettings} className={`rounded-lg p-2 hover:bg-white/10 ${isSettingsOpen ? "bg-violet-600 text-white" : "text-zinc-300"}`} aria-label="Cài đặt đọc" title="Cài đặt đọc" aria-expanded={isSettingsOpen}>
              <Settings className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="h-0.5 bg-zinc-800">
          <div className="h-full bg-violet-500 transition-[width] duration-150" style={{ width: `${progress}%` }} />
        </div>
      </header>

      <nav
        className={`fixed inset-x-3 bottom-3 z-50 flex h-14 items-center gap-2 rounded-2xl border border-white/10 bg-zinc-900/95 p-2 text-white shadow-2xl backdrop-blur-md transition-transform duration-300 sm:hidden ${isVisible ? "translate-y-0" : "translate-y-24"}`}
        aria-label="Điều hướng chương"
      >
        <button type="button" onClick={onPrevious} disabled={!canGoPrevious} className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/5 text-zinc-200 disabled:cursor-not-allowed disabled:opacity-30" aria-label="Chương trước">
          <ChevronLeft className="h-5 w-5" />
        </button>

        <select
          value={chapterNumber}
          onChange={(event) => onSelectChapter(Number(event.target.value))}
          className="h-10 min-w-0 flex-1 rounded-xl border border-white/10 bg-zinc-950 px-3 text-center text-xs font-bold text-white outline-none focus:border-violet-500"
          aria-label="Chọn chương"
        >
          {chapterNumbers.map((number) => (
            <option key={number} value={number}>Chương {number}</option>
          ))}
        </select>

        <button type="button" onClick={onNext} disabled={!canGoNext} className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-violet-600 text-white disabled:cursor-not-allowed disabled:opacity-30" aria-label="Chương sau">
          <ChevronRight className="h-5 w-5" />
        </button>

        <button type="button" onClick={onToggleSettings} className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${isSettingsOpen ? "bg-violet-600 text-white" : "bg-white/5 text-zinc-200"}`} aria-label="Cài đặt đọc" aria-expanded={isSettingsOpen}>
          <Settings className="h-5 w-5" />
        </button>
      </nav>

      {isSettingsOpen && (
        <aside className="fixed inset-x-3 bottom-20 z-[60] rounded-2xl border border-white/10 bg-zinc-900/98 p-4 text-white shadow-2xl backdrop-blur-xl sm:inset-x-auto sm:bottom-auto sm:right-4 sm:top-16 sm:w-80" aria-label="Cài đặt trình đọc">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <p className="text-sm font-bold">Cài đặt đọc</p>
              <p className="mt-0.5 text-[10px] text-zinc-400">Tùy chỉnh theo cách bạn thấy thoải mái.</p>
            </div>
            <button type="button" onClick={onToggleSettings} className="rounded-lg p-2 text-zinc-400 hover:bg-white/10 hover:text-white" aria-label="Đóng cài đặt">
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="space-y-4">
            <fieldset>
              <legend className="mb-2 text-[10px] font-bold uppercase tracking-wider text-zinc-400">Chiều rộng ảnh</legend>
              <div className="grid grid-cols-4 gap-1.5">
                {([
                  ["compact", "Gọn"],
                  ["standard", "Vừa"],
                  ["wide", "Rộng"],
                  ["full", "Đầy"],
                ] as const).map(([value, label]) => (
                  <button key={value} type="button" onClick={() => onSetImageWidth(value)} className={`h-9 rounded-lg text-[10px] font-bold transition ${imageWidth === value ? "bg-violet-600 text-white" : "bg-white/5 text-zinc-300 hover:bg-white/10"}`}>
                    {label}
                  </button>
                ))}
              </div>
            </fieldset>

            <fieldset>
              <legend className="mb-2 text-[10px] font-bold uppercase tracking-wider text-zinc-400">Màu nền</legend>
              <div className="grid grid-cols-3 gap-1.5">
                {([
                  ["dark", "Tối", "bg-zinc-950"],
                  ["light", "Sáng", "bg-slate-100"],
                  ["sepia", "Sepia", "bg-amber-100"],
                ] as const).map(([value, label, color]) => (
                  <button key={value} type="button" onClick={() => onSetReadingTheme(value)} className={`flex h-10 items-center justify-center gap-1.5 rounded-lg text-[10px] font-bold transition ${readingTheme === value ? "ring-2 ring-violet-500" : "ring-1 ring-white/10 hover:bg-white/10"}`}>
                    <span className={`h-3 w-3 rounded-full ${color}`} /> {label}
                  </button>
                ))}
              </div>
            </fieldset>

            <button type="button" onClick={onToggleFullscreen} className="flex h-10 w-full items-center justify-center gap-2 rounded-xl bg-white/5 text-xs font-bold text-zinc-200 hover:bg-white/10">
              {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
              {isFullscreen ? "Thoát toàn màn hình" : "Đọc toàn màn hình"}
            </button>
          </div>
        </aside>
      )}
    </>
  );
}
