"use client";

/* eslint-disable @next/next/no-img-element -- user images come from short-lived signed URLs or data URLs */
import { Suspense, use } from "react";
import { getSignedImageUrl } from "@/lib/journal/storage";
import type { ImageRef } from "@/lib/journal/types";

export function hasImage(image: ImageRef): boolean {
  return Boolean(image.imagePath || image.imageDataUrl);
}

interface StoredImageProps {
  image: ImageRef;
  className?: string;
  alt: string;
}

export function StoredImage({ image, className, alt }: StoredImageProps) {
  if (image.imageDataUrl) {
    return <img className={className} src={image.imageDataUrl} alt={alt} />;
  }
  if (!image.imagePath) {
    return null;
  }
  return (
    <Suspense fallback={<span className={className} aria-hidden="true" />}>
      <SignedImage path={image.imagePath} className={className} alt={alt} />
    </Suspense>
  );
}

function SignedImage({ path, className, alt }: { path: string; className?: string; alt: string }) {
  const url = use(getSignedImageUrl(path));
  return url ? <img className={className} src={url} alt={alt} loading="lazy" /> : null;
}
