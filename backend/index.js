import dotenv from "dotenv";
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

app.listen(3000,() => {
  console.log("Server running on port 3000")
})