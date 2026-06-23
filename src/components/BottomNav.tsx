import { Home, Compass, Clock, Bookmark, User } from "lucide-react";
import { ActivePage, User as UserType } from "../types";

interface BottomNavProps {
  activePage: ActivePage;
  onNavigate: (page: ActivePage) => void;
  currentUser: UserType | null;
}

export default function BottomNav({ activePage, onNavigate, currentUser }: BottomNavProps) {
  return (
    <div
      id="mobile-bottom-nav"
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 h-16 bg-white/95 backdrop-blur-md border-t border-[#E2E8F0] flex items-center justify-around px-2 pb-safe shadow-[0_-4px_12px_rgba(0,0,0,0.03)]"
    >
      <button
        onClick={() => onNavigate({ type: "home" })}
        className={`flex flex-col items-center justify-center w-12 h-12 rounded-full transition-colors ${
          activePage.type === "home" ? "text-[#7C3AED]" : "text-slate-400"
        }`}
      >
        <Home className="h-5 w-5" />
        <span className="text-[10px] font-semibold mt-0.5">Trang chủ</span>
      </button>
 
      <button
        onClick={() => onNavigate({ type: "story-list" })}
        className={`flex flex-col items-center justify-center w-12 h-12 rounded-full transition-colors ${
          activePage.type === "story-list" ? "text-[#7C3AED]" : "text-slate-400"
        }`}
      >
        <Compass className="h-5 w-5" />
        <span className="text-[10px] font-semibold mt-0.5">Khám phá</span>
      </button>
 
      <button
        onClick={() => onNavigate({ type: "history" })}
        className={`flex flex-col items-center justify-center w-12 h-12 rounded-full transition-colors ${
          activePage.type === "history" ? "text-[#7C3AED]" : "text-slate-400"
        }`}
      >
        <Clock className="h-5 w-5" />
        <span className="text-[10px] font-semibold mt-0.5">Lịch sử</span>
      </button>
 
      <button
        onClick={() => onNavigate({ type: "favorites" })}
        className={`flex flex-col items-center justify-center w-12 h-12 rounded-full transition-colors ${
          activePage.type === "favorites" ? "text-[#7C3AED]" : "text-slate-400"
        }`}
      >
        <Bookmark className="h-5 w-5" />
        <span className="text-[10px] font-semibold mt-0.5">Đã lưu</span>
      </button>
 
      <button
        onClick={() => {
          if (currentUser) {
            onNavigate({ type: "profile" });
          } else {
            onNavigate({ type: "login" });
          }
        }}
        className={`flex flex-col items-center justify-center w-12 h-12 rounded-full transition-colors ${
          activePage.type === "profile" || activePage.type === "login" ? "text-[#7C3AED]" : "text-slate-400"
        }`}
      >
        <User className="h-5 w-5" />
        <span className="text-[10px] font-semibold mt-0.5">Tôi</span>
      </button>
    </div>
  );
}
