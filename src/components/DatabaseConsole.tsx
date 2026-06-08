/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { db } from '../store';
import { Database, Table, RefreshCw, Layers, ShieldCheck, Check } from 'lucide-react';

export default function DatabaseConsole() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTable, setActiveTable] = useState<string>('profiles');
  const [, setTick] = useState(0);

  useEffect(() => {
    // Re-render whenever the database triggers an update
    const unsubscribe = db.subscribe(() => {
      setTick((t) => t + 1);
    });
    return unsubscribe;
  }, []);

  const tables = [
    { id: 'profiles', label: 'profiles', count: db.getProfiles().length },
    { id: 'user_plans', label: 'user_plans', count: db.getUserPlans().length },
    { id: 'events', label: 'events', count: db.getEventsTable().length },
    { id: 'guests', label: 'guests', count: db.getGuestsTable().length },
    { id: 'rsvp_responses', label: 'rsvp_responses', count: db.getRsvpResponsesTable().length },
    { id: 'invitation_views', label: 'invitation_views', count: db.getInvitationViewsTable().length },
  ];

  const handleReset = () => {
    if (confirm('Apakah Anda yakin ingin mereset basis data ke data simulasi awal?')) {
      db.clearAndPreseed();
    }
  };

  const renderTableData = () => {
    switch (activeTable) {
      case 'profiles': {
        const data = db.getProfiles();
        return (
          <div className="overflow-x-auto">
            <table className="w-full text-left font-mono text-xs text-slate-300">
              <thead className="border-b border-slate-700 bg-slate-900/60 text-slate-400">
                <tr>
                  <th className="p-2">id (UUID)</th>
                  <th className="p-2">full_name</th>
                  <th className="p-2">created_at</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {data.map((row) => (
                  <tr key={row.id} className="hover:bg-slate-800/40">
                    <td className="p-2 text-indigo-400 font-bold">{row.id}</td>
                    <td className="p-2 text-emerald-400">{row.full_name}</td>
                    <td className="p-2 text-slate-400">{row.created_at}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
      }
      case 'user_plans': {
        const data = db.getUserPlans();
        return (
          <div className="overflow-x-auto">
            <table className="w-full text-left font-mono text-xs text-slate-300">
              <thead className="border-b border-slate-700 bg-slate-900/60 text-slate-400">
                <tr>
                  <th className="p-2">user_id</th>
                  <th className="p-2">plan</th>
                  <th className="p-2">events_created</th>
                  <th className="p-2">max_events</th>
                  <th className="p-2">subscription_expires_at</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {data.map((row) => (
                  <tr key={row.user_id} className="hover:bg-slate-800/40">
                    <td className="p-2 text-indigo-400">{row.user_id}</td>
                    <td className="p-2">
                      <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold ${row.plan === 'premium' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' : 'bg-slate-700 text-slate-300'}`}>
                        {row.plan}
                      </span>
                    </td>
                    <td className="p-2 font-bold text-center text-sky-400">{row.events_created}</td>
                    <td className="p-2 text-center text-slate-400">{row.max_events}</td>
                    <td className="p-2 text-slate-400">{row.subscription_expires_at || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
      }
      case 'events': {
        const data = db.getEventsTable();
        return (
          <div className="overflow-x-auto">
            <table className="w-full text-left font-mono text-xs text-slate-300">
              <thead className="border-b border-slate-700 bg-slate-900/60 text-slate-400">
                <tr>
                  <th className="p-2">id (UUID)</th>
                  <th className="p-2">user_id</th>
                  <th className="p-2">slug</th>
                  <th className="p-2">title</th>
                  <th className="p-2">template_id</th>
                  <th className="p-2">event_date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {data.map((row) => (
                  <tr key={row.id} className="hover:bg-slate-800/40">
                    <td className="p-2 text-indigo-400 font-bold">{row.id.slice(0, 8)}...</td>
                    <td className="p-2 text-slate-400">{row.user_id.slice(0, 8)}...</td>
                    <td className="p-2 text-yellow-500 font-semibold">{row.slug}</td>
                    <td className="p-2 text-slate-200">{row.title}</td>
                    <td className="p-2 text-sky-400">{row.template_id}</td>
                    <td className="p-2 text-slate-400">{row.event_date.slice(0, 10)}</td>
                  </tr>
                ))}
                {data.length === 0 && (
                  <tr>
                    <td colSpan={6} className="p-4 text-center text-slate-500 italic">Belum ada data events.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        );
      }
      case 'guests': {
        const data = db.getGuestsTable();
        return (
          <div className="overflow-x-auto">
            <table className="w-full text-left font-mono text-xs text-slate-300">
              <thead className="border-b border-slate-700 bg-slate-900/60 text-slate-400">
                <tr>
                  <th className="p-2">id (UUID)</th>
                  <th className="p-2">event_id</th>
                  <th className="p-2">name</th>
                  <th className="p-2">unique_link</th>
                  <th className="p-2">rsvp_status</th>
                  <th className="p-2">guests_count</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {data.map((row) => (
                  <tr key={row.id} className="hover:bg-slate-800/40">
                    <td className="p-2 text-indigo-400">{row.id.slice(0, 8)}...</td>
                    <td className="p-2 text-slate-400">{row.event_id.slice(0, 8)}...</td>
                    <td className="p-2 text-emerald-400 font-semibold">{row.name}</td>
                    <td className="p-2 text-pink-400">{row.unique_link}</td>
                    <td className="p-2">
                      <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                        row.rsvp_status === 'hadir' ? 'bg-emerald-500/20 text-emerald-400' :
                        row.rsvp_status === 'tidak_hadir' ? 'bg-rose-500/20 text-rose-400' :
                        'bg-slate-700 text-slate-300'
                      }`}>
                        {row.rsvp_status}
                      </span>
                    </td>
                    <td className="p-2 text-center text-slate-300">{row.number_of_guests}</td>
                  </tr>
                ))}
                {data.length === 0 && (
                  <tr>
                    <td colSpan={6} className="p-4 text-center text-slate-500 italic">Belum ada data guests.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        );
      }
      case 'rsvp_responses': {
        const data = db.getRsvpResponsesTable();
        return (
          <div className="overflow-x-auto">
            <table className="w-full text-left font-mono text-xs text-slate-300">
              <thead className="border-b border-slate-700 bg-slate-900/60 text-slate-400">
                <tr>
                  <th className="p-2">id</th>
                  <th className="p-2">guest_id</th>
                  <th className="p-2">old_status</th>
                  <th className="p-2">new_status</th>
                  <th className="p-2">changed_at</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {data.map((row) => (
                  <tr key={row.id} className="hover:bg-slate-800/40">
                    <td className="p-2 text-indigo-400">{row.id.slice(0, 8)}...</td>
                    <td className="p-2 text-slate-400">{row.guest_id.slice(0, 8)}...</td>
                    <td className="p-2 text-slate-500">{row.old_status}</td>
                    <td className="p-2 text-emerald-400 font-semibold">{row.new_status}</td>
                    <td className="p-2 text-slate-400">{row.changed_at.slice(11, 19)}</td>
                  </tr>
                ))}
                {data.length === 0 && (
                  <tr>
                    <td colSpan={5} className="p-4 text-center text-slate-500 italic">Belum ada rsvp log masuk.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        );
      }
      case 'invitation_views': {
        const data = db.getInvitationViewsTable();
        return (
          <div className="overflow-x-auto">
            <table className="w-full text-left font-mono text-xs text-slate-300">
              <thead className="border-b border-slate-700 bg-slate-900/60 text-slate-400">
                <tr>
                  <th className="p-2">id</th>
                  <th className="p-2">guest_id</th>
                  <th className="p-2">viewed_at</th>
                  <th className="p-2">ip_address</th>
                  <th className="p-2">user_agent</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {data.map((row) => (
                  <tr key={row.id} className="hover:bg-slate-800/40">
                    <td className="p-2 text-indigo-400">{row.id.slice(0, 8)}...</td>
                    <td className="p-2 text-slate-400">{row.guest_id.slice(0, 8)}...</td>
                    <td className="p-2 text-slate-400">{row.viewed_at.slice(11, 19)}</td>
                    <td className="p-2 text-amber-400 font-semibold">{row.ip_address}</td>
                    <td className="p-2 text-slate-400 max-w-[200px] truncate" title={row.user_agent}>
                      {row.user_agent}
                    </td>
                  </tr>
                ))}
                {data.length === 0 && (
                  <tr>
                    <td colSpan={5} className="p-4 text-center text-slate-500 italic">Belum ada log log kunjungan masuk.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        );
      }
      default:
        return null;
    }
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-[#0d1527] border-t border-slate-700 shadow-2xl transition-all duration-300">
      {/* Drawer Handle */}
      <div 
        onClick={() => setIsOpen(!isOpen)} 
        className="flex items-center justify-between px-4 py-2 bg-gradient-to-r from-slate-900 to-[#121c33] cursor-pointer hover:bg-slate-800 text-slate-200 text-xs font-semibold"
      >
        <div className="flex items-center gap-2">
          <Database className="h-4 w-4 text-violet-400 animate-pulse" />
          <span>REAL-TIME DATABASE CONSOLE (SUPABASE & SQL SIMULATOR)</span>
          <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] px-1.5 py-0.2 rounded font-bold uppercase tracking-wider">
            Active
          </span>
        </div>
        <div className="flex items-center gap-3">
          <button 
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handleReset();
            }}
            className="flex items-center gap-1 bg-rose-950 hover:bg-rose-900 text-rose-200 px-2 py-0.5 rounded text-[10px] border border-rose-800"
          >
            <RefreshCw className="h-3 w-3" /> Reset DB
          </button>
          <span className="text-[10px] text-slate-400">
            {isOpen ? '▼ Klik untuk Menyembunyikan' : '▲ Klik untuk Membuka Panel Database (6 Tabel)'}
          </span>
        </div>
      </div>

      {/* Drawer Content */}
      {isOpen && (
        <div className="p-4 h-64 flex flex-col md:flex-row gap-4">
          {/* Table Selector */}
          <div className="w-full md:w-52 flex flex-row md:flex-col gap-1 overflow-x-auto md:overflow-x-visible shrink-0 pb-2 md:pb-0">
            {tables.map((t) => (
              <button
                key={t.id}
                onClick={() => setActiveTable(t.id)}
                className={`flex items-center justify-between px-3 py-2 rounded text-left font-mono text-xs font-medium transition-colors whitespace-nowrap md:whitespace-normal ${
                  activeTable === t.id
                    ? 'bg-violet-600 text-white'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Table className="h-3.5 w-3.5" />
                  <span>{t.label}</span>
                </div>
                <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${
                  activeTable === t.id ? 'bg-violet-800' : 'bg-slate-900'
                }`}>
                  {t.count}
                </span>
              </button>
            ))}
          </div>

          {/* Table Viewer */}
          <div className="grow bg-[#080d1a] rounded border border-slate-800 p-2 overflow-y-auto min-h-0">
            <div className="mb-2 flex items-center justify-between text-[11px] font-mono text-slate-500 border-b border-slate-800 pb-1.5">
              <span>TABEL: <strong className="text-violet-400 font-bold">{activeTable}</strong></span>
              <span className="flex items-center gap-1"><ShieldCheck className="h-3.5 w-3.5 text-emerald-400" /> RLS policy enabled</span>
            </div>
            {renderTableData()}
          </div>
        </div>
      )}
    </div>
  );
}
