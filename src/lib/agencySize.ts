/**
 * Agency-size variant selection — shared between AgencyPathPicker (the
 * 3-button hero on the home and pick-your-path pages) and the header
 * dropdown.
 *
 * The localStorage key matches Starlight's Tabs `syncKey` prefix so any
 * <Tabs syncKey="agency-size"> block on the page picks up the selection
 * automatically on next render. We also live-sync currently rendered Tabs
 * because storage events only fire across tabs, not same-tab.
 */

export type AgencySize = "Small" | "Standard" | "Large";

export const AGENCY_SIZE_LABELS = {
  Small: "Small (1–4 IT staff)",
  Standard: "Standard (5–15 IT staff)",
  Large: "Large (15+ IT staff)",
} as const;

export const AGENCY_SIZE_BLURBS = {
  Small:
    "Small county or city agency. The full 6-phase build is unrealistic — focus on a 2-day governance sprint, managed AI services instead of custom infrastructure, and 1–3 lightweight modules. 18–24 month timeline.",
  Standard:
    "Mid-sized agency or department. The default path the guide is calibrated for: six overlapping phases, all training tracks, a custom cloud sandbox, 5–7 platform modules, and one starter project in production by month 12.",
  Large:
    "Large state agency or multi-department program. Compress the timeline by running phases in parallel, build all seven modules with inner-source contributions, and ship multiple starter projects. 9–12 month timeline.",
} as const;

const STORAGE_KEY = "starlight-synced-tabs__agency-size";
const EVENT_NAME = "aqg:agency-size-change";

/** Read the current selection from localStorage. */
export function readAgencySize(): AgencySize | null {
  if (typeof window === "undefined") return null;
  try {
    const v = window.localStorage.getItem(STORAGE_KEY);
    if (v === "Small" || v === "Standard" || v === "Large") return v;
    return null;
  } catch {
    return null;
  }
}

/**
 * Set the selection. Writes localStorage in Starlight's expected format
 * (so any Tabs block picks it up on next render or when restoring on
 * page load), live-updates any rendered Tabs on the current page, and
 * fires a CustomEvent so other pickers on the page can update their UI.
 */
export function setAgencySize(size: AgencySize): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, size);
  } catch {
    /* storage may be unavailable (private mode); the event below still fires */
  }

  // Live-sync any rendered <starlight-tabs> with this syncKey on the page.
  // Starlight uses element role=tab + an internal class to track active state;
  // simulating a click on the matching tab triggers their own switch logic
  // and keeps the experience consistent with manual tab clicks.
  const tabContainers = document.querySelectorAll<HTMLElement>(
    'starlight-tabs[data-sync-key="agency-size"]',
  );
  tabContainers.forEach((container) => {
    const tabs = container.querySelectorAll<HTMLElement>('[role="tab"]');
    tabs.forEach((tab) => {
      if ((tab.textContent || "").trim() === size) {
        tab.click();
      }
    });
  });

  window.dispatchEvent(new CustomEvent(EVENT_NAME, { detail: { size } }));
}

/**
 * Subscribe to selection changes from any picker (button, dropdown, or
 * direct localStorage write from another tab).
 */
export function onAgencySizeChange(
  cb: (size: AgencySize | null) => void,
): () => void {
  if (typeof window === "undefined") return () => {};
  const handleEvent = (e: Event) => {
    const ce = e as CustomEvent<{ size: AgencySize }>;
    cb(ce.detail?.size ?? null);
  };
  const handleStorage = (e: StorageEvent) => {
    if (e.key === STORAGE_KEY) cb(readAgencySize());
  };
  window.addEventListener(EVENT_NAME, handleEvent);
  window.addEventListener("storage", handleStorage);
  return () => {
    window.removeEventListener(EVENT_NAME, handleEvent);
    window.removeEventListener("storage", handleStorage);
  };
}
