import { Groq } from "groq-sdk";
import { NextRequest, NextResponse } from "next/server";


const groq = new Groq();


export async function POST(req: NextRequest) {
  console.log('API route called');
  let careerPath;
  try {
    const body = await req.json();
    careerPath = body.careerPath;
    console.log('Received career path:', careerPath);
  } catch (error) {
    console.error('Error parsing request body:', error);
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }


  if (!careerPath) {
    console.error('No career path provided');
    return NextResponse.json({ error: "Career path is required" }, { status: 400 });
  }


  try {
    console.log('Sending request to Groq');
    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: "You are a helpful career advisor."
        },
        {
          role: "user",
          content: `generate 7 important questions to assess the skill and level of me becoming a ${careerPath}. It should be questions with skills or knowledge that they can rate.`
        }
      ],
      model: "llama3-8b-8192",
      temperature: 0.5,
    });
   
    console.log('Received response from Groq');
    const content = completion.choices[0].message.content;
    if (!content) {
      throw new Error('No content received from Groq');
    }
    
    console.log('Groq response:', content);
    
    return NextResponse.json({ message: content });
  } catch (error) {
    console.error("Error generating message:", error);
    return NextResponse.json({ error: "Failed to generate message" }, { status: 500 });
  }
}



