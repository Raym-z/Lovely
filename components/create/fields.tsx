"use client";

import { useState } from "react";
import type {
  InputHTMLAttributes,
  ReactNode,
  SelectHTMLAttributes,
  TextareaHTMLAttributes,
} from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown, Plus, Trash2 } from "lucide-react";
import { cn } from "@/lib/cn";
import { HeartShape } from "@/components/lovely/Doodles";

const inputClasses =
  "w-full rounded-xl border-2 border-ink/10 bg-white px-3.5 py-2.5 font-body text-sm text-ink outline-none transition-colors placeholder:text-ink-soft/35 focus:border-pink focus:bg-white aria-invalid:border-strawberry aria-invalid:bg-blush/30";

export function Field({
  label,
  hint,
  required,
  children,
  className,
}: {
  label: string;
  hint?: string;
  required?: boolean;
  children: ReactNode;
  className?: string;
}) {
  return (
    <label className={cn("block", className)}>
      <span className="mb-1.5 flex items-center gap-1 font-body text-[0.64rem] font-bold uppercase tracking-[0.14em] text-ink-soft/75">
        {label}
        {required ? <span className="text-strawberry">*</span> : null}
      </span>
      {children}
      {hint ? (
        <span className="mt-1 block font-hand text-base leading-tight text-ink-soft/60">
          {hint}
        </span>
      ) : null}
    </label>
  );
}

export function TextInput({
  className,
  ...props
}: InputHTMLAttributes<HTMLInputElement>) {
  return <input className={cn(inputClasses, className)} {...props} />;
}

export function TextArea({
  className,
  ...props
}: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className={cn(inputClasses, "resize-y leading-relaxed", className)}
      {...props}
    />
  );
}

export function Select({
  className,
  children,
  ...props
}: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      className={cn(inputClasses, "cursor-pointer appearance-none", className)}
      {...props}
    >
      {children}
    </select>
  );
}

export function EditorCard({
  title,
  description,
  children,
  className,
  accent = "pink",
}: {
  title: string;
  description?: string;
  children: ReactNode;
  className?: string;
  accent?: "pink" | "lavender" | "butter" | "mint";
}) {
  const dot = {
    pink: "bg-pink",
    lavender: "bg-lavender",
    butter: "bg-butter",
    mint: "bg-mint",
  }[accent];

  return (
    <section
      className={cn(
        "rounded-[1.8rem] border-2 border-white bg-white/80 p-5 shadow-card backdrop-blur-sm sm:p-7",
        className,
      )}
    >
      <div className="flex items-start gap-3">
        <span className={cn("mt-2 h-3 w-3 shrink-0 rounded-full", dot)} />
        <div>
          <h2 className="font-display text-[1.35rem] font-semibold leading-tight text-ink sm:text-2xl">
            {title}
          </h2>
          {description ? (
            <p className="mt-1 text-pretty font-body text-[0.82rem] leading-relaxed text-ink-soft">
              {description}
            </p>
          ) : null}
        </div>
      </div>
      <div className="mt-5 space-y-4">{children}</div>
    </section>
  );
}

export function CollapsibleCard({
  title,
  subtitle,
  defaultOpen = false,
  open: controlledOpen,
  onOpenChange,
  onRemove,
  removeDisabled,
  children,
  badge,
}: {
  title: string;
  subtitle?: string;
  defaultOpen?: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  onRemove?: () => void;
  removeDisabled?: boolean;
  children: ReactNode;
  badge?: string;
}) {
  const [uncontrolledOpen, setUncontrolledOpen] = useState(defaultOpen);
  const isControlled = controlledOpen !== undefined;
  const open = isControlled ? controlledOpen : uncontrolledOpen;

  function toggle() {
    const next = !open;
    if (!isControlled) setUncontrolledOpen(next);
    onOpenChange?.(next);
  }

  return (
    <div className="overflow-hidden rounded-2xl border-2 border-ink/5 bg-cream/55">
      <div className="flex items-center gap-2 p-3">
        <button
          type="button"
          onClick={toggle}
          aria-expanded={open}
          className="flex min-w-0 flex-1 items-center gap-2 rounded-xl px-1 py-1 text-left"
        >
          <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-white text-strawberry">
            <HeartShape className="h-3.5 w-3.5" />
          </span>
          <span className="min-w-0">
            <span className="block truncate font-display text-[0.98rem] font-semibold text-ink">
              {title}
            </span>
            {subtitle ? (
              <span className="block truncate font-hand text-base leading-tight text-ink-soft/65">
                {subtitle}
              </span>
            ) : null}
          </span>
          {badge ? (
            <span className="ml-auto hidden shrink-0 rounded-full bg-white px-2 py-0.5 font-body text-[0.52rem] font-bold uppercase tracking-[0.1em] text-ink-soft/60 sm:block">
              {badge}
            </span>
          ) : null}
          <ChevronDown
            className={cn(
              "ml-auto h-4 w-4 shrink-0 text-ink-soft/50 transition-transform sm:ml-1",
              open && "rotate-180",
            )}
          />
        </button>
        {onRemove ? (
          <RemoveButton onClick={onRemove} disabled={removeDisabled} />
        ) : null}
      </div>
      <AnimatePresence initial={false}>
        {open ? (
          <motion.div
            key="content"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            <div className="border-t border-ink/5 p-4">
              <div className="space-y-4">{children}</div>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}

export function RemoveButton({
  onClick,
  disabled,
  label = "Remove",
}: {
  onClick: () => void;
  disabled?: boolean;
  label?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      title={label}
      className="grid h-9 w-9 shrink-0 place-items-center rounded-full border-2 border-ink/5 bg-white text-ink-soft/50 transition-colors hover:border-pink hover:text-strawberry disabled:cursor-not-allowed disabled:opacity-30"
    >
      <Trash2 className="h-4 w-4" />
    </button>
  );
}

export function AddButton({
  children,
  onClick,
  disabled,
}: {
  children: ReactNode;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="inline-flex items-center gap-2 rounded-full border-2 border-dashed border-pink bg-white/50 px-4 py-2.5 font-body text-xs font-bold uppercase tracking-[0.12em] text-strawberry transition-colors hover:border-strawberry hover:bg-blush disabled:cursor-not-allowed disabled:opacity-40"
    >
      <Plus className="h-3.5 w-3.5" />
      {children}
    </button>
  );
}

export function StringListEditor({
  items,
  onChange,
  placeholder,
  addLabel,
  min = 1,
  max = 30,
  rows = 2,
}: {
  items: string[];
  onChange: (items: string[]) => void;
  placeholder: string;
  addLabel: string;
  min?: number;
  max?: number;
  rows?: number;
}) {
  function update(index: number, value: string) {
    const next = [...items];
    next[index] = value;
    onChange(next);
  }

  return (
    <div className="space-y-3">
      {items.map((item, index) => (
        <div key={index} className="flex items-start gap-2">
          <div className="min-w-0 flex-1">
            <TextArea
              rows={rows}
              value={item}
              placeholder={placeholder}
              aria-label={`${placeholder} ${index + 1}`}
              onChange={(event) => update(index, event.target.value)}
            />
          </div>
          <RemoveButton
            onClick={() => onChange(items.filter((_, i) => i !== index))}
            disabled={items.length <= min}
            label={`Remove item ${index + 1}`}
          />
        </div>
      ))}
      <div className="flex items-center justify-between gap-3">
        <AddButton
          onClick={() => onChange([...items, ""])}
          disabled={items.length >= max}
        >
          {addLabel}
        </AddButton>
        <span className="font-hand text-base text-ink-soft/55">
          {items.length} / {max}
        </span>
      </div>
    </div>
  );
}

export function SegmentedTabs<T extends string>({
  value,
  onChange,
  options,
}: {
  value: T;
  onChange: (value: T) => void;
  options: Array<{ value: T; label: string; count?: number }>;
}) {
  return (
    <div className="no-scrollbar flex gap-1.5 overflow-x-auto rounded-full border-2 border-white bg-white/60 p-1.5">
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          onClick={() => onChange(option.value)}
          className={cn(
            "shrink-0 rounded-full px-3.5 py-2 font-body text-[0.66rem] font-bold uppercase tracking-[0.1em] transition-colors",
            value === option.value
              ? "bg-strawberry text-white"
              : "text-ink-soft hover:bg-blush hover:text-strawberry",
          )}
        >
          {option.label}
          {typeof option.count === "number" ? (
            <span
              className={cn(
                "ml-1.5 rounded-full px-1.5 py-0.5 text-[0.55rem]",
                value === option.value
                  ? "bg-white/20"
                  : "bg-cream text-ink-soft/60",
              )}
            >
              {option.count}
            </span>
          ) : null}
        </button>
      ))}
    </div>
  );
}
