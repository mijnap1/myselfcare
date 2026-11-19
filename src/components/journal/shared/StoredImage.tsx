"use client";

/* eslint-disable @next/next/no-img-element -- user images come from short-lived signed URLs or data URLs */
import { Suspense, use, useRef } from "react";
import { getSignedImageUrl } from "@/lib/journal/storage";
import type { ImageRef } from "@/lib/journal/types";
import { Icon } from "../../Icon";

export function hasImage(image: ImageRef): boolean {
  return Boolean(image.imagePath || image.imageDataUrl);
}

interface StoredImageProps {
  image: ImageRef;
  className?: string;
  alt: string;
  /** Click (or Enter) opens the image full size. */
  zoomable?: boolean;
}

export function StoredImage({ image, className, alt, zoomable = false }: StoredImageProps) {
  if (image.imageDataUrl) {
    return <JournalImage src={image.imageDataUrl} className={className} alt={alt} zoomable={zoomable} />;
  }
  if (!image.imagePath) {
    return null;
  }
  return (
    <Suspense fallback={<span className={className} aria-hidden="true" />}>
      <SignedImage path={image.imagePath} className={className} alt={alt} zoomable={zoomable} />
    </Suspense>
  );
}

function SignedImage({ path, ...props }: { path: string; className?: string; alt: string; zoomable: boolean }) {
  const url = use(getSignedImageUrl(path));
  return url ? <JournalImage src={url} {...props} /> : null;
}

interface JournalImageProps {
  src: string;
  className?: string;
  alt: string;
  zoomable: boolean;
}

function JournalImage({ src, className, alt, zoomable }: JournalImageProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  if (!zoomable) {
    return <img className={className} src={src} alt={alt} loading="lazy" />;
  }

  const open = () => dialogRef.current?.showModal();
  const close = () => dialogRef.current?.close();

  return (
    <>
      <img
        className={`${className ?? ""} is-zoomable`}
        src={src}
        alt={alt}
        loading="lazy"
        role="button"
        tabIndex={0}
        aria-label={`${alt || "사진"} 크게 보기`}
        onClick={open}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            open();
          }
        }}
      />
      {/* Opens in the top layer, so the card around it can't clip it. A click anywhere closes it. */}
      <dialog ref={dialogRef} className="image-lightbox" aria-label={alt || "사진"} onClick={close}>
        <img src={src} alt={alt} />
        <button className="image-lightbox-close" type="button" aria-label="닫기" onClick={close}>
          <Icon name="close-outline" />
        </button>
      </dialog>
    </>
  );
}
