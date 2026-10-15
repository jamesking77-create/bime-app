import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { AppState } from "react-native";
import type { Block, Level, MomentumState } from "@bime/core";
import { success } from "../ui/haptics";
import { useWeek } from "./week";

// One lock-in session at a time. Time is measured from timestamps, not by
// counting ticks, so it stays right when the phone sleeps or the app is in the
// background.

export interface Target {
  itemId: string;
  title: string;
  course: string;
  part?: number;
  mins: number;
  level: Level;
}

export type Phase = "idle" | "running" | "ended" | "complete";

interface Session {
  phase: Phase;
  target?: Target;
  /** When the current stretch of focus started. */
  startedAt: number;
  /** Focus banked before the current stretch (after Keep going). */
  focusedMs: number;
  /** Set when a session runs to the end: its length and the state before it. */
  finished?: { mins: number; before: MomentumState };
}

/** A planned session as a lock-in, at the level of the day you study it. */
export function targetFor(block: Block, level: Level): Target {
  return { itemId: block.itemId, title: block.title, course: block.course, part: block.part, mins: block.end - block.start, level };
}

type LockInApi = Session & {
  /** Milliseconds focused so far, as of `at`. */
  elapsed: (at: number) => number;
  start: (target: Target) => void;
  /** Stop the clock and offer Keep going. */
  endEarly: () => void;
  resume: () => void;
  /** Count the minutes focused and give the rest back to the plan. */
  stop: () => void;
  /** Run to the end now. */
  finish: () => void;
  dismiss: () => void;
};

const LockInContext = createContext<LockInApi | null>(null);
const IDLE: Session = { phase: "idle", startedAt: 0, focusedMs: 0 };

export function LockInProvider({ children }: { children: ReactNode }) {
  const { addHeld, momentum } = useWeek();
  const [session, setSession] = useState<Session>(IDLE);

  const elapsed = useCallback(
    (at: number) => session.focusedMs + (session.phase === "running" ? Math.max(0, at - session.startedAt) : 0),
    [session],
  );

  const start = useCallback((target: Target) => {
    setSession({ phase: "running", target, startedAt: Date.now(), focusedMs: 0 });
  }, []);

  const endEarly = useCallback(() => {
    if (session.phase !== "running") return;
    setSession({ ...session, phase: "ended", focusedMs: session.focusedMs + Date.now() - session.startedAt });
  }, [session]);

  const resume = useCallback(() => {
    if (session.phase !== "ended") return;
    setSession({ ...session, phase: "running", startedAt: Date.now() });
  }, [session]);

  const stop = useCallback(() => {
    if (!session.target) return;
    const mins = Math.floor(session.focusedMs / 60_000);
    if (mins >= 1) addHeld({ ...session.target, mins, early: true });
    setSession(IDLE);
  }, [session, addHeld]);

  const finish = useCallback(() => {
    if (session.phase !== "running" || !session.target) return;
    const { target } = session;
    addHeld({ ...target, early: false });
    setSession({ ...session, phase: "complete", focusedMs: target.mins * 60_000, finished: { mins: target.mins, before: momentum.state } });
    success();
  }, [session, addHeld, momentum.state]);

  const dismiss = useCallback(() => setSession(IDLE), []);

  // End the session on time, including after the app comes back to the front.
  useEffect(() => {
    const { phase, target, startedAt, focusedMs } = session;
    if (phase !== "running" || !target) return;
    const total = target.mins * 60_000;
    const timer = setTimeout(finish, Math.max(0, total - focusedMs - (Date.now() - startedAt)));
    const sub = AppState.addEventListener("change", next => {
      if (next === "active" && focusedMs + Date.now() - startedAt >= total) finish();
    });
    return () => {
      clearTimeout(timer);
      sub.remove();
    };
  }, [session, finish]);

  const value = useMemo(
    () => ({ ...session, elapsed, start, endEarly, resume, stop, finish, dismiss }),
    [session, elapsed, start, endEarly, resume, stop, finish, dismiss],
  );
  return <LockInContext.Provider value={value}>{children}</LockInContext.Provider>;
}

export function useLockIn(): LockInApi {
  const value = useContext(LockInContext);
  if (!value) throw new Error("useLockIn must be used inside LockInProvider");
  return value;
}

/** Re-renders every `ms` while `active`, for clocks on screen. */
export function useNow(active: boolean, ms = 1000): number {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    if (!active) return;
    const id = setInterval(() => setNow(Date.now()), ms);
    return () => clearInterval(id);
  }, [active, ms]);
  return now;
}
