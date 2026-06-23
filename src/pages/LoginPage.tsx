import React, { useState } from "react";
import { Mail, Lock, LogIn } from "lucide-react";
import { ActivePage } from "../types";
import { dbService } from "../services/dbService";
import { apiService } from "../services/apiService";

interface LoginPageProps {
  onNavigate: (page: ActivePage) => void;
  onLoginSuccess: () => void;
}

export default function LoginPage({ onNavigate, onLoginSuccess }: LoginPageProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setErrorMsg("Vui lòng điền địa chỉ email!");
      return;
    }
    setErrorMsg("");
    setIsSubmitting(true);
    try {
      const user = await apiService.login(email.trim(), password);
      dbService.setCurrentUser(user);
      onLoginSuccess();
    } catch (e: any) {
      setErrorMsg(e.message || "Đăng nhập thất bại!");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div id="login-page" className="min-h-screen bg-slate-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-3xl border border-slate-100 shadow-xl">
        
        {/* Brand header */}
        <div className="text-center">
          <div
            onClick={() => onNavigate({ type: "home" })}
            className="inline-flex cursor-pointer h-12 w-12 items-center justify-center rounded-2xl bg-[#7C3AED] text-white shadow-lg mx-auto"
          >
            <span className="font-bold text-2xl">V</span>
          </div>
          <h2 className="mt-4 text-2xl font-black text-slate-800 tracking-tight">Chào mừng quay lại!</h2>
          <p className="mt-1.5 text-xs text-slate-400 font-medium leading-normal max-w-xs mx-auto">
            Đăng nhập vào VnTruyen để lưu trữ lịch sử đọc và đồng bộ hóa truyện đã thích.
          </p>
        </div>

        {errorMsg && (
          <div className="bg-rose-50 border border-rose-100 text-rose-600 rounded-xl p-3 text-xs font-semibold text-center animate-shake">
            {errorMsg}
          </div>
        )}

        {/* Regular Email form */}
        <form className="mt-6 space-y-4" onSubmit={handleLoginSubmit}>
          <div className="space-y-1">
            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest block font-sans">Địa chỉ Email</label>
            <div className="relative">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="ten-cua-ban@gmail.com"
                className="w-full h-11 pl-10 pr-4 text-xs font-semibold bg-slate-50 rounded-xl border border-[#E2E8F0] focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#7C3AED]/20 font-sans"
              />
              <Mail className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
            </div>
          </div>

          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest block font-sans">Mật khẩu</label>
              <span className="text-[11px] font-bold text-[#7C3AED] hover:underline cursor-pointer select-none">Quên mật khẩu?</span>
            </div>
            <div className="relative">
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full h-11 pl-10 pr-4 text-xs font-semibold bg-slate-50 rounded-xl border border-[#E2E8F0] focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#7C3AED]/20 font-sans"
              />
              <Lock className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full h-12 bg-[#7C3AED] hover:bg-[#6D28D9] active:bg-[#5B21B6] text-white font-bold rounded-xl text-xs uppercase tracking-wider shadow-md flex items-center justify-center gap-1.5 transition-all mt-6"
          >
            <LogIn className="h-4 w-4" />
            {isSubmitting ? "Đang đăng nhập..." : "Đăng Nhập Ngay"}
          </button>
        </form>

        <div className="text-center pt-2">
          <p className="text-xs font-medium text-slate-500">
            Chưa có tài khoản độc giả?{" "}
            <button
              onClick={() => onNavigate({ type: "register" })}
              className="text-[#7C3AED] font-bold hover:underline"
            >
              Đăng ký tại đây
            </button>
          </p>
        </div>

      </div>
    </div>
  );
}
