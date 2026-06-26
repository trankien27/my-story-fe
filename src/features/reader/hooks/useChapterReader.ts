import { useCallback, useEffect, useRef, useState } from "react";
import { chapterApi } from "../api/chapterApi";
import { ChapterDetail, ChapterReaderState, ReaderHistoryEntry } from "../types/chapter.types";
import { useImagePreload } from "./useImagePreload";
import { apiService } from "../../../services/apiService";
import { dbService } from "../../../services/dbService";

const HISTORY_KEY = "vntruyen_reader_history";
const PROGRESS_LOGIN_PROMPT_KEY = "vntruyen_progress_login_prompt_shown";

interface UseChapterReaderOptions {
  storyId: string;
  chapterNumber?: number;
  chapterId?: string;
  chapterCount?: number;
  storyTitle?: string;
}

const saveHistory = (entry: ReaderHistoryEntry) => {
  try {
    const parsed = JSON.parse(localStorage.getItem(HISTORY_KEY) || "[]") as ReaderHistoryEntry[];
    const history = parsed.filter((item) => item.storyId !== entry.storyId);
    localStorage.setItem(HISTORY_KEY, JSON.stringify([entry, ...history].slice(0, 50)));
  } catch {
    localStorage.setItem(HISTORY_KEY, JSON.stringify([entry]));
  }
};

export function useChapterReader({
  storyId,
  chapterNumber,
  chapterId,
  chapterCount,
  storyTitle,
}: UseChapterReaderOptions) {
  const [state, setState] = useState<ChapterReaderState>({
    chapter: null,
    isLoading: true,
    error: null,
    progress: 0,
    currentPageIndex: 0,
  });
  const [retryVersion, setRetryVersion] = useState(0);
  const [nextChapter, setNextChapter] = useState<ChapterDetail | null>(null);
  const prefetchAttempted = useRef(false);
  const nextCoverPreloaded = useRef(false);
  const scrollFrame = useRef<number | null>(null);
  const { preloadImages } = useImagePreload();

  useEffect(() => {
    const controller = new AbortController();
    prefetchAttempted.current = false;
    nextCoverPreloaded.current = false;
    setNextChapter(null);
    setState({ chapter: null, isLoading: true, error: null, progress: 0, currentPageIndex: 0 });
    window.scrollTo({ top: 0, behavior: "auto" });

    if (!storyId && !chapterId) {
      setState((current) => ({ ...current, isLoading: false, error: "Không xác định được ID truyện." }));
      return () => controller.abort();
    }

    const request = chapterId
      ? chapterApi.getById(chapterId, controller.signal)
      : chapterApi.getByStoryAndNumber(storyId, chapterNumber || 1, storyTitle, controller.signal);

    request
      .then((chapter) => {
        const currentStoryId = chapter.storyId || storyId;
        saveHistory({
          storyId: currentStoryId,
          chapterId: chapter.id,
          pageIndex: chapter.pages[0]?.index ?? 0,
          updatedAt: new Date().toISOString(),
        });
        dbService.addHistory(currentStoryId, chapter.chapterNumber);
        if (apiService.hasSession()) {
          apiService.saveReadingProgress(currentStoryId, chapter.id).catch(() => undefined);
        } else if (!sessionStorage.getItem(PROGRESS_LOGIN_PROMPT_KEY)) {
          sessionStorage.setItem(PROGRESS_LOGIN_PROMPT_KEY, "1");
          window.alert("Bạn cần đăng nhập để sử dụng tính năng này");
        }
        setState((current) => ({ ...current, chapter, isLoading: false }));
      })
      .catch((error: unknown) => {
        if (error instanceof DOMException && error.name === "AbortError") return;
        setState((current) => ({
          ...current,
          isLoading: false,
          error: error instanceof Error ? error.message : "Không thể tải chapter.",
        }));
      });

    return () => controller.abort();
  }, [storyId, chapterNumber, chapterId, storyTitle, retryVersion]);

  useEffect(() => {
    const updateProgress = () => {
      scrollFrame.current = null;
      const scrollableHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = scrollableHeight <= 0 ? 100 : Math.min(100, Math.max(0, (window.scrollY / scrollableHeight) * 100));
      setState((current) => Math.abs(current.progress - progress) < 0.25 ? current : { ...current, progress });
    };
    const onScroll = () => {
      if (scrollFrame.current == null) scrollFrame.current = window.requestAnimationFrame(updateProgress);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    updateProgress();
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (scrollFrame.current != null) window.cancelAnimationFrame(scrollFrame.current);
    };
  }, [state.chapter?.id]);

  useEffect(() => {
    const chapter = state.chapter;
    if (!chapter || state.progress < 75 || prefetchAttempted.current) return;
    const hasNextByNumber = chapterCount == null || chapter.chapterNumber < chapterCount;
    if (!chapter.nextChapterId && !hasNextByNumber) return;

    prefetchAttempted.current = true;
    const request = chapter.nextChapterId
      ? chapterApi.getById(chapter.nextChapterId)
      : chapterApi.getByStoryAndNumber(storyId, chapter.chapterNumber + 1, storyTitle);
    request.then(setNextChapter).catch(() => undefined);
  }, [chapterCount, state.chapter, state.progress, storyId, storyTitle]);

  useEffect(() => {
    if (state.progress < 90 || !nextChapter || nextCoverPreloaded.current) return;
    nextCoverPreloaded.current = true;
    preloadImages([nextChapter.pages[0]?.imageUrl]);
  }, [nextChapter, preloadImages, state.progress]);

  const setCurrentPageIndex = useCallback((pageIndex: number) => {
    setState((current) => {
      if (!current.chapter || current.currentPageIndex === pageIndex) return current;
      saveHistory({
        storyId,
        chapterId: current.chapter.id,
        pageIndex,
        updatedAt: new Date().toISOString(),
      });
      return { ...current, currentPageIndex: pageIndex };
    });
  }, [storyId]);

  const preloadAround = useCallback((pageIndex: number) => {
    const currentIndex = state.chapter?.pages.findIndex((page) => page.index === pageIndex) ?? -1;
    const pages = currentIndex >= 0 ? state.chapter?.pages.slice(currentIndex + 1, currentIndex + 4) || [] : [];
    preloadImages(pages.map((page) => page.imageUrl));
  }, [preloadImages, state.chapter]);

  const retry = useCallback(() => setRetryVersion((version) => version + 1), []);

  return {
    ...state,
    nextChapter,
    retry,
    preloadAround,
    setCurrentPageIndex,
  };
}
