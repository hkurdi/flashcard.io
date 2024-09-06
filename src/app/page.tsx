"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CardContent, Card } from "@/components/ui/card";
import { NavBar } from "@/components/ui/navbar";
import {
  BrainCircuit,
  CreditCard,
  Zap,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import axios from "axios";
import { getStripe } from "@/lib/utils";

export default function LandingPage() {
  const date = new Date();
  const [email, setEmail] = useState("");

  const { isSignedIn } = useUser();
  const router = useRouter();

  useEffect(() => {
    isSignedIn && router.push("/home");
  }, [isSignedIn, router]);


  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const emailParam = encodeURIComponent(email);
    window.location.href = `/sign-up?email=${emailParam}`;

    setEmail("");
  };

  return (
    <div className="flex flex-col min-h-screen">
      <NavBar />
      <main className="flex-1">
        <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center space-y-4 text-center">
              <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl/none">
                  Welcome to Flashcard.io
                </h1>
                <p className="mx-auto max-w-[700px] text-gray-500 md:text-xl dark:text-gray-400">
                  Revolutionize your learning with AI-powered flashcards.
                  Create, study, and master any subject with ease.
                </p>
              </div>
              <div className="w-full max-w-sm space-y-2">
                <form className="flex space-x-2" onSubmit={handleSubmit}>
                  <Input
                    className="max-w-lg flex-1"
                    placeholder="Enter your email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                  <Button type="submit">Get Started</Button>
                </form>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Start your free trial. No credit card required.
                </p>
              </div>
            </div>
          </div>
        </section>
        <section
          id="features"
          className="w-full py-12 md:py-24 lg:py-32 bg-gray-100 dark:bg-gray-800"
        >
          <div className="container px-4 md:px-6">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl text-center mb-12">
              Key Features
            </h2>
            <div className="grid gap-10 sm:grid-cols-2 md:grid-cols-3">
              <Card>
                <CardContent className="flex flex-col items-center space-y-4 p-6">
                  <BrainCircuit className="h-12 w-12 text-primary" />
                  <h3 className="text-xl font-bold">AI-Powered Creation</h3>
                  <p className="text-gray-500 dark:text-gray-400 text-center">
                    Generate flashcards instantly with our advanced AI
                    technology.
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="flex flex-col items-center space-y-4 p-6">
                  <Zap className="h-12 w-12 text-primary" />
                  <h3 className="text-xl font-bold">Smart Study Sessions</h3>
                  <p className="text-gray-500 dark:text-gray-400 text-center">
                    Optimize your learning with personalized study schedules and
                    adaptive algorithms.
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="flex flex-col items-center space-y-4 p-6">
                  <CreditCard className="h-12 w-12 text-primary" />
                  <h3 className="text-xl font-bold">Flexible Plans</h3>
                  <p className="text-gray-500 dark:text-gray-400 text-center">
                    Choose from various subscription options to fit your needs
                    and budget.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
        <section id="pricing" className="w-full py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl text-center mb-12">
              Pricing Plans
            </h2>
            <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
              <Card>
                <CardContent className="flex flex-col items-center space-y-4 p-6">
                  <h3 className="text-2xl font-bold">Pro</h3>
                  <p className="text-4xl font-bold">
                    $9.99<span className="text-xl font-normal">/month</span>
                  </p>
                  <ul className="space-y-2 text-center">
                    <li>100 AI-generated flashcards</li>
                  </ul>
                  <Button className="w-full" asChild>
                    <button onClick={() => router.push("/sign-up")}>Get Started</button>
                  </Button>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="flex flex-col items-center space-y-4 p-6">
                  <h3 className="text-2xl font-bold">Pro+</h3>
                  <p className="text-4xl font-bold">
                    $19.99<span className="text-xl font-normal">/month</span>
                  </p>
                  <ul className="space-y-2 text-center">
                    <li>Unlimited AI-generated flashcards</li>
                    <li>Priority support</li>
                  </ul>
                  <Button className="w-full" asChild>
                    <button onClick={() => router.push("/sign-up")}>Get Started</button>
                  </Button>
                </CardContent>
              </Card>
              <Card className="sm:col-span-2 lg:col-span-1">
                <CardContent className="flex flex-col items-center space-y-4 p-6">
                  <h3 className="text-2xl font-bold">Enterprise</h3>
                  <p className="text-4xl font-bold">Custom</p>
                  <ul className="space-y-2 text-center">
                    <li>All Pro features</li>
                    <li>Custom integrations</li>
                    <li>Dedicated account manager</li>
                    <li>24/7 premium support</li>
                  </ul>
                  <Button className="w-full" asChild>
                    <Link href="https://youtube.com/shorts/m4-dVOCSgdk?si=vviU7yrEQVi7mcqR">
                      Contact Sales
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
        <section
          id="about"
          className="w-full py-12 md:py-24 lg:py-32 bg-gray-100 dark:bg-gray-800"
        >
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center space-y-4 text-center">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">
                About Flashcard.io
              </h2>
              <p className="max-w-[900px] text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed dark:text-gray-400">
                Flashcard.io is a cutting-edge web application designed to
                revolutionize the way students and professionals create, manage,
                and study flashcards. Our mission is to enhance the learning
                experience through innovative technology and user-centric
                design.
              </p>
              <div className="flex flex-col gap-2 min-[400px]:flex-row justify-center">
                <Button className="w-64" onClick={() => window.scrollTo({top: 0})}>
                  Get Started
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>
      <footer className="flex flex-col gap-2 sm:flex-row py-6 w-full shrink-0 items-center px-4 md:px-6 border-t text-center justify-center">
        <p className="text-center text-xs text-gray-500 dark:text-gray-400">
          © {date.getFullYear()} Flashcard.io. All rights reserved.
        </p>
      </footer>
    </div>
  );
}
