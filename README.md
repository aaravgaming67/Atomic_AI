# ⚛️ Atomic — Master Every Subject at Atomic Speed

> **Created with ❤️ by Aarav, Vaibhav, and Aarnav • National Public School (NPS) Class 7B**

**Atomic** is a next-generation AI study platform and gamified learning universe. It seamlessly merges personalized AI tutoring, arcade mini-games, spaced-repetition flashcards, and real-time progress analytics within a celestial aesthetic featuring persistent cosmic starfields, orbital trajectories, and mountain horizon silhouettes.

---

## 🚀 Key Features

- **24/7 AI Tutors (Gemini AI SDK)**:
  - **Vaibs**: Exam notes, summary generator, and interactive quick quizzes.
  - **Avi**: Step-by-step Math & STEM solver with formula breakdowns.
  - **Arnie**: Social Studies, World History, Civics, and Geography guide.
  - **Avans**: Logic Lab, riddles, brain teasers, and coding challenges.

- **Level Up Your Knowledge (Mini-Games)**:
  - **Equation Quest**: Battle math monsters with rapid-fire arithmetic & algebra.
  - **Vocabulary Void**: Catch falling letter meteorites before they collapse into the event horizon.
  - **History Hero**: Interactive time-travel decision engine across historical milestones.

- **Spaced Repetition & Flashcard Engine**:
  - Interactive flip cards, difficulty rating algorithms, and memory retention tracking.

- **Cloud Synchronization (Firebase Firestore)**:
  - Real-time cloud progress persistence for student profiles, XP, daily streaks, and quiz performance.

- **Cosmic Engine**:
  - Continuous animated canvas starfield with twinkling white stars and passing shooting comets.

---

## 🛠️ Tech Stack

- **Frontend**: HTML5, Modern CSS3 with Tailwind utility integration, Plus Jakarta Sans typography
- **Animations & FX**: Canvas 2D particle engine, CSS keyframes, Canvas Confetti
- **Backend / API**: Node.js, Express, Google GenAI SDK (`@google/genai`)
- **Database**: Firebase Firestore (`ai-studio-atomicai-442bde42-0d64-48f5-8780-993ce5608502`)
- **Build System**: Vite 6, esbuild, TypeScript

---

## 💻 Running the App from GitHub

### Option A: Local Development (Full-Stack with Express Backend)
When running locally on your computer with Node.js:

1. **Clone the repository**:
   ```bash
   git clone https://github.com/your-username/atomic-ai.git
   cd atomic-ai
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure your Gemini API Key**:
   Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```
   Add your free Google Gemini API key to `.env`:
   ```env
   GEMINI_API_KEY=your_actual_gemini_api_key_here
   ```

4. **Start the local server**:
   ```bash
   npm run dev
   ```
   Open `http://localhost:3000` in your browser. All 4 AI agents will connect directly through the Express backend proxy!

---

### Option B: GitHub Pages / Static Hosting (Zero-Config)
If you deploy this repository directly to **GitHub Pages** or static web hosts (where no Node.js backend server runs):

- ⚡ **Zero-Config Smart Solver**: The built-in AI tutor automatically detects static hosting and runs an intelligent curriculum solver engine that breaks down math, science, history, coding, and practice quizzes step-by-step.
- 🔑 **Live Gemini AI on GitHub Pages**: You can click the **⚙️ Settings** button inside the AI Tutor modal and enter your free Google Gemini API key. The key is securely saved in your browser's local storage and enables full live generative responses directly on GitHub Pages!

---

## 🔄 How to Push Updates to GitHub

```bash
git add .
git commit -m "feat: Universal multi-tier AI support for local Express server and GitHub Pages static hosting"
git push origin main
```

---

## 👨‍💻 Project Creators & Credits

- **Aarav** — AI Lead & Cloud Architecture (*NPS Class 7B*)
- **Vaibhav** — Game Engine & Logic Designer (*NPS Class 7B*)
- **Aarnav** — UX & Narrative Experience (*NPS Class 7B*)

*School: National Public School (NPS) • Class 7B*

