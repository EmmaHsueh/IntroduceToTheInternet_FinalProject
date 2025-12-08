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

### Backend (Moderation & API Proxy Service)
```bash
cd backend
npm install
node server.js
```

Backend API provides:
- Content moderation using Google's Perspective API (`/moderation` endpoint)
- Remove.bg API proxy for image background removal (`/remove-bg` endpoint)

The backend is deployed on Render at: https://introducetotheinternet-finalproject-0yrf.onrender.com

Backend requires an `.env` file with:
- `PERSPECTIVE_API_KEY` - Google Perspective API key for content moderation
- `REMOVE_BG_API_KEY` - Remove.bg API key for background removal
- `PORT` (optional, defaults to 10000)

### Firebase Configuration
Firebase is already configured in `src/firebase.js` with the `ntnu-talk` project credentials. The application uses:
- **Authentication** (Firebase Auth) with Email/Password and Google OAuth
- **Database** (Firestore) for posts, comments, and user profiles
- **File Storage** (Firebase Storage) - configured but not yet actively used for images

## Architecture

### Routing Structure
The application uses React Router with the following route hierarchy:
- `/` - Home page with hero section
- `/login` - Login/authentication page
- `/members` - Member directory
- `/profile` - User profile view
- `/profile/edit` - Edit user profile
- `/boards` - Board index/navigation
- `/boards/:boardId` - Individual board pages (food, weather, events, clubs, courses, outfit, other)
- `/boards/:boardId/:postId` - Post detail view with comments
- `/boards/:boardId/new` - Create new post (alternative route)
- `/media` - Media gallery page

### Component Architecture

**Template Pattern**: The application uses a `BoardTemplate` component as a reusable template for all board pages. Each specific board page (FoodBoardPage, WeatherBoardPage, etc.) simply renders `<BoardTemplate boardName="Board Name" />`.

**State Management**:
- Posts are now stored in **Firestore** with real-time synchronization via `onSnapshot` listeners
- Authentication state is managed globally via `AuthContext` using React Context API
- Local component state is used for UI interactions (chat, forms, etc.)

**Key Components**:
- `BoardTemplate`: Main board UI with post list, post form, and chat widget
- `ChatWidget`: Real-time chat widget with Firebase integration for persistent messaging
- `PostForm`: Multi-image upload form with background removal (remove.bg API via backend proxy) and content moderation (Perspective API)
- `PostDetailPage`: Renders full post with all images and comment thread
- `Header`: Site navigation
- `BoardNav`: Board-specific navigation
- `AuthContext`: Global authentication state management using Context API
- `MemberDirectory` / `MemberCard`: Member listing and profiles

**Key Services**:
- `postService.js`: Firestore operations for posts and comments (`listenToPosts`, `createPost`, `addCommentToPost`, `getPostById`)
- `chatService.js`: Firestore operations for real-time chat (`listenToChatMessages`, `sendChatMessage`, `cleanupExpiredMessages`, `clearBoardChatMessages`)

### Data Flow

**Authentication Flow**:
1. User signs up or logs in via `AuthContext` methods (`signup`, `login`, `loginWithGoogle`)
2. Firebase Auth creates/authenticates user account
3. User profile is stored/retrieved from Firestore `users` collection
4. `onAuthStateChanged` listener keeps authentication state synchronized
5. `useAuth()` hook provides access to `currentUser` and `userProfile` throughout the app

**Post Creation Flow**:
1. User fills `PostForm` with title, content, and multiple images
2. Images can be processed with background removal via backend `/remove-bg` endpoint (proxies to remove.bg API)
3. Content moderation check: `PostForm` sends `title + content` to backend `/moderation` endpoint
4. Backend uses Google Perspective API to analyze content for toxicity, threats, insults, profanity, identity attacks
5. If flagged (score >= 0.5 threshold), post is blocked with specific violation reasons shown to user
6. If approved, post data is sent to Firestore via `createPost()` from `postService.js`
7. Firestore generates unique post ID and stores post with: `title`, `content`, `boardName`, `authorId`, `authorName`, `imageUrls`, `createdAt`, `commentCount`, `comments`
8. `onSnapshot` listener automatically updates UI for all connected clients in real-time

**Post Viewing Flow**:
1. `BoardTemplate` sets up `onSnapshot` listener via `listenToPosts()` when component mounts
2. Posts are fetched from Firestore filtered by `boardName` and sorted by `createdAt` (descending)
3. Real-time updates: any changes to posts automatically trigger UI refresh
4. Clicking a post navigates to `PostDetailPage` which loads full post data via `getPostById()`
5. Comments are stored in the `comments` array field within each post document

**Comment Flow**:
1. User submits comment on `PostDetailPage`
2. `addCommentToPost()` fetches current post, appends new comment to `comments` array
3. Firestore document is updated with new comment and incremented `commentCount`
4. `onSnapshot` listener triggers re-render with updated data

**Real-time Chat Flow** (NEW):
1. User clicks "💬 即時聊天室" button on any board page
2. `ChatWidget` component mounts and sets up `onSnapshot` listener via `listenToChatMessages()`
3. Chat messages are fetched from Firestore `chatMessages` collection filtered by `boardName`
4. User types message and clicks "發送"
5. Message is sent to Firestore via `sendChatMessage()` with:
   - `boardName`: Current board name (each board has independent chat)
   - `sender`: User's nickname or email
   - `senderId`: User's Firebase UID
   - `content`: Message text
   - `createdAt`: Current timestamp
   - `expiresAt`: Current timestamp + 30 days
6. `onSnapshot` listener automatically updates all connected users' chat widgets in real-time
7. Messages older than 30 days are automatically cleaned up when the app starts via `cleanupExpiredMessages()`

### Styling
The application uses inline styles with a consistent color palette:
- `COLOR_DEEP_NAVY` (#1e2a38) - Primary text
- `COLOR_OLIVE_GREEN` (#454f3b) - Secondary emphasis/hover
- `COLOR_MORANDI_BROWN` (#a38c6b) - Accent color for chat and highlights
- `COLOR_BRICK_RED` (#c9362a) - Links and primary buttons
- `COLOR_OFF_WHITE` (#f3f3e6) - Background/secondary elements

### External APIs & Services

**Backend API Endpoints** (hosted on Render):
- `POST /moderation` - Content moderation using Google Perspective API
  - Request body: `{ content: string }`
  - Returns: `{ flagged: boolean, categories: object }`
- `POST /remove-bg` - Image background removal proxy
  - Accepts multipart form data with `image_file`
  - Returns PNG image data

**Firebase Services**:
- **Firestore Collections**:
  - `users` - User profiles with fields: `uid`, `email`, `nickname`, `avatar`, `bio`, `user_login`, `first_name`, `last_name`, `gender`, `createdAt`
  - `posts` - Posts with fields: `title`, `content`, `boardName`, `authorId`, `authorName`, `imageUrls` (array), `createdAt` (Timestamp), `commentCount`, `comments` (array)
  - `chatMessages` - Real-time chat messages with fields: `boardName`, `sender`, `senderId`, `content`, `createdAt` (Timestamp), `expiresAt` (Timestamp, 30 days from creation)
- **Firebase Auth** - Email/Password and Google OAuth authentication
- **Firebase Storage** - Configured but not actively used (images currently stored as Base64 in `imageUrls`)

## Important Implementation Details

### Authentication System
- **AuthContext** (`src/contexts/AuthContext.js`) manages global authentication state using React Context API
- Supports Email/Password authentication and Google OAuth via Firebase Auth
- User profiles stored in Firestore `users` collection
- `onAuthStateChanged` listener automatically loads user profile from Firestore when auth state changes
- `useAuth()` hook provides access to: `currentUser`, `userProfile`, `signup`, `login`, `loginWithGoogle`, `logout`, `resetPassword`, `loadUserProfile`
- New users automatically get a Firestore document created with default profile data
- Google login users get Firestore profile created on first login if it doesn't exist

### Board Data Isolation
Each board's posts are isolated by the `boardName` field in Firestore. The `listenToPosts()` function filters posts using `where('boardName', '==', boardName)` to ensure only relevant posts are fetched.

### Real-time Synchronization
The application uses Firestore's `onSnapshot` for real-time updates:
- When any user creates a post, all connected clients see it immediately
- When any user adds a comment, the post updates for all viewers
- When any user sends a chat message, all users in the same board's chat room see it instantly
- `BoardTemplate` and `ChatWidget` set up listeners on mount and clean up on unmount via `useEffect` return function

### Image Storage Strategy
Images are currently stored as Base64 strings in the `imageUrls` array field within Firestore documents. This has size limitations and is not optimal for production. For better performance, consider migrating to Firebase Storage and storing download URLs instead.

### Chat Widget (Real-time & Persistent)
Each board has an independent chat widget (`ChatWidget` component) with **Firebase Firestore integration**:
- Messages are stored in the `chatMessages` collection and persist across sessions
- Each board's chat is isolated by `boardName` field
- Messages are kept for 30 days, then automatically deleted via `expiresAt` timestamp
- Real-time synchronization: all users see new messages instantly via `onSnapshot` listener
- Automatic cleanup on app startup removes expired messages via `cleanupExpiredMessages()`
- Users must be logged in to send messages (checked via `currentUser`)

### Comment System
Comments are stored as an array (`comments`) within each post document in Firestore. When adding a comment via `addCommentToPost()`:
1. The function fetches the current post using `getDoc()`
2. Appends the new comment to the existing `comments` array
3. Updates the document using `updateDoc()` with the new array and incremented `commentCount`

## Common Development Tasks

**Adding a new board**:
1. Create new page component in `src/pages/` (e.g., `NewBoardPage.js`)
2. Import and render `<BoardTemplate boardName="New Board" />`
3. Add route in `src/App.js`: `<Route path="/boards/newboard" element={<NewBoardPage />} />`
4. Add navigation link in `BoardNav` component

**Modifying board UI**: Edit `BoardTemplate.js` - changes will apply to all boards

**Changing post structure**:
- Update the post object shape in `createPost()` in `src/services/postService.js`
- Ensure changes are compatible with `BoardTemplate` and `PostDetailPage` rendering logic

**Adjusting moderation sensitivity**: Modify `THRESHOLD` constant in `backend/server.js` (line 26). Range is 0.0-1.0, where higher values = less strict.

**Managing chat messages**:
- To clear all messages in a specific board: Use `clearBoardChatMessages(boardName)` from `chatService.js`
- To manually trigger expired message cleanup: Use `cleanupExpiredMessages()` from `chatService.js`
- Messages are automatically cleaned up on app startup in `App.js` via `useEffect`

**Backend deployment**: The backend is configured for Render deployment with `HOST = '0.0.0.0'` and `PORT` from environment variables (defaults to 10000).

## Current Limitations

- Images stored as Base64 in Firestore (size limitations, not optimal for performance)
- No user permission system for edit/delete operations on posts/comments/chat messages
- Member directory may use mock data (not fully integrated with Firebase users collection)
- No pagination for posts (all posts loaded at once via `onSnapshot`)
- No pagination for chat messages (all messages for a board loaded at once)
- No search/filter functionality for posts
- Content moderation only checks text, not images
- Chat messages don't have edit/delete functionality for individual users
