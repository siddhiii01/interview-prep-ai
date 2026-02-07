// InterviewSetup.jsx - WORKING WITH TAMBO

import { useState } from "react";
import { TamboProvider, useTamboThread, useTamboThreadInput } from "@tambo-ai/react";
import axios from "axios";

const systemPrompt = `You are Tambo, a supportive technical interview coach.

When the user shares their answer, provide brief encouragement like:
- "Great effort! Let me evaluate that for you."
- "Nice work! I'm checking your answer now."

When they ask for the next question, say:
- "Getting your next question!"
- "Here comes your next challenge!"

Keep responses SHORT (1-2 sentences). Be friendly and motivating.`;

function ChatInterface() {
  const [started, setStarted] = useState(false);
  const [profile, setProfile] = useState({
    experience: "",
    role: "",
    tech: [],
    level: "easy",
  });
  const [currentQ, setCurrentQ] = useState("");
  const [waiting, setWaiting] = useState(false);
  const [messages, setMessages] = useState([]);

  const { value, setValue, submit, isPending } = useTamboThreadInput();

  // Add message to display
  const addMsg = (role, content) => {
    setMessages(prev => [...prev, { id: Date.now(), role, content }]);
  };

  // Get question from backend
  const getQuestion = async () => {
    try {
      const res = await axios.post("http://localhost:3000/api/interview/get-question", {
        experience: profile.experience,
        role: profile.role,
        tech: profile.tech,
        level: profile.level,
      });

      const q = res.data.question;
      setCurrentQ(q);
      setWaiting(true);

      // Display question
      addMsg("assistant", `Question (${profile.level.toUpperCase()})\n\n${q}\n\nType your answer below!`);

    } catch (err) {
      console.error(err);
      addMsg("assistant", "Backend error - check server on port 3000");
    }
  };

  // Evaluate answer
  const evaluate = async (ans) => {
    setWaiting(false);

    try {
      const res = await axios.post("http://localhost:3000/api/interview/evaluate-answer", {
        question: currentQ,
        answer: ans,
        experience: profile.experience,
        role: profile.role,
        level: profile.level,
      });

      const { score, feedback, level, idealAnswer } = res.data;
      setProfile(p => ({ ...p, level }));

      // Display evaluation
      const scoreColor = score >= 8 ? "green" : score >= 5 ? "yellow" : "red";
      const evalMsg = `${scoreColor} **Evaluation**\n\n**Score: ${score}/10**\n\n${feedback}\n\n **Better Answer:**\n${idealAnswer}\n\n**Next Level:** ${level.toUpperCase()}\n\n_Type "next" when ready!_`;
      
      addMsg("assistant", evalMsg);

    } catch (err) {
      console.error(err);
      addMsg("assistant", "Evaluation failed");
    }
  };

  // Handle send
  const handleSend = () => {
    if (!value.trim() || isPending) return;

    const text = value.trim();
    const lower = text.toLowerCase();

    // Add user message
    addMsg("user", text);
    
    // Also send to Tambo for encouragement
    submit();
    setValue("");

    // Process command
    setTimeout(() => {
      if (lower.includes("next") || lower.includes("ready")) {
        getQuestion();
      } else if (waiting) {
        evaluate(text);
      }
    }, 500);
  };

  // Start
  const handleStart = () => {
    if (!profile.experience || !profile.role || !profile.tech.length) {
      alert("Complete all fields");
      return;
    }

    setStarted(true);
    addMsg("assistant", `**Interview Started!**\n\nProfile: ${profile.experience}, ${profile.role}\nTech: ${profile.tech.join(", ")}\n\nGetting first question...`);
    
    setTimeout(() => getQuestion(), 1000);
  };

  return (
    <div style={{ maxWidth: "900px", margin: "0 auto", padding: "20px", fontFamily: "system-ui" }}>
      <h1 style={{ textAlign: "center", color: "#007bff" }}>Interview Coach</h1>
      <p style={{ textAlign: "center", color: "#666", marginBottom: "30px" }}>
        Powered by Tambo AI + Custom Backend
      </p>

      {!started && (
        <div style={{
          backgroundColor: "#f8f9fa",
          padding: "30px",
          borderRadius: "8px",
          border: "1px solid #dee2e6",
        }}>
          <h3 style={{ marginTop: 0 }}>Setup Profile</h3>

          <div style={{ marginBottom: "20px" }}>
            <label style={{ fontWeight: "600", display: "block", marginBottom: "8px" }}>Experience:</label>
            <select
              value={profile.experience}
              onChange={(e) => setProfile({ ...profile, experience: e.target.value })}
              style={{ padding: "10px", width: "100%", borderRadius: "5px", border: "1px solid #ced4da" }}
            >
              <option value="">Select...</option>
              <option value="0-1 years">0-1 years</option>
              <option value="1-3 years">1-3 years</option>
              <option value="3-5 years">3-5 years</option>
              <option value="5+ years">5+ years</option>
            </select>
          </div>

          <div style={{ marginBottom: "20px" }}>
            <label style={{ fontWeight: "600", display: "block", marginBottom: "8px" }}>Role:</label>
            <select
              value={profile.role}
              onChange={(e) => setProfile({ ...profile, role: e.target.value })}
              style={{ padding: "10px", width: "100%", borderRadius: "5px", border: "1px solid #ced4da" }}
            >
              <option value="">Select...</option>
              <option value="Frontend Developer">Frontend Developer</option>
              <option value="Backend Developer">Backend Developer</option>
              <option value="Full Stack Developer">Full Stack Developer</option>
            </select>
          </div>

          <div style={{ marginBottom: "25px" }}>
            <label style={{ fontWeight: "600", display: "block", marginBottom: "10px" }}>Technologies:</label>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
              {["React", "Node", "Express", "MongoDB", "JavaScript"].map((tech) => (
                <label
                  key={tech}
                  style={{
                    padding: "10px 15px",
                    backgroundColor: profile.tech.includes(tech) ? "#007bff" : "#fff",
                    color: profile.tech.includes(tech) ? "#fff" : "#212529",
                    border: "2px solid #007bff",
                    borderRadius: "6px",
                    cursor: "pointer",
                    fontWeight: "500",
                  }}
                >
                  <input
                    type="checkbox"
                    checked={profile.tech.includes(tech)}
                    onChange={(e) => {
                      setProfile(p => ({
                        ...p,
                        tech: e.target.checked
                          ? [...p.tech, tech]
                          : p.tech.filter(t => t !== tech)
                      }));
                    }}
                    style={{ marginRight: "8px" }}
                  />
                  {tech}
                </label>
              ))}
            </div>
          </div>

          <button
            onClick={handleStart}
            disabled={!profile.experience || !profile.role || !profile.tech.length}
            style={{
              padding: "14px",
              width: "100%",
              backgroundColor: (profile.experience && profile.role && profile.tech.length)
                ? "#28a745"
                : "#6c757d",
              color: "white",
              border: "none",
              borderRadius: "6px",
              fontWeight: "600",
              fontSize: "16px",
              cursor: (profile.experience && profile.role && profile.tech.length)
                ? "pointer"
                : "not-allowed",
            }}
          >
            Start Interview
          </button>
        </div>
      )}

      {started && (
        <>
          <div style={{
            height: "550px",
            overflowY: "auto",
            border: "1px solid #dee2e6",
            padding: "20px",
            borderRadius: "8px",
            backgroundColor: "#fff",
            marginBottom: "15px",
          }}>
            {messages.map((msg) => (
              <div
                key={msg.id}
                style={{
                  marginBottom: "20px",
                  display: "flex",
                  justifyContent: msg.role === "user" ? "flex-end" : "flex-start",
                }}
              >
                <div style={{
                  maxWidth: "85%",
                  padding: "12px 16px",
                  backgroundColor: msg.role === "user" ? "#007bff" : "#f1f3f5",
                  color: msg.role === "user" ? "white" : "#212529",
                  borderRadius: msg.role === "user" ? "18px 18px 4px 18px" : "18px 18px 18px 4px",
                  whiteSpace: "pre-wrap",
                  lineHeight: "1.6",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                }}>
                  {msg.content}
                </div>
              </div>
            ))}

            {isPending && (
              <div style={{
                padding: "12px 16px",
                backgroundColor: "#f1f3f5",
                borderRadius: "18px",
                color: "#6c757d",
                fontStyle: "italic",
                display: "inline-block",
              }}>
                Tambo is thinking...
              </div>
            )}
          </div>

          <div style={{ display: "flex", gap: "10px" }}>
            <input
              type="text"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && !isPending && handleSend()}
              placeholder={waiting ? "Type your answer..." : "Type 'next' or chat..."}
              disabled={isPending}
              style={{
                flex: 1,
                padding: "14px 18px",
                borderRadius: "25px",
                border: "1px solid #ced4da",
                fontSize: "15px",
              }}
            />
            <button
              onClick={handleSend}
              disabled={isPending || !value.trim()}
              style={{
                padding: "14px 28px",
                backgroundColor: (isPending || !value.trim()) ? "#6c757d" : "#007bff",
                color: "white",
                border: "none",
                borderRadius: "25px",
                cursor: (isPending || !value.trim()) ? "not-allowed" : "pointer",
                fontWeight: "600",
              }}
            >
              Send
            </button>
          </div>

          <p style={{ textAlign: "center", color: "#6c757d", fontSize: "13px", marginTop: "10px" }}>
            {waiting ? "Answer the question" : "Type 'next' for next question"}
          </p>
        </>
      )}
    </div>
  );
}

export function InterviewSetup() {
  const apiKey = import.meta.env.VITE_TAMBO_API_KEY;

  return (
    <TamboProvider apiKey={apiKey} systemPrompt={systemPrompt}>
      <ChatInterface />
    </TamboProvider>
  );
}

export default InterviewSetup;