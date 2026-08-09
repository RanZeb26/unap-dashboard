"use client";

import React, { useState } from "react";
import { MOST_IMPROVED_COUNTRIES } from "@/data/sdgData";
import { Trophy, Award, TrendingUp, Filter } from "lucide-react";

export default function CountryAwards() {
  const [regionFilter, setRegionFilter] = useState<string>("All");

  const filteredCountries =
    regionFilter === "All"
      ? MOST_IMPROVED_COUNTRIES
      : MOST_IMPROVED_COUNTRIES.filter((c) => c.region === regionFilter);

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 py-12 space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <span className="text-xs font-black text-[#009EDB] uppercase tracking-widest block mb-1">
            Impact Recognition
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Most Improved Country Awards
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 mt-1">
            Recognizing national SDG trajectory growth based on verified multi-year data
          </p>
        </div>

        <div className="flex items-center gap-1.5 bg-slate-100 p-1.5 rounded-full border border-slate-200">
          <Filter className="w-3.5 h-3.5 text-slate-500 ml-2 mr-1" />
          {["All", "Americas", "Asia Pacific", "EMEA"].map((reg) => (
            <button
              key={reg}
              onClick={() => setRegionFilter(reg)}
              className={`text-xs px-3.5 py-1.5 rounded-full transition font-bold ${
                regionFilter === reg
                  ? "bg-[#009EDB] text-white shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              {reg}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-5">
        {filteredCountries.map((item) => (
          <div
            key={item.id}
            className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm hover:shadow-md transition flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-3xl">{item.flag}</span>
                <span
                  className={`text-xs font-black px-3 py-1 rounded-full flex items-center gap-1 ${
                    item.rank === 1
                      ? "bg-amber-100 text-amber-800 border border-amber-200"
                      : "bg-slate-100 text-slate-700"
                  }`}
                >
                  <Award className="w-3.5 h-3.5" />
                  Rank #{item.rank}
                </span>
              </div>

              <h3 className="text-base font-extrabold text-slate-900">{item.country}</h3>
              <p className="text-xs text-slate-500 font-semibold mb-3">{item.region}</p>

              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 mb-3">
                <span className="text-[10px] text-slate-500 block font-bold uppercase tracking-wider">
                  Growth Driver
                </span>
                <span className="text-xs font-bold text-slate-800 block mt-0.5">
                  {item.mostImprovedGoal}
                </span>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
              <span className="text-slate-500 font-semibold">Improvement</span>
              <span className="text-emerald-600 font-black flex items-center gap-0.5">
                <TrendingUp className="w-3.5 h-3.5" />
                {item.improvementDelta}
              </span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}