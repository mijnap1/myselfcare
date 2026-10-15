import { Icon } from "../../Icon";
import { GroomingItemsCard } from "./GroomingItemsCard";

export function SkinSidebar() {
  return (
    <aside className="sidebar">
      <section className="card info-card">
        <p className="section-kicker">
          <Icon name="bookmark-outline" />
          <span>Core Rules</span>
        </p>
        <h2>기본 규칙</h2>
        <ul className="rule-list">
          <li>레티놀 + 비타민C 같은 날 X</li>
          <li>클레이 날 = 레티놀 / 비타민C X</li>
          <li>오일 + 레티놀 화/금 OK</li>
          <li>에스트라는 항상 마지막, 필요할 때</li>
        </ul>
      </section>

      <section className="card info-card">
        <p className="section-kicker">
          <Icon name="water-outline" />
          <span>Morning Cleansing Guide</span>
        </p>
        <h2>아침 세안 가이드</h2>
        <div className="guide-block">
          <h3>물세안</h3>
          <ul className="guide-list">
            <li>전날 레티놀/클레이 했을 때</li>
            <li>피부가 건조하거나 예민할 때</li>
            <li>아침에 안 번들거릴 때</li>
          </ul>
        </div>
        <div className="guide-block">
          <h3>폼세안</h3>
          <ul className="guide-list">
            <li>T존 번들거림</li>
            <li>땀/피지 많을 때</li>
            <li>전날 크림을 많이 발랐을 때</li>
          </ul>
        </div>
      </section>

      <GroomingItemsCard />

      <section className="card info-card mini-card">
        <p className="section-kicker">
          <Icon name="sparkles-outline" />
          <span>Journal Mood</span>
        </p>
        <h2>오늘도 천천히</h2>
        <p className="mini-copy">완벽하게 지키는 것보다, 내 피부 반응을 기록하는 게 더 중요해요.</p>
      </section>
    </aside>
  );
}
