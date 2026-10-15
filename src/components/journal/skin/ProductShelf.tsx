"use client";

import type { Draft } from "immer";
import { useRef, useState, type FormEvent } from "react";
import { SegmentIndicator } from "@/components/SegmentIndicator";
import { PRODUCT_STATUSES, SKIN_SEASONS, SKIN_TYPES } from "@/lib/journal/constants";
import { createId, normalizeDecimalInput, safeExternalUrl } from "@/lib/journal/format";
import type { JournalData, ProductStatus, Season, SkinProduct, SkinType } from "@/lib/journal/types";
import { Icon } from "../../Icon";
import { useJournal } from "../JournalContext";
import { ImageDropZone } from "../shared/ImageDropZone";
import { StoredImage } from "../shared/StoredImage";
import { commitImageDraft, useImageDraft } from "../shared/useImageDraft";
import { useRemoveWithUndo } from "../shared/useRemoveWithUndo";

const EMPTY_FORM = { name: "", brand: "", category: "", price: "", link: "", note: "" };
const selectProducts = (draft: Draft<JournalData>) => draft.skinLibrary.products;

interface TargetCell {
  season: Season;
  skinType: SkinType;
}

function statusLabel(status: ProductStatus) {
  return PRODUCT_STATUSES.find((item) => item.value === status)?.label ?? "Interested";
}

export function ProductShelf() {
  const { data, update, userId, notify } = useJournal();
  const removeProduct = useRemoveWithUndo(selectProducts);
  const [target, setTarget] = useState<TargetCell>({ season: "spring", skinType: "combo" });
  const [status, setStatus] = useState<ProductStatus>("interested");
  const [form, setForm] = useState(EMPTY_FORM);
  const [editingId, setEditingId] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const image = useImageDraft();
  const formRef = useRef<HTMLFormElement>(null);
  const nameInputRef = useRef<HTMLInputElement>(null);

  const products = data.skinLibrary.products;
  const productsIn = (season: Season) =>
    products.filter((product) => product.season === season && product.skinType === target.skinType);
  const skinTypeLabel = SKIN_TYPES.find((item) => item.value === target.skinType)?.label ?? "";
  const seasonLabel = SKIN_SEASONS.find((item) => item.value === target.season)?.label ?? "";

  const startEditing = (product: SkinProduct) => {
    setEditingId(product.id);
    setTarget({ season: product.season, skinType: product.skinType });
    setStatus(product.status);
    setForm({
      name: product.name,
      brand: product.brand,
      category: product.category,
      price: product.price,
      link: product.link,
      note: product.note,
    });
    image.loadExisting(product);
    formRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    nameInputRef.current?.focus();
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const name = form.name.trim();
    if (!name) {
      nameInputRef.current?.reportValidity();
      return;
    }

    const existing = products.find((product) => product.id === editingId);
    setIsSaving(true);
    try {
      const imageRef = await commitImageDraft(userId, image.draft, existing);
      const nextProduct: SkinProduct = {
        id: existing?.id ?? createId(),
        name,
        brand: form.brand.trim(),
        category: form.category.trim(),
        price: normalizeDecimalInput(form.price),
        link: form.link.trim(),
        season: target.season,
        skinType: target.skinType,
        status,
        note: form.note.trim(),
        ...imageRef,
        addedAt: existing?.addedAt ?? new Date().toISOString(),
      };

      update((draft) => {
        const list = draft.skinLibrary.products;
        const index = list.findIndex((product) => product.id === nextProduct.id);
        if (index >= 0) {
          list[index] = nextProduct;
        } else {
          list.unshift(nextProduct);
        }
      });
      setForm(EMPTY_FORM);
      setEditingId("");
      setStatus("interested");
      image.clear();
    } catch {
      notify("이미지를 업로드하지 못했어요. 다시 시도해 주세요.");
    } finally {
      setIsSaving(false);
    }
  };

  const renderCard = (product: SkinProduct) => {
    const link = safeExternalUrl(product.link);
    return (
      <article key={product.id} className="skin-season-product-card">
        <StoredImage image={product} className="skin-season-product-image" alt={product.name} />
        <div className="skin-season-product-copy">
          <p className="summary-kicker">{statusLabel(product.status)}</p>
          <h3>{product.name || "Untitled product"}</h3>
          <p className="skin-product-meta">
            {[product.brand, product.category, product.price].filter(Boolean).join(" · ") || "No extra details"}
          </p>
          {product.note && <p className="skin-product-note">{product.note}</p>}
        </div>
        <div className="skin-product-card-actions" onClick={(event) => event.stopPropagation()}>
          {link && (
            <a className="button button-secondary skin-product-link-button" href={link} target="_blank" rel="noreferrer noopener">
              <Icon name="open-outline" />
              <span>Open</span>
            </a>
          )}
          <button className="button button-secondary skin-product-edit-button" type="button" onClick={() => startEditing(product)}>
            <Icon name="create-outline" />
            <span>Edit</span>
          </button>
          <button
            className="button button-secondary skin-product-delete-button"
            type="button"
            onClick={() => removeProduct(product.id, "제품이 삭제됐어요.")}
          >
            <Icon name="trash-outline" />
            <span>Delete</span>
          </button>
        </div>
      </article>
    );
  };

  const renderProducts = (season: Season) => {
    const list = productsIn(season);
    return list.length ? list.map(renderCard) : <p className="skin-season-empty">No products yet</p>;
  };

  return (
    <>
      <section className="card skin-products-hero">
        <div className="skin-products-hero-copy">
          <p className="section-kicker">
            <Icon name="bag-handle-outline" />
            <span>Product Shelf</span>
          </p>
          <h2>Seasonal skincare shelf</h2>
          <p className="section-note">
            피부 타입과 계절별로 제품을 나눠서 모아두고, 각 칸에 관심 제품이나 구매 후보를 이미지와 함께 정리할 수 있어요.
          </p>
        </div>
      </section>

      <section className="card skin-season-board-card">
        <div className="body-card-head">
          <p className="section-kicker">
            <Icon name="grid-outline" />
            <span>Season Table</span>
          </p>
          <h2>Season table</h2>
          <div className="has-segment-indicator skin-type-selector" aria-label="Skin type selector">
            <SegmentIndicator activeKey={target.skinType} />
            {SKIN_TYPES.map((skinType) => (
              <button
                key={skinType.value}
                className={`skin-type-button${target.skinType === skinType.value ? " is-active" : ""}`}
                type="button"
                aria-pressed={target.skinType === skinType.value}
                onClick={() => setTarget({ ...target, skinType: skinType.value })}
              >
                {skinType.label}
              </button>
            ))}
          </div>
        </div>
        <div className="skin-season-board-wrap">
          <div className="skin-season-board">
            <div className="skin-season-corner">선택한 피부타입</div>
            {SKIN_SEASONS.map((season) => (
              <div key={season.value} className="skin-season-header">
                <span>{season.label}</span>
                <Icon name={season.icon} />
              </div>
            ))}
            <div className="skin-season-row-label">{skinTypeLabel}</div>
            {SKIN_SEASONS.map((season) => (
              <div
                key={season.value}
                className={`skin-season-cell${target.season === season.value ? " is-active" : ""}`}
                onClick={() => setTarget({ ...target, season: season.value })}
              >
                <button
                  className="skin-season-cell-add"
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation();
                    setTarget({ ...target, season: season.value });
                    formRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
                  }}
                >
                  <Icon name="add-outline" />
                  <span>Add</span>
                </button>
                <div className="skin-season-cell-list">{renderProducts(season.value)}</div>
              </div>
            ))}
          </div>
        </div>
        <div className="skin-season-mobile-list">
          {SKIN_SEASONS.map((season) => (
            <section key={season.value} className="skin-season-mobile-card">
              <div className="skin-season-mobile-head">
                <div className="skin-season-mobile-title">
                  <span>{season.label}</span>
                  <Icon name={season.icon} />
                </div>
                <button
                  className="skin-season-mobile-add"
                  type="button"
                  onClick={() => {
                    setTarget({ ...target, season: season.value });
                    formRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
                  }}
                >
                  <Icon name="add-outline" />
                  <span>Add</span>
                </button>
              </div>
              <div className="skin-season-mobile-body">{renderProducts(season.value)}</div>
            </section>
          ))}
        </div>
      </section>

      <section className="card skin-product-form-card">
        <div className="body-card-head">
          <div>
            <p className="section-kicker">
              <Icon name="add-circle-outline" />
              <span>{editingId ? "Edit Product" : "Add Product"}</span>
            </p>
            <h2>Product entry</h2>
          </div>
          <p className="skin-product-target">
            {skinTypeLabel} · {seasonLabel}
          </p>
        </div>
        <form ref={formRef} className="skin-product-form" onSubmit={handleSubmit}>
          <div className="skin-product-form-grid">
            <label className="skin-product-field">
              <span>Product name</span>
              <input
                ref={nameInputRef}
                type="text"
                placeholder="예: Aestura 365 Cream"
                required
                value={form.name}
                onChange={(event) => setForm({ ...form, name: event.target.value })}
              />
            </label>
            <label className="skin-product-field">
              <span>Brand</span>
              <input
                type="text"
                placeholder="예: Aestura"
                value={form.brand}
                onChange={(event) => setForm({ ...form, brand: event.target.value })}
              />
            </label>
            <label className="skin-product-field">
              <span>Category</span>
              <input
                type="text"
                placeholder="예: Moisturizer"
                value={form.category}
                onChange={(event) => setForm({ ...form, category: event.target.value })}
              />
            </label>
            <label className="skin-product-field">
              <span>Price</span>
              <input
                type="text"
                inputMode="decimal"
                placeholder="예: 28.00"
                value={form.price}
                onChange={(event) => setForm({ ...form, price: event.target.value })}
              />
            </label>
            <label className="skin-product-field skin-product-field-wide">
              <span>Product link</span>
              <input
                type="url"
                inputMode="url"
                placeholder="https://..."
                value={form.link}
                onChange={(event) => setForm({ ...form, link: event.target.value })}
              />
            </label>
            <div className="skin-product-field skin-product-field-wide">
              <span>Status</span>
              <div className="has-segment-indicator product-status-control" role="group" aria-label="Product status">
                <SegmentIndicator activeKey={status} />
                {PRODUCT_STATUSES.map((option) => (
                  <button
                    key={option.value}
                    className={`product-status-button${status === option.value ? " is-active" : ""}`}
                    type="button"
                    aria-pressed={status === option.value}
                    onClick={() => setStatus(option.value)}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <label className="skin-product-field">
            <span>Notes</span>
            <textarea
              rows={4}
              placeholder="왜 관심 있는지, 성분이나 후기 메모 등을 적어두세요."
              value={form.note}
              onChange={(event) => setForm({ ...form, note: event.target.value })}
            />
          </label>
          <div className="skin-product-media-row">
            <ImageDropZone
              prefix="skin-product"
              title="Paste product image here"
              description="이미지를 복사한 다음 여기에 붙여넣거나 클릭해서 업로드할 수 있어요."
              ariaLabel="Paste or upload product image"
              clearLabel="Remove"
              draft={image.draft}
              onFile={image.loadFile}
              onClear={image.clear}
            />
          </div>
          <div className="skin-product-form-actions">
            <button className="button button-secondary" type="submit" disabled={isSaving}>
              <Icon name="save-outline" />
              <span>{isSaving ? "Saving..." : "Save product"}</span>
            </button>
          </div>
        </form>
      </section>
    </>
  );
}
