import React, { useEffect, useMemo, useState } from "react";
import { Clock, Heart, Trash2, ArrowRight } from "lucide-react";
import { ActivePage } from "../types";
import { dbService } from "../services/dbService";
import { apiService, ReadingProgress } from "../services/apiService";

interface HistorySavedPageProps {
  initialTab?: "history" | "saved";
  onNavigate: (page: ActivePage) => void;
}

export default function HistorySavedPage({ initialTab = "history", onNavigate }: HistorySavedPageProps) {
  const [activeTab, setActiveTab] = useState<"history" | "saved">(initialTab);
  const [historyItems, setHistoryItems] = useState(dbService.getHistory());
  const [savedStories, setSavedStories] = useState(() => dbService.getFavorites()
    .map((id) => dbService.getStoryById(id))
    .filter((story): story is NonNullable<typeof story> => Boolean(story)));
  const [remoteProgress, setRemoteProgress] = useState<ReadingProgress[]>([]);
  const [libraryError, setLibraryError] = useState("");

  const stories = dbService.getStories();
  const progressItems = useMemo(() => remoteProgress.map((item) => {
    const cachedStory = stories.find((story) => story.id === item.storyId);
    return {
      progress: item,
      story: cachedStory || {
        id: item.storyId,
        title: item.storyName,
        slug: `${item.storyName.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${item.storyId}`,
        coverUrl: item.thumbnailUrl,
        description: "Thông tin giới thiệu đang được cập nhật.",
        author: "Đang cập nhật",
        status: item.status,
        views: 0,
        chapterCount: item.chapterCount,
        categories: item.categories,
        createdAt: item.updatedAt,
        updatedAt: item.updatedAt,
      },
    };
  }), [remoteProgress, stories]);

  useEffect(() => {
    if (!apiService.hasSession()) {
      if (initialTab === "saved") {
        window.alert("Bạn cần đăng nhập để sử dụng tính năng này");
        onNavigate({ type: "login" });
      }
      return;
    }

    let active = true;
    setLibraryError("");
    Promise.all([
      apiService.getFavorites(stories),
      apiService.getReadingProgress(),
    ]).then(([favorites, progress]) => {
      if (!active) return;
      favorites.forEach((story) => dbService.cacheStory(story));
      setSavedStories(favorites);
      setRemoteProgress(progress);
    }).catch(() => {
      if (active) setLibraryError("Không thể tải dữ liệu mới.");
    });

    return () => { active = false; };
  }, [initialTab, onNavigate]);

  const handleClearHistory = () => {
    if (confirm("Bạn có chắc chắn muốn xóa toàn bộ lịch sử đọc truyện không?")) {
      dbService.clearHistory();
      setHistoryItems([]);
    }
  };

  const handleRemoveFavorite = async (e: React.MouseEvent, storyId: string) => {
    e.stopPropagation();
    if (!apiService.hasSession()) {
      window.alert("Bạn cần đăng nhập để sử dụng tính năng này");
      onNavigate({ type: "login" });
      return;
    }

    const previous = savedStories;
    setSavedStories((items) => items.filter((story) => story.id !== storyId));
    try {
      await apiService.removeFavorite(storyId);
    } catch (error) {
      setSavedStories(previous);
      window.alert(error instanceof Error ? error.message : "Không thể bỏ thích.");
    }
  };

  return (
    <div id="history-saved-page" className="min-h-screen bg-slate-50/50 pb-20 pt-6 font-sans">
      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* Navigation Tabs */}
        <div className="flex border border-[#E2E8F0] max-w-lg mb-8 bg-slate-100 p-1 rounded-2xl mx-auto">
          <button
            onClick={() => setActiveTab("history")}
            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-bold transition-all ${
              activeTab === "history"
                ? "bg-white text-[#7C3AED] shadow-sm"
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            <Clock className="h-4 w-4" />
            Lịch Sử Đọc Gần Đây
          </button>
          
          <button
            onClick={() => setActiveTab("saved")}
            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-bold transition-all ${
              activeTab === "saved"
                ? "bg-white text-[#7C3AED] shadow-sm"
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            <Heart className="h-4 w-4" />
            Truyện Đã Thích
          </button>
        </div>

        {/* Tab 1: Reading History list */}
        {activeTab === "history" && (
          <div className="space-y-4">
            {libraryError && (
              <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs font-semibold text-amber-700">
                {libraryError} Đang hiển thị dữ liệu đã lưu trên thiết bị.
              </div>
            )}
            <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-3">
              <div className="flex items-center gap-2.5">
                <span className="w-1.5 h-6 bg-[#7C3AED] rounded-full inline-block"></span>
                <div>
                  <h2 className="text-lg font-bold text-[#0F172A]">Lịch sử đọc cá nhân</h2>
                  <p className="text-[#64748B] text-xs font-semibold">Tự động ghi lại chương truyện bạn vừa thưởng thức.</p>
                </div>
              </div>

              {historyItems.length > 0 && (
                <button
                  onClick={handleClearHistory}
                  className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  Xóa lịch sử
                </button>
              )}
            </div>

            {apiService.hasSession() && progressItems.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {progressItems.map(({ progress, story: s }) => (
                  <div
                    key={progress.storyId}
                    onClick={() => onNavigate({ type: "story-detail", slug: s.slug })}
                    className="cursor-pointer group bg-white border border-[#E2E8F0] rounded-2xl p-4 hover:border-[#7C3AED]/30 hover:shadow-md transition-all flex gap-4"
                  >
                    <img
                      src={s.coverUrl}
                      alt={s.title}
                      referrerPolicy="no-referrer"
                      className="h-20 w-16 object-cover rounded-lg shrink-0"
                    />
                    <div className="flex-1 flex flex-col justify-between py-0.5">
                      <div>
                        <h3 className="text-sm font-bold text-[#0F172A] group-hover:text-[#7C3AED] truncate transition-colors">
                          {s.title}
                        </h3>
                        <p className="text-xs font-semibold text-[#7C3AED] mt-1">Đang đọc Chương {progress.chapterNumber}</p>
                      </div>
                      <div className="flex items-center justify-between text-[10px] text-slate-400 font-medium">
                        <span>Cập nhật: {new Date(progress.updatedAt).toLocaleTimeString("vi-VN", { hour: "numeric", minute: "numeric" })} {new Date(progress.updatedAt).toLocaleDateString("vi-VN")}</span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onNavigate({ type: "reader", storySlug: s.slug, chapterId: progress.chapterId });
                          }}
                          className="text-xs text-[#7C3AED] hover:text-[#6D28D9] font-bold flex items-center gap-0.5"
                        >
                          Đọc tiếp
                          <ArrowRight className="h-3 w-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : historyItems.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {historyItems.map((item, index) => {
                  const s = stories.find((x) => x.id === item.storyId);
                  if (!s) return null;

                  return (
                    <div
                      key={index}
                      onClick={() => onNavigate({ type: "story-detail", slug: s.slug })}
                      className="cursor-pointer group bg-white border border-[#E2E8F0] rounded-2xl p-4 hover:border-[#7C3AED]/30 hover:shadow-md transition-all flex gap-4"
                    >
                      <img
                        src={s.coverUrl}
                        alt={s.title}
                        referrerPolicy="no-referrer"
                        className="h-20 w-16 object-cover rounded-lg shrink-0"
                      />
                      <div className="flex-1 flex flex-col justify-between py-0.5">
                        <div>
                          <h3 className="text-sm font-bold text-[#0F172A] group-hover:text-[#7C3AED] truncate transition-colors">
                            {s.title}
                          </h3>
                          <p className="text-xs font-semibold text-[#7C3AED] mt-1">Đang đọc Chương {item.chapterNumber}</p>
                        </div>
                        <div className="flex items-center justify-between text-[10px] text-slate-400 font-medium">
                          <span>Cách đây: {new Date(item.readAt).toLocaleTimeString("vi-VN", { hour: "numeric", minute: "numeric" })} {new Date(item.readAt).toLocaleDateString("vi-VN")}</span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onNavigate({ type: "reader", storySlug: s.slug, chapterNumber: item.chapterNumber });
                            }}
                            className="text-xs text-[#7C3AED] hover:text-[#6D28D9] font-bold flex items-center gap-0.5"
                          >
                            Đọc tiếp
                            <ArrowRight className="h-3 w-3" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="bg-white border border-[#E2E8F0] rounded-3xl p-12 text-center max-w-md mx-auto">
                <Clock className="h-10 w-10 text-slate-300 mx-auto mb-3" />
                <h3 className="text-sm font-bold text-slate-700">Chưa có lịch sử đọc truyện</h3>
                <p className="text-xs text-slate-400 mt-1">Hệ thống sẽ tự động lưu lại lịch sử khi bạn khám phá chương truyện bất kỳ.</p>
                <button
                  onClick={() => onNavigate({ type: "story-list" })}
                  className="mt-4 px-4 py-2 bg-[#7C3AED] hover:bg-[#6D28D9] text-white text-xs font-bold rounded-xl transition-all"
                >
                  Khám phá truyện hay ngay
                </button>
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Liked stories list */}
        {activeTab === "saved" && (
          <div className="space-y-4">
            <div className="flex items-center gap-2.5 border-b border-[#E2E8F0] pb-3">
              <span className="w-1.5 h-6 bg-[#7C3AED] rounded-full inline-block"></span>
              <div>
                <h2 className="text-lg font-bold text-[#0F172A]">Truyện đã thích</h2>
                <p className="text-[#64748B] text-xs font-semibold">Những tác phẩm bạn đã bấm thích và muốn quay lại đọc.</p>
              </div>
            </div>

            {savedStories.length > 0 ? (
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                {savedStories.map((s) => {
                  return (
                    <div
                      key={s.id}
                      onClick={() => onNavigate({ type: "story-detail", slug: s.slug })}
                      className="group cursor-pointer bg-white border border-[#E2E8F0] rounded-2xl p-3 hover:border-[#7C3AED]/30 hover:shadow-md transition-all relative"
                    >
                      <button
                        onClick={(e) => handleRemoveFavorite(e, s.id)}
                        className="absolute top-4 right-4 z-10 p-2 rounded-full bg-white/95 text-rose-500 shadow-sm border border-[#E2E8F0] hover:bg-rose-50 transition-colors"
                        title="Bỏ thích"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>

                      <div className="aspect-[3/4] w-full rounded-xl overflow-hidden bg-slate-50 mb-3">
                        <img
                          src={s.coverUrl}
                          alt={s.title}
                          referrerPolicy="no-referrer"
                          className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>

                      <h3 className="text-xs font-bold text-slate-850 group-hover:text-[#7C3AED] truncate">
                        {s.title}
                      </h3>

                      <p className="text-[10px] text-slate-400 uppercase tracking-widest mt-1">Tác giả: {s.author.split(" ").pop()}</p>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="bg-white border border-[#E2E8F0] rounded-3xl p-12 text-center max-w-md mx-auto">
                <Heart className="h-10 w-10 text-slate-350 mx-auto mb-3" />
                <h3 className="text-sm font-bold text-slate-700">Chưa thích truyện nào</h3>
                <p className="text-xs text-slate-400 mt-1">Bấm vào biểu tượng trái tim ở truyện bạn thích để lưu vào danh sách này.</p>
                <button
                  onClick={() => onNavigate({ type: "story-list" })}
                  className="mt-4 px-4 py-2 bg-[#7C3AED] hover:bg-[#6D28D9] text-white text-xs font-bold rounded-xl transition-all"
                >
                  Xem danh sách truyện
                </button>
              </div>
            )}
          </div>
        )}

      </main>
    </div>
  );
}
