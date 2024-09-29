import { NextApiRequest, NextApiResponse } from 'next';
import Groq from 'groq-sdk';

interface QuizItem {
  question: string;
  answer: string;
}

const groq = new Groq({
  apiKey: process.env.NEXT_PUBLIC_GROQ_API_KEY,
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Only POST requests are allowed' });
  }

  const { history }: { history: QuizItem[] } = req.body;

  const prompt = `Given the following quiz history:
${history.map(item => `Q: ${item.question}\nA: ${item.answer}`).join('\n')}

Say a question and only a question with no extra commentary based off previous questions and answers. The goal is to narrow down career choices. Make it engaing. MAKE IT SHORT NOT A LONG RESPONSE`;

  try {
    const completion = await groq.chat.completions.create({
      messages: [{ role: 'user', content: prompt }],
      model: 'llama3-8b-8192',
    });

    console.log('Completion Response:', completion); // Log the response from GROQ

    const nextQuestion = completion.choices[0]?.message?.content || "Failed to generate a question. Please try again.";
    return res.status(200).json({ question: nextQuestion });
  } catch (error) {
    console.error('Error generating question:', error);
    return res.status(500).json({ message: 'Failed to generate a question' });
  }
}

