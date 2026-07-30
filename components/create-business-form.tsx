"use client";

import {useState} from "react";
import {useRouter} from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function CreateBusinessForm() {
  const router = useRouter();
  const supabase = createClient();

  const [name, setName] = useState("");
  const [industry, setIndustry] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setErrorMessage("");

    const trimmedName = name.trim();
    const trimmedIndustry = industry.trim();

    if (!trimmedName) {
      setErrorMessage("Please enter a business name.");
      return;
    }

    setIsSubmitting(true);

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      setErrorMessage("You must be logged in to create a business.");
      setIsSubmitting(false);
      return;
    }

    const { error } = await supabase.from("businesses").insert({
      owner_id: user.id,
      name: trimmedName,
      industry: trimmedIndustry || null,
    });

    if (error) {
      setErrorMessage(error.message);
      setIsSubmitting(false);
      return;
    }

    setName("");
    setIndustry("");
    setIsSubmitting(false);

    router.refresh();
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-xl border bg-white p-6 shadow-sm"
    >
      <h2 className="text-xl font-semibold text-gray-900">
        Create a business
      </h2>

      <p className="mt-1 text-sm text-gray-600">
        Add the business whose data you want to manage.
      </p>

      <div className="mt-6">
        <label
          htmlFor="business-name"
          className="block text-sm font-medium text-gray-700"
        >
          Business name
        </label>

        <input
          id="business-name"
          name="businessName"
          type="text"
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder="Example: BrightBuild Construction"
          maxLength={100}
          disabled={isSubmitting}
          className="mt-2 w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 outline-none focus:border-black"
        />
      </div>

      <div className="mt-4">
        <label
          htmlFor="industry"
          className="block text-sm font-medium text-gray-700"
        >
          Industry
        </label>

        <input
          id="industry"
          name="industry"
          type="text"
          value={industry}
          onChange={(event) => setIndustry(event.target.value)}
          placeholder="Example: Construction"
          maxLength={100}
          disabled={isSubmitting}
          className="mt-2 w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 outline-none focus:border-black"
        />

        <p className="mt-1 text-xs text-gray-500">Optional</p>
      </div>

      {errorMessage && (
        <p className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">
          {errorMessage}
        </p>
      )}

      <button
        type="submit"
        disabled={isSubmitting}
        className="mt-6 rounded-lg bg-black px-4 py-2 font-medium text-white disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isSubmitting ? "Creating..." : "Create business"}
      </button>
    </form>
  );
}

