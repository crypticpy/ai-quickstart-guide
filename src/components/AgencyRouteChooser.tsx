/** @jsxImportSource preact */
import { useEffect, useMemo, useState } from "preact/hooks";
import {
  AGENCY_SIZE_LABELS,
  onAgencySizeChange,
  readAgencySize,
  setAgencySize,
  type AgencySize,
} from "../lib/agencySize";

const AGENCY_ORDER: AgencySize[] = ["Small", "Standard", "Large"];

const HOMEPAGE_PATH_BLURBS = {
  Small:
    "For small city or county teams. Start with governance, managed services, and 1-3 lightweight modules over 18-24 months.",
  Standard:
    "For mid-sized agencies. Follow the full six-phase roadmap, all training tracks, and one production starter project by month 12.",
  Large:
    "For enterprise teams. Run phases in parallel, build shared modules, and support multiple starter projects in 9-12 months.",
} as const;

type RoleKey =
  | "executive"
  | "technical"
  | "governance"
  | "program"
  | "practitioner"
  | "full";

type RoleOption = {
  key: RoleKey;
  label: string;
  blurb: string;
  destination: string;
};

const ROLES: RoleOption[] = [
  {
    key: "executive",
    label: "Executive Sponsor",
    blurb:
      "Set direction, fund the work, and keep risk, value, and public trust visible.",
    destination: "/getting-started/maturity-model/",
  },
  {
    key: "technical",
    label: "IT Lead / Technical Champion",
    blurb:
      "Own architecture, security, delivery standards, and the platform buildout.",
    destination: "/getting-started/readiness-assessment/",
  },
  {
    key: "governance",
    label: "Governance / Policy Lead",
    blurb:
      "Build the rules, review process, risk tiers, and compliance record.",
    destination: "/phase-1-governance/",
  },
  {
    key: "program",
    label: "Program Manager",
    blurb:
      "Coordinate the roadmap, dependencies, milestones, and cross-team adoption.",
    destination: "/getting-started/quickstart-checklist/",
  },
  {
    key: "practitioner",
    label: "Domain Expert / Practitioner",
    blurb:
      "Contribute real use cases, test pilot workflows, and shape service impact.",
    destination: "/phase-2-education/track-6-domain-labs/",
  },
  {
    key: "full",
    label: "Full Playbook",
    blurb:
      "Use the complete roadmap when you are coordinating the whole effort.",
    destination: "/phase-1-governance/",
  },
];

type AgencyRouteChooserProps = {
  basePath?: string;
};

function withBase(basePath: string, path: string): string {
  const cleanBase = basePath.endsWith("/") ? basePath.slice(0, -1) : basePath;
  return `${cleanBase}${path}`;
}

export default function AgencyRouteChooser({
  basePath = "/",
}: AgencyRouteChooserProps) {
  const [selectedSize, setSelectedSize] = useState<AgencySize | null>(null);
  const [selectedRole, setSelectedRole] = useState<RoleKey | null>(null);

  useEffect(() => {
    setSelectedSize(readAgencySize());
    return onAgencySizeChange(setSelectedSize);
  }, []);

  const role = useMemo(
    () => ROLES.find((option) => option.key === selectedRole) ?? null,
    [selectedRole],
  );

  const canContinue = Boolean(selectedSize && role);
  const continueLabel =
    selectedSize && role
      ? `Continue with ${selectedSize} path as ${role.label}`
      : "Select a path and role to continue";

  const handlePathSelect = (size: AgencySize) => {
    setAgencySize(size);
  };

  const handleContinue = () => {
    if (!selectedSize || !role) return;
    setAgencySize(selectedSize);
    window.location.assign(withBase(basePath, role.destination));
  };

  return (
    <section class="aqg-routechooser" aria-labelledby="routechooser-heading">
      <div class="aqg-routechooser__intro">
        <h2 id="routechooser-heading">Start With a Guided Route</h2>
        <p>
          Pick your agency scale, then pick the role closest to your job. The
          guide will send you to the right first page and keep the selected path
          active across the site.
        </p>
      </div>

      <div class="aqg-routechooser__step">
        <div class="aqg-routechooser__stepheader">
          <h3>Step 1: Select your agency path</h3>
          <p>This sets the scope, pace, and implementation depth.</p>
        </div>
        <div
          class="aqg-optiongrid aqg-optiongrid--paths"
          role="radiogroup"
          aria-label="Select your agency path"
        >
          {AGENCY_ORDER.map((size) => {
            const isActive = selectedSize === size;
            return (
              <button
                key={size}
                type="button"
                role="radio"
                aria-checked={isActive}
                class={`aqg-optioncard${isActive ? " is-active" : ""}`}
                onClick={() => handlePathSelect(size)}
              >
                <span class="aqg-optioncard__topline">
                  <span class="aqg-optioncard__radio" aria-hidden="true" />
                  <span class="aqg-optioncard__title">
                    {AGENCY_SIZE_LABELS[size]}
                  </span>
                </span>
                <span class="aqg-optioncard__blurb">
                  {HOMEPAGE_PATH_BLURBS[size]}
                </span>
                <span class="aqg-optioncard__cta" aria-hidden="true">
                  {isActive ? "Selected path" : "Choose this path"}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <div class="aqg-routechooser__step">
        <div class="aqg-routechooser__stepheader">
          <h3>Step 2: Select your role</h3>
          <p>This chooses the best starting page for your responsibilities.</p>
        </div>
        <div
          class="aqg-optiongrid aqg-optiongrid--roles"
          role="radiogroup"
          aria-label="Select your role"
        >
          {ROLES.map((option) => {
            const isActive = selectedRole === option.key;
            return (
              <button
                key={option.key}
                type="button"
                role="radio"
                aria-checked={isActive}
                class={`aqg-optioncard${isActive ? " is-active" : ""}`}
                onClick={() => setSelectedRole(option.key)}
              >
                <span class="aqg-optioncard__topline">
                  <span class="aqg-optioncard__radio" aria-hidden="true" />
                  <span class="aqg-optioncard__title">{option.label}</span>
                </span>
                <span class="aqg-optioncard__blurb">{option.blurb}</span>
                <span class="aqg-optioncard__cta" aria-hidden="true">
                  {isActive ? "Selected role" : "Choose this role"}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <div class="aqg-routechooser__actions">
        <button
          type="button"
          class="aqg-routechooser__continue"
          disabled={!canContinue}
          onClick={handleContinue}
        >
          {continueLabel}
        </button>
        <a
          class="aqg-routechooser__skip"
          href={withBase(basePath, "/phase-1-governance/")}
        >
          Skip and browse the full guide
        </a>
      </div>
    </section>
  );
}
