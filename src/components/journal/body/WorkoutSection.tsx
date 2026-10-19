"use client";

import type { Draft } from "immer";
import { useRef, useState, type FormEvent } from "react";
import { SegmentIndicator } from "@/components/SegmentIndicator";
import { BODY_PARTS } from "@/lib/journal/constants";
import { createId, safeExternalUrl } from "@/lib/journal/format";
import type { BodyPart, JournalData, Workout } from "@/lib/journal/types";
import { Icon } from "../../Icon";
import { useJournal } from "../JournalContext";
import { ImageDropZone } from "../shared/ImageDropZone";
import { hasImage, StoredImage } from "../shared/StoredImage";
import { commitImageDraft, useImageDraft } from "../shared/useImageDraft";
import { useRemoveWithUndo } from "../shared/useRemoveWithUndo";

const EMPTY_FORM = { title: "", youtubeUrl: "", note: "" };
const selectWorkouts = (draft: Draft<JournalData>) => draft.bodyProgress.workouts;

export function WorkoutSection() {
  const { data, update, userId, notify } = useJournal();
  const removeWorkout = useRemoveWithUndo(selectWorkouts);
  const [bodyPart, setBodyPart] = useState<BodyPart>("chest");
  const [form, setForm] = useState(EMPTY_FORM);
  const [editingId, setEditingId] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const image = useImageDraft();
  const formRef = useRef<HTMLFormElement>(null);
  const titleInputRef = useRef<HTMLInputElement>(null);
  const workouts = data.bodyProgress.workouts;

  const startEditing = (workout: Workout) => {
    setEditingId(workout.id);
    setBodyPart(workout.bodyPart);
    setForm({ title: workout.title, youtubeUrl: workout.youtubeUrl, note: workout.note });
    image.loadExisting(workout);
    formRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    titleInputRef.current?.focus();
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const title = form.title.trim();
    if (!title) {
      titleInputRef.current?.reportValidity();
      return;
    }

    const existing = workouts.find((workout) => workout.id === editingId);
    setIsSaving(true);
    try {
      const imageRef = await commitImageDraft(userId, image.draft, existing);
      const nextWorkout: Workout = {
        id: existing?.id ?? createId(),
        bodyPart,
        title,
        youtubeUrl: form.youtubeUrl.trim(),
        note: form.note.trim(),
        ...imageRef,
        addedAt: existing?.addedAt ?? new Date().toISOString(),
      };

      update((draft) => {
        const list = draft.bodyProgress.workouts;
        const index = list.findIndex((workout) => workout.id === nextWorkout.id);
        if (index >= 0) {
          list[index] = nextWorkout;
        } else {
          list.unshift(nextWorkout);
        }
      });
      setForm(EMPTY_FORM);
      setEditingId("");
      image.clear();
    } catch {
      notify("이미지를 업로드하지 못했어요. 다시 시도해 주세요.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="body-workout-grid">
      <section className="card body-card body-workout-form-card">
        <div className="body-card-head">
          <p className="section-kicker">
            <Icon name="add-circle-outline" />
            <span>{editingId ? "운동 수정" : "운동 추가"}</span>
          </p>
          <h2>운동 메모</h2>
        </div>
        <form ref={formRef} className="body-workout-form" onSubmit={handleSubmit}>
          <div className="has-segment-indicator body-workout-parts" role="group" aria-label="Workout body part">
            <SegmentIndicator activeKey={bodyPart} />
            {BODY_PARTS.map((part) => (
              <button
                key={part.value}
                className={`body-part-button${bodyPart === part.value ? " is-active" : ""}`}
                type="button"
                aria-pressed={bodyPart === part.value}
                onClick={() => setBodyPart(part.value)}
              >
                {part.label}
              </button>
            ))}
          </div>

          <label className="body-field">
            <span>운동 이름</span>
            <input
              ref={titleInputRef}
              type="text"
              placeholder="예: 인클라인 덤벨 프레스"
              required
              value={form.title}
              onChange={(event) => setForm({ ...form, title: event.target.value })}
            />
          </label>
          <label className="body-field">
            <span>YouTube 링크</span>
            <input
              type="url"
              inputMode="url"
              placeholder="https://www.youtube.com/watch?v=..."
              value={form.youtubeUrl}
              onChange={(event) => setForm({ ...form, youtubeUrl: event.target.value })}
            />
          </label>
          <label className="body-field body-field-note">
            <span>메모</span>
            <textarea
              rows={4}
              placeholder="세트, 반복 수, 자세 포인트, 느낌 등을 적어두세요."
              value={form.note}
              onChange={(event) => setForm({ ...form, note: event.target.value })}
            />
          </label>

          <ImageDropZone
            prefix="body-workout"
            title="운동 이미지 붙여넣기"
            description="운동 자세 이미지나 참고 사진을 복사해서 붙여넣거나 클릭해서 업로드할 수 있어요."
            ariaLabel="Paste or upload workout image"
            clearLabel="삭제"
            draft={image.draft}
            onFile={image.loadFile}
            onClear={image.clear}
          />

          <button className="button" type="submit" disabled={isSaving}>
            <Icon name="save-outline" />
            <span>{isSaving ? "저장 중..." : "운동 저장"}</span>
          </button>
        </form>
      </section>

      <section className="card body-card body-workout-list-card">
        <div className="body-card-head">
          <p className="section-kicker">
            <Icon name="list-outline" />
            <span>Library</span>
          </p>
          <h2>운동 라이브러리</h2>
        </div>
        <div className="body-workout-list">
          {workouts.length === 0 ? (
            <article className="body-workout-empty">
              <Icon name="fitness-outline" />
              <div>
                <strong>아직 운동 메모가 없어요.</strong>
                <p>운동 이름, 몸 부위, 자세 이미지나 메모를 저장해두면 나만의 운동 라이브러리가 됩니다.</p>
              </div>
            </article>
          ) : (
            BODY_PARTS.map((part) => {
              const items = workouts.filter((workout) => workout.bodyPart === part.value);
              if (!items.length) return null;
              return (
                <section key={part.value} className="body-workout-group">
                  <div className="body-workout-group-head">
                    <Icon name={part.icon} />
                    <h3>{part.label}</h3>
                    <span>{items.length}</span>
                  </div>
                  <div className="body-workout-group-list">
                    {items.map((workout) => {
                      const link = safeExternalUrl(workout.youtubeUrl);
                      return (
                        <article key={workout.id} className={`body-workout-item${hasImage(workout) ? "" : " has-no-image"}`}>
                          <StoredImage image={workout} className="body-workout-item-image" alt={workout.title} />
                          <div className="body-workout-item-copy">
                            <h3>{workout.title || "이름 없는 운동"}</h3>
                            {workout.note ? (
                              <p className="body-workout-note">{workout.note}</p>
                            ) : (
                              <p className="body-workout-note is-muted">메모 없음</p>
                            )}
                          </div>
                          <div className="body-workout-actions">
                            {link && (
                              <a className="button button-secondary body-workout-link" href={link} target="_blank" rel="noreferrer noopener">
                                <Icon name="logo-youtube" />
                                <span>영상</span>
                              </a>
                            )}
                            <button className="button button-secondary body-workout-edit" type="button" onClick={() => startEditing(workout)}>
                              <Icon name="create-outline" />
                              <span>수정</span>
                            </button>
                            <button
                              className="button button-secondary body-workout-delete"
                              type="button"
                              onClick={() => removeWorkout(workout.id, "운동 메모가 삭제됐어요.")}
                            >
                              <Icon name="trash-outline" />
                              <span>삭제</span>
                            </button>
                          </div>
                        </article>
                      );
                    })}
                  </div>
                </section>
              );
            })
          )}
        </div>
      </section>
    </div>
  );
}
