'use client'

import React from 'react';
import { motion } from 'framer-motion';
import { SparklesCore } from "@/components/ui/sparkles";
import { TextGenerateEffect } from "@/components/ui/text-generate-effect";
import { BackgroundBeams } from "@/components/ui/background-beams";
import { BackgroundGradient } from "@/components/ui/background-gradient";
import { WavyBackground } from "@/components/ui/wavy-background";
import { StickyScroll } from "@/components/ui/sticky-scroll-reveal";

const GradientButton = ({ children, onClick }: { children: React.ReactNode; onClick: () => void }) => (
  <BackgroundGradient className="rounded-[20px] max-w-[200px] p-1 text-white">
    <button 
      onClick={onClick} 
      className="w-full rounded-[20px] px-4 py-2 bg-black hover:bg-zinc-900 transition-colors"
    >
      {children}
    </button>
  </BackgroundGradient>
);

const projectGoals = [
  {
    title: "Analyze Job Market Data",
    description: "We use data from job markets and educational platforms to identify trends and opportunities.",
  },
  {
    title: "Identify Skill Shortages",
    description: "Our AI-driven solution analyzes and addresses skill gaps in the workforce.",
  },
  {
    title: "Provide Recommendations",
    description: "We offer tailored recommendations for upskilling or strategic hiring to bridge the gap.",
  },
  {
    title: "Empower Industries",
    description: "Our goal is to enhance workforce readiness and empower industries with AI-powered insights.",
  },
];

export default function Home() {
  return (
    <div className="relative w-full bg-black text-white overflow-x-hidden">
      {/* Hero Section */}
      <section className="relative h-screen">
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
          <BackgroundBeams />
        </div>

        <div className="relative z-10 h-full flex flex-col items-center justify-center">
          <motion.h1
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1 }}
            className="text-6xl font-bold mb-8"
          >
            AI for Future Skills: Bridging the Gap
          </motion.h1>

          <TextGenerateEffect 
            words="Enhance workforce readiness and empower industries with AI-powered insights!" 
            className="text-xl mb-12 text-center max-w-2xl"
          />

          <div className="flex space-x-4">
            <GradientButton onClick={() => console.log("Learn More clicked")}>
              Find where to start
            </GradientButton>
            <GradientButton onClick={() => console.log("Contact Us clicked")}>
              Find what is next
            </GradientButton>
          </div>
        </div>
      </section>

      {/* About Us Section */}
      <WavyBackground className="max-w-4xl mx-auto py-20">
        <h2 className="text-4xl font-bold mb-8 text-center">Who We Are</h2>
        <p className="text-xl text-center mb-8">
          We are three passionate college students dedicated to bridging the gap between education and industry needs. 
          Our mission is to create AI-driven solutions that analyze and address skill gaps in the workforce, 
          enhancing readiness and empowering industries for the future.
        </p>
      </WavyBackground>

      {/* Project Goals Section */}
      <section className="py-20">
        <h2 className="text-4xl font-bold mb-12 text-center">Our Project Goals</h2>
        <div className="max-w-6xl mx-auto px-4">
          <StickyScroll content={projectGoals} />
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 text-center">
        <h2 className="text-4xl font-bold mb-8">Ready to Bridge the Gap?</h2>
          <GradientButton onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            Get Started
          </GradientButton>
      </section>
    </div>
  );
}