"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import type { CSSProperties } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { CalendarDays, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/cn";
import { useHydrated } from "@/lib/use-hydrated";
import {
  MEMORY_DATE_MONTHS,
  MEMORY_DATE_PLACEHOLDER,
  formatMemoryDate,
  normalizeMemoryDateInput,
  parseMemoryDate,
  sanitizeMemoryDateInput,
} from "@/lib/memory-date";
import { inputClasses } from "./fields";

const WEEKDAY_LABELS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

function getCalendarStyle(trigger: HTMLElement): CSSProperties {
  const rect = trigger.getBoundingClientRect();
  const gutter = 8;
  const width = Math.min(286, window.innerWidth - gutter * 2);
  const maxLeft = Math.max(gutter, window.innerWidth - width - gutter);
  const left = Math.min(Math.max(gutter, rect.left), maxLeft);
  const spaceBelow = window.innerHeight - rect.bottom - gutter * 2;
  const spaceAbove = rect.top - gutter * 2;
  const openUp = spaceBelow < 330 && spaceAbove > spaceBelow;

  return openUp
    ? { left, width, bottom: window.innerHeight - rect.top + gutter }
    : { left, width, top: rect.bottom + gutter };
}

function getCalendarCells(viewDate: Date) {
  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const firstWeekday = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells: Array<number | null> = [];

  for (let index = 0; index < firstWeekday; index += 1) cells.push(null);
  for (let day = 1; day <= daysInMonth; day += 1) cells.push(day);
  while (cells.length % 7 !== 0) cells.push(null);

  return cells;
}

function isSameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

export function DateField({
  value,
  onChange,
  className,
  placeholder = MEMORY_DATE_PLACEHOLDER,
}: {
  value: string;
  onChange: (value: string) => void;
  className?: string;
  placeholder?: string;
}) {
  const [open, setOpen] = useState(false);
  const [view, setView] = useState<"days" | "months" | "years">("days");
  const [viewDate, setViewDate] = useState(() => new Date());
  const [calendarStyle, setCalendarStyle] = useState<CSSProperties>({});
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const hydrated = useHydrated();
  const calendarId = useId();

  const selectedDate = useMemo(() => parseMemoryDate(value), [value]);
  const today = new Date();
  const cells = useMemo(() => getCalendarCells(viewDate), [viewDate]);
  const yearStart = Math.floor(viewDate.getFullYear() / 12) * 12;
  const yearCells = Array.from({ length: 12 }, (_, index) => yearStart + index);

  useEffect(() => {
    if (!open) return;

    function handlePointerDown(event: PointerEvent) {
      const target = event.target as Node;
      if (wrapperRef.current?.contains(target)) return;
      if (menuRef.current?.contains(target)) return;
      setOpen(false);
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key !== "Escape") return;
      if (view === "years") {
        setView("months");
        return;
      }
      if (view === "months") {
        setView("days");
        return;
      }
      setOpen(false);
    }

    function handleViewportChange() {
      const trigger = triggerRef.current;
      if (trigger) setCalendarStyle(getCalendarStyle(trigger));
    }

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    window.addEventListener("resize", handleViewportChange);
    window.addEventListener("scroll", handleViewportChange, true);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("resize", handleViewportChange);
      window.removeEventListener("scroll", handleViewportChange, true);
    };
  }, [open, view]);

  function openCalendar() {
    setView("days");
    setViewDate(selectedDate ?? new Date());
    const trigger = triggerRef.current;
    if (trigger) setCalendarStyle(getCalendarStyle(trigger));
    setOpen(true);
  }

  function toggleCalendar() {
    if (open) {
      setOpen(false);
    } else {
      openCalendar();
    }
  }

  function shiftRange(delta: number) {
    setViewDate((current) => {
      if (view === "years") {
        return new Date(current.getFullYear() + delta * 12, current.getMonth(), 1);
      }
      if (view === "months") {
        return new Date(current.getFullYear() + delta, current.getMonth(), 1);
      }
      return new Date(current.getFullYear(), current.getMonth() + delta, 1);
    });
  }

  function selectMonth(month: number) {
    setViewDate((current) => new Date(current.getFullYear(), month, 1));
    setView("days");
  }

  function selectYear(year: number) {
    setViewDate((current) => new Date(year, current.getMonth(), 1));
    setView("months");
  }

  function selectDay(day: number) {
    const next = new Date(viewDate.getFullYear(), viewDate.getMonth(), day);
    onChange(formatMemoryDate(next));
    setOpen(false);
    triggerRef.current?.focus({ preventScroll: true });
  }

  function selectToday() {
    const now = new Date();
    onChange(formatMemoryDate(now));
    setViewDate(now);
    setOpen(false);
    triggerRef.current?.focus({ preventScroll: true });
  }

  function commitValue() {
    if (!value.trim()) return;
    const normalized = normalizeMemoryDateInput(value);
    if (normalized !== value) onChange(normalized);
  }

  const headerLinkClass =
    "rounded-md px-0.5 font-display text-sm font-semibold text-ink underline decoration-pink decoration-dotted decoration-2 underline-offset-4 transition-colors hover:text-strawberry hover:decoration-strawberry focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pink/40";

  return (
    <div ref={wrapperRef} className={cn("relative", className)}>
      <input
        value={value}
        onChange={(event) =>
          onChange(sanitizeMemoryDateInput(event.target.value))
        }
        onBlur={commitValue}
        onKeyDown={(event) => {
          if (event.key === "Enter") {
            event.preventDefault();
            event.currentTarget.blur();
          }
        }}
        placeholder={placeholder}
        maxLength={80}
        autoComplete="off"
        spellCheck={false}
        aria-describedby={open ? calendarId : undefined}
        className={cn(inputClasses, "pr-11")}
      />
      <button
        ref={triggerRef}
        type="button"
        onClick={toggleCalendar}
        aria-label="Choose a date from the calendar"
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-controls={open ? calendarId : undefined}
        className={cn(
          "absolute right-1.5 top-1/2 grid h-8 w-8 -translate-y-1/2 place-items-center rounded-full text-ink-soft/60 transition-colors hover:bg-blush hover:text-strawberry focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pink/40",
          open && "bg-blush text-strawberry",
        )}
      >
        <CalendarDays className="h-4 w-4" />
      </button>

      {hydrated
        ? createPortal(
            <AnimatePresence>
              {open ? (
                <motion.div
                  key="memory-date-calendar"
                  ref={menuRef}
                  id={calendarId}
                  role="dialog"
                  aria-label="Choose a date"
                  initial={{ opacity: 0, y: -6, scale: 0.985 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -5, scale: 0.985 }}
                  transition={{ duration: 0.16, ease: [0.22, 1, 0.36, 1] }}
                  style={calendarStyle}
                  className="fixed z-[80] rounded-[1.15rem] border-2 border-white bg-[#fffaf8]/98 p-3 shadow-[0_24px_60px_-24px_rgba(73,52,59,0.45)] backdrop-blur-md"
                >
                  <div className="flex items-center justify-between gap-2">
                    <button
                      type="button"
                      onClick={() => shiftRange(-1)}
                      aria-label={
                        view === "years"
                          ? "Previous years"
                          : view === "months"
                            ? "Previous year"
                            : "Previous month"
                      }
                      className="grid h-7 w-7 place-items-center rounded-full text-ink-soft/60 transition-colors hover:bg-blush hover:text-strawberry"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </button>
                    {view === "days" ? (
                      <p className="flex items-center gap-1 font-display text-sm font-semibold text-ink">
                        <button
                          type="button"
                          onClick={() => setView("months")}
                          aria-label="Change month"
                          className={headerLinkClass}
                        >
                          {MEMORY_DATE_MONTHS[viewDate.getMonth()]}
                        </button>
                        <button
                          type="button"
                          onClick={() => setView("years")}
                          aria-label="Change year"
                          className={headerLinkClass}
                        >
                          {viewDate.getFullYear()}
                        </button>
                      </p>
                    ) : view === "months" ? (
                      <button
                        type="button"
                        onClick={() => setView("years")}
                        aria-label="Change year"
                        className={headerLinkClass}
                      >
                        {viewDate.getFullYear()}
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setView("months")}
                        aria-label="Back to months"
                        className={headerLinkClass}
                      >
                        {yearStart} – {yearStart + 11}
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => shiftRange(1)}
                      aria-label={
                        view === "years"
                          ? "Next years"
                          : view === "months"
                            ? "Next year"
                            : "Next month"
                      }
                      className="grid h-7 w-7 place-items-center rounded-full text-ink-soft/60 transition-colors hover:bg-blush hover:text-strawberry"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </div>

                  {view === "days" ? (
                    <>
                      <div className="mt-2 grid grid-cols-7 gap-y-1 text-center">
                        {WEEKDAY_LABELS.map((label, index) => (
                          <span
                            key={`${label}-${index}`}
                            className="font-body text-[0.52rem] font-bold uppercase tracking-[0.08em] text-ink-soft/45"
                          >
                            {label}
                          </span>
                        ))}
                      </div>

                      <div className="mt-1 grid grid-cols-7 gap-y-1 text-center">
                        {cells.map((day, index) => {
                          if (day === null) {
                            return <span key={`empty-${index}`} />;
                          }

                          const date = new Date(
                            viewDate.getFullYear(),
                            viewDate.getMonth(),
                            day,
                          );
                          const isSelected = selectedDate
                            ? isSameDay(date, selectedDate)
                            : false;
                          const isToday = isSameDay(date, today);

                          return (
                            <span key={day} className="grid place-items-center">
                              <button
                                type="button"
                                onClick={() => selectDay(day)}
                                aria-label={formatMemoryDate(date)}
                                aria-pressed={isSelected}
                                className={cn(
                                  "grid h-8 w-8 place-items-center rounded-full font-body text-[0.72rem] font-semibold transition-colors",
                                  isSelected
                                    ? "bg-strawberry text-white shadow-[0_4px_10px_-4px_rgba(241,91,114,0.8)]"
                                    : "text-ink hover:bg-blush hover:text-strawberry",
                                  !isSelected &&
                                    isToday &&
                                    "border-2 border-pink text-strawberry",
                                )}
                              >
                                {day}
                              </button>
                            </span>
                          );
                        })}
                      </div>
                    </>
                  ) : view === "months" ? (
                    <div className="mt-2 grid grid-cols-3 gap-1.5">
                      {MEMORY_DATE_MONTHS.map((month, index) => {
                        const isSelectedMonth = index === viewDate.getMonth();

                        return (
                          <button
                            key={month}
                            type="button"
                            onClick={() => selectMonth(index)}
                            aria-pressed={isSelectedMonth}
                            className={cn(
                              "grid h-9 place-items-center rounded-xl font-body text-[0.72rem] font-semibold transition-colors",
                              isSelectedMonth
                                ? "bg-strawberry text-white shadow-[0_4px_10px_-4px_rgba(241,91,114,0.8)]"
                                : "text-ink hover:bg-blush hover:text-strawberry",
                            )}
                          >
                            {month.slice(0, 3)}
                          </button>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="mt-2 grid grid-cols-3 gap-1.5">
                      {yearCells.map((year) => {
                        const isSelectedYear = year === viewDate.getFullYear();

                        return (
                          <button
                            key={year}
                            type="button"
                            onClick={() => selectYear(year)}
                            aria-pressed={isSelectedYear}
                            className={cn(
                              "grid h-9 place-items-center rounded-xl font-body text-[0.78rem] font-semibold transition-colors",
                              isSelectedYear
                                ? "bg-strawberry text-white shadow-[0_4px_10px_-4px_rgba(241,91,114,0.8)]"
                                : "text-ink hover:bg-blush hover:text-strawberry",
                            )}
                          >
                            {year}
                          </button>
                        );
                      })}
                    </div>
                  )}

                  <div className="mt-2 flex items-center justify-between gap-2 border-t border-ink/5 pt-2">
                    <p className="font-hand text-[0.95rem] leading-none text-ink-soft/55">
                      {view === "years"
                        ? "jump to a year"
                        : view === "months"
                          ? "pick a month"
                          : "pick a day to remember"}
                    </p>
                    <button
                      type="button"
                      onClick={selectToday}
                      className="rounded-full border-2 border-pink/40 bg-blush/60 px-2.5 py-1 font-body text-[0.52rem] font-bold uppercase tracking-[0.12em] text-strawberry transition-colors hover:border-pink hover:bg-blush"
                    >
                      Today
                    </button>
                  </div>
                </motion.div>
              ) : null}
            </AnimatePresence>,
            document.body,
          )
        : null}
    </div>
  );
}
