import { useState } from "react"
import { MessageThreadCollapsible } from "../components/tambo/message-thread-collapsible";
import axios from "axios";

export function InterviewSetup() {
  const [step,setStep] = useState("start");
  const [messages,setMessages]=useState([]); //the msgs r stored locally tambo doesnt renders in ui 
  const [profile,setProfile] = useState({
    role: "",
    experience: "",
    tech: []
  })

  const startSetup = async() => {  
    setMessages([
      {
        role:"assistant",
        content: "Welcome! Let's personalize your interview practice.\nHow many years of experience do you have?"
      }
    ])

    setStep("experience");
  }

  const handleExprChange = async(e) => {
    const val = e.target.value;

    setProfile((prev) => ({
      ...prev,
      experience: val,
    }))

    setMessages((prev) => [
      ...prev,
      {role: "user",content:val},
      {role: "assistant",content: "Great! What role you are preparing for?"}
    ])

    setStep("role");
  }

  const handleRoleChange = async(e) => {
    const val = e.target.value;
  
    setProfile((prev) => ({
      ...prev,
      role: val,
    }));

    setMessages((prev) => [
      ...prev,
      { role: "user", content: val },
      {
        role: "assistant",
        content: "Nice choice! Which technologies are you most comfortable with?"
      }
    ]);

    setStep("tech")
  }

  const handleTechChange = async(e) => {
    const val = e.target.value;
    const checked = e.target.checked;

    setMessages((prev) => [
      ...prev,
      { role: "user", content: val }
    ])

    setProfile((prev) => ({
      ...prev,
      tech: checked 
        ? [...prev.tech,val] // add item
        : prev.tech.filter(t => t!==val)  // remove smae item
    }))
  }

  const handleSaveData = async() => {
    setMessages((prev) => [
      ...prev,
      {
        role: "assistant",
        content: `Great! I'll prepare questions for a ${profile.experience} ${profile.role} focusing on ${profile.tech.join(", ")}.`
      }
    ]);
    
    // frotend sends backend req with profile data
    try {
      const res = await axios.post('http://localhost:3000/api/interview/get-question',{
        experience:profile.experience,
        role: profile.role,
        tech: profile.tech,
        level: "easy"
      });
      console.log("backedn response",res);

      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: res.data.question }
      ]);
    } catch(error) {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Sorry! I couldn't generate question"
        }
      ]);
    }
  }

  return (
    <div style={{ padding: "24px", maxWidth: "800px", margin: "0 auto" }}>
      {step === "start" && (
        <button onClick={startSetup}>Start Interview Setup</button>
      )}

      {step!=="start" && <MessageThreadCollapsible/>}

      {step==="experience" && (
        <>
          <label htmlFor="">Select Experience</label>
          <select 
            style={{ marginTop: 16, padding: 8 }}
            onChange={handleExprChange}
            >
              <option value="">Select experience</option>
              <option value="0-1 years">0-1 years</option>
              <option value="1-3 years">1-3 years</option>
              <option value="3-5 years">3-5 years</option>
              <option value="5+ years">5+ years</option>
          </select>
        </>
      )}
       
      {step==="role" && (
        <>
          <label htmlFor="">Select Role</label>
        
          <select 
            style={{ marginTop: 16, padding: 8 }}
            onChange={handleRoleChange}
            >
              <option value="">Select Role</option>
              <option value="Frontend Developer">Frontend Developer</option>
              <option value="Backend Developer">Backend Developer</option>
              <option value="Full Stack Developer">Full Stack Developer</option>
          </select>
        </>
      )}

      {step==="tech" && (
        <div style={{ marginTop: 16 }}>
          {["React","Node","Express","Mongodb","JavaScript"].map((tech) => (
            <label key={tech}>
              <input type="checkbox" value={tech} onChange={handleTechChange}/>
              {tech}
            </label>
          ))
          }

          <button onClick={handleSaveData}>
            Start Practice
        </button>
        </div>
      )}
      
      
    </div>
  )
} 