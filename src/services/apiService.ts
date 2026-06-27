import { Category, Chapter, Story, StoryChapter, User } from "../types";

interface PagedResponse<T> {
  items: T[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface StoryPage {
  items: Story[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

interface ApiCategory {
  id: number;
  name: string;
}

interface ApiStory {
  id: number;
  name: string;
  thumbnailUrl: string;
  author?: string | null;
  status?: number | string | null;
  statusName?: string | null;
  totalViews?: number;
  chapterCount?: number;
  isFav?: boolean;
  createdAt?: string;
  updatedAt?: string;
  categories: ApiCategory[];
  chapters?: ApiStoryChapter[];
}

interface ApiStoryChapter {
  id: number;
  chapterNumber: number;
  view: number;
}

interface ApiChapter {
  id: number;
  storyId: number;
  chapterNumber: number;
  view: number;
  imageUrls: string[];
}

interface UserLibraryStoryResponse {
  storyId: number;
  name: string;
  thumbnailUrl: string;
  author?: string | null;
  status?: number | string | null;
  statusName?: string | null;
  chapterCount?: number;
  isFav?: boolean;
  categories: ApiCategory[];
  createdAt?: string;
  updatedAt?: string;
}

export interface ReadingProgress {
  storyId: string;
  storyName: string;
  thumbnailUrl: string;
  status: Story["status"];
  statusName: string;
  chapterCount: number;
  chapterId: string;
  chapterNumber: number;
  categories: Category[];
  updatedAt: string;
}

export interface Comment {
  id: string;
  storyId: string;
  userId: string;
  userFullName: string;
  content: string;
  parentId: string | null;
  createdAt: string;
  updatedAt: string | null;
  replies: Comment[];
}

export interface CommentPage {
  items: Comment[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

interface ReadingProgressResponse {
  storyId: number;
  storyName: string;
  thumbnailUrl: string;
  status: number | string;
  statusName: string;
  chapterCount: number;
  chapterId: number;
  chapterNumber: number;
  categories: ApiCategory[];
  updatedAt: string;
}

interface CommentResponse {
  id: number;
  storyId: number;
  userId: string;
  userFullName: string;
  content: string;
  parentId: number | null;
  createdAt: string;
  updatedAt: string | null;
  replies: CommentResponse[];
}

interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  email: string;
  fullName: string;
  roles: string[];
}

export interface StoryMutation {
  name: string;
  thumbnailUrl: string;
  categoryIds: number[];
}

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || "http://localhost:5129/api").replace(/\/$/, "");
const ACCESS_TOKEN_KEY = "vntruyen_access_token";
const REFRESH_TOKEN_KEY = "vntruyen_refresh_token";

const slugify = (value: string) =>
  value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/đ/g, "d")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

const mapCategory = (category: ApiCategory): Category => ({
  id: String(category.id),
  name: category.name,
  slug: slugify(category.name),
});

const mapStoryChapter = (chapter: ApiStoryChapter): StoryChapter => ({
  id: String(chapter.id),
  chapterNumber: chapter.chapterNumber,
  view: chapter.view,
});

const mapStatus = (status?: number | string | null): Story["status"] => {
  if (typeof status === "number") {
    if (status === 2) return "completed";
    if (status === 3) return "paused";
    return "ongoing";
  }
  const normalized = String(status || "").toLowerCase();
  if (normalized.includes("complete") || normalized.includes("hoan")) return "completed";
  if (normalized.includes("pause") || normalized.includes("tam")) return "paused";
  return "ongoing";
};

const mapStory = (story: ApiStory, previous?: Story): Story => ({
  id: String(story.id),
  title: story.name,
  slug: previous?.slug || `${slugify(story.name)}-${story.id}`,
  coverUrl: story.thumbnailUrl,
  description: previous?.description || "Thông tin giới thiệu đang được cập nhật.",
  author: story.author || previous?.author || "Đang cập nhật",
  status: mapStatus(story.status ?? previous?.status),
  views: story.totalViews ?? previous?.views ?? 0,
  rating: previous?.rating,
  likes: previous?.likes,
  isFav: story.isFav ?? previous?.isFav,
  chapterCount: story.chapterCount ?? previous?.chapterCount,
  chapters: story.chapters?.map(mapStoryChapter) ?? previous?.chapters,
  categories: story.categories.map(mapCategory),
  createdAt: story.createdAt || previous?.createdAt || new Date().toISOString(),
  updatedAt: story.updatedAt || new Date().toISOString(),
});

const mapUserLibraryStory = (story: UserLibraryStoryResponse, previous?: Story): Story => ({
  id: String(story.storyId),
  title: story.name,
  slug: previous?.slug || `${slugify(story.name)}-${story.storyId}`,
  coverUrl: story.thumbnailUrl,
  description: previous?.description || "Thông tin giới thiệu đang được cập nhật.",
  author: story.author || previous?.author || "Đang cập nhật",
  status: mapStatus(story.status),
  views: previous?.views ?? 0,
  rating: previous?.rating,
  likes: previous?.likes,
  isFav: story.isFav ?? true,
  chapterCount: story.chapterCount,
  chapters: previous?.chapters,
  categories: story.categories.map(mapCategory),
  createdAt: story.createdAt || previous?.createdAt || new Date().toISOString(),
  updatedAt: story.updatedAt || previous?.updatedAt || new Date().toISOString(),
});

const mapReadingProgress = (progress: ReadingProgressResponse): ReadingProgress => ({
  storyId: String(progress.storyId),
  storyName: progress.storyName,
  thumbnailUrl: progress.thumbnailUrl,
  status: mapStatus(progress.status),
  statusName: progress.statusName,
  chapterCount: progress.chapterCount,
  chapterId: String(progress.chapterId),
  chapterNumber: progress.chapterNumber,
  categories: progress.categories.map(mapCategory),
  updatedAt: progress.updatedAt,
});

const mapComment = (comment: CommentResponse): Comment => ({
  id: String(comment.id),
  storyId: String(comment.storyId),
  userId: comment.userId,
  userFullName: comment.userFullName,
  content: comment.content,
  parentId: comment.parentId == null ? null : String(comment.parentId),
  createdAt: comment.createdAt,
  updatedAt: comment.updatedAt,
  replies: comment.replies?.map(mapComment) ?? [],
});

const mapChapter = (chapter: ApiChapter): Chapter => ({
  id: String(chapter.id),
  storyId: String(chapter.storyId),
  chapterNumber: chapter.chapterNumber,
  title: `Chương ${chapter.chapterNumber}`,
  slug: `chuong-${chapter.chapterNumber}`,
  images: chapter.imageUrls,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
});

const getMessage = (payload: unknown, fallback: string) => {
  if (payload && typeof payload === "object" && "message" in payload) {
    return String((payload as { message: unknown }).message);
  }
  return fallback;
};

const saveAuth = (auth: AuthResponse) => {
  localStorage.setItem(ACCESS_TOKEN_KEY, auth.accessToken);
  localStorage.setItem(REFRESH_TOKEN_KEY, auth.refreshToken);
};

const clearAuth = () => {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
};

const toUser = (auth: AuthResponse): User => ({
  id: auth.email,
  email: auth.email,
  fullName: auth.fullName,
  role: auth.roles.some((role) => role.toLowerCase() === "admin") ? "admin" : "user",
  joinedAt: new Date().toISOString(),
});

let refreshPromise: Promise<boolean> | null = null;

async function refreshAccessToken(): Promise<boolean> {
  const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);
  if (!refreshToken) return false;

  if (!refreshPromise) {
    refreshPromise = fetch(`${API_BASE_URL}/auth/refresh-token`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken }),
    })
      .then(async (response) => {
        if (!response.ok) return false;
        saveAuth((await response.json()) as AuthResponse);
        return true;
      })
      .catch(() => false)
      .finally(() => {
        refreshPromise = null;
      });
  }

  return refreshPromise;
}

export async function apiRequest<T>(path: string, init: RequestInit = {}, retry = true): Promise<T> {
  const accessToken = localStorage.getItem(ACCESS_TOKEN_KEY);
  const headers = new Headers(init.headers);
  if (init.body && !headers.has("Content-Type")) headers.set("Content-Type", "application/json");
  if (accessToken) headers.set("Authorization", `Bearer ${accessToken}`);

  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, { ...init, headers });
  } catch (error: unknown) {
    if (error instanceof DOMException && error.name === "AbortError") throw error;
    throw new Error("Không thể kết nối máy chủ. Vui lòng thử lại sau.");
  }

  if (response.status === 401 && retry && !path.startsWith("/auth/")) {
    if (await refreshAccessToken()) return apiRequest<T>(path, init, false);
    clearAuth();
  }

  const payload = response.status === 204 ? undefined : await response.json().catch(() => undefined);
  if (!response.ok) throw new Error(getMessage(payload, `API trả về lỗi ${response.status}.`));
  return payload as T;
}

async function getAllPages<T>(path: string): Promise<T[]> {
  const first = await apiRequest<PagedResponse<T>>(`${path}?page=1&pageSize=100`);
  const items = [...first.items];
  for (let page = 2; page <= first.totalPages; page += 1) {
    const result = await apiRequest<PagedResponse<T>>(`${path}?page=${page}&pageSize=100`);
    items.push(...result.items);
  }
  return items;
}

export const apiService = {
  baseUrl: API_BASE_URL,
  hasSession(): boolean {
    return Boolean(localStorage.getItem(ACCESS_TOKEN_KEY) || localStorage.getItem(REFRESH_TOKEN_KEY));
  },

  async login(email: string, password: string): Promise<User> {
    const auth = await apiRequest<AuthResponse>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
    saveAuth(auth);
    return toUser(auth);
  },

  async register(fullName: string, email: string, password: string, confirmPassword: string): Promise<User> {
    const auth = await apiRequest<AuthResponse>("/auth/register", {
      method: "POST",
      body: JSON.stringify({ fullName, email, password, confirmPassword }),
    });
    saveAuth(auth);
    return toUser(auth);
  },

  logout(): void {
    clearAuth();
  },

  async loadCatalog(previousStories: Story[] = []): Promise<{ categories: Category[]; stories: Story[] }> {
    const [categoryDtos, storyPage, ranking] = await Promise.all([
      getAllPages<ApiCategory>("/category"),
      apiRequest<PagedResponse<ApiStory>>("/story?page=1&pageSize=30"),
      apiRequest<ApiStory[]>("/story/ranking?period=AllTime&top=100").catch(() => []),
    ]);
    const views = new Map<number, number>(
      ranking.map((story): [number, number] => [story.id, story.totalViews ?? 0]),
    );
    return {
      categories: categoryDtos.map(mapCategory),
      stories: storyPage.items.map((story) =>
        mapStory({ ...story, totalViews: views.get(story.id) }, previousStories.find((item) => item.id === String(story.id))),
      ),
    };
  },

  async getStories(page = 1, pageSize = 30, previousStories: Story[] = []): Promise<StoryPage> {
    const result = await apiRequest<PagedResponse<ApiStory>>(`/story?page=${page}&pageSize=${pageSize}`);
    return {
      ...result,
      items: result.items.map((story) => mapStory(story, previousStories.find((item) => item.id === String(story.id)))),
    };
  },

  async searchStories(
    keyword: string,
    page = 1,
    pageSize = 30,
    previousStories: Story[] = [],
  ): Promise<StoryPage> {
    const params = new URLSearchParams({
      keyword: keyword.trim(),
      page: String(page),
      pageSize: String(pageSize),
    });
    const result = await apiRequest<PagedResponse<ApiStory>>(`/story/search?${params.toString()}`);
    return {
      ...result,
      items: result.items.map((story) => mapStory(story, previousStories.find((item) => item.id === String(story.id)))),
    };
  },

  async getCategory(id: string): Promise<Category> {
    return mapCategory(await apiRequest<ApiCategory>(`/category/${id}`));
  },

  async getStory(id: string, previous?: Story): Promise<Story> {
    return mapStory(await apiRequest<ApiStory>(`/story/${id}`), previous);
  },

  async getStoriesByCategory(categoryId: string, previousStories: Story[] = []): Promise<Story[]> {
    const stories = await getAllPages<ApiStory>(`/story/category/${categoryId}`);
    return stories.map((story) => mapStory(story, previousStories.find((item) => item.id === String(story.id))));
  },

  async getStoriesByCategoryPage(
    categoryId: string,
    page = 1,
    pageSize = 30,
    previousStories: Story[] = [],
  ): Promise<StoryPage> {
    const result = await apiRequest<PagedResponse<ApiStory>>(
      `/story/category/${categoryId}?page=${page}&pageSize=${pageSize}`,
    );
    return {
      ...result,
      items: result.items.map((story) => mapStory(story, previousStories.find((item) => item.id === String(story.id)))),
    };
  },

  async getRanking(period: "Daily" | "Monthly" | "AllTime", previousStories: Story[] = [], top = 10): Promise<Story[]> {
    const stories = await apiRequest<ApiStory[]>(`/story/ranking?period=${period}&top=${top}`);
    return stories.map((story) => mapStory(story, previousStories.find((item) => item.id === String(story.id))));
  },

  async getChapter(storyId: string, chapterNumber: number): Promise<Chapter> {
    return mapChapter(await apiRequest<ApiChapter>(`/chapter/story/${storyId}/chapter/${chapterNumber}`));
  },

  async getChapterById(chapterId: string): Promise<Chapter> {
    return mapChapter(await apiRequest<ApiChapter>(`/chapter/${chapterId}`));
  },

  addChapterView(chapterId: string): Promise<void> {
    return apiRequest<void>(`/chapter/${chapterId}/view`, { method: "POST" });
  },

  async getFavorites(previousStories: Story[] = []): Promise<Story[]> {
    const stories = await apiRequest<UserLibraryStoryResponse[]>("/userlibrary/favorites");
    return stories.map((story) => mapUserLibraryStory(story, previousStories.find((item) => item.id === String(story.storyId))));
  },

  addFavorite(storyId: string): Promise<void> {
    return apiRequest<void>(`/userlibrary/favorites/${storyId}`, { method: "POST" });
  },

  removeFavorite(storyId: string): Promise<void> {
    return apiRequest<void>(`/userlibrary/favorites/${storyId}`, { method: "DELETE" });
  },

  async getReadingProgress(): Promise<ReadingProgress[]> {
    const progress = await apiRequest<ReadingProgressResponse[]>("/userlibrary/progress");
    return progress.map(mapReadingProgress);
  },

  async getStoryReadingProgress(storyId: string): Promise<ReadingProgress | null> {
    const progress = await apiRequest<ReadingProgressResponse | null>(`/userlibrary/progress/${storyId}`);
    return progress ? mapReadingProgress(progress) : null;
  },

  saveReadingProgress(storyId: string, chapterId: string): Promise<void> {
    return apiRequest<void>(`/userlibrary/progress/${storyId}/chapter/${chapterId}`, { method: "POST" });
  },

  async getComments(storyId: string, page = 1, pageSize = 10): Promise<CommentPage> {
    const result = await apiRequest<PagedResponse<CommentResponse>>(
      `/story/${storyId}/comments?page=${page}&pageSize=${pageSize}`,
    );
    return {
      ...result,
      items: result.items.map(mapComment),
    };
  },

  addComment(storyId: string, content: string, parentId: string | null = null): Promise<Comment> {
    return apiRequest<CommentResponse>(`/story/${storyId}/comments`, {
      method: "POST",
      body: JSON.stringify({ content, parentId: parentId == null ? null : Number(parentId) }),
    }).then(mapComment);
  },

  updateComment(storyId: string, commentId: string, content: string): Promise<Comment> {
    return apiRequest<CommentResponse>(`/story/${storyId}/comments/${commentId}`, {
      method: "PUT",
      body: JSON.stringify({ content }),
    }).then(mapComment);
  },

  deleteComment(storyId: string, commentId: string): Promise<void> {
    return apiRequest<void>(`/story/${storyId}/comments/${commentId}`, { method: "DELETE" });
  },

  async createCategory(name: string): Promise<Category> {
    return mapCategory(await apiRequest<ApiCategory>("/category", { method: "POST", body: JSON.stringify({ name }) }));
  },
  async updateCategory(id: string, name: string): Promise<Category> {
    return mapCategory(await apiRequest<ApiCategory>(`/category/${id}`, { method: "PUT", body: JSON.stringify({ name }) }));
  },
  deleteCategory(id: string): Promise<void> {
    return apiRequest<void>(`/category/${id}`, { method: "DELETE" });
  },

  async createStory(data: StoryMutation): Promise<Story> {
    return mapStory(await apiRequest<ApiStory>("/story", { method: "POST", body: JSON.stringify(data) }));
  },
  async updateStory(id: string, data: StoryMutation, previous?: Story): Promise<Story> {
    return mapStory(await apiRequest<ApiStory>(`/story/${id}`, { method: "PUT", body: JSON.stringify(data) }), previous);
  },
  deleteStory(id: string): Promise<void> {
    return apiRequest<void>(`/story/${id}`, { method: "DELETE" });
  },
  async loginWithGoogle(idToken: string): Promise<User> {
  const auth = await apiRequest<AuthResponse>("/auth/google", {
    method: "POST",
    body: JSON.stringify({ idToken }),
  });
  saveAuth(auth);
  return toUser(auth);
},
};
