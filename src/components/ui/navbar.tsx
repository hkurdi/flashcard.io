"use client";

import { SignedOut, SignInButton, SignedIn, UserButton } from "@clerk/nextjs";
import { BookOpen, Menu } from "lucide-react";
import Link from "next/link";
import React, { useState } from "react";
import { Button } from "./button";

export interface NavBarProps {
  isNormal?: boolean;
  isLoggedIn?: boolean;
}

export const NavBar: React.FC<NavBarProps> = ({
  isNormal = true,
  isLoggedIn = false,
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  // Determine the state of the navbar based on isLoggedIn and isNormal
  const showNormalNav = isNormal && !isLoggedIn;

  return (
    <header className="bg-white shadow-sm">
      <div
        className={`container mx-auto px-4 lg:px-6 h-14 flex items-center ${
          showNormalNav ? "justify-between" : "justify-center"
        } select-none`}
      >
        <Link className="flex items-center" href="/">
          <BookOpen className="h-6 w-6 text-primary" />
          <span className="ml-2 text-lg font-bold">Flashcard.io</span>
        </Link>
        {showNormalNav && (
          <>
            <nav className="hidden md:flex items-center space-x-4 sm:space-x-6">
              <Link
                className="text-sm font-medium hover:text-primary"
                href="#features"
              >
                Features
              </Link>
              <Link
                className="text-sm font-medium hover:text-primary"
                href="#pricing"
              >
                Pricing
              </Link>
              <Link
                className="text-sm font-medium hover:text-primary"
                href="#about"
              >
                About
              </Link>
              <SignedOut>
                <SignInButton />
              </SignedOut>
              <SignedIn>
                <UserButton />
              </SignedIn>
            </nav>
            <Button
              variant="ghost"
              className="md:hidden"
              onClick={toggleMenu}
              aria-label="Toggle menu"
            >
              <Menu className="h-6 w-6" />
            </Button>
          </>
        )}
      </div>
      {showNormalNav && isMenuOpen && (
        <div className="md:hidden bg-white shadow-sm">
          <nav className="flex flex-col items-center space-y-2 py-4">
            <Link
              className="text-sm font-medium hover:text-primary"
              href="#features"
              onClick={toggleMenu}
            >
              Features
            </Link>
            <Link
              className="text-sm font-medium hover:text-primary"
              href="#pricing"
              onClick={toggleMenu}
            >
              Pricing
            </Link>
            <Link
              className="text-sm font-medium hover:text-primary"
              href="#about"
              onClick={toggleMenu}
            >
              About
            </Link>
            <SignedOut>
              <SignInButton />
            </SignedOut>
            <SignedIn>
              <UserButton />
            </SignedIn>
          </nav>
        </div>
      )}
      {isLoggedIn && (
        <div className="bg-white shadow-sm">
          <div className="container mx-auto px-4 lg:px-6 h-14 flex items-center justify-center">
            <nav className="hidden md:flex items-center space-x-4 sm:space-x-6">
            <Link
                className="text-sm font-medium hover:text-primary"
                href="/upgrade"
              >
                Upgrade
              </Link>
              <Link
                className="text-sm font-medium hover:text-primary"
                href="/home"
              >
                Home
              </Link>
              <Link
                className="text-sm font-medium hover:text-primary"
                href="/generate"
              >
                Generate
              </Link>
              <SignedOut>
                <SignInButton />
              </SignedOut>
              <SignedIn>
                <UserButton />
              </SignedIn>
            </nav>
            <Button
              variant="ghost"
              className="md:hidden"
              onClick={toggleMenu}
              aria-label="Toggle menu"
            >
              <Menu className="h-6 w-6" />
            </Button>
          </div>
          {isMenuOpen && (
            <div className="md:hidden bg-white shadow-sm">
              <nav className="flex flex-col items-center space-y-2 py-4">
                <Link
                  className="text-sm font-medium hover:text-primary"
                  href="/home"
                  onClick={toggleMenu}
                >
                  Home
                </Link>
                <Link
                  className="text-sm font-medium hover:text-primary"
                  href="/generate"
                  onClick={toggleMenu}
                >
                  Generate
                </Link>
                <SignedOut>
                  <SignInButton />
                </SignedOut>
                <SignedIn>
                  <UserButton />
                </SignedIn>
              </nav>
            </div>
          )}
        </div>
      )}
    </header>
  );
};
