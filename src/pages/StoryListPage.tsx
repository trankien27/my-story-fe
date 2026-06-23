import React, { useEffect, useState } from "react";
import { Filter, Search, RotateCcw, SlidersHorizontal, BookOpen, ChevronLeft, ChevronRight, ChevronDown, Check, X } from "lucide-react";
import { Story, Category, StoryStatus, ActivePage } from "../types";
import { dbService } from "../services/dbService";
import { apiService, StoryPage } from "../services/apiService";
import StoryCard from "../components/StoryCard";

interface StoryListPageProps {
  initialSearch?: string;
  initialCategorySlug?: string;
  onNavigate: (page: ActivePage) => void;
}

export default function StoryListPage({ initialSearch = "", initialCategorySlug = "", onNavigate }: StoryListPageProps) {
  const [search, setSearch] = useState(initialSearch);
  const [selectedCategorySlug, setSelectedCategorySlug] = useState(initialCategorySlug);
  const [selectedStatus, setSelectedStatus] = useState<StoryStatus | "all">("all");
  const [sortOption, setSortOption] = useState<"recent" | "views" | "title">("recent");
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [storyPage, setStoryPage] = useState<StoryPage | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [apiError, setApiError] = useState("");
  const [visibleCategoryCount, setVisibleCategoryCount] = useState(10);
  const [debouncedSearch, setDebouncedSearch] = useState(initialSearch.trim());

  const stories = dbService.getStories();
  const categories = dbService.getCategories();
  const firstCategories = categories.slice(0, visibleCategoryCount);
  const selectedCategory = categories.find((item) => item.slug === selectedCategorySlug);
  const visibleCategories = selectedCategory && !firstCategories.some((item) => item.id === selectedCategory.id)
    ? [...firstCategories, selectedCategory]
    : firstCategories;
  const hasMoreCategories = visibleCategoryCount < categories.length;

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      setDebouncedSearch(search.trim());
      setCurrentPage(1);
    }, 350);
    return () => window.clearTimeout(timeout);
  }, [search]);

  useEffect(() => {
    let active = true;
    const category = categories.find((item) => item.slug === selectedCategorySlug);
    setIsLoading(true);
    setApiError("");
    const request = debouncedSearch
      ? apiService.searchStories(debouncedSearch, currentPage, 32, stories)
      : category
        ? apiService.getStoriesByCategoryPage(category.id, currentPage, 32, stories)
        : apiService.getStories(currentPage, 32, stories);

    request
      .then((result) => {
        if (active) setStoryPage(result);
      })
      .catch((error: Error) => {
        if (active) {
          setApiError(error.message);
          setStoryPage(null);
        }
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });
    return () => { active = false; };
  }, [selectedCategorySlug, currentPage, debouncedSearch]);

  // Filter & Sort Logic
  const filteredStories = (storyPage?.items || stories.slice(0, 30))
    .filter((story) => {
      // Search term
      const matchesSearch = !search ||
        story.title.toLowerCase().includes(search.toLowerCase()) ||
        story.author.toLowerCase().includes(search.toLowerCase()) ||
        story.description.toLowerCase().includes(search.toLowerCase());

      // Category genre
      const matchesCategory = !selectedCategorySlug ||
        story.categories.some((cat) => cat.slug === selectedCategorySlug);

      // Status
      const matchesStatus = selectedStatus === "all" || story.status === selectedStatus;

      return matchesSearch && matchesCategory && matchesStatus;
    })
    .sort((a, b) => {
      if (sortOption === "views") {
        return b.views - a.views;
      }
      if (sortOption === "title") {
        return a.title.localeCompare(b.title);
      }
      // default recent
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

  const handleResetFilters = () => {
    setSearch("");
    setSelectedCategorySlug("");
    setSelectedStatus("all");
    setSortOption("recent");
    setCurrentPage(1);
  };

  const totalPages = storyPage?.totalPages || 1;
  const startPage = Math.max(1, Math.min(currentPage - 2, Math.max(1, totalPages - 4)));
  const visiblePages = Array.from({ length: Math.min(5, totalPages) }, (_, index) => startPage + index);
  const handlePageChange = (page: number) => {
    if (page < 1 || page > totalPages || page === currentPage) return;
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div id="story-list-page" className="min-h-screen bg-slate-50/50 pb-20 pt-6 font-sans">
      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* Banner with total count */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-[#0F172A] tracking-tight sm:text-3xl flex items-center gap-2.5">
            <span className="w-1.5 h-6 bg-[#7C3AED] rounded-full inline-block"></span>
            Khám Phá Các Tác Phẩm
          </h1>
          <p className="text-xs text-[#64748B] mt-1 font-semibold">
            Có <strong className="text-[#0F172A] font-bold">{storyPage?.totalCount ?? filteredStories.length}</strong> bộ truyện, hiển thị tối đa 30 truyện mỗi trang.
          </p>
        </div>

        {/* Search and control bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 bg-white p-4 rounded-2xl border border-[#E2E8F0] shadow-sm mb-6">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Tìm tên truyện hoặc tên tác giả sẳn có..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full h-10 pl-10 pr-4 text-xs font-semibold bg-slate-50 border border-[#E2E8F0] rounded-xl focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#7C3AED]/30 transition-all text-[#0F172A]"
            />
            <Search className="absolute left-3.5 top-3.5 h-4 w-4 text-[#64748B]" />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-3 top-3 p-0.5 hover:bg-slate-100 text-slate-400 hover:text-slate-600 rounded-full"
              >
                <X className="h-3 w-3" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            {/* Sort Dropdown */}
            <select
              value={sortOption}
              onChange={(e: any) => setSortOption(e.target.value)}
              className="h-10 px-3 py-1.5 text-xs font-bold text-[#64748B] bg-slate-50 border border-[#E2E8F0] rounded-xl focus:ring-2 focus:ring-[#7C3AED]/20 focus:outline-none"
            >
              <option value="recent">Mới cập nhật</option>
              <option value="views">Lượt xem nhiều</option>
              <option value="title">Tên truyện A-Z</option>
            </select>

            {/* Mobile Filter Toggle */}
            <button
              onClick={() => setShowMobileFilters(true)}
              className="md:hidden flex items-center gap-1.5 h-10 px-4 text-xs font-bold text-[#7C3AED] bg-[#7C3AED]/10 hover:bg-[#7C3AED]/15 rounded-xl transition-colors"
            >
              <Filter className="h-3.5 w-3.5" />
              Bộ lọc
            </button>

            {/* Clear filters shortcut */}
            {(selectedCategorySlug || selectedStatus !== "all" || search) && (
              <button
                onClick={handleResetFilters}
                className="p-2.5 text-slate-400 hover:text-slate-650 hover:bg-slate-50 rounded-xl transition-colors"
                title="Đặt lại bộ lọc"
              >
                <RotateCcw className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>

        {/* Layout: Sidebar Filter (Desktop) + Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 items-start">
          
          {/* Left filter bar (Desktop only) */}
          <div className="hidden md:block col-span-1 border border-[#E2E8F0] bg-white p-5 rounded-2xl shadow-sm space-y-6">
            <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-3">
              <h3 className="text-xs font-bold text-[#0F172A] tracking-wider flex items-center gap-1">
                <SlidersHorizontal className="h-3.5 w-3.5 text-slate-400" />
                BỘ LỌC CHI TIẾT
              </h3>
              <button onClick={handleResetFilters} className="text-[10px] font-bold text-[#7C3AED] hover:underline">
                Đặt lại
              </button>
            </div>

            {/* Category selection */}
            <div className="space-y-2">
              <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Thể loại truyện</h4>
              <div className="space-y-1">
                <button
                  onClick={() => { setSelectedCategorySlug(""); setCurrentPage(1); }}
                  className={`w-full text-left px-3 py-1.5 text-xs font-semibold rounded-lg flex items-center justify-between transition-colors ${
                    !selectedCategorySlug
                      ? "bg-[#7C3AED]/10 text-[#7C3AED]"
                      : "text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  <span>Tất cả thể loại</span>
                  {!selectedCategorySlug && <Check className="h-3.5 w-3.5" />}
                </button>
                {visibleCategories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => { setSelectedCategorySlug(cat.slug); setCurrentPage(1); }}
                    className={`w-full text-left px-3 py-1.5 text-xs font-semibold rounded-lg flex items-center justify-between transition-colors ${
                      selectedCategorySlug === cat.slug
                        ? "bg-[#7C3AED]/10 text-[#7C3AED]"
                        : "text-[#64748B] hover:bg-slate-50"
                    }`}
                  >
                    <span>{cat.name}</span>
                    {selectedCategorySlug === cat.slug && <Check className="h-3.5 w-3.5" />}
                  </button>
                ))}
                {hasMoreCategories && (
                  <button
                    onClick={() => setVisibleCategoryCount((count) => count + 10)}
                    className="w-full px-3 py-2 text-xs font-bold rounded-lg text-[#7C3AED] hover:bg-[#7C3AED]/10 flex items-center justify-center gap-1"
                  >
                    Tải thêm <ChevronDown className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
            </div>

            {/* Status selection */}
            <div className="space-y-2 pt-2 border-t border-[#E2E8F0]">
              <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Trạng thái</h4>
              <div className="space-y-1">
                {(["all", "ongoing", "completed", "paused"] as const).map((status) => (
                  <button
                    key={status}
                    onClick={() => setSelectedStatus(status)}
                    className={`w-full text-left px-3 py-1.5 text-xs font-semibold rounded-lg flex items-center justify-between transition-colors uppercase ${
                      selectedStatus === status
                        ? "bg-[#7C3AED]/10 text-[#7C3AED]"
                        : "text-[#64748B] hover:bg-slate-50"
                    }`}
                  >
                    <span>
                      {status === "all" ? "Tất cả trạng thái" : status === "ongoing" ? "Đang phát hành" : status === "completed" ? "Đã hoàn thành" : "Tạm ngưng"}
                    </span>
                    {selectedStatus === status && <Check className="h-3.5 w-3.5" />}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Grid display stories list */}
          <div className="col-span-1 md:col-span-3">
            {apiError && (
              <div className="mb-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs font-semibold text-amber-700">
                {apiError} Đang hiển thị dữ liệu dự phòng.
              </div>
            )}
            {isLoading ? (
              <div className="bg-white border border-[#E2E8F0] rounded-2xl p-16 flex justify-center shadow-sm">
                <div className="h-10 w-10 rounded-full border-4 border-slate-200 border-t-[#7C3AED] animate-spin" />
              </div>
            ) : filteredStories.length > 0 ? (
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-4">
                {filteredStories.map((story) => (
                  <div key={story.id}>
                    <StoryCard story={story} onNavigate={onNavigate} />
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white border border-[#E2E8F0] rounded-2xl p-12 text-center shadow-sm">
                <BookOpen className="h-10 w-10 text-slate-300 mx-auto mb-3" />
                <h3 className="text-sm font-bold text-[#0F172A]">Không Tìm Thấy Kết Quả</h3>
                <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                  Hãy thử tìm kiếm với từ khóa khác hoặc thay đổi bộ lọc thể loại để đón đọc truyện mới nhé.
                </p>
                <button
                  onClick={handleResetFilters}
                  className="mt-4 px-4 py-2 text-xs font-bold text-white bg-[#7C3AED] hover:bg-[#6D28D9] rounded-xl transition-colors shadow-md"
                >
                  Xóa bộ lọc tìm kiếm
                </button>
              </div>
            )}

            {!isLoading && totalPages > 1 && (
              <nav className="mt-8 flex flex-wrap items-center justify-center gap-2" aria-label="Phân trang truyện">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={!storyPage?.hasPreviousPage}
                  className="h-10 px-3 rounded-xl border border-[#E2E8F0] bg-white text-xs font-bold text-slate-600 disabled:opacity-40 disabled:cursor-not-allowed hover:border-[#7C3AED]/40 flex items-center gap-1"
                >
                  <ChevronLeft className="h-4 w-4" /> Trang trước
                </button>
                {visiblePages.map((page) => (
                  <button
                    key={page}
                    onClick={() => handlePageChange(page)}
                    className={`h-10 min-w-10 px-3 rounded-xl text-xs font-bold transition-colors ${
                      page === currentPage
                        ? "bg-[#7C3AED] text-white shadow-md"
                        : "border border-[#E2E8F0] bg-white text-slate-600 hover:border-[#7C3AED]/40"
                    }`}
                  >
                    {page}
                  </button>
                ))}
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={!storyPage?.hasNextPage}
                  className="h-10 px-3 rounded-xl border border-[#E2E8F0] bg-white text-xs font-bold text-slate-600 disabled:opacity-40 disabled:cursor-not-allowed hover:border-[#7C3AED]/40 flex items-center gap-1"
                >
                  Trang sau <ChevronRight className="h-4 w-4" />
                </button>
              </nav>
            )}
          </div>
        </div>
      </main>

      {/* Mobile filter bottom sheet drawer */}
      {showMobileFilters && (
        <>
          <div className="fixed inset-0 bg-black/60 z-50 transition-opacity" onClick={() => setShowMobileFilters(false)} />
          <div className="fixed inset-x-0 bottom-0 max-h-[80vh] overflow-y-auto bg-white rounded-t-3xl z-50 p-6 flex flex-col shadow-2xl animate-slide-up pb-10">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <h3 className="font-bold text-slate-800 text-sm">BỘ LỌC TRUYỆN TRANH</h3>
              <button
                onClick={() => setShowMobileFilters(false)}
                className="p-1 hover:bg-slate-50 rounded-full"
              >
                <X className="h-5 w-5 text-slate-400" />
              </button>
            </div>

            {/* Categories */}
            <div className="space-y-2.5">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Thể loại</h4>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => { setSelectedCategorySlug(""); setCurrentPage(1); }}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg ${
                    !selectedCategorySlug ? "bg-[#7C3AED] text-white" : "bg-slate-50 text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  Tất cả thể loại
                </button>
                {visibleCategories.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => { setSelectedCategorySlug(c.slug); setCurrentPage(1); }}
                    className={`px-3 py-1.5 text-xs font-semibold rounded-lg ${
                      selectedCategorySlug === c.slug ? "bg-[#7C3AED] text-white" : "bg-slate-50 text-slate-600 hover:bg-slate-100"
                    }`}
                  >
                    {c.name}
                  </button>
                ))}
              </div>
              {hasMoreCategories && (
                <button
                  onClick={() => setVisibleCategoryCount((count) => count + 10)}
                  className="mt-3 text-xs font-bold text-[#7C3AED] flex items-center gap-1"
                >
                  Tải thêm thể loại <ChevronDown className="h-3.5 w-3.5" />
                </button>
              )}
            </div>

            {/* Status */}
            <div className="space-y-2.5 mt-5">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Trạng thái</h4>
              <div className="flex flex-wrap gap-2">
                {(["all", "ongoing", "completed", "paused"] as const).map((status) => (
                  <button
                    key={status}
                    onClick={() => setSelectedStatus(status)}
                    className={`px-3 py-1.5 text-xs font-semibold rounded-lg uppercase ${
                      selectedStatus === status ? "bg-[#7C3AED] text-white" : "bg-slate-50 text-slate-600 hover:bg-slate-100"
                    }`}
                  >
                    {status === "all" ? "Tất cả" : status === "ongoing" ? "Đang ra" : status === "completed" ? "Đã xong" : "Tạm dừng"}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={() => setShowMobileFilters(false)}
              className="mt-8 w-full py-3 bg-[#7C3AED] hover:bg-[#6D28D9] text-white text-xs font-bold rounded-xl"
            >
              Áp dụng bộ lọc
            </button>
          </div>
        </>
      )}
    </div>
  );
}
