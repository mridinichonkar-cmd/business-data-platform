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
      className="flex min-h-[310px] flex-col rounded-xl border-2 border-dashed border-slate-300 bg-white p-6 shadow-sm transition hover:border-teal-700"
    >
   
    <div className="mb-6 flex items-center gap-5">
    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-lg bg-teal-100 text-teal-800">
      <span className="text-3xl font-semibold">+</span>
    </div>

    <div>
      <h2 className="font-semibold text-xl text-slate-950">
        Register New Business
      </h2>

      <p className="mt-1 text-md text-slate-500">
        Add another organisation to your account.
      </p>
    </div>
  </div>

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
          className="mt-2 w-full rounded-lg border border-gray-300 px-3 py-2 mb-5 text-gray-900 outline-none focus:border-black"
        />

        
      </div>

      {errorMessage && (
        <p className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">
          {errorMessage}
        </p>
      )}

      <button
        type="submit"
        disabled={isSubmitting}
        className="mt-auto w-full rounded-lg bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isSubmitting ? "Creating..." : "Create business"}
      </button>
    </form>
  );
}

