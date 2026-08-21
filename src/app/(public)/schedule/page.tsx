"use client";

import React, { useState, useEffect } from "react";
import { Calendar as CalendarIcon, Clock, User, Mail, Phone, FileText, CheckCircle, AlertCircle, ChevronLeft, ChevronRight } from "lucide-react";

interface Slot {
  startTime: string;
  endTime: string;
}

export default function SchedulePage() {
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [slots, setSlots] = useState<Slot[]>([]);
  const [timezone, setTimezone] = useState<string>("America/Los_Angeles");
  const [loadingSlots, setLoadingSlots] = useState<boolean>(false);
  const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null);
  
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    notes: "",
  });
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [successData, setSuccessData] = useState<any>(null);
  const [error, setError] = useState<string>("");

  // Get current date string in YYYY-MM-DD
  const getTodayString = () => {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, "0");
    const dd = String(today.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  };

  // Set today as initial date
  useEffect(() => {
    setSelectedDate(getTodayString());
  }, []);

  // Fetch slots whenever the date changes
  useEffect(() => {
    if (!selectedDate) return;

    const fetchSlots = async () => {
      setLoadingSlots(true);
      setError("");
      setSelectedSlot(null);
      try {
        const res = await fetch(`/api/schedule?date=${selectedDate}`);
        if (!res.ok) {
          throw new Error("Failed to fetch available slots.");
        }
        const data = await res.json();
        setSlots(data.slots || []);
        if (data.timezone) {
          setTimezone(data.timezone);
        }
      } catch (err: any) {
        setError(err.message || "Could not load available schedules.");
      } finally {
        setLoadingSlots(false);
      }
    };

    fetchSlots();
  }, [selectedDate]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleBookAppointment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSlot) return;

    setSubmitting(true);
    setError("");

    try {
      const res = await fetch("/api/schedule", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date: selectedDate,
          slotStart: selectedSlot.startTime,
          visitorName: formData.name,
          visitorEmail: formData.email,
          visitorPhone: formData.phone,
          notes: formData.notes,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to book your appointment. Please select another slot.");
      }

      setSuccessData({
        ...data.booking,
        name: formData.name,
        email: formData.email,
      });
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setSubmitting(false);
    }
  };

  // Formatting helpers
  const formatTime = (isoString: string) => {
    return new Intl.DateTimeFormat("en-US", {
      timeZone: timezone,
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    }).format(new Date(isoString));
  };

  const formatDateLabel = (dateStr: string) => {
    if (!dateStr) return "";
    const [year, month, day] = dateStr.split("-").map(Number);
    const dateObj = new Date(year, month - 1, day);
    return new Intl.DateTimeFormat("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    }).format(dateObj);
  };

  // Get max date constraint (30 days from now)
  const getMaxDateString = () => {
    const maxDate = new Date();
    maxDate.setDate(maxDate.getDate() + 30);
    const yyyy = maxDate.getFullYear();
    const mm = String(maxDate.getMonth() + 1).padStart(2, "0");
    const dd = String(maxDate.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  };

  return (
    <div className="bg-slate-50 py-16 min-h-screen">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
        
        {/* Title */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl">
            Book a Consultation
          </h1>
          <p className="mt-4 text-lg text-slate-600">
            Select an available time slot below to schedule a 30-minute consultation.
          </p>
        </div>

        {successData ? (
          // Success State
          <div className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm text-center max-w-xl mx-auto">
            <div className="inline-flex p-3 bg-green-50 rounded-full text-green-600 mb-6">
              <CheckCircle className="h-12 w-12" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 mb-2">Booking Confirmed!</h2>
            <p className="text-slate-600 mb-6 text-sm">
              Your appointment has been successfully scheduled. An invitation has been dispatched to your email address.
            </p>

            <div className="bg-slate-50 p-6 rounded-xl border border-slate-100 text-left space-y-3 mb-8">
              <p className="text-sm font-semibold text-slate-800">
                <span className="text-slate-400 font-normal mr-2">Client:</span> {successData.name} ({successData.email})
              </p>
              <p className="text-sm font-semibold text-slate-800">
                <span className="text-slate-400 font-normal mr-2">Date:</span> {formatDateLabel(selectedDate)}
              </p>
              <p className="text-sm font-semibold text-slate-800">
                <span className="text-slate-400 font-normal mr-2">Time:</span> {formatTime(successData.startTime)}
              </p>
              <p className="text-sm font-semibold text-slate-800">
                <span className="text-slate-400 font-normal mr-2">Timezone:</span> {timezone} (Business Local)
              </p>
              <div className="pt-3 border-t border-slate-200 flex items-center justify-between text-xs text-slate-400">
                <span>Duration: 30 minutes</span>
                <span className="text-green-600 font-medium">
                  {successData.googleSynced ? "Synced to Calendar" : "Scheduled Offline"}
                </span>
              </div>
            </div>

            <button
              onClick={() => {
                setSuccessData(null);
                setSelectedSlot(null);
                setFormData({ name: "", email: "", phone: "", notes: "" });
              }}
              className="inline-flex items-center justify-center px-6 py-3 font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition-colors"
            >
              Book Another Session
            </button>
          </div>
        ) : (
          // Scheduling Form State
          <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
            
            {/* Left side: Date & Time Selector */}
            <div className="md:col-span-3 space-y-6">
              <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                  <CalendarIcon className="h-5 w-5 text-blue-600" />
                  1. Select a Date
                </h2>
                <input
                  type="date"
                  value={selectedDate}
                  min={getTodayString()}
                  max={getMaxDateString()}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors"
                />
              </div>

              <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                <h2 className="text-lg font-bold text-slate-900 mb-2 flex items-center gap-2">
                  <Clock className="h-5 w-5 text-blue-600" />
                  2. Select a Time Slot
                </h2>
                <p className="text-xs text-slate-400 mb-4">
                  Hours shown in business time zone: <span className="font-semibold">{timezone}</span>
                </p>

                {error && (
                  <div className="p-4 bg-red-50 border border-red-100 rounded-xl text-red-600 text-sm flex gap-2 items-center mb-4">
                    <AlertCircle className="h-5 w-5 shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                {loadingSlots ? (
                  <div className="text-center py-8 text-slate-500 text-sm">
                    Querying available time slots...
                  </div>
                ) : slots.length === 0 ? (
                  <div className="text-center py-8 text-slate-500 text-sm">
                    No slots available on this date. Please choose a different date.
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {slots.map((slot) => {
                      const isSelected = selectedSlot?.startTime === slot.startTime;
                      return (
                        <button
                          key={slot.startTime}
                          type="button"
                          onClick={() => setSelectedSlot(slot)}
                          className={`py-3 px-4 rounded-xl border text-sm font-semibold transition-all ${
                            isSelected
                              ? "bg-blue-600 border-blue-600 text-white shadow-md shadow-blue-500/10"
                              : "bg-white border-slate-100 text-slate-700 hover:bg-slate-50 hover:border-slate-200"
                          }`}
                        >
                          {formatTime(slot.startTime)}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Right side: Confirmation & Details Form */}
            <div className="md:col-span-2">
              <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm sticky top-24">
                <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                  <User className="h-5 w-5 text-blue-600" />
                  3. Enter Details
                </h2>

                {selectedSlot ? (
                  <form onSubmit={handleBookAppointment} className="space-y-4">
                    <div className="p-3.5 bg-blue-50 border border-blue-100 rounded-xl mb-4 text-xs">
                      <p className="font-semibold text-blue-900 mb-0.5">Selected Session:</p>
                      <p className="text-blue-800">
                        {formatDateLabel(selectedDate)} at <span className="font-semibold">{formatTime(selectedSlot.startTime)}</span>
                      </p>
                    </div>

                    <div>
                      <label htmlFor="name" className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                        Your Name *
                      </label>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        required
                        value={formData.name}
                        onChange={handleInputChange}
                        placeholder="John Smith"
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors"
                      />
                    </div>

                    <div>
                      <label htmlFor="email" className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                        Email Address *
                      </label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        required
                        value={formData.email}
                        onChange={handleInputChange}
                        placeholder="john@example.com"
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors"
                      />
                    </div>

                    <div>
                      <label htmlFor="phone" className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                        Phone Number (Optional)
                      </label>
                      <input
                        type="tel"
                        id="phone"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        placeholder="(555) 123-4567"
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors"
                      />
                    </div>

                    <div>
                      <label htmlFor="notes" className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                        Additional Notes (Optional)
                      </label>
                      <textarea
                        id="notes"
                        name="notes"
                        rows={3}
                        value={formData.notes}
                        onChange={handleInputChange}
                        placeholder="What specific questions do you have?"
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors resize-none"
                      ></textarea>
                    </div>

                    <button
                      type="submit"
                      disabled={submitting}
                      className="w-full py-3 px-4 font-semibold text-white bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 rounded-lg shadow-sm hover:shadow-blue-500/10 transition-all text-sm mt-4"
                    >
                      {submitting ? "Booking Appointment..." : "Confirm Booking"}
                    </button>
                  </form>
                ) : (
                  <div className="text-center py-12 border border-dashed border-slate-200 rounded-2xl text-slate-400 text-sm">
                    Select a date and time slot first to complete your booking.
                  </div>
                )}
              </div>
            </div>

          </div>
        )}

      </div>
    </div>
  );
}
