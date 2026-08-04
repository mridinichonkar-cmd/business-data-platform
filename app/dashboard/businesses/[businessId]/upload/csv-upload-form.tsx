"use client"

import Papa from "papaparse"
import {useRouter} from "next/navigation"
import {ChangeEvent, SubmitEvent, useState} from "react"

import {
  AlertCircle,
  CheckCircle2,
  FileSpreadsheet,
  Upload,
} from "lucide-react";

import { createClient } from "@/lib/supabase/client";

type CsvRow = Record<string,string>;

type CsvUploadFormProps = {
    businessId: string;
};

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const MAX_ROWS = 10_000; // Maximum number of rows allowed
const INSERT_BATCH_SIZE = 500; // Number of rows to insert in each batch

export default function CsvUploadForm({
    businessId
}: CsvUploadFormProps) {
    const router = useRouter();
    const supabase = createClient();

    const[datasetName, setDatasetName] = useState("");
    const [fileName, setFileName] = useState("");
    const [columns, setColumns] = useState<string[]>([]);
    const [rows, setRows] = useState<CsvRow[]>([]);
    const [errorMessage, setErrorMessage] = useState("");
    const [isImporting, setIsImporting] = useState(false);
    const [importProgress, setImportProgress] = useState(0);

    function resetParsedFile() {
    setFileName("");
    setColumns([]);
    setRows([]);
    setImportProgress(0);
  }

   function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    setErrorMessage("");
    resetParsedFile();

    if (!file) {
      return;
    }

    if (!file.name.toLowerCase().endsWith(".csv")) {
      setErrorMessage("Please select a CSV file.");
      event.target.value = "";
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      setErrorMessage("The CSV file must be smaller than 5 MB.");
      event.target.value = "";
      return;
    }

    Papa.parse<CsvRow>(file, {
      header: true,
      skipEmptyLines: "greedy",
      transformHeader: (header) => header.trim(),

      complete: (results) => {
        const parsingError = results.errors[0];

        if (parsingError) {
          setErrorMessage(
            `The CSV could not be parsed: ${parsingError.message}`,
          );
          return;
        }

        const parsedColumns =
          results.meta.fields?.filter(
            (column): column is string =>
              Boolean(column && column.trim()),
          ) ?? [];

        if (parsedColumns.length === 0) {
          setErrorMessage(
            "The CSV must contain a header row with at least one column.",
          );
          return;
        }

        if (results.data.length === 0) {
          setErrorMessage("The CSV does not contain any data rows.");
          return;
        }

        if (results.data.length > MAX_ROWS) {
          setErrorMessage(
            `This first version supports up to ${MAX_ROWS.toLocaleString()} rows per upload.`,
          );
          return;
        }

        const cleanedRows = results.data.map((row) => {
          const cleanedRow: CsvRow = {};

          for (const column of parsedColumns) {
            cleanedRow[column] = String(row[column] ?? "").trim();
          }

          return cleanedRow;
        });

        setFileName(file.name);
        setColumns(parsedColumns);
        setRows(cleanedRows);

        if (!datasetName.trim()) {
          setDatasetName(
            file.name.replace(/\.csv$/i, "").replaceAll("_", " "),
          );
        }
      },

      error: (error) => {
        setErrorMessage(`The CSV could not be read: ${error.message}`);
      },
    });
  }

  async function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();

    setErrorMessage("");

    const cleanDatasetName = datasetName.trim();

    if (!cleanDatasetName) {
      setErrorMessage("Enter a dataset name.");
      return;
    }

    if (rows.length === 0 || columns.length === 0) {
      setErrorMessage("Select a valid CSV file first.");
      return;
    }

    setIsImporting(true);
    setImportProgress(0);

    let createdDatasetId: string | null = null;

    try {
      const { data: dataset, error: datasetError } = await supabase
        .from("datasets")
        .insert({
          business_id: businessId,
          name: cleanDatasetName,
          columns,
          row_count: 0,
        })
        .select("id")
        .single();

      if (datasetError) {
        throw new Error(datasetError.message);
      }

      createdDatasetId = dataset.id;

      for (
        let startIndex = 0;
        startIndex < rows.length;
        startIndex += INSERT_BATCH_SIZE
      ) {
        const batch = rows
          .slice(startIndex, startIndex + INSERT_BATCH_SIZE)
          .map((row) => ({
            dataset_id: dataset.id,
            data: row,
          }));

        const { error: recordsError } = await supabase
          .from("records")
          .insert(batch);

        if (recordsError) {
          throw new Error(recordsError.message);
        }

        const completedRows = Math.min(
          startIndex + INSERT_BATCH_SIZE,
          rows.length,
        );

        setImportProgress(
          Math.round((completedRows / rows.length) * 100),
        );
      }

      const { error: updateError } = await supabase
        .from("datasets")
        .update({
          row_count: rows.length,
        })
        .eq("id", dataset.id);

      if (updateError) {
        throw new Error(updateError.message);
      }

      router.push(`/dashboard/businesses/${businessId}`);
      router.refresh();
    } catch (error) {
      /*
       * Remove the incomplete dataset if one of the record batches fails.
       * Its records are also deleted because of ON DELETE CASCADE.
       */
      if (createdDatasetId) {
        await supabase
          .from("datasets")
          .delete()
          .eq("id", createdDatasetId);
      }

      setErrorMessage(
        error instanceof Error
          ? error.message
          : "The dataset could not be imported.",
      );

      setIsImporting(false);
    }
  }

  const previewRows = rows.slice(0, 5);


   return (
    <form
      onSubmit={handleSubmit}
      className="space-y-6"
    >
      {errorMessage && (
        <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
          <p>{errorMessage}</p>
        </div>
      )}

      <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <label
          htmlFor="dataset-name"
          className="text-sm font-semibold text-slate-900"
        >
          Dataset name
        </label>

        <p className="mt-1 text-sm text-slate-500">
          Give this collection a clear name, such as Customers,
          Appointments or Properties.
        </p>

        <input
          id="dataset-name"
          type="text"
          value={datasetName}
          onChange={(event) => setDatasetName(event.target.value)}
          placeholder="Enter a dataset name"
          disabled={isImporting}
          className="mt-4 w-full rounded-lg border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-slate-950 focus:ring-2 focus:ring-slate-950/10 disabled:bg-slate-100"
        />
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-start gap-4">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-teal-100 text-teal-800">
            <Upload className="h-5 w-5" />
          </div>

          <div>
            <h2 className="font-semibold text-slate-950">
              Select a CSV file
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              The first row must contain column names. Maximum size:
              5 MB and 10,000 rows.
            </p>
          </div>
        </div>

        <label
          htmlFor="csv-file"
          className="mt-6 flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 px-6 py-10 text-center transition hover:border-teal-700 hover:bg-teal-50"
        >
          <FileSpreadsheet className="h-10 w-10 text-slate-400" />

          <span className="mt-4 font-semibold text-slate-900">
            Choose CSV file
          </span>

          <span className="mt-1 text-sm text-slate-500">
            {fileName || "No file selected"}
          </span>
        </label>

        <input
          id="csv-file"
          type="file"
          accept=".csv,text/csv"
          onChange={handleFileChange}
          disabled={isImporting}
          className="sr-only"
        />
      </section>

      {rows.length > 0 && (
        <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-col justify-between gap-3 border-b border-slate-200 px-6 py-5 sm:flex-row sm:items-center">
            <div>
              <h2 className="font-semibold text-slate-950">
                Data preview
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Showing the first {previewRows.length} of{" "}
                {rows.length.toLocaleString()} rows.
              </p>
            </div>

            <div className="flex items-center gap-2 text-sm font-semibold text-teal-700">
              <CheckCircle2 className="h-4 w-4" />
              {columns.length} columns detected
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-slate-100">
                <tr>
                  {columns.map((column) => (
                    <th
                      key={column}
                      className="whitespace-nowrap px-4 py-3 text-xs font-bold uppercase tracking-wide text-slate-500"
                    >
                      {column}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-200">
                {previewRows.map((row, rowIndex) => (
                  <tr key={rowIndex}>
                    {columns.map((column) => (
                      <td
                        key={column}
                        className="max-w-64 truncate whitespace-nowrap px-4 py-3 text-slate-700"
                      >
                        {row[column] || (
                          <span className="text-slate-300">
                            Empty
                          </span>
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {isImporting && (
        <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex justify-between text-sm">
            <span className="font-semibold text-slate-900">
              Importing records
            </span>

            <span className="font-semibold text-slate-600">
              {importProgress}%
            </span>
          </div>

          <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-200">
            <div
              className="h-full rounded-full bg-slate-950 transition-all"
              style={{ width: `${importProgress}%` }}
            />
          </div>
        </section>
      )}

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={isImporting || rows.length === 0}
          className="rounded-lg bg-slate-950 px-6 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {isImporting
            ? "Importing dataset..."
            : `Import ${rows.length.toLocaleString()} records`}
        </button>
      </div>
    </form>
  );
    }