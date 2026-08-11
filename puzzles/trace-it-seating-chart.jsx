import React, { useState, useEffect, useMemo } from "react";
import { Lock, CheckCircle2, XCircle, RefreshCw } from "lucide-react";

function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generatePuzzle() {
  const rowsCount = randInt(2, 4);
  const seatsPerRow = randInt(2, 3);
  const rows = [];
  for (let row = 0; row < rowsCount; row++) {
    for (let seat = 0; seat < seatsPerRow; seat++) {
      rows.push({ row, seat, output: `${row} ${seat}` });
    }
  }
  return { rowsCount, seatsPerRow, rows };
}

function emptyEntries(rows) {
  return rows.map(() => ({ row: "", seat: "", output: "" }));
}

const CONFIDENCE_OPTIONS = [
  { value: "low", label: "Not very" },
  { value: "medium", label: "Pretty sure" },
  { value: "high", label: "Very sure" },
];

export default function TraceItSeatingChart() {
  const [puzzle, setPuzzle] = useState(() => generatePuzzle());
  const [entries, setEntries] = useState(() => emptyEntries(puzzle.rows));
  const [unlocked, setUnlocked] = useState(1);
  const [confidence, setConfidence] = useState(null);
  const [checked, setChecked] = useState(false);
  const [results, setResults] = useState(null);

  const totalRows = puzzle.rows.length;

  useEffect(() => {
    if (checked) return;
    const activeIdx = unlocked - 1;
    if (activeIdx >= totalRows - 1) return;
    const row = entries[activeIdx];
    if (row.row.trim() !== "" && row.seat.trim() !== "" && row.output.trim() !== "") {
      setUnlocked((u) => Math.min(u + 1, totalRows));
    }
  }, [entries, unlocked, checked, totalRows]);

  const allFilled = useMemo(
    () => entries.every((e) => e.row.trim() !== "" && e.seat.trim() !== "" && e.output.trim() !== ""),
    [entries]
  );
  const readyForConfidence = unlocked === totalRows && allFilled && !checked;

  function updateEntry(idx, field, value) {
    const locked = checked && results && results[idx] && results[idx].correct;
    if (locked) return;
    setEntries((prev) => {
      const next = [...prev];
      next[idx] = { ...next[idx], [field]: value };
      return next;
    });
  }

  function evaluateRow(idx) {
    const r = puzzle.rows[idx];
    const e = entries[idx];
    return (
      e.row.trim() === String(r.row) &&
      e.seat.trim() === String(r.seat) &&
      e.output.trim() === r.output
    );
  }

  function handleCheck() {
    const rowResults = puzzle.rows.map((r, idx) => ({
      correct: evaluateRow(idx),
      expected: r,
    }));
    setResults(rowResults);
    setChecked(true);
  }

  function handleRecheck() {
    setResults((prev) =>
      prev.map((r, idx) => (r.correct ? r : { correct: evaluateRow(idx), expected: r.expected }))
    );
  }

  function handleNewChart() {
    const p = generatePuzzle();
    setPuzzle(p);
    setEntries(emptyEntries(p.rows));
    setUnlocked(1);
    setConfidence(null);
    setChecked(false);
    setResults(null);
  }

  const correctCount = results ? results.filter((r) => r.correct).length : 0;
  const allNowCorrect = results ? results.every((r) => r.correct) : false;

  return (
    <div className="min-h-full w-full bg-slate-900 text-slate-100 flex items-start justify-center p-4 sm:p-8">
      <div className="w-full max-w-2xl bg-slate-800 border border-slate-700 rounded-xl shadow-xl overflow-hidden">
        {/* Header */}
        <div className="px-5 sm:px-7 pt-6 pb-5 border-b border-slate-700">
          <p className="font-mono text-xs tracking-wide text-amber-400 uppercase mb-2">
            Trace it &middot; nested loops
          </p>
          <h1 className="text-xl sm:text-2xl font-semibold">Trace the Seating Chart</h1>
          <p className="text-sm text-slate-300 mt-2 leading-relaxed">
            A classroom has some rows of desks, with the same number of seats in
            each row. Trace the code below, one line at a time, to determine
            exactly what it prints for every desk.
          </p>
        </div>

        {/* Code panel */}
        <div className="px-5 sm:px-7 pt-5">
          <div className="bg-slate-950 border border-slate-700 rounded-lg px-4 py-3 font-mono text-sm leading-relaxed overflow-x-auto">
            <div className="text-sky-300">for <span className="text-slate-100">row</span> in <span className="text-amber-300">range(ROWS)</span>:</div>
            <div className="text-sky-300 pl-4">for <span className="text-slate-100">seat</span> in <span className="text-amber-300">range(SEATS_PER_ROW)</span>:</div>
            <div className="pl-8"><span className="text-emerald-300">print</span><span className="text-slate-100">(row, seat)</span></div>
          </div>
          <p className="text-xs text-slate-300 mt-2 font-mono">
            This chart:
            <br />
            <span className="pl-4">ROWS = {puzzle.rowsCount}</span>
            <br />
            <span className="pl-4">SEATS_PER_ROW = {puzzle.seatsPerRow}</span>
          </p>
        </div>

        {/* Trace table — each field carries its own label, right next to
            the box it belongs to, rather than relying on a column header
            the student has to scroll back up to check. Boxes are sized to
            what the answer actually looks like (1 digit / 1 digit / a
            couple of characters), not open-ended text fields. */}
        <div className="px-5 sm:px-7 pt-5">
          <div className="flex flex-col gap-1.5">
            {puzzle.rows.map((row, idx) => {
              const isUnlocked = idx < unlocked;
              const isNextLocked = idx === unlocked; // only ever show one "coming up" row
              const entry = entries[idx];
              const result = results ? results[idx] : null;
              const isLockedCorrect = checked && result && result.correct;

              if (!isUnlocked && !isNextLocked) {
                // Rows further out than the very next one aren't rendered at
                // all — showing a placeholder per remaining row would let a
                // student count them and back into the total (rows × seats)
                // before ever tracing the loop.
                return null;
              }

              if (!isUnlocked) {
                return (
                  <div
                    key={idx}
                    className="flex items-center gap-2 px-3 py-2.5 rounded-lg bg-slate-900/60 border border-dashed border-slate-600 text-slate-300 text-sm"
                  >
                    <Lock size={14} />
                    <span>Finish the row above first</span>
                  </div>
                );
              }

              const rowStateClasses = checked
                ? result.correct
                  ? "bg-emerald-950/40 border-emerald-800"
                  : "bg-rose-950/40 border-rose-800"
                : "bg-slate-900 border-slate-700";

              return (
                <div key={idx} className="flex flex-col gap-1">
                  <div
                    className={`flex items-center gap-3 flex-wrap px-3 py-2 rounded-lg border ${rowStateClasses}`}
                  >
                    <label className="flex items-center gap-1.5">
                      <span className="text-[11px] font-mono text-slate-300">row</span>
                      <input
                        type="text"
                        inputMode="numeric"
                        value={entry.row}
                        disabled={isLockedCorrect}
                        onChange={(e) => updateEntry(idx, "row", e.target.value)}
                        placeholder="?"
                        className="w-10 bg-slate-800 border border-slate-600 rounded px-1.5 py-1 text-sm font-mono text-center text-slate-100 placeholder:text-slate-500 disabled:opacity-70 focus:outline-none focus:ring-1 focus:ring-amber-400"
                      />
                    </label>
                    <label className="flex items-center gap-1.5">
                      <span className="text-[11px] font-mono text-slate-300">seat</span>
                      <input
                        type="text"
                        inputMode="numeric"
                        value={entry.seat}
                        disabled={isLockedCorrect}
                        onChange={(e) => updateEntry(idx, "seat", e.target.value)}
                        placeholder="?"
                        className="w-10 bg-slate-800 border border-slate-600 rounded px-1.5 py-1 text-sm font-mono text-center text-slate-100 placeholder:text-slate-500 disabled:opacity-70 focus:outline-none focus:ring-1 focus:ring-amber-400"
                      />
                    </label>
                    <label className="flex items-center gap-1.5">
                      <span className="text-[11px] font-mono text-slate-300">print(row, seat) &rarr;</span>
                      <input
                        type="text"
                        value={entry.output}
                        disabled={isLockedCorrect}
                        onChange={(e) => updateEntry(idx, "output", e.target.value)}
                        placeholder="e.g. 0 0"
                        className="w-20 bg-slate-800 border border-slate-600 rounded px-1.5 py-1 text-sm font-mono text-center text-slate-100 placeholder:text-slate-500 disabled:opacity-70 focus:outline-none focus:ring-1 focus:ring-amber-400"
                      />
                    </label>
                    <div className="ml-auto">
                      {checked &&
                        (result.correct ? (
                          <CheckCircle2 size={18} className="text-emerald-400" />
                        ) : (
                          <XCircle size={18} className="text-rose-400" />
                        ))}
                    </div>
                  </div>
                  {checked && !result.correct && (
                    <p className="text-xs text-rose-300 font-mono pl-2">
                      should be: row {result.expected.row}, seat {result.expected.seat} &rarr; "{result.expected.output}"
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Confidence gate (first submission only) */}
        {readyForConfidence && (
          <div className="px-5 sm:px-7 pt-5">
            <p className="text-sm text-slate-300 mb-2">How sure are you this chart is right?</p>
            <div className="flex gap-2">
              {CONFIDENCE_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setConfidence(opt.value)}
                  className={`px-3 py-1.5 rounded-full text-sm border transition-colors ${
                    confidence === opt.value
                      ? "bg-amber-400 border-amber-400 text-slate-900 font-medium"
                      : "bg-slate-900 border-slate-600 text-slate-300 hover:border-slate-400"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {readyForConfidence && (
          <div className="px-5 sm:px-7 pt-4">
            <button
              onClick={handleCheck}
              disabled={!confidence}
              className="w-full sm:w-auto px-4 py-2 rounded-lg bg-amber-400 text-slate-900 font-medium text-sm disabled:opacity-40 disabled:cursor-not-allowed hover:bg-amber-300 transition-colors"
            >
              Check the Chart
            </button>
          </div>
        )}

        {/* Post-check summary + next actions */}
        {checked && (
          <div className="px-5 sm:px-7 pt-5">
            {allNowCorrect ? (
              <p className="text-sm text-slate-300">All desks traced correctly.</p>
            ) : (
              <p className="text-sm text-slate-300">
                {correctCount} of {totalRows} correct so far. Fix the highlighted rows above, then recheck.
              </p>
            )}

            {!allNowCorrect && (
              <button
                onClick={handleRecheck}
                className="mt-4 flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-700 hover:bg-slate-600 text-sm font-medium transition-colors"
              >
                Recheck
              </button>
            )}

            <button
              onClick={handleNewChart}
              className="mt-4 ml-2 flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-700 hover:bg-slate-600 text-sm font-medium transition-colors"
            >
              <RefreshCw size={14} />
              New Seating Chart
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
