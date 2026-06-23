import { Story, Chapter, Category, User, ReadingHistory } from "../types";

// Initial Categories
const INITIAL_CATEGORIES: Category[] = [
  { id: "cat-1", name: "Hành Động", slug: "hanh-dong", description: "Truyện có nội dung đánh đấm, kịch tính, thế giới giả tưởng anh hùng." },
  { id: "cat-2", name: "Phiêu Lưu", slug: "phieu-luu", description: "Các cuộc hành trình khám phá vùng đất mới, tìm kiếm bảo vật phi thường." },
  { id: "cat-3", name: "Đời Thường", slug: "doi-thuong", description: "Lối sống hằng ngày nhẹ nhàng, câu chuyện hài hước, ấm lòng cuộc sống." },
  { id: "cat-4", name: "Tình Cảm", slug: "tinh-cam", description: "Những câu chuyện lãng mạn lôi cuốn, tình yêu đôi lứa sâu sắc." },
  { id: "cat-5", name: "Trinh Thám", slug: "trinh-tham", description: "Nhiều tình tiết suy luận, phá án, giải đáp những ẩn số kỳ bí bí ẩn." },
  { id: "cat-6", name: "Hài Hước", slug: "hai-huoc", description: "Những câu chuyện dí dỏm, mang lại tiếng cười sảng khoái và thư giãn." },
  { id: "cat-7", name: "Kinh Dị", slug: "kinh-di", description: "Yếu tố giật gân, bí ẩn rùng rợn, khám phá bí mật tâm linh đáng sợ." },
  { id: "cat-8", name: "Giả Tưởng", slug: "gia-tuong", description: "Thế giới giả hình ảnh hoành tráng, phép thuật diệu kỳ, sinh vật huyền thoại." },
  { id: "cat-9", name: "Võ Thuật", slug: "vo-thuat", description: "Quyết đấu kinh điển, đỉnh cao võ học, khí phách anh hùng giang hồ." },
  { id: "cat-10", name: "Cổ Đại", slug: "co-dai", description: "Bối cảnh giang sơn xưa cũ, hoàng cung, quan trường và chiến trận cổ xưa." },
  { id: "cat-11", name: "Đô Thị", slug: "do-thi", description: "Cuộc sống hiện đại đầy cạm bẫy, hào nhoáng và sự vươn lên thành công." },
  { id: "cat-12", name: "Khoa Học", slug: "khoa-hoc", description: "Công nghệ tương lai, du hành vũ trụ và khoa học viễn tưởng đột phá." },
  { id: "cat-13", name: "Thể Thao", slug: "the-thao", description: "Sự nhiệt huyết, tinh thần đồng đội và nỗ lực chinh phục đỉnh vinh quang." },
  { id: "cat-14", name: "Kỳ Ảo", slug: "ky-ao", description: "Yếu tố kỳ ảo bí ẩn, thế giới tâm linh pháp thuật độc nhất vô nhị." },
  { id: "cat-15", name: "Trọng Sinh", slug: "trong-sinh", description: "Tái sinh làm lại cuộc đời, sửa chữa sai lầm quá khứ bảo vệ người thân." },
  { id: "cat-16", name: "Xuyên Không", slug: "xuyen-khong", description: "Du hành qua các chiều không gian, thời gian lịch sử khác nhau hoàn toàn." },
  { id: "cat-17", name: "Mạt Thế", slug: "mat-the", description: "Thế giới hậu tận thế, nỗ lực sinh tồn trước quái vật và dịch bệnh." },
  { id: "cat-18", name: "Trò Chơi", slug: "tro-choi", description: "Thế giới game ảo kịch tính, chinh phục các ải phó bản huyền thoại." },
  { id: "cat-19", name: "Ngôn Tình", slug: "ngon-tinh", description: "Tiểu thuyết lãng mạn lôi cuốn, ấm áp ngọt ngào, thăng trầm cảm xúc." },
  { id: "cat-20", name: "Kiếm Hiệp", slug: "kiem-hiep", description: "Ân oán giang hồ, bang phái, võ lâm quần kiêu tranh bá đầy khí thế." },
  { id: "cat-21", name: "Tiên Hiệp", slug: "tien-hiep", description: "Tu tiên đắc đạo, hành trình trường sinh bất tử, phi thăng vũ trụ." },
  { id: "cat-22", name: "Huyền Huyễn", slug: "huyen-huyen", description: "Thế giới tu luyện kỳ ảo hư thực kết hợp, năng lực dị biệt đặc sắc." },
  { id: "cat-23", name: "Sủng Ngọt", slug: "sung-ngot", description: "Tình yêu tuyệt đối ngọt ngào, cưng chiều lẫn nhau, không chút hiểu lầm." },
  { id: "cat-24", name: "Ngược Tâm", slug: "nguoc-tam", description: "Bi thương đau nhức, trắc trở dày vò để đi tới bến bờ hạnh phúc." },
  { id: "cat-25", name: "Tổng Tài", slug: "tong-tai", description: "Những câu chuyện về giới siêu giàu, tổng tài bá đạo ấm áp thâm sâu." },
  { id: "cat-26", name: "Học Đường", slug: "hoc-duong", description: "Kỷ niệm tuổi học trò rực rỡ, thầy cô, bạn bè và rung động đầu đời." },
  { id: "cat-27", name: "Độc Sủng", slug: "doc-sung", description: "Chỉ yêu duy nhất một người, độc sủng bá đạo suốt cuộc đời dài lâu." },
  { id: "cat-28", name: "Hệ Thống", slug: "he-thong", description: "Được hỗ trợ bởi hệ thông minh, nhận nhiệm vụ và thăng tiến lực chiến." },
  { id: "cat-29", name: "Cung Đấu", slug: "cung-dau", description: "Đấu trí hậu cung khốc liệt, thâm trầm kịch tính từng bước giành ngôi vị." },
  { id: "cat-30", name: "Linh Dị", slug: "linh-di", description: "Các câu chuyện ma mị bí ẩn, phong thủy, bói toán kỳ bí giật gân." }
];

// High-quality vertical manga/webtoon style artwork links
const PAGE_ARTWORKS = [
  "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?q=80&w=700&auto=format&fit=crop", // anime sky/city
  "https://images.unsplash.com/photo-1578632767115-351597cf2477?q=80&w=700&auto=format&fit=crop", // anime character girl
  "https://images.unsplash.com/photo-1580477667995-2b94f01c9516?q=80&w=700&auto=format&fit=crop", // retro desk/manga drawing
  "https://images.unsplash.com/photo-1614850523459-c2f4c699c52e?q=80&w=700&auto=format&fit=crop", // colorful abstract cosmic
  "https://images.unsplash.com/photo-1541701494587-cb58502866ab?q=80&w=700&auto=format&fit=crop", // fluid neon background
  "https://images.unsplash.com/photo-1563089145-599997674d42?q=80&w=700&auto=format&fit=crop"  // aesthetic synthwave neon
];

// Initial Stories
const INITIAL_STORIES: Story[] = [
  {
    id: "story-1",
    title: "Hành Trình Vương Giả",
    slug: "hanh-trinh-vuong-gia",
    coverUrl: "https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?q=80&w=600&auto=format&fit=crop",
    description: "Câu chuyện kể về cuộc hành trình đầy gian khổ của Lâm Phong, một thiếu niên sinh ra trong gia tộc nghèo khó nhưng sở hữu huyết mạch Đế Vương cổ đại thức tỉnh. Cùng với thanh bảo kiếm rỉ sét nhặt được trong rừng sâu, cậu bước lên con đường chinh phục vương quyền tối thượng, đánh bại các thế lực hắc ám đang lăm le thôn tính đại lục.",
    author: "Nguyễn Long Sơn",
    status: "ongoing",
    views: 12450,
    rating: 4.8,
    likes: 852,
    categories: [INITIAL_CATEGORIES[0], INITIAL_CATEGORIES[1]],
    createdAt: "2026-01-10T08:00:00Z",
    updatedAt: "2026-06-20T15:30:00Z"
  },
  {
    id: "story-2",
    title: "Lớp Học Ma Thuật Huyền Bí",
    slug: "lop-hoc-ma-thuat-huyen-bi",
    coverUrl: "https://images.unsplash.com/photo-1534447677768-be436bb09401?q=80&w=600&auto=format&fit=crop",
    description: "Học viện phép thuật Alistaria là nơi tụ hội của những thiên tài ma pháp xuất chúng nhất đại lục. Thế nhưng, một học sinh 'phi ma pháp' như Vy lại bất ngờ nhận được thư mời nhập học. Với khả năng vô hiệu hóa mọi bùa chú cùng trí thông minh tuyệt đỉnh, cô đã làm lay chuyển cả những học giả cổ hũ nhất của thế giới ma pháp.",
    author: "Phan Minh Tuấn",
    status: "ongoing",
    views: 8940,
    rating: 4.6,
    likes: 620,
    categories: [INITIAL_CATEGORIES[1], INITIAL_CATEGORIES[4]],
    createdAt: "2026-02-15T09:00:00Z",
    updatedAt: "2026-06-22T10:00:00Z"
  },
  {
    id: "story-3",
    title: "Ấm Áp Sài Gòn",
    slug: "am-ap-sai-gon",
    coverUrl: "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?q=80&w=600&auto=format&fit=crop",
    description: "Một câu chuyện đô thị nhẹ nhàng, xoay quanh chiếc tiệm cà phê nhỏ nép mình trong một con hẻm cổ kính của Sài Gòn sầm uất. Khánh - anh chủ quán trầm tính và Nhi - một cô bé họa sĩ tự do đầy mộng mơ. Mỗi chương sách là một nốt nhạc êm dịu gieo vào lòng người đọc cảm giác bình yên của sự đồng điệu tâm hồn giữa phố thị nhộn nhịp.",
    author: "Lê Hoàng Vy",
    status: "completed",
    views: 15200,
    rating: 4.9,
    likes: 1240,
    categories: [INITIAL_CATEGORIES[2], INITIAL_CATEGORIES[3]],
    createdAt: "2026-03-01T10:00:00Z",
    updatedAt: "2026-06-18T18:20:00Z"
  },
  {
    id: "story-4",
    title: "Huyền Thoại Đông Đô",
    slug: "huyen-thoai-dong-do",
    coverUrl: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=600&auto=format&fit=crop",
    description: "Lấy bối cảnh triều đại giả tưởng mang đậm bản sắc văn hóa Việt cổ. Câu chuyện kể về hành trình bảo vệ bờ cõi giang sơn của các dũng sĩ hào kiệt trước làn sóng xâm lấn từ dị tộc phương Bắc. Một bản hùng ca tráng lệ về lòng yêu nước, tình huynh đệ chí cốt và những chiêu thức võ công biến ảo khôn lường.",
    author: "Trần Thế Vinh",
    status: "completed",
    views: 23100,
    rating: 4.7,
    likes: 2450,
    categories: [INITIAL_CATEGORIES[0], INITIAL_CATEGORIES[1]],
    createdAt: "2026-01-01T07:15:00Z",
    updatedAt: "2026-05-30T12:00:00Z"
  },
  {
    id: "story-5",
    title: "Góc Khuất Đô Thị",
    slug: "goc-khuat-do-thi",
    coverUrl: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=600&auto=format&fit=crop",
    description: "Nhà ngoại cảm mù Kiến Văn nhận lời điều tra vụ mất tích bí ẩn của một nữ sinh trung học nổi tiếng. Lần theo những manh mối mờ nhạt từ các giấc mơ và luồng linh cảm kỳ lạ, anh bước vào thế giới ngầm hiểm độc của các băng nhóm tội phạm công nghệ cao và những kẻ nắm giữ quyền lực đen tối.",
    author: "Ngô Quốc Việt",
    status: "ongoing",
    views: 5700,
    rating: 4.5,
    likes: 380,
    categories: [INITIAL_CATEGORIES[4]],
    createdAt: "2026-04-10T11:00:00Z",
    updatedAt: "2026-06-21T09:15:00Z"
  }
];

// Initial Chapters
const INITIAL_CHAPTERS: Chapter[] = [
  // Story 1
  {
    id: "chap-1-1",
    storyId: "story-1",
    chapterNumber: 1,
    title: "Khởi Đầu Từ Bát Cơm Thừa",
    slug: "chuong-1",
    images: [PAGE_ARTWORKS[0], PAGE_ARTWORKS[1], PAGE_ARTWORKS[2], PAGE_ARTWORKS[3], PAGE_ARTWORKS[4]],
    createdAt: "2026-01-10T08:30:00Z",
    updatedAt: "2026-01-10T08:30:00Z"
  },
  {
    id: "chap-1-2",
    storyId: "story-1",
    chapterNumber: 2,
    title: "Thanh Kiếm Rỉ Sét",
    slug: "chuong-2",
    images: [PAGE_ARTWORKS[2], PAGE_ARTWORKS[3], PAGE_ARTWORKS[4], PAGE_ARTWORKS[0], PAGE_ARTWORKS[1]],
    createdAt: "2026-02-12T14:00:00Z",
    updatedAt: "2026-02-12T14:00:00Z"
  },
  {
    id: "chap-1-3",
    storyId: "story-1",
    chapterNumber: 3,
    title: "Kiếp Nạn Thức Tỉnh Huyết Mạch",
    slug: "chuong-3",
    images: [PAGE_ARTWORKS[4], PAGE_ARTWORKS[0], PAGE_ARTWORKS[5], PAGE_ARTWORKS[2], PAGE_ARTWORKS[3]],
    createdAt: "2026-06-20T15:30:00Z",
    updatedAt: "2026-06-20T15:30:00Z"
  },
  // Story 2
  {
    id: "chap-2-1",
    storyId: "story-2",
    chapterNumber: 1,
    title: "Lá Thư Không Màu",
    slug: "chuong-1",
    images: [PAGE_ARTWORKS[1], PAGE_ARTWORKS[2], PAGE_ARTWORKS[5], PAGE_ARTWORKS[0]],
    createdAt: "2026-02-15T09:30:00Z",
    updatedAt: "2026-02-15T09:30:00Z"
  },
  {
    id: "chap-2-2",
    storyId: "story-2",
    chapterNumber: 2,
    title: "Phòng Trà Ma Pháp Alistaria",
    slug: "chuong-2",
    images: [PAGE_ARTWORKS[3], PAGE_ARTWORKS[4], PAGE_ARTWORKS[1], PAGE_ARTWORKS[2]],
    createdAt: "2026-04-10T11:00:00Z",
    updatedAt: "2026-04-10T11:00:00Z"
  },
  {
    id: "chap-2-3",
    storyId: "story-2",
    chapterNumber: 3,
    title: "Cuộc Đối Đầu Phá Vỡ Quy Tắc",
    slug: "chuong-3",
    images: [PAGE_ARTWORKS[5], PAGE_ARTWORKS[0], PAGE_ARTWORKS[3], PAGE_ARTWORKS[4]],
    createdAt: "2026-06-22T10:00:00Z",
    updatedAt: "2026-06-22T10:00:00Z"
  },
  // Story 3
  {
    id: "chap-3-1",
    storyId: "story-3",
    chapterNumber: 1,
    title: "Cà Phê Sữa Đá Vỉa Hè",
    slug: "chuong-1",
    images: [PAGE_ARTWORKS[2], PAGE_ARTWORKS[4], PAGE_ARTWORKS[1], PAGE_ARTWORKS[0]],
    createdAt: "2026-03-01T10:30:00Z",
    updatedAt: "2026-03-01T10:30:00Z"
  },
  {
    id: "chap-3-2",
    storyId: "story-3",
    chapterNumber: 2,
    title: "Khúc Trịnh Ca Buổi Chiều Mưa",
    slug: "chuong-2",
    images: [PAGE_ARTWORKS[0], PAGE_ARTWORKS[1], PAGE_ARTWORKS[3], PAGE_ARTWORKS[5]],
    createdAt: "2026-05-15T15:00:00Z",
    updatedAt: "2026-05-15T15:00:00Z"
  },
  {
    id: "chap-3-3",
    storyId: "story-3",
    chapterNumber: 3,
    title: "Bức Tranh Chưa Đặt Tên (Chương cuối)",
    slug: "chuong-3",
    images: [PAGE_ARTWORKS[5], PAGE_ARTWORKS[2], PAGE_ARTWORKS[4], PAGE_ARTWORKS[0]],
    createdAt: "2026-06-18T18:20:00Z",
    updatedAt: "2026-06-18T18:20:00Z"
  },
  // Story 4
  {
    id: "chap-4-1",
    storyId: "story-4",
    chapterNumber: 1,
    title: "Hà Thành Khói Lửa",
    slug: "chuong-1",
    images: [PAGE_ARTWORKS[5], PAGE_ARTWORKS[4], PAGE_ARTWORKS[3], PAGE_ARTWORKS[2]],
    createdAt: "2026-01-01T07:45:00Z",
    updatedAt: "2026-01-01T07:45:00Z"
  },
  {
    id: "chap-4-2",
    storyId: "story-4",
    chapterNumber: 2,
    title: "Loạn Thế Dũng Sĩ",
    slug: "chuong-2",
    images: [PAGE_ARTWORKS[2], PAGE_ARTWORKS[1], PAGE_ARTWORKS[0], PAGE_ARTWORKS[5]],
    createdAt: "2026-03-15T10:00:00Z",
    updatedAt: "2026-03-15T10:00:00Z"
  },
  {
    id: "chap-4-3",
    storyId: "story-4",
    chapterNumber: 3,
    title: "Trường Ca Giữ Nước (Chương cuối)",
    slug: "chuong-3",
    images: [PAGE_ARTWORKS[0], PAGE_ARTWORKS[3], PAGE_ARTWORKS[4], PAGE_ARTWORKS[1]],
    createdAt: "2026-05-30T12:00:00Z",
    updatedAt: "2026-05-30T12:00:00Z"
  },
  // Story 5
  {
    id: "chap-5-1",
    storyId: "story-5",
    chapterNumber: 1,
    title: "Tiếng Gọi Từ Bóng Tối",
    slug: "chuong-1",
    images: [PAGE_ARTWORKS[0], PAGE_ARTWORKS[4], PAGE_ARTWORKS[5]],
    createdAt: "2026-04-10T11:30:00Z",
    updatedAt: "2026-04-10T11:30:00Z"
  },
  {
    id: "chap-5-2",
    storyId: "story-5",
    chapterNumber: 2,
    title: "Lần Theo Vết Sương",
    slug: "chuong-2",
    images: [PAGE_ARTWORKS[1], PAGE_ARTWORKS[2], PAGE_ARTWORKS[3]],
    createdAt: "2026-06-21T09:15:00Z",
    updatedAt: "2026-06-21T09:15:00Z"
  }
];

// Initial Users
const INITIAL_USERS: User[] = [
  {
    id: "user-admin",
    email: "admin@vntruyen.vn",
    fullName: "Quản Trị Viên",
    role: "admin",
    avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150",
    joinedAt: "2026-01-01T00:00:00Z"
  },
  {
    id: "user-1",
    email: "kien9793@gmail.com",
    fullName: "Kien Nguyen",
    role: "user",
    avatar: "https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=150",
    joinedAt: "2026-06-15T12:00:00Z"
  },
  {
    id: "user-2",
    email: "docgia@vntruyen.vn",
    fullName: "Độc Giả Thân Thiết",
    role: "user",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150",
    joinedAt: "2026-06-20T08:00:00Z"
  }
];

// LocalStorage Keys
const KEYS = {
  STORIES: "vntruyen_stories",
  CHAPTERS: "vntruyen_chapters",
  CATEGORIES: "vntruyen_categories",
  USERS: "vntruyen_users",
  CURRENT_USER: "vntruyen_current_user",
  HISTORY: "vntruyen_history",
  FAVORITES: "vntruyen_favorites"
};

// Initialize Storage if empty
export const initLocalStorage = () => {
  const existingCats = localStorage.getItem(KEYS.CATEGORIES);
  if (!existingCats || JSON.parse(existingCats).length < 30) {
    localStorage.setItem(KEYS.CATEGORIES, JSON.stringify(INITIAL_CATEGORIES));
  }
  if (!localStorage.getItem(KEYS.STORIES)) {
    localStorage.setItem(KEYS.STORIES, JSON.stringify(INITIAL_STORIES));
  }
  if (!localStorage.getItem(KEYS.CHAPTERS)) {
    localStorage.setItem(KEYS.CHAPTERS, JSON.stringify(INITIAL_CHAPTERS));
  }
  if (!localStorage.getItem(KEYS.USERS)) {
    localStorage.setItem(KEYS.USERS, JSON.stringify(INITIAL_USERS));
  }
  if (!localStorage.getItem(KEYS.HISTORY)) {
    const defaultHistory: ReadingHistory[] = [
      { storyId: "story-1", chapterNumber: 1, readAt: "2026-06-22T20:00:00Z" },
      { storyId: "story-3", chapterNumber: 2, readAt: "2026-06-22T21:15:00Z" }
    ];
    localStorage.setItem(KEYS.HISTORY, JSON.stringify(defaultHistory));
  }
  if (!localStorage.getItem(KEYS.FAVORITES)) {
    const defaultFavorites = ["story-1", "story-3"];
    localStorage.setItem(KEYS.FAVORITES, JSON.stringify(defaultFavorites));
  }
};

// Run immediately to secure values in memory/local
initLocalStorage();

// Helper parsers
const getParsed = <T>(key: string, backup: T): T => {
  try {
    const val = localStorage.getItem(key);
    return val ? JSON.parse(val) : backup;
  } catch (e) {
    return backup;
  }
};

const setJSON = (key: string, data: any) => {
  localStorage.setItem(key, JSON.stringify(data));
};

export const dbService = {
  // Categories
  getCategories(): Category[] {
    return getParsed<Category[]>(KEYS.CATEGORIES, INITIAL_CATEGORIES);
  },
  createCategory(name: string, slug: string, description?: string): Category {
    const cats = this.getCategories();
    const newCat: Category = {
      id: "cat-" + Date.now(),
      name,
      slug: slug || name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
      description
    };
    cats.push(newCat);
    setJSON(KEYS.CATEGORIES, cats);
    return newCat;
  },
  updateCategory(id: string, name: string, slug: string, description?: string): Category {
    const cats = this.getCategories();
    const index = cats.findIndex((c) => c.id === id);
    if (index !== -1) {
      cats[index] = { ...cats[index], name, slug, description };
      setJSON(KEYS.CATEGORIES, cats);
      return cats[index];
    }
    throw new Error("Category not found");
  },
  deleteCategory(id: string): void {
    const cats = this.getCategories();
    const filtered = cats.filter((c) => c.id !== id);
    setJSON(KEYS.CATEGORIES, filtered);
  },

  // Stories
  getStories(): Story[] {
    return getParsed<Story[]>(KEYS.STORIES, INITIAL_STORIES);
  },
  hydrateCatalog(categories: Category[], stories: Story[]): void {
    setJSON(KEYS.CATEGORIES, categories);
    setJSON(KEYS.STORIES, stories);
  },
  getStoryBySlug(slug: string): Story | undefined {
    return this.getStories().find((s) => s.slug === slug);
  },
  getStoryById(id: string): Story | undefined {
    return this.getStories().find((story) => story.id === id);
  },
  cacheStory(story: Story): void {
    const stories = this.getStories();
    const index = stories.findIndex((item) => item.id === story.id);
    if (index === -1) stories.push(story);
    else stories[index] = story;
    setJSON(KEYS.STORIES, stories);
  },
  createStory(storyData: Omit<Story, "id" | "views" | "createdAt" | "updatedAt">): Story {
    const stories = this.getStories();
    const newStory: Story = {
      ...storyData,
      id: "story-" + Date.now(),
      views: Math.floor(Math.random() * 200) + 1, // small randomized views
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    stories.push(newStory);
    setJSON(KEYS.STORIES, stories);
    return newStory;
  },
  updateStory(id: string, storyData: Partial<Story>): Story {
    const stories = this.getStories();
    const index = stories.findIndex((s) => s.id === id);
    if (index !== -1) {
      stories[index] = {
        ...stories[index],
        ...storyData,
        updatedAt: new Date().toISOString()
      };
      setJSON(KEYS.STORIES, stories);
      return stories[index];
    }
    throw new Error("Story not found");
  },
  deleteStory(id: string): void {
    const stories = this.getStories();
    const filtered = stories.filter((s) => s.id !== id);
    setJSON(KEYS.STORIES, filtered);

    // Also delete associated chapters
    const chapters = this.getAllChapters();
    const remChapters = chapters.filter((c) => c.storyId !== id);
    setJSON(KEYS.CHAPTERS, remChapters);
  },
  incrementViews(storyId: string): void {
    const stories = this.getStories();
    const index = stories.findIndex((s) => s.id === storyId);
    if (index !== -1) {
      stories[index].views += 1;
      setJSON(KEYS.STORIES, stories);
    }
  },

  // Chapters
  getAllChapters(): Chapter[] {
    return getParsed<Chapter[]>(KEYS.CHAPTERS, INITIAL_CHAPTERS);
  },
  getChapters(storyId: string): Chapter[] {
    return this.getAllChapters()
      .filter((c) => c.storyId === storyId)
      .sort((a, b) => a.chapterNumber - b.chapterNumber);
  },
  getChapter(storyId: string, chapterNumber: number): Chapter | undefined {
    return this.getAllChapters().find((c) => c.storyId === storyId && c.chapterNumber === chapterNumber);
  },
  cacheChapter(chapter: Chapter): void {
    const chapters = this.getAllChapters();
    const index = chapters.findIndex((item) => item.storyId === chapter.storyId && item.chapterNumber === chapter.chapterNumber);
    if (index === -1) chapters.push(chapter);
    else chapters[index] = chapter;
    setJSON(KEYS.CHAPTERS, chapters);
  },
  createChapter(storyId: string, chapterNumber: number, title: string, images: string[]): Chapter {
    const chapters = this.getAllChapters();
    const newChapter: Chapter = {
      id: "chap-" + Date.now(),
      storyId,
      chapterNumber,
      title,
      slug: `chuong-${chapterNumber}`,
      images: images && images.length > 0 ? images : [PAGE_ARTWORKS[0], PAGE_ARTWORKS[1]],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    chapters.push(newChapter);
    setJSON(KEYS.CHAPTERS, chapters);

    // Update story modified time
    this.updateStory(storyId, {});
    return newChapter;
  },
  updateChapter(id: string, chapterNumber: number, title: string, images: string[]): Chapter {
    const chapters = this.getAllChapters();
    const index = chapters.findIndex((c) => c.id === id);
    if (index !== -1) {
      chapters[index] = {
        ...chapters[index],
        chapterNumber,
        title,
        slug: `chuong-${chapterNumber}`,
        images,
        updatedAt: new Date().toISOString()
      };
      setJSON(KEYS.CHAPTERS, chapters);
      return chapters[index];
    }
    throw new Error("Chapter not found");
  },
  deleteChapter(id: string): void {
    const chapters = this.getAllChapters();
    const filtered = chapters.filter((c) => c.id !== id);
    setJSON(KEYS.CHAPTERS, filtered);
  },

  // Users & Auth
  getUsers(): User[] {
    return getParsed<User[]>(KEYS.USERS, INITIAL_USERS);
  },
  getCurrentUser(): User | null {
    const user = localStorage.getItem(KEYS.CURRENT_USER);
    return user ? JSON.parse(user) : null;
  },
  setCurrentUser(user: User | null): void {
    if (user) {
      localStorage.setItem(KEYS.CURRENT_USER, JSON.stringify(user));
    } else {
      localStorage.removeItem(KEYS.CURRENT_USER);
    }
  },
  updateUserRole(userId: string, role: "admin" | "user"): void {
    const users = this.getUsers();
    const index = users.findIndex((u) => u.id === userId);
    if (index !== -1) {
      users[index].role = role;
      setJSON(KEYS.USERS, users);

      // sync current user if matching
      const current = this.getCurrentUser();
      if (current && current.id === userId) {
        this.setCurrentUser(users[index]);
      }
    }
  },
  register(fullName: string, email: string, role: "admin" | "user" = "user"): User {
    const users = this.getUsers();
    if (users.some((u) => u.email.toLowerCase() === email.toLowerCase())) {
      throw new Error("Email đã tồn tại!");
    }
    const newUser: User = {
      id: "u-" + Date.now(),
      email,
      fullName,
      role,
      avatar: `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150`,
      joinedAt: new Date().toISOString()
    };
    users.push(newUser);
    setJSON(KEYS.USERS, users);
    this.setCurrentUser(newUser);
    return newUser;
  },
  login(email: string): User {
    const users = this.getUsers();
    const found = users.find((u) => u.email.toLowerCase() === email.toLowerCase());
    if (!found) {
      // For friendly demo convenience: if user enters anything, let's auto enroll them or create them!
      // This respects user friendliness inside constraints
      return this.register(email.split("@")[0], email);
    }
    this.setCurrentUser(found);
    return found;
  },

  // History
  getHistory(): ReadingHistory[] {
    return getParsed<ReadingHistory[]>(KEYS.HISTORY, []);
  },
  addHistory(storyId: string, chapterNumber: number): void {
    let history = this.getHistory();
    // Remove if already logged for this story to keep latest on top
    history = history.filter((h) => h.storyId !== storyId);
    history.unshift({
      storyId,
      chapterNumber,
      readAt: new Date().toISOString()
    });
    // Keep max 20 items to save space
    if (history.length > 20) {
      history = history.slice(0, 20);
    }
    setJSON(KEYS.HISTORY, history);
  },
  clearHistory(): void {
    setJSON(KEYS.HISTORY, []);
  },

  // Favorites / Saved Stories
  getFavorites(): string[] {
    return getParsed<string[]>(KEYS.FAVORITES, []);
  },
  toggleFavorite(storyId: string): boolean {
    const favs = this.getFavorites();
    const index = favs.indexOf(storyId);
    let added = false;
    if (index === -1) {
      favs.push(storyId);
      added = true;
    } else {
      favs.splice(index, 1);
    }
    setJSON(KEYS.FAVORITES, favs);
    return added;
  },
  isFavorite(storyId: string): boolean {
    return this.getFavorites().includes(storyId);
  }
};
