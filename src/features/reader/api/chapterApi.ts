import { apiRequest } from "../../../services/apiService";
import { ChapterDetail, ChapterPage } from "../types/chapter.types";

interface ChapterPageResponse {
  index: number;
  imageUrl: string;
  width: number;
  height: number;
  placeholderUrl?: string | null;
}

interface ChapterDetailResponse {
  id: string | number;
  storyId?: string | number;
  title?: string;
  storyTitle?: string;
  chapterNumber: number;
  prevChapterId?: string | number | null;
  nextChapterId?: string | number | null;
  pages?: ChapterPageResponse[];
  imageUrls?: string[];
}

interface ChapterRequestContext {
  storyId?: string;
  storyTitle?: string;
}

const normalizePage = (page: ChapterPageResponse): ChapterPage => ({
  index: page.index,
  imageUrl: page.imageUrl,
  width: page.width > 0 ? page.width : 900,
  height: page.height > 0 ? page.height : 1273,
  placeholderUrl: page.placeholderUrl || undefined,
});

const normalizeChapter = (
  response: ChapterDetailResponse,
  context: ChapterRequestContext = {},
): ChapterDetail => {
  const pages = response.pages?.length
    ? [...response.pages].sort((a, b) => a.index - b.index).map(normalizePage)
    : (response.imageUrls || []).map((imageUrl, index) => ({
        index,
        imageUrl,
        // Compatibility for the old API. The new pages[] contract supplies exact values.
        width: 900,
        height: 1273,
      }));

  return {
    id: String(response.id),
    storyId: String(response.storyId ?? context.storyId ?? ""),
    title: response.title || `Chương ${response.chapterNumber}`,
    storyTitle: response.storyTitle || context.storyTitle || "VNTruyen",
    chapterNumber: response.chapterNumber,
    prevChapterId: response.prevChapterId == null ? null : String(response.prevChapterId),
    nextChapterId: response.nextChapterId == null ? null : String(response.nextChapterId),
    pages,
  };
};

export const chapterApi = {
  async getByStoryAndNumber(
    storyId: string,
    chapterNumber: number,
    storyTitle?: string,
    signal?: AbortSignal,
  ): Promise<ChapterDetail> {
    const response = await apiRequest<ChapterDetailResponse>(
      `/chapter/story/${storyId}/chapter/${chapterNumber}`,
      { signal },
    );
    return normalizeChapter(response, { storyId, storyTitle });
  },

  async getById(chapterId: string, signal?: AbortSignal): Promise<ChapterDetail> {
    const response = await apiRequest<ChapterDetailResponse>(`/chapter/${chapterId}`, { signal });
    return normalizeChapter(response);
  },
};
