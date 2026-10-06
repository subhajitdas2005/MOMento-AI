'use client';

import React, { useState } from 'react';
import { Calendar, Clock, MapPin, Users, Plus, X, Building2 } from 'lucide-react';
import { MeetingMetadata } from '@/types/mom';

interface MeetingSetupFormProps {
  metadata: MeetingMetadata;
  onChange: (updated: MeetingMetadata) => void;
}

export const MeetingSetupForm: React.FC<MeetingSetupFormProps> = ({ metadata, onChange }) => {
  const [attendeeInput, setAttendeeInput] = useState('');

  const handleFieldChange = (field: keyof MeetingMetadata, value: unknown) => {
    onChange({
      ...metadata,
      [field]: value,
    });
  };

  const handleAddAttendee = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = attendeeInput.trim();
    if (!trimmed) return;

    const currentList = metadata.attendees || [];
    if (!currentList.includes(trimmed)) {
      onChange({
        ...metadata,
        attendees: [...currentList, trimmed],
      });
    }
    setAttendeeInput('');
  };

  const handleRemoveAttendee = (indexToRemove: number) => {
    const currentList = metadata.attendees || [];
    onChange({
      ...metadata,
      attendees: currentList.filter((_, idx) => idx !== indexToRemove),
    });
  };

  return (
    <div className="bg-zinc-900/90 border border-zinc-800/80 rounded-2xl p-6 sm:p-7 shadow-xl">
      <div className="flex items-center gap-3 mb-6 pb-4 border-b border-zinc-800/60">
        <div className="p-2.5 rounded-xl bg-teal-500/10 border border-teal-500/20 text-teal-400">
          <Building2 className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-base font-semibold text-zinc-100">1. Meeting Details</h2>
          <p className="text-xs text-zinc-400">Specify the meeting context and agenda parameters</p>
        </div>
      </div>

      <div className="space-y-4">
        {/* Title */}
        <div>
          <label className="block text-xs font-medium text-zinc-300 mb-1.5">
            Meeting Title <span className="text-teal-400">*</span>
          </label>
          <input
            type="text"
            required
            placeholder="e.g. Q3 Executive Strategy & Budget Approval"
            value={metadata.title}
            onChange={(e) => handleFieldChange('title', e.target.value)}
            className="w-full px-4 py-2.5 bg-zinc-950 border border-zinc-700/80 rounded-xl text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition-all font-medium"
          />
        </div>

        {/* Date, Start Time, End Time Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
          {/* Date */}
          <div>
            <label className="block text-xs font-medium text-zinc-300 mb-1.5 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-zinc-400" /> Date
            </label>
            <input
              type="date"
              value={metadata.date}
              onChange={(e) => handleFieldChange('date', e.target.value)}
              className="w-full px-3.5 py-2.5 bg-zinc-950 border border-zinc-700/80 rounded-xl text-sm text-zinc-200 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition-all [color-scheme:dark]"
            />
          </div>

          {/* Start Time */}
          <div>
            <label className="block text-xs font-medium text-zinc-300 mb-1.5 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-zinc-400" /> Start Time
            </label>
            <input
              type="time"
              value={metadata.startTime}
              onChange={(e) => handleFieldChange('startTime', e.target.value)}
              className="w-full px-3.5 py-2.5 bg-zinc-950 border border-zinc-700/80 rounded-xl text-sm text-zinc-200 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition-all [color-scheme:dark]"
            />
          </div>

          {/* End Time */}
          <div>
            <label className="block text-xs font-medium text-zinc-300 mb-1.5 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-zinc-400" /> End Time
            </label>
            <input
              type="time"
              value={metadata.endTime}
              onChange={(e) => handleFieldChange('endTime', e.target.value)}
              className="w-full px-3.5 py-2.5 bg-zinc-950 border border-zinc-700/80 rounded-xl text-sm text-zinc-200 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition-all [color-scheme:dark]"
            />
          </div>
        </div>

        {/* Venue / Location */}
        <div>
          <label className="block text-xs font-medium text-zinc-300 mb-1.5 flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-zinc-400" /> Venue / Meeting Channel <span className="text-teal-400">*</span>
          </label>
          <input
            type="text"
            placeholder="e.g. Google Meet, Zoom Room #3, HQ Boardroom A"
            value={metadata.venue}
            onChange={(e) => handleFieldChange('venue', e.target.value)}
            className="w-full px-4 py-2.5 bg-zinc-950 border border-zinc-700/80 rounded-xl text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition-all"
          />
        </div>

        {/* Attendees Tagging (Optional) */}
        <div>
          <label className="block text-xs font-medium text-zinc-300 mb-1.5 flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5 text-zinc-400" /> Key Attendees & Stakeholders <span className="text-zinc-500 font-normal">(Optional)</span>
          </label>
          
          <div className="flex gap-2 mb-2.5">
            <input
              type="text"
              placeholder="e.g. Sarah Connor (VP Product)"
              value={attendeeInput}
              onChange={(e) => setAttendeeInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddAttendee();
                }
              }}
              className="flex-1 px-3.5 py-2 bg-zinc-950 border border-zinc-700/80 rounded-xl text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-teal-500"
            />
            <button
              type="button"
              onClick={() => handleAddAttendee()}
              className="px-3.5 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-xl text-xs font-medium flex items-center gap-1 transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" /> Add
            </button>
          </div>

          {metadata.attendees && metadata.attendees.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-1">
              {metadata.attendees.map((person, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs bg-zinc-800/80 text-zinc-200 border border-zinc-700/60"
                >
                  {person}
                  <button
                    type="button"
                    onClick={() => handleRemoveAttendee(idx)}
                    className="hover:text-red-400 text-zinc-400 p-0.5 rounded transition-colors cursor-pointer"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
