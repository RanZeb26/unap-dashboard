"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
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
// TYPES
// -----------------------------------------------------

interface Country {
  country_id: number;
  iso3: string;
  country_name: string;
  region_name: string | null;
  score: number | null;
}

interface SDGData {
  goal_id: number;
  goal_number: number;
  goal_name: string;
  average_score: number | null;
  country_count: number;
}

interface Ranking {
  country_id: number;
  iso3: string;
  country_name: string;
  region_name: string | null;
  score: number | null;
  sdg_count: number;
}

interface TrendData {
  trend: "improving" | "stable" | "declining";
  total: number;
}

interface RegionalData {
  region_id: number;
  region_name: string;
  average_score: number | null;
  country_count: number;
}

interface DashboardData {
  global_score: number;
  total_countries: number;
  total_scores: number;
  sdgs: SDGData[];
  rankings: Ranking[];
  trends: TrendData[];
  regions: RegionalData[];
}
const numericToISO3: Record<string, string> = {
  "004": "AFG",
  "008": "ALB",
  "012": "DZA",
  "020": "AND",
  "024": "AGO",
  "028": "ATG",
  "032": "ARG",
  "036": "AUS",
  "040": "AUT",
  "044": "BHS",
  "048": "BHR",
  "050": "BGD",
  "051": "ARM",
  "052": "BRB",
  "056": "BEL",
  "064": "BTN",
  "068": "BOL",
  "070": "BIH",
  "072": "BWA",
  "076": "BRA",
  "084": "BLZ",
  "090": "SLB",
  "096": "BRN",
  "100": "BGR",
  "104": "MMR",
  "108": "BDI",
  "112": "BLR",
  "116": "KHM",
  "120": "CMR",
  "124": "CAN",
  "132": "CPV",
  "140": "CAF",
  "144": "LKA",
  "148": "TCD",
  "152": "CHL",
  "156": "CHN",
  "158": "TWN",
  "170": "COL",
  "174": "COM",
  "175": "MYT",
  "178": "COG",
  "180": "COD",
  "188": "CRI",
  "191": "HRV",
  "192": "CUB",
  "196": "CYP",
  "203": "CZE",
  "204": "BEN",
  "208": "DNK",
  "212": "DMA",
  "214": "DOM",
  "218": "ECU",
  "222": "SLV",
  "226": "GNQ",
  "231": "ETH",
  "232": "ERI",
  "233": "EST",
  "242": "FJI",
  "246": "FIN",
  "250": "FRA",
  "262": "DJI",
  "266": "GAB",
  "268": "GEO",
  "270": "GMB",
  "275": "PSE",
  "276": "DEU",
  "288": "GHA",
  "300": "GRC",
  "308": "GRD",
  "320": "GTM",
  "324": "GIN",
  "328": "GUY",
  "332": "HTI",
  "336": "VAT",
  "340": "HND",
  "348": "HUN",
  "352": "ISL",
  "356": "IND",
  "360": "IDN",
  "364": "IRN",
  "368": "IRQ",
  "372": "IRL",
  "376": "ISR",
  "380": "ITA",
  "384": "CIV",
  "388": "JAM",
  "392": "JPN",
  "398": "KAZ",
  "400": "JOR",
  "404": "KEN",
  "408": "PRK",
  "410": "KOR",
  "414": "KWT",
  "417": "KGZ",
  "418": "LAO",
  "422": "LBN",
  "426": "LSO",
  "428": "LVA",
  "430": "LBR",
  "434": "LBY",
  "438": "LIE",
  "440": "LTU",
  "442": "LUX",
  "450": "MDG",
  "454": "MWI",
  "458": "MYS",
  "462": "MDV",
  "466": "MLI",
  "470": "MLT",
  "478": "MRT",
  "480": "MUS",
  "484": "MEX",
  "492": "MCO",
  "496": "MNG",
  "498": "MDA",
  "499": "MNE",
  "504": "MAR",
  "508": "MOZ",
  "512": "OMN",
  "516": "NAM",
  "520": "NRU",
  "524": "NPL",
  "528": "NLD",
  "548": "VUT",
  "554": "NZL",
  "558": "NIC",
  "562": "NER",
  "566": "NGA",
  "578": "NOR",
  "586": "PAK",
  "591": "PAN",
  "598": "PNG",
  "600": "PRY",
  "604": "PER",
  "608": "PHL",
  "616": "POL",
  "620": "PRT",
  "624": "GNB",
  "626": "TLS",
  "634": "QAT",
  "642": "ROU",
  "643": "RUS",
  "646": "RWA",
  "682": "SAU",
  "686": "SEN",
  "688": "SRB",
  "694": "SLE",
  "702": "SGP",
  "703": "SVK",
  "704": "VNM",
  "705": "SVN",
  "706": "SOM",
  "710": "ZAF",
  "716": "ZWE",
  "724": "ESP",
  "728": "SSD",
  "729": "SDN",
  "740": "SUR",
  "748": "SWZ",
  "752": "SWE",
  "756": "CHE",
  "760": "SYR",
  "762": "TJK",
  "764": "THA",
  "768": "TGO",
  "776": "TON",
  "780": "TTO",
  "784": "ARE",
  "788": "TUN",
  "792": "TUR",
  "795": "TKM",
  "800": "UGA",
  "804": "UKR",
  "807": "MKD",
  "818": "EGY",
  "826": "GBR",
  "834": "TZA",
  "840": "USA",
  "854": "BFA",
  "858": "URY",
  "860": "UZB",
  "862": "VEN",
  "887": "YEM",
  "894": "ZMB"
};
// -----------------------------------------------------
// FEATURES
// -----------------------------------------------------

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
  const [hoveredSDG, setHoveredSDG] = useState<number | null>(null);
const router = useRouter();
  const [dashboard, setDashboard] =
    useState<DashboardData | null>(null);

  const [countries, setCountries] =
    useState<Country[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

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

  // --------------------------------------------------
  // LOAD DASHBOARD DATA
  // --------------------------------------------------

  useEffect(() => {

    async function loadDashboard() {

      try {

        setLoading(true);
        setError("");

        const response =
          await fetch("/api/dashboard");

        if (!response.ok) {
          throw new Error(
            "Failed to load dashboard data."
          );
        }

        const data: DashboardData =
          await response.json();

        setDashboard(data);

        // Keep country map data
        setCountries(
          data.rankings.map((country) => ({
            country_id:
              country.country_id,

            iso3:
              country.iso3,

            country_name:
              country.country_name,

            region_name:
              country.region_name,

            score:
              country.score,
          }))
        );

      } catch (err: any) {

        console.error(err);

        setError(
          err.message ||
          "Unable to load dashboard data."
        );

      } finally {

        setLoading(false);

      }
    }

    loadDashboard();

  }, []);

  // --------------------------------------------------
  // COUNTRY SCORE MAP
  // --------------------------------------------------

  const countryScoreMap =
    useMemo(() => {

      return Object.fromEntries(
        countries.map((country) => [
          country.country_name,
          country.score,
        ])
      );

    }, [countries]);

  // --------------------------------------------------
  // GLOBAL SCORE
  // --------------------------------------------------

  const overallProgress =
    dashboard?.global_score || 0;

  const overallAngle =
    overallProgress * 3.6;

  // --------------------------------------------------
  // REGIONAL AVERAGE
  // --------------------------------------------------

  const regionalAverage =
    dashboard?.regions?.length
      ? dashboard.regions.reduce(
          (sum, region) =>
            sum +
            Number(region.average_score || 0),
          0
        ) /
        dashboard.regions.length
      : 0;

  const regionalAngle =
    regionalAverage * 3.6;

  // --------------------------------------------------
  // GET COUNTRY SCORE
  // --------------------------------------------------

  const getCountryScore =
    (countryName: string) => {

      const value =
        countryScoreMap[countryName];

      if (
        value === null ||
        value === undefined
      ) {
        return null;
      }

      return Number(value);
    };

  // --------------------------------------------------
  // SCORE COLOR
  // --------------------------------------------------

  const getScoreColor =
    (score: number) => {

      if (score >= 80)
        return "#10b981";

      if (score >= 70)
        return "#0ea5e9";

      if (score >= 60)
        return "#eab308";

      if (score > 0)
        return "#ef4444";

      return "#334155";
    };

  return (

    <main
      className="
        min-h-screen
        bg-[#77c136]
        bg-cover
        bg-center
        bg-fixed
        text-white
      "
    >

      {/* =====================================================
          MAIN DASHBOARD
      ===================================================== */}

      <div className="mx-auto w-full">

        <div
          className="
            overflow-hidden rounded-[28px]
            bg-[#ffffff]
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
              sm:px-10 sm:py-3
            "
          >

            <div
              className="
                absolute left-1/2 top-0
                h-40 w-80
                -translate-x-1/2
                rounded-full
                bg-sky-500/10
                blur-3xl
              "
            />

            <div
              className="
                relative z-10
                flex flex-col
                items-center
                justify-between
                gap-6
                md:flex-row
                md:gap-4
              "
            >

              {/* LEFT LOGO */}

              <div
                className="
                  flex w-full
                  justify-center
                  md:w-auto
                  md:justify-start
                "
              >

                <img
                  src="/images/GLOBAL-UNAP LOGO.jpg"
                  alt="United Nations Association of the Philippines"
                  className="
                    h-26 w-auto
                    object-contain
                    brightness-110
                  "
                />

              </div>


              {/* TITLE */}

              <div className="flex-1 text-center">

                <p
  className="
    text-[50px]
    font-black
    uppercase
    leading-[0.95]
    tracking-tight
    text-[#e73c10]
    [-webkit-text-stroke:2px_#000000]
  "
>
  GLOBAL SDG
  <br />
  DIGITAL DASHBOARD
</p>

<p
  className="
    mt-auto
    text-center
    text-xs
    font-black
    uppercase
    tracking-[0.28em]
    text-[#089faf]
  "
>
  DATA. INSIGHTS. IMPACT.
</p>


                <p
                  className="
                  text-center
                  mt-auto
                    max-w-2xl
                    text-[11px]
                    leading-relaxed
                    text-[#0f8f98]
                  "
                >
                  A real-time digital platform to monitor, evaluate
                  <br className="hidden sm:block" />
                  and accelerate SDG progress worldwide.
                </p>

              </div>


              {/* RIGHT LOGO */}

              <div
                className="
                  flex w-full
                  justify-center
                  md:w-auto
                  md:justify-end
                "
              >

                <img
                  src="/images/Goals2.jpg"
                  alt="SDG 17 Partnerships for the Goals"
                  className="
                    h-26 w-auto
                    rounded-md
                    object-contain
                  "
                />

              </div>

            </div>

          </header>


          {/* =================================================
              DASHBOARD CONTENT
          ================================================= */}

          <section className="px-4 pb-5 sm:px-6">

            {/* ERROR */}

            {error && (

              <div className="mb-3 rounded-lg bg-red-100 p-3 text-sm text-red-700">
                {error}
              </div>

            )}


            {/* =================================================
                TOP ROW
            ================================================= */}

            <div
              className="
                grid
                grid-cols-1
                gap-3
                lg:grid-cols-3
              "
            >

              {/* =================================================
                  SDG OVERVIEW
              ================================================= */}

              <div
                className="
                  min-h-[380px]
                  overflow-hidden
                  rounded-xl
                  border border-amber-400
                  bg-[#0f8f98]
                  p-3
                  sm:min-h-[440px]
                  md:min-h-[480px]
                  lg:col-span-2
                  flex flex-col
                "
              >

                <div
                  className="
                    mb-2
                    flex
                    items-center
                    justify-between
                  "
                >

                  <span
                    className="
                      text-[24px]
                      font-black
                      uppercase
                      tracking-wider
                      text-amber-400
                    "
                  >
                    SDG Overview
                  </span>

                  <span
                    className="
                      text-[1.3rem]
                      font-black
                      text-amber-400
                    "
                  >
                    GLOBAL PROGRESS
                  </span>

                </div>


                {/* =================================================
                    WORLD MAP
                ================================================= */}

                <div
                  className="
                    relative mt-4
                    h-[280px]
                    w-full
                    flex-1
                    overflow-hidden
                    rounded-lg
                    border border-amber-400
                    bg-[#077983]
                    sm:h-[340px]
                    md:h-[380px]
                  "
                >

                  {/* Background */}

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


                  {/* MAP */}

                  <ComposableMap
                    projection="geoEqualEarth"
                    projectionConfig={{
                      scale: 230,
                    }}
                    className="
                      absolute inset-0
                      h-full w-full
                    "
                  >

                    <Geographies
  geography="/world-110m.json"
>
  {({ geographies }) =>
    geographies.map((geo) => {

      // ----------------------------------------
      // GEOJSON NUMERIC COUNTRY ID
      // ----------------------------------------

      const numericId =
        String(geo.id);

      // ----------------------------------------
      // CONVERT NUMERIC ID → ISO3
      // ----------------------------------------

      const iso3 =
        numericToISO3[numericId];

      // ----------------------------------------
      // FIND DATABASE COUNTRY
      // ----------------------------------------

      const country =
        countries.find(
          (c) =>
            c.iso3?.toUpperCase() ===
            iso3?.toUpperCase()
        );

      // ----------------------------------------
      // COUNTRY NAME
      // ----------------------------------------

      const countryName =
        country?.country_name ||
        geo.properties.name;

      // ----------------------------------------
      // SCORE
      // ----------------------------------------

      const score =
        country?.score !== undefined &&
        country?.score !== null
          ? Number(country.score)
          : null;

      return (
        <Geography
          key={geo.rsmKey}
          geography={geo}

          onClick={() => {

            if (country) {

              router.push(
                `/countries/${country.country_id}`
              );

            } else {

              console.log(
                "Country not found:",
                {
                  numericId,
                  iso3,
                  countryName,
                }
              );

            }

          }}

          onMouseMove={(e) => {

            const mapRect =
              e.currentTarget
                .closest(".relative")
                ?.getBoundingClientRect();

            if (!mapRect)
              return;

            setTooltip({

              show: true,

              text:
                score !== null
                  ? `${countryName}: Score ${score.toFixed(1)}`
                  : `${countryName}: No data`,

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

            setTooltip(
              (prev) => ({
                ...prev,
                show: false,
              })
            );

          }}

          style={{

            default: {

              fill:
                score !== null
                  ? getScoreColor(score)
                  : "#909bac",

              stroke:
                "#071a36",

              strokeWidth:
                0.5,

              outline:
                "none",

            },

            hover: {

              fill:
                "#38bdf8",

              stroke:
                "#ffffff",

              strokeWidth:
                1,

              outline:
                "none",

              cursor:
                country
                  ? "pointer"
                  : "default",

            },

            pressed: {

              fill:
                "#0284c7",

              outline:
                "none",

            },

          }}

        />
      );

    })
  }
</Geographies>
                  </ComposableMap>


                  {/* =================================================
                      LEGEND
                  ================================================= */}

                  <div
                    className="
                      absolute
                      bottom-4
                      right-4
                      z-20
                      rounded-md
                      border border-slate-600
                      bg-[#071331]/90
                      px-2 py-1
                      backdrop-blur-sm
                    "
                  >

                    <div
                      className="
                        mb-1
                        text-[10px]
                        font-black
                        uppercase
                        text-slate-400
                      "
                    >
                      SDG Score
                    </div>

                    <div
                      className="
                        flex
                        items-center
                        gap-1
                      "
                    >

                      <span className="h-2 w-2 rounded-sm bg-red-500" />
                      <span className="text-[10px] text-slate-400">
                        &lt;60
                      </span>

                      <span className="h-2 w-2 rounded-sm bg-yellow-500" />
                      <span className="text-[10px] text-slate-400">
                        60–69
                      </span>

                      <span className="h-2 w-2 rounded-sm bg-sky-500" />
                      <span className="text-[10px] text-slate-400">
                        70–79
                      </span>

                      <span className="h-2 w-2 rounded-sm bg-emerald-500" />
                      <span className="text-[10px] text-slate-400">
                        80+
                      </span>

                    </div>

                  </div>


                  {/* =================================================
                      GLOBAL SCORE
                  ================================================= */}

                  <div
                    className="
                      absolute
                      left-[3%]
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
                            `conic-gradient(
                              #0af45c 0deg ${overallAngle}deg,
                              #1e355f ${overallAngle}deg 360deg
                            )`,
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

                          {loading
                            ? "..."
                            : `${Number(overallProgress || 0).toFixed(1)}%`}

                        </div>

                        <div
                          className="
                            text-[9px]
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


                  {/* =================================================
                      TOOLTIP
                  ================================================= */}

                  {tooltip.show && (

                    <div
                      className="
                        pointer-events-none
                        absolute
                        z-50
                        rounded-md
                        border
                        border-amber-400
                        bg-[#063f44]
                        px-3 py-2
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


              {/* =================================================
                  COUNTRY RANKINGS
              ================================================= */}

              <div
                className="
                  rounded-xl
                  border border-amber-400
                  bg-[#8e44ad]
                  p-4
                "
              >

                <div
                  className="
                    mb-4
                    flex
                    items-center
                    justify-between
                  "
                >

                  <span
                    className="
                      text-[1.4rem]
                      font-black
                      uppercase
                      tracking-wider
                      text-[#f2d385]
                    "
                  >
                    Country Rankings
                  </span>

                  <Globe2
                    className="
                      h-4 w-4
                      text-amber-400
                    "
                  />

                </div>


                {loading ? (

                  <div
                    className="
                      py-8
                      text-center
                      text-sm
                      text-slate-300
                    "
                  >
                    Loading rankings...
                  </div>

                ) : !dashboard ||
                  dashboard.rankings.length === 0 ? (

                  <div
                    className="
                      py-8
                      text-center
                      text-sm
                      text-slate-300
                    "
                  >
                    No ranking data available.
                  </div>

                ) : (

                  <div className="space-y-3">

  {dashboard.rankings
    .slice(0, 10)
    .map((country, index) => (

      <div
        key={country.country_id}
        onClick={() =>
          router.push(
            `/countries/${country.country_id}`
          )
        }
        className="
          flex
          cursor-pointer
          items-center
          justify-between
          border-b
          border-slate-700/40
          pb-2
          transition
          duration-200
          hover:bg-sky-500/20
          hover:translate-x-1
          rounded-md
          px-1
          py-1
        "
      >

        <div
          className="
            flex
            items-center
            gap-2
          "
        >

          <span
            className={`
              w-4
              text-center
              text-[12px]
              font-black
              ${
                index === 0
                  ? "text-amber-400"
                  : "text-white"
              }
            `}
          >
            {index + 1}
          </span>

          <div>

            <div
              className="
                text-[18px]
                font-semibold
                text-white
              "
            >
              {country.country_name}
            </div>

            <div
              className="
                text-[9px]
                text-amber-400
              "
            >
              {country.iso3}
            </div>

          </div>

        </div>

        <span
          className="
            text-[12px]
            font-black
            text-white
          "
        >
          {country.score !== null
            ? Number(country.score).toFixed(1)
            : "N/A"}
        </span>

      </div>

    ))}

</div>

                )}

              </div>

            </div>


            {/* =================================================
                SECOND ROW
            ================================================= */}

            <div
              className="
                mt-3
                grid
                grid-cols-1
                gap-3
                md:grid-cols-3
              "
            >

              {/* =================================================
                  SDG PERFORMANCE
              ================================================= */}

<div
  className="
    min-h-[220px]
    rounded-xl
    border border-amber-400
    bg-[#bdc3c7]
    p-4
  "
>
  {/* HEADER */}
  <div className="flex items-center justify-between">
    <span
      className="
        text-[12px]
        font-black
        uppercase
        tracking-wider
        text-[#263667]
      "
    >
      SDG Performance
      <br />
      By Goal
    </span>

    <BarChart3 className="h-4 w-4 text-amber-400" />
  </div>

  {/* CHART */}
  <div className="mt-5 flex h-[145px]">

    {/* Y AXIS */}
    <div
      className="
        flex
        w-7
        flex-col
        justify-between
        pb-5
        pr-1
        text-right
        text-[12px]
        font-semibold
        text-[#263667]
      "
    >
      <span>100</span>
      <span>80</span>
      <span>60</span>
      <span>40</span>
      <span>20</span>
      <span>0</span>
    </div>

    {/* GRAPH AREA */}
    <div className="relative flex-1">

      {/* GRID LINES */}
      <div
        className="
          pointer-events-none
          absolute
          inset-x-0
          top-0
          bottom-5
          flex
          flex-col
          justify-between
        "
      >
        {[100, 80, 60, 40, 20, 0].map((line) => (
          <div
            key={line}
            className="
              w-full
              border-t
              border-white/25
            "
          />
        ))}
      </div>

      {/* BARS */}
      <div
        className="
          relative
          z-10
          flex
          h-full
          items-end
          justify-between
          gap-1
          px-1
        "
      >

        {loading ? (

          <div className="flex w-full items-center justify-center pb-8 text-xs text-white">
            Loading...
          </div>

        ) : dashboard?.sdgs &&
          dashboard.sdgs.length > 0 ? (

          dashboard.sdgs.map((item) => {

            const value =
              Number(item.average_score) || 0;

            const sdgColors: Record<number, string> = {
              1: "#E5243B",
              2: "#DDA63A",
              3: "#4C9F38",
              4: "#C5192D",
              5: "#FF3A21",
              6: "#26BDE2",
              7: "#FCC30B",
              8: "#A21942",
              9: "#FD6925",
              10: "#DD1367",
              11: "#FD9D24",
              12: "#BF8B2E",
              13: "#3F7E44",
              14: "#0A97D9",
              15: "#56C02B",
              16: "#00689D",
              17: "#19486A",
            };

            const barColor =
              sdgColors[item.goal_number] || "#38bdf8";

            return (
              <div
                key={item.goal_id}
                className="
                  flex
                  h-full
                  min-w-0
                  flex-1
                  flex-col
                  items-center
                  justify-end
                "
              >

{/* BAR + VALUE */}
<div
  className="
    relative
    flex
    w-full
    flex-1
    items-end
  "
>
  {/* TOOLTIP */}
  {hoveredSDG === item.goal_id && (
    <div
      className="
        absolute
        bottom-full
        left-1/2
        z-50
        mb-2
        -translate-x-1/2
        whitespace-nowrap
        rounded-lg
        border
        border-amber-400
        bg-[#063f44]
        px-3
        py-2
        text-[10px]
        shadow-xl
      "
    >
      <div className="font-black text-[white]">
        SDG {item.goal_number}
      </div>

      <div className="mt-1 flex items-center gap-1">
        <span
          className="h-2 w-2 rounded-full"
          style={{
            backgroundColor: barColor,
          }}
        />

        <span className="text-white/80">
          Score:
        </span>

        <span className="font-bold text-amber-400">
          {value.toFixed(1)}
        </span>
      </div>
    </div>
  )}

  {/* VALUE LABEL */}
  <span
    className="
      absolute
      left-1/2
      -translate-x-1/2
      text-[15px]
      font-bold
      text-[#0876d8]
    "
    style={{
      bottom: `${Math.min(value, 100)}%`,
      transform: "translate(-50%, 4px)",
    }}
  >
    {value.toFixed(0)}
  </span>

  {/* BAR */}
  <div
    className="
      w-full
      cursor-pointer
      rounded-t-sm
      transition-all
      duration-200
      hover:brightness-110
      hover:scale-x-105
    "
    style={{
      backgroundColor: barColor,
      height: `${Math.min(value, 100)}%`,
    }}
    onMouseEnter={() =>
      setHoveredSDG(item.goal_id)
    }
    onMouseLeave={() =>
      setHoveredSDG(null)
    }
  />
</div>

                {/* X AXIS LABEL */}
                <span
                  className="
                    mt-1
                    text-center
                    text-[12px]
                    font-bold
                    text-[#263667]
                  "
                >
                  {item.goal_number}
                </span>

              </div>
            );
          })

        ) : (

          <div className="flex w-full items-center justify-center pb-8 text-xs text-white">
            No SDG data available
          </div>

        )}

      </div>

    </div>
  </div>
</div>


              {/* =================================================
                  IMPACT HEAT MAP
              ================================================= */}

              <div
                className="
                  min-h-[180px]
                  rounded-xl
                  border border-amber-400
                  bg-[#1b963b]
                  p-4
                "
              >

                <div
                  className="
                    flex
                    items-center
                    justify-between
                  "
                >

                  <span
                    className="
                      text-[12px]
                      font-black
                      uppercase
                      tracking-wider
                      text-amber-400
                    "
                  >
                    Impact Heat Map
                  </span>

                  <Map
                    className="
                      h-4 w-4
                      text-amber-400
                    "
                  />

                </div>


                <div
                  className="
                    mt-4
                    h-[115px]
                    overflow-hidden
                    rounded-lg
                    border border-amber-400
                    bg-[#1b963b]
                    p-2
                  "
                >

                  <div
                    className="
                      grid
                      h-full
                      grid-cols-10
                      gap-[2px]
                    "
                  >

                    {Array.from({
                      length: 100,
                    }).map(
                      (_, i) => {

                        /*
                         * Use real SDG scores
                         * to generate the heat cells.
                         */

                        const score =
                          dashboard?.rankings?.[
                            i %
                              Math.max(
                                dashboard
                                  ?.rankings
                                  ?.length || 1,
                                1
                              )
                          ]?.score;

                        const intensity =
                          score !== null &&
                          score !== undefined
                            ? Number(score)
                            : 20;

                        const opacity =
                          Math.max(
                            0.15,
                            Math.min(
                              intensity / 100,
                              1
                            )
                          );

                        return (

                          <div
                            key={i}
                            className="
                              rounded-[1px]
                              bg-orange-500
                            "
                            style={{
                              opacity,
                            }}
                          />

                        );

                      }
                    )}

                  </div>

                </div>

              </div>


              {/* =================================================
                  REGIONAL PROGRESS
              ================================================= */}

              <div
                className="
                  min-h-[180px]
                  rounded-xl
                  border border-amber-400
                  bg-[#e5243b]
                  p-4
                "
              >

                <span
                  className="
                    text-[12px]
                    font-black
                    uppercase
                    tracking-wider
                    text-amber-400
                  "
                >
                  Regional Progress
                </span>


                <div
                  className="
                    mt-3
                    flex
                    items-center
                    justify-center
                  "
                >

                  <div
                    className="
                      relative
                      flex
                      h-28
                      w-28
                      items-center
                      justify-center
                      rounded-full
                    "
                    style={{
                      background:
                        `conic-gradient(
                          #10b981 0deg ${regionalAngle}deg,
                          #17345c ${regionalAngle}deg 360deg
                        )`,
                    }}
                  >

                    <div
                      className="
                        flex
                        h-20
                        w-20
                        items-center
                        justify-center
                        rounded-full
                        bg-[#077983]
                      "
                    >

                      <div className="text-center">

                        <div className="text-2xl font-black">

                          {loading
                            ? "..."
                            : `${regionalAverage.toFixed(1)}%`}

                        </div>

                        <div
                          className="
                            text-[6px]
                            uppercase
                            tracking-wider
                            text-slate-500
                          "
                        >
                          Regional Avg.
                        </div>

                      </div>

                    </div>

                  </div>

                </div>

              </div>

            </div>


            {/* =================================================
                DATA SUMMARY
            ================================================= */}

            {/* <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-3">

              <div
                className="
                  rounded-xl
                  border border-amber-400
                  bg-[#077983]
                  p-3
                  text-center
                "
              >

                <div className="text-[9px] uppercase font-black text-amber-400">
                  Countries
                </div>

                <div className="text-xl font-black text-white">

                  {loading
                    ? "..."
                    : dashboard?.total_countries || 0}

                </div>

              </div>


              <div
                className="
                  rounded-xl
                  border border-amber-400
                  bg-[#077983]
                  p-3
                  text-center
                "
              >

                <div className="text-[9px] uppercase font-black text-amber-400">
                  SDG Records
                </div>

                <div className="text-xl font-black text-white">

                  {loading
                    ? "..."
                    : dashboard?.total_scores || 0}

                </div>

              </div>


              <div
                className="
                  rounded-xl
                  border border-amber-400
                  bg-[#077983]
                  p-3
                  text-center
                "
              >

                <div className="text-[9px] uppercase text-amber-400 font-black">
                  SDG Goals
                </div>

                <div className="text-xl font-black text-white">

                  {loading
                    ? "..."
                    : dashboard?.sdgs?.length || 0}

                </div>

              </div>

            </div> */}


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
                    text-[#0f8f98]
                  "
                >
                  Key Features
                </span>

              </div>


              <div
                className="
                  grid
                  grid-cols-2
                  gap-2
                  rounded-xl
                  border border-amber-400
                  bg-[#077983]
                  p-3
                  sm:grid-cols-3
                  lg:grid-cols-6
                "
              >

                {features.map(
                  (feature) => {

                    const Icon =
                      feature.icon;

                    return (

                      <div
                        key={
                          feature.title
                        }
                        className="
                          group
                          flex
                          flex-col
                          items-center
                          justify-center
                          rounded-lg
                          px-2 py-4
                          text-center
                          transition
                          hover:bg-amber-500/10
                        "
                      >

                        <div
                          className="
                            mb-2
                            flex
                            h-20 w-20
                            items-center
                            justify-center
                            rounded-lg
                            border
                            border-amber-400/50
                            bg-amber-500/10
                            text-amber-300
                            transition
                            group-hover:scale-110
                            group-hover:bg-amber-500/20
                          "
                        >

                          <Icon
                            className="
                              h-40 w-40
                            "
                          />

                        </div>

                        <div
                          className="
                            text-[15px]
                            font-semibold
                            uppercase
                            text-white
                          "
                        >
                          {feature.title}
                        </div>

                        <div
                          className="
                            text-[15px]
                            font-semibold
                            uppercase
                            text-white
                          "
                        >
                          {feature.subtitle}
                        </div>

                      </div>

                    );

                  }
                )}

              </div>

            </div>


            {/* =================================================
                FOOTER
            ================================================= */}

            <footer
              className="
                mt-4
                rounded-lg
                px-3 py-3
                text-center
              "
            >

              <p
                className="
                  text-[10px]
                  font-black
                  uppercase
                  tracking-[0.16em]
                  text-white
                  sm:text-[12px]
                "
              >


                Transparency

                <span className="mx-2 text-amber-400">
                  •
                </span>

                Accountability

                <span className="mx-2 text-amber-400">
                  •
                </span>

                Evidence-Based Decisions

              </p>
                <img
                  src="/images/SDGS Strip.jpg"
                  alt="United Nations Association of the Philippines"
                  className="
                    h-26 w-full
                    rounded-lg
                    object-contain
                    brightness-110
                    zindex-10
                  "
                />
            </footer>

          </section>

        </div>

      </div>

    </main>
  );
}