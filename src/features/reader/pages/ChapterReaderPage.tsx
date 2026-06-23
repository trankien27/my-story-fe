import { useCallback } from "react";
import { AlertTriangle, ArrowDownToLine, ArrowUpToLine, BookOpen, RefreshCw } from "lucide-react";
import { ActivePage } from "../../../types";
import { dbService } from "../../../services/dbService";
import { useChapterReader } from "../hooks/useChapterReader";
import { ChapterImage } from "../components/ChapterImage";
import { ChapterNavigation } from "../components/ChapterNavigation";
import { ChapterToolbar } from "../components/ChapterToolbar";

interface ChapterReaderPageProps {
  storySlug: string;
  chapterNumber: number;
  onNavigate: (page: ActivePage) => void;
}

export default function ChapterReaderPage({ storySlug, chapterNumber, onNavigate }: ChapterReaderPageProps) {
  const story = dbService.getStoryBySlug(storySlug);
  const chapterCount = story?.chapterCount || chapterNumber;
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
    chapterCount,
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
          <p className="mt-4 text-xs font-semibold text-zinc-400">Đang tải chương {chapterNumber}...</p>
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

  const canGoPrevious = chapter.chapterNumber > 1 || chapter.prevChapterId !== null;
  const canGoNext = chapter.chapterNumber < chapterCount || chapter.nextChapterId !== null;
  const previous = () => canGoPrevious && goToChapter(chapter.chapterNumber - 1);
  const next = () => canGoNext && goToChapter(chapter.chapterNumber + 1);

  return (
    <div className="min-h-screen bg-zinc-950 pb-4 text-white">
      <ChapterToolbar
        storyTitle={chapter.storyTitle || story.title}
        chapterTitle={chapter.title}
        chapterNumber={chapter.chapterNumber}
        chapterCount={chapterCount}
        progress={progress}
        canGoPrevious={canGoPrevious}
        canGoNext={canGoNext}
        onBack={goBack}
        onSelectChapter={goToChapter}
        onPrevious={previous}
        onNext={next}
      />

      <main className="mx-auto w-full max-w-[900px] pt-[58px]">
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

      <ChapterNavigation
        chapterNumber={chapter.chapterNumber}
        chapterCount={chapterCount}
        canGoPrevious={canGoPrevious}
        canGoNext={canGoNext}
        onPrevious={previous}
        onNext={next}
        onBack={goBack}
      />

      <div className="fixed bottom-5 right-4 z-40 flex flex-col gap-2 sm:right-6">
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
