'use client';

import { useState, type ReactNode } from 'react';

/**
 * Collapsible form wrapper.
 *
 * Replaces native <details>+<summary> for forms with required inputs.
 * Why not <details>: when closed, the form inside has display:none,
 * and the browser cannot focus required inputs to show validation
 * messages — leading to "An invalid form control with name='X' is
 * not focusable" errors in the console.
 *
 * This component renders content conditionally (no display:none), so
 * required inputs work correctly when the form is open.
 */
type Props = {
  /** Text for the toggle button */
  label: string;
  /** Text when the form is open */
  closeLabel?: string;
  /** Form content */
  children: ReactNode;
  /** Optional className for the wrapper */
  className?: string;
};

export function CollapsibleForm({ label, closeLabel, children, className }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <div className={className ?? 'border-t border-border pt-4'}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="text-sm font-medium hover:text-accent"
      >
        {open ? closeLabel ?? `− Скрыть` : `+ ${label}`}
      </button>
      {open && <div className="mt-3">{children}</div>}
    </div>
  );
}
