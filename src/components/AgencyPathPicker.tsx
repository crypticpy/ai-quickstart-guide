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
    <section class="aqg-pathpicker-wrap" aria-labelledby="path-picker-heading">
      <div class="aqg-pathpicker-wrap__header">
        <h3 id="path-picker-heading">Select your agency path below</h3>
        <p>
          This sets the scope and timeline shown across the guide. Your persona
          is separate; choose it afterward to find the best starting page.
        </p>
      </div>
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
              <span class="aqg-pathpicker__topline">
                <span class="aqg-pathpicker__radio" aria-hidden="true" />
                <span class="aqg-pathpicker__title">
                  {AGENCY_SIZE_LABELS[size]}
                </span>
              </span>
              <span class="aqg-pathpicker__blurb">
                {AGENCY_SIZE_BLURBS[size]}
              </span>
              <span class="aqg-pathpicker__cta" aria-hidden="true">
                {isActive ? "Selected path" : "Choose this path"}
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
}
