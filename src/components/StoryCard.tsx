import React from "react";
import { Eye, Heart, Star, Sparkles } from "lucide-react";
import { Story, ActivePage } from "../types";
import { dbService } from "../services/dbService";

interface StoryCardProps {
  story: Story;
  onNavigate: (page: ActivePage) => void;
}

export default function StoryCard({ story, onNavigate }: StoryCardProps) {
  // Get latest chapter
  const chapters = dbService.getChapters(story.id);
  const latestChapter = chapters.length > 0 ? chapters[chapters.length - 1] : null;

  return (
    <div
      onClick={() => onNavigate({ type: "story-detail", slug: story.slug })}
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

        {/* Hot/Pick Badge */}
        {story.views > 10000 && (
          <div className="absolute top-2 right-2 bg-rose-500 text-white font-bold rounded-lg px-2 py-0.5 text-[10px] shadow-sm backdrop-blur-md" title="Truyện nổi bật">
            HOT
          </div>
        )}

        {/* Views Overlay info */}
        <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/80 to-transparent">
          <p className="text-white text-[10px] font-medium flex justify-between items-center">
            <span>{latestChapter ? `Chương ${latestChapter.chapterNumber}` : "Đang cập nhật"}</span>
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
