export type StoryStatus = "ongoing" | "completed" | "paused";

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
}

export interface Chapter {
  id: string;
  storyId: string;
  chapterNumber: number;
  title: string;
  slug: string;
  images: string[];
  createdAt: string;
  updatedAt: string;
}

export interface StoryChapter {
  id: string;
  chapterNumber: number;
  view: number;
}

export interface Story {
  id: string;
  title: string;
  slug: string;
  coverUrl: string;
  description: string;
  author: string;
  status: StoryStatus;
  views: number;
  rating?: number;
  likes?: number;
  chapterCount?: number;
  chapters?: StoryChapter[];
  categories: Category[];
  createdAt: string;
  updatedAt: string;
}

export interface ReadingHistory {
  storyId: string;
  chapterNumber: number;
  readAt: string;
}

export interface User {
  id: string;
  email: string;
  fullName: string;
  role: "admin" | "user";
  avatar?: string;
  joinedAt: string;
}

export type ActivePage =
  | { type: "home" }
  | { type: "story-list"; categorySlug?: string; statusFilter?: string; search?: string }
  | { type: "story-detail"; slug: string }
  | { type: "reader"; storySlug: string; chapterNumber: number }
  | { type: "login" }
  | { type: "register" }
  | { type: "profile" }
  | { type: "history" }
  | { type: "favorites" }
  | { type: "admin-dashboard" }
  | { type: "admin-stories" }
  | { type: "admin-chapters" }
  | { type: "admin-categories" }
  | { type: "admin-users" };
