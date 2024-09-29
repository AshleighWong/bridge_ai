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
  const [careerReadinessScore, setCareerReadinessScore] = useState<number | null>(null);
  const [scoreExplanation, setScoreExplanation] = useState<string | null>(null);
  const [isQuizComplete, setIsQuizComplete] = useState<boolean>(false);
  const [questionQueue, setQuestionQueue] = useState<string[]>([]);

  const handleNextQuestion = async (): Promise<void> => {
    if (answer.trim() === '') return;

    const newHistory = [...history, { question: currentQuestion, answer }];
    setHistory(newHistory);
    setAnswer('');
    setIsLoading(true);
    setError(null);

    try {
      if (!careerPath) {
        setCareerPath(answer);
        const response = await fetch('/api/quiz2generate', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            history: newHistory,
            careerPath: answer,
            calculateScore: false
          }),
        });

        const data = await response.json();
        if (response.ok) {
          setQuestionQueue(data.questions);
          setCurrentQuestion(data.questions[0]);
        } else {
          throw new Error(data.error || 'Failed to generate questions');
        }
      } else {
        if (questionQueue.length > 1) {
          setCurrentQuestion(questionQueue[1]);
          setQuestionQueue(questionQueue.slice(1));
        } else {
          // Quiz is complete, calculate score
          const scoreResponse = await fetch('/api/quiz2generate', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              history: newHistory,
              careerPath: careerPath,
              calculateScore: true
            }),
          });

          const scoreData = await scoreResponse.json();
          if (scoreResponse.ok) {
            setCareerReadinessScore(scoreData.score);
            setScoreExplanation(scoreData.explanation);
            setIsQuizComplete(true);
          } else {
            throw new Error(scoreData.error || 'Failed to calculate score');
          }
        }
      }
    } catch (error) {
      console.error('Error:', error);
      setError(error instanceof Error ? error.message : String(error));
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
          disabled={isLoading || isQuizComplete}
        />
        {error && <p className="text-red-500 mt-2">{error}</p>}
        {isQuizComplete && (
          <div className="mt-4">
            <p>Quiz Complete!</p>
            <p>Your Career Readiness Score: {careerReadinessScore}%</p>
            <p className="mt-2">{scoreExplanation}</p>
          </div>
        )}
      </CardContent>
      <CardFooter>
        <Button onClick={handleNextQuestion} disabled={isLoading || isQuizComplete}>
          {isLoading ? "Loading..." : isQuizComplete ? "Quiz Complete" : "Next Question"}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default DynamicQuiz;


