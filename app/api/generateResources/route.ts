import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function POST(req: Request) {
  const { score, careerPath, history } = await req.json();

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    const prompt = `Given a career readiness score of ${score}% for someone pursuing a career in ${careerPath}, and the following quiz history:

${history.map((item: { question: string; answer: string }) => `Q: ${item.question}\nA: ${item.answer}`).join('\n\n')}

Provide a list of personalized resources, tips, and tricks to help them improve their skills and knowledge. Focus on addressing any weaknesses identified in their quiz responses and building upon their strengths. Include specific resources such as online courses, books, websites, and tools that would be beneficial for someone pursuing a career in ${careerPath}.

Format the response in Markdown, using headers (##, ###), bullet points, and links where appropriate. Make the content engaging and motivating, with a touch of disco flair to match the theme of the page. Avoid using asterisks (**) for emphasis, and instead rely on Markdown formatting. Ensure all links are properly formatted as [Link Text](URL).`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    return NextResponse.json({ resources: text });
  } catch (error) {
    console.error("Error generating resources:", error);
    return NextResponse.json({ error: "Failed to generate resources" }, { status: 500 });
  }
}