# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a React-based forum/bulletin board application called "師聲" (Teacher's Voice) with Firebase integration. The application features multiple topic-based boards (food, weather, events, clubs, courses, outfit, other) where users can post content with images, comment on posts, and participate in real-time chat.

## Setup

### Frontend
```bash
npm install
npm start
```

Development server runs on http://localhost:3000

### Backend (Moderation Service)
```bash
cd backend
npm install
node server.js
```

Backend API runs on http://localhost:3001 and provides content moderation using OpenAI's moderation API.

### Firebase Configuration
Replace the placeholder config in `src/firebase.js` with your Firebase project credentials to enable:
- Authentication (Firebase Auth)
- Database (Firestore)
- File Storage (Firebase Storage)

The backend requires an `.env` file with `OPENAI_API_KEY` for content moderation.

## Architecture

### Routing Structure
The application uses React Router with the following route hierarchy:
- `/` - Home page with hero section
- `/login` - Login/authentication page
- `/members` - Member directory
- `/profile` - User profile view
- `/profile/edit` - Edit user profile
- `/boards` - Board index/navigation
- `/boards/:boardId` - Individual board pages (food, weather, events, etc.)
- `/boards/:boardId/:postId` - Post detail view with comments
- `/boards/:boardId/new` - Create new post (alternative route)
- `/media` - Media gallery page

### Component Architecture

**Template Pattern**: The application uses a `BoardTemplate` component as a reusable template for all board pages. Each specific board page (FoodBoardPage, WeatherBoardPage, etc.) simply renders `<BoardTemplate boardName="Board Name" />`.

**State Management**: Posts are stored in browser localStorage with board-specific keys (`boardPosts_${boardName}`), ensuring data isolation between different boards. Each board maintains its own independent post collection.

**Key Components**:
- `BoardTemplate`: Main board UI with post list, post form, and chat widget
- `PostForm`: Multi-image upload form with background removal feature (uses remove.bg API)
- `PostDetailPage`: Renders full post with all images and comment thread
- `Header`: Site navigation
- `BoardNav`: Board-specific navigation
- `Auth`: Authentication wrapper component
- `MemberDirectory` / `MemberCard`: Member listing and profiles

### Data Flow

**Post Creation**:
1. User fills `PostForm` with title, content, and multiple images
2. Images can be processed with background removal via remove.bg API
3. Images are converted from Blob URLs to Base64 for localStorage storage
4. New post is prepended to board's post array
5. Post data saved to `localStorage` with key `boardPosts_${boardName}`

**Post Viewing**:
1. Board loads posts from localStorage on mount (via `useEffect`)
2. Posts display first image as thumbnail
3. Clicking post opens `PostDetailPage` showing all images and comments
4. Comments are stored as arrays within each post object

**Content Moderation**: The backend provides a `/moderation` endpoint that checks user-generated content using OpenAI's moderation API before allowing posts.

### Styling
The application uses inline styles with a consistent color palette:
- `COLOR_DEEP_NAVY` (#1e2a38) - Primary text
- `COLOR_OLIVE_GREEN` (#454f3b) - Secondary emphasis/hover
- `COLOR_MORANDI_BROWN` (#a38c6b) - Accent color for chat and highlights
- `COLOR_BRICK_RED` (#c9362a) - Links and primary buttons
- `COLOR_OFF_WHITE` (#f3f3e6) - Background/secondary elements

### External APIs
- **Remove.bg API**: Used in `PostForm` for image background removal. API key is hardcoded in component (should be moved to environment variables in production).
- **OpenAI Moderation API**: Used by backend server for content moderation with retry logic for rate limits.

## Important Implementation Details

### Board Data Isolation
Each board maintains separate localStorage entries. When switching boards, `BoardTemplate` uses `useEffect` with `boardName` dependency to load the correct board's posts. Never mix data between boards.

### Image Storage Strategy
Images are stored as Base64 strings in localStorage (converted from Blob URLs). This allows offline persistence but has size limitations. For production, migrate to Firebase Storage and store URLs instead.

### Chat Widget
Each board has an independent real-time chat widget (`ChatWidget` component) with local state only - messages are not persisted and reset on page refresh.

### Comment System
Comments are nested within post objects (`post.comments` array). When adding a comment, the entire posts array is updated and re-saved to localStorage. The `PostDetailPage` receives updated post object via `setSelectedPost` to trigger re-render.

## Common Development Tasks

**Adding a new board**:
1. Create new page component in `src/pages/` (e.g., `NewBoardPage.js`)
2. Import and render `<BoardTemplate boardName="New Board" />`
3. Add route in `src/App.js`: `<Route path="/boards/newboard" element={<NewBoardPage />} />`
4. Add navigation link in `BoardNav` component

**Modifying board UI**: Edit `BoardTemplate.js` - changes will apply to all boards

**Changing post structure**: Update the post object shape in `handleNewPostSubmit` in `BoardTemplate.js` and ensure localStorage compatibility

