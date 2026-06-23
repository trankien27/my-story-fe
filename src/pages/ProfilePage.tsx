import React, { useState } from "react";
import { User, Calendar, ShieldCheck, Mail, Save, Clock, Bookmark, HelpCircle } from "lucide-react";
import { ActivePage, User as UserType } from "../types";
import { dbService } from "../services/dbService";

interface ProfilePageProps {
  currentUser: UserType | null;
  onNavigate: (page: ActivePage) => void;
  onUpdateSuccess: () => void;
}

export default function ProfilePage({ currentUser, onNavigate, onUpdateSuccess }: ProfilePageProps) {
  const [fullName, setFullName] = useState(currentUser?.fullName || "");
  const [avatar, setAvatar] = useState(currentUser?.avatar || "");
  const [feedback, setFeedback] = useState("");
  const [showStatus, setShowStatus] = useState(false);

  if (!currentUser) {
    onNavigate({ type: "login" });
    return null;
  }

  const handleUpdateProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (fullName.trim()) {
      const users = dbService.getUsers();
      const idx = users.findIndex((u) => u.id === currentUser.id);
      if (idx !== -1) {
        users[idx].fullName = fullName.trim();
        if (avatar.trim()) users[idx].avatar = avatar.trim();
        // save
        localStorage.setItem("vntruyen_users", JSON.stringify(users));
        dbService.setCurrentUser(users[idx]);
        onUpdateSuccess();
        setShowStatus(true);
        setTimeout(() => setShowStatus(false), 2000);
      }
    }
  };

  const savedCount = dbService.getFavorites().length;
  const historyCount = dbService.getHistory().length;

  return (
    <div id="profile-page" className="min-h-screen bg-slate-50/50 pb-20 pt-6 font-sans">
      <main className="mx-auto max-w-3xl px-4 sm:px-6">
        
        {/* Profile Card Header */}
        <div className="bg-white border border-[#E2E8F0] rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row items-center gap-6 pb-6 border-b border-[#E2E8F0]">
            <img
              src={avatar || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150"}
              alt={currentUser.fullName}
              className="h-24 w-24 rounded-full border-2 border-[#7C3AED]/20 object-cover"
            />
            
            <div className="text-center sm:text-left space-y-1">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                <h1 className="text-xl font-bold text-slate-800">{currentUser.fullName}</h1>
                <span className={`text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-full ${
                  currentUser.role === "admin" ? "bg-amber-100 text-amber-700 border border-amber-200" : "bg-[#7C3AED]/10 text-[#7C3AED] border border-[#7C3AED]/20"
                }`}>
                  {currentUser.role === "admin" ? "Quản trị viên" : "Độc giả thân thiết"}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1 flex items-center justify-center sm:justify-start gap-1 font-semibold">
                <Mail className="h-3 w-3" />
                {currentUser.email}
              </p>
              <p className="text-xs text-slate-405 flex items-center justify-center sm:justify-start gap-1 font-semibold">
                <Calendar className="h-3 w-3" />
                Thành viên từ: {new Date(currentUser.joinedAt).toLocaleDateString("vi-VN")}
              </p>
            </div>
          </div>

          {/* Reading Statistics */}
          <div className="grid grid-cols-2 gap-4 text-center">
            <div className="bg-slate-50 p-4 rounded-2xl border border-[#E2E8F0]">
              <Bookmark className="h-5 w-5 text-[#7C3AED]" />
              <p className="text-xs text-slate-400 mt-1">Đang theo dõi</p>
              <p className="text-lg font-bold text-slate-800 mt-0.5">{savedCount} truyện</p>
            </div>

            <div className="bg-slate-50 p-4 rounded-2xl border border-[#E2E8F0]">
              <Clock className="h-5 w-5 text-[#7C3AED]" />
              <p className="text-xs text-slate-400 mt-1">Đã lưu lịch sử</p>
              <p className="text-lg font-bold text-slate-800 mt-0.5">{historyCount} chương</p>
            </div>
          </div>

          {showStatus && (
            <div className="bg-emerald-50 border border-emerald-100 text-emerald-600 rounded-xl p-3 text-xs font-bold text-center">
              Cập nhật hồ sơ thành viên thành công!
            </div>
          )}

          {/* Profile fields Form */}
          <form onSubmit={handleUpdateProfile} className="space-y-4">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest border-b border-[#E2E8F0] pb-2 font-sans">CHỈNH SỬA THÔNG TIN CHI TIẾT</h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-405 uppercase tracking-widest block font-sans font-semibold">Tên hiển thị</label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Kien Nguyen"
                  className="w-full h-10 px-3.5 text-xs font-semibold bg-slate-50 rounded-xl border border-[#E2E8F0] focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#7C3AED]/20 focus:border-[#7C3AED] font-sans"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-405 uppercase tracking-widest block font-sans font-semibold">Đường dẫn ảnh đại diện (URL)</label>
                <input
                  type="text"
                  value={avatar}
                  onChange={(e) => setAvatar(e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full h-10 px-3.5 text-xs font-semibold bg-slate-50 rounded-xl border border-[#E2E8F0] focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#7C3AED]/20 focus:border-[#7C3AED] font-sans"
                />
              </div>
            </div>

            <button
              type="submit"
              className="px-5 h-10 bg-[#7C3AED] hover:bg-[#6D28D9] text-white rounded-xl text-xs font-bold shadow-md flex items-center gap-1.5 transition-colors"
            >
              <Save className="h-4 w-4" />
              Ghi nhận thay đổi
            </button>
          </form>

        </div>

      </main>
    </div>
  );
}
