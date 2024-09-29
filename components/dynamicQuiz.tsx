'use client'
import React, { useState, ChangeEvent } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

interface QuizItem {
  question: string;
  answer: string;
}

const DynamicQuiz: React.FC = () => {
  const [history, setHistory] = useState<QuizItem[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState<string>("What career path are you interested in?");
  const [answer, setAnswer] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [careerPath, setCareerPath] = useState<string>('');

  const handleNextQuestion = async (): Promise<void> => {
    if (answer.trim() === '') return;

    const newHistory = [...history, { question: currentQuestion, answer }];
    setHistory(newHistory);
    setAnswer('');
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/quiz2generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          history: newHistory,
          careerPath: careerPath || answer // Use the first answer as the career path if not set
        }),
      });

      const data = await response.json();
      if (response.ok) {
        if (!careerPath) {
          setCareerPath(answer);
        }
        setCurrentQuestion(data.message);
      } else {
        throw new Error(data.error || 'Failed to generate a new question');
      }
    } catch (error) {
      console.error('Error getting next question:', error);
      setError(error instanceof Error ? error.message : String(error));
      setCurrentQuestion("An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAnswerChange = (e: ChangeEvent<HTMLInputElement>): void => {
    setAnswer(e.target.value);
  };

  return (
    <Card className="w-[350px]">
      <CardHeader>
        <CardTitle>Dynamic AI Quiz</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="mb-4">{currentQuestion}</p>
        <Input
          type="text"
          placeholder="Your answer"
          value={answer}
          onChange={handleAnswerChange}
          disabled={isLoading}
        />
        {error && <p className="text-red-500 mt-2">{error}</p>}
      </CardContent>
      <CardFooter>
        <Button onClick={handleNextQuestion} disabled={isLoading}>
          {isLoading ? "Loading..." : "Next Question"}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default DynamicQuiz;