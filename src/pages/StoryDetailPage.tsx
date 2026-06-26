import React, { useState, useEffect } from "react";
import { BookOpen, Star, Eye, Calendar, Sparkles, SortAsc, SortDesc, Heart, MessageSquare, ChevronRight, User as UserIcon, Reply, Pencil, Trash2, Send } from "lucide-react";
import { Story, StoryChapter, ActivePage } from "../types";
import { dbService } from "../services/dbService";
import { apiService, Comment as StoryComment, CommentPage, ReadingProgress } from "../services/apiService";

interface StoryDetailPageProps {
  slug: string;
  onNavigate: (page: ActivePage) => void;
}

export default function StoryDetailPage({ slug, onNavigate }: StoryDetailPageProps) {
  const [ascendingChapters, setAscendingChapters] = useState(true);
  const [userComment, setUserComment] = useState("");
  const [replyContent, setReplyContent] = useState("");
  const [replyingToId, setReplyingToId] = useState<string | null>(null);
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editingContent, setEditingContent] = useState("");
  const [isCommentSubmitting, setIsCommentSubmitting] = useState(false);
  const [isCommentsLoading, setIsCommentsLoading] = useState(false);
  const [commentError, setCommentError] = useState("");
  const cachedStory = dbService.getStoryById(slug) || dbService.getStoryBySlug(slug);
  const [story, setStory] = useState<Story | undefined>(cachedStory);
  const [isFavorite, setIsFavorite] = useState(() =>
    cachedStory ? cachedStory.isFav ?? dbService.isFavorite(cachedStory.id) : false,
  );
  const [readingProgress, setReadingProgress] = useState<ReadingProgress | null>(null);
  const [isContinueLoading, setIsContinueLoading] = useState(false);
  const [isLoadingDetail, setIsLoadingDetail] = useState(true);
  const [detailError, setDetailError] = useState("");
  const [comments, setComments] = useState<StoryComment[]>([]);
  const [commentPage, setCommentPage] = useState<Omit<CommentPage, "items"> | null>(null);

  useEffect(() => {
    let active = true;
    const storyIdFromSlug = slug.match(/(?:^|-)(\d+)$/)?.[1] || "";
    const storyId = cachedStory?.id || storyIdFromSlug;
    if (!storyId) {
      setIsLoadingDetail(false);
      return () => { active = false; };
    }

    setIsLoadingDetail(true);
    setDetailError("");
    apiService
      .getStory(storyId, cachedStory)
      .then((result) => {
        if (!active) return;
        dbService.cacheStory(result);
        setStory(result);
      })
      .catch(() => {
        if (active) setDetailError("Không thể tải dữ liệu mới.");
      })
      .finally(() => {
        if (active) setIsLoadingDetail(false);
      });

    return () => { active = false; };
  }, [slug, cachedStory?.id]);

  useEffect(() => {
    if (story) {
      dbService.incrementViews(story.id);
    }
  }, [story?.id]);

  useEffect(() => {
    if (story) {
      setIsFavorite(story.isFav ?? dbService.isFavorite(story.id));
    }
  }, [story?.id, story?.isFav]);

  useEffect(() => {
    if (!story || !apiService.hasSession()) {
      setReadingProgress(null);
      return;
    }

    let active = true;
    apiService
      .getStoryReadingProgress(story.id)
      .then((progress) => {
        if (active) setReadingProgress(progress);
      })
      .catch(() => {
        if (active) setReadingProgress(null);
      });

    return () => { active = false; };
  }, [story?.id]);

  useEffect(() => {
    if (!story) return;

    let active = true;
    setIsCommentsLoading(true);
    setCommentError("");
    apiService
      .getComments(story.id)
      .then((result) => {
        if (!active) return;
        const { items, ...page } = result;
        setComments(items);
        setCommentPage(page);
      })
      .catch(() => {
        if (active) setCommentError("Không thể tải bình luận.");
      })
      .finally(() => {
        if (active) setIsCommentsLoading(false);
      });

    return () => { active = false; };
  }, [story?.id]);

  if (isLoadingDetail) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="h-10 w-10 rounded-full border-4 border-slate-200 border-t-[#7C3AED] animate-spin" />
      </div>
    );
  }

  if (!story) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6 text-center">
        <div className="bg-white p-8 rounded-2xl border border-slate-100 max-w-sm shadow-sm">
          <h2 className="text-sm font-bold text-slate-800">Tác Phẩm Không Tồn Tại</h2>
          <p className="text-xs text-slate-400 mt-2">Đường dẫn không hợp lệ hoặc tác phẩm đã gỡ bỏ khỏi hệ thống.</p>
          <button
            onClick={() => onNavigate({ type: "home" })}
            className="mt-4 px-4 py-2 text-xs font-bold text-white bg-indigo-600 rounded-xl"
          >
            Quay về trang chủ
          </button>
        </div>
      </div>
    );
  }

  const savedChapters = dbService.getChapters(story.id);
  const chapters: StoryChapter[] = story.chapters ?? savedChapters.map((chapter) => ({
    id: chapter.id,
    chapterNumber: chapter.chapterNumber,
    view: 0,
  }));
  const ascendingChapterList = [...chapters].sort((a, b) => a.chapterNumber - b.chapterNumber);
  const orderedChapters = ascendingChapters ? ascendingChapterList : [...ascendingChapterList].reverse();
  const firstChapter = ascendingChapterList[0];
  const latestChapter = ascendingChapterList[ascendingChapterList.length - 1];
  const localReadingHistory = dbService.getHistory().find((item) => item.storyId === story.id);
  const continueChapterNumber = readingProgress?.chapterNumber ?? localReadingHistory?.chapterNumber;
  const primaryChapterNumber = continueChapterNumber ?? firstChapter?.chapterNumber;

  const handleContinueReading = async () => {
    if (!apiService.hasSession()) {
      onNavigate({ type: "reader", storySlug: story.slug, chapterNumber: primaryChapterNumber });
      return;
    }

    setIsContinueLoading(true);
    try {
      const progress = await apiService.getStoryReadingProgress(story.id);
      if (progress?.chapterId) {
        setReadingProgress(progress);
        onNavigate({ type: "reader", storySlug: story.slug, chapterId: progress.chapterId });
      } else {
        onNavigate({ type: "reader", storySlug: story.slug, chapterNumber: primaryChapterNumber });
      }
    } catch {
      onNavigate({ type: "reader", storySlug: story.slug, chapterNumber: primaryChapterNumber });
    } finally {
      setIsContinueLoading(false);
    }
  };

  const handleToggleFavorite = async () => {
    if (!apiService.hasSession()) {
      window.alert("Bạn cần đăng nhập để sử dụng tính năng này");
      onNavigate({ type: "login" });
      return;
    }

    const nextState = !isFavorite;
    setIsFavorite(nextState);
    setStory((current) => current ? { ...current, isFav: nextState } : current);
    try {
      if (nextState) {
        await apiService.addFavorite(story.id);
      } else {
        await apiService.removeFavorite(story.id);
      }
    } catch (error) {
      setIsFavorite(!nextState);
      setStory((current) => current ? { ...current, isFav: !nextState } : current);
      window.alert(error instanceof Error ? error.message : "Không thể cập nhật yêu thích.");
    }
  };

  const mergeComment = (items: StoryComment[], updated: StoryComment): StoryComment[] => {
    if (!updated.parentId) {
      return items.map((item) => item.id === updated.id ? { ...updated, replies: updated.replies || item.replies } : item);
    }
    return items.map((item) =>
      item.id === updated.parentId
        ? { ...item, replies: item.replies.map((reply) => reply.id === updated.id ? updated : reply) }
        : item,
    );
  };

  const removeComment = (items: StoryComment[], commentId: string): StoryComment[] =>
    items
      .filter((item) => item.id !== commentId)
      .map((item) => ({ ...item, replies: item.replies.filter((reply) => reply.id !== commentId) }));

  const canEditComment = (comment: StoryComment) => {
    const currentUser = dbService.getCurrentUser();
    return Boolean(currentUser && comment.userFullName === currentUser.fullName);
  };

  const canDeleteComment = (comment: StoryComment) => {
    const currentUser = dbService.getCurrentUser();
    return Boolean(currentUser && (currentUser.role === "admin" || comment.userFullName === currentUser.fullName));
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    const content = userComment.trim();
    if (!content) return;
    if (!apiService.hasSession()) {
      window.alert("Bạn cần đăng nhập để sử dụng tính năng này");
      onNavigate({ type: "login" });
      return;
    }
    if (content.length > 1000) {
      window.alert("Bình luận tối đa 1000 ký tự.");
      return;
    }

    setIsCommentSubmitting(true);
    try {
      const created = await apiService.addComment(story.id, content);
      setComments((items) => [created, ...items]);
      setCommentPage((page) => page ? { ...page, totalCount: page.totalCount + 1 } : page);
      setUserComment("");
    } catch (error) {
      window.alert(error instanceof Error ? error.message : "Không thể gửi bình luận.");
    } finally {
      setIsCommentSubmitting(false);
    }
  };

  const handleAddReply = async (parentId: string) => {
    const content = replyContent.trim();
    if (!content) return;
    if (!apiService.hasSession()) {
      window.alert("Bạn cần đăng nhập để sử dụng tính năng này");
      onNavigate({ type: "login" });
      return;
    }
    if (content.length > 1000) {
      window.alert("Phản hồi tối đa 1000 ký tự.");
      return;
    }

    setIsCommentSubmitting(true);
    try {
      const created = await apiService.addComment(story.id, content, parentId);
      setComments((items) =>
        items.map((item) => item.id === parentId ? { ...item, replies: [...item.replies, created] } : item),
      );
      setReplyingToId(null);
      setReplyContent("");
    } catch (error) {
      window.alert(error instanceof Error ? error.message : "Không thể gửi phản hồi.");
    } finally {
      setIsCommentSubmitting(false);
    }
  };

  const startEditComment = (comment: StoryComment) => {
    setEditingCommentId(comment.id);
    setEditingContent(comment.content);
    setReplyingToId(null);
  };

  const handleUpdateComment = async (commentId: string) => {
    const content = editingContent.trim();
    if (!content) return;
    if (content.length > 1000) {
      window.alert("Bình luận tối đa 1000 ký tự.");
      return;
    }

    setIsCommentSubmitting(true);
    try {
      const updated = await apiService.updateComment(story.id, commentId, content);
      setComments((items) => mergeComment(items, updated));
      setEditingCommentId(null);
      setEditingContent("");
    } catch (error) {
      window.alert(error instanceof Error ? error.message : "Không thể chỉnh sửa bình luận.");
    } finally {
      setIsCommentSubmitting(false);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!confirm("Bạn có chắc chắn muốn xóa bình luận này không?")) return;
    const isRootComment = comments.some((comment) => comment.id === commentId);
    setIsCommentSubmitting(true);
    try {
      await apiService.deleteComment(story.id, commentId);
      setComments((items) => removeComment(items, commentId));
      if (isRootComment) {
        setCommentPage((page) => page ? { ...page, totalCount: Math.max(0, page.totalCount - 1) } : page);
      }
    } catch (error) {
      window.alert(error instanceof Error ? error.message : "Không thể xóa bình luận.");
    } finally {
      setIsCommentSubmitting(false);
    }
  };

  const handleLoadMoreComments = async () => {
    if (!commentPage?.hasNextPage) return;
    setIsCommentsLoading(true);
    try {
      const result = await apiService.getComments(story.id, commentPage.page + 1, commentPage.pageSize);
      const { items, ...page } = result;
      setComments((current) => [...current, ...items]);
      setCommentPage(page);
    } catch {
      setCommentError("Không thể tải thêm bình luận.");
    } finally {
      setIsCommentsLoading(false);
    }
  };

  const formatCommentTime = (value: string) =>
    new Date(value).toLocaleString("vi-VN", { hour: "2-digit", minute: "2-digit", day: "2-digit", month: "2-digit", year: "numeric" });

  const renderComment = (comment: StoryComment, isReply = false) => {
    const isEditing = editingCommentId === comment.id;
    return (
      <div key={comment.id} className={`${isReply ? "ml-5 border-l border-slate-200 pl-3" : ""}`}>
        <div className="bg-slate-50/70 p-3 rounded-2xl border border-slate-100/70">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <span className="text-[11px] font-black text-slate-750 flex items-center gap-1">
                <UserIcon className="h-3 w-3 text-slate-400" />
                <span className="truncate">{comment.userFullName}</span>
              </span>
              <p className="mt-0.5 text-[9px] text-slate-400 font-medium">
                {formatCommentTime(comment.createdAt)}
                {comment.updatedAt ? " · đã sửa" : ""}
              </p>
            </div>
            <div className="flex shrink-0 items-center gap-1">
              {!isReply && (
                <button
                  type="button"
                  onClick={() => {
                    setReplyingToId(replyingToId === comment.id ? null : comment.id);
                    setEditingCommentId(null);
                    setReplyContent("");
                  }}
                  className="p-1 text-slate-400 hover:text-[#7C3AED]"
                  title="Phản hồi"
                >
                  <Reply className="h-3.5 w-3.5" />
                </button>
              )}
              {canEditComment(comment) && (
                <button type="button" onClick={() => startEditComment(comment)} className="p-1 text-slate-400 hover:text-[#7C3AED]" title="Sửa">
                  <Pencil className="h-3.5 w-3.5" />
                </button>
              )}
              {canDeleteComment(comment) && (
                <button type="button" onClick={() => handleDeleteComment(comment.id)} className="p-1 text-slate-400 hover:text-rose-500" title="Xóa">
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          </div>

          {isEditing ? (
            <div className="mt-2 space-y-2">
              <textarea
                rows={3}
                value={editingContent}
                maxLength={1000}
                onChange={(event) => setEditingContent(event.target.value)}
                className="w-full text-xs p-3 rounded-2xl border border-[#E2E8F0] focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/30 focus:border-[#7C3AED] bg-white placeholder-slate-400 font-semibold"
              />
              <div className="flex justify-end gap-2">
                <button type="button" onClick={() => setEditingCommentId(null)} className="h-8 px-3 rounded-lg text-[11px] font-bold text-slate-500 hover:bg-slate-100">
                  Hủy
                </button>
                <button type="button" disabled={isCommentSubmitting} onClick={() => handleUpdateComment(comment.id)} className="h-8 px-3 rounded-lg bg-[#7C3AED] text-[11px] font-bold text-white hover:bg-[#6D28D9]">
                  Lưu
                </button>
              </div>
            </div>
          ) : (
            <p className="mt-2 text-xs text-slate-600 font-medium leading-relaxed whitespace-pre-line">{comment.content}</p>
          )}
        </div>

        {!isReply && replyingToId === comment.id && (
          <div className="mt-2 ml-5 space-y-2">
            <textarea
              rows={2}
              value={replyContent}
              maxLength={1000}
              onChange={(event) => setReplyContent(event.target.value)}
              placeholder={`Phản hồi ${comment.userFullName}...`}
              className="w-full text-xs p-3 rounded-2xl border border-[#E2E8F0] focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/30 focus:border-[#7C3AED] bg-white placeholder-slate-400 font-semibold"
            />
            <div className="flex justify-end gap-2">
              <button type="button" onClick={() => setReplyingToId(null)} className="h-8 px-3 rounded-lg text-[11px] font-bold text-slate-500 hover:bg-slate-100">
                Hủy
              </button>
              <button type="button" disabled={isCommentSubmitting} onClick={() => handleAddReply(comment.id)} className="h-8 px-3 rounded-lg bg-[#7C3AED] text-[11px] font-bold text-white hover:bg-[#6D28D9]">
                Gửi
              </button>
            </div>
          </div>
        )}

        {!isReply && comment.replies.length > 0 && (
          <div className="mt-2 space-y-2">
            {comment.replies.map((reply) => renderComment(reply, true))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div id="story-detail-page" className="min-h-screen bg-slate-50/50 pb-20 pt-6 font-sans">
      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {detailError && (
          <div className="mb-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs font-semibold text-amber-700">
            {detailError} Đang hiển thị dữ liệu đã lưu gần nhất.
          </div>
        )}
        
        {/* Breadcrumb utility direction */}
        <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium mb-6">
          <span className="hover:text-slate-700 cursor-pointer" onClick={() => onNavigate({ type: "home" })}>Trang chủ</span>
          <ChevronRight className="h-3 w-3 text-slate-350" />
          <span className="hover:text-slate-700 cursor-pointer" onClick={() => onNavigate({ type: "story-list" })}>Truyện dịch</span>
          <ChevronRight className="h-3 w-3 text-slate-350" />
          <span className="text-slate-700 font-semibold truncate">{story.title}</span>
        </div>

        {/* Story details block: Custom bento cards */}
        <div className="bg-white rounded-3xl border border-slate-100/80 shadow-sm p-5 sm:p-8 grid grid-cols-1 md:grid-cols-12 gap-8 mb-8">
          
          {/* Left panel: Comic poster */}
          <div className="col-span-1 md:col-span-4 lg:col-span-3 flex flex-col items-center">
            <div className="relative aspect-[3/4] w-full max-w-[260px] rounded-2xl overflow-hidden shadow-xl border border-slate-100 bg-slate-100">
              <img
                src={story.coverUrl}
                alt={story.title}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
            </div>

            {/* Quick stats on rating */}
            <div className="mt-4 flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-xl bg-amber-500/10 text-amber-600 font-black text-sm">
              <Star className="h-4 w-4 fill-amber-500 text-amber-500" />
              <span>{story.rating?.toFixed(1) || "4.8"} / 5.0</span>
            </div>
          </div>

          {/* Right panel: Meta descriptor details */}
          <div className="col-span-1 md:col-span-8 lg:col-span-9 space-y-6">
            <div className="space-y-2">
              {/* Category tags */}
              <div className="flex flex-wrap gap-1.5">
                {story.categories.map((c) => (
                  <span
                    key={c.id}
                    onClick={() => onNavigate({ type: "story-list", categorySlug: c.slug })}
                    className="text-[10px] font-bold text-[#7C3AED] bg-[#7C3AED]/10 hover:bg-[#7C3AED]/15 px-2.5 py-1 rounded-full uppercase tracking-wider cursor-pointer transition-colors"
                  >
                    {c.name}
                  </span>
                ))}
              </div>

              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 leading-tight">
                {story.title}
              </h1>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 py-3 text-xs bg-slate-50 rounded-2xl p-4 border border-[#E2E8F0]">
                <div>
                  <p className="text-slate-400 font-semibold select-none">Tác giả</p>
                  <p className="text-slate-800 font-bold mt-0.5">{story.author}</p>
                </div>
                <div>
                  <p className="text-slate-400 font-semibold select-none">Trạng thái</p>
                  <p className="text-[#7C3AED] font-bold uppercase tracking-wide mt-0.5">
                    {story.status === "completed" ? "Hoàn thành" : "Đang tiến hành"}
                  </p>
                </div>
                <div>
                  <p className="text-slate-400 font-medium select-none">Lượt xem</p>
                  <p className="text-slate-800 font-bold mt-0.5 flex items-center gap-1">
                    <Eye className="h-3.5 w-3.5 text-slate-450" />
                    {story.views.toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-slate-400 font-medium select-none">Cập nhật lần cuối</p>
                  <p className="text-slate-850 font-bold mt-0.5 flex items-center gap-1">
                    <Calendar className="h-3.5 w-3.5 text-slate-450" />
                    {new Date(story.updatedAt).toLocaleDateString("vi-VN")}
                  </p>
                </div>
              </div>
            </div>

            {/* Description details */}
            <div className="space-y-2.5">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Tóm tắt nội dung</h3>
              <p className="text-sm font-medium leading-relaxed text-slate-600 whitespace-pre-line">
                {story.description}
              </p>
            </div>

            {/* Premium Action Buttons panel */}
            <div className="pt-3 flex flex-wrap gap-3">
              {chapters.length > 0 ? (
                <>
                  <button
                    onClick={handleContinueReading}
                    disabled={isContinueLoading}
                    className="h-12 px-6 bg-[#7C3AED] hover:bg-[#6D28D9] text-white rounded-xl text-xs font-bold transition-all shadow-md flex items-center gap-1.5"
                  >
                    <BookOpen className="h-4 w-4" />
                    {isContinueLoading
                      ? "Đang mở..."
                      : continueChapterNumber ? `Đọc tiếp C. ${continueChapterNumber}` : "Đọc Từ Điểm Khởi Đầu"}
                  </button>

                  <button
                    onClick={() => onNavigate({ type: "reader", storySlug: story.slug, chapterNumber: latestChapter.chapterNumber })}
                    className="h-12 px-5 bg-[#7C3AED]/10 hover:bg-[#7C3AED]/15 text-[#7C3AED] rounded-xl text-xs font-bold transition-all flex items-center gap-1.5"
                  >
                    Mới nhất C. {latestChapter.chapterNumber}
                  </button>
                </>
              ) : (
                <button
                  disabled
                  className="h-12 px-6 bg-slate-100 text-slate-400 rounded-xl text-xs font-bold cursor-not-allowed"
                >
                  Tác phẩm đang chuẩn bị đăng chương
                </button>
              )}

              {/* Follow tracking visual toggler */}
              <button
                onClick={handleToggleFavorite}
                className={`h-12 px-5 rounded-xl text-xs font-bold border transition-all flex items-center gap-1.5 ${
                  isFavorite
                    ? "bg-rose-50 border-rose-100 text-rose-600 hover:bg-rose-100"
                    : "bg-white hover:bg-slate-50 border-slate-200 text-slate-600"
                }`}
              >
                <Heart className={`h-4 w-4 ${isFavorite ? "fill-rose-500 text-rose-500" : ""}`} />
                {isFavorite ? "Đã thích" : "Thích truyện"}
              </button>
            </div>

          </div>
        </div>

        {/* Bottom Panel: Chapters grid list & User interaction comments */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
          
          {/* Chapter listings card */}
          <div className="col-span-1 md:col-span-8 bg-white border border-[#E2E8F0] rounded-3xl p-6 shadow-sm">
            <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-3 mb-4">
              <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
                <span className="w-1.5 h-5 bg-[#7C3AED] rounded-full inline-block"></span>
                Danh Sách Chương ({chapters.length})
              </h2>
              
              {/* Order togglers */}
              <button
                onClick={() => setAscendingChapters(!ascendingChapters)}
                className="text-xs font-semibold text-slate-500 hover:text-[#7C3AED] p-1.5 rounded bg-slate-50 border border-[#E2E8F0] hover:border-[#7C3AED]/30 flex items-center gap-1 transition-colors"
                title={ascendingChapters ? "Sắp xếp cũ nhất trước" : "Sắp xếp mới nhất trước"}
              >
                {ascendingChapters ? (
                  <>
                    <SortAsc className="h-3.5 w-3.5 text-[#7C3AED]" />
                    <span>Thứ tự xuôi</span>
                  </>
                ) : (
                  <>
                    <SortDesc className="h-3.5 w-3.5 text-[#7C3AED]" />
                    <span>Thứ tự ngược</span>
                  </>
                )}
              </button>
            </div>

            {orderedChapters.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-[480px] overflow-y-auto pr-1">
                {orderedChapters.map((chap) => (
                  <div
                    key={chap.id}
                    onClick={() => onNavigate({ type: "reader", storySlug: story.slug, chapterNumber: chap.chapterNumber })}
                    className="group cursor-pointer p-3 rounded-2xl bg-white hover:bg-[#7C3AED]/5 border border-[#E2E8F0] hover:border-[#7C3AED]/30 flex items-center justify-between transition-colors shadow-[0_1px_4px_rgba(0,0,0,0.01)]"
                  >
                    <div>
                      <h4 className="text-xs font-bold text-slate-800 group-hover:text-[#7C3AED] transition-colors">
                        Chương {chap.chapterNumber}
                      </h4>
                    </div>
                    
                    <span className="text-[10px] text-slate-400 font-medium flex items-center gap-1">
                      <Eye className="h-3 w-3" />
                      {chap.view.toLocaleString("vi-VN")}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-10 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                <Sparkles className="h-8 w-8 text-slate-300 mx-auto" />
                <p className="text-xs font-bold text-slate-550 mt-2">Chưa có chương nào đăng tải</p>
                <p className="text-[11px] text-slate-400 mt-0.5">Nhóm dịch sẽ sớm đăng cập nhật mới.</p>
              </div>
            )}
          </div>

          {/* Real-time styled user comments board */}
          <div className="col-span-1 md:col-span-4 bg-white border border-[#E2E8F0] rounded-3xl p-6 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-1.5 border-b border-[#E2E8F0] pb-3">
              <MessageSquare className="h-4 w-4 text-[#7C3AED]" />
              Thảo Luận ({commentPage?.totalCount ?? comments.length})
            </h3>

            <form onSubmit={handleAddComment} className="space-y-2">
              <textarea
                placeholder="Nêu cảm nhận của bạn về tập truyện..."
                rows={3}
                value={userComment}
                maxLength={1000}
                onChange={(e) => setUserComment(e.target.value)}
                className="w-full text-xs p-3 rounded-2xl border border-[#E2E8F0] focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/30 focus:border-[#7C3AED] bg-slate-50 placeholder-slate-400 font-semibold"
              />
              <button
                type="submit"
                disabled={isCommentSubmitting}
                className="w-full py-2 bg-[#7C3AED] hover:bg-[#6D28D9] text-white rounded-xl text-[11px] font-bold transition-all flex items-center justify-center gap-1.5 disabled:opacity-60"
              >
                <Send className="h-3.5 w-3.5" />
                {isCommentSubmitting ? "Đang gửi..." : "Gửi bình luận"}
              </button>
            </form>

            <div className="space-y-3.5 max-h-[300px] overflow-y-auto pr-1 pt-1">
              {commentError && (
                <div className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-[11px] font-semibold text-amber-700">
                  {commentError}
                </div>
              )}

              {isCommentsLoading && comments.length === 0 ? (
                <div className="py-8 text-center text-xs font-semibold text-slate-400">Đang tải bình luận...</div>
              ) : comments.length > 0 ? (
                comments.map((comment) => renderComment(comment))
              ) : (
                <div className="py-8 text-center">
                  <MessageSquare className="h-8 w-8 text-slate-300 mx-auto" />
                  <p className="mt-2 text-xs font-bold text-slate-600">Chưa có bình luận nào</p>
                  <p className="mt-0.5 text-[11px] text-slate-400">Hãy là người đầu tiên chia sẻ cảm nhận.</p>
                </div>
              )}
            </div>

            {commentPage?.hasNextPage && (
              <button
                type="button"
                onClick={handleLoadMoreComments}
                disabled={isCommentsLoading}
                className="w-full h-9 rounded-xl border border-[#E2E8F0] bg-slate-50 text-[11px] font-bold text-[#7C3AED] hover:bg-[#7C3AED]/10 disabled:opacity-60"
              >
                {isCommentsLoading ? "Đang tải..." : "Tải thêm bình luận"}
              </button>
            )}
          </div>

        </div>

      </main>
    </div>
  );
}
