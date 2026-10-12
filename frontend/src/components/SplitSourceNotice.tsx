import { X } from "lucide-react";
import { useEffect, useId, useRef, useState, type RefObject } from "react";
import "./splitSourceNotice.css";

const STORAGE_KEY = "ctroadmap.public.splitSourceNotice.v1";
const HIDE_DURATION_MS = 96 * 60 * 60 * 1000;

interface DismissalState {
  dismissals: number;
  dismissedAt: number;
}

function readDismissalState(): DismissalState {
  try {
    const stored = JSON.parse(window.localStorage.getItem(STORAGE_KEY) ?? "null");
    if (stored && Number.isInteger(stored.dismissals) && stored.dismissals >= 0 && stored.dismissals <= 2
      && Number.isSafeInteger(stored.dismissedAt) && stored.dismissedAt >= 0) {
      return { dismissals: stored.dismissals, dismissedAt: stored.dismissedAt };
    }
  } catch {
    // Keep the notice usable when browser storage is unavailable or invalid.
  }
  return { dismissals: 0, dismissedAt: 0 };
}

export function SplitSourceNotice({ returnFocusRef }: { returnFocusRef: RefObject<HTMLButtonElement> }) {
  const [dismissal, setDismissal] = useState(readDismissalState);
  const [now, setNow] = useState(Date.now);
  const [open, setOpen] = useState(false);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  const visible = dismissal.dismissals < 2
    && (dismissal.dismissals === 0 || now >= dismissal.dismissedAt + HIDE_DURATION_MS);

  useEffect(() => {
    if (dismissal.dismissals !== 1 || now >= dismissal.dismissedAt + HIDE_DURATION_MS) return;
    const remaining = dismissal.dismissedAt + HIDE_DURATION_MS - Date.now();
    if (remaining <= 0) {
      setNow(Date.now());
      return;
    }
    const timer = window.setTimeout(() => setNow(Date.now()), Math.min(remaining, HIDE_DURATION_MS));
    return () => window.clearTimeout(timer);
  }, [dismissal, now]);

  useEffect(() => {
    const refreshTime = () => setNow(Date.now());
    const syncStorage = (event: StorageEvent) => {
      if (event.key !== STORAGE_KEY && event.key !== null) return;
      setDismissal(readDismissalState());
      refreshTime();
    };
    window.addEventListener("storage", syncStorage);
    window.addEventListener("focus", refreshTime);
    document.addEventListener("visibilitychange", refreshTime);
    return () => {
      window.removeEventListener("storage", syncStorage);
      window.removeEventListener("focus", refreshTime);
      document.removeEventListener("visibilitychange", refreshTime);
    };
  }, []);

  useEffect(() => {
    if (!open) return;
    const dialog = dialogRef.current;
    dialog?.showModal();
    return () => dialog?.close();
  }, [open]);

  function dismiss() {
    // Read again so another tab's dismissal cannot be overwritten by stale state.
    const next = {
      dismissals: Math.min(2, Math.max(dismissal.dismissals, readDismissalState().dismissals) + 1),
      dismissedAt: Date.now()
    };
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      // The current tab still honors dismissals if storage is blocked.
    }
    dialogRef.current?.close();
    setOpen(false);
    setDismissal(next);
    setNow(next.dismissedAt);
    returnFocusRef.current?.focus();
  }

  return (
    <>
      {visible ? (
        <button className="notice-button" type="button" aria-haspopup="dialog" onClick={() => setOpen(true)}>
          NOTICE
        </button>
      ) : null}
      {open ? (
        <dialog
          ref={dialogRef}
          className="notice-dialog"
          aria-labelledby={titleId}
          aria-modal="true"
          onCancel={(event) => event.preventDefault()}
          onKeyDown={(event) => event.stopPropagation()}
        >
          <header className="notice-dialog__header">
            <h2 id={titleId}>Split-Source Model</h2>
            <button className="notice-dialog__close" type="button" aria-label="Close notice" onClick={dismiss} autoFocus>
              <X size={22} aria-hidden="true" />
            </button>
          </header>
          <div className="notice-dialog__body">
            <p>
              CTRoadmap follows an intentional <strong>split-source / open-core development model</strong>. The publicly available source focuses on the Canvas and diagramming functionality, while the full application—including Handbook, Rack View, and Mobile View—is developed in a private repository and distributed through the public Docker image.
            </p>
            <p>
              The public repository is not currently a source-complete representation of the distributed application, and its diagramming code may lag behind the latest release. My goal is to progressively bring the public Canvas implementation into alignment with the shipping version while retaining flexibility around the development of additional features.
            </p>
          </div>
        </dialog>
      ) : null}
    </>
  );
}
