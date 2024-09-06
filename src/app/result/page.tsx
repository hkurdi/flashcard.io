"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Loader } from "@/components/ui/loader";
import Link from "next/link";
import { NavBar } from "@/components/ui/navbar";
import { Footer } from "@/components/ui/footer";

interface Session {
  payment_status: string;
}

export default function ResultPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const session_id = searchParams.get("session_id");
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState<Session | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCheckoutSession = async () => {
      if (!session_id) return;
      try {
        const res = await axios.get(`/api/checkout_sessions?session_id=${session_id}`);
        setSession(res.data);
      } catch (err) {
        setError("An error occurred while retrieving the session.");
      } finally {
        setLoading(false);
      }
    };
    fetchCheckoutSession();
  }, [session_id]);

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen">
        <NavBar isLoggedIn={true} />
        <div className="container mx-auto px-4 py-8 flex-grow flex items-center justify-center">
          <div className="text-center">
            <Loader size="large" />
            <p className="mt-4 text-xl">Loading...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col min-h-screen">
        <NavBar isLoggedIn={true} />
        <div className="container mx-auto px-4 py-8 flex-grow flex items-center justify-center">
          <Card>
            <CardContent className="p-6">
              <p className="text-xl text-red-600">{error}</p>
            </CardContent>
          </Card>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <NavBar isLoggedIn={true} />
      <div className="container mx-auto px-4 py-8 flex-grow">
        <Card className="max-w-2xl mx-auto">
          <CardContent className="p-6">
            {session?.payment_status === "paid" ? (
              <>
                <h1 className="text-3xl font-bold mb-4">Thank you for your purchase!</h1>
                <p className="text-xl mb-2">Session ID: {session_id}</p>
                <p className="text-lg">
                  We have received your payment. You will receive an email with the
                  order details shortly.
                </p>
              </>
            ) : (
              <>
                <h1 className="text-3xl font-bold mb-4">Payment failed</h1>
                <p className="text-lg mb-4">
                  Your payment was not successful. Please try again.
                </p>
                <Button asChild>
                  <Link href="/">Go To Home Page</Link>
                </Button>
              </>
            )}
          </CardContent>
        </Card>
      </div>
      <Footer />
    </div>
  );
}