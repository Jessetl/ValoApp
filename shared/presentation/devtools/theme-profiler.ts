import type { ProfilerOnRenderCallback } from 'react';

type ToggleSample = {
  actualDuration: number;
  commitLatency: number;
};

let toggleStartedAt: number | null = null;
let currentToggleToken = 0;
let activeToggleToken: number | null = null;
let toggleSamples: ToggleSample[] = [];
let summaryTimeout: ReturnType<typeof setTimeout> | null = null;

function nowMs(): number {
  if (
    typeof performance !== 'undefined' &&
    typeof performance.now === 'function'
  ) {
    return performance.now();
  }
  return Date.now();
}

function round(value: number): number {
  return Math.round(value * 100) / 100;
}

function average(values: number[]): number {
  if (values.length === 0) return 0;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

export function markThemeToggleStart(): void {
  if (!__DEV__) return;

  if (summaryTimeout) {
    clearTimeout(summaryTimeout);
    summaryTimeout = null;
  }

  currentToggleToken += 1;
  activeToggleToken = currentToggleToken;
  toggleStartedAt = nowMs();
  toggleSamples = [];

  const token = currentToggleToken;

  summaryTimeout = setTimeout(() => {
    if (activeToggleToken !== token) return;

    const interactionLatencies = toggleSamples.map(
      (sample) => sample.commitLatency,
    );
    const renderDurations = toggleSamples.map(
      (sample) => sample.actualDuration,
    );

    if (interactionLatencies.length > 0) {
      console.log(
        `[theme-profiler] toggle #${token} latency avg=${round(average(interactionLatencies))}ms max=${round(Math.max(...interactionLatencies))}ms renders=${interactionLatencies.length}`,
      );
    }

    if (renderDurations.length > 0) {
      console.log(
        `[theme-profiler] toggle #${token} actualDuration avg=${round(average(renderDurations))}ms max=${round(Math.max(...renderDurations))}ms`,
      );
    }

    activeToggleToken = null;
    toggleStartedAt = null;
    toggleSamples = [];
    summaryTimeout = null;
  }, 450);
}

export const onThemeProfilerRender: ProfilerOnRenderCallback = (
  _id,
  phase,
  actualDuration,
  _baseDuration,
  _startTime,
  commitTime,
) => {
  if (!__DEV__) return;
  if (phase !== 'update') return;
  if (toggleStartedAt == null || activeToggleToken == null) return;

  const commitLatency = Math.max(0, commitTime - toggleStartedAt);

  toggleSamples.push({
    actualDuration,
    commitLatency,
  });
};
