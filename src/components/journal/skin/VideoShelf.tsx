"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { createId } from "@/lib/journal/format";
import type { JournalData, SkinVideo } from "@/lib/journal/types";
import {
  buildYouTubeEmbedUrl,
  buildYouTubeThumbnailUrl,
  buildYouTubeWatchUrl,
  extractYouTubeVideoId,
  fetchYouTubeTitle,
} from "@/lib/journal/youtube";
import type { Draft } from "immer";
import { Icon } from "../../Icon";
import { useJournal } from "../JournalContext";
import { useRemoveWithUndo } from "../shared/useRemoveWithUndo";

const EMPTY_FORM = { url: "", title: "", note: "" };
const selectVideos = (draft: Draft<JournalData>) => draft.skinLibrary.videos;

function YouTubeFrame({ videoId, title }: { videoId: string; title: string }) {
  return (
    <iframe
      src={buildYouTubeEmbedUrl(videoId)}
      title={title}
      loading="lazy"
      referrerPolicy="strict-origin-when-cross-origin"
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
      allowFullScreen
    />
  );
}

export function VideoShelf() {
  const { data, update } = useJournal();
  const removeVideo = useRemoveWithUndo(selectVideos);
  const [form, setForm] = useState(EMPTY_FORM);
  const [editingId, setEditingId] = useState("");
  // oEmbed titles by video id; a missing key means "still loading".
  const [titles, setTitles] = useState<Record<string, string>>({});
  const formRef = useRef<HTMLFormElement>(null);
  const titleInputRef = useRef<HTMLInputElement>(null);
  const urlInputRef = useRef<HTMLInputElement>(null);

  const videoId = extractYouTubeVideoId(form.url);
  const youtubeTitle = videoId ? titles[videoId] : undefined;

  useEffect(() => {
    if (!videoId || videoId in titles) {
      return;
    }
    const controller = new AbortController();
    const timer = window.setTimeout(() => {
      fetchYouTubeTitle(videoId, controller.signal).then((title) => {
        if (!controller.signal.aborted) {
          setTitles((previous) => ({ ...previous, [videoId]: title }));
        }
      });
    }, 180);
    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [titles, videoId]);

  const startEditing = (video: SkinVideo) => {
    setEditingId(video.id);
    setForm({ url: video.url || buildYouTubeWatchUrl(video.videoId), title: video.customTitle, note: video.note });
    setTitles((previous) => ({ ...previous, [video.videoId]: video.youtubeTitle }));
    formRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    titleInputRef.current?.focus();
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!videoId) {
      urlInputRef.current?.setCustomValidity("유효한 YouTube 링크를 넣어주세요.");
      urlInputRef.current?.reportValidity();
      urlInputRef.current?.setCustomValidity("");
      return;
    }

    const existing = data.skinLibrary.videos.find((video) => video.id === editingId);
    const nextVideo: SkinVideo = {
      id: existing?.id ?? createId(),
      url: buildYouTubeWatchUrl(videoId),
      videoId,
      customTitle: form.title.trim(),
      note: form.note.trim(),
      youtubeTitle: youtubeTitle ?? (await fetchYouTubeTitle(videoId)),
      thumbnailUrl: buildYouTubeThumbnailUrl(videoId),
      addedAt: existing?.addedAt ?? new Date().toISOString(),
    };

    update((draft) => {
      const videos = draft.skinLibrary.videos;
      const index = videos.findIndex((video) => video.id === nextVideo.id);
      if (index >= 0) {
        videos[index] = nextVideo;
      } else {
        videos.unshift(nextVideo);
      }
    });
    setForm(EMPTY_FORM);
    setEditingId("");
  };

  const previewTitle = form.title.trim() || youtubeTitle || "YouTube video preview";
  const previewNote = form.note.trim();

  return (
    <section className="skin-videos card">
      <div className="skin-videos-head">
        <div>
          <p className="section-kicker">
            <Icon name="logo-youtube" />
            <span>Video Shelf</span>
          </p>
          <h2>Skincare video references</h2>
          <p className="section-note">
            링크를 넣어두면 나중에 다시 보고 싶은 영상들을 스킨 저널 안에서 같이 정리할 수 있어요.
          </p>
        </div>
      </div>

      <form ref={formRef} className="skin-video-form" onSubmit={handleSubmit}>
        <div className="skin-video-form-grid">
          <label className="skin-video-field skin-video-field-link">
            <span>YouTube link</span>
            <input
              ref={urlInputRef}
              type="url"
              inputMode="url"
              placeholder="https://www.youtube.com/watch?v=..."
              required
              value={form.url}
              onChange={(event) => setForm({ ...form, url: event.target.value })}
            />
          </label>
          <label className="skin-video-field">
            <span>Personal title</span>
            <input
              ref={titleInputRef}
              type="text"
              placeholder="예: 모공 케어 참고 영상"
              value={form.title}
              onChange={(event) => setForm({ ...form, title: event.target.value })}
            />
          </label>
        </div>
        <label className="skin-video-field">
          <span>Notes</span>
          <textarea
            rows={3}
            placeholder="어떤 내용인지, 나중에 뭘 다시 보고 싶은지 적어두세요."
            value={form.note}
            onChange={(event) => setForm({ ...form, note: event.target.value })}
          />
        </label>
        <div className="skin-video-form-actions">
          <button className="button button-secondary" type="submit">
            <Icon name={editingId ? "save-outline" : "add-outline"} />
            <span>{editingId ? "Save video" : "Add video"}</span>
          </button>
        </div>
      </form>

      {videoId && (
        <div className="skin-video-preview">
          <div className="skin-video-preview-frame">
            <YouTubeFrame videoId={videoId} title={previewTitle} />
          </div>
          <div className="skin-video-preview-copy">
            <p className="summary-kicker">Preview</p>
            <h3>{previewTitle}</h3>
            {youtubeTitle ? (
              <p className="skin-video-source-title">{youtubeTitle}</p>
            ) : (
              <p className="skin-video-source-title is-muted">
                {youtubeTitle === undefined ? "영상 제목 불러오는 중..." : "영상 제목을 불러오지 못했어요."}
              </p>
            )}
            {previewNote ? (
              <p className="skin-video-preview-note">{previewNote}</p>
            ) : (
              <p className="skin-video-preview-note is-muted">개인 제목이나 메모를 남겨두면 나중에 찾기 쉬워져요.</p>
            )}
          </div>
        </div>
      )}

      <div className="skin-video-list">
        {data.skinLibrary.videos.length === 0 ? (
          <article className="skin-video-empty">
            <Icon name="logo-youtube" />
            <div>
              <strong>아직 저장한 스킨케어 영상이 없어요.</strong>
              <p>링크를 넣고 개인 제목이나 메모를 붙여두면, 나중에 루틴 참고용으로 다시 보기 쉬워집니다.</p>
            </div>
          </article>
        ) : (
          data.skinLibrary.videos.map((video) => (
            <article key={video.id} className="skin-video-card card">
              <div className="skin-video-card-frame">
                <YouTubeFrame videoId={video.videoId} title={video.customTitle || video.youtubeTitle || "Saved skincare video"} />
              </div>
              <div className="skin-video-card-copy">
                <div className="skin-video-card-head">
                  <div>
                    <p className="summary-kicker">Saved video</p>
                    <h3>{video.customTitle || video.youtubeTitle || "Untitled reference"}</h3>
                    {video.youtubeTitle && video.customTitle && (
                      <p className="skin-video-source-title">{video.youtubeTitle}</p>
                    )}
                  </div>
                  <div className="skin-video-card-actions">
                    <a
                      className="button button-secondary skin-video-link-button"
                      href={buildYouTubeWatchUrl(video.videoId)}
                      target="_blank"
                      rel="noreferrer noopener"
                    >
                      <Icon name="open-outline" />
                      <span>Open</span>
                    </a>
                    <button className="button button-secondary skin-video-edit-button" type="button" onClick={() => startEditing(video)}>
                      <Icon name="create-outline" />
                      <span>Edit</span>
                    </button>
                    <button
                      className="button button-secondary skin-video-delete-button"
                      type="button"
                      onClick={() => removeVideo(video.id, "영상이 삭제됐어요.")}
                    >
                      <Icon name="trash-outline" />
                      <span>Delete</span>
                    </button>
                  </div>
                </div>
                {video.note ? (
                  <p className="skin-video-note">{video.note}</p>
                ) : (
                  <p className="skin-video-note is-muted">메모 없음</p>
                )}
              </div>
            </article>
          ))
        )}
      </div>
    </section>
  );
}
