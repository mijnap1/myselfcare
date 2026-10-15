"use client";

import { useCallback, useEffect, useState } from "react";
import { optimizeImage } from "@/lib/journal/images";
import { removeJournalImages, uploadJournalImage } from "@/lib/journal/storage";
import type { ImageRef } from "@/lib/journal/types";

export type ImageDraft =
  | { kind: "none" }
  | { kind: "existing"; image: ImageRef }
  | { kind: "new"; blob: Blob; previewUrl: string };

const NONE: ImageDraft = { kind: "none" };
const EMPTY_IMAGE: ImageRef = { imagePath: "", imageDataUrl: "" };

/**
 * Image picked in a form. New images stay local until the form is saved, so
 * abandoned forms never leave files behind in Storage.
 */
export function useImageDraft() {
  const [draft, setDraft] = useState<ImageDraft>(NONE);

  useEffect(() => {
    if (draft.kind !== "new") {
      return;
    }
    return () => URL.revokeObjectURL(draft.previewUrl);
  }, [draft]);

  const loadFile = useCallback(async (file: File) => {
    const blob = await optimizeImage(file);
    setDraft({ kind: "new", blob, previewUrl: URL.createObjectURL(blob) });
  }, []);

  const loadExisting = useCallback((image: ImageRef) => {
    setDraft(image.imagePath || image.imageDataUrl ? { kind: "existing", image } : NONE);
  }, []);

  const clear = useCallback(() => setDraft(NONE), []);

  return { draft, loadFile, loadExisting, clear };
}

/**
 * Uploads a new image if needed and returns the reference to store. When an
 * existing item's image was replaced or removed, the old file is deleted.
 */
export async function commitImageDraft(
  userId: string,
  draft: ImageDraft,
  previous: ImageRef | undefined
): Promise<ImageRef> {
  let next = EMPTY_IMAGE;
  if (draft.kind === "existing") {
    next = draft.image;
  } else if (draft.kind === "new") {
    next = { imagePath: await uploadJournalImage(userId, draft.blob), imageDataUrl: "" };
  }

  if (previous?.imagePath && previous.imagePath !== next.imagePath) {
    void removeJournalImages([previous.imagePath]);
  }
  return next;
}
