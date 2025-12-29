"use client";

import { useState } from "react";
import { login, signup } from "./actions";
import { useSearchParams } from "next/navigation";

export default function LoginPage() {
  const [isLogin, setIsLogin] = useState(true);
  const searchParams = useSearchParams();
  const message = searchParams.get("message");

  return (
    <div className="flex min-h-[80vh] flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8 bg-stone-900/50 p-8 rounded-xl border border-stone-800">
        
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-serif font-bold tracking-tight text-amber-500">
            {isLogin ? "Welcome Back, Tarnished" : "Join the Roundtable"}
          </h2>
          <p className="mt-2 text-sm text-stone-400">
            {isLogin ? "Sign in to manage your builds" : "Create an account to save your builds"}
          </p>
        </div>

        {message && (
          <div className="p-3 bg-red-900/30 border border-red-800 rounded text-red-200 text-sm text-center">
            {message}
          </div>
        )}

        <form className="mt-8 space-y-6">
          <div className="-space-y-px rounded-md shadow-sm">
            {/* Username field - only for signup */}
            {!isLogin && (
              <div className="mb-4">
                <label htmlFor="username" className="sr-only">Username</label>
                <input
                  id="username"
                  name="username"
                  type="text"
                  required={!isLogin}
                  className="relative block w-full rounded-md border-0 bg-stone-950 py-2.5 px-3 text-stone-200 ring-1 ring-inset ring-stone-700 placeholder:text-stone-500 focus:z-10 focus:ring-2 focus:ring-inset focus:ring-amber-600 sm:text-sm sm:leading-6"
                  placeholder="Username"
                />
              </div>
            )}
            
            <div className="mb-4">
              <label htmlFor="email-address" className="sr-only">Email address</label>
              <input
                id="email-address"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="relative block w-full rounded-md border-0 bg-stone-950 py-2.5 px-3 text-stone-200 ring-1 ring-inset ring-stone-700 placeholder:text-stone-500 focus:z-10 focus:ring-2 focus:ring-inset focus:ring-amber-600 sm:text-sm sm:leading-6"
                placeholder="Email address"
              />
            </div>
            
            <div>
              <label htmlFor="password" className="sr-only">Password</label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                minLength={6}
                className="relative block w-full rounded-md border-0 bg-stone-950 py-2.5 px-3 text-stone-200 ring-1 ring-inset ring-stone-700 placeholder:text-stone-500 focus:z-10 focus:ring-2 focus:ring-inset focus:ring-amber-600 sm:text-sm sm:leading-6"
                placeholder="Password"
              />
            </div>
          </div>

          <div>
            <button
              formAction={isLogin ? login : signup}
              className="group relative flex w-full justify-center rounded-md bg-amber-700 px-3 py-2 text-sm font-semibold text-white hover:bg-amber-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-600 transition-colors"
            >
              {isLogin ? "Sign in" : "Sign up"}
            </button>
          </div>
        </form>

        <div className="text-center">
          <button
            type="button"
            onClick={() => setIsLogin(!isLogin)}
            className="text-sm font-medium text-amber-500 hover:text-amber-400"
          >
            {isLogin ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
          </button>
        </div>
      </div>
    </div>
  );
}