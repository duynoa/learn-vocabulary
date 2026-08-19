# 📚 Wordly - Ứng dụng Học Từ Vựng Tiếng Anh (Learn Vocabulary)

Ứng dụng web học từ vựng tiếng Anh hiện đại, hỗ trợ học qua Flashcard, luyện tập Quiz trắc nghiệm, phát âm tự động và theo dõi tiến độ học tập thông minh.

---

## 🚀 Công nghệ sử dụng (Tech Stack)

* **Frontend**: React 18, TypeScript, Vite
* **Styling**: Tailwind CSS, Lucide Icons (`lucide-react`)
* **Backend & Database**: [Supabase](https://supabase.com) (PostgreSQL + PostgREST API)
* **Audio**: Web Speech API (Phát âm giọng đọc chuẩn bản xứ trực tiếp trên trình duyệt)

---

## 🌟 Tính năng chính

1. **Dashboard (Tổng quan)**:
   * Thống kê tổng số từ, số từ đang học (`learning`), số từ đã thuộc (`mastered`), độ chính xác trung bình (%).
   * Theo dõi mục tiêu học tập hàng ngày (Daily goal).
   * Lối tắt ôn tập nhanh và danh sách các từ vừa học gần đây.
2. **Thư viện từ vựng (Library)**:
   * Tìm kiếm từ khóa theo tiếng Anh hoặc nghĩa tiếng Việt nhanh chóng.
   * Modal xem chi tiết từ vựng kèm phiên âm IPA, từ loại, câu ví dụ song ngữ và nút nghe phát âm.
3. **Flashcard (Học thẻ ghi nhớ)**:
   * Lật thẻ 2 mặt (Mặt trước: từ vựng & phiên âm; Mặt sau: nghĩa tiếng Việt & câu ví dụ).
   * Đánh giá ghi nhớ: *Chưa nhớ* / *Đã nhớ* để hệ thống tự động cập nhật trạng thái từ.
4. **Luyện tập (Quiz trắc nghiệm)**:
   * Bộ câu hỏi 4 lựa chọn ngẫu nhiên dựa trên các từ vựng trong kho.
   * Chấm điểm trực tiếp và tổng kết kết quả sau mỗi vòng thi.
5. **Thêm từ mới (Add Word)**:
   * **Tự động tra cứu từ điển (Auto-lookup)**: Tự động lấy phiên âm chuẩn IPA, loại từ và câu ví dụ tiếng Anh khi nhập từ (hoặc nhấn nút đũa phép ✨).
   * **Tùy biến loại từ**: Cho phép chọn từ danh sách có sẵn (*noun, verb, adjective, phrase, idiom...*) hoặc chuyển sang chế độ **"Tự gõ"** để nhập bất kỳ loại từ nào.
   * **Nghe thử phát âm**: Có nút loa nghe phát âm trực tiếp ngay trong form trước khi lưu.

---

## 🛠️ Hướng dẫn cài đặt & Chạy dự án

### 1. Yêu cầu môi trường
* **Node.js**: Phiên bản `>= 22.0.0` (Do thư viện `@supabase/supabase-js` yêu cầu Node 22+).
* **Package manager**: `yarn` hoặc `npm`.

### 2. Cài đặt Dependencies
```bash
yarn install
```

### 3. Cấu hình Backend Supabase

#### Bước 3.1: Tạo dự án trên Supabase
1. Đăng ký/Đăng nhập tại [supabase.com](https://supabase.com).
2. Tạo một Project mới (chọn Region gần nhất, ví dụ Singapore).

#### Bước 3.2: Chạy Migration SQL tạo bảng
1. Vào **SQL Editor** trên Supabase Dashboard ➔ chọn **New Query**.
2. Mở file [supabase/migrations/20260818100501_create_vocabulary_schema.sql](supabase/migrations/20260818100501_create_vocabulary_schema.sql), copy toàn bộ nội dung và dán vào SQL Editor.
3. *(Tùy chọn)* Dán thêm dữ liệu mẫu vào cuối query để có sẵn từ vựng học thử:
```sql
-- Thêm từ vựng mẫu
INSERT INTO words (word, pronunciation, part_of_speech, meaning_vi, example_en, example_vi)
VALUES 
('Serendipity', '/ˌser.ənˈdɪp.ə.ti/', 'noun', 'Sự tình cờ may mắn', 'Finding this café was pure serendipity.', 'Tìm thấy quán cà phê này là một sự tình cờ may mắn.'),
('Delicious', '/dɪˈlɪʃ.əs/', 'adjective', 'Thơm ngon', 'The food at this restaurant is delicious.', 'Đồ ăn ở nhà hàng này rất ngon.'),
('Journey', '/ˈdʒɜː.ni/', 'noun', 'Chuyến hành trình', 'Life is a long journey with many lessons.', 'Cuộc sống là một hành trình dài với nhiều bài học.'),
('Resilient', '/rɪˈzɪl.jənt/', 'adjective', 'Kiên cường, có khả năng phục hồi', 'He is resilient in the face of difficulties.', 'Anh ấy rất kiên cường trước những khó khăn.');
```
4. Nhấn **Run** để khởi tạo cấu trúc bảng và chính sách bảo mật Row Level Security (RLS).

#### Bước 3.3: Thiết lập biến môi trường (`.env`)
1. Lấy **Project URL** và **anon public key** từ Supabase Dashboard:
   * **Cách lấy Project URL**:
     * *Cách 1 (Trong giao diện Dashboard)*: Vào **Project Settings** ➔ ở menu bên trái dưới mục **INTEGRATIONS**, chọn **Data API** ➔ copy đường dẫn ở mục **URL** (dạng `https://xxxxxxxxxxxx.supabase.co`).
     * *Cách 2 (Trực tiếp từ thanh địa chỉ trình duyệt)*: Nhìn lên URL bạn đang mở (`https://supabase.com/dashboard/project/<PROJECT_ID>/...`), Project URL chính là `https://<PROJECT_ID>.supabase.co`.
   * **Cách lấy anon key**:
     * Vào **Project Settings** ➔ chọn **API Keys** ➔ chuyển qua tab **"Legacy anon, service_role API keys"** (hoặc Publishable key) ➔ bấm **Copy** ở ô **`anon` `public`** (`eyJhbGciOi...`).
2. Tạo file `.env` ở thư mục gốc của project (có thể copy từ `.env.example`):
```env
VITE_SUPABASE_URL=https://YOUR_PROJECT_ID.supabase.co
VITE_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY
```

---

### 4. Chạy ứng dụng ở môi trường Local
```bash
yarn dev
```
Mở trình duyệt tại [http://localhost:5173](http://localhost:5173).

---

## 🗄️ Cấu trúc Cơ sở Dữ liệu (Database Schema)

### Bảng `words`
| Trường | Kiểu dữ liệu | Mô tả |
| :--- | :--- | :--- |
| `id` | `uuid` (PK) | Mã định danh từ vựng |
| `word` | `text` | Từ tiếng Anh |
| `pronunciation`| `text` | Phiên âm quốc tế (IPA) |
| `part_of_speech`| `text` | Từ loại (`noun`, `verb`, `adjective`...) |
| `meaning_vi` | `text` | Nghĩa tiếng Việt |
| `example_en` | `text` | Câu ví dụ bằng tiếng Anh |
| `example_vi` | `text` | Câu ví dụ dịch tiếng Việt |
| `created_at` | `timestamptz` | Ngày tạo |

### Bảng `progress`
| Trường | Kiểu dữ liệu | Mô tả |
| :--- | :--- | :--- |
| `id` | `uuid` (PK) | Mã định danh tiến độ |
| `word_id` | `uuid` (FK) | Khóa ngoại trỏ đến bảng `words(id)` |
| `status` | `text` | Trạng thái: `'new'`, `'learning'`, `'mastered'` |
| `review_count` | `integer` | Tổng số lần đã ôn tập |
| `correct_count`| `integer` | Số lần trả lời/nhớ đúng |
| `last_reviewed_at` | `timestamptz` | Thời gian ôn tập gần nhất |

*Quy tắc trạng thái*: Khi `correct_count >= 3` ➔ Từ vựng tự động được chuyển sang trạng thái `mastered` (Đã thuộc).

---

## 📂 Cấu trúc thư mục (Project Structure)

```text
learn-vocabulary/
├── supabase/
│   └── migrations/         # Các script migration SQL cho Supabase
│       └── 20260818100501_create_vocabulary_schema.sql
├── src/
│   ├── lib/
│   │   └── supabase.ts     # Khởi tạo Supabase client
│   ├── types.ts            # Định nghĩa TypeScript interfaces (Word, Progress, NewWord...)
│   ├── App.tsx             # Component chính chứa toàn bộ giao diện & logic
│   ├── main.tsx            # Entry point của React
│   └── index.css           # Cấu hình Tailwind CSS & Custom Styles
├── .env.example            # Mẫu biến môi trường
├── package.json            # Quản lý dependencies & scripts
├── tailwind.config.js      # Cấu hình Tailwind CSS
├── tsconfig.json           # Cấu hình TypeScript
└── vite.config.ts          # Cấu hình Vite bundler
```

---

## 📜 Các lệnh hữu ích (Available Scripts)

* `yarn dev`: Chạy server phát triển (Development mode).
* `yarn build`: Đóng gói ứng dụng để deploy (Production build).
* `yarn preview`: Xem trước bản build production.
* `yarn typecheck`: Kiểm tra lỗi kiểu TypeScript (`tsc --noEmit`).
* `yarn lint`: Kiểm tra chất lượng mã nguồn bằng ESLint.
