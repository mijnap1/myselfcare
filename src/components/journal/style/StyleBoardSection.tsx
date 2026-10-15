"use client";

import type { Draft } from "immer";
import { useRef, useState, type FormEvent } from "react";
import { SegmentIndicator } from "@/components/SegmentIndicator";
import { STYLE_CATEGORIES } from "@/lib/journal/constants";
import { createId, safeExternalUrl } from "@/lib/journal/format";
import type { JournalData, StyleCategory, StyleItem } from "@/lib/journal/types";
import { Icon } from "../../Icon";
import { useJournal } from "../JournalContext";
import { ImageDropZone } from "../shared/ImageDropZone";
import { hasImage, StoredImage } from "../shared/StoredImage";
import { commitImageDraft, useImageDraft } from "../shared/useImageDraft";
import { useRemoveWithUndo } from "../shared/useRemoveWithUndo";

const EMPTY_FORM = { title: "", link: "", note: "" };
const selectStyleItems = (draft: Draft<JournalData>) => draft.styleBoard.items;

export function StyleBoardSection() {
  const { data, update, userId, notify } = useJournal();
  const removeItem = useRemoveWithUndo(selectStyleItems);
  const [category, setCategory] = useState<StyleCategory>("outfit");
  const [form, setForm] = useState(EMPTY_FORM);
  const [editingId, setEditingId] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const image = useImageDraft();
  const formRef = useRef<HTMLFormElement>(null);
  const titleInputRef = useRef<HTMLInputElement>(null);
  const items = data.styleBoard.items;

  const startEditing = (item: StyleItem) => {
    setEditingId(item.id);
    setCategory(item.category);
    setForm({ title: item.title, link: item.link, note: item.note });
    image.loadExisting(item);
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

    const existing = items.find((item) => item.id === editingId);
    setIsSaving(true);
    try {
      const imageRef = await commitImageDraft(userId, image.draft, existing);
      const nextItem: StyleItem = {
        id: existing?.id ?? createId(),
        category,
        title,
        link: form.link.trim(),
        note: form.note.trim(),
        ...imageRef,
        addedAt: existing?.addedAt ?? new Date().toISOString(),
      };

      update((draft) => {
        const list = draft.styleBoard.items;
        const index = list.findIndex((item) => item.id === nextItem.id);
        if (index >= 0) {
          list[index] = nextItem;
        } else {
          list.unshift(nextItem);
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
    <>
      <section className="card style-hero">
        <p className="section-kicker">
          <Icon name="shirt-outline" />
          <span>Style Care</span>
        </p>
        <h2>Style board</h2>
        <p className="section-note">코디, 향수, 헤어스타일, 사고 싶은 아이템을 사진과 메모로 모아두는 개인 스타일 보드.</p>
      </section>

      <div className="style-grid">
        <section className="card style-card">
          <div className="body-card-head">
            <p className="section-kicker">
              <Icon name="add-circle-outline" />
              <span>{editingId ? "항목 수정" : "새 항목"}</span>
            </p>
            <h2>스타일 메모</h2>
          </div>
          <form ref={formRef} className="style-form" onSubmit={handleSubmit}>
            <div className="has-segment-indicator style-category-control" role="group" aria-label="Style category">
              <SegmentIndicator activeKey={category} />
              {STYLE_CATEGORIES.map((option) => (
                <button
                  key={option.value}
                  className={`style-category-button${category === option.value ? " is-active" : ""}`}
                  type="button"
                  aria-pressed={category === option.value}
                  onClick={() => setCategory(option.value)}
                >
                  {option.label}
                </button>
              ))}
            </div>

            <div className="style-form-grid">
              <label className="body-field">
                <span>제목</span>
                <input
                  ref={titleInputRef}
                  type="text"
                  placeholder="예: 봄 데일리 코디"
                  required
                  value={form.title}
                  onChange={(event) => setForm({ ...form, title: event.target.value })}
                />
              </label>
              <label className="body-field">
                <span>링크</span>
                <input
                  type="url"
                  inputMode="url"
                  placeholder="https://..."
                  value={form.link}
                  onChange={(event) => setForm({ ...form, link: event.target.value })}
                />
              </label>
            </div>

            <label className="body-field body-field-note">
              <span>메모</span>
              <textarea
                rows={4}
                placeholder="핏, 브랜드, 향 느낌, 저장 이유 등을 적어두세요."
                value={form.note}
                onChange={(event) => setForm({ ...form, note: event.target.value })}
              />
            </label>

            <ImageDropZone
              prefix="style"
              title="이미지 붙여넣기"
              description="코디 사진, 향수 이미지, 헤어스타일 레퍼런스를 붙여넣거나 클릭해서 업로드할 수 있어요."
              ariaLabel="Paste or upload style image"
              clearLabel="삭제"
              draft={image.draft}
              onFile={image.loadFile}
              onClear={image.clear}
            />

            <button className="button" type="submit" disabled={isSaving}>
              <Icon name="save-outline" />
              <span>{isSaving ? "저장 중..." : "저장"}</span>
            </button>
          </form>
        </section>

        <section className="card style-card">
          <div className="body-card-head">
            <p className="section-kicker">
              <Icon name="albums-outline" />
              <span>Library</span>
            </p>
            <h2>스타일 라이브러리</h2>
          </div>
          <div className="style-list">
            {items.length === 0 ? (
              <article className="style-empty">
                <Icon name="shirt-outline" />
                <div>
                  <strong>아직 스타일 메모가 없어요.</strong>
                  <p>코디, 향수, 헤어스타일, 사고 싶은 아이템을 이미지와 함께 저장해보세요.</p>
                </div>
              </article>
            ) : (
              STYLE_CATEGORIES.map((group) => {
                const groupItems = items.filter((item) => item.category === group.value);
                if (!groupItems.length) return null;
                return (
                  <section key={group.value} className="style-group">
                    <div className="style-group-head">
                      <Icon name={group.icon} />
                      <h3>{group.label}</h3>
                      <span>{groupItems.length}</span>
                    </div>
                    <div className="style-group-list">
                      {groupItems.map((item) => {
                        const link = safeExternalUrl(item.link);
                        return (
                          <article key={item.id} className={`style-item-card${hasImage(item) ? "" : " has-no-image"}`}>
                            <StoredImage image={item} className="style-item-image" alt={item.title} />
                            <div className="style-item-copy">
                              <h3>{item.title || "이름 없는 스타일"}</h3>
                              {item.note ? (
                                <p className="style-item-note">{item.note}</p>
                              ) : (
                                <p className="style-item-note is-muted">메모 없음</p>
                              )}
                            </div>
                            <div className="style-item-actions">
                              {link && (
                                <a className="button button-secondary style-item-link" href={link} target="_blank" rel="noreferrer noopener">
                                  <Icon name="open-outline" />
                                  <span>열기</span>
                                </a>
                              )}
                              <button className="button button-secondary style-item-edit" type="button" onClick={() => startEditing(item)}>
                                <Icon name="create-outline" />
                                <span>수정</span>
                              </button>
                              <button
                                className="button button-secondary style-item-delete"
                                type="button"
                                onClick={() => removeItem(item.id, "스타일 메모가 삭제됐어요.")}
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
    </>
  );
}
