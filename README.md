# 🎨 AI Thumbnail Generator

A full-stack web application that generates professional YouTube thumbnails using AI. Built with React, Node.js, and Hugging Face's FLUX model — completely free to run.

---

## 📸 Preview

![Homepage Preview](frontend\public\hero_img.png)

---

## ✨ Features

- 🤖 **AI Image Generation** — Powered by Hugging Face's FLUX.1-schnell model
- 🎨 **5 Visual Styles** — Bold & Graphic, Tech/Futuristic, Minimalist, Photorealistic, Illustrated
- 🌈 **8 Color Schemes** — Vibrant, Sunset, Forest, Neon, Purple, Monochrome, Ocean, Pastel
- 📐 **Multiple Aspect Ratios** — 16:9, 9:16, 1:1, 4:3, 3:4
- ☁️ **Cloud Storage** — Images stored and served via ImageKit CDN
- 🔐 **JWT Authentication** — Secure, stateless auth that works on all browsers including Safari/iPhone
- 📱 **Fully Responsive** — Works on desktop and mobile
- 💾 **My Generations** — View, download, and delete your previously generated thumbnails
- ⬇️ **One-click Download** — Download any generated thumbnail instantly

---

## 🛠️ Tech Stack

### Frontend
| Technology | Purpose |
|------------|---------|
| React + TypeScript | UI framework |
| Vite | Build tool |
| React Router | Page navigation |
| Axios | API requests |
| React Hot Toast | Notifications |
| Tailwind CSS | Styling |

### Backend
| Technology | Purpose |
|------------|---------|
| Node.js + Express | Server framework |
| TypeScript | Type safety |
| MongoDB + Mongoose | Database |
| JWT (jsonwebtoken) | Authentication |
| Bcrypt | Password hashing |
| Hugging Face Inference | AI image generation |
| ImageKit | Image storage & CDN |

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- MongoDB database (MongoDB Atlas free tier works)
- Hugging Face account (free)
- ImageKit account (free)

### 1. Clone the repository
```bash
git clone https://github.com/BahaaShk/ai-thumbnail-generator.git
cd ai-thumbnail-generator
```

### 2. Install dependencies

**Backend:**
```bash
cd server
npm install
```

**Frontend:**
```bash
cd frontend
npm install
```

### 3. Set up environment variables

Create a `.env` file inside the `server/` folder:
```env
# Database
MONGODB_URI=your_mongodb_connection_string

# JWT — use a long random string, never share this
JWT_SECRET=your_super_long_random_secret_here

# Hugging Face
HUGGINGFACE_API_KEY=hf_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# ImageKit
IMAGEKIT_PUBLIC_KEY=public_xxxxxxxxxxxxxxxxxxxxxx
IMAGEKIT_PRIVATE_KEY=private_xxxxxxxxxxxxxxxxxxxxxx
IMAGEKIT_URL_ENDPOINT=https://ik.imagekit.io/your_imagekit_id

# Environment
NODE_ENV=development
```

Create a `.env` file inside the `frontend/` folder:
```env
VITE_BASE_URL=http://localhost:3000
```

### 4. Run the project

**Backend** (from `server/` folder):
```bash
npm run dev
```

**Frontend** (from `frontend/` folder):
```bash
npm run dev
```

Frontend runs on `http://localhost:5173`
Backend runs on `http://localhost:3000`

---

## 🌍 Deployment

This project is deployed on **Vercel** for both frontend and backend.

### Backend environment variables (Vercel):
```
MONGODB_URI
JWT_SECRET
HUGGINGFACE_API_KEY
IMAGEKIT_PUBLIC_KEY
IMAGEKIT_PRIVATE_KEY
IMAGEKIT_URL_ENDPOINT
NODE_ENV=production
```

### Frontend environment variables (Vercel):
```
VITE_BASE_URL=https://your-backend.vercel.app
```

---

## 📁 Project Structure

```
ai-thumbnail-generator/
├── frontend/
│   └── src/
│       ├── configs/
│       │   └── api.ts              # Axios instance + JWT interceptor
│       ├── context/
│       │   └── AuthContext.tsx     # Global auth state + login/logout/register
│       ├── pages/
│       │   ├── Generate.tsx        # Thumbnail generation page
│       │   └── MyGeneration.tsx    # User's saved thumbnails
│       └── main.tsx                # App entry point
│
└── server/
    └── src/
        ├── controllers/
        │   ├── AuthController.ts   # Register, login, logout, verify
        │   ├── ThumbnailController.ts # Generate & delete thumbnails
        │   └── UserController.ts   # Get user thumbnails
        ├── middlewares/
        │   └── auth.ts             # JWT protect middleware
        ├── models/
        │   ├── User.ts             # User MongoDB model
        │   └── Thumbnail.ts        # Thumbnail MongoDB model
        ├── routes/
        │   ├── AuthRoutes.ts       # /api/auth/*
        │   ├── ThumbnailRoutes.ts  # /api/thumbnail/*
        │   └── UserRoutes.ts       # /api/user/*
        ├── utils/
        │   └── jwt.ts              # generateToken & verifyToken
        └── server.ts               # Express app entry point
```

---

## 🔑 How Authentication Works

This app uses **JWT (JSON Web Tokens)** instead of sessions, making it compatible with all browsers including Safari on iPhone and serverless deployments.

1. User registers or logs in → server generates a JWT token
2. Token is saved in the browser's `localStorage`
3. Every API request automatically includes the token in the `Authorization` header
4. The `protect` middleware on the backend verifies the token on every protected route
5. On logout, the token is removed from `localStorage`

---

## 🎨 How Image Generation Works

1. User fills in the generation form (title, style, color scheme, aspect ratio)
2. Frontend sends the form data to the backend
3. Backend builds a detailed AI prompt from the user's choices
4. Prompt is sent to Hugging Face's FLUX.1-schnell model
5. Model returns the image as a binary blob
6. Image is uploaded to ImageKit for storage
7. ImageKit URL is saved to MongoDB and returned to the frontend
8. Frontend displays the generated thumbnail

---

## 📝 API Endpoints

### Auth
| Method | Endpoint | Description | Protected |
|--------|----------|-------------|-----------|
| POST | `/api/auth/register` | Create new account | ❌ |
| POST | `/api/auth/login` | Login | ❌ |
| POST | `/api/auth/logout` | Logout | ✅ |
| GET | `/api/auth/verify` | Verify current user | ✅ |

### Thumbnails
| Method | Endpoint | Description | Protected |
|--------|----------|-------------|-----------|
| POST | `/api/thumbnail/generate` | Generate new thumbnail | ✅ |
| DELETE | `/api/thumbnail/delete/:id` | Delete a thumbnail | ✅ |

### User
| Method | Endpoint | Description | Protected |
|--------|----------|-------------|-----------|
| GET | `/api/user/thumbnails` | Get all user thumbnails | ✅ |
| GET | `/api/user/thumbnail/:id` | Get single thumbnail | ✅ |

---

## 🆓 Free Tier Limits

| Service | Free Limit |
|---------|-----------|
| Hugging Face | ~300 requests/day |
| ImageKit | 20GB storage, 20GB bandwidth/month |
| MongoDB Atlas | 512MB storage |
| Vercel | 100GB bandwidth/month |

More than enough for a personal or portfolio project.

---

## 🙏 Acknowledgements

- [Hugging Face](https://huggingface.co) — Free AI model hosting
- [Black Forest Labs](https://blackforestlabs.ai) — FLUX.1-schnell model
- [ImageKit](https://imagekit.io) — Image storage and CDN
- [MongoDB Atlas](https://www.mongodb.com/atlas) — Free cloud database

---

## 👨‍💻 Author

**Bahaa Shkair**
- GitHub: [@BahaaShk](https://github.com/BahaaShk)
- Live Demo: [bahaashk-thumbnail-ai.vercel.app](https://bahaashk-thumbnail-ai.vercel.app)

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).