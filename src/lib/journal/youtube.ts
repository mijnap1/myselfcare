export function extractYouTubeVideoId(url: string): string {
  if (!url.trim()) {
    return "";
  }

  try {
    const parsedUrl = new URL(url.trim());
    const host = parsedUrl.hostname.replace(/^www\./, "");

    if (host === "youtu.be") {
      return parsedUrl.pathname.slice(1).split("/")[0];
    }

    if (host === "youtube.com" || host === "m.youtube.com") {
      if (parsedUrl.pathname === "/watch") {
        return parsedUrl.searchParams.get("v") ?? "";
      }
      if (parsedUrl.pathname.startsWith("/shorts/") || parsedUrl.pathname.startsWith("/embed/")) {
        return parsedUrl.pathname.split("/")[2] ?? "";
      }
    }
  } catch {
    return "";
  }

  return "";
}

export function buildYouTubeWatchUrl(videoId: string): string {
  return `https://www.youtube.com/watch?v=${encodeURIComponent(videoId)}`;
}

export function buildYouTubeEmbedUrl(videoId: string): string {
  return `https://www.youtube.com/embed/${encodeURIComponent(videoId)}`;
}

export function buildYouTubeThumbnailUrl(videoId: string): string {
  return `https://i.ytimg.com/vi/${encodeURIComponent(videoId)}/hqdefault.jpg`;
}

export async function fetchYouTubeTitle(videoId: string, signal?: AbortSignal): Promise<string> {
  if (!videoId) {
    return "";
  }

  try {
    const response = await fetch(
      `https://www.youtube.com/oembed?url=${encodeURIComponent(buildYouTubeWatchUrl(videoId))}&format=json`,
      { signal }
    );
    if (!response.ok) {
      return "";
    }
    const data: unknown = await response.json();
    return data && typeof data === "object" && "title" in data && typeof data.title === "string"
      ? data.title
      : "";
  } catch {
    return "";
  }
}
