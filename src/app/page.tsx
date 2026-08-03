import SDGStatusDashboard from "@/components/SDGStatusDashboard";
import SummitOrganizer from "@/components/SummitOrganizer";
import CountryAwards from "@/components/CountryAwards";
import { ArrowDown, Globe2, ShieldCheck, Sparkles } from "lucide-react";

export default function Home() {
  return (
    <div className="space-y-4">
      {/* Parallax Clean Hero Section */}
      <section className="relative min-h-[85vh] bg-gradient-to-b from-sky-100 via-white to-slate-50 flex items-center justify-center px-4 sm:px-6 overflow-hidden">
        {/* Standardized Background Graphics */}
        <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-unap-brand/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-4xl mx-auto text-center space-y-6 relative z-10 pt-12">
          <div className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest text-unap-brand bg-sky-50 px-4 py-2 rounded-full border border-sky-200 shadow-sm">
            <Sparkles className="w-4 h-4" /> United Nations Association of the Philippines
          </div>

          <h1 className="text-4xl sm:text-6xl font-black text-unap-gold tracking-tight leading-tight">
            Connecting Global Goals to <br />
            <span className="text-unap-brand">National Action</span>
          </h1>

          <p className="text-slate-600 text-sm sm:text-lg max-w-2xl mx-auto leading-relaxed">
            The official UNA Global & UNAP SDG Impact Dashboard tracking sustainable progress, annual summits, and national achievement awards.
          </p>

          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
            <a
              href="#sdg-tracker"
              className="w-full sm:w-auto px-8 py-4 rounded-full bg-unap-brand hover:bg-unap-brandhowver text-white font-extrabold text-sm transition shadow-lg shadow-sky-500/25 flex items-center justify-center gap-2"
            >
              Explore SDG Dashboard <ArrowDown className="w-4 h-4" />
            </a>
            <a
              href="https://una-global.org"
              target="_blank"
              rel="noreferrer"
              className="w-full sm:w-auto px-8 py-4 rounded-full bg-white hover:bg-slate-50 text-slate-800 font-extrabold text-sm transition border border-slate-200 shadow-sm"
            >
              Visit UNA Global Main Site
            </a>
          </div>

          {/* Key Metrics Snapshot Pills */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-12 max-w-3xl mx-auto">
            <div className="p-4 bg-white/80 backdrop-blur-md rounded-2xl border border-slate-200 shadow-sm">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">Goals</span>
              <span className="text-2xl font-black text-slate-900 mt-1 block">17 SDGs</span>
            </div>
            <div className="p-4 bg-white/80 backdrop-blur-md rounded-2xl border border-slate-200 shadow-sm">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">Regions</span>
              <span className="text-2xl font-black text-unap-brand mt-1 block">3 Continents</span>
            </div>
            <div className="p-4 bg-white/80 backdrop-blur-md rounded-2xl border border-slate-200 shadow-sm">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">Data Source</span>
              <span className="text-2xl font-black text-emerald-600 mt-1 block">Statista</span>
            </div>
            <div className="p-4 bg-white/80 backdrop-blur-md rounded-2xl border border-slate-200 shadow-sm">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">Target</span>
              <span className="text-2xl font-black text-unap-gold mt-1 block">2030 Agenda</span>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Sections */}
      <div id="sdg-tracker">
        <SDGStatusDashboard />
      </div>

      <SummitOrganizer />

      <CountryAwards />
    </div>
  );
}
