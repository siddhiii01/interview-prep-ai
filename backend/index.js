import dotenv, { parse } from "dotenv";
dotenv.config();

import express from "express"
import cors from 'cors';
import { openai } from "./openai.js";
import { groq } from "./groq.js";

const app = express();

app.use(cors());
app.use(express.json());

app.post('/api/interview/get-question',async(req,res) => {
  const {experience,role,tech,level} = req.body;
  console.log("backedn data",experience,role,tech,level);

  if(!experience || !role || !tech.length) {
    return res.status(400).json({message:"Invalid data"});
  }

  const prompt = `You are an interviewer.
    Ask one interview question.
    Candidate Profile:
    - Experience: ${experience}
    - Role: ${role} 
    - Technologies: ${tech.join(", ")}
    - Level: ${level}
  `
  try {
    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [{role:"user",content:prompt}]
    })

    const question = completion.choices[0].message.content;
    res.json({question});
  } catch(error) {
    console.error("Ai failed to generate que",error);
    res.status(400).json({error: "AI failed to generate questions"})
  }
})

app.post('/api/interview/evaluate-answer',async(req,res) => {
  const {experience,role,level,question,answer} = req.body;
  console.log(req.body);
  if(!question || !answer) {
    return res.status(400).json({message:"Invalid data"});
  }

  const prompt = `You are a technical interviewer
    Candidate Profile:
    Experience: ${experience}
    Role: ${role}
    Question: ${question}
    Candidate Answer: ${answer}

    Current Difficulty Level: ${level}
    Evaluate Rules.
      - Score from 1-10
      - If score>=8 -> increase level
      - If score 5-7 -> keep same level
      - If score<=4 -> decrease level

    Return strict json: 
    {
      "score": number,
      "feedback": "short feedback",
      "level": "easy|medium|hard",
      "idealAnswer": "better imporved answer"
    }
  `
  try {
    const completion = await groq.chat.completions.create({
        model: "llama-3.3-70b-versatile",
        messages: [{role: "user",content: prompt}],
        temperature: 0.9
    })
    console.log(completion)
    let raw = completion.choices[0].message.content;
    raw = raw.replace(/```json|```/g,"").trim();

    const result = JSON.parse(raw)
    res.json(result);
  } catch(err) {
    console.error("Ai failed to evaluate answer",err);
    res.status(400).json({error: "AI failed to evaluate answer"})
  }
})

app.listen(3000,() => {
  console.log("Server running on port 3000")
})