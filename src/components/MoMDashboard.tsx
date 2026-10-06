'use client';

import React, { useState } from 'react';
import {
  FileText,
  CheckCircle2,
  ListTodo,
  AlertTriangle,
  MessageSquare,
  Plus,
  Trash2,
  Edit3,
  Search,
  Copy,
  Check,
  Calendar,
  Clock,
  MapPin,
  Users,
  Code2,
  UserCheck,
} from 'lucide-react';
import { MoMData, ActionItem, DiscussionPoint } from '@/types/mom';

interface MoMDashboardProps {
  mom: MoMData;
  onUpdateMoM: (updated: MoMData) => void;
  onShowToast: (msg: string) => void;
}

type TabType = 'mom' | 'transcript' | 'json';

export const MoMDashboard: React.FC<MoMDashboardProps> = ({
  mom,
  onUpdateMoM,
  onShowToast,
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('mom');
  const [transcriptSearch, setTranscriptSearch] = useState('');
  const [copiedTranscript, setCopiedTranscript] = useState(false);

  // Helper updater functions for inline edits
  const handleTitleChange = (newTitle: string) => {
    onUpdateMoM({ ...mom, meeting_title: newTitle });
  };

  const handleSummaryChange = (newSummary: string) => {
    onUpdateMoM({ ...mom, summary: newSummary });
  };

  // Discussion Points handlers
  const handleAddDiscussionPoint = () => {
    const newPoint: DiscussionPoint = {
      topic: 'New Discussion Topic',
      details: 'Key notes and context regarding this item...',
    };
    onUpdateMoM({
      ...mom,
      discussion_points: [...(mom.discussion_points || []), newPoint],
    });
  };

  const handleUpdateDiscussionPoint = (
    index: number,
    field: 'topic' | 'details',
    val: string
  ) => {
    const updated = [...(mom.discussion_points || [])];
    updated[index] = { ...updated[index], [field]: val };
    onUpdateMoM({ ...mom, discussion_points: updated });
  };

  const handleDeleteDiscussionPoint = (index: number) => {
    const updated = (mom.discussion_points || []).filter((_, i) => i !== index);
    onUpdateMoM({ ...mom, discussion_points: updated });
  };

  // Decisions handlers
  const handleAddDecision = () => {
    onUpdateMoM({
      ...mom,
      decisions: [...(mom.decisions || []), 'New approved decision...'],
    });
  };

  const handleUpdateDecision = (index: number, val: string) => {
    const updated = [...(mom.decisions || [])];
    updated[index] = val;
    onUpdateMoM({ ...mom, decisions: updated });
  };

  const handleDeleteDecision = (index: number) => {
    const updated = (mom.decisions || []).filter((_, i) => i !== index);
    onUpdateMoM({ ...mom, decisions: updated });
  };

  // Action Items handlers
  const handleAddActionItem = () => {
    const newItem: ActionItem = {
      id: `action-${Date.now()}`,
      task: 'New actionable deliverable',
      assigned_to: 'Team Member',
      deadline: 'End of Sprint',
      status: 'pending',
    };
    onUpdateMoM({
      ...mom,
      action_items: [...(mom.action_items || []), newItem],
    });
  };

  const handleUpdateActionItem = (
    index: number,
    field: keyof ActionItem,
    val: unknown
  ) => {
    const updated = [...(mom.action_items || [])];
    updated[index] = { ...updated[index], [field]: val };
    onUpdateMoM({ ...mom, action_items: updated });
  };

  const handleDeleteActionItem = (index: number) => {
    const updated = (mom.action_items || []).filter((_, i) => i !== index);
    onUpdateMoM({ ...mom, action_items: updated });
  };

  const toggleActionStatus = (index: number) => {
    const updated = [...(mom.action_items || [])];
    const current = updated[index].status || 'pending';
    const nextStatus = current === 'completed' ? 'pending' : 'completed';
    updated[index] = { ...updated[index], status: nextStatus };
    onUpdateMoM({ ...mom, action_items: updated });
  };

  // Unresolved Issues handlers
  const handleAddUnresolved = () => {
    onUpdateMoM({
      ...mom,
      unresolved_issues: [
        ...(mom.unresolved_issues || []),
        'New unresolved blocker or follow-up question...',
      ],
    });
  };

  const handleUpdateUnresolved = (index: number, val: string) => {
    const updated = [...(mom.unresolved_issues || [])];
    updated[index] = val;
    onUpdateMoM({ ...mom, unresolved_issues: updated });
  };

  const handleDeleteUnresolved = (index: number) => {
    const updated = (mom.unresolved_issues || []).filter((_, i) => i !== index);
    onUpdateMoM({ ...mom, unresolved_issues: updated });
  };

  // Copy transcript
  const handleCopyTranscript = async () => {
    if (!mom.transcript) return;
    await navigator.clipboard.writeText(mom.transcript);
    setCopiedTranscript(true);
    onShowToast('Verbatim transcript copied.');
    setTimeout(() => setCopiedTranscript(false), 2000);
  };

  // Filter transcript text
  const filteredTranscript = mom.transcript || '';

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="bg-zinc-900/90 border border-zinc-800 rounded-2xl p-6 sm:p-7 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-zinc-800/80">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 text-xs text-teal-400 font-semibold uppercase tracking-wider mb-1.5">
              <span className="w-2 h-2 rounded-full bg-teal-400" />
              Generated Minutes of Meeting (MoM)
            </div>
            <input
              type="text"
              value={mom.meeting_title}
              onChange={(e) => handleTitleChange(e.target.value)}
              className="text-xl sm:text-2xl font-bold text-zinc-100 bg-transparent border-b border-transparent hover:border-zinc-700 focus:border-teal-500 focus:outline-none w-full py-1 transition-colors"
              title="Click to edit meeting title"
            />
          </div>

          {/* Tab Switcher */}
          <div className="flex items-center p-1 rounded-xl bg-zinc-950 border border-zinc-800 shrink-0 self-start sm:self-center">
            <button
              type="button"
              onClick={() => setActiveTab('mom')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                activeTab === 'mom'
                  ? 'bg-teal-500 text-zinc-950 shadow-sm'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <FileText className="w-3.5 h-3.5" /> MoM Document
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('transcript')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                activeTab === 'transcript'
                  ? 'bg-teal-500 text-zinc-950 shadow-sm'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <MessageSquare className="w-3.5 h-3.5" /> Full Transcript
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('json')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                activeTab === 'json'
                  ? 'bg-teal-500 text-zinc-950 shadow-sm'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <Code2 className="w-3.5 h-3.5" /> Raw JSON
            </button>
          </div>
        </div>

        {/* Meeting Metadata Strip */}
        <div className="flex flex-wrap items-center gap-y-2 gap-x-5 pt-4 text-xs text-zinc-400">
          {mom.metadata?.date && (
            <div className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-teal-400" />
              <span>{mom.metadata.date}</span>
            </div>
          )}
          {(mom.metadata?.startTime || mom.metadata?.endTime) && (
            <div className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-teal-400" />
              <span>
                {mom.metadata.startTime || '--'} to {mom.metadata.endTime || '--'}
              </span>
            </div>
          )}
          {mom.metadata?.venue && (
            <div className="flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-teal-400" />
              <span>{mom.metadata.venue}</span>
            </div>
          )}
          {mom.metadata?.attendees && mom.metadata.attendees.length > 0 && (
            <div className="flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-teal-400" />
              <span>{mom.metadata.attendees.length} Attendees</span>
            </div>
          )}
        </div>
      </div>

      {/* TAB 1: MoM Document View */}
      {activeTab === 'mom' && (
        <div className="space-y-6">
          {/* 1. Executive Summary */}
          <div className="bg-zinc-900/90 border border-zinc-800 rounded-2xl p-6 shadow-xl">
            <div className="flex items-center justify-between mb-3 pb-2 border-b border-zinc-800/60">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-teal-500/10 text-teal-400">
                  <FileText className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-semibold text-zinc-100">1. Executive Summary</h3>
              </div>
              <span className="text-[11px] text-zinc-500 flex items-center gap-1">
                <Edit3 className="w-3 h-3" /> Inline Editable
              </span>
            </div>
            <textarea
              rows={4}
              value={mom.summary}
              onChange={(e) => handleSummaryChange(e.target.value)}
              className="w-full p-3.5 bg-zinc-950/60 border border-zinc-800/80 rounded-xl text-sm text-zinc-200 leading-relaxed focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition-all resize-y"
            />
          </div>

          {/* 2. Key Discussion Points */}
          <div className="bg-zinc-900/90 border border-zinc-800 rounded-2xl p-6 shadow-xl">
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-zinc-800/60">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400">
                  <MessageSquare className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-semibold text-zinc-100">2. Key Discussion Points</h3>
              </div>
              <button
                type="button"
                onClick={handleAddDiscussionPoint}
                className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-teal-300 text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" /> Add Topic
              </button>
            </div>

            <div className="space-y-3.5">
              {mom.discussion_points && mom.discussion_points.length > 0 ? (
                mom.discussion_points.map((point, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-xl bg-zinc-950/70 border border-zinc-800/80 relative group space-y-2"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <input
                        type="text"
                        value={point.topic}
                        onChange={(e) =>
                          handleUpdateDiscussionPoint(idx, 'topic', e.target.value)
                        }
                        className="text-xs font-bold text-teal-300 bg-transparent border-b border-transparent hover:border-zinc-700 focus:border-teal-500 focus:outline-none py-0.5 w-full transition-colors"
                        placeholder="Discussion Topic / Title..."
                      />
                      <button
                        type="button"
                        onClick={() => handleDeleteDiscussionPoint(idx)}
                        className="text-zinc-500 hover:text-red-400 p-1 rounded transition-colors cursor-pointer"
                        title="Delete topic"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <textarea
                      rows={2}
                      value={point.details}
                      onChange={(e) =>
                        handleUpdateDiscussionPoint(idx, 'details', e.target.value)
                      }
                      className="w-full text-xs text-zinc-300 bg-zinc-900/50 border border-zinc-800/60 rounded-lg p-2.5 leading-relaxed focus:outline-none focus:border-teal-500 resize-y"
                      placeholder="Detailed notes and discussion nuances..."
                    />
                  </div>
                ))
              ) : (
                <p className="text-xs text-zinc-500 italic py-2">No discussion points extracted.</p>
              )}
            </div>
          </div>

          {/* 3. Decisions & Approvals */}
          <div className="bg-zinc-900/90 border border-zinc-800 rounded-2xl p-6 shadow-xl">
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-zinc-800/60">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-semibold text-zinc-100">3. Key Decisions & Approvals</h3>
              </div>
              <button
                type="button"
                onClick={handleAddDecision}
                className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-emerald-300 text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" /> Add Decision
              </button>
            </div>

            <div className="space-y-2.5">
              {mom.decisions && mom.decisions.length > 0 ? (
                mom.decisions.map((dec, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-xl bg-zinc-950/70 border border-zinc-800/80 flex items-center justify-between gap-3 group"
                  >
                    <div className="flex items-center gap-2.5 flex-1 min-w-0">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      <input
                        type="text"
                        value={dec}
                        onChange={(e) => handleUpdateDecision(idx, e.target.value)}
                        className="text-xs text-zinc-200 bg-transparent border-b border-transparent hover:border-zinc-700 focus:border-teal-500 focus:outline-none py-1 w-full transition-colors"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => handleDeleteDecision(idx)}
                      className="text-zinc-500 hover:text-red-400 p-1 rounded transition-colors cursor-pointer"
                      title="Delete decision"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))
              ) : (
                <p className="text-xs text-zinc-500 italic py-2">No key decisions recorded.</p>
              )}
            </div>
          </div>

          {/* 4. Action Items Table */}
          <div className="bg-zinc-900/90 border border-zinc-800 rounded-2xl p-6 shadow-xl">
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-zinc-800/60">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400">
                  <ListTodo className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-semibold text-zinc-100">4. Action Items & Deliverables</h3>
              </div>
              <button
                type="button"
                onClick={handleAddActionItem}
                className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-indigo-300 text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" /> Add Task
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-zinc-800 text-zinc-400 uppercase text-[10px] tracking-wider bg-zinc-950/60">
                    <th className="py-2.5 px-3 font-medium w-10 text-center">Status</th>
                    <th className="py-2.5 px-3 font-medium">Task / Action Item</th>
                    <th className="py-2.5 px-3 font-medium w-44">Responsible</th>
                    <th className="py-2.5 px-3 font-medium w-36">Deadline</th>
                    <th className="py-2.5 px-3 font-medium w-12 text-center"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/60">
                  {mom.action_items && mom.action_items.length > 0 ? (
                    mom.action_items.map((item, idx) => {
                      const isCompleted = item.status === 'completed';
                      return (
                        <tr
                          key={item.id || idx}
                          className={`hover:bg-zinc-950/40 transition-colors ${
                            isCompleted ? 'opacity-60 bg-zinc-950/20' : ''
                          }`}
                        >
                          <td className="py-3 px-3 text-center">
                            <button
                              type="button"
                              onClick={() => toggleActionStatus(idx)}
                              className={`p-1 rounded-lg transition-colors cursor-pointer ${
                                isCompleted
                                  ? 'text-emerald-400 bg-emerald-950/40'
                                  : 'text-zinc-500 hover:text-zinc-300 bg-zinc-800'
                              }`}
                              title={isCompleted ? 'Mark Pending' : 'Mark Completed'}
                            >
                              <Check className="w-3.5 h-3.5" />
                            </button>
                          </td>
                          <td className="py-3 px-3">
                            <input
                              type="text"
                              value={item.task}
                              onChange={(e) =>
                                handleUpdateActionItem(idx, 'task', e.target.value)
                              }
                              className={`w-full bg-transparent border-b border-transparent hover:border-zinc-700 focus:border-teal-500 focus:outline-none py-0.5 text-zinc-200 transition-colors ${
                                isCompleted ? 'line-through text-zinc-400' : ''
                              }`}
                            />
                          </td>
                          <td className="py-3 px-3">
                            <div className="flex items-center gap-1.5">
                              <UserCheck className="w-3.5 h-3.5 text-teal-400 shrink-0" />
                              <input
                                type="text"
                                value={item.assigned_to}
                                onChange={(e) =>
                                  handleUpdateActionItem(idx, 'assigned_to', e.target.value)
                                }
                                className="w-full bg-zinc-950/50 border border-zinc-800 rounded-md px-2 py-1 text-zinc-300 focus:outline-none focus:border-teal-500"
                              />
                            </div>
                          </td>
                          <td className="py-3 px-3">
                            <div className="flex items-center gap-1.5">
                              <Calendar className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                              <input
                                type="text"
                                value={item.deadline}
                                onChange={(e) =>
                                  handleUpdateActionItem(idx, 'deadline', e.target.value)
                                }
                                className="w-full bg-zinc-950/50 border border-zinc-800 rounded-md px-2 py-1 text-zinc-300 focus:outline-none focus:border-teal-500"
                              />
                            </div>
                          </td>
                          <td className="py-3 px-3 text-center">
                            <button
                              type="button"
                              onClick={() => handleDeleteActionItem(idx)}
                              className="text-zinc-500 hover:text-red-400 p-1 rounded transition-colors cursor-pointer"
                              title="Delete task"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={5} className="text-center py-4 text-xs text-zinc-500 italic">
                        No action items created yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* 5. Unresolved Issues & Blockers */}
          <div className="bg-zinc-900/90 border border-zinc-800 rounded-2xl p-6 shadow-xl">
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-zinc-800/60">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-rose-500/10 text-rose-400">
                  <AlertTriangle className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-semibold text-zinc-100">
                  5. Unresolved Issues & Blockers
                </h3>
              </div>
              <button
                type="button"
                onClick={handleAddUnresolved}
                className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-rose-300 text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" /> Add Issue
              </button>
            </div>

            <div className="space-y-2.5">
              {mom.unresolved_issues && mom.unresolved_issues.length > 0 ? (
                mom.unresolved_issues.map((issue, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-xl bg-zinc-950/70 border border-rose-950/40 flex items-center justify-between gap-3 group"
                  >
                    <div className="flex items-center gap-2.5 flex-1 min-w-0">
                      <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
                      <input
                        type="text"
                        value={issue}
                        onChange={(e) => handleUpdateUnresolved(idx, e.target.value)}
                        className="text-xs text-zinc-200 bg-transparent border-b border-transparent hover:border-zinc-700 focus:border-rose-500 focus:outline-none py-1 w-full transition-colors"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => handleDeleteUnresolved(idx)}
                      className="text-zinc-500 hover:text-red-400 p-1 rounded transition-colors cursor-pointer"
                      title="Delete issue"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))
              ) : (
                <p className="text-xs text-zinc-500 italic py-2">No blockers or unresolved issues.</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: Full Transcript Inspector */}
      {activeTab === 'transcript' && (
        <div className="bg-zinc-900/90 border border-zinc-800 rounded-2xl p-6 shadow-xl space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-zinc-800/80">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-lg bg-teal-500/10 text-teal-400">
                <MessageSquare className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-zinc-100">Verbatim Meeting Transcript</h3>
                <p className="text-xs text-zinc-400">
                  {mom.transcript ? `${mom.transcript.split(/\s+/).filter(Boolean).length} words transcribed` : 'No transcript text'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
                <input
                  type="text"
                  placeholder="Search spoken words..."
                  value={transcriptSearch}
                  onChange={(e) => setTranscriptSearch(e.target.value)}
                  className="pl-8 pr-3 py-1.5 bg-zinc-950 border border-zinc-800 rounded-lg text-xs text-zinc-200 focus:outline-none focus:border-teal-500"
                />
              </div>

              <button
                type="button"
                onClick={handleCopyTranscript}
                className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                {copiedTranscript ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedTranscript ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-zinc-950/80 border border-zinc-800/80 max-h-[500px] overflow-y-auto font-mono text-xs text-zinc-300 leading-relaxed whitespace-pre-wrap select-text">
            {filteredTranscript || 'No transcript available.'}
          </div>
        </div>
      )}

      {/* TAB 3: Raw JSON Inspector */}
      {activeTab === 'json' && (
        <div className="bg-zinc-900/90 border border-zinc-800 rounded-2xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-zinc-800/80">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400">
                <Code2 className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-semibold text-zinc-100">Structured MoM JSON Output</h3>
            </div>
            <button
              type="button"
              onClick={async () => {
                await navigator.clipboard.writeText(JSON.stringify(mom, null, 2));
                onShowToast('JSON copied to clipboard.');
              }}
              className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Copy className="w-3.5 h-3.5" /> Copy JSON
            </button>
          </div>

          <pre className="p-4 rounded-xl bg-zinc-950/80 border border-zinc-800/80 max-h-[500px] overflow-y-auto font-mono text-xs text-teal-300 leading-relaxed select-text">
            {JSON.stringify(mom, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
};
