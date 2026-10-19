"use client";

import { useLayoutEffect, useRef, useState, type CSSProperties } from "react";
import { createPortal } from "react-dom";
import { Icon } from "../Icon";

export type View = "skin" | "body" | "style";
export type SkinSection = "routine" | "products";
export type BodySection = "progress" | "workouts";

const VIEW_TABS = [
  { view: "skin", id: "skinViewTab", icon: "water-outline", label: "Skin Care" },
  { view: "body", id: "bodyViewTab", icon: "barbell-outline", label: "Body Care" },
  { view: "style", id: "styleViewTab", icon: "shirt-outline", label: "Style Care" },
] as const;

const SUB_TABS = {
  skin: [
    { value: "routine", label: "Routine", icon: "calendar-outline" },
    { value: "products", label: "Products", icon: "flask-outline" },
  ],
  body: [
    { value: "progress", label: "Progress", icon: "trending-up-outline" },
    { value: "workouts", label: "운동 · 식단", icon: "restaurant-outline" },
  ],
} as const;

interface ViewNavProps {
  view: View;
  skinSection: SkinSection;
  bodySection: BodySection;
  onViewChange: (view: View) => void;
  onSkinSectionChange: (section: SkinSection) => void;
  onBodySectionChange: (section: BodySection) => void;
}

/**
 * Floating section nav. The active highlights are single elements that slide
 * between tabs, and the sub-tab row animates its height instead of popping in
 * and out (Style Care has no sub-sections, so the row collapses there).
 */
export function ViewNav({
  view,
  skinSection,
  bodySection,
  onViewChange,
  onSkinSectionChange,
  onBodySectionChange,
}: ViewNavProps) {
  // While Style Care is open, keep the last sub-tab row rendered so it can
  // fade out as the row collapses instead of vanishing first.
  const [lastSubKind, setLastSubKind] = useState<"skin" | "body">(view === "body" ? "body" : "skin");
  const hasSubTabs = view !== "style";
  const navRef = useRef<HTMLElement>(null);

  // Publish how much of the viewport bottom the floating nav covers, so toasts
  // and popovers can sit above it (follows the sub-tab row as it animates).
  useLayoutEffect(() => {
    const nav = navRef.current;
    if (!nav) return;
    const root = document.documentElement;
    const publish = () => {
      const covered = Math.max(window.innerHeight - nav.getBoundingClientRect().top, 0);
      root.style.setProperty("--view-nav-offset", `${Math.round(covered)}px`);
    };
    publish();
    const observer = new ResizeObserver(publish);
    observer.observe(nav);
    window.addEventListener("resize", publish);
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", publish);
      root.style.removeProperty("--view-nav-offset");
    };
  }, []);
  const subKind = view === "style" ? lastSubKind : view;

  const selectView = (next: View) => {
    if (next === "style") {
      setLastSubKind(subKind);
    }
    onViewChange(next);
  };

  const subTabs = SUB_TABS[subKind];
  const activeSub = subKind === "skin" ? skinSection : bodySection;
  const subIndex = Math.max(
    subTabs.findIndex((tab) => tab.value === activeSub),
    0
  );

  // Rendered on <body> so animated (transformed) page sections can't shift this fixed bar.
  return createPortal(
    <nav
      ref={navRef}
      className="view-tabs"
      aria-label="App sections"
      data-view={view}
      style={{ "--view-index": VIEW_TABS.findIndex((tab) => tab.view === view) } as CSSProperties}
    >
      <div className="view-tab-row">
        <span className="view-tab-indicator" aria-hidden="true" />
        {VIEW_TABS.map((tab) => (
          <button
            key={tab.view}
            id={tab.id}
            className={`view-tab${view === tab.view ? " is-active" : ""}`}
            type="button"
            aria-pressed={view === tab.view}
            onClick={() => selectView(tab.view)}
          >
            <Icon name={tab.icon} />
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      <div className="view-subtabs-shell" data-open={hasSubTabs} inert={!hasSubTabs}>
        <div className="view-subtabs-clip">
          <div
            key={subKind}
            className={`${subKind}-subtabs view-subtabs`}
            aria-label={subKind === "skin" ? "Skin sections" : "Body sections"}
            style={{ "--sub-index": subIndex } as CSSProperties}
          >
            <span className="view-subtab-indicator" aria-hidden="true" />
            {subTabs.map((tab) => {
              const isActive = activeSub === tab.value;
              return (
                <button
                  key={tab.value}
                  className={`${subKind}-subtab${isActive ? " is-active" : ""}`}
                  type="button"
                  aria-pressed={isActive}
                  onClick={() =>
                    subKind === "skin"
                      ? onSkinSectionChange(tab.value as SkinSection)
                      : onBodySectionChange(tab.value as BodySection)
                  }
                >
                  <Icon name={tab.icon} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </nav>,
    document.body
  );
}
