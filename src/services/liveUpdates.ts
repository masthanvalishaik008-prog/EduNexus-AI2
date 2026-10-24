/**
 * EduNexus Live Updates Client Service
 * Subscribes to Server-Sent Events (SSE) /api/live/stream
 * Handles automatic reconnect, heartbeat tracking, and multi-component subscriptions.
 */

export interface LiveTelemetryEvent {
  connectedObservers?: number;
  totalScholarsMonitored?: number;
  activeFacultyOnline?: number;
  systemHealth?: string;
  latencyMs?: number;
  broadcastAt?: string;
}

export interface LiveInterventionEvent {
  interventionId: string;
  actionNote: string;
  status: string;
  actorName: string;
  timestamp: string;
  broadcastAt?: string;
}

export interface LiveAlertEvent {
  alertId: string;
  status: string;
  facultyNotes: string;
  resolvedBy: string;
  timestamp: string;
  broadcastAt?: string;
}

type EventCallback = (data: any) => void;

class LiveUpdateService {
  private eventSource: EventSource | null = null;
  private listeners: Map<string, Set<EventCallback>> = new Map();
  private isConnected: boolean = false;
  private lastHeartbeat: LiveTelemetryEvent | null = null;
  private reconnectTimeout: any = null;

  constructor() {
    this.connect();
  }

  public connect() {
    if (typeof window === 'undefined') return;
    if (this.eventSource) {
      this.eventSource.close();
    }

    try {
      this.eventSource = new EventSource('/api/live/stream');

      this.eventSource.addEventListener('CONNECTED', (e: MessageEvent) => {
        this.isConnected = true;
        try {
          const payload = JSON.parse(e.data);
          this.emit('CONNECTED', payload);
        } catch {
          // ignore
        }
      });

      this.eventSource.addEventListener('TELEMETRY_HEARTBEAT', (e: MessageEvent) => {
        this.isConnected = true;
        try {
          const payload = JSON.parse(e.data);
          this.lastHeartbeat = payload;
          this.emit('TELEMETRY_HEARTBEAT', payload);
        } catch {
          // ignore
        }
      });

      this.eventSource.addEventListener('INTERVENTION_UPDATED', (e: MessageEvent) => {
        try {
          const payload = JSON.parse(e.data);
          this.emit('INTERVENTION_UPDATED', payload);
        } catch {
          // ignore
        }
      });

      this.eventSource.addEventListener('ALERT_RESOLVED', (e: MessageEvent) => {
        try {
          const payload = JSON.parse(e.data);
          this.emit('ALERT_RESOLVED', payload);
        } catch {
          // ignore
        }
      });

      this.eventSource.addEventListener('STUDENT_ACTIVITY_PERSISTED', (e: MessageEvent) => {
        try {
          const payload = JSON.parse(e.data);
          this.emit('STUDENT_ACTIVITY_PERSISTED', payload);
        } catch {
          // ignore
        }
      });

      this.eventSource.onopen = () => {
        this.isConnected = true;
        this.emit('STATUS_CHANGE', { isConnected: true });
      };

      this.eventSource.onerror = () => {
        this.isConnected = false;
        this.emit('STATUS_CHANGE', { isConnected: false });
        if (this.eventSource) {
          this.eventSource.close();
          this.eventSource = null;
        }
        // Attempt reconnect after 5 seconds
        clearTimeout(this.reconnectTimeout);
        this.reconnectTimeout = setTimeout(() => {
          this.connect();
        }, 5000);
      };
    } catch (err) {
      console.warn('Failed to initialize SSE EventSource:', err);
      this.isConnected = false;
    }
  }

  public subscribe(eventType: string, cb: EventCallback): () => void {
    if (!this.listeners.has(eventType)) {
      this.listeners.set(eventType, new Set());
    }
    this.listeners.get(eventType)!.add(cb);

    // If already connected and asking for status, notify immediately
    if (eventType === 'STATUS_CHANGE') {
      cb({ isConnected: this.isConnected, lastHeartbeat: this.lastHeartbeat });
    }

    return () => {
      this.listeners.get(eventType)?.delete(cb);
    };
  }

  private emit(eventType: string, data: any) {
    const subs = this.listeners.get(eventType);
    if (subs) {
      subs.forEach((cb) => {
        try {
          cb(data);
        } catch (err) {
          console.error(`Error in live listener for ${eventType}:`, err);
        }
      });
    }
  }

  public getStatus() {
    return {
      isConnected: this.isConnected,
      lastHeartbeat: this.lastHeartbeat,
    };
  }
}

export const liveUpdates = new LiveUpdateService();
