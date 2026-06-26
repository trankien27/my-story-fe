import { useCallback, useEffect, useRef, useState } from "react";
import { AlertTriangle, ArrowDownToLine, ArrowUpToLine, BookOpen, RefreshCw } from "lucide-react";
import { ActivePage } from "../../../types";
import { dbService } from "../../../services/dbService";
import { apiService } from "../../../services/apiService";
import { useChapterReader } from "../hooks/useChapterReader";
import { ChapterImage } from "../components/ChapterImage";
import { ChapterNavigation } from "../components/ChapterNavigation";
import { ChapterToolbar, ReaderTheme, ReaderWidth } from "../components/ChapterToolbar";

interface ChapterReaderPageProps {
  storySlug: string;
  chapterNumber?: number;
  chapterId?: string;
  onNavigate: (page: ActivePage) => void;
}

export default function ChapterReaderPage({ storySlug, chapterNumber, chapterId, onNavigate }: ChapterReaderPageProps) {
  const cachedStory = dbService.getStoryBySlug(storySlug) || dbService.getStoryById(storySlug);
  const [story, setStory] = useState(cachedStory);
  const [areControlsVisible, setAreControlsVisible] = useState(true);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(Boolean(document.fullscreenElement));
  const [imageWidth, setImageWidth] = useState<ReaderWidth>(() => {
    const saved = localStorage.getItem("vntruyen_reader_width");
    return saved === "compact" || saved === "wide" || saved === "full" ? saved : "standard";
  });
  const [readingTheme, setReadingTheme] = useState<ReaderTheme>(() => {
    const saved = localStorage.getItem("vntruyen_reader_theme");
    return saved === "light" || saved === "sepia" ? saved : "dark";
  });
  const lastScrollY = useRef(0);

  useEffect(() => {
    localStorage.setItem("vntruyen_reader_width", imageWidth);
  }, [imageWidth]);

  useEffect(() => {
    localStorage.setItem("vntruyen_reader_theme", readingTheme);
  }, [readingTheme]);

  useEffect(() => {
    const handleFullscreenChange = () => setIsFullscreen(Boolean(document.fullscreenElement));
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      const distance = currentScrollY - lastScrollY.current;

      if (currentScrollY <= 80) {
        setAreControlsVisible(true);
      } else if (Math.abs(distance) >= 8) {
        setAreControlsVisible(distance < 0);
      }

      lastScrollY.current = currentScrollY;
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (!cachedStory?.id) return;
    let active = true;
    apiService.getStory(cachedStory.id, cachedStory).then((detail) => {
      if (!active) return;
      dbService.cacheStory(detail);
      setStory(detail);
    }).catch(() => undefined);
    return () => { active = false; };
  }, [cachedStory?.id, storySlug]);

  const fallbackChapterNumber = chapterNumber || 1;
  const fallbackChapterCount = story?.chapterCount || fallbackChapterNumber;
  const chapterNumbers: number[] = story?.chapters
    ? Array.from(new Set<number>(story.chapters.map((item) => item.chapterNumber))).sort((a, b) => a - b)
    : Array.from({ length: fallbackChapterCount }, (_, index) => index + 1);
  const lastChapterNumber = chapterNumbers[chapterNumbers.length - 1] || chapterNumber;
  const chapterCount = chapterNumbers.length;
  const {
    chapter,
    isLoading,
    error,
    progress,
    retry,
    preloadAround,
    setCurrentPageIndex,
  } = useChapterReader({
    storyId: story?.id || "",
    chapterNumber,
    chapterId,
    chapterCount: lastChapterNumber,
    storyTitle: story?.title,
  });

  const goBack = useCallback(() => {
    onNavigate({ type: "story-detail", slug: storySlug });
  }, [onNavigate, storySlug]);
  const goToChapter = useCallback((number: number) => {
    onNavigate({ type: "reader", storySlug, chapterNumber: number });
  }, [onNavigate, storySlug]);
  const scrollToTop = useCallback(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);
  const scrollToBottom = useCallback(() => {
    window.scrollTo({ top: document.documentElement.scrollHeight, behavior: "smooth" });
  }, []);
  const toggleFullscreen = useCallback(() => {
    if (document.fullscreenElement) {
      document.exitFullscreen().catch(() => undefined);
    } else {
      document.documentElement.requestFullscreen().catch(() => undefined);
    }
  }, []);

  if (!story) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-950 p-6 text-center text-white">
        <div>
          <BookOpen className="mx-auto h-10 w-10 text-zinc-600" />
          <p className="mt-3 text-sm font-bold">Không tìm thấy truyện</p>
          <button type="button" onClick={() => onNavigate({ type: "story-list" })} className="mt-4 rounded-xl bg-violet-600 px-4 py-2 text-xs font-bold">Về danh sách truyện</button>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-950 text-white">
        <div className="text-center">
          <div className="mx-auto h-11 w-11 animate-spin rounded-full border-4 border-zinc-800 border-t-violet-500" />
          <p className="mt-4 text-xs font-semibold text-zinc-400">Đang tải chương...</p>
        </div>
      </div>
    );
  }

  if (error || !chapter) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-950 p-6 text-center text-white">
        <div className="max-w-sm rounded-2xl border border-white/10 bg-zinc-900 p-8">
          <AlertTriangle className="mx-auto h-10 w-10 text-amber-400" />
          <h1 className="mt-3 text-sm font-bold">Không thể tải chapter</h1>
          <p className="mt-2 text-xs leading-relaxed text-zinc-400">{error}</p>
          <div className="mt-5 flex justify-center gap-2">
            <button type="button" onClick={goBack} className="h-10 rounded-xl border border-white/10 px-4 text-xs font-bold">Quay lại</button>
            <button type="button" onClick={retry} className="flex h-10 items-center gap-2 rounded-xl bg-violet-600 px-4 text-xs font-bold hover:bg-violet-500"><RefreshCw className="h-4 w-4" /> Thử lại</button>
          </div>
        </div>
      </div>
    );
  }

  const currentChapterIndex = chapterNumbers.indexOf(chapter.chapterNumber);
  const previousChapterNumber = currentChapterIndex > 0 ? chapterNumbers[currentChapterIndex - 1] : null;
  const nextChapterNumber = currentChapterIndex >= 0 && currentChapterIndex < chapterNumbers.length - 1
    ? chapterNumbers[currentChapterIndex + 1]
    : null;
  const canGoPrevious = previousChapterNumber !== null;
  const canGoNext = nextChapterNumber !== null;
  const previous = () => previousChapterNumber !== null && goToChapter(previousChapterNumber);
  const next = () => nextChapterNumber !== null && goToChapter(nextChapterNumber);
  const controlsVisible = areControlsVisible || isSettingsOpen;
  const readerWidthClass = {
    compact: "max-w-[700px]",
    standard: "max-w-[900px]",
    wide: "max-w-[1200px]",
    full: "max-w-none",
  }[imageWidth];
  const readerThemeClass = {
    dark: "bg-zinc-950",
    light: "bg-slate-100",
    sepia: "bg-amber-50",
  }[readingTheme];

  return (
    <div className={`min-h-screen pb-4 text-white transition-colors duration-300 ${readerThemeClass}`}>
      <ChapterToolbar
        storyTitle={chapter.storyTitle || story.title}
        chapterTitle={chapter.title}
        chapterNumber={chapter.chapterNumber}
        chapterNumbers={chapterNumbers}
        progress={progress}
        canGoPrevious={canGoPrevious}
        canGoNext={canGoNext}
        isVisible={controlsVisible}
        isSettingsOpen={isSettingsOpen}
        imageWidth={imageWidth}
        readingTheme={readingTheme}
        isFullscreen={isFullscreen}
        onBack={goBack}
        onSelectChapter={goToChapter}
        onPrevious={previous}
        onNext={next}
        onToggleSettings={() => setIsSettingsOpen((open) => !open)}
        onSetImageWidth={setImageWidth}
        onSetReadingTheme={setReadingTheme}
        onToggleFullscreen={toggleFullscreen}
      />

      <main className={`mx-auto w-full pt-[58px] transition-[max-width] duration-300 ${readerWidthClass}`}>
        {chapter.pages.length > 0 ? chapter.pages.map((page, index) => (
          <ChapterImage
            key={`${chapter.id}-${page.index}`}
            page={page}
            isFirst={index === 0}
            onNear={preloadAround}
            onVisible={setCurrentPageIndex}
          />
        )) : (
          <div className="flex min-h-[60vh] items-center justify-center px-6 text-center text-sm font-semibold text-zinc-500">
            Chapter này chưa có ảnh.
          </div>
        )}
      </main>

      <div className="bg-zinc-950">
        <ChapterNavigation
          chapterNumber={chapter.chapterNumber}
          chapterCount={chapterCount}
          canGoPrevious={canGoPrevious}
          canGoNext={canGoNext}
          onPrevious={previous}
          onNext={next}
          onBack={goBack}
        />
      </div>

      <div className={`fixed bottom-20 right-4 z-40 flex flex-col gap-2 transition-all duration-300 sm:bottom-5 sm:right-6 ${controlsVisible ? "translate-x-0 opacity-100" : "translate-x-16 opacity-0 pointer-events-none"}`}>
        <button
          type="button"
          onClick={scrollToTop}
          className="flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-zinc-900/90 text-zinc-200 shadow-xl backdrop-blur transition hover:bg-violet-600 hover:text-white"
          title="Lên đầu chương"
          aria-label="Lên đầu chương"
        >
          <ArrowUpToLine className="h-5 w-5" />
        </button>
        <button
          type="button"
          onClick={scrollToBottom}
          className="flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-zinc-900/90 text-zinc-200 shadow-xl backdrop-blur transition hover:bg-violet-600 hover:text-white"
          title="Xuống cuối chương"
          aria-label="Xuống cuối chương"
        >
          <ArrowDownToLine className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
}
