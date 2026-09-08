"use client";

import React, { useState } from "react";
import {
  BarChart3,
  Globe2,
  Map,
  Users,
  FileSpreadsheet,
  Cpu,
  Radio,
} from "lucide-react";

import {
  ComposableMap,
  Geographies,
  Geography,
} from "react-simple-maps";

// -----------------------------------------------------
// MOCK DATA
// -----------------------------------------------------

const regionalData = {
  na: {
    name: "North America",
    score: 74.5,
    fill: "fill-sky-500",
  },
  sa: {
    name: "South America",
    score: 68.2,
    fill: "fill-orange-500",
  },
  eu: {
    name: "Europe",
    score: 83.1,
    fill: "fill-emerald-500",
  },
  af: {
    name: "Africa",
    score: 58.4,
    fill: "fill-red-500",
  },
  as: {
    name: "Asia",
    score: 71.9,
    fill: "fill-yellow-500",
  },
  oc: {
    name: "Oceania & SEA",
    score: 69.8,
    fill: "fill-blue-500",
  },
};

const countries = [
  { rank: 1, name: "Sweden", score: 85.4 },
  { rank: 2, name: "Denmark", score: 84.1 },
  { rank: 3, name: "Finland", score: 82.7 },
  { rank: 4, name: "Germany", score: 81.3 },
  { rank: 5, name: "France", score: 80.6 },
];

const sdgGoals = [
  { goal: "SDG 1", value: 42 },
  { goal: "SDG 2", value: 61 },
  { goal: "SDG 3", value: 77 },
  { goal: "SDG 4", value: 56 },
  { goal: "SDG 5", value: 88 },
  { goal: "SDG 6", value: 68 },
];

const features = [
  {
    icon: Radio,
    title: "Live SDG",
    subtitle: "Scorecards",
  },
  {
    icon: BarChart3,
    title: "Country &",
    subtitle: "Regional Rankings",
  },
  {
    icon: Globe2,
    title: "Impact",
    subtitle: "Heat Maps",
  },
  {
    icon: Users,
    title: "Partnership",
    subtitle: "Tracker",
  },
  {
    icon: FileSpreadsheet,
    title: "Data Analytics",
    subtitle: "& Reports",
  },
  {
    icon: Cpu,
    title: "AI-Driven",
    subtitle: "Insights",
  },
];

// -----------------------------------------------------
// COMPONENT
// -----------------------------------------------------

export default function Home() {
  const [tooltip, setTooltip] = useState<{
    show: boolean;
    text: string;
    x: number;
    y: number;
  }>({
    show: false,
    text: "",
    x: 0,
    y: 0,
  });

  const handleMouseMove = (
    e: React.MouseEvent,
    regionKey: keyof typeof regionalData
  ) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const data = regionalData[regionKey];

    setTooltip({
      show: true,
      text: `${data.name}: ${data.score}`,
      x: e.clientX - rect.left + 10,
      y: e.clientY - rect.top - 20,
    });
  };

  return (
    <main
  className="
    min-h-screen
    bg-[#03091f]
    bg-cover
    bg-center
    bg-fixed
    text-white
    px-3 py-6 sm:px-6
  "
  style={{
    backgroundImage: "url('/images/sdg-background.jpg')",
  }}
>

      {/* =====================================================
          MAIN DASHBOARD
      ===================================================== */}
      <div className="mx-auto w-full max-w-[1100px]">

        <div
          className="
            overflow-hidden rounded-[28px]
            border border-[#173b70]
            bg-[#071331]
            shadow-[0_0_60px_rgba(0,120,255,0.12)]
          "
        >

          {/* =================================================
              HEADER
          ================================================= */}
          <header
            className="
              relative overflow-hidden
              px-5 py-6
              text-center
              sm:px-10 sm:py-8
            "
          >

            {/* Glow */}
            <div className="absolute left-1/2 top-0 h-40 w-80 -translate-x-1/2 rounded-full bg-sky-500/10 blur-3xl" />

            <div className="relative">


              {/* TITLE */}
              <h1
                className="
                  text-3xl font-black
                  uppercase leading-[0.95]
                  tracking-tight
                  text-white
                  sm:text-5xl
                "
              >
                GLOBAL SDG
                <br />
                DIGITAL DASHBOARD
              </h1>

              {/* SUBTITLE */}
              <p
                className="
                  mt-3
                  text-xs font-black
                  uppercase tracking-[0.28em]
                  text-sky-400
                  sm:text-sm
                "
              >
                DATA. INSIGHTS. IMPACT.
              </p>

              <p
                className="
                  mx-auto mt-3 max-w-2xl
                  text-[11px] leading-relaxed
                  text-slate-300
                  sm:text-sm
                "
              >
                A real-time digital platform to monitor, evaluate
                <br className="hidden sm:block" />
                and accelerate SDG progress worldwide.
              </p>

            </div>
          </header>


          {/* =================================================
              DASHBOARD CONTENT
          ================================================= */}
          <section className="px-4 pb-5 sm:px-6">

            {/* =================================================
                TOP ROW
            ================================================= */}
            <div className="grid grid-cols-1 gap-3 lg:grid-cols-3">

              {/* ---------------------------------------------
                  SDG OVERVIEW
              --------------------------------------------- */}
              <div
                className="
                  relative min-h-[270px]
                  overflow-hidden rounded-xl
                  border border-[#24467b]
                  bg-[#0a1b3d]
                  p-3
                  lg:col-span-2
                "
              >

                <div className="mb-2 flex items-center justify-between">

                  <span className="text-[9px] font-black uppercase tracking-wider text-slate-300">
                    SDG Overview
                  </span>

                  <span className="text-[8px] text-sky-400">
                    GLOBAL PROGRESS
                  </span>

                </div>


                {/* MAP AREA */}
{/* =====================================================
    INTERACTIVE SVG WORLD MAP
===================================================== */}

<div
  className="
    relative mt-4
    h-[250px]
    overflow-hidden
    rounded-lg
    border border-slate-700
    bg-[#06132d]
  "
>

  {/* Background glow */}
  <div
    className="
      pointer-events-none
      absolute inset-0
      bg-[radial-gradient(circle_at_center,rgba(14,165,233,0.18),transparent_65%)]
    "
  />

  {/* Grid */}
  <div
    className="
      pointer-events-none
      absolute inset-0
      z-10
      opacity-20
      [background-image:linear-gradient(rgba(50,150,255,.2)_1px,transparent_1px),linear-gradient(90deg,rgba(50,150,255,.2)_1px,transparent_1px)]
      [background-size:25px_25px]
    "
  />

  {/* SVG WORLD MAP */}
  <ComposableMap
    projection="geoEqualEarth"
    projectionConfig={{
      scale: 250,
    }}
    className="absolute inset-0 h-full w-full"
  >

    <Geographies geography="/world-110m.json">

      {({ geographies }) =>
        geographies.map((geo) => {

          const countryName =
            geo.properties.name;

          /*
           * Example regional score.
           * Later this can come from your database/API.
           */
          let score = 65;

          if (
            [
              "Canada",
              "United States of America",
            ].includes(countryName)
          ) {
            score = 74.5;
          }

          if (
            [
              "Germany",
              "France",
              "Sweden",
              "Denmark",
              "Finland",
            ].includes(countryName)
          ) {
            score = 83.1;
          }

          if (
            [
              "Brazil",
              "Argentina",
              "Chile",
            ].includes(countryName)
          ) {
            score = 68.2;
          }

          if (
            [
              "China",
              "Japan",
              "India",
              "South Korea",
            ].includes(countryName)
          ) {
            score = 71.9;
          }

          if (
            [
              "Australia",
              "New Zealand",
            ].includes(countryName)
          ) {
            score = 69.8;
          }

          if (
            [
              "Nigeria",
              "Ethiopia",
              "Kenya",
              "South Africa",
            ].includes(countryName)
          ) {
            score = 58.4;
          }

          return (
            <Geography
              key={geo.rsmKey}
              geography={geo}

              onMouseMove={(e) => {

                const mapRect =
                  e.currentTarget
                    .closest(".relative")
                    ?.getBoundingClientRect();

                if (!mapRect) return;

                setTooltip({
                  show: true,
                  text: `${countryName}: ${score}`,
                  x:
                    e.clientX -
                    mapRect.left +
                    12,
                  y:
                    e.clientY -
                    mapRect.top -
                    20,
                });

              }}

              onMouseLeave={() => {
                setTooltip((prev) => ({
                  ...prev,
                  show: false,
                }));
              }}

              style={{
                default: {
                  fill:
                    score >= 80
                      ? "#10b981"
                      : score >= 70
                      ? "#0ea5e9"
                      : score >= 60
                      ? "#eab308"
                      : "#ef4444",

                  stroke: "#071a36",
                  strokeWidth: 0.5,
                  outline: "none",

                  transition:
                    "all 200ms ease",
                },

                hover: {
                  fill: "#38bdf8",
                  stroke: "#ffffff",
                  strokeWidth: 1,
                  outline: "none",
                  cursor: "pointer",
                },

                pressed: {
                  fill: "#0284c7",
                  outline: "none",
                },
              }}
            />
          );
        })
      }

    </Geographies>

  </ComposableMap>


  {/* =====================================================
      MAP LEGEND
  ===================================================== */}

  <div
    className="
      absolute
      bottom-2
      right-2
      z-20
      rounded-md
      border border-slate-600
      bg-[#071331]/90
      px-2
      py-1
      backdrop-blur-sm
    "
  >

    <div className="mb-1 text-[6px] font-black uppercase text-slate-400">
      SDG Score
    </div>

    <div className="flex items-center gap-1">

      <span className="h-2 w-2 rounded-sm bg-red-500" />
      <span className="text-[6px] text-slate-400">
        &lt;60
      </span>

      <span className="h-2 w-2 rounded-sm bg-yellow-500" />
      <span className="text-[6px] text-slate-400">
        60–69
      </span>

      <span className="h-2 w-2 rounded-sm bg-sky-500" />
      <span className="text-[6px] text-slate-400">
        70–79
      </span>

      <span className="h-2 w-2 rounded-sm bg-emerald-500" />
      <span className="text-[6px] text-slate-400">
        80+
      </span>

    </div>

  </div>


  {/* =====================================================
      OVERALL PROGRESS
  ===================================================== */}

  <div
    className="
      absolute
      left-[2%]
      top-[80%]
      z-30
      -translate-y-1/2
    "
  >

    <div
      className="
        relative
        flex
        h-20
        w-20
        items-center
        justify-center
        rounded-full
        bg-[#071331]
        shadow-[0_0_25px_rgba(0,190,255,.25)]
      "
    >

      <div
        className="
          absolute
          inset-0
          rounded-full
          p-[5px]
        "
        style={{
          background:
            "conic-gradient(#10b981 0deg 190deg,#0ea5e9 190deg 263deg,#1e355f 263deg 360deg)",
        }}
      >

        <div
          className="
            h-full
            w-full
            rounded-full
            bg-[#071331]
          "
        />

      </div>

      <div className="relative text-center">

        <div className="text-xl font-black">
          73%
        </div>

        <div
          className="
            text-[6px]
            font-bold
            uppercase
            text-slate-400
          "
        >
          Overall Progress
        </div>

      </div>

    </div>

  </div>



  {/* =====================================================
      TOOLTIP
  ===================================================== */}

  {tooltip.show && (

    <div
      className="
        pointer-events-none
        absolute
        z-50
        rounded-md
        border
        border-sky-500
        bg-[#071331]
        px-2
        py-1
        text-[9px]
        font-bold
        text-white
        shadow-xl
      "
      style={{
        left: tooltip.x,
        top: tooltip.y,
      }}
    >
      {tooltip.text}
    </div>

  )}

</div>

              </div>


              {/* ---------------------------------------------
                  COUNTRY RANKINGS
              --------------------------------------------- */}
              <div
                className="
                  rounded-xl
                  border border-[#24467b]
                  bg-[#0a1b3d]
                  p-4
                "
              >

                <div className="mb-4 flex items-center justify-between">

                  <span className="text-[9px] font-black uppercase tracking-wider text-slate-300">
                    Country Rankings
                  </span>

                  <Globe2 className="h-4 w-4 text-sky-400" />

                </div>


                <div className="space-y-3">

                  {countries.map((country) => (
                    <div
                      key={country.rank}
                      className="
                        flex items-center justify-between
                        border-b border-slate-700/40
                        pb-2 transition
                        hover:bg-sky-500/10
                      "
                    >

                      <div className="flex items-center gap-2">

                        <span
                          className={`
                            w-4 text-center
                            text-[10px] font-black
                            ${
                              country.rank === 1
                                ? "text-amber-400"
                                : "text-slate-500"
                            }
                          `}
                        >
                          {country.rank}
                        </span>

                        <span className="text-[10px] font-semibold text-slate-200">
                          {country.name}
                        </span>

                      </div>

                      <span className="text-[10px] font-black text-emerald-400">
                        {country.score}
                      </span>

                    </div>
                  ))}

                </div>

              </div>

            </div>


            {/* =================================================
                SECOND ROW
            ================================================= */}
            <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-3">

              {/* PERFORMANCE */}
              <div
                className="
                  min-h-[180px]
                  rounded-xl
                  border border-[#24467b]
                  bg-[#0a1b3d]
                  p-4
                "
              >

                <div className="flex items-center justify-between">

                  <span className="text-[9px] font-black uppercase tracking-wider text-slate-300">
                    SDG Performance
                    <br />
                    By Goal
                  </span>

                  <BarChart3 className="h-4 w-4 text-sky-400" />

                </div>


                <div className="mt-6 flex h-28 items-end justify-between gap-2 px-2">

                  {sdgGoals.map((item, index) => (

                    <div
                      key={item.goal}
                      className="flex h-full flex-1 flex-col justify-end"
                    >

                      <div
                        className="
                          w-full rounded-t-sm
                          bg-gradient-to-t
                          from-sky-600
                          to-emerald-400
                          transition-all
                          hover:opacity-80
                        "
                        style={{
                          height: `${item.value}%`,
                        }}
                      />

                      <span className="mt-1 text-center text-[6px] text-slate-500">
                        {index + 1}
                      </span>

                    </div>

                  ))}

                </div>

              </div>


              {/* IMPACT HEAT MAP */}
              <div
                className="
                  min-h-[180px]
                  rounded-xl
                  border border-[#24467b]
                  bg-[#0a1b3d]
                  p-4
                "
              >

                <div className="flex items-center justify-between">

                  <span className="text-[9px] font-black uppercase tracking-wider text-slate-300">
                    Impact Heat Map
                  </span>

                  <Map className="h-4 w-4 text-sky-400" />

                </div>


                {/* Heat Map */}
                <div
                  className="
                    mt-4 h-[115px]
                    overflow-hidden rounded-lg
                    border border-slate-700
                    bg-[#06132d]
                    p-2
                  "
                >

                  <div className="grid h-full grid-cols-10 gap-[2px]">

                    {Array.from({ length: 100 }).map((_, i) => {

                      const intensity =
                        (i * 17) % 100;

                      let opacity =
                        Math.max(0.15, intensity / 100);

                      return (
                        <div
                          key={i}
                          className="rounded-[1px] bg-orange-500"
                          style={{
                            opacity,
                          }}
                        />
                      );
                    })}

                  </div>

                </div>

              </div>


              {/* REGIONAL PROGRESS */}
              <div
                className="
                  min-h-[180px]
                  rounded-xl
                  border border-[#24467b]
                  bg-[#0a1b3d]
                  p-4
                "
              >

                <span className="text-[9px] font-black uppercase tracking-wider text-slate-300">
                  Regional Progress
                </span>


                <div className="mt-3 flex items-center justify-center">

                  <div
                    className="
                      relative flex
                      h-28 w-28
                      items-center justify-center
                      rounded-full
                    "
                    style={{
                      background:
                        "conic-gradient(#10b981 0deg 259deg,#17345c 259deg 360deg)",
                    }}
                  >

                    <div
                      className="
                        flex h-20 w-20
                        items-center justify-center
                        rounded-full
                        bg-[#0a1b3d]
                      "
                    >

                      <div className="text-center">

                        <div className="text-2xl font-black">
                          72%
                        </div>

                        <div className="text-[6px] uppercase tracking-wider text-slate-500">
                          Regional Avg.
                        </div>

                      </div>

                    </div>

                  </div>

                </div>

              </div>

            </div>


            {/* =================================================
                KEY FEATURES
            ================================================= */}
            <div className="mt-5">

              <div className="mb-3 text-center">

                <span
                  className="
                    text-[11px]
                    font-black
                    uppercase
                    tracking-[0.2em]
                    text-white
                  "
                >
                  Key Features
                </span>

              </div>


              <div
                className="
                  grid grid-cols-2
                  gap-2
                  rounded-xl
                  border border-[#24467b]
                  bg-[#0a1b3d]
                  p-3
                  sm:grid-cols-3
                  lg:grid-cols-6
                "
              >

                {features.map((feature) => {

                  const Icon = feature.icon;

                  return (
                    <div
                      key={feature.title}
                      className="
                        group
                        flex flex-col
                        items-center
                        justify-center
                        rounded-lg
                        px-2 py-4
                        text-center
                        transition
                        hover:bg-sky-500/10
                      "
                    >

                      <div
                        className="
                          mb-2 flex
                          h-9 w-9
                          items-center justify-center
                          rounded-lg
                          border border-sky-400/50
                          bg-sky-500/10
                          text-sky-300
                          transition
                          group-hover:scale-110
                          group-hover:bg-sky-500/20
                        "
                      >
                        <Icon className="h-5 w-5" />
                      </div>

                      <div className="text-[8px] font-black uppercase text-slate-200">
                        {feature.title}
                      </div>

                      <div className="text-[7px] font-semibold text-slate-500">
                        {feature.subtitle}
                      </div>

                    </div>
                  );
                })}

              </div>

            </div>


            {/* =================================================
                FOOTER MESSAGE
            ================================================= */}
            <footer
              className="
                mt-4
                rounded-lg
                border border-[#24467b]
                bg-[#06132d]
                px-3 py-3
                text-center
              "
            >

              <p
                className="
                  text-[8px]
                  font-black
                  uppercase
                  tracking-[0.16em]
                  text-sky-300
                  sm:text-[10px]
                "
              >
                Transparency
                <span className="mx-2 text-slate-600">•</span>

                Accountability
                <span className="mx-2 text-slate-600">•</span>

                Evidence-Based Decisions
              </p>

            </footer>

          </section>

        </div>

      </div>

    </main>
  );
}