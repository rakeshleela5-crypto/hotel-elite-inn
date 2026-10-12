import React from 'react';
import { Calendar, ShieldCheck, Lock } from 'lucide-react';

/**
 * DateRangePills
 * Reusable dynamic historical range selector matching the architectural blueprint:
 * Staff: 'today', '7d', '15d' (recent operational slice)
 * Owner: '30d', '1y' (unlocked full historical financial analytics)
 */
export default function DateRangePills({ activeRange, onSelectRange, userRole = 'staff', className = '' }) {
  const isOwner = userRole === 'owner' || userRole === 'admin' || userRole === 'manager';

  const ranges = [
    { id: 'today', label: 'Today', staffAllowed: true },
    { id: '7d', label: 'Last 7 Days', staffAllowed: true },
    { id: '15d', label: 'Last 15 Days', staffAllowed: true },
    { id: '30d', label: 'Last Month (30d)', staffAllowed: false },
    { id: '1y', label: 'Past 1 Year', staffAllowed: false }
  ];

  return (
    <div className={`flex flex-wrap items-center gap-1.5 p-1 bg-slate-900/60 backdrop-blur-md rounded-xl border border-slate-700/60 ${className}`}>
      <div className="flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-slate-400">
        <Calendar className="w-3.5 h-3.5 text-amber-400" />
        <span>Range:</span>
      </div>

      {ranges.map((r) => {
        const isActive = activeRange === r.id;
        const isLocked = !r.staffAllowed && !isOwner;

        return (
          <button
            key={r.id}
            type="button"
            disabled={isLocked}
            onClick={() => !isLocked && onSelectRange(r.id)}
            title={isLocked ? 'Restricted to Owner/Management role' : `Filter logs for ${r.label}`}
            className={`
              relative flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200
              ${isActive
                ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-bold shadow-md shadow-amber-500/20 ring-1 ring-amber-400'
                : isLocked
                  ? 'bg-slate-800/40 text-slate-500 cursor-not-allowed opacity-60'
                  : 'bg-slate-800/70 text-slate-300 hover:bg-slate-700 hover:text-white border border-slate-700/50'
              }
            `}
          >
            <span>{r.label}</span>
            {isLocked && <Lock className="w-2.5 h-2.5 text-slate-500" />}
            {isActive && isOwner && !r.staffAllowed && (
              <ShieldCheck className="w-3 h-3 text-slate-950 ml-0.5" />
            )}
          </button>
        );
      })}
    </div>
  );
}
