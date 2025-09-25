import React, { useMemo, useState } from 'react';
import { BarChart2, CheckCircle2, Clock, Plus, Trash2, TrendingUp } from 'lucide-react';
import clsx from 'clsx';

const DEFAULT_STEPS = [
  { id: 1, name: 'Gateway routing', latencyMs: 40, calls: 1, concurrency: 1 },
  { id: 2, name: 'Auth service', latencyMs: 120, calls: 1, concurrency: 1 },
  { id: 3, name: 'Fan-out to downstream service', latencyMs: 180, calls: 3, concurrency: 3 }
];

let idCounter = DEFAULT_STEPS.length + 1;

function computeEffectiveLatency(step, jitterMultiplier) {
  const batches = Math.ceil(step.calls / Math.max(step.concurrency, 1));
  const base = step.latencyMs * batches;
  const p95 = base * (1 + jitterMultiplier);
  return { p50: base, p95 };
}

function ApiLatencyBudgetCalculator() {
  const [targetBudget, setTargetBudget] = useState(500);
  const [jitter, setJitter] = useState(0.25);
  const [steps, setSteps] = useState(DEFAULT_STEPS);

  const totals = useMemo(() => {
    return steps.reduce(
      (acc, step) => {
        const { p50, p95 } = computeEffectiveLatency(step, jitter);
        acc.p50 += p50;
        acc.p95 += p95;
        acc.details.push({ ...step, p50, p95 });
        return acc;
      },
      { p50: 0, p95: 0, details: [] }
    );
  }, [steps, jitter]);

  const slack = targetBudget - totals.p95;
  const slackPercent = targetBudget > 0 ? (slack / targetBudget) * 100 : 0;

  const addStep = () => {
    setSteps((current) => [
      ...current,
      { id: idCounter += 1, name: 'New dependency', latencyMs: 100, calls: 1, concurrency: 1 }
    ]);
  };

  const updateStep = (id, field, value) => {
    setSteps((current) =>
      current.map((step) =>
        step.id === id
          ? {
              ...step,
              [field]: field === 'name' ? value : Math.max(Number(value) || 0, 0)
            }
          : step
      )
    );
  };

  const removeStep = (id) => {
    setSteps((current) => current.filter((step) => step.id !== id));
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-5">
        <section className="lg:col-span-2 rounded-xl border border-gray-200 p-4 space-y-4">
          <div>
            <label className="text-sm font-semibold text-gray-900 flex items-center space-x-2">
              <Clock className="h-4 w-4" />
              <span>Latency budget (ms)</span>
            </label>
            <input
              type="number"
              value={targetBudget}
              onChange={(event) => setTargetBudget(Number(event.target.value) || 0)}
              className="mt-2 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-gray-400 focus:outline-none"
              min={0}
            />
          </div>

          <div>
            <label className="text-sm font-semibold text-gray-900">Jitter multiplier</label>
            <p className="text-xs text-gray-500 mt-1">
              Accounts for p95 tail latency (0.25 = +25%). Apply higher values if services are noisy.
            </p>
            <input
              type="range"
              min={0}
              max={1}
              step={0.05}
              value={jitter}
              onChange={(event) => setJitter(Number(event.target.value))}
              className="mt-3 w-full"
            />
            <div className="text-xs text-gray-500 text-right">{Math.round(jitter * 100)}% overhead</div>
          </div>

          <button
            type="button"
            onClick={addStep}
            className="inline-flex items-center space-x-2 rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-600 hover:border-gray-400"
          >
            <Plus className="h-4 w-4" />
            <span>Add dependency</span>
          </button>
        </section>

        <section className="lg:col-span-3 space-y-4">
          <div className="rounded-xl border border-gray-200">
            <div className="border-b border-gray-200 bg-gray-50/80 px-4 py-3 flex items-center justify-between">
              <h2 className="text-sm font-semibold text-gray-900 flex items-center space-x-2">
                <BarChart2 className="h-4 w-4" />
                <span>Latency breakdown</span>
              </h2>
              <div className="text-xs text-gray-500">
                p95 total {Math.round(totals.p95)} ms ({slack >= 0 ? 'within budget' : 'over budget'})
              </div>
            </div>

            <div className="divide-y divide-gray-100">
              {steps.map((step) => (
                <div key={step.id} className="grid grid-cols-1 gap-4 px-4 py-4 md:grid-cols-6 md:items-center">
                  <input
                    value={step.name}
                    onChange={(event) => updateStep(step.id, 'name', event.target.value)}
                    className="md:col-span-2 rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-gray-400 focus:outline-none"
                  />
                  <div className="md:col-span-1">
                    <label className="text-xs uppercase text-gray-500">Latency (ms)</label>
                    <input
                      type="number"
                      value={step.latencyMs}
                      onChange={(event) => updateStep(step.id, 'latencyMs', event.target.value)}
                      className="mt-1 w-full rounded-lg border border-gray-200 px-2 py-1.5 text-sm focus:border-gray-400 focus:outline-none"
                      min={0}
                    />
                  </div>
                  <div className="md:col-span-1">
                    <label className="text-xs uppercase text-gray-500">Calls</label>
                    <input
                      type="number"
                      value={step.calls}
                      onChange={(event) => updateStep(step.id, 'calls', event.target.value)}
                      className="mt-1 w-full rounded-lg border border-gray-200 px-2 py-1.5 text-sm focus:border-gray-400 focus:outline-none"
                      min={1}
                    />
                  </div>
                  <div className="md:col-span-1">
                    <label className="text-xs uppercase text-gray-500">Concurrency</label>
                    <input
                      type="number"
                      value={step.concurrency}
                      onChange={(event) => updateStep(step.id, 'concurrency', event.target.value)}
                      className="mt-1 w-full rounded-lg border border-gray-200 px-2 py-1.5 text-sm focus:border-gray-400 focus:outline-none"
                      min={1}
                    />
                  </div>
                  <div className="flex items-center justify-between md:justify-end md:space-x-4">
                    <div className="text-xs text-gray-500">
                      p50: {Math.round(computeEffectiveLatency(step, 0).p50)} ms · p95:{' '}
                      {Math.round(computeEffectiveLatency(step, jitter).p95)} ms
                    </div>
                    <button
                      type="button"
                      onClick={() => removeStep(step.id)}
                      className="text-gray-400 hover:text-rose-500"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className={clsx('rounded-xl border p-4', slack >= 0 ? 'border-emerald-200 bg-emerald-50/60' : 'border-rose-200 bg-rose-50')}
            >
              <h3 className="text-sm font-semibold text-gray-900 flex items-center space-x-2">
                <CheckCircle2 className="h-4 w-4" />
                <span>Budget status</span>
              </h3>
              <p className="mt-3 text-sm text-gray-700">
                Target: {targetBudget} ms · p95 actual: {Math.round(totals.p95)} ms
              </p>
              <p className="text-sm font-semibold text-gray-900">
                {slack >= 0
                  ? `Slack: ${Math.round(slack)} ms (${slackPercent.toFixed(1)}% headroom)`
                  : `Over budget by ${Math.abs(Math.round(slack))} ms (${Math.abs(slackPercent).toFixed(1)}%)`}
              </p>
            </div>

            <div className="rounded-xl border border-gray-200 p-4">
              <h3 className="text-sm font-semibold text-gray-900 flex items-center space-x-2">
                <TrendingUp className="h-4 w-4" />
                <span>Optimisation cues</span>
              </h3>
              <ul className="mt-3 space-y-2 text-sm text-gray-600">
                {totals.details
                  .sort((a, b) => b.p95 - a.p95)
                  .slice(0, 3)
                  .map((detail) => (
                    <li key={detail.id}>
                      • {detail.name} contributes {Math.round(detail.p95)} ms to p95.{' '}
                      {detail.concurrency > 1
                        ? 'Consider increasing concurrency or caching responses.'
                        : 'Consider memoisation, caching, or moving this off the critical path.'}
                    </li>
                  ))}
                <li>
                  • Adjust jitter to model worst-case spikes and ensure the budget still holds.
                </li>
              </ul>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

export default ApiLatencyBudgetCalculator;
