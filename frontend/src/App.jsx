import {MessageThreadCollapsible} from "./components/tambo/message-thread-collapsible.tsx"
import { useState } from 'react';
import './App.css'

function App() {
  // const [step, setStep] = useState(1);
  // const [answers, setAnswers] = useState({
  //   experience: "",
  //   role: "",
  //   technologies: []
  // });

  return (
    <>
      {/* <div className="box">
    
    {step === 1 && (
      <>
        <p>Welcome! Let's personalize your interview practice.</p>
        <p>How many years of experience?</p>

        {["0-2", "3-5", "6-10", "10+"].map(exp => (
          <button
            key={exp}
            onClick={() => {
              setAnswers(a => ({ ...a, experience: exp }));
              setStep(2);
            }}
          >
            {exp}
          </button>
        ))}
      </>
    )}

    {step === 2 && (
      <>
        <p>What's your primary role?</p>

        {["Frontend", "Backend", "Full-stack"].map(role => (
          <button
            key={role}
            onClick={() => {
              setAnswers(a => ({ ...a, role }));
              setStep(3);
            }}
          >
            {role}
          </button>
        ))}
      </>
    )}

    {step === 3 && (
      <>
        <p>Which technologies?</p>

        {["Node.js", "Python", "Java", "PostgreSQL", "MongoDB"].map(tech => (
          <label key={tech}>
            <input
              type="checkbox"
              onChange={() =>
                setAnswers(a => ({
                  ...a,
                  technologies: a.technologies.includes(tech)
                    ? a.technologies.filter(t => t !== tech)
                    : [...a.technologies, tech]
                }))
              }
            />
            {tech}
          </label>
        ))}

        <button onClick={() => setStep(4)}>Continue</button>
      </>
    )}

    {step === 4 && (
      <>
        <p>Great! I'll customize questions for:</p>
        <ul>
          <li>{answers.experience} years</li>
          <li>{answers.role}</li>
          <li>{answers.technologies.join(", ")}</li>
        </ul>

        <button>Start Practice →</button>
      </>
    )}

      </div> */}

      <MessageThreadCollapsible/>
    </>
  )
}

export default App
