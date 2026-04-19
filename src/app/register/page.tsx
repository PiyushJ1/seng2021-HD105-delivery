"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

type RegisterResponse = {
  error?: string;
  message?: string;
};

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"delivery" | "despatch">("delivery");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const router = useRouter();

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, role }),
      });

      const payload = (await response.json()) as RegisterResponse;

      if (!response.ok) {
        setErrorMessage(
          payload.error ??
            payload.message ??
            "Unable to register. Please try again.",
        );
        return;
      }

      // setSuccessMessage(payload.message ?? "Account registered successfully!");
      setPassword("");
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
        <h1 className="text-2xl font-semibold">Register</h1>
        <p className="mt-1 text-sm text-slate-600">
          Create a user account for either delivery or despatch role.
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
              autoComplete="new-password"
              className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none transition focus:border-slate-900"
              placeholder="Choose a password"
            />
          </div>

          <div>
            <label htmlFor="role" className="mb-1 block text-sm font-medium">
              Role
            </label>
            <select
              id="role"
              name="role"
              value={role}
              onChange={(event) =>
                setRole(event.target.value as "delivery" | "despatch")
              }
              className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none transition focus:border-slate-900"
            >
              <option value="delivery">delivery</option>
              <option value="despatch">despatch</option>
            </select>
            <p className="mt-1 text-xs text-slate-500">
              Allowed values are exactly: delivery or despatch.
            </p>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-lg bg-slate-900 px-4 py-2 font-medium text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? "Registering..." : "Register"}
          </button>
        </form>

        {errorMessage && (
          <p className="mt-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {errorMessage}
          </p>
        )}

        {successMessage && (
          <p className="mt-4 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
            {successMessage}
          </p>
        )}

        <p className="mt-6 text-sm text-slate-600">
          Already registered?{" "}
          <Link href="/login" className="font-medium text-slate-900 underline">
            Go to login
          </Link>
        </p>
      </section>
    </main>
  );
}
