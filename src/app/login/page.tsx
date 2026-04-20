"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

type LoginResponse = {
  error?: string;
  message?: string;
  apiKey?: string;
  partyId?: string;
};

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [partyId, setPartyId] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setErrorMessage(null);
    setSuccessMessage(null);
    setApiKey(null);
    setPartyId(null);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const payload = (await response.json()) as LoginResponse;

      if (!response.ok) {
        setErrorMessage(
          payload.error ??
            payload.message ??
            "Unable to log in. Please try again.",
        );
        return;
      }

      if (payload.apiKey) {
        localStorage.setItem("apiKey", payload.apiKey);
        setApiKey(payload.apiKey);
      }
      if (payload.partyId) {
        localStorage.setItem("partyId", payload.partyId);
        setPartyId(payload.partyId);
      }

      // setSuccessMessage(payload.message ?? "Logged in successfully!");
      localStorage.setItem("email", email);
      router.push("/dashboard");
    } catch {
      setErrorMessage(
        "Network error. Please check your connection and try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-100 px-4 py-10 text-slate-900">
      <section className="mx-auto w-full max-w-md rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-semibold">Log In</h1>
        <p className="mt-1 text-sm text-slate-600">
          Use your registered email and password.
        </p>

        <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="email" className="mb-1 block text-sm font-medium">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
              autoComplete="email"
              className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none transition focus:border-slate-900"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="mb-1 block text-sm font-medium"
            >
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
              autoComplete="current-password"
              className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none transition focus:border-slate-900"
              placeholder="Enter your password"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-lg bg-slate-900 px-4 py-2 font-medium text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? "Logging in..." : "Log In"}
          </button>
        </form>

        {errorMessage && (
          <p className="mt-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {errorMessage}
          </p>
        )}

        {successMessage && (
          <div className="mt-4 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
            <p>{successMessage}</p>
            {apiKey && (
              <p className="mt-1 break-all">
                <span className="font-semibold">apiKey:</span> {apiKey}
              </p>
            )}
            {partyId && (
              <p className="mt-1 break-all">
                <span className="font-semibold">partyId:</span> {partyId}
              </p>
            )}
          </div>
        )}

        <p className="mt-6 text-sm text-slate-600">
          New here?{" "}
          <Link
            href="/register"
            className="font-medium text-slate-900 underline"
          >
            Create an account
          </Link>
        </p>
      </section>
    </main>
  );
}
