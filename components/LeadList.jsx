'use client';

import { useState, useMemo, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  leadsQuery,
  sourcesQuery,
  createLead,
  updateLead,
  runScrape,
  getStates,
  getCities,
  getDepartments,
} from '@/lib/api';
import LeadDetail from '@/components/LeadDetail';

const defaultCountry = 'India';

export default function LeadList() {
  const queryClient = useQueryClient();
  const [country, setCountry] = useState(defaultCountry);
  const [state, setState] = useState('');
  const [city, setCity] = useState('');
  const [source, setSource] = useState('');
  const [status, setStatus] = useState('');
  const [interested, setInterested] = useState('');
  const [selectedId, setSelectedId] = useState(null);
  const [showAdd, setShowAdd] = useState(false);
  const [showScrape, setShowScrape] = useState(false);
  const [scrapeQuery, setScrapeQuery] = useState('business');
  const [scrapeCity, setScrapeCity] = useState('');
  const [scrapeState, setScrapeState] = useState('Maharashtra');
  const [scrapeLimit, setScrapeLimit] = useState('60');
  const [scrapeResult, setScrapeResult] = useState(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(50);

  const filterParams = useMemo(() => {
    const p = { page, limit: pageSize };
    if (country) p.country = country;
    if (state) p.state = state;
    if (city) p.city = city;
    if (source) p.source = source;
    if (status) p.status = status;
    if (interested) p.interested = interested;
    return p;
  }, [country, state, city, source, status, interested, page, pageSize]);

  const { data, isLoading, error } = useQuery({
    queryKey: ['leads', filterParams],
    queryFn: () => leadsQuery(filterParams),
  });

  const leads = data?.leads ?? [];
  const pagination = data?.pagination ?? { page: 1, limit: pageSize, total: 0, totalPages: 0 };

  useEffect(() => {
    setPage(1);
  }, [country, state, city, source, status, interested]);

  const { data: sources = [] } = useQuery({
    queryKey: ['sources'],
    queryFn: sourcesQuery,
  });

  const { data: states = [] } = useQuery({
    queryKey: ['states', country],
    queryFn: () => getStates(country),
    enabled: !!country,
  });

  const { data: cities = [] } = useQuery({
    queryKey: ['cities', country, state],
    queryFn: () => getCities(country, state),
    enabled: !!state,
  });

  const { data: scrapeCities = [] } = useQuery({
    queryKey: ['cities', country, scrapeState],
    queryFn: () => getCities(country, scrapeState),
    enabled: !!scrapeState,
  });

  const { data: departments = [] } = useQuery({
    queryKey: ['departments'],
    queryFn: getDepartments,
  });

  const createMutation = useMutation({
    mutationFn: createLead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      setShowAdd(false);
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }) => updateLead(id, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leads'] });
    },
  });

  const scrapeMutation = useMutation({
    mutationFn: runScrape,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      setScrapeResult({
        count: data.count,
        leads: data.leads || [],
        skippedNoPhone: data.skippedNoPhone ?? 0,
        skippedDuplicate: data.skippedDuplicate ?? 0,
        message: data.message,
      });
    },
  });

  const handleAddLead = (e) => {
    e.preventDefault();
    const form = e.target;
    const phone = (form.phone?.value || '').trim();
    if (!phone || phone.replace(/\D/g, '').length < 10) return;
    createMutation.mutate({
      name: form.name.value,
      phone,
      email: form.email?.value || '',
      address: form.address?.value || '',
      city: form.city?.value || city,
      state: form.state?.value || state,
      country: country,
      department: form.department?.value || '',
      source: form.source?.value || 'Google Places',
      status: 'draft',
    });
  };

  const handleRunScrape = (e) => {
    e.preventDefault();
    setScrapeResult(null);
    const limitVal = scrapeLimit ? parseInt(scrapeLimit, 10) : 60;
    scrapeMutation.mutate({
      query: scrapeQuery.trim() || 'business',
      city: scrapeCity.trim(),
      state: scrapeState.trim() || state || 'Maharashtra',
      limit: Number.isFinite(limitVal) && limitVal > 0 ? limitVal : 60,
    });
  };

  const closeScrapeModal = () => {
    setShowScrape(false);
    setScrapeResult(null);
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-6">
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Leads</h1>
        <p className="text-slate-600">Filter by location and source. Fetch from Google Places or add manually.</p>
      </header>

      <div className="mb-4 flex flex-wrap gap-2">
        <select
          className="rounded border border-slate-300 px-3 py-2 text-sm"
          value={country}
          onChange={(e) => { setCountry(e.target.value); setState(''); setCity(''); }}
        >
          <option value="India">India</option>
        </select>
        <select
          className="rounded border border-slate-300 px-3 py-2 text-sm"
          value={state}
          onChange={(e) => { setState(e.target.value); setCity(''); }}
        >
          <option value="">All states</option>
          {states.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
        <select
          className="rounded border border-slate-300 px-3 py-2 text-sm"
          value={city}
          onChange={(e) => setCity(e.target.value)}
        >
          <option value="">All cities</option>
          {cities.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
        <select
          className="rounded border border-slate-300 px-3 py-2 text-sm"
          value={source}
          onChange={(e) => setSource(e.target.value)}
        >
          <option value="">All sources</option>
          {sources.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
        <select
          className="rounded border border-slate-300 px-3 py-2 text-sm"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
        >
          <option value="">All statuses</option>
          <option value="draft">Draft</option>
          <option value="contact">Contact</option>
          <option value="conversation">Conversation</option>
        </select>
        <button
          type="button"
          onClick={() => setShowAdd(true)}
          className="rounded bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700"
        >
          Add lead
        </button>
        <button
          type="button"
          onClick={() => {
            setScrapeQuery('business');
            setScrapeState(state || 'Maharashtra');
            setScrapeCity(city || '');
            setScrapeResult(null);
            setShowScrape(true);
          }}
          className="rounded bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          Fetch from Google Places
        </button>
      </div>

      <div className="mb-4 flex items-center gap-2">
        <span className="text-sm font-medium text-slate-600">Interested:</span>
        <div className="inline-flex rounded-lg border border-slate-200 bg-white p-0.5" role="tablist">
          {[
            { value: '', label: 'All' },
            { value: 'Yes', label: 'Yes' },
            { value: 'No', label: 'No' },
            { value: 'Maybe', label: 'Maybe' },
          ].map(({ value, label }) => (
            <button
              key={value || 'all'}
              type="button"
              role="tab"
              aria-selected={interested === value}
              onClick={() => setInterested(value)}
              className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                interested === value
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div className="mb-4 rounded bg-red-100 p-3 text-red-800">{error.message}</div>
      )}

      {isLoading ? (
        <div className="rounded border border-slate-200 bg-white p-8 text-center text-slate-500">
          Loading leads…
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-100">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-slate-600">Name</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-slate-600">Phone</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-slate-600">Source</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-slate-600">Website</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-slate-600">Interested</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-slate-600">Business type</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-slate-600">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-slate-600">City</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-slate-600">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {leads.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="px-4 py-8 text-center text-slate-500">
                      No leads. Add one or fetch from Google Places.
                    </td>
                  </tr>
                ) : (
                  leads.map((lead) => (
                    <tr key={lead._id} className="hover:bg-slate-50">
                      <td className="px-4 py-3 text-sm text-slate-800">{lead.name}</td>
                      <td className="px-4 py-3 text-sm text-slate-600">{lead.phone || '—'}</td>
                      <td className="px-4 py-3 text-sm text-slate-600">{lead.source || '—'}</td>
                      <td className="px-4 py-3 text-sm text-slate-600">
                        {lead.website ? (
                          <a
                            href={lead.website.startsWith('http') ? lead.website : `https://${lead.website}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline truncate max-w-[180px] inline-block"
                            title={lead.website}
                          >
                            {lead.website.replace(/^https?:\/\//, '').slice(0, 30)}
                            {(lead.website.replace(/^https?:\/\//, '')).length > 30 ? '…' : ''}
                          </a>
                        ) : (
                          '—'
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline rounded px-2 py-0.5 text-xs font-medium ${
                            lead.interested === 'Yes'
                              ? 'bg-emerald-100 text-emerald-800'
                              : lead.interested === 'No'
                                ? 'bg-red-100 text-red-800'
                                : lead.interested === 'Maybe'
                                  ? 'bg-amber-100 text-amber-800'
                                  : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          {lead.interested || '—'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-600">{lead.department || '—'}</td>
                      <td className="px-4 py-3">
                        <select
                          value={lead.status || 'draft'}
                          onChange={(e) => {
                            const newStatus = e.target.value;
                            if (newStatus && newStatus !== lead.status) {
                              updateStatusMutation.mutate({ id: lead._id, status: newStatus });
                            }
                          }}
                          className={`rounded border px-2 py-1 text-xs font-medium cursor-pointer ${
                            lead.status === 'conversation'
                              ? 'bg-green-100 text-green-800 border-green-200'
                              : lead.status === 'contact'
                              ? 'bg-amber-100 text-amber-800 border-amber-200'
                              : 'bg-slate-100 text-slate-800 border-slate-200'
                          }`}
                        >
                          <option value="draft">Draft</option>
                          <option value="contact">Contact</option>
                          <option value="conversation">Conversation</option>
                        </select>
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-600">{lead.city || '—'}</td>
                      <td className="px-4 py-3">
                        <button
                          type="button"
                          onClick={() => setSelectedId(lead._id)}
                          className="text-blue-600 hover:underline"
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          {leads.length > 0 && (
            <div className="flex flex-wrap items-center justify-between gap-2 border-t border-slate-200 bg-slate-50 px-4 py-3">
              <div className="text-sm text-slate-600">
                Showing {(pagination.page - 1) * pagination.limit + 1}–{Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total}
              </div>
              <div className="flex items-center gap-2">
                <select
                  value={pageSize}
                  onChange={(e) => { setPageSize(Number(e.target.value)); setPage(1); }}
                  className="rounded border border-slate-300 px-2 py-1 text-sm"
                >
                  <option value={25}>25 per page</option>
                  <option value={50}>50 per page</option>
                  <option value={100}>100 per page</option>
                  <option value={200}>200 per page</option>
                </select>
                <button
                  type="button"
                  disabled={pagination.page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  className="rounded border border-slate-300 bg-white px-3 py-1 text-sm hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <span className="text-sm text-slate-600">
                  Page {pagination.page} of {Math.max(1, pagination.totalPages)}
                </span>
                <button
                  type="button"
                  disabled={pagination.page >= pagination.totalPages}
                  onClick={() => setPage((p) => p + 1)}
                  className="rounded border border-slate-300 bg-white px-3 py-1 text-sm hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {selectedId && (
        <LeadDetail
          leadId={selectedId}
          onClose={() => setSelectedId(null)}
          onUpdated={() => queryClient.invalidateQueries({ queryKey: ['leads'] })}
        />
      )}

      {showAdd && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-lg bg-white p-6 shadow-xl">
            <h2 className="mb-4 text-lg font-semibold">Add lead</h2>
            <form onSubmit={handleAddLead} className="space-y-3">
              <input name="name" required placeholder="Name" className="w-full rounded border px-3 py-2" />
              <input name="phone" required placeholder="Phone (required, min 10 digits)" className="w-full rounded border px-3 py-2" minLength={10} />
              <input name="email" type="email" placeholder="Email" className="w-full rounded border px-3 py-2" />
              <input name="address" placeholder="Address" className="w-full rounded border px-3 py-2" />
              <input name="city" placeholder="City" defaultValue={city} className="w-full rounded border px-3 py-2" />
              <input name="state" placeholder="State" defaultValue={state} className="w-full rounded border px-3 py-2" />
              <select name="department" className="w-full rounded border px-3 py-2">
                <option value="">Business type (e.g. Hospitals)</option>
                {departments.map((d) => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
              <select name="source" className="w-full rounded border px-3 py-2">
                {sources.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
              <div className="flex gap-2 pt-2">
                <button type="submit" className="rounded bg-emerald-600 px-4 py-2 text-white hover:bg-emerald-700">
                  Save
                </button>
                <button type="button" onClick={() => setShowAdd(false)} className="rounded border px-4 py-2">
                  Cancel
                </button>
              </div>
            </form>
            {createMutation.isError && (
              <p className="mt-2 text-sm text-red-600">{createMutation.error.message}</p>
            )}
          </div>
        </div>
      )}

      {showScrape && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-lg rounded-lg bg-white p-6 shadow-xl max-h-[90vh] overflow-y-auto">
            <h2 className="mb-4 text-lg font-semibold">Fetch from Google Places</h2>

            {!scrapeResult ? (
              <form onSubmit={handleRunScrape} className="space-y-3">
                <div className="rounded bg-slate-100 px-3 py-2 text-sm text-slate-700">
                  <p className="font-medium text-slate-800 mb-1">Search:</p>
                  <p><span className="text-slate-500">Query:</span> {scrapeQuery || '—'}</p>
                  <p><span className="text-slate-500">City:</span> {scrapeCity || '—'}</p>
                  <p><span className="text-slate-500">State:</span> {scrapeState || state || '—'}</p>
                  <p><span className="text-slate-500">Max leads:</span> {scrapeLimit || '60'} (only leads with phone are saved)</p>
                </div>
                <div>
                  <label className="block text-sm text-slate-600">Business type / keyword</label>
                  <select
                    name="query"
                    value={scrapeQuery}
                    onChange={(e) => setScrapeQuery(e.target.value)}
                    className="mt-1 w-full rounded border px-3 py-2"
                  >
                    <option value="business">Business</option>
                    <option value="schools">Schools</option>
                    <option value="restaurants">Restaurants</option>
                    <option value="hospitals">Hospitals</option>
                    <option value="hotels">Hotels</option>
                    <option value="plumber">Plumber</option>
                    <option value="doctors">Doctors</option>
                    <option value="pharmacies">Pharmacies</option>
                    <option value="banks">Banks</option>
                    <option value="shops">Shops</option>
                  </select>
                  <p className="mt-0.5 text-xs text-slate-500">Choose the type of places to search for.</p>
                </div>
                <div>
                  <label className="block text-sm text-slate-600">State</label>
                  <select
                    name="scrapeState"
                    value={scrapeState}
                    onChange={(e) => { setScrapeState(e.target.value); setScrapeCity(''); }}
                    className="mt-1 w-full rounded border border-slate-300 px-3 py-2"
                  >
                    <option value="">Select state</option>
                    {states.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-slate-600">City</label>
                  <select
                    name="city"
                    value={scrapeCity}
                    onChange={(e) => setScrapeCity(e.target.value)}
                    className="mt-1 w-full rounded border border-slate-300 px-3 py-2"
                    disabled={!scrapeState}
                  >
                    <option value="">Select city</option>
                    {scrapeCities.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-slate-600">Max leads to fetch (1–200, only with phone)</label>
                  <input
                    type="number"
                    min="1"
                    max="200"
                    value={scrapeLimit}
                    onChange={(e) => setScrapeLimit(e.target.value)}
                    placeholder="60"
                    className="mt-1 w-full rounded border px-3 py-2"
                  />
                </div>
                <div className="flex gap-2 pt-2">
                  <button
                    type="submit"
                    disabled={scrapeMutation.isPending}
                    className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
                  >
                    {scrapeMutation.isPending ? 'Fetching…' : 'Fetch'}
                  </button>
                  <button type="button" onClick={closeScrapeModal} className="rounded border px-4 py-2">
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <div>
                <p className="mb-2 font-medium text-green-700">{scrapeResult.message || `Added ${scrapeResult.count} lead(s) — all with phone, stored in DB.`}</p>
                {scrapeResult.skippedNoPhone > 0 && (
                  <p className="mb-2 text-sm text-amber-700">{scrapeResult.skippedNoPhone} result(s) skipped (no phone number).</p>
                )}
                {scrapeResult.skippedDuplicate > 0 && (
                  <p className="mb-2 text-sm text-slate-600">{scrapeResult.skippedDuplicate} result(s) skipped (already in your list).</p>
                )}
                <ul className="mb-4 space-y-2 max-h-60 overflow-y-auto rounded border border-slate-200 bg-slate-50 p-2">
                  {scrapeResult.leads.length === 0 ? (
                    <li className="text-sm text-slate-500">No leads returned.</li>
                  ) : (
                    scrapeResult.leads.slice(0, 50).map((lead) => (
                      <li key={lead._id} className="rounded bg-white px-3 py-2 text-sm border border-slate-200">
                        <span className="font-medium text-slate-800">{lead.name}</span>
                        {lead.phone && <span className="ml-2 text-slate-600">{lead.phone}</span>}
                        {lead.email && <span className="ml-2 text-slate-500">{lead.email}</span>}
                        {lead.address && <p className="text-xs text-slate-500 mt-0.5">{lead.address}</p>}
                      </li>
                    ))
                  )}
                </ul>
                {scrapeResult.leads.length > 50 && (
                  <p className="mb-2 text-sm text-slate-500">Showing first 50. View all in the lead list below.</p>
                )}
                <button
                  type="button"
                  onClick={closeScrapeModal}
                  className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
                >
                  Close
                </button>
              </div>
            )}
            {scrapeMutation.isError && (
              <p className="mt-2 text-sm text-red-600">{scrapeMutation.error.message}</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
