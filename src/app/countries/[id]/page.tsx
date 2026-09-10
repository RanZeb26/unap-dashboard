"use client";

import React, { useEffect, useState } from "react";
import 'bootstrap/dist/css/bootstrap.min.css';
import {
  ArrowLeft,
  TrendingUp,
  TrendingDown,
  Minus,
  Globe2,
  Target,
  Database,
  BarChart3,
} from "lucide-react";
import { useParams, useRouter } from "next/navigation";

interface Country {
  country_id: number;
  iso3: string;
  country_name: string;
  region_name: string;
}

interface SDG {
  score_id: number;
  goal_id: number;
  goal_number: number;
  goal_name: string;
  year: number;
  score: number;
  trend: "improving" | "stable" | "declining";
}

interface History {
  year: number;
  score: number;
}

interface CountryData {
  country: Country;
  overall_score: number;
  sdgs: SDG[];
  indicators: any[];
  history: History[];
}

export default function CountryDetailsPage() {
  const params = useParams();
  const router = useRouter();

  const [data, setData] = useState<CountryData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadCountry() {
      try {
        setLoading(true);

        const response = await fetch(
          `/api/countries/${params.id}`
        );

        if (!response.ok) {
          throw new Error("Failed to load country");
        }

        const result = await response.json();

        setData(result);

      } catch (err: any) {
        console.error(err);
        setError(err.message || "Failed to load country");
      } finally {
        setLoading(false);
      }
    }

    if (params.id) {
      loadCountry();
    }
  }, [params.id]);

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-sky-400 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-400">
            Loading country data...
          </p>
        </div>
      </main>
    );
  }

  if (error || !data) {
    return (
      <main className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-400 mb-4">
            {error || "Country not found"}
          </p>

          <button
            onClick={() => router.back()}
            className="px-5 py-2 rounded-lg bg-sky-600 hover:bg-sky-500"
          >
            Go Back
          </button>
        </div>
      </main>
    );
  }

  const {
    country,
    overall_score,
    sdgs,
    history,
  } = data;

  return (
    <main className="min-h-screen bg-slate-950 text-white">

      {/* HEADER */}

      <header className="border-b border-white/10 bg-slate-900/80 backdrop-blur">
        <div className="max-w-7xl mx-auto px-6 py-5">

          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-slate-400 hover:text-white mb-6"
          >
            <ArrowLeft size={18} />
            Back to Dashboard
          </button>

          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">

            <div>
              <div className="flex items-center gap-3">

                <div className="w-14 h-14 rounded-xl bg-sky-500/20 flex items-center justify-center">
                  <Globe2
                    size={30}
                    className="text-sky-400"
                  />
                </div>

                <div>
                  <h1 className="text-3xl font-black">
                    {country.country_name}
                  </h1>

                  <p className="text-slate-400">
                    {country.iso3} • {country.region_name}
                  </p>
                </div>

              </div>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-2xl px-8 py-5">
              <p className="text-sm text-slate-400">
                Overall SDG Score
              </p>

              <div className="text-4xl font-black text-sky-400">
                {Number(overall_score).toFixed(1)}
              </div>

              <p className="text-xs text-slate-500 mt-1">
                Based on available SDG data
              </p>
            </div>

          </div>

        </div>
      </header>


      {/* CONTENT */}

      <section className="max-w-7xl mx-auto px-6 py-10">

        {/* STAT CARDS */}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-10">

          <div className="bg-white/5 border border-white/10 rounded-2xl p-6">

            <Target className="text-sky-400 mb-4" />

            <p className="text-slate-400 text-sm">
              SDGs Evaluated
            </p>

            <p className="text-3xl font-black mt-1">
              {sdgs.length}
            </p>

          </div>

          <div className="bg-white/5 border border-white/10 rounded-2xl p-6">

            <Database className="text-emerald-400 mb-4" />

            <p className="text-slate-400 text-sm">
              Indicator Records
            </p>

            <p className="text-3xl font-black mt-1">
              {data.indicators.length}
            </p>

          </div>

          <div className="bg-white/5 border border-white/10 rounded-2xl p-6">

            <BarChart3 className="text-purple-400 mb-4" />

            <p className="text-slate-400 text-sm">
              Historical Years
            </p>

            <p className="text-3xl font-black mt-1">
              {history.length}
            </p>

          </div>

        </div>


        {/* SDG PERFORMANCE */}

        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 md:p-8">

          <div className="flex items-center justify-between mb-8">

            <div>
              <h2 className="text-2xl font-black">
                SDG Performance
              </h2>

              <p className="text-slate-400 text-sm mt-1">
                Performance across the 17 Sustainable Development Goals
              </p>
            </div>

          </div>


          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

            {sdgs.map((sdg) => {

              const score = Number(sdg.score || 0);

              return (
                <div
                  key={`${sdg.goal_id}-${sdg.year}`}
                  className="bg-slate-900/70 border border-white/10 rounded-xl p-5"
                >

                  <div className="flex justify-between items-start mb-3">

                    <div className="flex gap-3">

                      <div className="w-10 h-10 rounded-lg bg-sky-500/20 flex items-center justify-center font-black text-sky-400">
                        {sdg.goal_number}
                      </div>

                      <div>
                        <h3 className="font-bold">
                          SDG {sdg.goal_number}
                        </h3>

                        <p className="text-sm text-slate-400">
                          {sdg.goal_name}
                        </p>
                      </div>

                    </div>

                    <div className="text-right">

                      <div className="text-xl font-black">
                        {score.toFixed(1)}%
                      </div>

                      <div className="flex items-center justify-end gap-1 text-xs mt-1">

                        {sdg.trend === "improving" && (
                          <>
                            <TrendingUp
                              size={14}
                              className="text-emerald-400"
                            />
                            <span className="text-emerald-400">
                              Improving
                            </span>
                          </>
                        )}

                        {sdg.trend === "declining" && (
                          <>
                            <TrendingDown
                              size={14}
                              className="text-red-400"
                            />
                            <span className="text-red-400">
                              Declining
                            </span>
                          </>
                        )}

                        {sdg.trend === "stable" && (
                          <>
                            <Minus
                              size={14}
                              className="text-yellow-400"
                            />
                            <span className="text-yellow-400">
                              Stable
                            </span>
                          </>
                        )}

                      </div>

                    </div>

                  </div>


                  <div className="h-3 bg-slate-800 rounded-full overflow-hidden">

                    <div
                      className="h-full rounded-full transition-all"
                      style={{
                        width: `${Math.min(
                          Math.max(score, 0),
                          100
                        )}%`,
                        background:
                          score >= 80
                            ? "#22c55e"
                            : score >= 70
                            ? "#38bdf8"
                            : score >= 60
                            ? "#facc15"
                            : "#ef4444",
                      }}
                    />

                  </div>

                  <div className="flex justify-between text-xs text-slate-500 mt-2">
                    <span>0</span>
                    <span>{sdg.year}</span>
                    <span>100</span>
                  </div>

                </div>
              );

            })}

          </div>

        </div>

      </section>

    </main>
  );
}