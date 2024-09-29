import { NextResponse } from 'next/server';
import Groq from 'groq-sdk';

interface QuizItem {
  question: string;
  answer: string;
}

const groq = new Groq({
  apiKey: process.env.NEXT_PUBLIC_GROQ_API_KEY,
});

export async function POST(request: Request) {
  const { history }: { history: QuizItem[] } = await request.json();

  const prompt = `Given the following quiz history:
${history.map(item => `Q: ${item.question}\nA: ${item.answer}`).join('\n')}

Generate a new, engaging question that builds upon the previous questions and answers. The question should be challenging but not overly complex.`;

  try {
    const completion = await groq.chat.completions.create({
      messages: [{ role: 'user', content: prompt }],
      model: 'llama3-8b-8192',
    });

    console.log('Completion Response:', completion);

    const nextQuestion = completion.choices[0]?.message?.content || "Failed to generate a question. Please try again.";
    return NextResponse.json({ question: nextQuestion });
  } catch (error) {
    console.error('Error generating question:', error);
    return NextResponse.json({ message: 'Failed to generate a question' }, { status: 500 });
  }
}


