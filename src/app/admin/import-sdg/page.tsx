"use client";

import { useState } from "react";

export default function ImportSDGPage() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  async function handleImport() {
    if (!file) {
      setMessage("Please select a GeoJSON file.");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const text = await file.text();
      const json = JSON.parse(text);

      const response = await fetch("/api/admin/import-sdg", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          data: json,
          source_id: 1,
          dataset_year: 2026,
          source_name: "Sustainable Development Report 2026",
          file_name: file.name,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Import failed");
      }

      setMessage(
        `Import completed. ${result.records_processed} countries processed.`
      );
    } catch (error: any) {
      setMessage(error.message || "Import failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#077983] p-8 text-white">
      <div className="mx-auto max-w-3xl rounded-2xl border border-amber-400 bg-[#0f8f98] p-8 shadow-xl">
        <h1 className="mb-2 text-3xl font-black uppercase">
          Import SDG Dataset
        </h1>

        <p className="mb-6 text-white/80">
          Upload the official SDG GeoJSON dataset and import it into MySQL.
        </p>

        <input
          type="file"
          accept=".json,.geojson"
          onChange={(event) =>
            setFile(event.target.files?.[0] || null)
          }
          className="mb-5 block w-full rounded-lg bg-white p-3 text-black"
        />

        <button
          onClick={handleImport}
          disabled={loading}
          className="rounded-lg bg-amber-400 px-6 py-3 font-bold text-black transition hover:bg-amber-300 disabled:opacity-50"
        >
          {loading ? "IMPORTING..." : "IMPORT DATA"}
        </button>

        {message && (
          <div className="mt-5 rounded-lg bg-black/20 p-4">
            {message}
          </div>
        )}
      </div>
    </main>
  );
}