import React, { useEffect, useMemo, useRef, useState } from "react";
import { BrowserRouter as Router, Routes, Route, useLocation, useNavigate } from "react-router-dom";
import "./App.css";
import questionsData from "./data/questions.json";

/********************** Utilities ************************/ 
const decodeHTMLEntities = (str) => {
  const txt = document.createElement("textarea");
  txt.innerHTML = str;
  return txt.value;
};

const shuffle = (array) => {
  const a = [...array];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

const normalize = (items) =>
  items.map((q) => {
    const question = decodeHTMLEntities(q.question);
    const correct = decodeHTMLEntities(q.correct_answer);
    const incorrects = q.incorrect_answers.map(decodeHTMLEntities);
    const options = shuffle([correct, ...incorrects]);
    return { question, options, correct, difficulty: q.difficulty || "mixed" };
  });

/********************** Local Storage ************************/ 
const HS_KEY = "quiz_high_scores_v1";
const getHighScores = () => {
  try {
    const raw = localStorage.getItem(HS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};
const saveHighScore = (entry) => {
  const all = [...getHighScores(), entry]
    .sort((a, b) => b.score - a.score || b.date - a.date)
    .slice(0, 10);
  localStorage.setItem(HS_KEY, JSON.stringify(all));
  return all;
};

/********************** UI Primitives ************************/ 
const Card = ({ children, className = "" }) => <div className={`card ${className}`}>{children}</div>;

const Button = ({ children, className = "", ...props }) => (
  <button className={`${className}`} {...props}>{children}</button>
);

const ProgressBar = ({ current, total }) => {
  const pct = Math.round((current / total) * 100);
  return (
    <div>
      <div className="progress-container">
        <div className="progress-fill" style={{ width: `${pct}%` }}></div>
      </div>
      <div className="progress-label">Question {current} of {total}</div>
    </div>
  );
};

/********************** Pages ************************/ 
const Home = () => {
  const navigate = useNavigate();
  const [difficulty, setDifficulty] = useState("easy");
  const [amount, setAmount] = useState(10);
  const highs = getHighScores();

  const startQuiz = () => navigate("/quiz", { state: { difficulty, amount } });

  return (
    <div>
      <h1 style={{ textAlign: "center", marginBottom: "1rem" }}>Quiz App</h1>
      <Card>
        <h2>Setup</h2>
        <div style={{ display: "grid", gap: "1rem", marginTop: "1rem" }}>
          <label>
            Difficulty:
            <select value={difficulty} onChange={(e) => setDifficulty(e.target.value)}>
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
              <option value="mixed">Mixed</option>
            </select>
          </label>
          <label>
            Number of Questions:
            <input type="number" min={5} max={10} value={amount} onChange={(e) => setAmount(Math.max(5, Math.min(10, Number(e.target.value) || 5)))} />
          </label>
          <Button className="btn-primary" onClick={startQuiz}>Start Quiz</Button>
        </div>
      </Card>
      <Card>
        <h2>High Scores (Top 10)</h2>
        {highs.length === 0 ? <p>No high scores yet.</p> : (
          <ol>
            {highs.map((h, i) => (
              <li key={i}>
                <span><b>{h.score}/{h.total}</b> — {h.difficulty}</span>
                <span>{new Date(h.date).toLocaleString()}</span>
              </li>
            ))}
          </ol>
        )}
      </Card>
    </div>
  );
};

const Quiz = () => {
  const navigate = useNavigate();
  const { state } = useLocation();
  const difficulty = state?.difficulty || "easy";
  const amount = state?.amount || 10;

  const [questions, setQuestions] = useState([]);
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [timeLeft, setTimeLeft] = useState(30);
  const optionRefs = useRef([]);

  useEffect(() => {
    let url = difficulty === "mixed" ?
      `https://opentdb.com/api.php?amount=${amount}&type=multiple` :
      `https://opentdb.com/api.php?amount=${amount}&type=multiple&difficulty=${difficulty}`;

    fetch(url)
      .then((res) => res.json())
      .then((data) => {
        if (!data || data.response_code !== 0) throw new Error("Bad API response");
        setQuestions(normalize(data.results));
        setLoading(false);
      })
      .catch(() => {
        // Use local JSON fallback
        const pool = difficulty === "mixed" ? questionsData : questionsData.filter((q) => q.difficulty === difficulty);
        setQuestions(normalize(shuffle(pool).slice(0, amount)));
        setLoading(false);
      });
  }, [difficulty, amount]);

  useEffect(() => {
    if (loading || !questions.length) return;
    setTimeLeft(30);
    const id = setInterval(() => setTimeLeft((t) => t - 1), 1000);
    return () => clearInterval(id);
  }, [current, loading, questions.length]);

  useEffect(() => { if (timeLeft === 0) lockAndNext(); }, [timeLeft]);

  useEffect(() => { optionRefs.current[0]?.focus(); }, [current]);

  const selectAnswer = (value) => {
    const next = [...answers];
    next[current] = value;
    setAnswers(next);
  };

  const lockAndNext = () => current < questions.length - 1 ? setCurrent((c) => c + 1) : navigate("/results", { state: { questions, answers, difficulty } });
  const prev = () => setCurrent((c) => Math.max(0, c - 1));

  if (loading) return <Card><p>Loading…</p></Card>;
  if (error) return <Card><p>{error}</p></Card>;

  const q = questions[current];
  const selected = answers[current];

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <div>Difficulty: {difficulty}</div>
        <div>⏳ {timeLeft}s</div>
      </div>
      <Card>
        <ProgressBar current={current + 1} total={questions.length} />
        <h2>{q.question}</h2>
        <div className="options">
          {q.options.map((opt, idx) => (
            <button key={opt} ref={(el) => (optionRefs.current[idx] = el)} onClick={() => selectAnswer(opt)} className={`option-btn ${selected === opt ? "selected" : ""}`}>
              {opt}
            </button>
          ))}
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: "1rem" }}>
          <Button className="btn-secondary" onClick={prev} disabled={current === 0}>Previous</Button>
          <Button className={current === questions.length - 1 ? "btn-success" : "btn-primary"} onClick={lockAndNext} disabled={!selected && current < questions.length - 1}>{current === questions.length - 1 ? "Submit" : "Next"}</Button>
        </div>
      </Card>
    </div>
  );
};

const Results = () => {
  const navigate = useNavigate();
  const { state } = useLocation();
  const { questions = [], answers = [], difficulty = "mixed" } = state || {};

  const score = useMemo(() => questions.reduce((acc, q, i) => acc + (q.correct === answers[i] ? 1 : 0), 0), [questions, answers]);

  useEffect(() => { if (questions.length) saveHighScore({ score, total: questions.length, difficulty, date: Date.now() }); }, [questions.length, score, difficulty]);

  if (!questions.length) return <Card><p>No results.</p><Button className="btn-primary" onClick={() => navigate("/")}>Go Home</Button></Card>;

  return (
    <div>
      <Card>
        <h1>Results</h1>
        <p>You scored {score} / {questions.length}</p>
        {questions.map((q, i) => {
          const correct = q.correct;
          const user = answers[i];
          const isCorrect = user === correct;
          return (
            <div key={i} className={isCorrect ? "result-correct" : "result-wrong"}>
              <div>Q{i + 1}. {q.question}</div>
              <div>Your answer: {user ?? "(none)"}</div>
              <div>Correct: {correct}</div>
            </div>
          );
        })}
        <Button className="btn-primary" onClick={() => navigate("/")}>Restart Quiz</Button>
      </Card>
    </div>
  );
};

/********************** App Shell ************************/ 
export default function App() {
  return (
    <Router>
      <header>
        <div>⚡ Quiz App</div>
        <nav><a href="/">Home</a></nav>
      </header>
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/quiz" element={<Quiz />} />
          <Route path="/results" element={<Results />} />
        </Routes>
      </main>
      <footer>Built with React Hooks • Open Trivia DB • LocalStorage</footer>
    </Router>
  );
}
