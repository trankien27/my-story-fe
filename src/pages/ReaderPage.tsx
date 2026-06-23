import { useState, useEffect, useRef } from "react";
import { ArrowLeft, ChevronLeft, ChevronRight, Settings, Moon, Sun, Book, Info, HelpCircle } from "lucide-react";
import { ActivePage, Chapter, Story } from "../types";
import { dbService } from "../services/dbService";
import { apiService } from "../services/apiService";

interface ReaderPageProps {
  storySlug: string;
  chapterNumber: number;
  onNavigate: (page: ActivePage) => void;
}

export default function ReaderPage({ storySlug, chapterNumber, onNavigate }: ReaderPageProps) {
  const [readingBackground, setReadingBackground] = useState<"white" | "cream" | "dark">("cream");
  const [maxWidth, setMaxWidth] = useState<"700px" | "900px" | "1100px" | "full">("900px");
  const [showHUD, setShowHUD] = useState(true);
  const [imageLoaded, setImageLoaded] = useState<Record<string, boolean>>({});
  const [currentChapter, setCurrentChapter] = useState<Chapter | undefined>();
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  const story = dbService.getStoryBySlug(storySlug);
  const chapters = story ? dbService.getChapters(story.id) : [];

  useEffect(() => {
    let active = true;
    setIsLoading(true);
    setLoadError("");
    setImageLoaded({});

    if (!story) {
      setIsLoading(false);
      return () => { active = false; };
    }

    apiService
      .getChapter(story.id, chapterNumber)
      .then((chapter) => {
        if (!active) return;
        dbService.cacheChapter(chapter);
        setCurrentChapter(chapter);
      })
      .catch((error: Error) => {
        if (!active) return;
        const localChapter = dbService.getChapter(story.id, chapterNumber);
        setCurrentChapter(localChapter);
        if (!localChapter) setLoadError(error.message);
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });

    return () => { active = false; };
  }, [story?.id, chapterNumber]);

  // Auto-scroll to top and log to reading history when chapter loads
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
    if (story && currentChapter) {
      dbService.addHistory(story.id, currentChapter.chapterNumber);
    }
  }, [storySlug, chapterNumber, currentChapter, story]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="h-10 w-10 rounded-full border-4 border-slate-200 border-t-[#7C3AED] animate-spin" />
      </div>
    );
  }

  if (!story || !currentChapter) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6 text-center">
        <div className="bg-white p-8 rounded-2xl border border-slate-100 max-w-sm shadow-xl">
          <h2 className="text-sm font-bold text-slate-800">Không tìm thấy chương này</h2>
          <p className="text-xs text-slate-400 mt-2">{loadError || "Có vẻ chương truyện bạn tìm kiếm chưa được tải lên hoặc đã bị khóa."}</p>
          <button
            onClick={() => onNavigate({ type: "story-detail", slug: storySlug })}
            className="mt-4 px-4 py-2 text-xs font-bold text-white bg-indigo-600 rounded-xl"
          >
            Quay lại chi tiết truyện
          </button>
        </div>
      </div>
    );
  }

  const totalChapterCount = story.chapterCount ?? Math.max(chapters.length, currentChapter.chapterNumber);
  const chapterNumbers = Array.from({ length: totalChapterCount }, (_, index) => index + 1);

  const handleNextChapter = () => {
    if (chapterNumber < totalChapterCount) {
      onNavigate({ type: "reader", storySlug, chapterNumber: chapterNumber + 1 });
    }
  };

  const handlePrevChapter = () => {
    if (chapterNumber > 1) {
      onNavigate({ type: "reader", storySlug, chapterNumber: chapterNumber - 1 });
    }
  };

  const getBgClass = () => {
    if (readingBackground === "white") return "bg-white text-slate-800";
    if (readingBackground === "cream") return "bg-amber-50/40 text-amber-900";
    return "bg-zinc-950 text-zinc-300";
  };

  const getMaxWidthClass = () => {
    if (maxWidth === "700px") return "max-w-xl";
    if (maxWidth === "900px") return "max-w-3xl";
    if (maxWidth === "1100px") return "max-w-5xl";
    return "max-w-full";
  };

  const currentTheme = readingBackground;

  return (
    <div className={`min-h-screen ${getBgClass()} font-sans selection:bg-indigo-200 transition-colors duration-300 relative pb-24`}>
      
      {/* 1. Header Toolbar (HUD HUD) */}
      {showHUD && (
        <div className="fixed top-0 inset-x-0 z-50 h-14 border-b bg-white/95 text-slate-800 backdrop-blur-md shadow-sm border-slate-100 px-4 flex items-center justify-between transition-all duration-300">
          <div className="flex items-center gap-3">
            <button
              onClick={() => onNavigate({ type: "story-detail", slug: story.slug })}
              className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-650 transition-colors"
              title="Quay lại chi tiết"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div className="truncate max-w-[150px] sm:max-w-xs text-left">
              <h3 className="text-xs font-bold truncate">{story.title}</h3>
              <p className="text-[10px] text-[#7C3AED] font-bold truncate">Chương {currentChapter.chapterNumber}: {currentChapter.title}</p>
            </div>
          </div>

          {/* Nav Controls dropdown and action buttons */}
          <div className="flex items-center gap-2">
            <select
              value={chapterNumber}
              onChange={(e) => onNavigate({ type: "reader", storySlug, chapterNumber: Number(e.target.value) })}
              className="h-8 py-0.5 px-2 bg-slate-100 hover:bg-slate-200 text-xs font-bold border-none rounded-lg text-slate-700 outline-none cursor-pointer"
            >
              {chapterNumbers.map((number) => (
                <option key={number} value={number}>
                  Chương {number}
                </option>
              ))}
            </select>

            <button
              onClick={() => setReadingBackground(readingBackground === "dark" ? "cream" : readingBackground === "cream" ? "white" : "dark")}
              className="p-2 hover:bg-slate-100 text-slate-500 hover:text-slate-900 rounded-lg"
              title="Thay đổi màu nền"
            >
              {readingBackground === "dark" ? <Sun className="h-4.5 w-4.5 text-amber-500 fill-amber-500" /> : <Moon className="h-4.5 w-4.5" />}
            </button>
          </div>
        </div>
      )}

      {/* Main image view strip container */}
      <main className="mx-auto pt-16 md:pt-20 px-4">
        
        {/* Double-tap HUD helper info banner */}
        <div className="mx-auto max-w-lg mb-4 text-center">
          <p
            onClick={() => setShowHUD(!showHUD)}
            className="text-[10px] text-slate-400 font-bold cursor-pointer hover:text-[#7C3AED] flex items-center justify-center gap-1 select-none"
          >
            <Settings className="h-3 w-3" />
            Bấm vào đây để {showHUD ? "ẩn" : "hiện"} thanh điều khiển Reader!
          </p>
        </div>

        {/* Comic strips */}
        <div className={`mx-auto ${getMaxWidthClass()} flex flex-col gap-1`}>
          {currentChapter.images.map((imgUrl, idx) => (
            <div key={idx} className="relative w-full bg-slate-900/5 overflow-hidden animate-fade-in aspect-[3/4] flex items-center justify-center">
              
              {/* Skeleton placeholder while image loading */}
              {!imageLoaded[idx] && (
                <div className="absolute inset-0 bg-slate-200/40 animate-pulse flex flex-col items-center justify-center text-slate-400">
                  <div className="w-10 h-10 border-4 border-slate-300 border-t-[#7C3AED] rounded-full animate-spin mb-2" />
                  <span className="text-[10px] font-bold">ĐANG TẢI TRANG {idx + 1}...</span>
                </div>
              )}

              <img
                src={imgUrl}
                alt={`Manga Page ${idx + 1}`}
                referrerPolicy="no-referrer"
                onLoad={() => setImageLoaded((prev) => ({ ...prev, [idx]: true }))}
                className={`w-full h-auto object-contain select-none transition-opacity duration-300 ${
                  imageLoaded[idx] ? "opacity-100" : "opacity-0"
                }`}
                loading={idx < 2 ? "eager" : "lazy"}
              />

              {/* Float page index */}
              <span className="absolute bottom-3 right-3 text-[10px] font-bold bg-black/60 text-white px-2 py-0.5 rounded-md shadow backdrop-blur-md select-none">
                {idx + 1} / {currentChapter.images.length}
              </span>
            </div>
          ))}
        </div>

        {/* 2. Reader Navigation Buttons - Prev & Next chapter toggles */}
        <div className="mt-12 flex flex-col items-center justify-center gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={handlePrevChapter}
              disabled={chapterNumber <= 1}
              className="flex items-center gap-1.5 px-5 h-10 text-xs font-bold rounded-xl bg-white text-slate-700 shadow-sm border hover:bg-slate-50 border-slate-200 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
              <ChevronLeft className="h-4 w-4" />
              Chương Trước
            </button>

            <span className="text-xs font-bold bg-[#7C3AED]/10 text-[#7C3AED] px-3 py-1.5 rounded-lg">
              Chương {currentChapter.chapterNumber} / {totalChapterCount}
            </span>

            <button
              onClick={handleNextChapter}
              disabled={chapterNumber >= totalChapterCount}
              className="flex items-center gap-1.5 px-5 h-10 text-xs font-bold rounded-xl bg-[#7C3AED] text-white shadow-md hover:bg-[#6D28D9] disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
              Chương Sau
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>

          <div className="flex gap-4 text-xs font-semibold text-slate-400 mt-2">
            <span
              onClick={() => onNavigate({ type: "story-detail", slug: story.slug })}
              className="hover:text-[#7C3AED] hover:underline cursor-pointer"
            >
              Quay lại mục lục chính
            </span>
            <span>|</span>
            <span
              onClick={() => onNavigate({ type: "home" })}
              className="hover:text-[#7C3AED] hover:underline cursor-pointer"
            >
              Quay về trang chủ
            </span>
          </div>
        </div>

      </main>

      {/* 3. Sticky Quick Reader Settings panel triggers */}
      <div className="fixed bottom-3 right-3 z-30 flex flex-col gap-2">
        
        {/* Toggle Panel Dimension widths */}
        <button
          onClick={() => {
            setMaxWidth((prev) => (prev === "700px" ? "900px" : prev === "900px" ? "1100px" : prev === "1100px" ? "full" : "700px"));
          }}
          className="h-10 w-10 bg-white/95 text-slate-800 rounded-full flex items-center justify-center shadow-lg hover:bg-slate-50 ring-1 ring-slate-100"
          title="Thay đổi chiều rộng đọc của trang"
        >
          <span className="text-[10px] font-black uppercase text-[#7C3AED]">
            {maxWidth === "700px" ? "S" : maxWidth === "900px" ? "M" : maxWidth === "1100px" ? "L" : "XL"}
          </span>
        </button>

        {/* Change background palette */}
        <button
          onClick={() => {
            const list: ("white" | "cream" | "dark")[] = ["white", "cream", "dark"];
            const nextIdx = (list.indexOf(readingBackground) + 1) % list.length;
            setReadingBackground(list[nextIdx]);
          }}
          className="h-10 w-10 bg-white/95 text-slate-800 rounded-full flex items-center justify-center shadow-lg hover:bg-slate-50 ring-1 ring-slate-100"
          title="Thay đổi tông màu nền"
        >
          <div className="flex items-center gap-1.5">
            <div className="h-3 w-3 rounded-full bg-amber-100 border border-amber-300" />
            <div className="h-3 w-3 rounded-full bg-zinc-900 border border-zinc-750" />
          </div>
        </button>
      </div>

    </div>
  );
}
