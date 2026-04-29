/** @jsxImportSource preact */
import { useEffect, useState } from "preact/hooks";
import {
  AGENCY_SIZE_BLURBS,
  AGENCY_SIZE_LABELS,
  onAgencySizeChange,
  readAgencySize,
  setAgencySize,
  type AgencySize,
} from "../lib/agencySize";

const ORDER: AgencySize[] = ["Small", "Standard", "Large"];

export default function AgencyPathPicker() {
  const [selected, setSelected] = useState<AgencySize | null>(null);

  useEffect(() => {
    setSelected(readAgencySize());
    return onAgencySizeChange(setSelected);
  }, []);

  return (
    <div
      class="aqg-pathpicker"
      role="radiogroup"
      aria-label="Pick your agency size"
    >
      {ORDER.map((size) => {
        const isActive = selected === size;
        return (
          <button
            key={size}
            type="button"
            role="radio"
            aria-checked={isActive}
            class={`aqg-pathpicker__card${isActive ? " is-active" : ""}`}
            onClick={() => setAgencySize(size)}
          >
            {isActive && (
              <span class="aqg-pathpicker__pill" aria-hidden="true">
                ✓ Selected
              </span>
            )}
            <span class="aqg-pathpicker__title">
              {AGENCY_SIZE_LABELS[size]}
            </span>
            <span class="aqg-pathpicker__blurb">
              {AGENCY_SIZE_BLURBS[size]}
            </span>
          </button>
        );
      })}
    </div>
  );
}
