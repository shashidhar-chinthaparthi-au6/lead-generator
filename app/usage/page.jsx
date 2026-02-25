'use client';

import { useQuery } from '@tanstack/react-query';
import { getQuotaStatus } from '@/lib/api';

export default function UsagePage() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['quota'],
    queryFn: getQuotaStatus,
  });

  const used = data?.used ?? 0;
  const limit = data?.limit ?? 5000;
  const month = data?.month ?? '—';
  const enabled = data?.enabled ?? false;
  const pct = limit > 0 ? Math.min(100, Math.round((used / limit) * 100)) : 0;

  return (
    <div className="p-4 md:p-6">
      <div className="max-w-xl">
        <h1 className="text-2xl font-bold text-slate-800 mb-1">
          Google Places API usage
        </h1>
        <p className="text-slate-600 mb-6">
          Monthly consumption for Fetch from Google Places. Resets each calendar month.
        </p>

        {isLoading && (
          <div className="rounded-lg border border-slate-200 bg-white p-8 text-center text-slate-500">
            Loading…
          </div>
        )}

        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-800">
            {error.message}
          </div>
        )}

        {data && !error && (
          <div className="rounded-lg border border-slate-200 bg-white shadow-sm overflow-hidden">
            <div className="p-6 space-y-6">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="font-medium text-slate-700">Current month</span>
                  <span className="text-slate-500">{month}</span>
                </div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-slate-600">Requests used</span>
                  <span className="font-semibold text-slate-800">
                    {used.toLocaleString()} / {limit.toLocaleString()}
                  </span>
                </div>
                <div className="h-3 rounded-full bg-slate-200 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${
                      pct >= 90 ? 'bg-red-500' : pct >= 70 ? 'bg-amber-500' : 'bg-blue-500'
                    }`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <p className="mt-1 text-xs text-slate-500">
                  {pct}% of monthly limit used
                </p>
              </div>

              <div className="pt-4 border-t border-slate-100">
                <p className="text-sm text-slate-600">
                  <span className="font-medium text-slate-700">API status:</span>{' '}
                  {enabled ? (
                    <span className="text-emerald-600">Enabled</span>
                  ) : (
                    <span className="text-amber-600">Disabled (set GOOGLE_PLACES_API_ENABLED=true to use)</span>
                  )}
                </p>
                <p className="mt-2 text-xs text-slate-500">
                  Limit is set by FREE_TIER_MONTHLY_LIMIT in .env (default 5,000 requests/month).
                  Each Text Search and each Place Details call counts as one request.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
