"use client";

import { Loader } from "@/components/ui/loader";
import { db } from "@/firebase";
import { useUser } from "@clerk/nextjs";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  writeBatch,
} from "@firebase/firestore";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, ArrowRight, CircleX, RotateCcw, Edit } from "lucide-react";
import Link from "next/link";
import { Footer } from "@/components/ui/footer";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export interface Flashcard {
  front: string;
  back: string;
}

export default function Study() {
  const { isLoaded, isSignedIn, user } = useUser();
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [flipped, setFlipped] = useState<boolean[]>([]);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [newCollectionName, setNewCollectionName] = useState("");
  const router = useRouter();

  const searchParams = useSearchParams();
  const searchID = searchParams.get("id");

  useEffect(() => {
    async function getFlashcardCollection() {
      if (!user || !searchID) return;

      const userDocRef = doc(collection(db, "users"), user.id);
      const colRef = collection(userDocRef, searchID);
      const docs = await getDocs(colRef);

      if (docs.empty) {
        console.error("No flashcards found for this collection.");
        return;
      }

      const flashcardsArray: Flashcard[] = [];
      docs.forEach((doc) => {
        const data = doc.data();
        console.log(data);
        flashcardsArray.push({ front: data.front, back: data.back });
      });

      setFlashcards(flashcardsArray);
      setFlipped(new Array(flashcardsArray.length).fill(false));
    }
    getFlashcardCollection();
  }, [user, searchID]);

  const handleCardClick = () => {
    setFlipped((prev) => {
      const updatedFlipped = [...prev];
      updatedFlipped[currentCardIndex] = !updatedFlipped[currentCardIndex];
      return updatedFlipped;
    });
  };

  const handleNextCard = () => {
    if (currentCardIndex < flashcards.length - 1) {
      setCurrentCardIndex(currentCardIndex + 1);
      setProgress(((currentCardIndex + 1) / flashcards.length) * 100);
    }
  };

  const handlePrevCard = () => {
    if (currentCardIndex > 0) {
      setCurrentCardIndex(currentCardIndex - 1);
      setProgress(((currentCardIndex - 1) / flashcards.length) * 100);
    }
  };

  const handleRestart = () => {
    setCurrentCardIndex(0);
    setFlipped(new Array(flashcards.length).fill(false));
    setProgress(0);
  };

  const handleDeleteCollection = async () => {
    if (!user || !searchID) return;
  
    try {
      const userDocRef = doc(collection(db, "users"), user.id);
      const colRef = collection(userDocRef, searchID);
      const docs = await getDocs(colRef);
  
      const batch = writeBatch(db);
      docs.forEach((doc) => {
        batch.delete(doc.ref);
      });
      await batch.commit();
  
      const docSnap = await getDoc(userDocRef);
      if (docSnap.exists()) {
        const collections = docSnap.data().collections || [];
        const updatedCollections = collections.filter(
          (col: any) => col.name !== searchID
        );
        await setDoc(
          userDocRef,
          { collections: updatedCollections },
          { merge: true }
        );
      }
  
      setIsDeleteModalOpen(false);
      router.push("/home");
    } catch (error) {
      console.error("Error deleting collection: ", error);
      setIsDeleteModalOpen(false); 
    }
  };
  
  const handleEditName = async () => {
    if (!user || !searchID || !newCollectionName || newCollectionName.trim() === "") return;
  
    try {
      const userDocRef = doc(collection(db, "users"), user.id);
      const colRef = collection(userDocRef, searchID);
      const newColRef = collection(userDocRef, newCollectionName);
  
      const docs = await getDocs(colRef);
  
      const batch = writeBatch(db);
      docs.forEach((docSnapshot: any) => {
        const newDocRef = doc(newColRef, docSnapshot.id); 
        batch.set(newDocRef, docSnapshot.data());
        batch.delete(docSnapshot.ref); 
      });
  
      await batch.commit();
  
      const docSnap = await getDoc(userDocRef);
      if (docSnap.exists()) {
        const collections = docSnap.data().collections || [];
        const updatedCollections = collections.map((col: any) =>
          col.name === searchID ? { ...col, name: newCollectionName } : col
        );
  
        await setDoc(
          userDocRef,
          { collections: updatedCollections },
          { merge: true }
        );
      }
  
      setIsEditModalOpen(false); 
      router.push(`/study?id=${newCollectionName}`);
    } catch (error) {
      console.error("Error renaming collection: ", error);
      setIsEditModalOpen(false); 
    }
  };

  if (!isSignedIn) {
    router.push("/");
    return null;
  }
  if (!isLoaded) return <Loader size="large" />;

  return (
    <div className="relative flex flex-col min-h-screen">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8 flex justify-between items-center">
          <Link href="/">
            <Button variant="outline">
              <ArrowLeft className="mr-2 h-4 w-4" /> Back to Home
            </Button>
          </Link>
          <h1 className="text-3xl font-bold">Study Flashcards</h1>
        </div>
        <div className="py-4 flex flex-1 flex-row gap-x-7 justify-end">
          <Button
            variant="outline"
            className="bg-red-600 hover:bg-red-700 text-white hover:text-gray-200"
            onClick={() => setIsDeleteModalOpen(true)}
          >
            <CircleX className="h-4 w-4 mr-2 items-center justify-center text-white" />
            Delete {searchID}
          </Button>
          <Button
            variant="outline"
            className="bg-orange-500 hover:bg-orange-600 text-white hover:text-gray-200"
            onClick={() => setIsEditModalOpen(true)}
          >
            <Edit className="h-4 w-4 mr-2 items-center justify-center text-white" />
            Edit {searchID}
          </Button>
        </div>
        {flashcards.length > 0 ? (
          <>
            <Card className="mb-8">
              <CardContent className="p-6">
                <div
                  className="min-h-[200px] flex items-center justify-center cursor-pointer"
                  onClick={handleCardClick}
                >
                  <p className="text-2xl font-semibold text-center">
                    {flipped[currentCardIndex]
                      ? flashcards[currentCardIndex].back
                      : flashcards[currentCardIndex].front}
                  </p>
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-between items-center mb-4">
              <Button
                onClick={handlePrevCard}
                disabled={currentCardIndex === 0}
              >
                <ArrowLeft className="mr-2 h-4 w-4" /> Previous
              </Button>
              <span className="text-lg font-semibold">
                {currentCardIndex + 1} / {flashcards.length}
              </span>
              <Button
                onClick={handleNextCard}
                disabled={currentCardIndex === flashcards.length - 1}
              >
                Next <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>

            <Progress value={progress} className="mb-4" />

            <div className="flex flex-1 flex-row gap-x-9 justify-center">
              <Button onClick={handleRestart} variant="outline">
                <RotateCcw className="mr-2 h-4 w-4" /> Restart
              </Button>
            </div>
          </>
        ) : (
          <p className="text-center text-xl">
            No flashcards found for this collection.
          </p>
        )}
      </div>
      <Footer />

      {isDeleteModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <Card className="w-96">
            <CardContent className="p-6">
              <h3 className="text-xl font-bold mb-4">Delete Collection</h3>
              <p className="mb-4">
                Are you sure you want to delete this collection? This action cannot be undone.
              </p>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setIsDeleteModalOpen(false)}>
                  Cancel
                </Button>
                <Button variant="destructive" onClick={handleDeleteCollection}>
                  Delete
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {isEditModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <Card className="w-96">
            <CardContent className="p-6">
              <h3 className="text-xl font-bold mb-4">Rename Collection</h3>
              <div className="mb-4">
                <Label htmlFor="newName" className="block text-sm font-medium text-gray-700 mb-2">
                  New Collection Name
                </Label>
                <Input
                  id="newName"
                  value={newCollectionName}
                  onChange={(e) => setNewCollectionName(e.target.value)}
                  className="w-full"
                  placeholder="Enter new name"
                />
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setIsEditModalOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleEditName}>
                  Rename
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}