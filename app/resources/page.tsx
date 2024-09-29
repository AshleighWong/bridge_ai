'use client'
import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { useSearchParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SparklesCore } from "@/components/ui/sparkles";
import { AnimatedTooltip } from "@/components/ui/animated-tooltip";
import { BackgroundBeams } from "@/components/ui/background-beams";
import ReactMarkdown from 'react-markdown';

const ResourcesPage = () => {
  const searchParams = useSearchParams();
  const score = searchParams.get('score');
  const careerPath = searchParams.get('careerPath');
  const historyParam = searchParams.get('history');
  const [resources, setResources] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchResources = async () => {
      try {
        const history = historyParam ? JSON.parse(decodeURIComponent(historyParam)) : [];
        const response = await fetch('/api/generateResources', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ score, careerPath, history }),
        });
        const data = await response.json();
        setResources(data.resources);
      } catch (error) {
        console.error('Error fetching resources:', error);
        setResources('Failed to load resources. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchResources();
  }, [score, careerPath, historyParam]);

  return (
    <div className="min-h-screen relative w-full bg-black flex flex-col items-center justify-center overflow-hidden rounded-md p-4">
      <BackgroundBeams />
      <div className="w-full absolute inset-0 h-screen">
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
      <Card className="w-full max-w-4xl bg-black/50 text-white z-10">
        <CardHeader>
          <CardTitle className="text-4xl font-bold text-center mb-4 bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-pink-500 to-red-500">
            Your {careerPath} Resources
          </CardTitle>
          <div className="flex justify-center mb-8">
            <AnimatedTooltip
              items={[
                {
                  id: 1,
                  name: `${score}% Ready`,
                  designation: "Career Readiness Score",
                  image: (
                    <Image
                      src={`https://api.dicebear.com/7.x/shapes/svg?seed=${score}`}
                      alt="Career Readiness Score"
                      width={100}
                      height={100}
                    />
                  ),
                },
              ]}
            />
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-center text-xl animate-pulse bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-green-500 to-yellow-500">
              Loading your personalized resources...
            </p>
          ) : (
            <div className="prose prose-invert max-w-none">
              <ReactMarkdown 
                components={{
                  a: ({node, ...props}) => <a {...props} className="text-blue-400 hover:text-blue-300 underline" target="_blank" rel="noopener noreferrer" />,
                  p: ({node, ...props}) => <p {...props} className="text-lg leading-relaxed mb-4 text-gray-200" />,
                  h1: ({node, ...props}) => <h1 {...props} className="text-3xl font-bold mb-4 text-pink-400" />,
                  h2: ({node, ...props}) => <h2 {...props} className="text-2xl font-semibold mb-3 text-purple-400" />,
                  h3: ({node, ...props}) => <h3 {...props} className="text-xl font-semibold mb-2 text-blue-400" />,
                  ul: ({node, ...props}) => <ul {...props} className="list-disc list-inside mb-4" />,
                  li: ({node, ...props}) => <li {...props} className="text-gray-300 mb-2" />,
                }}
              >
                {resources}
              </ReactMarkdown>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ResourcesPage;