import React, { useEffect, useState } from "react";
import { Heart } from "lucide-react";
import { Story, ActivePage } from "../types";
import { dbService } from "../services/dbService";
import { apiService } from "../services/apiService";

interface StoryCardProps {
  story: Story;
  onNavigate: (page: ActivePage) => void;
}

export default function StoryCard({ story, onNavigate }: StoryCardProps) {
  const chapters = dbService.getChapters(story.id);
  const latestLocalChapter = chapters.length > 0 ? chapters[chapters.length - 1] : null;
  const latestApiChapter = story.chapters?.length
    ? [...story.chapters].sort((a, b) => a.chapterNumber - b.chapterNumber).at(-1)
    : null;
  const latestChapterNumber = latestApiChapter?.chapterNumber ?? latestLocalChapter?.chapterNumber;
  const [isFavorite, setIsFavorite] = useState(() => story.isFav ?? dbService.isFavorite(story.id));
  const [isFavoriteBusy, setIsFavoriteBusy] = useState(false);

  useEffect(() => {
    setIsFavorite(story.isFav ?? dbService.isFavorite(story.id));
  }, [story.id, story.isFav]);

  const handleToggleFavorite = async (event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    if (!apiService.hasSession()) {
      window.alert("Bạn cần đăng nhập để sử dụng tính năng này");
      onNavigate({ type: "login" });
      return;
    }

    const nextState = !isFavorite;
    setIsFavorite(nextState);
    setIsFavoriteBusy(true);
    try {
      if (nextState) {
        await apiService.addFavorite(story.id);
      } else {
        await apiService.removeFavorite(story.id);
      }
    } catch (error) {
      setIsFavorite(!nextState);
      window.alert(error instanceof Error ? error.message : "Không thể cập nhật yêu thích.");
    } finally {
      setIsFavoriteBusy(false);
    }
  };

  return (
    <div
      onClick={() => onNavigate({ type: "story-detail", slug: story.id })}
      className="group cursor-pointer flex flex-col w-full text-left"
    >
      {/* Cover Image Container */}
      <div className="relative aspect-[3/4] w-full rounded-2xl overflow-hidden bg-[#E2E8F0] mb-3">
        <img
          src={story.coverUrl}
          alt={story.title}
          referrerPolicy="no-referrer"
          className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300 ease-out"
          loading="lazy"
        />

        {/* Status Badge */}
        <div className="absolute top-2 left-2 flex items-center gap-1">
          <span
            className={`text-[10px] font-bold px-2 py-1 rounded-lg uppercase tracking-wider backdrop-blur-md shadow-sm ${
              story.status === "completed"
                ? "bg-emerald-600/90 text-white"
                : story.status === "paused"
                ? "bg-amber-600/90 text-white"
                : "bg-white/90 text-[#7C3AED]"
            }`}
          >
            {story.status === "completed" ? "FULL" : story.status === "paused" ? "TẠM NGƯNG" : "ĐANG RA"}
          </span>
        </div>

        <button
          type="button"
          onClick={handleToggleFavorite}
          disabled={isFavoriteBusy}
          className={`absolute right-2 top-2 z-10 flex h-9 w-9 items-center justify-center rounded-full border shadow-sm backdrop-blur-md transition ${
            isFavorite
              ? "border-rose-200 bg-rose-500 text-white hover:bg-rose-600"
              : "border-white/70 bg-white/90 text-slate-500 hover:bg-white hover:text-rose-500"
          }`}
          title={isFavorite ? "Bỏ yêu thích" : "Thêm vào yêu thích"}
          aria-label={isFavorite ? "Bỏ yêu thích" : "Thêm vào yêu thích"}
        >
          <Heart className={`h-4 w-4 ${isFavorite ? "fill-current" : ""}`} />
        </button>

        {/* Hot/Pick Badge */}
        {story.views > 10000 && (
          <div className="absolute right-2 top-12 bg-rose-500 text-white font-bold rounded-lg px-2 py-0.5 text-[10px] shadow-sm backdrop-blur-md" title="Truyện nổi bật">
            HOT
          </div>
        )}

        {/* Views Overlay info */}
        <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/80 to-transparent">
          <p className="text-white text-[10px] font-medium flex justify-between items-center">
            <span>{latestChapterNumber ? `Chương ${latestChapterNumber}` : "Đang cập nhật"}</span>
            {story.rating && (
              <span className="flex items-center gap-0.5 text-amber-300 font-semibold bg-black/40 px-1 py-0.5 rounded">
                ★ {story.rating.toFixed(1)}
              </span>
            )}
          </p>
        </div>
      </div>

      {/* Story Metadata Body */}
      <div className="flex-1 flex flex-col px-1">
        {/* Title */}
        <h3 className="text-sm font-bold text-[#0F172A] line-clamp-1 group-hover:text-[#7C3AED] transition-colors leading-snug">
          {story.title}
        </h3>

        {/* Category & views line */}
        <p className="text-[11px] text-[#64748B] mt-1 truncate">
          {story.categories.slice(0, 2).map((cat) => cat.name).join(" • ")}
          {" • "}{story.views >= 1000 ? `${(story.views / 1000).toFixed(1)}k` : story.views} lượt xem
        </p>
      </div>
    </div>
  );
}
