import { useState } from "react";
import "./App.css";

function App() {
  const [files, setFiles] = useState([]);
  const [topic, setTopic] = useState("");
  const [studyMaterial, setStudyMaterial] = useState("");
  const [numQuestions, setNumQuestions] = useState(5);
  const [difficulty, setDifficulty] = useState("Medium");
  const [questions, setQuestions] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [solution, setSolution] = useState("");
  const [solutionLoading, setSolutionLoading] = useState(false);

  const [questionTypes, setQuestionTypes] = useState([
  "Multiple Choice",
  "Short Answer",
]);

  const handleFileChange = async (event) => {
  const selectedFiles = Array.from(event.target.files);

  if (selectedFiles.length === 0) return;

  setFiles(selectedFiles);

  const textFiles = selectedFiles.filter(
    (file) => file.type === "text/plain"
  );

  const contents = await Promise.all(
    textFiles.map(async (file) => {
      const text = await file.text();

      return `TOPIC: ${file.name.replace(/\.[^/.]+$/, "")}\n${text}`;
    })
  );

  setStudyMaterial(contents.join("\n\n--------------------\n\n"));

  if (selectedFiles.length === 1) {
    setTopic(selectedFiles[0].name.replace(/\.[^/.]+$/, ""));
  } else {
    setTopic("Mixed Topics");
  }
};

  const generateQuestionPaper = async () => {
    if (!topic.trim()) {
      setError("Please enter a topic or select a study material file.");
      return;
    }

    setLoading(true);
    setError("");
    setQuestions("");

    try {
      const response = await fetch("http://127.0.0.1:8000/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          topic: topic,
          difficulty: difficulty,
          num_questions: Number(numQuestions),
          question_types: questionTypes,
          study_material: studyMaterial,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Failed to generate questions.");
      }

      setQuestions(data.questions);
    } catch (error) {
      console.error(error);
      setError(
        "Could not connect to the backend. Make sure the FastAPI server is running."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleShowSolution = async () => {
  if (!questions) return;

  setSolutionLoading(true);
  setError("");

  try {
    const response = await fetch("http://127.0.0.1:8000/generate-solution", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        topic: topic,
        study_material: studyMaterial,
        question_paper: questions,
      }),
    });

    if (!response.ok) {
      throw new Error("Failed to generate solution");
    }

    const data = await response.json();
    setSolution(data.solution);
  } catch (err) {
    setError("Could not generate the answer key. Please try again.");
  } finally {
    setSolutionLoading(false);
  }
};

  return (
    <div className="app">
      <nav className="navbar">
        <div className="logo">
          <span className="logo-icon">🧠</span>
          <span>Eclipse</span>
        </div>

        <div className="nav-badge">
          GenAI Assessment Platform
        </div>
      </nav>

      <main className="main-container">

        <section className="hero">
          <div className="hero-badge">
            ✨ AI-Powered Question Generation
          </div>

          <h1>
            Turn your study material into
            <span> intelligent assessments.</span>
          </h1>

          <p>
            Upload your syllabus or study material and let AI create
            balanced, difficulty-aware practice questions for you.
          </p>
        </section>

        <section className="generator-card">

          <div className="upload-section">

            <div className="section-title">
              <span>📄</span>
              <div>
                <h2>Upload Study Material</h2>
                <p>Upload a PDF or TXT containing your study material.</p>
              </div>
            </div>

            <label className="upload-box">

              <input
                type="file"
                multiple
                accept=".pdf,.txt"
                onChange={handleFileChange}
              />

              <label className="upload-box">

  <input
    type="file"
    multiple
    accept=".txt"
    onChange={handleFileChange}
  />

  <div className="upload-icon">
    {files.length > 0 ? "✅" : "☁️"}
  </div>

  {files.length > 0 ? (
    <>
      <h3>
        {files.length === 1
          ? files[0].name
          : `${files.length} files selected`}
      </h3>

      <p>Study material selected successfully</p>

      {files.length > 1 && (
        <small>
          {files.map((file) => file.name).join(", ")}
        </small>
      )}
    </>
  ) : (
    <>
      <h3>Drop your study material here</h3>
      <p>or click to browse your files</p>
      <small>TXT • Multiple files supported</small>
    </>
  )}

</label>

            </label>
          </div>

          <div className="setting">
            <label>Topic / Subject</label>

            <input
              className="topic-input"
              type="text"
              placeholder="Example: Data Structures - Arrays"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
            />
          </div>

          <div className="settings-section">

            <div className="setting">
              <label>Number of Questions</label>

              <select
                value={numQuestions}
                onChange={(e) => setNumQuestions(e.target.value)}
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={15}>15</option>
                <option value={20}>20</option>
                <option value={25}>25</option>
              </select>
            </div>

            <div className="setting">
              <label>Difficulty</label>

              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value)}
              >
                <option value="Easy">Easy</option>
                <option value="Medium">Medium</option>
                <option value="Hard">Hard</option>
              </select>
            </div>

          </div>

          <div className="question-types">

            <h3>Question Types</h3>

            <div className="type-options">

              <label>
                <input type="checkbox" defaultChecked />
                <span>Multiple Choice</span>
              </label>

              <label>
                <input type="checkbox" defaultChecked />
                <span>Short Answer</span>
              </label>

              <label>
                <input type="checkbox" />
                <span>Descriptive</span>
              </label>

            </div>

          </div>

          <button
            className="generate-button"
            onClick={generateQuestionPaper}
            disabled={loading}
          >
            {loading
              ? "⏳ Generating Questions..."
              : "✨ Generate Question Paper"}
          </button>

          {error && (
            <div className="error-message">
              ❌ {error}
            </div>
          )}

        </section>

        {questions && (
          <section className="results-section">

            <div className="section-heading">
              <span>📝</span>
              <div>
                <h2>Generated Question Paper</h2>
                <p>
                  {topic} • {difficulty} • {numQuestions} Questions
                </p>
              </div>
            </div>

            <div className="paper-header">
  <h2>AI GENERATED QUESTION PAPER</h2>

  <div className="paper-details">
    <div>
      <strong>Subject:</strong> {topic}
    </div>

    <div>
      <strong>Topic:</strong> {topic}
    </div>

    <div>
      <strong>Difficulty:</strong> {difficulty}
    </div>

    <div>
      <strong>Questions:</strong> {numQuestions}
    </div>
  </div>

  <div className="student-details">
    <div>Name: ______________________________</div>
    <div>Register No: ________________________</div>
    <div>Date: ______________________________</div>
  </div>
</div>

            <div className="questions-box">
              <div className="question-content">{questions}</div>
            </div>

            <div className="result-actions">
  <button
    className="action-button"
    onClick={() => {
      const blob = new Blob([questions], { type: "text/plain" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");

      link.href = url;
      link.download = `${topic || "question-paper"}-question-paper.txt`;
      link.click();

      URL.revokeObjectURL(url);
    }}
  >
    📥 Download Question Paper
  </button>

   <button
    className="action-button regenerate-button"
    onClick={generateQuestionPaper}
    disabled={loading}
  >
    🔄 {loading ? "Regenerating..." : "Regenerate"}
  </button>
  <button
  className="action-button print-button"
  onClick={() => window.print()}
>
  🖨️ Print
</button>
<button
  className="action-button solution-button"
  onClick={handleShowSolution}
  disabled={solutionLoading}
>
  {solutionLoading ? "⏳ Generating Solution..." : "💡 Show Solution"}
</button>
</div>

          </section>
        )}
          
          {solution && (
  <section className="solution-section">
    <div className="section-heading">
      <span>💡</span>
      <div>
        <h2>Answer Key</h2>
        <p>AI-generated solutions for this question paper</p>
      </div>
    </div>

    <div className="solution-box">
      <div className="solution-content">{solution}</div>
    </div>
    <button
  className="action-button solution-download-button"
  onClick={() => window.print()}
>
  📥 Download Answer Key PDF
</button>
  </section>
)}
        

        <section className="unique-section">

          <div className="section-heading">
            <span>🚀</span>
            <div>
              <h2>More than a question generator</h2>
              <p>
                Our AI builds a smarter assessment experience.
              </p>
            </div>
          </div>

          <div className="feature-grid">

            <div className="feature-card">
              <div>📊</div>
              <h3>Exam Blueprint</h3>
              <p>
                Automatically balances questions across topics,
                difficulty levels and syllabus coverage.
              </p>
            </div>

            <div className="feature-card">
              <div>🧠</div>
              <h3>Bloom's Taxonomy</h3>
              <p>
                Questions can target different cognitive levels,
                from remembering to analyzing.
              </p>
            </div>

            <div className="feature-card">
              <div>🎯</div>
              <h3>Adaptive Learning</h3>
              <p>
                Analyze performance and generate personalized
                questions for weak areas.
              </p>
            </div>

          </div>

        </section>

      </main>

      <footer>
        Built for HACKSPACE 2026 • AI Question Paper Generator
      </footer>

    </div>
  );
}

export default App;