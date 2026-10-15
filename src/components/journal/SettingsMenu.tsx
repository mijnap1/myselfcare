"use client";

import { useEffect, useRef, useState } from "react";
import { Icon } from "../Icon";

interface SettingsMenuProps {
  onDuplicateWeek: () => void;
  onExport: () => void;
  onImportFile: (file: File) => void;
}

export function SettingsMenu({ onDuplicateWeek, onExport, onImportFile }: SettingsMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!isOpen) {
      return;
    }
    const handleClick = (event: MouseEvent) => {
      if (!menuRef.current?.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, [isOpen]);

  const runAndClose = (action: () => void) => () => {
    setIsOpen(false);
    action();
  };

  return (
    <div className="settings-menu" ref={menuRef}>
      <button
        id="settingsButton"
        className="button button-secondary"
        type="button"
        aria-expanded={isOpen}
        aria-controls="settingsPanel"
        onClick={() => setIsOpen((open) => !open)}
      >
        <Icon name="settings-outline" />
        <span>Settings</span>
      </button>
      <div id="settingsPanel" className="settings-panel" hidden={!isOpen}>
        <button className="settings-item" type="button" onClick={runAndClose(onDuplicateWeek)}>
          <Icon name="copy-outline" />
          <span>Copy Week To Next</span>
        </button>
        <button className="settings-item" type="button" onClick={runAndClose(onExport)}>
          <Icon name="download-outline" />
          <span>Export JSON</span>
        </button>
        <button
          className="settings-item"
          type="button"
          onClick={() => {
            setIsOpen(false);
            fileInputRef.current?.click();
          }}
        >
          <Icon name="cloud-upload-outline" />
          <span>Import JSON</span>
        </button>
      </div>
      <input
        ref={fileInputRef}
        type="file"
        accept="application/json,.json"
        hidden
        onChange={(event) => {
          const file = event.target.files?.[0];
          event.target.value = "";
          if (file) {
            onImportFile(file);
          }
        }}
      />
    </div>
  );
}
