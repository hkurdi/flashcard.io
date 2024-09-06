"use client";

import { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { collection, doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "@/firebase";
import { NavBar } from "@/components/ui/navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";
import { Loader } from "@/components/ui/loader";
import { Footer } from "@/components/ui/footer";

interface Flashcard {
  name: string;
  cardsCount: number;
}

export default function Home() {
  const { isLoaded, isSignedIn, user } = useUser();
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const router = useRouter();

  useEffect(() => {
    async function getFlashcards() {
      if (!user) return;
      const docRef = doc(collection(db, "users"), user.id);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const collections = docSnap.data().collections || [];
        setFlashcards(collections);
      } else {
        await setDoc(docRef, { flashcards: [] });
      }
    }
    getFlashcards();
  }, [user]);

  const handleCardClick = (id: string) => {
    router.push(`/study?id=${id}`);
  };

  if (!isLoaded || !isSignedIn) {
    return <Loader size="large" />;
  }

  return (
    <div className="relative min-h-screen bg-background">
      <NavBar isLoggedIn={true} isNormal={false} />

      <main className="container mx-auto px-4 py-8">
        <section className="mb-12">
          <h1 className="text-4xl font-bold mb-2">
            Welcome back{user?.firstName ? `, ${user?.firstName}` : "!"}
          </h1>
          <p className="text-xl text-muted-foreground">
            Ready to study your flashcards?
          </p>
        </section>

        <section>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-semibold">
              Your Flashcard Collections
            </h2>
            <Button asChild>
              <Link href="/generate">Create New Collection</Link>
            </Button>
          </div>

          {flashcards.length === 0 ? (
            <Card>
              <CardContent className="p-6">
                <p className="text-center text-muted-foreground">
                  You don't have any flashcard collections yet. Start by
                  creating one!
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {flashcards.map((flashcard, index) => (
                <Card
                  key={index}
                  className="hover:shadow-lg transition-shadow duration-300"
                >
                  {(() => {
                    console.log(flashcards);
                    return null; 
                  })()}{" "}
                  <CardContent className="p-6">
                    <h3 className="text-xl font-semibold mb-2">
                      {flashcard.name || "Untitled Collection"}
                    </h3>
                    <p className="text-muted-foreground mb-4">
                      {flashcard.cardsCount} cards
                    </p>
                    <Button
                      onClick={() => handleCardClick(flashcard.name)}
                      variant="outline"
                      className="w-full"
                    >
                      Study Now
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </section>
      </main>
      <Footer />
    </div>
  );
}
