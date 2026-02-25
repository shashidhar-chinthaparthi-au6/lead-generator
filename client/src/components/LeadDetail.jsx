import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { leadByIdQuery, updateLead, addActivity } from '../api/leads.js';

export default function LeadDetail({ leadId, onClose, onUpdated }) {
  const queryClient = useQueryClient();
  const [activityType, setActivityType] = useState('Note');
  const [activityNote, setActivityNote] = useState('');

  const { data: lead, isLoading, error } = useQuery({
    queryKey: ['lead', leadId],
    queryFn: () => leadByIdQuery(leadId),
    enabled: !!leadId,
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, body }) => updateLead(id, body),
    onSuccess: () => {
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

  const handleStatusChange = (newStatus) => {
    updateMutation.mutate({ id: leadId, body: { status: newStatus } });
  };

  const handleAddActivity = (e) => {
    e.preventDefault();
    activityMutation.mutate({ type: activityType, note: activityNote });
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
            {lead.address && <p className="text-sm text-slate-600">{lead.address}</p>}
            <p className="text-sm text-slate-500">
              {[lead.city, lead.state, lead.country].filter(Boolean).join(', ')}
            </p>
            {lead.department && (
              <p className="mt-1 text-xs text-slate-500">Business type: {lead.department}</p>
            )}
            {lead.offering && (
              <p className="mt-1 text-xs text-slate-500">Offering: {lead.offering}</p>
            )}
            {lead.source && (
              <p className="text-xs text-slate-500">Source: {lead.source}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700">Status</label>
            <div className="mt-1 flex gap-2">
              {['draft', 'contact', 'conversation'].map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => handleStatusChange(s)}
                  className={`rounded px-3 py-1.5 text-sm font-medium ${
                    lead.status === s
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
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
