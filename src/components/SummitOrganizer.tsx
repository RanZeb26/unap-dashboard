"use client";

import React, { useState } from "react";
import { SUMMIT_EVENTS, SummitEvent } from "@/data/sdgData";
import { Calendar, MapPin, Users, Plus, CheckCircle2, Clock, Sparkles, X, Mic } from "lucide-react";

export default function SummitOrganizer() {
  const [events, setEvents] = useState<SummitEvent[]>(SUMMIT_EVENTS);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    year: 2027,
    date: "",
    location: "",
    delegatesCount: 2000,
    keyNoteSpeaker: "",
    theme: "",
  });

  const handleAddEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.location || !formData.date) return;

    const newEvent: SummitEvent = {
      id: `summit-${Date.now()}`,
      title: formData.title,
      year: Number(formData.year),
      date: formData.date,
      location: formData.location,
      status: "Upcoming",
      delegatesCount: Number(formData.delegatesCount),
      keyNoteSpeaker: formData.keyNoteSpeaker || "TBA",
      theme: formData.theme || "Accelerating Global Sustainability Targets",
    };

    setEvents([newEvent, ...events]);
    setShowModal(false);
    setFormData({
      title: "",
      year: 2027,
      date: "",
      location: "",
      delegatesCount: 2000,
      keyNoteSpeaker: "",
      theme: "",
    });
  };

  return (
    <section className="bg-slate-900/60 border border-slate-800/80 backdrop-blur-xl rounded-3xl p-6 space-y-6 shadow-2xl relative overflow-hidden">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-5">
        <div>
          <div className="flex items-center gap-2 text-blue-400 text-xs font-semibold tracking-wider uppercase mb-1">
            <Calendar className="w-4 h-4" /> Global Leadership Assembly
          </div>
          <h2 className="text-xl font-black text-white tracking-tight">
            SDG Global Summit Organizer
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Schedule, manage, and coordinate annual UNA Global summits and delegation assemblies
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white text-xs font-bold px-5 py-3 rounded-2xl transition shadow-lg shadow-blue-500/20 flex items-center gap-2 shrink-0 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          Schedule Summit
        </button>
      </div>

      {/* Conference Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {events.map((event) => {
          const isUpcoming = event.status === "Upcoming";
          return (
            <div
              key={event.id}
              className={`p-6 rounded-2xl border flex flex-col justify-between transition-all duration-300 relative group ${
                isUpcoming
                  ? "bg-slate-800/70 border-blue-500/40 shadow-xl shadow-blue-500/5 ring-1 ring-blue-500/20"
                  : "bg-slate-900/40 border-slate-800/80 opacity-75 hover:opacity-100"
              }`}
            >
              <div>
                <div className="flex justify-between items-center mb-4">
                  <span className="text-xs font-black text-blue-400 bg-blue-500/10 px-3 py-1 rounded-xl border border-blue-500/20">
                    Year {event.year}
                  </span>
                  <span
                    className={`text-[10px] font-bold px-3 py-1 rounded-full flex items-center gap-1.5 ${
                      isUpcoming
                        ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                        : "bg-slate-800 text-slate-400 border border-slate-700"
                    }`}
                  >
                    {isUpcoming ? <Clock className="w-3 h-3" /> : <CheckCircle2 className="w-3 h-3" />}
                    {event.status}
                  </span>
                </div>

                <h3 className="font-bold text-white text-base mb-2 group-hover:text-blue-400 transition">
                  {event.title}
                </h3>
                <p className="text-xs text-slate-400 italic mb-4 line-clamp-2">
                  &ldquo;{event.theme}&rdquo;
                </p>

                <div className="space-y-2 text-xs text-slate-300 bg-slate-900/50 p-3.5 rounded-xl border border-slate-800/60">
                  <p className="flex items-center gap-2.5">
                    <Calendar className="w-4 h-4 text-blue-400 shrink-0" />
                    {event.date}
                  </p>
                  <p className="flex items-center gap-2.5">
                    <MapPin className="w-4 h-4 text-blue-400 shrink-0" />
                    {event.location}
                  </p>
                  <p className="flex items-center gap-2.5">
                    <Users className="w-4 h-4 text-blue-400 shrink-0" />
                    <span className="font-bold text-white">{event.delegatesCount.toLocaleString()}</span> Confirmed Delegates
                  </p>
                </div>
              </div>

              <div className="mt-5 pt-3.5 border-t border-slate-800/80 flex items-center justify-between text-xs">
                <span className="text-slate-400 flex items-center gap-1.5 font-medium">
                  <Mic className="w-3.5 h-3.5 text-blue-400" /> Keynote:
                </span>
                <span className="font-bold text-slate-200">{event.keyNoteSpeaker}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal for Scheduling New Event */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-lg w-full text-white shadow-2xl relative">
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-white p-1 rounded-full hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 text-blue-400 text-xs font-bold uppercase mb-1">
              <Sparkles className="w-4 h-4" /> Global Assembly Coordination
            </div>
            <h3 className="text-xl font-black mb-4">Schedule New Summit</h3>

            <form onSubmit={handleAddEvent} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-400 mb-1 font-semibold">Summit Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. UNA Global SDG Summit 2027"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full bg-slate-800/80 border border-slate-700 rounded-xl p-3 text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-semibold">Summit Theme</label>
                <input
                  type="text"
                  placeholder="e.g. Scaling Renewable Grid Infrastructure"
                  value={formData.theme}
                  onChange={(e) => setFormData({ ...formData, theme: e.target.value })}
                  className="w-full bg-slate-800/80 border border-slate-700 rounded-xl p-3 text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">Year</label>
                  <input
                    type="number"
                    required
                    value={formData.year}
                    onChange={(e) => setFormData({ ...formData, year: Number(e.target.value) })}
                    className="w-full bg-slate-800/80 border border-slate-700 rounded-xl p-3 text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">Delegates Target</label>
                  <input
                    type="number"
                    required
                    value={formData.delegatesCount}
                    onChange={(e) =>
                      setFormData({ ...formData, delegatesCount: Number(e.target.value) })
                    }
                    className="w-full bg-slate-800/80 border border-slate-700 rounded-xl p-3 text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">Date</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. October 5, 2027"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="w-full bg-slate-800/80 border border-slate-700 rounded-xl p-3 text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">Location</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Paris, France"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    className="w-full bg-slate-800/80 border border-slate-700 rounded-xl p-3 text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-semibold">Keynote Speaker</label>
                <input
                  type="text"
                  placeholder="e.g. UN Representative"
                  value={formData.keyNoteSpeaker}
                  onChange={(e) => setFormData({ ...formData, keyNoteSpeaker: e.target.value })}
                  className="w-full bg-slate-800/80 border border-slate-700 rounded-xl p-3 text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold transition shadow-lg shadow-blue-500/25"
                >
                  Save Summit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
}