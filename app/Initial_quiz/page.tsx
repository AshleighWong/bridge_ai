'use client'

import React, { useState, ChangeEvent } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { BackgroundBeams } from "@/components/ui/background-beams";
import { SparklesCore } from "@/components/ui/sparkles";
import { TextGenerateEffect } from "@/components/ui/text-generate-effect";
import { BackgroundGradient } from "@/components/ui/background-gradient";

interface QuizItem {
  question: string;
  answer: string;
}

const DiscoQuiz: React.FC = () => {
  const [history, setHistory] = useState<QuizItem[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState<string>("Are you more of a STEM, humanities, or art student? What are your hobbies?");
  const [answer, setAnswer] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [careerPath, setCareerPath] = useState<string>('');
  const [suggestedCareer, setSuggestedCareer] = useState<string | null>(null);
  const [careerExplanation, setCareerExplanation] = useState<string | null>(null);
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
          // Quiz is complete, calculate career choice
          const careerResponse = await fetch('/api/quiz', {
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

          const careerData = await careerResponse.json();
          if (careerResponse.ok) {
            setSuggestedCareer(careerData.career);
            setCareerExplanation(careerData.explanation);
            setIsQuizComplete(true);
          } else {
            throw new Error(careerData.error || 'Failed to calculate career choice');
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
      <BackgroundGradient className="rounded-[30px] max-w-[600px] p-1">
        <Card className="w-full bg-black/50 backdrop-blur-xl text-white border-none shadow-2xl">
          <CardHeader>
            <CardTitle className="text-3xl font-bold text-center">
              <TextGenerateEffect words="Lets get to know you! 🕺💃" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4 text-xl">{currentQuestion}</p>
            <Input
              type="text"
              placeholder="Your groovy answer"
              value={answer}
              onChange={handleAnswerChange}
              disabled={isLoading || isQuizComplete}
              className="bg-white/10 border-white/20 text-white placeholder-white/50"
            />
            {error && <p className="text-red-500 mt-2">{error}</p>}
            {isQuizComplete && (
              <div className="mt-4">
                <p className="text-2xl font-bold">Quiz Complete! 🎉</p>
                <p className="text-xl mt-2">Suggested Career: {suggestedCareer}</p>
                <p className="mt-2">{careerExplanation}</p>
              </div>
            )}
          </CardContent>
          <CardFooter>
            <Button 
              onClick={handleNextQuestion} 
              disabled={isLoading || isQuizComplete}
              className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold py-2 px-4 rounded-full transition-all duration-300 transform hover:scale-105"
            >
              {isLoading ? "Grooving..." : isQuizComplete ? "Disco's Over!" : "Lets Find Out"}
            </Button>
          </CardFooter>
        </Card>
      </BackgroundGradient>
    </div>
  );
};

export default DiscoQuiz;