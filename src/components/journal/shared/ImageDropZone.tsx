"use client";

/* eslint-disable @next/next/no-img-element -- local object URL preview */
import { useRef } from "react";
import { getPastedImage } from "@/lib/journal/images";
import { Icon } from "../../Icon";
import { useJournal } from "../JournalContext";
import { StoredImage } from "./StoredImage";
import type { ImageDraft } from "./useImageDraft";

interface ImageDropZoneProps {
  /** CSS class prefix, e.g. "skin-product" → .skin-product-image-zone */
  prefix: "skin-product" | "body-workout" | "style";
  title: string;
  description: string;
  ariaLabel: string;
  clearLabel: string;
  draft: ImageDraft;
  onFile: (file: File) => Promise<void>;
  onClear: () => void;
}

export function ImageDropZone({
  prefix,
  title,
  description,
  ariaLabel,
  clearLabel,
  draft,
  onFile,
  onClear,
}: ImageDropZoneProps) {
  const { notify } = useJournal();
  const inputRef = useRef<HTMLInputElement>(null);

  const acceptFile = (file: File | null | undefined) => {
    if (!file || !file.type.startsWith("image/")) {
      return;
    }
    onFile(file).catch(() => notify("이미지를 읽지 못했어요."));
  };

  return (
    <>
      <div
        className={`${prefix}-image-zone`}
        tabIndex={0}
        role="button"
        aria-label={ariaLabel}
        onClick={() => inputRef.current?.click()}
        onKeyDown={(event) => {
          if (event.target === event.currentTarget && (event.key === "Enter" || event.key === " ")) {
            event.preventDefault();
            inputRef.current?.click();
          }
        }}
        onPaste={(event) => {
          const file = getPastedImage(event);
          if (file) {
            event.preventDefault();
            acceptFile(file);
          }
        }}
        onDragOver={(event) => event.preventDefault()}
        onDrop={(event) => {
          event.preventDefault();
          acceptFile(event.dataTransfer.files[0]);
        }}
      >
        <div className={`${prefix}-image-zone-copy`}>
          <Icon name="image-outline" />
          <strong>{title}</strong>
          <p>{description}</p>
        </div>
        <div className={`${prefix}-image-preview`} hidden={draft.kind === "none"}>
          {draft.kind === "new" && <img src={draft.previewUrl} alt="Selected preview" />}
          {draft.kind === "existing" && <StoredImage image={draft.image} alt="Selected preview" />}
          <button
            className="skin-product-image-clear"
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              onClear();
            }}
          >
            <Icon name="close-outline" />
            <span>{clearLabel}</span>
          </button>
        </div>
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        hidden
        onChange={(event) => {
          acceptFile(event.target.files?.[0]);
          event.target.value = "";
        }}
      />
    </>
  );
}
