"use client";

import {
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import type {
  CSSProperties,
  InputHTMLAttributes,
  KeyboardEvent as ReactKeyboardEvent,
  ReactNode,
  SelectHTMLAttributes,
  TextareaHTMLAttributes,
} from "react";
import { createPortal } from "react-dom";
import {
  AnimatePresence,
  motion,
  Reorder,
  useDragControls,
} from "framer-motion";
import {
  Check,
  ChevronDown,
  GripVertical,
  Plus,
  Trash2,
} from "lucide-react";
import { cn } from "@/lib/cn";
import { makeId } from "@/lib/ids";
import { useHydrated } from "@/lib/use-hydrated";
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

export type OptionPickerOption<T extends string> = {
  value: T;
  label: string;
  description?: string;
  preview?: ReactNode;
  swatch?: string;
};

function getPickerMenuStyle(trigger: HTMLElement): CSSProperties {
  const rect = trigger.getBoundingClientRect();
  const gutter = 8;
  const width = Math.min(
    Math.max(rect.width, 252),
    Math.max(0, window.innerWidth - gutter * 2),
  );
  const left = Math.min(
    Math.max(gutter, rect.left),
    Math.max(gutter, window.innerWidth - width - gutter),
  );
  const spaceBelow = window.innerHeight - rect.bottom - gutter * 2;
  const spaceAbove = rect.top - gutter * 2;
  const openUp = spaceBelow < 220 && spaceAbove > spaceBelow;
  const maxHeight = Math.max(
    160,
    Math.min(320, openUp ? spaceAbove : spaceBelow),
  );

  return openUp
    ? {
        left,
        width,
        maxHeight,
        bottom: window.innerHeight - rect.top + gutter,
      }
    : { left, width, maxHeight, top: rect.bottom + gutter };
}

function PickerOptionVisual<T extends string>({
  option,
}: {
  option: OptionPickerOption<T>;
}) {
  if (option.preview) return <>{option.preview}</>;

  if (option.swatch) {
    return (
      <span
        className={cn(
          "h-6 w-6 shrink-0 rounded-full border-2 border-white shadow-sm",
          option.swatch,
        )}
      />
    );
  }

  return null;
}

export function OptionPicker<T extends string>({
  value,
  onChange,
  options,
  label = "Choose an option",
  className,
}: {
  value: T;
  onChange: (value: T) => void;
  options: Array<OptionPickerOption<T>>;
  label?: string;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [menuStyle, setMenuStyle] = useState<CSSProperties>({});
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const hydrated = useHydrated();
  const menuId = useId();
  const selectedIndex = options.findIndex((option) => option.value === value);
  const selected = selectedIndex >= 0 ? options[selectedIndex] : options[0];

  useEffect(() => {
    if (!open) return;

    function handlePointerDown(event: PointerEvent) {
      const target = event.target as Node;
      if (triggerRef.current?.contains(target)) return;
      if (menuRef.current?.contains(target)) return;
      setOpen(false);
    }

    function handleViewportChange() {
      const trigger = triggerRef.current;
      if (trigger) setMenuStyle(getPickerMenuStyle(trigger));
    }

    document.addEventListener("pointerdown", handlePointerDown);
    window.addEventListener("resize", handleViewportChange);
    window.addEventListener("scroll", handleViewportChange, true);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      window.removeEventListener("resize", handleViewportChange);
      window.removeEventListener("scroll", handleViewportChange, true);
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    document
      .getElementById(`${menuId}-option-${activeIndex}`)
      ?.scrollIntoView({ block: "nearest" });
  }, [activeIndex, menuId, open]);

  function openMenu() {
    const trigger = triggerRef.current;
    if (trigger) setMenuStyle(getPickerMenuStyle(trigger));
    setActiveIndex(selectedIndex >= 0 ? selectedIndex : 0);
    setOpen(true);
  }

  function toggleMenu() {
    if (open) {
      setOpen(false);
    } else {
      openMenu();
    }
  }

  function selectOption(option: OptionPickerOption<T>) {
    onChange(option.value);
    setOpen(false);
    triggerRef.current?.focus({ preventScroll: true });
  }

  function handleKeyDown(event: ReactKeyboardEvent<HTMLButtonElement>) {
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      if (!open) {
        openMenu();
        return;
      }
      const direction = event.key === "ArrowDown" ? 1 : -1;
      setActiveIndex(
        (current) =>
          (current + direction + options.length) % options.length,
      );
      return;
    }

    if (open && event.key === "Home") {
      event.preventDefault();
      setActiveIndex(0);
      return;
    }

    if (open && event.key === "End") {
      event.preventDefault();
      setActiveIndex(options.length - 1);
      return;
    }

    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      if (open) {
        const option = options[activeIndex];
        if (option) selectOption(option);
      } else {
        openMenu();
      }
      return;
    }

    if (open && event.key === "Escape") {
      event.preventDefault();
      setOpen(false);
      return;
    }

    if (open && event.key === "Tab") {
      setOpen(false);
    }
  }

  return (
    <div className={cn("relative", className)}>
      <button
        ref={triggerRef}
        type="button"
        role="combobox"
        onClick={toggleMenu}
        onKeyDown={handleKeyDown}
        aria-label={label}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={open ? menuId : undefined}
        aria-activedescendant={
          open ? `${menuId}-option-${activeIndex}` : undefined
        }
        className={cn(
          "flex w-full items-center gap-2.5 rounded-xl border-2 border-ink/10 bg-white px-2.5 py-2 text-left outline-none transition-all hover:border-pink/60 hover:bg-[#fffaf8] focus-visible:border-pink focus-visible:ring-2 focus-visible:ring-pink/20",
          open && "border-pink bg-[#fffaf8] shadow-[0_8px_24px_-18px_rgba(241,91,114,0.75)]",
        )}
      >
        {selected ? <PickerOptionVisual option={selected} /> : null}
        <span className="min-w-0 flex-1">
          <span className="block truncate font-body text-sm font-semibold text-ink">
            {selected?.label ?? "Choose an option"}
          </span>
          {selected?.description ? (
            <span className="block truncate font-hand text-[0.95rem] leading-tight text-ink-soft/65">
              {selected.description}
            </span>
          ) : null}
        </span>
        <ChevronDown
          className={cn(
            "h-4 w-4 shrink-0 text-ink-soft/50 transition-transform",
            open && "rotate-180 text-strawberry",
          )}
        />
      </button>

      {hydrated
        ? createPortal(
            <AnimatePresence>
              {open ? (
                <motion.div
                  key="option-picker-menu"
                  ref={menuRef}
                  role="listbox"
                  id={menuId}
                  aria-label={label}
                  initial={{ opacity: 0, y: -6, scale: 0.985 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -5, scale: 0.985 }}
                  transition={{ duration: 0.16, ease: [0.22, 1, 0.36, 1] }}
                  style={menuStyle}
                  className="fixed z-[80] flex flex-col overflow-hidden rounded-[1.15rem] border-2 border-white bg-[#fffaf8]/98 p-1.5 shadow-[0_24px_60px_-24px_rgba(73,52,59,0.45)] backdrop-blur-md"
                >
                  <div className="min-h-0 flex-1 space-y-1 overflow-y-auto overscroll-contain p-0.5">
                    {options.map((option, index) => {
                      const isSelected = option.value === value;
                      const isActive = index === activeIndex;

                      return (
                        <button
                          key={option.value}
                          type="button"
                          role="option"
                          id={`${menuId}-option-${index}`}
                          aria-selected={isSelected}
                          tabIndex={-1}
                          onMouseEnter={() => setActiveIndex(index)}
                          onClick={() => selectOption(option)}
                          className={cn(
                            "flex w-full items-center gap-2.5 rounded-xl border-2 px-2 py-1.5 text-left transition-colors",
                            isSelected
                              ? "border-pink bg-blush/70"
                              : "border-transparent hover:border-pink/30 hover:bg-blush/40",
                            isActive && !isSelected && "border-pink/30 bg-blush/40",
                          )}
                        >
                          <PickerOptionVisual option={option} />
                          <span className="min-w-0 flex-1">
                            <span className="block truncate font-body text-[0.78rem] font-semibold text-ink">
                              {option.label}
                            </span>
                            {option.description ? (
                              <span className="block truncate font-hand text-[0.95rem] leading-tight text-ink-soft/70">
                                {option.description}
                              </span>
                            ) : null}
                          </span>
                          <span
                            className={cn(
                              "grid h-5 w-5 shrink-0 place-items-center rounded-full border-2 transition-colors",
                              isSelected
                                ? "border-strawberry bg-strawberry text-white"
                                : "border-ink/10 text-transparent",
                            )}
                          >
                            <Check className="h-3 w-3" strokeWidth={3} />
                          </span>
                        </button>
                      );
                    })}
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

export type MessageTone = "pink" | "rose" | "lavender";

type MessageToneStyles = {
  chip: string;
  card: string;
  add: string;
  handle: string;
};

const messageTones: Record<MessageTone, MessageToneStyles> = {
  pink: {
    chip: "bg-pink-soft text-strawberry-deep",
    card: "border-pink/25 bg-blush/40 focus-within:border-pink/70 focus-within:bg-white/80",
    add: "border-pink/50 text-strawberry hover:border-pink hover:bg-blush/60",
    handle: "hover:bg-blush hover:text-strawberry",
  },
  rose: {
    chip: "bg-[#ffe4dc] text-[#b95745]",
    card: "border-[#f0c8bc]/50 bg-[#fff3ee] focus-within:border-[#e0a08f] focus-within:bg-white/85",
    add: "border-[#e8b8aa]/70 text-[#b95745] hover:border-[#d99b8b] hover:bg-[#fff1eb]",
    handle: "hover:bg-[#fff1eb] hover:text-[#b95745]",
  },
  lavender: {
    chip: "bg-lavender-soft text-[#7b60b5]",
    card: "border-lavender/45 bg-lavender-soft/45 focus-within:border-[#c3aef3] focus-within:bg-white/85",
    add: "border-[#c7b4f4]/70 text-[#7b60b5] hover:border-[#b39ce8] hover:bg-lavender-soft/60",
    handle: "hover:bg-lavender-soft hover:text-[#7b60b5]",
  },
};

function AutoGrowTextArea({
  value,
  onChange,
  placeholder,
  ariaLabel,
  maxLength,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  ariaLabel: string;
  maxLength?: number;
}) {
  const ref = useRef<HTMLTextAreaElement>(null);

  useLayoutEffect(() => {
    const element = ref.current;
    if (!element) return;

    const resize = () => {
      element.style.height = "auto";
      element.style.height = `${element.scrollHeight}px`;
    };

    resize();
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
  }, [value]);

  return (
    <textarea
      ref={ref}
      rows={1}
      value={value}
      maxLength={maxLength}
      placeholder={placeholder}
      aria-label={ariaLabel}
      onChange={(event) => onChange(event.target.value)}
      className="block w-full resize-none overflow-hidden bg-transparent p-0 font-body text-[0.82rem] leading-relaxed text-ink outline-none placeholder:text-ink-soft/35"
    />
  );
}

function SortableMessageRow({
  id,
  value,
  index,
  count,
  toneStyles,
  placeholder,
  maxLength,
  canRemove,
  onChange,
  onRemove,
  onMove,
}: {
  id: string;
  value: string;
  index: number;
  count: number;
  toneStyles: MessageToneStyles;
  placeholder: string;
  maxLength?: number;
  canRemove: boolean;
  onChange: (value: string) => void;
  onRemove: () => void;
  onMove: (from: number, to: number) => void;
}) {
  const dragControls = useDragControls();

  function handleKeyDown(event: React.KeyboardEvent<HTMLButtonElement>) {
    if (event.key === "ArrowUp" && index > 0) {
      event.preventDefault();
      onMove(index, index - 1);
    } else if (event.key === "ArrowDown" && index < count - 1) {
      event.preventDefault();
      onMove(index, index + 1);
    }
  }

  return (
    <Reorder.Item
      as="div"
      value={id}
      layout="position"
      dragListener={false}
      dragControls={dragControls}
      whileDrag={{
        scale: 1.012,
        opacity: 0.92,
        boxShadow: "0 14px 26px -18px rgba(73,52,59,0.45)",
      }}
      transition={{ duration: 0.18 }}
      className="group flex items-center gap-2"
    >
      <button
        type="button"
        onPointerDown={(event) => dragControls.start(event)}
        onKeyDown={handleKeyDown}
        aria-label={`Drag to reorder entry ${index + 1}. Use arrow keys to move.`}
        title="Drag to reorder"
        className={cn(
          "grid h-7 w-6 shrink-0 cursor-grab touch-none select-none place-items-center rounded-full text-ink-soft/30 transition-colors active:cursor-grabbing focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pink/50",
          toneStyles.handle,
        )}
      >
        <GripVertical className="h-3.5 w-3.5" />
      </button>

      <span
        className={cn(
          "grid h-5 w-5 shrink-0 place-items-center rounded-full font-body text-[0.55rem] font-bold tabular-nums",
          toneStyles.chip,
        )}
      >
        {index + 1}
      </span>

      <div
        className={cn(
          "min-w-0 flex-1 rounded-2xl border px-3 py-2 transition-colors duration-200",
          toneStyles.card,
        )}
      >
        <AutoGrowTextArea
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          ariaLabel={`${placeholder} ${index + 1}`}
          maxLength={maxLength}
        />
      </div>

      <button
        type="button"
        onClick={onRemove}
        disabled={!canRemove}
        aria-label={`Remove entry ${index + 1}`}
        title="Remove"
        className="grid h-7 w-7 shrink-0 place-items-center rounded-full text-ink-soft/35 transition-colors hover:bg-blush hover:text-strawberry disabled:cursor-not-allowed disabled:opacity-30"
      >
        <Trash2 className="h-3.5 w-3.5" />
      </button>
    </Reorder.Item>
  );
}

type StringListEditorProps = {
  items: string[];
  onChange: (items: string[]) => void;
  placeholder: string;
  addLabel: string;
  min?: number;
  max?: number;
  rows?: number;
  compact?: boolean;
  tone?: MessageTone;
  itemMaxLength?: number;
  itemIds?: string[];
  onMove?: (from: number, to: number) => void;
};

function CompactStringListEditor({
  items,
  onChange,
  placeholder,
  addLabel,
  min = 1,
  max = 30,
  tone = "pink",
  itemMaxLength,
  itemIds,
  onMove,
}: StringListEditorProps) {
  const [internalIds, setInternalIds] = useState<string[]>(() =>
    items.map(() => makeId("entry")),
  );

  const baseIds = itemIds ?? internalIds;
  const ids =
    baseIds.length === items.length
      ? baseIds
      : items.map((_, index) => baseIds[index] ?? `entry-${index}`);

  const toneStyles = messageTones[tone];

  function update(index: number, value: string) {
    const next = [...items];
    next[index] = value;
    onChange(next);
  }

  function add() {
    if (items.length >= max) return;
    if (!itemIds) {
      setInternalIds([...ids, makeId("entry")]);
    }
    onChange([...items, ""]);
  }

  function remove(index: number) {
    if (items.length <= min) return;
    if (!itemIds) {
      setInternalIds(ids.filter((_, itemIndex) => itemIndex !== index));
    }
    onChange(items.filter((_, itemIndex) => itemIndex !== index));
  }

  function move(from: number, to: number) {
    if (
      from === to ||
      from < 0 ||
      to < 0 ||
      from >= items.length ||
      to >= items.length
    ) {
      return;
    }

    if (onMove) {
      onMove(from, to);
      return;
    }

    const nextItems = [...items];
    const [movedItem] = nextItems.splice(from, 1);
    nextItems.splice(to, 0, movedItem);

    setInternalIds(() => {
      const nextIds = [...ids];
      const [movedId] = nextIds.splice(from, 1);
      nextIds.splice(to, 0, movedId);
      return nextIds;
    });

    onChange(nextItems);
  }

  function handleReorder(nextOrder: string[], movedId: string) {
    if (onMove) {
      const from = ids.indexOf(movedId);
      const to = nextOrder.indexOf(movedId);
      if (from !== -1 && to !== -1 && from !== to) onMove(from, to);
      return;
    }

    const nextItems = nextOrder.map((id) => {
      const oldIndex = ids.indexOf(id);
      return oldIndex >= 0 ? items[oldIndex] : "";
    });

    setInternalIds(nextOrder);
    onChange(nextItems);
  }

  return (
    <div>
      <Reorder.Group
        as="div"
        axis="y"
        values={ids}
        onReorder={handleReorder}
        className="space-y-2"
      >
        {items.map((item, index) => (
          <SortableMessageRow
            key={ids[index]}
            id={ids[index]}
            value={item}
            index={index}
            count={items.length}
            toneStyles={toneStyles}
            placeholder={placeholder}
            maxLength={itemMaxLength}
            canRemove={items.length > min}
            onChange={(value) => update(index, value)}
            onRemove={() => remove(index)}
            onMove={move}
          />
        ))}
      </Reorder.Group>

      <div className="mt-2 flex items-center justify-between gap-3 pt-0.5">
        <button
          type="button"
          onClick={add}
          disabled={items.length >= max}
          className={cn(
            "inline-flex items-center gap-1.5 rounded-full border border-dashed px-3 py-1.5 font-body text-[0.58rem] font-bold uppercase tracking-[0.12em] transition-colors disabled:cursor-not-allowed disabled:opacity-40",
            toneStyles.add,
          )}
        >
          <Plus className="h-3 w-3" />
          {addLabel}
        </button>
        <span className="font-hand text-sm text-ink-soft/45">
          {items.length} / {max}
        </span>
      </div>
    </div>
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
  compact = false,
  tone = "pink",
  itemMaxLength,
  itemIds,
  onMove,
}: StringListEditorProps) {
  if (compact) {
    return (
      <CompactStringListEditor
        items={items}
        onChange={onChange}
        placeholder={placeholder}
        addLabel={addLabel}
        min={min}
        max={max}
        tone={tone}
        itemMaxLength={itemMaxLength}
        itemIds={itemIds}
        onMove={onMove}
      />
    );
  }

  function update(index: number, value: string) {
    const next = [...items];
    next[index] = value;
    onChange(next);
  }

  function remove(index: number) {
    onChange(items.filter((_, itemIndex) => itemIndex !== index));
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
            onClick={() => remove(index)}
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
