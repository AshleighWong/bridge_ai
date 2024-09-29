import { Groq } from "groq-sdk";
import { NextResponse } from "next/server";

interface QuizItem {
  question: string;
  answer: string;
}

const groq = new Groq();

export async function POST(req: Request) {
  console.log('API route called');
  
  let body;
  try {
    body = await req.json();
    console.log('Received body:', body);
  } catch (error) {
    console.error('Error parsing request body:', error);
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const { history, careerPath }: { history: QuizItem[], careerPath: string } = body;

  if (!careerPath) {
    console.error('No career path provided');
    return NextResponse.json({ error: "Career path is required" }, { status: 400 });
  }

  const prompt = `Given the following quiz history for someone interested in becoming a ${careerPath}:
  ${history.map(item => `Q: ${item.question}\nA: ${item.answer}`).join('\n')}

  Generate a new question that builds upon the previous questions and answers. There should be 7 important questions to assess the skill and level of the person becoming a ${careerPath}. The questions should focus on skills or knowledge that they can rate or describe.`;

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
          content: prompt,
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