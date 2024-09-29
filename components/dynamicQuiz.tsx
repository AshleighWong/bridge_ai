'use client'
import React, { useState, ChangeEvent } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useRouter } from 'next/navigation';
import { BackgroundBeams } from "@/components/ui/background-beams";
import { SparklesCore } from "@/components/ui/sparkles";
import { TextGenerateEffect } from "@/components/ui/text-generate-effect";
import { BackgroundGradient } from "@/components/ui/background-gradient";

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

  const router = useRouter();

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

  const handleGoToResources = () => {
    router.push(`/resources?score=${careerReadinessScore}&careerPath=${encodeURIComponent(careerPath)}&history=${encodeURIComponent(JSON.stringify(history))}`);
  };

  return (
    <div className="relative w-full h-screen flex items-center justify-center bg-black overflow-hidden">
      <BackgroundBeams />
      <div className="absolute inset-0">
        <SparklesCore
          id="tsparticlesfullpage"
          background="transparent"
          minSize={0.6}
          maxSize={1.4}
          particleDensity={100}
          className="w-full h-full"
          particleColor="#FFFFFF"
        />
      </div>
      <BackgroundGradient className="rounded-[22px] max-w-md p-1">
        <Card className="w-full bg-black/50 backdrop-blur-xl text-white border-none shadow-2xl">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-center">
              <TextGenerateEffect words="Dynamic AI Quiz" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            {!isQuizComplete ? (
              <>
                <p className="mb-4">{currentQuestion}</p>
                <Input
                  type="text"
                  placeholder="Your answer"
                  value={answer}
                  onChange={handleAnswerChange}
                  disabled={isLoading}
                  className="bg-white/10 border-white/20 text-white placeholder-white/50"
                />
              </>
            ) : (
              <div className="mt-4">
                <p>Quiz Complete!</p>
                <p>Your Career Readiness Score: {careerReadinessScore}%</p>
                <p className="mt-2">{scoreExplanation}</p>
              </div>
            )}
            {error && <p className="text-red-500 mt-2">{error}</p>}
          </CardContent>
          <CardFooter className="flex flex-col gap-2">
            {!isQuizComplete ? (
              <Button 
                onClick={handleNextQuestion} 
                disabled={isLoading} 
                className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold py-2 px-4 rounded-full transition-all duration-300 transform hover:scale-105"
              >
                {isLoading ? "Loading..." : "Next Question"}
              </Button>
            ) : (
              <Button 
                onClick={handleGoToResources} 
                className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-bold py-2 px-4 rounded-full transition-all duration-300 transform hover:scale-105"
              >
                Go to Resources
              </Button>
            )}
          </CardFooter>
        </Card>
      </BackgroundGradient>
    </div>
  );
};

export default DynamicQuiz;