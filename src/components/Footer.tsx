import { AlertTriangle } from "lucide-react";

export default function Footer() {
  return (
    <footer id="app-footer" className="bg-white text-[#64748B] font-sans border-t border-[#E2E8F0] pt-12 pb-24 md:pb-12 px-4">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          
          {/* Brand block */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-[#7C3AED] rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">V</span>
              </div>
              <span className="text-xl font-bold tracking-tight text-[#0F172A]">
                Vn<span className="text-[#7C3AED]">Truyen</span>
              </span>
            </div>
            <p className="text-xs text-[#64748B] max-w-sm leading-relaxed">
              VnTruyen là nền tảng đọc truyện tranh hiện đại bậc nhất trực tuyến. Trực quan hóa trải nghiệm giải trí lành mạnh tốt đẹp cho độc giả Việt cả nước.
            </p>
            <div className="flex items-center gap-2 text-xs bg-amber-50 border border-amber-200 rounded-xl p-2.5 text-amber-800 max-w-sm">
              <AlertTriangle className="h-4 w-4 shrink-0 text-amber-600" />
              <span>Nội dung thử nghiệm phi thương mại. Tất cả bản quyền ảnh thuộc về tác giả gốc.</span>
            </div>
          </div>

          {/* Quick categories */}
          <div>
            <h4 className="text-sm font-bold text-[#0F172A] mb-3 tracking-wide uppercase">PHỔ BIẾN</h4>
            <ul className="space-y-2 text-xs">
              <li><span className="hover:text-[#7C3AED] cursor-pointer transition-colors">Hành Động & Kịch Tính</span></li>
              <li><span className="hover:text-[#7C3AED] cursor-pointer transition-colors">Phiêu Lưu Kỳ Bí</span></li>
              <li><span className="hover:text-[#7C3AED] cursor-pointer transition-colors">Tình Cảm Lãng Mạn</span></li>
              <li><span className="hover:text-[#7C3AED] cursor-pointer transition-colors">Đời Thường & Chữa Lành</span></li>
            </ul>
          </div>

          {/* Guidelines */}
          <div>
            <h4 className="text-sm font-bold text-[#0F172A] mb-3 tracking-wide uppercase">ĐIỀU KHOẢN</h4>
            <ul className="space-y-2 text-xs">
              <li><span className="hover:text-[#7C3AED] cursor-pointer transition-colors">Quy định cộng đồng</span></li>
              <li><span className="hover:text-[#7C3AED] cursor-pointer transition-colors">Chính sách bảo mật</span></li>
              <li><span className="hover:text-[#7C3AED] cursor-pointer transition-colors">Liên hệ bản quyền</span></li>
              <li><span className="hover:text-[#7C3AED] cursor-pointer transition-colors">Hợp tác xuất bản</span></li>
            </ul>
          </div>

        </div>

        <div className="border-t border-[#E2E8F0] mt-10 pt-6 flex flex-col md:flex-row items-center justify-between gap-4 text-[11px] text-[#64748B]">
          <p>© 2026 VnTruyen — Nền tảng đọc truyện hiện đại bậc nhất. Thiết kế bởi Google AI Studio Build.</p>
          <div className="flex gap-4">
            <span className="hover:text-[#7C3AED] cursor-pointer transition-colors">Facebook</span>
            <span className="hover:text-[#7C3AED] cursor-pointer transition-colors">Discord</span>
            <span className="hover:text-[#7C3AED] cursor-pointer transition-colors">Telegram</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
