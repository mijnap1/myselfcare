import { getBrowserSupabase } from "@/lib/supabase/client";
import { IMAGE_BUCKET } from "./constants";
import type { ImageRef, JournalData } from "./types";

const SIGNED_URL_TTL_SECONDS = 60 * 60;
const signedUrlCache = new Map<string, Promise<string>>();

export async function uploadJournalImage(userId: string, image: Blob): Promise<string> {
  const path = `${userId}/${crypto.randomUUID()}.jpg`;
  const { error } = await getBrowserSupabase()
    .storage.from(IMAGE_BUCKET)
    .upload(path, image, { contentType: "image/jpeg", upsert: false });
  if (error) {
    throw error;
  }
  return path;
}

export async function removeJournalImages(paths: string[]): Promise<void> {
  const targets = paths.filter(Boolean);
  if (!targets.length) {
    return;
  }
  targets.forEach((path) => signedUrlCache.delete(path));
  const { error } = await getBrowserSupabase().storage.from(IMAGE_BUCKET).remove(targets);
  if (error) {
    console.warn("Failed to remove images:", error);
  }
}

/** Cached per path so `use()` gets a stable promise across renders. */
export function getSignedImageUrl(path: string): Promise<string> {
  let promise = signedUrlCache.get(path);
  if (!promise) {
    promise = getBrowserSupabase()
      .storage.from(IMAGE_BUCKET)
      .createSignedUrl(path, SIGNED_URL_TTL_SECONDS)
      .then(({ data, error }) => {
        if (error || !data) {
          signedUrlCache.delete(path);
          return "";
        }
        // Drop the cache entry shortly before the URL expires.
        setTimeout(() => signedUrlCache.delete(path), (SIGNED_URL_TTL_SECONDS - 60) * 1000);
        return data.signedUrl;
      });
    signedUrlCache.set(path, promise);
  }
  return promise;
}

function imageHolders(data: JournalData): ImageRef[] {
  return [...data.skinLibrary.products, ...data.bodyProgress.workouts, ...data.styleBoard.items];
}

export function hasInlineImages(data: JournalData): boolean {
  return imageHolders(data).some((item) => item.imageDataUrl.startsWith("data:"));
}

/**
 * Uploads base64 images left over from the old app and returns a map of
 * data URL → storage path so the caller can swap them in.
 */
export async function uploadInlineImages(
  userId: string,
  data: JournalData
): Promise<Map<string, string>> {
  const uploaded = new Map<string, string>();
  for (const item of imageHolders(data)) {
    const dataUrl = item.imageDataUrl;
    if (!dataUrl.startsWith("data:") || uploaded.has(dataUrl)) {
      continue;
    }
    const blob = await (await fetch(dataUrl)).blob();
    uploaded.set(dataUrl, await uploadJournalImage(userId, blob));
  }
  return uploaded;
}
