# 📚 Silent Pages — Novel Reader Dashboard

A dark, mysterious Netflix-style web app for discovering and reading novels. Browse mystery thrillers like *Shatter Me*, *It Ends With Us*, and more with a sleek dark theme, interactive carousels, and immersive reading experience.

## ✨ Key Features

### Reader Dashboard
- **Dark Mysterious Theme** — Deep purples, charcoal, and gold accents for a moody, immersive atmosphere.
- **Netflix-Style Carousels** — Horizontally scrollable rows of books grouped by category.
- **Featured Grid** — Top-rated books highlighted at the top.
- **Search & Filter** — Find novels by title or author instantly.
- **3D Hover Preview** — Tilt effect and animated overlay when hovering carousel items (500ms delay).
- **Timed Text Preview** — Excerpts animate and optional audio snippets play during hover.
- **Interactive Modal** — Click "Info" to see extended book details with actions (Open Reader / Add to My Books).
- **Book Detail Page** — Full description, author bio, reviews, and ratings.
- **Author Profiles** — Browse author info and all their novels.

### Backend API
- **Book Management** — Fetch all books, get details, search, and filter by category.
- **Author Management** — List all authors, view their bio and books.
- **Review System** — Submit and view reader reviews with ratings (1-5 stars).
- **Reading History** — Track which books users are currently reading, have completed, or abandoned.
- **Authentication** — JWT-based user auth (login/register endpoints).

## 🛠 Tech Stack

**Frontend:**
- React 19 with Vite
- React Router for navigation
- Custom CSS with dark theme variables
- Responsive and accessible

**Backend:**
- Node.js + Express
- Prisma ORM for database queries
- SQLite (dev) / MySQL (production)
- JWT for authentication

**Database Schema:**
- Users (with login/profile)
- Authors (with bio and images)
- Books (with ISBN, cover, description, ratings)
- Reviews (user ratings and comments)
- ReadingHistory (track reading progress)
- Categories (organize books)

## 🚀 Quick Start

### Prerequisites
- Node.js (v16+)
- npm or yarn

### 1. Backend Setup

```bash
cd backend
npm install
npx prisma generate
npx prisma migrate dev --name init
npm run seed
node index.js
```

The backend will start on `http://localhost:4000`.

**What `npm run seed` does:**
- Creates a demo SQLite database with 4 sample mystery novels
- Adds 4 authors (Gillian Flynn, Stieg Larsson, Alex Michaelides, Dennis Lehane)
- Adds sample reviews and reading history entries

### 2. Frontend Setup

In a new terminal:

```bash
cd frontend
npm install
npm run dev
```

The frontend will start on `http://localhost:5173` and automatically proxy API calls to the backend.

### 3. Open the App

Visit `http://localhost:5173` in your browser. You should see:
- A dark hero section with search bar
- Featured books grid
- Horizontal carousels grouped by category

## 📖 How to Use

### Browsing Books
1. **Search** — Type in the search bar to filter by title or author.
2. **Hover Carousels** — Move over a book cover to see a preview overlay after ~500ms.
3. **Tilt Effect** — The cover tilts toward your cursor (3D perspective).
4. **Preview Text** — A short excerpt animates during the preview.

### Book Details
1. **Click "Read"** — Navigate to the full book detail page.
2. **View Reviews** — See user ratings and comments.
3. **Author Profile** — Click the author name to see their biography and other books.

### Info Modal
1. **Click "Info"** on any preview overlay.
2. A modal opens with:
   - Cover image
   - Full title and author
   - Complete description
   - ISBN and average rating
   - Action buttons (Open Reader / Add to My Books)
3. **Close** with Escape key or click outside.

## 🗂 Project Structure

```
Library_Lite/
├── backend/
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── bookController.js
│   │   ├── authorController.js
│   │   ├── reviewController.js
│   │   └── readingHistoryController.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── books.js
│   │   ├── authors.js
│   │   ├── reviews.js
│   │   └── readingHistory.js
│   ├── middleware/
│   │   └── auth.js (JWT verification)
│   ├── prisma/
│   │   └── schema.prisma (database schema)
│   ├── seed.js (demo data)
│   ├── index.js (main server entry)
│   ├── package.json
│   └── .env (DATABASE_URL, JWT_SECRET)
│
└── frontend/
    ├── src/
    │   ├── components/
    │   │   ├── TopNav.jsx (navigation bar)
    │   │   ├── BookCard.jsx (compact and full variants with tilt)
    │   │   ├── RowCarousel.jsx (horizontal scrollable rows)
    │   │   └── Modal.jsx (accessible modal dialog)
    │   ├── pages/
    │   │   ├── Home.jsx (main dashboard)
    │   │   ├── BookDetail.jsx (book info + reviews)
    │   │   └── Author.jsx (author profile + books)
    │   ├── styles/
    │   │   └── theme.css (dark theme + animations)
    │   ├── App.jsx (routing)
    │   ├── main.jsx (entry point)
    │   └── index.css
    ├── vite.config.js (API proxy to backend)
    └── package.json
```

## 🔗 API Endpoints

### Books
- `GET /api/books` — List all books (with pagination, search, filter)
- `GET /api/books/:id` — Get book details with reviews
- `POST /api/books` — Create book (admin)
- `PUT /api/books/:id` — Update book (admin)

### Authors
- `GET /api/authors` — List all authors
- `GET /api/authors/:id` — Get author profile with books
- `POST /api/authors` — Create author (admin)
- `PUT /api/authors/:id` — Update author (admin)

### Reviews
- `POST /api/reviews` — Submit a review (authenticated)
- `GET /api/reviews/book/:bookId` — Get reviews for a book
- `DELETE /api/reviews/:reviewId` — Delete review (user or admin)

### Reading History
- `POST /api/reading-history` — Add/update reading progress (authenticated)
- `GET /api/reading-history/user/all` — Get user's reading history
- `GET /api/reading-history/user/currently-reading` — Get books user is reading

### Auth
- `POST /api/auth/register` — Register new user
- `POST /api/auth/login` — Login (returns JWT)
- `GET /api/auth/exist` — Check if authenticated (requires JWT)

## 🎨 Design Features

### Dark Theme
- Background: Deep charcoal (#0f0e13)
- Accent: Purple (#a67be0)
- Gold highlights: (#caa34a)
- Text: Light lavender (#efe9f5)

### Animations
- **Hover Overlay** — Fades in after 500ms with smooth translate and scale.
- **3D Tilt** — Cover tilts based on cursor position (max 8° rotation).
- **Text Preview** — Excerpt animates upward over 6 seconds while overlay is visible.
- **Smooth Transitions** — All interactions use cubic-bezier easing for fluid motion.

### Accessibility
- Keyboard navigation (Tab to focus, Enter/Space to activate, Escape to close).
- ARIA labels on all interactive elements.
- Focus-visible outlines for keyboard users.
- Modal traps focus and manages body scroll.

## 🐛 Troubleshooting

### Frontend shows blank page
- **Check backend is running:** `curl http://localhost:4000/api/books`
- **Check browser console (F12):** Look for CORS or network errors.
- **Vite proxy configured?** Make sure `vite.config.js` has the `/api` proxy pointing to `http://localhost:4000`.

### Backend won't start
- **DATABASE_URL not set?** Create `backend/.env` with:
  ```
  DATABASE_URL="file:./dev.db"
  JWT_SECRET="dev-secret-key"
  PORT=4000
  ```
- **Prisma client not generated?** Run `npx prisma generate`.
- **Database migration failed?** Try `npx prisma migrate reset --force` (warning: clears data).

### No books showing
- **Seed didn't run?** Try `npm run seed` again.
- **API returning empty?** Check `GET /api/books` response with `curl http://localhost:4000/api/books`.

### 3D tilt not working
- Hover overlay won't appear for 500ms—be patient!
- Make sure you're hovering over the **compact carousel items**, not the featured grid.

## 📝 Environment Variables

### Backend (.env)
```
DATABASE_URL="file:./dev.db"
JWT_SECRET="your-secret-key-here"
PORT=4000
```

## 🎯 Future Enhancements

- [ ] User authentication UI (login/signup pages)
- [ ] "Continue Reading" strip on Home (shows user's reading list)
- [ ] Infinite scroll on Home page
- [ ] Reading progress indicators (pages read / total pages)
- [ ] Social features (follow authors, share reviews)
- [ ] Admin dashboard (manage books/authors/users)
- [ ] Dark/Light theme toggle
- [ ] Audio narration preview snippets
- [ ] Bookshelf / wishlist management

## 📄 License

ISC

## 👤 Author

Created as a modern, dark-themed novel reader dashboard inspired by Netflix's UI/UX principles.

---

**Enjoy discovering mystery novels in the dark! 🌙📖**
