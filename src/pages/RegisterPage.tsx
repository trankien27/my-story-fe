import React, { useState } from "react";
import { BookOpen, User, Mail, Lock, Sparkles } from "lucide-react";
import { ActivePage } from "../types";
import { dbService } from "../services/dbService";
import { apiService } from "../services/apiService";

interface RegisterPageProps {
  onNavigate: (page: ActivePage) => void;
  onRegisterSuccess: () => void;
}

export default function RegisterPage({ onNavigate, onRegisterSuccess }: RegisterPageProps) {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !email.trim() || !password.trim()) {
      setErrorMsg("Vui lòng điền đầy đủ tất cả các trường dữ liệu!");
      return;
    }
    if (password !== confirmPassword) {
      setErrorMsg("Xác nhận mật khẩu mới không khớp!");
      return;
    }
    setErrorMsg("");
    setIsSubmitting(true);
    try {
      const user = await apiService.register(fullName.trim(), email.trim(), password, confirmPassword);
      dbService.setCurrentUser(user);
      onRegisterSuccess();
    } catch (e: any) {
      setErrorMsg(e.message || "Email này đã được sử dụng rồi!");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div id="register-page" className="min-h-screen bg-slate-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-3xl border border-slate-100 shadow-xl">
        
        {/* Header bar */}
        <div className="text-center">
          <div
            onClick={() => onNavigate({ type: "home" })}
            className="inline-flex cursor-pointer h-12 w-12 items-center justify-center rounded-2xl bg-[#7C3AED] text-white shadow-lg mx-auto"
          >
            <span className="font-bold text-2xl">V</span>
          </div>
          <h2 className="mt-4 text-2xl font-black text-slate-800 tracking-tight">Tạo Tài Khoản Mới</h2>
          <p className="mt-1.5 text-xs text-slate-400 font-medium leading-normal max-w-xs mx-auto">
            Hòa mình cùng thế giới truyện tranh kỳ thú và đồng hành cùng hàng vạn độc giả khác.
          </p>
        </div>

        {errorMsg && (
          <div className="bg-rose-50 border border-rose-100 text-rose-600 rounded-xl p-3 text-xs font-semibold text-center select-none">
            {errorMsg}
          </div>
        )}

        <form className="mt-6 space-y-4" onSubmit={handleRegisterSubmit}>
          <div className="space-y-1">
            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest block font-sans">Họ và Tên</label>
            <div className="relative">
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Nguyễn Văn A"
                className="w-full h-11 pl-10 pr-4 text-xs font-semibold bg-slate-50 rounded-xl border border-[#E2E8F0] focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#7C3AED]/20 font-sans"
              />
              <User className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
            </div>
          </div>

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
            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest block font-sans">Mật khẩu</label>
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

          <div className="space-y-1">
            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest block font-sans">Nhập lại Mật khẩu</label>
            <div className="relative">
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full h-11 pl-10 pr-4 text-xs font-semibold bg-slate-50 rounded-xl border border-[#E2E8F0] focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#7C3AED]/20 font-sans"
              />
              <Lock className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full h-12 bg-[#7C3AED] hover:bg-[#6D28D9] text-white font-bold rounded-xl text-xs uppercase tracking-wider shadow-md flex items-center justify-center gap-1.5 transition-all mt-6"
          >
            <Sparkles className="h-4 w-4" />
            {isSubmitting ? "Đang đăng ký..." : "Đăng Ký Độc Giả"}
          </button>
        </form>

        <div className="text-center pt-2">
          <p className="text-xs font-medium text-slate-500">
            Đã có tài khoản độc giả?{" "}
            <button
              onClick={() => onNavigate({ type: "login" })}
              className="text-[#7C3AED] font-bold hover:underline"
            >
              Đăng nhập tại đây
            </button>
          </p>
        </div>

      </div>
    </div>
  );
}
