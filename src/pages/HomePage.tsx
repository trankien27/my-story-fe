import React, { useState, useEffect } from "react";
import { BookOpen, Search, Flame, Sparkles, TrendingUp, Compass, ArrowRight, Star, Clock, Trophy, ChevronLeft, ChevronRight } from "lucide-react";
import { Story, User, ActivePage } from "../types";
import { dbService } from "../services/dbService";
import { apiService } from "../services/apiService";
import StoryCard from "../components/StoryCard";

interface HomePageProps {
  currentUser: User | null;
  onNavigate: (page: ActivePage) => void;
}

export default function HomePage({ currentUser, onNavigate }: HomePageProps) {
  const [localSearch, setLocalSearch] = useState("");
  const [rankingTab, setRankingTab] = useState<"day" | "month" | "all">("day");
  const [categoryPage, setCategoryPage] = useState(1);
  const stories = dbService.getStories();
  const categories = dbService.getCategories();
  const [remoteRanking, setRemoteRanking] = useState<Story[] | null>(null);

  const newStories = [...stories].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  
  // Calculate rankings dynamically based on story views, rating and attributes
  const rankingDay = [...stories].sort((a, b) => (b.rating || 0) - (a.rating || 0) || b.views - a.views).slice(0, 5);
  const rankingMonth = [...stories].sort((a, b) => b.views * (a.rating || 4.5) - a.views * (a.rating || 4.5)).slice(0, 5);
  const rankingAll = [...stories].sort((a, b) => b.views - a.views).slice(0, 5);

  const fallbackRankingList = rankingTab === "day" ? rankingDay : rankingTab === "month" ? rankingMonth : rankingAll;
  const activeRankingList = remoteRanking || fallbackRankingList;

  useEffect(() => {
    let active = true;
    const period = rankingTab === "day" ? "Daily" : rankingTab === "month" ? "Monthly" : "AllTime";
    setRemoteRanking(null);
    apiService
      .getRanking(period, stories, 5)
      .then((items) => {
        if (active) setRemoteRanking(items);
      })
      .catch(() => {
        if (active) setRemoteRanking(null);
      });
    return () => { active = false; };
  }, [rankingTab]);

  // Categories Pagination (5x5 = 25 per page)
  const categoriesPerPage = 25;
  const totalCategoryPages = Math.ceil(categories.length / categoriesPerPage);
  const paginatedCategories = categories.slice(
    (categoryPage - 1) * categoriesPerPage,
    categoryPage * categoriesPerPage
  );
  
  // Recommended featured stories (take first 5 stories for auto rotating)
  const recommendedStories = stories.slice(0, 5);
  const [currentHeroIndex, setCurrentHeroIndex] = useState(0);

  useEffect(() => {
    if (recommendedStories.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentHeroIndex((prev) => (prev + 1) % recommendedStories.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [recommendedStories.length]);

  const heroStory = recommendedStories[currentHeroIndex] || null;

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (localSearch.trim()) {
      onNavigate({ type: "story-list", search: localSearch.trim() });
    }
  };

  return (
    <div id="home-page" className="min-h-screen bg-slate-50/50 pb-16 font-sans">
      
      {/* 1. Hero Section - Majestic Visual Banner */}
      {heroStory && (
        <div className="relative overflow-hidden bg-slate-900 text-white min-h-[320px] md:min-h-[480px] flex items-center transition-all duration-700 ease-in-out">
          {/* Cover background with extreme blur */}
          <div className="absolute inset-0 z-0 opacity-45 transition-all duration-700">
            <img
              src={heroStory.coverUrl}
              alt={heroStory.title}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover blur-2xl scale-110"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-900/90 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 to-transparent" />
          </div>

          <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6 md:py-12 grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 items-center w-full">
            {/* Left side text detail */}
            <div className="md:col-span-2 space-y-3 md:space-y-6">
              <div className="inline-flex items-center gap-1.5 px-3 py-0.5 md:px-3.5 md:py-1 rounded-full bg-[#7C3AED]/20 border border-[#7C3AED]/30 text-violet-300 text-[10px] md:text-xs font-bold uppercase tracking-wider backdrop-blur-md">
                <Sparkles className="h-2.5 w-2.5 md:h-3 md:w-3 text-[#7C3AED] animate-pulse" />
                Truyện Đề Cử Nổi Bật
              </div>

              <h1 className="text-xl sm:text-3xl md:text-5xl font-extrabold tracking-tight leading-tight md:leading-none text-white max-w-2xl transition-all duration-500">
                {heroStory.title}
              </h1>

              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] md:text-xs text-slate-300 font-medium">
                <span>Tác giả: <strong className="text-white">{heroStory.author}</strong></span>
                <span className="hidden sm:inline text-slate-600">•</span>
                <span>Lượt xem: <strong className="text-white">{heroStory.views.toLocaleString()}</strong></span>
                <span className="hidden sm:inline text-slate-600">•</span>
                <span className="flex items-center gap-1 text-amber-400">
                  <Star className="h-3 w-3 md:h-3.5 md:w-3.5 fill-current text-amber-400" />
                  <strong>{heroStory.rating || "4.8"} / 5.0</strong>
                </span>
              </div>

              <p className="text-slate-300 text-xs md:text-base line-clamp-2 md:line-clamp-3 leading-relaxed max-w-xl font-medium transition-all duration-500">
                {heroStory.description}
              </p>

              {/* Action and Search Panel */}
              <div className="pt-1 md:pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 md:gap-3">
                <button
                  onClick={() => onNavigate({ type: "story-detail", slug: heroStory.slug })}
                  className="px-5 h-10 md:px-6 md:h-12 bg-[#7C3AED] hover:bg-[#6D28D9] text-white rounded-xl text-xs md:text-sm font-bold shadow-lg flex items-center justify-center gap-1.5 md:gap-2 transition-all"
                >
                  <BookOpen className="h-3.5 w-3.5 md:h-4 md:w-4" />
                  Đọc ngay tác phẩm
                </button>
                
                <form onSubmit={handleSearchSubmit} className="relative flex-1 max-w-md w-full">
                  <input
                    type="text"
                    placeholder="Tìm tác phẩm khác..."
                    value={localSearch}
                    onChange={(e) => setLocalSearch(e.target.value)}
                    className="w-full h-10 md:h-12 pl-10 md:pl-11 pr-4 rounded-xl text-xs md:text-sm border border-slate-700 bg-slate-800/85 backdrop-blur-md text-white placeholder-slate-400 focus:outline-none focus:border-[#7C3AED] focus:bg-slate-900 focus:ring-2 focus:ring-[#7C3AED]/20 transition-all font-medium"
                  />
                  <Search className="absolute left-3.5 top-3 md:left-4 md:top-4 h-3.5 w-3.5 md:h-4 md:w-4 text-slate-400" />
                </form>
              </div>

              {/* Carousel Indicators / Dots */}
              {recommendedStories.length > 1 && (
                <div className="flex items-center gap-1.5 pt-2">
                  {recommendedStories.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentHeroIndex(index)}
                      className={`h-1.5 rounded-full transition-all duration-305 ${
                        index === currentHeroIndex ? "w-6 bg-[#7C3AED]" : "w-1.5 bg-white/40 hover:bg-white/60"
                      }`}
                      aria-label={`Go to slide ${index + 1}`}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Right side cover render (Desktop only) */}
            <div className="hidden md:flex justify-end col-span-1">
              <div
                onClick={() => onNavigate({ type: "story-detail", slug: heroStory.slug })}
                className="group relative cursor-pointer aspect-[3/4] w-64 rounded-2xl overflow-hidden shadow-2xl border border-white/10 hover:border-white/20 transition-all duration-300"
              >
                <img
                  src={heroStory.coverUrl}
                  alt={heroStory.title}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-4">
                  <div>
                    <h3 className="font-bold text-white text-sm line-clamp-1">{heroStory.title}</h3>
                    <p className="text-[11px] text-[#7C3AED] font-semibold uppercase tracking-wider mt-0.5">XEM CHI TIẾT</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main container */}
      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mt-10 md:mt-14 space-y-12">
        
        {/* Welcome header for logged in accounts */}
        {currentUser && (
          <div className="bg-[#7C3AED]/5 border border-[#E2E8F0] rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-base font-bold text-[#0F172A]">
                Chào mừng trở lại, {currentUser.fullName}! 👋
              </h2>
              <p className="text-xs text-[#64748B] mt-1 font-medium">
                Hôm nay bạn định đồng hành cùng bộ truyện tranh nào tiếp theo?
              </p>
            </div>
            
            <div className="flex gap-2">
              <button
                onClick={() => onNavigate({ type: "history" })}
                className="px-4 py-2 text-xs font-bold text-[#7C3AED] bg-[#7C3AED]/10 hover:bg-[#7C3AED]/15 rounded-lg transition-colors flex items-center gap-1.5"
              >
                <Clock className="h-3.5 w-3.5" />
                Lịch sử đọc
              </button>
              <button
                onClick={() => onNavigate({ type: "favorites" })}
                className="px-4 py-2 text-xs font-bold text-[#64748B] bg-white hover:bg-slate-50 border border-[#E2E8F0] shadow-sm rounded-lg transition-colors flex items-center gap-1.5"
              >
                <Star className="h-3.5 w-3.5 fill-[#64748B] text-[#64748B]" />
                Đã thích
              </button>
            </div>
          </div>
        )}

        {/* Main Section layout with left column and right sidebar */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column (8 of 12) */}
          <div className="lg:col-span-8 space-y-12">
            
            {/* 3. New Updates Story Grid */}
            <div id="newest-updates" className="space-y-4">
              <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-3">
                <h2 className="text-lg font-bold text-[#0F172A] flex items-center gap-2.5">
                  <span className="w-1.5 h-6 bg-[#7C3AED] rounded-full inline-block"></span>
                  Mới Cập Nhật
                </h2>
                <button
                  onClick={() => onNavigate({ type: "story-list" })}
                  className="text-xs font-bold text-[#7C3AED] hover:text-[#6D28D9] flex items-center gap-1"
                >
                  Tất cả truyện
                  <ArrowRight className="h-3 w-3" />
                </button>
              </div>

              {/* Dynamic grid conforming to requirements */}
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                {newStories.slice(0, 6).map((story) => (
                  <div key={story.id}>
                    <StoryCard story={story} onNavigate={onNavigate} />
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* Right Sidebar: Tabbed Ranking Segment (4 of 12) */}
          <div className="lg:col-span-4 space-y-6 lg:sticky lg:top-24">
            <div className="bg-white border border-[#E2E8F0] rounded-3xl p-5 shadow-sm space-y-5">
              <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-3.5">
                <h3 className="text-base font-bold text-[#0F172A] flex items-center gap-2">
                  <Trophy className="h-5 w-5 text-amber-500 fill-amber-100" />
                  Bảng Xếp Hạng
                </h3>
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">REALTIME</span>
              </div>

              {/* Tab options switcher */}
              <div className="flex border border-[#E2E8F0] bg-slate-50 p-1 rounded-2xl">
                <button
                  onClick={() => setRankingTab("day")}
                  className={`flex-1 text-center py-2.5 rounded-xl text-xs font-bold transition-all ${
                    rankingTab === "day"
                      ? "bg-white text-[#7C3AED] shadow-sm"
                      : "text-[#64748B] hover:text-[#0F172A]"
                  }`}
                >
                  Ngày
                </button>
                <button
                  onClick={() => setRankingTab("month")}
                  className={`flex-1 text-center py-2.5 rounded-xl text-xs font-bold transition-all ${
                    rankingTab === "month"
                      ? "bg-white text-[#7C3AED] shadow-sm"
                      : "text-[#64748B] hover:text-[#0F172A]"
                  }`}
                >
                  Tháng
                </button>
                <button
                  onClick={() => setRankingTab("all")}
                  className={`flex-1 text-center py-2.5 rounded-xl text-xs font-bold transition-all ${
                    rankingTab === "all"
                      ? "bg-white text-[#7C3AED] shadow-sm"
                      : "text-[#64748B] hover:text-[#0F172A]"
                  }`}
                >
                  Mọi lúc
                </button>
              </div>

              {/* Ranking Items dynamic render */}
              <div className="space-y-4">
                {activeRankingList.map((story, index) => (
                  <div
                    key={story.id}
                    onClick={() => onNavigate({ type: "story-detail", slug: story.slug })}
                    className="group cursor-pointer flex items-center gap-4 p-1 rounded-2xl transition-colors hover:bg-slate-50"
                  >
                    {/* Rank index flag decoration */}
                    <div className="flex items-center justify-center shrink-0 w-8 h-8 rounded-full">
                      {index === 0 ? (
                        <div className="w-7 h-7 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-500 font-black text-lg">
                          1
                        </div>
                      ) : index === 1 ? (
                        <div className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 font-black text-base">
                          2
                        </div>
                      ) : index === 2 ? (
                        <div className="w-7 h-7 rounded-full bg-amber-700/10 flex items-center justify-center text-amber-700 font-black text-base">
                          3
                        </div>
                      ) : (
                        <span className="text-xs font-bold text-slate-400">{index + 1}</span>
                      )}
                    </div>

                    {/* Small Thumb Cover Image */}
                    <div className="relative aspect-[3/4] w-12 shrink-0 rounded-lg overflow-hidden bg-[#E2E8F0]">
                      <img
                        src={story.coverUrl}
                        alt={story.title}
                        referrerPolicy="no-referrer"
                        className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>

                    {/* Title with details */}
                    <div className="flex-1 min-w-0">
                      <h4 className="text-xs font-bold text-[#0F172A] truncate group-hover:text-[#7C3AED] transition-colors leading-snug">
                        {story.title}
                      </h4>
                      <p className="text-[10px] text-[#64748B] mt-1 flex items-center justify-between font-semibold">
                        <span className="truncate max-w-[100px]">{story.author}</span>
                        <span className="text-[#7C3AED]">
                          {story.views >= 1000 ? `${(story.views / 1000).toFixed(1)}k` : story.views} lượt xem
                        </span>
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>

      </main>
    </div>
  );
}
