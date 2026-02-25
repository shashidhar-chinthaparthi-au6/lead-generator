'use client';

import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { leadByIdQuery, updateLead, addActivity } from '@/lib/api';
import {
  SCRIPT_SECTIONS_EN,
  SCRIPT_SECTIONS_TE,
  SALES_SCRIPT_EN,
  SALES_SCRIPT_TE,
  getScriptForLead,
  getSectionsWithName,
  PRICING_PRODUCTS,
} from '@/lib/salesScript';

export default function LeadDetail({ leadId, onClose, onUpdated }) {
  const queryClient = useQueryClient();
  const [activityType, setActivityType] = useState('Note');
  const [activityNote, setActivityNote] = useState('');
  const [scriptOpen, setScriptOpen] = useState(false);
  const [scriptLang, setScriptLang] = useState('en');
  const [copied, setCopied] = useState(false);
  const [scriptModalOpen, setScriptModalOpen] = useState(false);
  const [openPricingIds, setOpenPricingIds] = useState(new Set());
  const [expandedHistoryIds, setExpandedHistoryIds] = useState(new Set());
  const [customReqLocal, setCustomReqLocal] = useState('');
  const [preferredLanguageLocal, setPreferredLanguageLocal] = useState('');
  const [interestedLocal, setInterestedLocal] = useState('');
  const [interestedInLocal, setInterestedInLocal] = useState([]);
  const [followUpInterestedLocal, setFollowUpInterestedLocal] = useState('');
  const [followUpDateLocal, setFollowUpDateLocal] = useState('');

  const { data: lead, isLoading, error } = useQuery({
    queryKey: ['lead', leadId],
    queryFn: () => leadByIdQuery(leadId),
    enabled: !!leadId,
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, body }) => updateLead(id, body),
    onSuccess: (updatedLead) => {
      if (updatedLead) {
        queryClient.setQueryData(['lead', leadId], updatedLead);
      }
      queryClient.invalidateQueries({ queryKey: ['lead', leadId] });
      onUpdated?.();
    },
  });

  const activityMutation = useMutation({
    mutationFn: (payload) => addActivity(leadId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lead', leadId] });
      setActivityNote('');
      onUpdated?.();
    },
  });

  const PREFERRED_LANGUAGES = ['', 'English', 'Telugu', 'Hindi', 'Other'];
  const INTERESTED_OPTIONS = ['', 'Yes', 'No', 'Maybe'];
  const INTERESTED_IN_OPTIONS = [
    'Subdomain Website Model',
    'Portfolio-as-a-Service',
    'Digital Visiting Card',
    'Monthly Subscription / Rent-a-Site',
    'WhatsApp Catalogue Site',
  ];
  const FOLLOW_UP_OPTIONS = ['', 'Yes', 'No'];

  // Status flow: draft → contact → conversation. You can move forward or back one step as required.
  const STATUS_ORDER = ['draft', 'contact', 'conversation'];
  const getStatusLabel = (s) => s.charAt(0).toUpperCase() + s.slice(1);
  const getAllowedStatuses = (current) => {
    const i = STATUS_ORDER.indexOf(current);
    if (i === -1) return [current];
    const allowed = new Set([current]);
    if (i > 0) allowed.add(STATUS_ORDER[i - 1]);
    if (i < STATUS_ORDER.length - 1) allowed.add(STATUS_ORDER[i + 1]);
    return [...allowed];
  };

  const handleStatusChange = (newStatus) => {
    updateMutation.mutate({ id: leadId, body: { status: newStatus } });
  };

  // Sync local preference state from lead when lead loads/refetches
  useEffect(() => {
    if (!lead) return;
    setPreferredLanguageLocal(lead.preferredLanguage ?? '');
    setInterestedLocal(lead.interested ?? '');
    setInterestedInLocal(Array.isArray(lead.interestedIn) ? [...lead.interestedIn] : []);
    setCustomReqLocal(lead.customRequirement ?? '');
    setFollowUpInterestedLocal(lead.followUpInterested ?? '');
    if (lead.followUpDate) {
      const d = new Date(lead.followUpDate);
      setFollowUpDateLocal(isNaN(d.getTime()) ? '' : d.toISOString().slice(0, 10));
    } else {
      setFollowUpDateLocal('');
    }
  }, [lead]);

  const handleInterestedInToggle = (option) => {
    setInterestedInLocal((prev) =>
      prev.includes(option) ? prev.filter((x) => x !== option) : [...prev, option]
    );
  };

  const handleSavePreferences = () => {
    updateMutation.mutate({
      id: leadId,
      body: {
        preferredLanguage: preferredLanguageLocal,
        interested: interestedLocal,
        interestedIn: interestedInLocal,
        customRequirement: customReqLocal.trim(),
        followUpInterested: followUpInterestedLocal,
        followUpDate: followUpDateLocal ? new Date(followUpDateLocal).toISOString() : null,
      },
    });
  };

  const handleAddActivity = (e) => {
    e.preventDefault();
    activityMutation.mutate({ type: activityType, note: activityNote });
  };

  const sections = scriptLang === 'te' ? SCRIPT_SECTIONS_TE : SCRIPT_SECTIONS_EN;
  const sectionsWithName = getSectionsWithName(sections, lead?.name);
  const fullScriptForCopy = getScriptForLead(
    scriptLang === 'te' ? SALES_SCRIPT_TE : SALES_SCRIPT_EN,
    lead?.name
  );

  const togglePricing = (id) => {
    setOpenPricingIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleHistoryExpand = (id) => {
    setExpandedHistoryIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const formatHistoryDate = (d) => {
    if (!d) return '';
    const date = new Date(d);
    return isNaN(date.getTime()) ? '' : date.toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' });
  };

  const preferenceHistorySorted = Array.isArray(lead?.preferenceHistory)
    ? [...lead.preferenceHistory].sort((a, b) => new Date(b.savedAt) - new Date(a.savedAt))
    : [];

  const handleCopyScript = async () => {
    try {
      await navigator.clipboard.writeText(fullScriptForCopy);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Copy failed', err);
    }
  };

  if (isLoading || !lead) {
    return (
      <div className="fixed inset-y-0 right-0 z-50 w-full max-w-md border-l bg-white shadow-xl">
        <div className="flex h-full items-center justify-center p-6">Loading…</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="fixed inset-y-0 right-0 z-50 w-full max-w-md border-l bg-white p-6 shadow-xl">
        <p className="text-red-600">{error.message}</p>
        <button type="button" onClick={onClose} className="mt-4 text-blue-600 hover:underline">Close</button>
      </div>
    );
  }

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/30" aria-hidden onClick={onClose} />
      <div className="fixed inset-y-0 right-0 z-50 w-full max-w-md overflow-y-auto border-l bg-white shadow-xl">
        <div className="sticky top-0 flex items-center justify-between border-b bg-white px-4 py-3">
          <h2 className="font-semibold text-slate-800">Lead details</h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded p-1 text-slate-500 hover:bg-slate-100 hover:text-slate-700"
            aria-label="Close"
          >
            ✕
          </button>
        </div>
        <div className="p-4 space-y-4">
          <div>
            <p className="text-lg font-medium text-slate-800">{lead.name}</p>
            {lead.phone && <p className="text-sm text-slate-600">{lead.phone}</p>}
            {lead.email && <p className="text-sm text-slate-600">{lead.email}</p>}
            <p className="text-sm text-slate-600">
              <span className="text-slate-500">Website: </span>
              {lead.website ? (
                <a
                  href={lead.website.startsWith('http') ? lead.website : `https://${lead.website}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  {lead.website.replace(/^https?:\/\//, '')}
                </a>
              ) : (
                <span className="text-slate-400">—</span>
              )}
            </p>
            {lead.address && <p className="text-sm text-slate-600">{lead.address}</p>}
            <p className="text-sm text-slate-500">
              {[lead.city, lead.state, lead.country].filter(Boolean).join(', ')}
            </p>
            {lead.department && (
              <p className="mt-1 text-xs text-slate-500">Business type: {lead.department}</p>
            )}
            {lead.source && (
              <p className="text-xs text-slate-500">Source: {lead.source}</p>
            )}
          </div>

          {/* Collapsible sales script */}
          <div className="rounded border border-slate-200 bg-slate-50 overflow-hidden">
            <button
              type="button"
              onClick={() => setScriptOpen((o) => !o)}
              className="w-full flex items-center justify-between px-3 py-2.5 text-left text-sm font-medium text-slate-700 hover:bg-slate-100"
            >
              <span>Sales script (English / Telugu)</span>
              <span className="text-slate-400">{scriptOpen ? '▼' : '▶'}</span>
            </button>
            {scriptOpen && (
              <div className="border-t border-slate-200 p-3 space-y-3">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setScriptLang('en')}
                    className={`rounded px-3 py-1.5 text-xs font-medium ${scriptLang === 'en' ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-700'}`}
                  >
                    English
                  </button>
                  <button
                    type="button"
                    onClick={() => setScriptLang('te')}
                    className={`rounded px-3 py-1.5 text-xs font-medium ${scriptLang === 'te' ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-700'}`}
                  >
                    Telugu
                  </button>
                  <button
                    type="button"
                    onClick={handleCopyScript}
                    className="rounded px-2 py-1 text-xs bg-slate-200 text-slate-700 hover:bg-slate-300"
                  >
                    {copied ? 'Copied!' : 'Copy all'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setScriptModalOpen(true)}
                    className="ml-auto rounded p-1.5 text-slate-600 hover:bg-slate-200 hover:text-slate-800"
                    aria-label="Expand script"
                    title="Expand"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M8 3H5a2 2 0 0 0-2 2v3"/><path d="M21 8V5a2 2 0 0 0-2-2h-3"/><path d="M3 16v3a2 2 0 0 0 2 2h3"/><path d="M16 21h3a2 2 0 0 0 2-2v-3"/></svg>
                  </button>
                </div>
                <div className="max-h-80 overflow-y-auto rounded bg-white border border-slate-200 p-3 space-y-4">
                  {sectionsWithName.map((section, idx) => (
                    <div key={idx}>
                      <p className="text-xs font-semibold text-blue-700 mb-1">{section.title}</p>
                      <pre className="whitespace-pre-wrap text-xs text-slate-700 font-sans leading-relaxed">
                        {section.body}
                      </pre>
                    </div>
                  ))}
                </div>

                {/* Detailed pricing — collapsible per product */}
                <div className="mt-3">
                  <p className="text-xs font-semibold text-slate-600 mb-2">Detailed pricing</p>
                  <div className="space-y-1">
                    {PRICING_PRODUCTS.map((product) => (
                      <div key={product.id} className="rounded border border-slate-200 bg-white overflow-hidden">
                        <button
                          type="button"
                          onClick={() => togglePricing(product.id)}
                          className="w-full flex items-center justify-between px-3 py-2 text-left text-xs font-medium text-slate-700 hover:bg-slate-50"
                        >
                          <span>{product.title}</span>
                          <span className="text-slate-400">{openPricingIds.has(product.id) ? '▼' : '▶'}</span>
                        </button>
                        {openPricingIds.has(product.id) && (
                          <div className="border-t border-slate-200 bg-slate-50/50 px-3 py-2 text-xs">
                            {product.subtitle && (
                              <p className="text-slate-500 mb-2">{product.subtitle}</p>
                            )}
                            <div className="overflow-x-auto">
                              <table className="min-w-full border border-slate-200 rounded">
                                <thead>
                                  <tr className="bg-slate-100">
                                    <th className="border-b border-slate-200 px-2 py-1.5 text-left font-semibold text-slate-700">Tier</th>
                                    <th className="border-b border-slate-200 px-2 py-1.5 text-left font-semibold text-slate-700">What They Get</th>
                                    <th className="border-b border-slate-200 px-2 py-1.5 text-right font-semibold text-slate-700">Price</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {product.rows.map((row, i) => (
                                    <tr key={i} className="border-b border-slate-100 last:border-0">
                                      <td className="px-2 py-1.5 text-slate-800 font-medium">{row.tier}</td>
                                      <td className="px-2 py-1.5 text-slate-700">{row.what}</td>
                                      <td className="px-2 py-1.5 text-right text-slate-800 font-medium">{row.price}</td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                            {product.bestFor && (
                              <p className="mt-2 text-slate-600">{product.bestFor}</p>
                            )}
                            <p className="mt-2 text-slate-500">💡 {product.cta}</p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Large modal for script */}
            {scriptModalOpen && (
              <>
                <div
                  className="fixed inset-0 z-[100] bg-black/50"
                  aria-hidden
                  onClick={() => setScriptModalOpen(false)}
                />
                <div className="fixed inset-4 z-[101] md:inset-8 flex flex-col rounded-xl bg-white shadow-2xl overflow-hidden">
                  <div className="flex items-center justify-between shrink-0 border-b bg-slate-50 px-4 py-3">
                    <h3 className="text-lg font-semibold text-slate-800">Sales script — {scriptLang === 'en' ? 'English' : 'Telugu'}</h3>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setScriptLang(scriptLang === 'en' ? 'te' : 'en')}
                        className="rounded px-3 py-1.5 text-sm bg-slate-200 text-slate-700 hover:bg-slate-300"
                      >
                        {scriptLang === 'en' ? 'Telugu' : 'English'}
                      </button>
                      <button
                        type="button"
                        onClick={handleCopyScript}
                        className="rounded px-3 py-1.5 text-sm bg-slate-200 text-slate-700 hover:bg-slate-300"
                      >
                        {copied ? 'Copied!' : 'Copy all'}
                      </button>
                      <button
                        type="button"
                        onClick={() => setScriptModalOpen(false)}
                        className="rounded p-2 text-slate-500 hover:bg-slate-200 hover:text-slate-700"
                        aria-label="Close"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                  <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6">
                    {sectionsWithName.map((section, idx) => (
                      <div key={idx} className="rounded-lg border border-slate-200 bg-slate-50/50 p-4">
                        <p className="text-base font-semibold text-blue-700 mb-2">{section.title}</p>
                        <pre className="whitespace-pre-wrap text-base md:text-lg text-slate-800 font-sans leading-relaxed">
                          {section.body}
                        </pre>
                      </div>
                    ))}
                    <div>
                      <h4 className="text-lg font-semibold text-slate-800 mb-3">Detailed pricing</h4>
                      <div className="space-y-2">
                        {PRICING_PRODUCTS.map((product) => (
                          <div key={product.id} className="rounded-lg border border-slate-200 bg-white overflow-hidden">
                            <button
                              type="button"
                              onClick={() => togglePricing(product.id)}
                              className="w-full flex items-center justify-between px-4 py-3 text-left text-base font-medium text-slate-700 hover:bg-slate-50"
                            >
                              <span>{product.title}</span>
                              <span className="text-slate-400">{openPricingIds.has(product.id) ? '▼' : '▶'}</span>
                            </button>
                            {openPricingIds.has(product.id) && (
                              <div className="border-t border-slate-200 bg-slate-50/50 px-4 py-4 text-sm md:text-base">
                                {product.subtitle && (
                                  <p className="text-slate-500 mb-3">{product.subtitle}</p>
                                )}
                                <div className="overflow-x-auto">
                                  <table className="min-w-full border border-slate-200 rounded-lg">
                                    <thead>
                                      <tr className="bg-slate-100">
                                        <th className="border-b border-slate-200 px-3 py-2 text-left font-semibold text-slate-700">Tier</th>
                                        <th className="border-b border-slate-200 px-3 py-2 text-left font-semibold text-slate-700">What They Get</th>
                                        <th className="border-b border-slate-200 px-3 py-2 text-right font-semibold text-slate-700">Price</th>
                                      </tr>
                                    </thead>
                                    <tbody>
                                      {product.rows.map((row, i) => (
                                        <tr key={i} className="border-b border-slate-100 last:border-0">
                                          <td className="px-3 py-2 text-slate-800 font-medium">{row.tier}</td>
                                          <td className="px-3 py-2 text-slate-700">{row.what}</td>
                                          <td className="px-3 py-2 text-right text-slate-800 font-medium">{row.price}</td>
                                        </tr>
                                      ))}
                                    </tbody>
                                  </table>
                                </div>
                                {product.bestFor && (
                                  <p className="mt-3 text-slate-600">{product.bestFor}</p>
                                )}
                                <p className="mt-3 text-slate-500">💡 {product.cta}</p>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700">Status</label>
            <p className="text-xs text-slate-500 mt-0.5">Draft → Contact → Conversation. You can move forward or back one step as needed.</p>
            <div className="mt-1 flex gap-2 flex-wrap">
              {STATUS_ORDER.map((s) => {
                const isCurrent = lead.status === s;
                const allowed = getAllowedStatuses(lead.status);
                const canSelect = allowed.includes(s);
                return (
                  <button
                    key={s}
                    type="button"
                    onClick={() => canSelect && !isCurrent && handleStatusChange(s)}
                    disabled={!canSelect || isCurrent}
                    className={`rounded px-3 py-1.5 text-sm font-medium ${
                      isCurrent
                        ? 'bg-blue-600 text-white cursor-default'
                        : canSelect
                          ? 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                          : 'bg-slate-50 text-slate-400 cursor-not-allowed'
                    }`}
                  >
                    {getStatusLabel(s)}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Preferred language, interested, follow-up — local state, save on button */}
          <div className="rounded border border-slate-200 bg-slate-50/50 p-3 space-y-3">
            <h3 className="text-sm font-medium text-slate-700">Lead preferences</h3>

            <div>
              <label className="block text-xs text-slate-600 mb-0.5">Preferred language</label>
              <select
                value={preferredLanguageLocal}
                onChange={(e) => setPreferredLanguageLocal(e.target.value)}
                className="w-full rounded border border-slate-300 px-3 py-2 text-sm"
              >
                {PREFERRED_LANGUAGES.map((opt) => (
                  <option key={opt || 'blank'} value={opt}>{opt || '— Select —'}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs text-slate-600 mb-0.5">Interested?</label>
              <select
                value={interestedLocal}
                onChange={(e) => setInterestedLocal(e.target.value)}
                className="w-full rounded border border-slate-300 px-3 py-2 text-sm"
              >
                {INTERESTED_OPTIONS.map((opt) => (
                  <option key={opt || 'blank'} value={opt}>{opt || '— Select —'}</option>
                ))}
              </select>
            </div>

            {interestedLocal === 'Yes' && (
              <div>
                <label className="block text-xs text-slate-600 mb-1">Interested in (multiple)</label>
                <div className="flex flex-col gap-1.5">
                  {INTERESTED_IN_OPTIONS.map((opt) => (
                    <label key={opt} className="flex items-center gap-2 text-sm text-slate-700">
                      <input
                        type="checkbox"
                        checked={interestedInLocal.includes(opt)}
                        onChange={() => handleInterestedInToggle(opt)}
                        className="rounded border-slate-300"
                      />
                      {opt}
                    </label>
                  ))}
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs text-slate-600 mb-0.5">
                {interestedLocal === 'Yes'
                  ? 'Other notes'
                  : 'Requirement / notes (if not interested or custom)'}
              </label>
              <textarea
                value={customReqLocal}
                onChange={(e) => setCustomReqLocal(e.target.value)}
                placeholder={interestedLocal === 'Yes' ? 'Any other note…' : 'Type his requirement or note…'}
                rows={2}
                className="w-full rounded border border-slate-300 px-3 py-2 text-sm"
              />
            </div>

            <div>
              <label className="block text-xs text-slate-600 mb-0.5">Follow-up interested?</label>
              <select
                value={followUpInterestedLocal}
                onChange={(e) => setFollowUpInterestedLocal(e.target.value)}
                className="w-full rounded border border-slate-300 px-3 py-2 text-sm"
              >
                {FOLLOW_UP_OPTIONS.map((opt) => (
                  <option key={opt || 'blank'} value={opt}>{opt || '— Select —'}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs text-slate-600 mb-0.5">Follow-up date</label>
              <input
                type="date"
                value={followUpDateLocal}
                onChange={(e) => setFollowUpDateLocal(e.target.value)}
                className="w-full rounded border border-slate-300 px-3 py-2 text-sm"
              />
            </div>

            <button
              type="button"
              onClick={handleSavePreferences}
              disabled={updateMutation.isPending}
              className="w-full rounded bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {updateMutation.isPending ? 'Saving…' : 'Save preferences'}
            </button>
          </div>

          {/* Saved preferences timeline — always visible above Activities */}
          <div className="rounded border border-slate-200 bg-slate-50/50 p-3">
            <h3 className="text-sm font-medium text-slate-700 mb-2">Saved preferences (timeline)</h3>
            {preferenceHistorySorted.length === 0 ? (
              <p className="text-xs text-slate-500 py-2">No saved preferences yet. Fill the form above and click Save preferences to add an entry.</p>
            ) : (
              <div className="space-y-1 max-h-56 overflow-y-auto">
                {preferenceHistorySorted.map((snap) => {
                  const id = snap._id?.toString() || snap.savedAt;
                  const isExpanded = expandedHistoryIds.has(id);
                  return (
                    <div key={id} className="rounded border border-slate-200 bg-white overflow-hidden">
                      <button
                        type="button"
                        onClick={() => toggleHistoryExpand(id)}
                        className="w-full flex items-center justify-between px-3 py-2 text-left text-sm hover:bg-slate-50"
                      >
                        <span className="text-slate-700 font-medium">{formatHistoryDate(snap.savedAt)}</span>
                        <span className="text-slate-400">{isExpanded ? '▼' : '▶'}</span>
                      </button>
                      {isExpanded && (
                        <div className="border-t border-slate-100 bg-slate-50/50 px-3 py-2.5 text-xs space-y-1.5">
                          <p><span className="text-slate-500">Preferred language:</span> {snap.preferredLanguage || '—'}</p>
                          <p><span className="text-slate-500">Interested:</span> {snap.interested || '—'}</p>
                          {Array.isArray(snap.interestedIn) && snap.interestedIn.length > 0 && (
                            <p><span className="text-slate-500">Interested in:</span> {snap.interestedIn.join(', ')}</p>
                          )}
                          {snap.customRequirement && (
                            <p><span className="text-slate-500">Requirement / notes:</span> {snap.customRequirement}</p>
                          )}
                          <p><span className="text-slate-500">Follow-up interested:</span> {snap.followUpInterested || '—'}</p>
                          <p><span className="text-slate-500">Follow-up date:</span> {snap.followUpDate ? formatHistoryDate(snap.followUpDate) : '—'}</p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div>
            <h3 className="text-sm font-medium text-slate-700">Activities</h3>
            {lead.activities?.length ? (
              <ul className="mt-2 space-y-2">
                {lead.activities.map((a, i) => (
                  <li key={i} className="rounded bg-slate-50 px-3 py-2 text-sm">
                    <span className="font-medium text-slate-700">{a.type}</span>
                    {a.note && <p className="text-slate-600">{a.note}</p>}
                    <p className="text-xs text-slate-400">
                      {new Date(a.createdAt).toLocaleString()}
                    </p>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-2 text-sm text-slate-500">No activities yet.</p>
            )}
          </div>

          <form onSubmit={handleAddActivity} className="space-y-2 rounded border border-slate-200 bg-slate-50 p-3">
            <h3 className="text-sm font-medium text-slate-700">Add activity</h3>
            <select
              value={activityType}
              onChange={(e) => setActivityType(e.target.value)}
              className="w-full rounded border border-slate-300 px-3 py-2 text-sm"
            >
              <option value="Note">Note</option>
              <option value="Called">Called</option>
              <option value="Email">Email</option>
              <option value="WhatsApp">WhatsApp</option>
              <option value="Meeting">Meeting</option>
            </select>
            <textarea
              value={activityNote}
              onChange={(e) => setActivityNote(e.target.value)}
              placeholder="Note…"
              rows={2}
              className="w-full rounded border border-slate-300 px-3 py-2 text-sm"
            />
            <button
              type="submit"
              disabled={activityMutation.isPending}
              className="rounded bg-blue-600 px-3 py-1.5 text-sm text-white hover:bg-blue-700 disabled:opacity-50"
            >
              Add
            </button>
            {activityMutation.isError && (
              <p className="text-xs text-red-600">{activityMutation.error.message}</p>
            )}
          </form>
        </div>
      </div>
    </>
  );
}
