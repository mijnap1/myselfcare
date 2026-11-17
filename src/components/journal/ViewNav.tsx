"use client";

import { useLayoutEffect, useRef, type CSSProperties } from "react";
import { SegmentIndicator } from "../SegmentIndicator";
import { Icon } from "../Icon";

export type View = "skin" | "body" | "style";
export type SkinSection = "routine" | "products";
export type BodySection = "progress" | "workouts";

const VIEW_TABS = [
  { view: "skin", id: "skinViewTab", icon: "water-outline", label: "Skin Care", title: "스킨 케어" },
  { view: "body", id: "bodyViewTab", icon: "barbell-outline", label: "Body Care", title: "바디 케어" },
  { view: "style", id: "styleViewTab", icon: "shirt-outline", label: "Style Care", title: "스타일 케어" },
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
  onViewChange: (view: View) => void;
}

/**
 * The notebook's index tabs: dividers sticking out of its right edge on wide
 * screens, and a floating bar at the bottom on phones.
 */
export function ViewNav({ view, onViewChange }: ViewNavProps) {
  const navRef = useRef<HTMLElement>(null);

  // Publish how much of the viewport bottom the nav covers (only when it is
  // the floating bar), so toasts and popovers can sit above it.
  useLayoutEffect(() => {
    const nav = navRef.current;
    if (!nav) return;
    const root = document.documentElement;
    const publish = () => {
      const floating = getComputedStyle(nav).position === "fixed";
      const covered = floating ? Math.max(window.innerHeight - nav.getBoundingClientRect().top, 0) : 0;
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

  return (
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
            className={`view-tab is-${tab.view}${view === tab.view ? " is-active" : ""}`}
            type="button"
            aria-pressed={view === tab.view}
            onClick={() => onViewChange(tab.view)}
          >
            <Icon name={tab.icon} />
            <span>{tab.label}</span>
          </button>
        ))}
      </div>
    </nav>
  );
}

interface SectionBarProps {
  view: View;
  skinSection: SkinSection;
  bodySection: BodySection;
  onSkinSectionChange: (section: SkinSection) => void;
  onBodySectionChange: (section: BodySection) => void;
}

/** The first line of each notebook section: its name, and its pages as a switch. */
export function SectionBar({ view, skinSection, bodySection, onSkinSectionChange, onBodySectionChange }: SectionBarProps) {
  const index = VIEW_TABS.findIndex((tab) => tab.view === view);
  const tab = VIEW_TABS[index];
  const subTabs = view === "style" ? null : SUB_TABS[view];
  const activeSub = view === "skin" ? skinSection : bodySection;

  return (
    <div key={view} className="section-bar" data-view={view}>
      <div className="section-bar-title">
        <span className="section-bar-icon" aria-hidden="true">
          <Icon name={tab.icon} />
        </span>
        <div>
          <p className="section-bar-number">Section {String(index + 1).padStart(2, "0")}</p>
          <h2>{tab.title}</h2>
        </div>
      </div>

      {subTabs && (
        <div className="section-subtabs has-segment-indicator" role="group" aria-label={`${tab.label} pages`}>
          <SegmentIndicator activeKey={`${view}-${activeSub}`} />
          {subTabs.map((sub) => {
            const isActive = activeSub === sub.value;
            return (
              <button
                key={sub.value}
                className={`section-subtab${isActive ? " is-active" : ""}`}
                type="button"
                aria-pressed={isActive}
                onClick={() =>
                  view === "skin"
                    ? onSkinSectionChange(sub.value as SkinSection)
                    : onBodySectionChange(sub.value as BodySection)
                }
              >
                <Icon name={sub.icon} />
                <span>{sub.label}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
