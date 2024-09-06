"use client"

import { NavBar } from "@/components/ui/navbar";
import { SignIn } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAuth } from "@clerk/nextjs";

export default function Page() {
  const router = useRouter();
  const { isSignedIn } = useAuth();

  useEffect(() => {
    if (isSignedIn) {
      router.push("/home");
    }
  }, [isSignedIn, router]);

  return (
    <div className="relative">
      <NavBar isNormal={false} />
      <div className="min-h-screen w-full flex flex-col justify-center items-center">
        <SignIn />
      </div>
    </div>
  );
}
