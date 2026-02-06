// InterviewSetup.jsx - Clean Architecture: Backend Logic + Tambo UI

import { useState } from "react";
import { TamboProvider, useTamboThread, useTamboThreadInput } from "@tambo-ai/react";
import { z } from "zod/v4";
import axios from "axios";

// ====== TAMBO COMPONENTS ======
function QuestionCard({ question, difficulty }) {
  return (
    <div style={{
      border: "2px solid #007bff",
      padding: "20px",
      borderRadius: "8px",
      backgroundColor: "#f0f7ff",
      marginTop: "10px",
    }}>
      <span style={{ color: "#0066cc", fontWeight: "bold" }}>
        LEVEL: {difficulty?.toUpperCase() || "EASY"}
      </span>
      <p style={{ marginTop: "10px", fontSize: "16px", lineHeight: "1.6" }}>{question}</p>
    </div>
  );
}

function FeedbackCard({ score, feedback, idealAnswer }) {
  const scorePercent = score * 10; // Convert 1-10 to percentage
  const color = score >= 8 ? "#4caf50" : score >= 5 ? "#ff9800" : "#f44336";
  
  return (
    <div style={{
      border: `2px solid ${color}`,
      padding: "20px",
      borderRadius: "8px",
      backgroundColor: score >= 8 ? "#e8f5e9" : score >= 5 ? "#fff3e0" : "#ffebee",
      marginTop: "10px",
    }}>
      <h4 style={{ color, margin: "0 0 10px 0" }}>Score: {score}/10</h4>
      <div style={{
        width: "100%",
        height: "8px",
        backgroundColor: "#ddd",
        borderRadius: "4px",
        marginBottom: "15px",
        overflow: "hidden",
      }}>
        <div style={{
          width: `${scorePercent}%`,
          height: "100%",
          backgroundColor: color,
          transition: "width 0.3s ease",
        }} />
      </div>
      <p style={{ marginBottom: "10px" }}><strong>Feedback:</strong> {feedback}</p>
      {idealAnswer && (
        <p style={{ 
          marginTop: "15px", 
          padding: "10px", 
          backgroundColor: "rgba(255,255,255,0.5)",
          borderRadius: "4px",
          fontSize: "14px"
        }}>
          <strong>💡 Ideal Answer:</strong> {idealAnswer}
        </p>
      )}
    </div>
  );
}

// ====== REGISTER COMPONENTS WITH TAMBO ======
const components = [
  {
    name: "QuestionCard",
    description: "Display interview question with difficulty level",
    component: QuestionCard,
    propsSchema: z.object({
      question: z.string(),
      difficulty: z.enum(["easy", "medium", "hard"]),
    }),
  },
  {
    name: "FeedbackCard",
    description: "Display score and feedback for candidate's answer",
    component: FeedbackCard,
    propsSchema: z.object({
      score: z.number().min(0).max(10),
      feedback: z.string(),
      idealAnswer: z.string().optional(),
    }),
  },
];

// ====== TAMBO SYSTEM PROMPT ======
const systemPrompt = `You are a supportive technical interview coach.

Your role:
1. Display questions using QuestionCard component
2. Show feedback using FeedbackCard component  
3. Encourage the candidate with friendly messages
4. Guide them through the interview practice

When you receive a question from the system, display it using:
<QuestionCard question="..." difficulty="easy|medium|hard" />

When you receive evaluation results, display using:
<FeedbackCard score={number} feedback="..." idealAnswer="..." />

Keep your text responses brief and encouraging. Let the components do the heavy lifting for displaying structured data.

Example flow:
- System sends question → You display QuestionCard + say "Here's your question! Take your time."
- User submits answer → Say "Great effort! Let me evaluate that..."
- System sends evaluation → You display FeedbackCard + say "Nice work! Ready for the next one?"`;

// ====== MAIN CHAT INTERFACE ======
function ChatInterface() {
  const [interviewStarted, setInterviewStarted] = useState(false);
  const [profile, setProfile] = useState({
    experience: "",
    role: "",
    tech: [],
    level: "easy",
  });
  const [currentQuestion, setCurrentQuestion] = useState("");
  const [waitingForAnswer, setWaitingForAnswer] = useState(false);

  const { thread } = useTamboThread();
  const { value, setValue, submit, isPending } = useTamboThreadInput();

  // ====== BACKEND CALLS ======
  const fetchQuestion = async () => {
    try {
      const res = await axios.post("http://localhost:3000/api/interview/get-question", {
        experience: profile.experience,
        role: profile.role,
        tech: profile.tech,
        level: profile.level,
      });

      const question = res.data.question;
      setCurrentQuestion(question);
      setWaitingForAnswer(true);

      // Send to Tambo to display
      const message = `SYSTEM: Display this question with QuestionCard component:
Question: ${question}
Difficulty: ${profile.level}

Then add a brief encouraging message.`;
      
      setValue(message);
      setTimeout(() => {
        submit();
        setTimeout(() => setValue(""), 100); // Clear input after submit
      }, 100);
      
    } catch (error) {
      console.error("Error fetching question:", error);
      setValue("⚠️ Could not fetch question. Make sure backend is running on port 3000.");
      setTimeout(() => {
        submit();
        setTimeout(() => setValue(""), 100);
      }, 100);
    }
  };

  const evaluateAnswer = async (answer) => {
    try {
      const res = await axios.post("http://localhost:3000/api/interview/evaluate-answer", {
        question: currentQuestion,
        answer: answer,
        experience: profile.experience,
        role: profile.role,
        level: profile.level,
      });

      const { score, feedback, level, idealAnswer } = res.data;
      
      // Update level based on backend evaluation
      setProfile(prev => ({ ...prev, level }));
      setWaitingForAnswer(false);

      // Send to Tambo to display
      const message = `SYSTEM: Display evaluation with FeedbackCard component:
Score: ${score}
Feedback: ${feedback}
IdealAnswer: ${idealAnswer || ""}

Then ask if they're ready for the next question (Level: ${level}).`;
      
      setValue(message);
      setTimeout(() => {
        submit();
        setTimeout(() => setValue(""), 100);
      }, 100);
      
    } catch (error) {
      console.error("Error evaluating answer:", error);
      setValue("⚠️ Could not evaluate answer. Please try again.");
      setTimeout(() => {
        submit();
        setTimeout(() => setValue(""), 100);
      }, 100);
    }
  };

  // ====== HANDLE USER INPUT ======
  const handleUserMessage = () => {
    if (!value.trim()) return;

    const msg = value.toLowerCase();

    // If waiting for answer, treat input as answer
    if (waitingForAnswer) {
      evaluateAnswer(value);
      submit();
      return;
    }

    // Check for "next question" intent
    if (msg.includes("next") || msg.includes("ready") || msg.includes("continue")) {
      fetchQuestion();
      return;
    }

    // Otherwise just send to Tambo for conversation
    submit();
  };

  // ====== PROFILE SETUP ======
  const handleStartInterview = () => {
    if (!profile.experience || !profile.role || profile.tech.length === 0) {
      alert("Please fill in all fields");
      return;
    }

    setInterviewStarted(true);

    const message = `Great! I'm starting your interview practice.

Profile:
- Experience: ${profile.experience}
- Role: ${profile.role}
- Technologies: ${profile.tech.join(", ")}

Let me get your first question...`;
    
    setValue(message);
    setTimeout(() => {
      submit();
      setTimeout(() => setValue(""), 100);
    }, 100);

    // Fetch first question
    setTimeout(() => fetchQuestion(), 1500);
  };

  return (
    <div style={{ maxWidth: "900px", margin: "0 auto", padding: "20px", fontFamily: "system-ui, sans-serif" }}>
      <h1 style={{ textAlign: "center", color: "#007bff" }}>🎯 Interview Coach</h1>
      <p style={{ textAlign: "center", color: "#666", marginBottom: "30px" }}>
        Powered by Tambo AI + Custom Backend
      </p>

      {/* PROFILE SETUP */}
      {!interviewStarted && (
        <div style={{ 
          backgroundColor: "#f8f9fa", 
          padding: "30px", 
          borderRadius: "8px",
          marginBottom: "20px",
          border: "1px solid #dee2e6"
        }}>
          <h3 style={{ marginTop: 0 }}>📋 Setup Your Profile</h3>
          
          <div style={{ marginBottom: "20px" }}>
            <label style={{ fontWeight: "600", display: "block", marginBottom: "8px" }}>
              Years of Experience:
            </label>
            <select 
              value={profile.experience}
              onChange={(e) => setProfile({ ...profile, experience: e.target.value })}
              style={{ 
                padding: "10px", 
                borderRadius: "5px", 
                border: "1px solid #ced4da", 
                width: "100%",
                fontSize: "14px"
              }}
            >
              <option value="">Select...</option>
              <option value="0-1 years">0-1 years</option>
              <option value="1-3 years">1-3 years</option>
              <option value="3-5 years">3-5 years</option>
              <option value="5+ years">5+ years</option>
            </select>
          </div>

          <div style={{ marginBottom: "20px" }}>
            <label style={{ fontWeight: "600", display: "block", marginBottom: "8px" }}>
              Target Role:
            </label>
            <select 
              value={profile.role}
              onChange={(e) => setProfile({ ...profile, role: e.target.value })}
              style={{ 
                padding: "10px", 
                borderRadius: "5px", 
                border: "1px solid #ced4da", 
                width: "100%",
                fontSize: "14px"
              }}
            >
              <option value="">Select...</option>
              <option value="Frontend Developer">Frontend Developer</option>
              <option value="Backend Developer">Backend Developer</option>
              <option value="Full Stack Developer">Full Stack Developer</option>
            </select>
          </div>

          <div style={{ marginBottom: "25px" }}>
            <label style={{ fontWeight: "600", display: "block", marginBottom: "8px" }}>
              Technologies (select at least one):
            </label>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
              {["React", "Node", "Express", "MongoDB", "JavaScript"].map((tech) => (
                <label 
                  key={tech} 
                  style={{ 
                    display: "flex", 
                    alignItems: "center", 
                    cursor: "pointer",
                    padding: "8px 12px",
                    backgroundColor: profile.tech.includes(tech) ? "#e7f3ff" : "#fff",
                    border: "1px solid #ced4da",
                    borderRadius: "5px",
                    transition: "all 0.2s"
                  }}
                >
                  <input
                    type="checkbox"
                    checked={profile.tech.includes(tech)}
                    onChange={(e) => {
                      setProfile(prev => ({
                        ...prev,
                        tech: e.target.checked 
                          ? [...prev.tech, tech]
                          : prev.tech.filter(t => t !== tech)
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
            onClick={handleStartInterview}
            disabled={!profile.experience || !profile.role || profile.tech.length === 0}
            style={{
              padding: "12px 30px",
              backgroundColor: profile.experience && profile.role && profile.tech.length > 0 
                ? "#28a745" 
                : "#6c757d",
              color: "white",
              border: "none",
              borderRadius: "5px",
              cursor: profile.experience && profile.role && profile.tech.length > 0 
                ? "pointer" 
                : "not-allowed",
              fontWeight: "600",
              width: "100%",
              fontSize: "16px"
            }}
          >
            🚀 Start Interview Practice
          </button>
        </div>
      )}

      {/* TAMBO CHAT THREAD */}
      {interviewStarted && (
        <>
          <div style={{
            height: "500px",
            overflowY: "auto",
            border: "1px solid #dee2e6",
            padding: "20px",
            borderRadius: "8px",
            backgroundColor: "#ffffff",
            marginBottom: "15px",
          }}>
            {thread.messages && thread.messages.length > 0 ? (
              <div>
                {thread.messages.map((message) => (
                  <div
                    key={message.id}
                    style={{
                      marginBottom: "20px",
                      display: "flex",
                      justifyContent: message.role === "user" ? "flex-end" : "flex-start",
                      flexDirection: "column",
                      alignItems: message.role === "user" ? "flex-end" : "flex-start",
                    }}
                  >
                    {/* Text Content */}
                    {message.content && !String(message.content).startsWith("SYSTEM:") && (
                      <div
                        style={{
                          maxWidth: "75%",
                          padding: "12px 16px",
                          backgroundColor: message.role === "user" ? "#007bff" : "#f8f9fa",
                          color: message.role === "user" ? "white" : "#212529",
                          borderRadius: message.role === "user" ? "18px 18px 4px 18px" : "18px 18px 18px 4px",
                          wordWrap: "break-word",
                          whiteSpace: "pre-wrap",
                          lineHeight: "1.5",
                          boxShadow: "0 1px 2px rgba(0,0,0,0.1)",
                        }}
                      >
                        {Array.isArray(message.content)
                          ? message.content.map((part) => (part.type === "text" ? part.text : "")).join("")
                          : String(message.content)}
                      </div>
                    )}

                    {/* Rendered Component (QuestionCard/FeedbackCard) */}
                    {message.renderedComponent && (
                      <div style={{ width: "100%", maxWidth: "85%" }}>
                        {message.renderedComponent}
                      </div>
                    )}
                  </div>
                ))}

                {isPending && (
                  <div style={{
                    padding: "12px 16px",
                    backgroundColor: "#f8f9fa",
                    borderRadius: "18px",
                    color: "#6c757d",
                    fontStyle: "italic",
                    display: "inline-block",
                  }}>
                    ⏳ Thinking...
                  </div>
                )}
              </div>
            ) : (
              <div style={{ 
                color: "#adb5bd", 
                textAlign: "center", 
                paddingTop: "180px",
                fontSize: "14px" 
              }}>
                Chat will appear here...
              </div>
            )}
          </div>

          {/* INPUT AREA */}
          <div style={{ display: "flex", gap: "10px" }}>
            <input
              type="text"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && !isPending && handleUserMessage()}
              placeholder={waitingForAnswer ? "Type your answer..." : "Type 'next' for next question or chat..."}
              disabled={isPending}
              style={{
                flex: 1,
                padding: "12px 16px",
                borderRadius: "25px",
                border: "1px solid #ced4da",
                fontSize: "14px",
                outline: "none",
              }}
            />
            <button
              onClick={handleUserMessage}
              disabled={isPending || !value.trim()}
              style={{
                padding: "12px 24px",
                backgroundColor: isPending || !value.trim() ? "#6c757d" : "#007bff",
                color: "white",
                border: "none",
                borderRadius: "25px",
                cursor: isPending || !value.trim() ? "not-allowed" : "pointer",
                fontWeight: "600",
                fontSize: "14px",
              }}
            >
              {waitingForAnswer ? "Submit" : "Send"}
            </button>
          </div>
        </>
      )}
    </div>
  );
}

// ====== APP WRAPPER ======
export function InterviewSetup() {
  const apiKey = import.meta.env.VITE_TAMBO_API_KEY;

  return (
    <TamboProvider apiKey={apiKey} components={components} systemPrompt={systemPrompt}>
      <ChatInterface />
    </TamboProvider>
  );
}

export default InterviewSetup;