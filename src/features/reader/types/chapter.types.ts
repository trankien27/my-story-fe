export interface ChapterPage {
  index: number;
  imageUrl: string;
  width: number;
  height: number;
  placeholderUrl?: string;
}

export interface ChapterDetail {
  id: string;
  storyId: string;
  title: string;
  storyTitle: string;
  chapterNumber: number;
  prevChapterId: string | null;
  nextChapterId: string | null;
  pages: ChapterPage[];
}

export interface ReaderHistoryEntry {
  storyId: string;
  chapterId: string;
  pageIndex: number;
  updatedAt: string;
}

export interface ChapterReaderState {
  chapter: ChapterDetail | null;
  isLoading: boolean;
  error: string | null;
  progress: number;
  currentPageIndex: number;
}
