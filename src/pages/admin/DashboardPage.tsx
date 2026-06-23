import { BookMarked, Eye, Users, FileText, Sparkles, TrendingUp, ShieldAlert, ArrowUpRight } from "lucide-react";
import { ActivePage } from "../../types";
import { dbService } from "../../services/dbService";

interface DashboardPageProps {
  onNavigate: (page: ActivePage) => void;
}

export default function DashboardPage({ onNavigate }: DashboardPageProps) {
  const stories = dbService.getStories();
  const chapters = dbService.getAllChapters();
  const users = dbService.getUsers();

  const totalViews = stories.reduce((sum, s) => sum + s.views, 0);

  // Statistics items listings
  const stats = [
    { label: "Tổng số truyện tranh", value: stories.length, icon: BookMarked, color: "bg-indigo-500", labelColor: "text-indigo-650" },
    { label: "Tổng chương đã đăng", value: chapters.length, icon: FileText, color: "bg-emerald-500", labelColor: "text-emerald-650" },
    { label: "Tổng lượt xem toàn web", value: totalViews.toLocaleString(), icon: Eye, color: "bg-rose-500", labelColor: "text-rose-650" },
    { label: "Tổng độc giả đăng ký", value: users.length, icon: Users, color: "bg-amber-500", labelColor: "text-amber-650" }
  ];

  const recentStories = [...stories].sort((a, b) => b.views - a.views).slice(0, 3);
  const recentUsers = [...users].reverse().slice(0, 3);

  return (
    <div id="admin-dashboard-page" className="flex-1 bg-slate-50/50 p-6 font-sans">
      <div className="mx-auto max-w-7xl space-y-8">
        
        {/* Banner */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div>
            <h1 className="text-xl font-black text-slate-800 tracking-tight sm:text-2xl">Dashboard Tổng Quan</h1>
            <p className="text-xs text-slate-400 mt-1 font-medium">Báo cáo tình trạng phát triển tác phẩm, tương tác độc giả và số liệu hệ thống VnTruyen.</p>
          </div>
          
          <div className="px-3.5 py-1.5 bg-indigo-50 border border-indigo-100 text-indigo-700 text-[11px] font-bold rounded-lg flex items-center gap-1">
            <Sparkles className="h-3.5 w-3.5" />
            Trạng thái máy chủ: ỔN ĐỊNH
          </div>
        </div>

        {/* Statistic Cards Panel Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, idx) => {
            const Icon = stat.icon;
            return (
              <div key={idx} className="bg-white border border-slate-100 rounded-3xl p-5 shadow-[0_2px_4px_rgba(0,0,0,0.01)] flex items-center gap-4">
                <div className={`h-12 w-12 rounded-2xl ${stat.color} flex items-center justify-center text-white shrink-0 shadow-md`}>
                  <Icon className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">{stat.label}</p>
                  <p className="text-lg font-black text-slate-800 mt-1">{stat.value}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Interactive panels: lists of new items */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Recent Stories Card */}
          <div className="bg-white border border-slate-100 rounded-3xl p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-50 pb-3">
              <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <TrendingUp className="h-4 w-4 text-emerald-500" />
                Bộ Truyện Nổi Bật (Lượt đọc cao)
              </h3>
              <button
                onClick={() => onNavigate({ type: "admin-stories" })}
                className="text-[10px] font-bold text-indigo-600 hover:underline flex items-center gap-0.5"
              >
                Quản lý
                <ArrowUpRight className="h-3.5 w-3.5" />
              </button>
            </div>

            <div className="space-y-3.5">
              {recentStories.map((story) => (
                <div key={story.id} className="flex items-center justify-between p-2.5 hover:bg-slate-50/50 rounded-2xl transition-colors">
                  <div className="flex items-center gap-3">
                    <img
                      src={story.coverUrl}
                      alt={story.title}
                      referrerPolicy="no-referrer"
                      className="h-12 w-9 object-cover rounded shadow-sm shrink-0"
                    />
                    <div>
                      <h4 className="text-xs font-bold text-slate-800 line-clamp-1">{story.title}</h4>
                      <p className="text-[10px] text-slate-400 mt-0.5">Tác giả: {story.author}</p>
                    </div>
                  </div>

                  <div className="text-right">
                    <p className="text-xs font-bold text-slate-850">{story.views.toLocaleString()}</p>
                    <p className="text-[9px] text-slate-400 font-medium">lượt xem</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* New Registered Users */}
          <div className="bg-white border border-slate-100 rounded-3xl p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-50 pb-3">
              <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <Users className="h-4 w-4 text-indigo-500" />
                Độc Giả Mới Kết Nạp
              </h3>
              <button
                onClick={() => onNavigate({ type: "admin-users" })}
                className="text-[10px] font-bold text-indigo-600 hover:underline flex items-center gap-0.5"
              >
                Danh sách
                <ArrowUpRight className="h-3.5 w-3.5" />
              </button>
            </div>

            <div className="space-y-3.5">
              {recentUsers.map((user) => (
                <div key={user.id} className="flex items-center justify-between p-2.5 hover:bg-slate-50/50 rounded-2xl transition-colors">
                  <div className="flex items-center gap-3">
                    <img
                      src={user.avatar || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150"}
                      alt={user.fullName}
                      referrerPolicy="no-referrer"
                      className="h-9 w-9 rounded-full object-cover border border-slate-200"
                    />
                    <div>
                      <h4 className="text-xs font-bold text-slate-800">{user.fullName}</h4>
                      <p className="text-[10px] text-slate-400 truncate max-w-[150px] sm:max-w-xs">{user.email}</p>
                    </div>
                  </div>

                  <span className="text-[10px] bg-indigo-50 text-indigo-700 font-bold px-2 py-0.5 rounded-md uppercase tracking-wider">
                    {user.role === "admin" ? "Ad" : "Độc giả"}
                  </span>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Audit administrative warning logs */}
        <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-4 flex gap-3 text-amber-800">
          <ShieldAlert className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="text-xs">
            <p className="font-bold">Lưu ý bảo mật quản trị viên</p>
            <p className="mt-1 font-medium leading-relaxed">Dữ liệu hoàn toàn đồng bộ ở bộ nhớ cục bộ `localStorage` của trình duyệt. Việc xóa cookie/bộ nhớ cache của bạn sẽ đặt lại các đầu mục truyện tranh đã thêm về thời điểm khởi tạo nguyên bản.</p>
          </div>
        </div>

      </div>
    </div>
  );
}
