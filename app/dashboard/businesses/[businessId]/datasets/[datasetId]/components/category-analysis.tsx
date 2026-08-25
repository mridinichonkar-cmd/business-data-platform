"use client";

import { useState } from "react";

import CategoryFrequencyChart from "./category-frequency-chart";

type CategoryFrequency = {
  value: string;
  count: number;
  percentage: number;
};

type CategorySummary = {
  totalValues: number;
  missingCount: number;
  uniqueCount: number;
  mostCommonValue: string | null;
  mostCommonCount: number;
  frequencies: CategoryFrequency[];
};

type CategoryAnalysisItem = {
  fieldId: string;
  fieldName: string;
  summary: CategorySummary;
};

type CategoryAnalysisProps = {
  analyses: CategoryAnalysisItem[];
};

export default function CategoryAnalysis({
  analyses,
}: CategoryAnalysisProps) {
  const [selectedFieldId, setSelectedFieldId] = useState(
    analyses[0]?.fieldId ?? "",
  );

  const selectedAnalysis = analyses.find(
    (analysis) => analysis.fieldId === selectedFieldId,
  );

  if (analyses.length === 0) {
    return (
      <section className="mt-8 rounded-xl border border-slate-200 bg-white p-8 text-center shadow-sm">
        <h2 className="font-semibold text-slate-950">
          No categorical analysis available
        </h2>

        <p className="mt-2 text-sm text-slate-500">
          This dataset does not contain any fields detected as categories.
        </p>
      </section>
    );
  }

  return (
    <section className="mt-8">
      <div className="mb-4 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-teal-700">
            Category analysis
          </p>

          <h2 className="mt-2 text-xl font-semibold text-slate-950">
            Explore categorical fields
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Choose a field to view its distribution across the complete
            dataset.
          </p>
        </div>

        <div className="w-full sm:w-64">
          <label
            htmlFor="category-field"
            className="mb-2 block text-sm font-semibold text-slate-700"
          >
            Field
          </label>

          <select
            id="category-field"
            value={selectedFieldId}
            onChange={(event) =>
              setSelectedFieldId(event.target.value)
            }
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-slate-950"
          >
            {analyses.map((analysis) => (
              <option
                key={analysis.fieldId}
                value={analysis.fieldId}
              >
                {analysis.fieldName}
              </option>
            ))}
          </select>
        </div>
      </div>

      {selectedAnalysis && (
        <>
          <CategoryFrequencyChart
            fieldName={selectedAnalysis.fieldName}
            data={selectedAnalysis.summary.frequencies
              .slice(0, 10)
              .map((item) => ({
                name: item.value,
                count: item.count,
              }))}
          />

          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="rounded-xl border border-slate-200 bg-white p-5">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Unique values
              </p>

              <p className="mt-2 text-2xl font-bold text-slate-950">
                {selectedAnalysis.summary.uniqueCount}
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-5">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Most common
              </p>

              <p className="mt-2 text-lg font-bold text-slate-950">
                {selectedAnalysis.summary.mostCommonValue ?? "—"}
              </p>

              <p className="mt-1 text-sm text-slate-500">
                {selectedAnalysis.summary.mostCommonCount.toLocaleString()}{" "}
                records
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-5">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Missing values
              </p>

              <p className="mt-2 text-2xl font-bold text-slate-950">
                {selectedAnalysis.summary.missingCount.toLocaleString()}
              </p>
            </div>
          </div>
        </>
      )}
    </section>
  );
}