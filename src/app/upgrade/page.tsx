"use client";

import { useState } from "react";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { NavBar } from "@/components/ui/navbar";
import { Footer } from "@/components/ui/footer";
import { Loader } from "@/components/ui/loader";
import { getStripe } from "@/lib/utils";
import { Check } from "lucide-react";
import axios from "axios";


export default function Upgrade() {
  const { isLoaded, isSignedIn, user } = useUser();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState({ pro: false, proPlus: false });

  if (!isLoaded) {
    return <Loader size="large" />;
  }

  if (!isSignedIn) {
    router.push("/");
    return null;
  }
  const handleProClick = async () => {
    setIsLoading({ ...isLoading, pro: true });
    try {
      const response = await axios.post("/api/checkout_sessions", {
        plan: "pro",
      }, {
        headers: {
          "Content-Type": "application/json",
        }
      });
  
      const checkoutSession = response.data; 
  
      if (!checkoutSession.id) {
        console.error("Checkout session ID is missing.");
        return;
      }
  
      const stripe = await getStripe();
      if (stripe) {
        const { error } = await stripe.redirectToCheckout({
          sessionId: checkoutSession.id,
        });
  
        if (error) {
          console.warn(error.message);
        }
      }
    } catch (error) {
      console.error("Error during checkout:", error);
    } finally {
      setIsLoading({ ...isLoading, pro: false });
    }
  };

const handleProPlusClick = async () => {
  setIsLoading({ ...isLoading, proPlus: true });
  try {
    const response = await axios.post("/api/checkout_sessions", {
      plan: "proPlus", 
    }, {
      headers: {
        "Content-Type": "application/json",
      }
    });

    const checkoutSession = response.data; 

    if (!checkoutSession.id) {
      console.error("Checkout session ID is missing.");
      return;
    }

    const stripe = await getStripe();
    if (stripe) {
      const { error } = await stripe.redirectToCheckout({
        sessionId: checkoutSession.id,
      });

      if (error) {
        console.warn(error.message);
      }
    }
  } catch (error) {
    console.error("Error during checkout:", error);
  } finally {
    setIsLoading({ ...isLoading, proPlus: false });
  }
};


  return (
    <div className="flex flex-col min-h-screen">
      <NavBar isLoggedIn={true} />
      <main className="flex-grow container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8 text-center">Upgrade Your Plan</h1>
        <div className="grid md:grid-cols-2 gap-8">
          <Card>
            <CardHeader>
              <CardTitle>Pro Plan</CardTitle>
              <CardDescription>For serious learners</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 mb-6">
                <li className="flex items-center">
                  <Check className="mr-2 h-4 w-4 text-green-500" />
                  Unlimited flashcard collections
                </li>
                <li className="flex items-center">
                  <Check className="mr-2 h-4 w-4 text-green-500" />
                  Advanced analytics
                </li>
                <li className="flex items-center">
                  <Check className="mr-2 h-4 w-4 text-green-500" />
                  Priority support
                </li>
              </ul>
              <p className="text-2xl font-bold mb-4">$9.99/month</p>
              <Button 
                onClick={handleProClick} 
                disabled={isLoading.pro}
                className="w-full"
              >
                {isLoading.pro ? <Loader size="small" /> : "Upgrade to Pro"}
              </Button>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Pro Plus Plan</CardTitle>
              <CardDescription>For power users</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 mb-6">
                <li className="flex items-center">
                  <Check className="mr-2 h-4 w-4 text-green-500" />
                  All Pro features
                </li>
                <li className="flex items-center">
                  <Check className="mr-2 h-4 w-4 text-green-500" />
                  AI-powered study recommendations
                </li>
                <li className="flex items-center">
                  <Check className="mr-2 h-4 w-4 text-green-500" />
                  Collaborative study groups
                </li>
              </ul>
              <p className="text-2xl font-bold mb-4">$19.99/month</p>
              <Button 
                onClick={handleProPlusClick} 
                disabled={isLoading.proPlus}
                className="w-full"
              >
                {isLoading.proPlus ? <Loader size="small" /> : "Upgrade to Pro Plus"}
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
}
