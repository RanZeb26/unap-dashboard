"use client";

import React, { useState } from "react";
import { SDG_GOALS, SDGGoal } from "@/data/sdgData";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
  CartesianGrid,
} from "recharts";
import { Globe, TrendingUp, ShieldCheck, ChevronRight } from "lucide-react";

export default function SDGStatusDashboard() {
  const [selectedGoal, setSelectedGoal] = useState<SDGGoal>(SDG_GOALS[0]);
  const [activeRegionTab, setActiveRegionTab] = useState<string>("All");

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 py-12 space-y-8">
      {/* Title Header - Rotary.org Typography Style */}
      <div className="border-b border-slate-200 pb-5 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <span className="text-xs font-black text-[#009EDB] uppercase tracking-widest block mb-1">
            Global Analytics Index
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Sustainable Development Goals Status
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-2xl">
            Real-time indicator metrics aggregated from Kaggle & Statista datasets, categorized across Asia Pacific, EMEA, and Americas.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-slate-100 p-1.5 rounded-full border border-slate-200">
          <span className="text-xs text-slate-500 px-3 font-semibold">Filter Grid:</span>
          {["All", "Poverty", "Health", "Climate"].map((filter) => (
            <button
              key={filter}
              onClick={() => {
                if (filter === "Poverty") setSelectedGoal(SDG_GOALS[0]);
                if (filter === "Health") setSelectedGoal(SDG_GOALS[2]);
                if (filter === "Climate") setSelectedGoal(SDG_GOALS[12]);
              }}
              className="text-xs px-3.5 py-1.5 rounded-full font-bold transition-all bg-white text-slate-800 hover:bg-[#3ca367] hover:text-white shadow-sm"
            >
              {filter}
            </button>
          ))}
        </div>
      </div>

      {/* 17 SDG Grid Selector - Rotary Pill Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 lg:grid-cols-9 gap-3">
        {SDG_GOALS.map((goal) => {
          const isSelected = selectedGoal.id === goal.id;
          return (
            <button
              key={goal.id}
              onClick={() => setSelectedGoal(goal)}
              className={`p-3 rounded-2xl text-left transition-all duration-200 border flex flex-col justify-between h-24 ${
                isSelected
                  ? "bg-white border-[#00db0b] shadow-lg ring-2 ring-[#009EDB]/20 scale-[1.02]"
                  : "bg-white border-slate-200 hover:border-slate-300 hover:shadow-md"
              }`}
            >
              <div className="flex justify-between items-center w-full">
                <span
                  className="w-6 h-6 rounded-lg flex items-center justify-center text-xs font-black text-white"
                  style={{ backgroundColor: goal.color }}
                >
                  {goal.id}
                </span>
                <span className="text-[11px] font-black text-slate-700">
                  {goal.globalAverage}%
                </span>
              </div>
              <p className="text-[11px] font-bold text-slate-800 line-clamp-2 leading-tight">
                {goal.title}
              </p>
            </button>
          );
        })}
      </div>

      {/* Main Focus Card - Rotary News Split-Card Style */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Side: Summary Card */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div
                className="w-12 h-12 rounded-2xl flex items-center justify-center text-lg font-black text-white shadow-md"
                style={{ backgroundColor: selectedGoal.color }}
              >
                {selectedGoal.id}
              </div>
              <div>
                <span className="text-[10px] font-bold text-[#009EDB] uppercase tracking-wider block">
                  Active Focus Target
                </span>
                <h3 className="text-xl font-extrabold text-slate-900">{selectedGoal.title}</h3>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mb-6">
              {selectedGoal.description}
            </p>

            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2 mb-6">
              <div className="flex justify-between text-xs">
                <span className="text-slate-500 font-semibold">Key Metric Label</span>
                <span className="font-bold text-slate-900">{selectedGoal.keyMetricLabel}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-slate-500 font-semibold">Value Indicator</span>
                <span className="font-black text-[#009EDB] text-sm">{selectedGoal.keyMetricValue}</span>
              </div>
            </div>
          </div>

          <div className="space-y-2 pt-4 border-t border-slate-200">
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-600 font-bold">Global Progress Benchmark</span>
              <span className="text-[#009EDB] font-black text-base">{selectedGoal.globalAverage}%</span>
            </div>
            <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden border border-slate-200">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${selectedGoal.globalAverage}%`,
                  backgroundColor: selectedGoal.color,
                }}
              />
            </div>
          </div>
        </div>

        {/* Right Side: Interactive Bar Chart */}
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm flex flex-col justify-between">
          {/* <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Globe className="w-5 h-5 text-[#009EDB]" />
                Regional Index Breakdown
              </h3>
              <p className="text-xs text-slate-500">Statista & Kaggle multi-continent comparative data</p>
            </div>
            <span className="text-xs font-bold px-3 py-1 rounded-full bg-sky-50 text-[#009EDB] border border-sky-100 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" /> Verified
            </span>
          </div> */}

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={selectedGoal.regions} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="region" stroke="#64748b" fontSize={12} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={12} domain={[0, 100]} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#ffffff",
                    borderColor: "#e2e8f0",
                    borderRadius: "16px",
                    color: "#0f172a",
                    boxShadow: "0 10px 15px -3px rgba(0,0,0,0.1)",
                  }}
                  formatter={(value: any) => [`${value}% Score`, "Index"]}
                />
                <Bar dataKey="score" radius={[8, 8, 0, 0]} barSize={48}>
                  {selectedGoal.regions.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={selectedGoal.color} opacity={0.85 + index * 0.05} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-3 gap-3 mt-6 pt-4 border-t border-slate-200">
            {selectedGoal.regions.map((reg) => (
              <div key={reg.region} className="p-3 bg-slate-50 rounded-2xl border border-slate-200">
                <span className="text-[11px] text-slate-500 font-semibold block">{reg.region}</span>
                <div className="flex items-center justify-between mt-1">
                  <span className="text-base font-extrabold text-slate-900">{reg.score}%</span>
                  <span className="text-xs text-emerald-600 font-bold flex items-center gap-0.5">
                    <TrendingUp className="w-3 h-3" /> +{reg.growthRate}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}