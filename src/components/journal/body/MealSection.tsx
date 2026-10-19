"use client";

import type { Draft } from "immer";
import { useRef, useState, type FormEvent } from "react";
import { SegmentIndicator } from "@/components/SegmentIndicator";
import { MEAL_TYPES } from "@/lib/journal/constants";
import { createId, safeExternalUrl } from "@/lib/journal/format";
import type { JournalData, Meal, MealType } from "@/lib/journal/types";
import { Icon } from "../../Icon";
import { useJournal } from "../JournalContext";
import { ImageDropZone } from "../shared/ImageDropZone";
import { hasImage, StoredImage } from "../shared/StoredImage";
import { commitImageDraft, useImageDraft } from "../shared/useImageDraft";
import { useRemoveWithUndo } from "../shared/useRemoveWithUndo";

const EMPTY_FORM = { title: "", link: "", note: "" };
const selectMeals = (draft: Draft<JournalData>) => draft.bodyProgress.meals;

export function MealSection() {
  const { data, update, userId, notify } = useJournal();
  const removeMeal = useRemoveWithUndo(selectMeals);
  const [mealType, setMealType] = useState<MealType>("breakfast");
  const [form, setForm] = useState(EMPTY_FORM);
  const [editingId, setEditingId] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const image = useImageDraft();
  const formRef = useRef<HTMLFormElement>(null);
  const titleInputRef = useRef<HTMLInputElement>(null);
  const meals = data.bodyProgress.meals;

  const startEditing = (meal: Meal) => {
    setEditingId(meal.id);
    setMealType(meal.mealType);
    setForm({ title: meal.title, link: meal.link, note: meal.note });
    image.loadExisting(meal);
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

    const existing = meals.find((meal) => meal.id === editingId);
    setIsSaving(true);
    try {
      const imageRef = await commitImageDraft(userId, image.draft, existing);
      const nextMeal: Meal = {
        id: existing?.id ?? createId(),
        mealType,
        title,
        link: form.link.trim(),
        note: form.note.trim(),
        ...imageRef,
        addedAt: existing?.addedAt ?? new Date().toISOString(),
      };

      update((draft) => {
        const list = draft.bodyProgress.meals;
        const index = list.findIndex((meal) => meal.id === nextMeal.id);
        if (index >= 0) {
          list[index] = nextMeal;
        } else {
          list.unshift(nextMeal);
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
            <span>{editingId ? "식단 수정" : "식단 추가"}</span>
          </p>
          <h2>식단 메모</h2>
        </div>
        <form ref={formRef} className="body-workout-form" onSubmit={handleSubmit}>
          <div className="has-segment-indicator body-workout-parts body-meal-types" role="group" aria-label="Meal type">
            <SegmentIndicator activeKey={mealType} />
            {MEAL_TYPES.map((type) => (
              <button
                key={type.value}
                className={`body-part-button${mealType === type.value ? " is-active" : ""}`}
                type="button"
                aria-pressed={mealType === type.value}
                onClick={() => setMealType(type.value)}
              >
                {type.label}
              </button>
            ))}
          </div>

          <label className="body-field">
            <span>메뉴 이름</span>
            <input
              ref={titleInputRef}
              type="text"
              placeholder="예: 닭가슴살 현미 샐러드"
              required
              value={form.title}
              onChange={(event) => setForm({ ...form, title: event.target.value })}
            />
          </label>
          <label className="body-field">
            <span>레시피 링크</span>
            <input
              type="url"
              inputMode="url"
              placeholder="https://..."
              value={form.link}
              onChange={(event) => setForm({ ...form, link: event.target.value })}
            />
          </label>
          <label className="body-field body-field-note">
            <span>메모</span>
            <textarea
              rows={4}
              placeholder="재료, 양, 칼로리, 단백질 등을 적어두세요."
              value={form.note}
              onChange={(event) => setForm({ ...form, note: event.target.value })}
            />
          </label>

          <ImageDropZone
            prefix="body-workout"
            title="음식 사진 붙여넣기"
            description="식단 사진이나 레시피 캡처를 복사해서 붙여넣거나 클릭해서 업로드할 수 있어요."
            ariaLabel="Paste or upload meal image"
            clearLabel="삭제"
            draft={image.draft}
            onFile={image.loadFile}
            onClear={image.clear}
          />

          <button className="button" type="submit" disabled={isSaving}>
            <Icon name="save-outline" />
            <span>{isSaving ? "저장 중..." : "식단 저장"}</span>
          </button>
        </form>
      </section>

      <section className="card body-card body-workout-list-card">
        <div className="body-card-head">
          <p className="section-kicker">
            <Icon name="list-outline" />
            <span>Library</span>
          </p>
          <h2>식단 라이브러리</h2>
        </div>
        <div className="body-workout-list">
          {meals.length === 0 ? (
            <article className="body-workout-empty">
              <Icon name="restaurant-outline" />
              <div>
                <strong>아직 식단 메모가 없어요.</strong>
                <p>자주 먹는 메뉴, 레시피, 음식 사진을 저장해두면 나만의 식단 라이브러리가 됩니다.</p>
              </div>
            </article>
          ) : (
            MEAL_TYPES.map((type) => {
              const items = meals.filter((meal) => meal.mealType === type.value);
              if (!items.length) return null;
              return (
                <section key={type.value} className="body-workout-group">
                  <div className="body-workout-group-head">
                    <Icon name={type.icon} />
                    <h3>{type.label}</h3>
                    <span>{items.length}</span>
                  </div>
                  <div className="body-workout-group-list">
                    {items.map((meal) => {
                      const link = safeExternalUrl(meal.link);
                      return (
                        <article key={meal.id} className={`body-workout-item${hasImage(meal) ? "" : " has-no-image"}`}>
                          <StoredImage image={meal} className="body-workout-item-image" alt={meal.title} />
                          <div className="body-workout-item-copy">
                            <h3>{meal.title || "이름 없는 메뉴"}</h3>
                            {meal.note ? (
                              <p className="body-workout-note">{meal.note}</p>
                            ) : (
                              <p className="body-workout-note is-muted">메모 없음</p>
                            )}
                          </div>
                          <div className="body-workout-actions">
                            {link && (
                              <a className="button button-secondary body-workout-link" href={link} target="_blank" rel="noreferrer noopener">
                                <Icon name="open-outline" />
                                <span>레시피</span>
                              </a>
                            )}
                            <button className="button button-secondary body-workout-edit" type="button" onClick={() => startEditing(meal)}>
                              <Icon name="create-outline" />
                              <span>수정</span>
                            </button>
                            <button
                              className="button button-secondary body-workout-delete"
                              type="button"
                              onClick={() => removeMeal(meal.id, "식단 메모가 삭제됐어요.")}
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
