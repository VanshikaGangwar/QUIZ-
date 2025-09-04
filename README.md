
# ⚡ React Quiz App

A responsive quiz application built with **React**, featuring:

* Questions from the **Open Trivia DB API** (with local JSON fallback)
* Per-question **30-second timer**
* **Difficulty** & **question count** selection
* **Progress bar** and score tracking
* **Results page** with detailed answer review
* **Persistent high scores** via localStorage
* Responsive layout with accessible navigation

---

## 🚀 Features

* **One question at a time** with multiple choice answers.
* **Timer** auto-locks when time runs out.
* **Previous/Next/Submit** navigation.
* **Results page** with correct vs. selected answers.
* **Restart quiz** option.
* **High scores list** saved locally.
* Fallback to local `questions.json` if Trivia DB is unreachable.

---

## 📂 Project Structure

```
quiz-app/
│── src/
│   ├── App.js              # Main React app (Quiz, Home, Results)
│   ├── App.css             # Custom styles (no Tailwind)
│   ├── index.js            # React entry point
│   ├── data/
│   │   └── questions.json  # Local fallback questions
│── package.json
```

---

## 🛠️ Setup & Installation

1. **Clone the repo**

   ```bash
   git clone https://github.com/<your-username>/quiz-app.git
   cd quiz-app
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Run locally**

   ```bash
   npm start     # for Create React App
   # OR
   npm run dev   # for Vite
   ```

4. Open in browser:

   * CRA → [http://localhost:3000](http://localhost:3000)
   * Vite → [http://localhost:5173](http://localhost:5173)

---

## 🌐 Deployment

### Deploy to **Vercel** (recommended)

1. Push project to GitHub.
2. Go to [Vercel](https://vercel.com/), import repo.
3. Build command: `npm run build`
4. Output directory: `build` (CRA) or `dist` (Vite).

### Deploy to **GitHub Pages** (CRA only)

```bash
npm install gh-pages --save-dev
```

Add to `package.json`:

```json
"homepage": "https://<username>.github.io/quiz-app",
"scripts": {
  "predeploy": "npm run build",
  "deploy": "gh-pages -d build"
}
```

Deploy:

```bash
npm run deploy
```

---

## 🧪 Testing

* **Start quiz** → ensure Trivia DB questions load.
* **Go offline** → ensure local `questions.json` fallback works.
* **Let timer run out** → answer locks and auto-advances.
* **Check results** → correct/incorrect answers shown.
* **Check high scores** → persisted in browser localStorage.

---

## 📦 Tech Stack

* **React** (Hooks, functional components)
* **React Router** (navigation)
* **Open Trivia DB API**
* **LocalStorage** (high scores)
* **Custom CSS** (no Tailwind)

---

## 🙌 Credits

* Questions API: [Open Trivia DB](https://opentdb.com/)
* Author: Vanshika Gangwar ✨

---





