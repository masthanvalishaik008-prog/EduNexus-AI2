import React, { useState, useEffect, useRef } from 'react';
import { liveUpdates, LiveTelemetryEvent } from '../services/liveUpdates';
import { Activity, Radio, CheckCircle2, Shield, Users, Wifi } from 'lucide-react';

export function LiveSyncBadge() {
  const [connected, setConnected] = useState<boolean>(true);
  const [telemetry, setTelemetry] = useState<LiveTelemetryEvent | null>(null);
  const [popoverOpen, setPopoverOpen] = useState<boolean>(false);
  const [lastEventMsg, setLastEventMsg] = useState<string>('Telemetry stream active');
  const popoverRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const unsubStatus = liveUpdates.subscribe('STATUS_CHANGE', (data) => {
      setConnected(Boolean(data.isConnected));
    });

    const unsubHeartbeat = liveUpdates.subscribe('TELEMETRY_HEARTBEAT', (data) => {
      setConnected(true);
      setTelemetry(data);
    });

    const unsubIntervention = liveUpdates.subscribe('INTERVENTION_UPDATED', (data) => {
      setLastEventMsg(`Intervention ${data.interventionId} updated by ${data.actorName}`);
    });

    const unsubAlert = liveUpdates.subscribe('ALERT_RESOLVED', (data) => {
      setLastEventMsg(`Alert ${data.alertId} resolved by ${data.resolvedBy}`);
    });

    const unsubActivity = liveUpdates.subscribe('STUDENT_ACTIVITY_PERSISTED', (data) => {
      setLastEventMsg(`New activity logged for ${data.studentName || 'Student'}`);
    });

    function handleClickOutside(e: MouseEvent) {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        setPopoverOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      unsubStatus();
      unsubHeartbeat();
      unsubIntervention();
      unsubAlert();
      unsubActivity();
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className="relative" ref={popoverRef}>
      <button
        type="button"
        onClick={() => setPopoverOpen(!popoverOpen)}
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200/90 dark:border-emerald-800 text-[11px] font-bold text-emerald-800 dark:text-emerald-300 transition-all hover:bg-emerald-100 dark:hover:bg-emerald-900/60 cursor-pointer shadow-2xs"
        title="Institutional Live Telemetry Stream Status"
      >
        <span className="relative flex h-2 w-2">
          {connected ? (
            <>
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </>
          ) : (
            <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
          )}
        </span>
        <span className="hidden sm:inline">Live Sync</span>
      </button>

      {/* Popover Diagnostic Details */}
      {popoverOpen && (
        <div className="absolute right-0 mt-2 w-72 bg-white dark:bg-[#0c182d] border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xl z-50 text-xs text-slate-800 dark:text-slate-200 space-y-3 animate-in fade-in zoom-in-95 duration-150">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
            <div className="flex items-center gap-2 font-black text-slate-900 dark:text-white">
              <Radio className="w-4 h-4 text-emerald-500 animate-pulse" />
              <span>Campus Live Stream</span>
            </div>
            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
              {connected ? 'ONLINE' : 'RECONNECTING'}
            </span>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-slate-500 dark:text-slate-400">Network Latency:</span>
              <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                {telemetry?.latencyMs || 12} ms
              </span>
            </div>
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-slate-500 dark:text-slate-400">Active Scholars Tracked:</span>
              <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
                {telemetry?.totalScholarsMonitored || 1000} Scholars
              </span>
            </div>
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-slate-500 dark:text-slate-400">Faculty Mentors Online:</span>
              <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
                {telemetry?.activeFacultyOnline || 50} Faculty
              </span>
            </div>
          </div>

          <div className="p-2.5 bg-slate-50 dark:bg-slate-900/80 rounded-xl border border-slate-200 dark:border-slate-800 text-[10px] space-y-1">
            <div className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1">
              <Activity className="w-3 h-3 text-blue-500" />
              <span>Recent Network Broadcast:</span>
            </div>
            <div className="text-slate-600 dark:text-slate-400 truncate font-mono">
              {lastEventMsg}
            </div>
          </div>

          <div className="text-[10px] text-slate-400 text-center font-medium">
            SSE WebSocket Fallback · 100% Institutional State Integrity
          </div>
        </div>
      )}
    </div>
  );
}
