"use client";

import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import axios from "axios";
import { useState } from "react";
import { sendErrorAlert } from "@/components/ui/modals";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CardContent, Card } from "@/components/ui/card";
import {
  collection,
  doc,
  getDoc,
  setDoc,
  writeBatch,
} from "@firebase/firestore";
import { db } from "@/firebase";
import { NavBar } from "@/components/ui/navbar";
import { Loader } from "@/components/ui/loader";
import { Footer } from "@/components/ui/footer";

export interface Flashcard {
  front: string;
  back: string;
  numberOfCards: string;
}

export default function Generate() {
  const { isLoaded, isSignedIn, user } = useUser();
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [flashcardNumbers, setFlashcardNumbers] = useState("");

  const [flipped, setFlipped] = useState<boolean[]>([]);
  const [text, setText] = useState("");
  const [name, setName] = useState("");
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async () => {
    try {
      setLoading(true);
      setFlashcards([]);
      setFlipped([]);

      const response = await axios.post("/api/generate", { data: text, numFlashcards: flashcardNumbers });
      setFlashcards(response.data);
      setLoading(false);
    } catch (err: any) {
      console.error("Error: ", err);
      sendErrorAlert("Failed to generate flashcards. Please try again.");
      setLoading(false);
    }
  };

  const handleCardClick = (id: number) => {
    setFlipped((prev) => {
      const updatedFlipped = [...prev];
      updatedFlipped[id] = !updatedFlipped[id];
      return updatedFlipped;
    });
  };

  const handleOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const sanitizeName = (name: string): string => {
    return name
      .trim()
      .replace(/[^a-zA-Z0-9 ]/g, "")
      .replace(/\s+/g, "-");
  };

  const saveFlashcards = async () => {
    if (!name) {
      sendErrorAlert("Please enter a valid name.");
      handleClose();
      return;
    }

    const sanitizedName = sanitizeName(name);

    if (sanitizedName.length < 3 || sanitizedName.length > 50) {
      sendErrorAlert("Collection name must be between 3 and 50 characters.");
      return;
    }

    if (/inappropriate-word|bad-word/.test(sanitizedName.toLowerCase())) {
      sendErrorAlert("Collection name contains inappropriate words.");
      return;
    }

    let attempts = 0;
    const maxAttempts = 3;

    while (attempts < maxAttempts) {
      try {
        const batch = writeBatch(db);
        const userDocRef = doc(collection(db, "users"), user?.id);
        const docSnap = await getDoc(userDocRef);

        let collections: any[] = [];
        if (docSnap.exists()) {
          collections = docSnap.data().collections || [];
        }

        if (collections.find((f) => f.name === sanitizedName)) {
          sendErrorAlert("This flashcard collection name already exists.");
          return;
        }

        collections.push({
          name: sanitizedName,
          cardsCount: flashcards.length,
        });

        batch.set(userDocRef, { collections }, { merge: true });

        const colRef = collection(userDocRef, sanitizedName);
        flashcards.forEach((flashcard) => {
          const flashCardDocRef = doc(colRef);
          batch.set(flashCardDocRef, flashcard);
        });

        await batch.commit();
        handleClose();
        router.push("/home");
        break;
      } catch (error: any) {
        console.error("Error saving flashcards: ", error);
        if (error.code === "unavailable") {
          attempts++;
          if (attempts >= maxAttempts) {
            sendErrorAlert(
              "Failed to save flashcards due to network issues. Please try again later."
            );
            break;
          }
        } else {
          sendErrorAlert("An unexpected error occurred. Please try again.");
          break;
        }
      }
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <NavBar isLoggedIn={true} />
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Generate Flashcards</h1>
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="mb-4">
              <label
                htmlFor="text"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Enter your text to generate flashcards
              </label>
              <textarea
                id="text"
                rows={6}
                className="w-full p-2 border rounded-md"
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Enter your text here..."
              />
              <input
                id="numOfCards"
                className="w-full p-2 border rounded-md"
                type="number"
                value={flashcardNumbers || ""}
                placeholder="Number of flashcards..."
                onChange={(e) => setFlashcardNumbers(e.target.value)}
              />
            </div>
            <Button onClick={handleSubmit} disabled={!text || !flashcardNumbers || loading}>
              {loading ? <Loader size="small" /> : "Generate Flashcards"}
            </Button>
          </CardContent>
        </Card>

        {loading && <Loader size="large" />}

        {!loading && flashcards.length > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-4">Generated Flashcards</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {flashcards.map((flashcard, index) => (
                <Card
                  key={index}
                  className="cursor-pointer"
                  onClick={() => handleCardClick(index)}
                >
                  <CardContent className="p-6 h-48 flex items-center justify-center text-center overflow-y-scroll">
                    {flipped[index] ? flashcard.back : flashcard.front}
                  </CardContent>
                </Card>
              ))}
            </div>
            <div className="mt-6">
              <Input
                type="text"
                placeholder="Enter collection name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mb-4"
              />
              <Button onClick={handleOpen} disabled={!name || loading}>
                Save Flashcards
              </Button>
            </div>
          </div>
        )}

        {open && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <Card className="w-96">
              <CardContent className="p-6">
                <h3 className="text-xl font-bold mb-4">Save Flashcards</h3>
                <p className="mb-4">
                  Are you sure you want to save these flashcards?
                </p>
                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={handleClose}>
                    Cancel
                  </Button>
                  <Button onClick={saveFlashcards}>Save</Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}
