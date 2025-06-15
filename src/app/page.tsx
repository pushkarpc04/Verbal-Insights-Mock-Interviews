import React from "react";
import { Button } from "@/components/ui/button";
import { Icons } from "@/components/icons";
import Link from "next/link";
import Image from "next/image";

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="container mx-auto px-4 sm:px-6 py-6 flex justify-between items-center">
        <Link href="/" className="flex items-center gap-2 text-primary">
          <Icons.logo className="h-8 w-8" />
          <span className="text-2xl font-semibold font-headline">Verbal Insights</span>
        </Link>
        <nav className="space-x-4">
          <Button variant="ghost" asChild>
            <Link href="/login">Log In</Link>
          </Button>
          <Button asChild>
            <Link href="/signup">Sign Up</Link>
          </Button>
        </nav>
      </header>

      <main className="flex-1">
        <section className="py-16 md:py-24 lg:py-32 bg-gradient-to-br from-background to-secondary/30">
          <div className="container mx-auto px-4 sm:px-6 text-center">
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold font-headline tracking-tight text-foreground">
              Ace Your Interviews with AI-Powered Coaching
            </h1>
            <p className="mt-6 max-w-2xl mx-auto text-lg sm:text-xl text-muted-foreground">
              Verbal Insights helps you practice, get instant feedback, and track your progress to land your dream job.
            </p>
            <div className="mt-10 flex justify-center gap-4">
              <Button size="lg" asChild className="bg-primary hover:bg-primary/90 text-primary-foreground">
                <Link href="/dashboard">
                  Get Started Free <Icons.next className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="#features">Learn More</Link>
              </Button>
            </div>
          </div>
        </section>

        <section id="features" className="py-16 md:py-24">
          <div className="container mx-auto px-4 sm:px-6">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold font-headline">Features Designed for Your Success</h2>
              <p className="mt-4 text-muted-foreground">
                Everything you need to prepare and excel in your interviews.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[
                { icon: "generate", title: "AI Question Generation", description: "Tailored questions based on job descriptions." , dataAiHint: "AI brain"},
                { icon: "mic", title: "Answer Recording", description: "Capture audio and text of your responses." , dataAiHint: "microphone recording"},
                { icon: "analysis", title: "Sentiment Analysis", description: "Evaluate tone, confidence, and delivery." , dataAiHint: "data chart"},
                { icon: "feedback", title: "AI Coaching", description: "Personalized advice to improve answers." , dataAiHint: "lightbulb idea"},
                { icon: "target", title: "Keyword Relevance", description: "Align your answers with job requirements." , dataAiHint: "target bullseye"},
                { icon: "questionSet", title: "Mock Interviews", description: "Simulate real interview scenarios." , dataAiHint: "checklist tasks"},
              ].map((feature) => (
                <div key={feature.title} className="p-6 bg-card rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300">
                  <div className="flex items-center justify-center h-12 w-12 rounded-full bg-primary/10 text-primary mb-4">
                    {React.createElement(Icons[feature.icon as keyof typeof Icons] || Icons.ai, { className: "h-6 w-6" })}
                  </div>
                  <h3 className="text-xl font-semibold font-headline mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
        
        <section className="py-16 md:py-24 bg-secondary/30">
          <div className="container mx-auto px-4 sm:px-6">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-3xl font-bold font-headline mb-6">Ready to Impress Your Next Interviewer?</h2>
                <p className="text-lg text-muted-foreground mb-8">
                  Join thousands of candidates who have boosted their confidence and performance with Verbal Insights.
                  Start your journey to interview mastery today.
                </p>
                <Button size="lg" asChild className="bg-primary hover:bg-primary/90 text-primary-foreground">
                  <Link href="/dashboard">
                    Start Practicing Now <Icons.next className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
              </div>
              <div className="rounded-xl overflow-hidden shadow-2xl">
                 <Image 
                  src="https://placehold.co/600x400.png" 
                  alt="Mock interview interface" 
                  width={600} 
                  height={400}
                  className="w-full h-auto"
                  data-ai-hint="interview professional"
                />
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="py-8 border-t">
        <div className="container mx-auto px-4 sm:px-6 text-center text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} Verbal Insights. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
