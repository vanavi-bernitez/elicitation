import { useState, useEffect, useRef } from "react";

const QUESTIONS = [
  {
    id: 1,
    question:
      "It's 2am. You can't sleep. What's the one album you reach for — and why that one?",
    placeholder:
      "Maybe it's the quiet comfort of it, or the way it matches the hour...",
  },
  {
    id: 2,
    question:
      "Think of a song that completely wrecked you emotionally. What was it about the moment — the production, the lyric, the silence before a note?",
    placeholder: "The specific detail matters more than the song title...",
  },
  {
    id: 3,
    question:
      "If a friend plays something at a gathering and you immediately think 'yes, they get it' — what does that music sound like?",
    placeholder: "Describe the texture, tempo, mood — not just genre...",
  },
  {
    id: 4,
    question:
      "Is there a beloved, critically acclaimed album you've genuinely tried to love but just... can't? What's missing for you?",
    placeholder: "Be honest — this reveals more than the music you do like...",
  },
  {
    id: 5,
    question:
      "When a song has great lyrics but the production feels wrong to you, can you still love it? Or does the sonic world have to be right first?",
    placeholder: "Think of an actual example if one comes to mind...",
  },
  {
    id: 6,
    question:
      "What's a genre or scene you don't usually listen to, but one artist or album from it pulled you in? What made it the exception?",
    placeholder: "The exception often reveals the real rule...",
  },
  {
    id: 7,
    question:
      "Do you tend to listen to albums as complete works, or do you hunt for individual songs? And does that feel like a choice or just how you're wired?",
    placeholder: "Neither is better — just honest...",
  },
  {
    id: 8,
    question:
      "Name a musician whose taste you trust completely — someone where you'd listen to anything they recommend without needing to know more. What earned that trust?",
    placeholder: "What quality in their work made you hand over that trust?",
  },
];

async function callClaude(messages, systemPrompt) {
  const response = await fetch("/api/anthropic/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": import.meta.env.VITE_ANTHROPIC_API_KEY,
      "anthropic-version": "2023-06-01",
      "anthropic-dangerous-direct-browser-access": "true",
    },

    body: JSON.stringify({
      model: import.meta.env.VITE_CLAUDE_MODEL,
      max_tokens: 1000,
      system: systemPrompt,
      messages,
    }),
  });
  const data = await response.json();
  return data.content?.[0]?.text || "";
}

function GrainOverlay() {
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        pointerEvents: "none",
        zIndex: 100,
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.4'/%3E%3C/svg%3E")`,
        opacity: 0.035,
      }}
    />
  );
}

function VinylSpinner({ spinning }) {
  return (
    <div
      style={{
        width: 56,
        height: 56,
        borderRadius: "50%",
        background: "radial-gradient(circle at 30% 30%, #3a2a1a, #1a0e06)",
        border: "2px solid #5c3d1e",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        animation: spinning ? "spin 3s linear infinite" : "none",
        flexShrink: 0,
        boxShadow: "0 0 20px rgba(180,100,30,0.3)",
      }}
    >
      <div
        style={{
          width: 14,
          height: 14,
          borderRadius: "50%",
          background: "radial-gradient(circle, #c87941, #7a4520)",
          border: "1px solid #8b5e3c",
        }}
      />
      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

function ProgressDots({ current, total }) {
  return (
    <div
      style={{
        display: "flex",
        gap: 8,
        justifyContent: "center",
        marginBottom: 32,
      }}
    >
      {Array.from({ length: total }).map((_, i) => (
        <div
          key={i}
          style={{
            width: i < current ? 20 : 8,
            height: 8,
            borderRadius: 4,
            background:
              i < current ? "#c87941" : i === current ? "#8b5e3c" : "#2a1a0e",
            transition: "all 0.4s ease",
            border: i === current ? "1px solid #c87941" : "none",
          }}
        />
      ))}
    </div>
  );
}

function QuestionCard({
  question,
  answer,
  onChange,
  onNext,
  isLast,
  isLoading,
}) {
  const textRef = useRef(null);

  useEffect(() => {
    if (textRef.current) textRef.current.focus();
  }, [question.id]);

  return (
    <div
      style={{
        animation: "fadeSlideIn 0.5s ease forwards",
      }}
    >
      <style>{`
        @keyframes fadeSlideIn {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: translateY(0); }
        }
        textarea:focus { outline: none; }
        textarea::placeholder { color: #5c3d1e; }
      `}</style>

      <div
        style={{
          fontSize: 11,
          letterSpacing: "0.2em",
          color: "#8b5e3c",
          fontFamily: "'Courier New', monospace",
          marginBottom: 20,
          textTransform: "uppercase",
        }}
      >
        Question {question.id} of {QUESTIONS.length}
      </div>

      <h2
        style={{
          fontFamily: "'Playfair Display', Georgia, serif",
          fontSize: "clamp(18px, 3vw, 24px)",
          color: "#e8d5b0",
          lineHeight: 1.5,
          fontWeight: 400,
          marginBottom: 28,
          fontStyle: "italic",
        }}
      >
        "{question.question}"
      </h2>

      <textarea
        ref={textRef}
        value={answer}
        onChange={(e) => onChange(e.target.value)}
        placeholder={question.placeholder}
        rows={5}
        style={{
          width: "100%",
          boxSizing: "border-box",
          background: "rgba(20, 10, 4, 0.6)",
          border: "1px solid #3a2010",
          borderBottom: "2px solid #c87941",
          color: "#e8d5b0",
          fontFamily: "'Crimson Text', Georgia, serif",
          fontSize: 17,
          lineHeight: 1.7,
          padding: "16px 18px",
          resize: "none",
          borderRadius: "4px 4px 0 0",
          transition: "border-color 0.2s",
        }}
        onFocus={(e) => (e.target.style.borderColor = "#e8a954")}
        onBlur={(e) => (e.target.style.borderColor = "#c87941")}
        onKeyDown={(e) => {
          if (e.key === "Enter" && e.metaKey && answer.trim().length > 10)
            onNext();
        }}
      />

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginTop: 20,
        }}
      >
        <span
          style={{
            fontSize: 11,
            color: "#4a2e14",
            fontFamily: "'Courier New', monospace",
          }}
        >
          ⌘ + Enter to continue
        </span>
        <button
          onClick={onNext}
          disabled={answer.trim().length < 10 || isLoading}
          style={{
            background:
              answer.trim().length >= 10 && !isLoading
                ? "linear-gradient(135deg, #c87941, #8b4513)"
                : "#1a0e06",
            color:
              answer.trim().length >= 10 && !isLoading ? "#fff5e6" : "#3a2010",
            border: "1px solid",
            borderColor:
              answer.trim().length >= 10 && !isLoading ? "#e8a954" : "#2a1408",
            padding: "12px 28px",
            fontFamily: "'Courier New', monospace",
            fontSize: 12,
            letterSpacing: "0.15em",
            cursor:
              answer.trim().length >= 10 && !isLoading
                ? "pointer"
                : "not-allowed",
            transition: "all 0.3s ease",
            borderRadius: 2,
          }}
        >
          {isLoading ? "thinking..." : isLast ? "BUILD MY PROFILE →" : "NEXT →"}
        </button>
      </div>
    </div>
  );
}

function TasteProfile({ profile, onEvaluate }) {
  const [input, setInput] = useState("");
  const [evaluation, setEvaluation] = useState("");
  const [loading, setLoading] = useState(false);

  // Judging new music
  const handleEvaluate = async () => {
    if (!input.trim()) return;
    setLoading(true);
    setEvaluation("");
    try {
      const result = await callClaude(
        [{ role: "user", content: `Evaluate this for me: "${input}"` }],
        `You are a music taste evaluator. Here is the user's taste profile:\n\n${profile}\n\nWhen the user gives you an album, artist, song, or playlist, evaluate whether it matches their taste profile. Be specific — reference actual qualities from their profile. Be honest if it won't land for them and explain why. Write 3-4 sentences, warm but direct. No bullet points. Write as if you're a friend who knows their taste deeply.`,
      );
      setEvaluation(result);
    } catch (e) {
      setEvaluation("Something went wrong. Try again.");
    }
    setLoading(false);
  };

  return (
    <div style={{ animation: "fadeSlideIn 0.6s ease forwards" }}>
      <style>{`
        @keyframes fadeSlideIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes glowPulse {
          0%, 100% { box-shadow: 0 0 20px rgba(200,121,65,0.2); }
          50% { box-shadow: 0 0 40px rgba(200,121,65,0.4); }
        }
      `}</style>

      <div
        style={{
          fontSize: 11,
          letterSpacing: "0.25em",
          color: "#8b5e3c",
          fontFamily: "'Courier New', monospace",
          marginBottom: 16,
          textTransform: "uppercase",
        }}
      >
        ✦ Your Taste Profile
      </div>

      <div
        style={{
          background:
            "linear-gradient(145deg, rgba(30,15,5,0.9), rgba(20,10,4,0.95))",
          border: "1px solid #3a2010",
          borderLeft: "3px solid #c87941",
          padding: "24px 28px",
          borderRadius: 4,
          marginBottom: 36,
          animation: "glowPulse 4s ease infinite",
        }}
      >
        <p
          style={{
            fontFamily: "'Crimson Text', Georgia, serif",
            fontSize: 17,
            lineHeight: 1.8,
            color: "#ddc99a",
            margin: 0,
            whiteSpace: "pre-wrap",
          }}
        >
          {profile}
        </p>
      </div>

      <div
        style={{
          fontSize: 11,
          letterSpacing: "0.25em",
          color: "#8b5e3c",
          fontFamily: "'Courier New', monospace",
          marginBottom: 14,
          textTransform: "uppercase",
        }}
      >
        ✦ Evaluate Something
      </div>

      <p
        style={{
          fontFamily: "'Crimson Text', Georgia, serif",
          color: "#8b7355",
          fontSize: 15,
          marginBottom: 16,
          fontStyle: "italic",
        }}
      >
        Drop an album, artist, song, or playlist — I'll tell you if it fits your
        taste.
      </p>

      <div style={{ display: "flex", gap: 10 }}>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleEvaluate()}
          placeholder="e.g. Sufjan Stevens – Illinois, or Beach House..."
          style={{
            flex: 1,
            background: "rgba(20,10,4,0.7)",
            border: "1px solid #3a2010",
            borderBottom: "2px solid #c87941",
            color: "#e8d5b0",
            fontFamily: "'Crimson Text', Georgia, serif",
            fontSize: 16,
            padding: "12px 16px",
            borderRadius: "4px 4px 0 0",
            outline: "none",
          }}
        />
        <button
          onClick={handleEvaluate}
          disabled={!input.trim() || loading}
          style={{
            background:
              input.trim() && !loading
                ? "linear-gradient(135deg, #c87941, #8b4513)"
                : "#1a0e06",
            color: input.trim() && !loading ? "#fff5e6" : "#3a2010",
            border: "1px solid",
            borderColor: input.trim() && !loading ? "#e8a954" : "#2a1408",
            padding: "12px 22px",
            fontFamily: "'Courier New', monospace",
            fontSize: 12,
            letterSpacing: "0.15em",
            cursor: input.trim() && !loading ? "pointer" : "not-allowed",
            borderRadius: 2,
            whiteSpace: "nowrap",
          }}
        >
          {loading ? "..." : "EVALUATE"}
        </button>
      </div>

      {evaluation && (
        <div
          style={{
            marginTop: 24,
            background: "rgba(200,121,65,0.07)",
            border: "1px solid #4a2e14",
            padding: "20px 24px",
            borderRadius: 4,
            animation: "fadeSlideIn 0.4s ease",
          }}
        >
          <p
            style={{
              fontFamily: "'Crimson Text', Georgia, serif",
              fontSize: 17,
              lineHeight: 1.8,
              color: "#ddc99a",
              margin: 0,
            }}
          >
            {evaluation}
          </p>
        </div>
      )}
    </div>
  );
}

export default function App() {
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState(Array(QUESTIONS.length).fill(""));
  const [phase, setPhase] = useState("intro"); // intro | questions | building | profile
  const [profile, setProfile] = useState("");
  const [spinning, setSpinning] = useState(false);

  const handleStart = () => {
    setPhase("questions");
    setSpinning(true);
  };

  const handleAnswer = (val) => {
    const updated = [...answers];
    updated[currentQ] = val;
    setAnswers(updated);
  };

  // Building profile
  const handleNext = async () => {
    if (currentQ < QUESTIONS.length - 1) {
      setCurrentQ(currentQ + 1);
    } else {
      setPhase("building");
      setSpinning(true);
      try {
        const qa = QUESTIONS.map(
          (q, i) => `Q: ${q.question}\nA: ${answers[i]}`,
        ).join("\n\n");
        const result = await callClaude(
          [
            {
              role: "user",
              content: `Here are my answers to 8 music questions:\n\n${qa}\n\nPlease write my taste profile.`,
            },
          ],
          `You are a music critic and psychologist of listening. Based on someone's answers to 8 deep questions about their music taste, write a 3-4 sentence "taste profile" — a portrait of what they truly value in music. Don't just list genres or artists. Identify the underlying values: what they seek emotionally, what production qualities matter, how they relate to albums vs songs, what they can't tolerate, and what earns their trust. Write it in second person ("You are someone who..."). Be precise and honest. This should feel like a friend who really listened.`,
        );
        setProfile(result);
        setPhase("profile");
      } catch (e) {
        setProfile(
          "Something went wrong building your profile. Please try again.",
        );
        setPhase("profile");
      }
      setSpinning(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        minWidth: "100vw",
        background:
          "radial-gradient(ellipse at 20% 50%, #1c0d04 0%, #0d0604 50%, #080402 100%)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "40px 20px",
        fontFamily: "Georgia, serif",
      }}
    >
      <GrainOverlay />

      <link
        href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;1,400&family=Crimson+Text:ital,wght@0,400;0,600;1,400&display=swap"
        rel="stylesheet"
      />

      {/* Ambient glow orbs */}
      <div
        style={{
          position: "fixed",
          top: "20%",
          left: "10%",
          width: 300,
          height: 300,
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(180,80,20,0.08), transparent 70%)",
          pointerEvents: "none",
        }}
      />
      <div
        style={{
          position: "fixed",
          bottom: "15%",
          right: "8%",
          width: 400,
          height: 400,
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(120,50,10,0.06), transparent 70%)",
          pointerEvents: "none",
        }}
      />

      <div
        style={{
          width: "100%",
          maxWidth: 620,
          position: "relative",
          zIndex: 1,
        }}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 16,
            marginBottom: 48,
          }}
        >
          <VinylSpinner spinning={spinning} />
          <div>
            <div
              style={{
                fontFamily: "'Playfair Display', Georgia, serif",
                fontSize: 22,
                color: "#c87941",
                letterSpacing: "0.05em",
                fontWeight: 400,
              }}
            >
              Listener
            </div>
            <div
              style={{
                fontSize: 11,
                letterSpacing: "0.2em",
                color: "#4a2e14",
                fontFamily: "'Courier New', monospace",
                textTransform: "uppercase",
              }}
            >
              A Music Taste Portrait
            </div>
          </div>
        </div>

        {/* Content */}
        {phase === "intro" && (
          <div style={{ animation: "fadeSlideIn 0.6s ease forwards" }}>
            <style>{`@keyframes fadeSlideIn { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:translateY(0); } }`}</style>
            <h1
              style={{
                fontFamily: "'Playfair Display', Georgia, serif",
                fontSize: "clamp(28px, 5vw, 42px)",
                color: "#e8d5b0",
                fontWeight: 400,
                lineHeight: 1.3,
                marginBottom: 20,
                fontStyle: "italic",
              }}
            >
              What kind of listener are you, really?
            </h1>
            <p
              style={{
                fontFamily: "'Crimson Text', Georgia, serif",
                fontSize: 17,
                color: "#8b7355",
                lineHeight: 1.8,
                marginBottom: 36,
              }}
            >
              Eight questions and honest answers about the music that shaped you
              — and the music that missed. At the end, you'll get a portrait of
              your taste, and a tool to evaluate anything new through that lens.
            </p>
            <button
              onClick={handleStart}
              style={{
                background: "linear-gradient(135deg, #c87941, #7a3d12)",
                color: "#fff5e6",
                border: "1px solid #e8a954",
                padding: "14px 36px",
                fontFamily: "'Courier New', monospace",
                fontSize: 12,
                letterSpacing: "0.2em",
                cursor: "pointer",
                borderRadius: 2,
                textTransform: "uppercase",
                boxShadow: "0 4px 30px rgba(200,121,65,0.25)",
                transition: "all 0.2s",
              }}
              onMouseEnter={(e) =>
                (e.target.style.boxShadow = "0 4px 40px rgba(200,121,65,0.45)")
              }
              onMouseLeave={(e) =>
                (e.target.style.boxShadow = "0 4px 30px rgba(200,121,65,0.25)")
              }
            >
              Begin →
            </button>
          </div>
        )}

        {phase === "questions" && (
          <div>
            <ProgressDots current={currentQ} total={QUESTIONS.length} />
            <QuestionCard
              key={currentQ}
              question={QUESTIONS[currentQ]}
              answer={answers[currentQ]}
              onChange={handleAnswer}
              onNext={handleNext}
              isLast={currentQ === QUESTIONS.length - 1}
              isLoading={false}
            />
          </div>
        )}

        {phase === "building" && (
          <div style={{ textAlign: "center", padding: "60px 0" }}>
            <VinylSpinner spinning={true} />
            <p
              style={{
                fontFamily: "'Crimson Text', Georgia, serif",
                fontSize: 18,
                color: "#8b7355",
                marginTop: 28,
                fontStyle: "italic",
              }}
            >
              Reading between the lines of your answers...
            </p>
            <p
              style={{
                fontFamily: "'Courier New', monospace",
                fontSize: 11,
                color: "#3a2010",
                letterSpacing: "0.15em",
                marginTop: 8,
              }}
            >
              THIS MAY TAKE A MOMENT
            </p>
          </div>
        )}

        {phase === "profile" && <TasteProfile profile={profile} />}
      </div>
    </div>
  );
}
