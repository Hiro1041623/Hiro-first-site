// ─────────────────────────────────────────────────────────
// トップページ（紹介ページ）: 見出し1つ・説明3行・ボタン1つ
// 内容は CLAUDE.md 1章「このサイトの前提」にそっています。
// 見た目は DESIGN.md 7章: app/dads-tokens.css の変数だけを使う。
// 業務画面（タスク整理ツール）は /tool（app/tool/page.tsx）にあります。
// ─────────────────────────────────────────────────────────
import "./dads-tokens.css";

// ボタンの行き先は未定のため、押せない状態にしている（CLAUDE.md 1章「ボタンの行き先」）
const BUTTON_HREF = "";

const css = `
.intro {
  min-height: 100vh;
  background: var(--color-neutral-white);
  color: var(--color-neutral-solid-gray-800);
  font-family: var(--font-family-sans);
}
.intro-inner {
  max-width: 40rem;
  padding: 4rem 1rem;
  margin: 0 auto;
}
.intro h1 {
  font-size: var(--font-size-32);
  line-height: var(--line-height-140);
  color: var(--color-neutral-solid-gray-900);
  margin: 0 0 1.5rem;
}
.intro p {
  font-size: var(--font-size-16);
  line-height: var(--line-height-175);
  margin: 0 0 2rem;
}
.intro-btn {
  display: inline-block;
  font: inherit;
  font-size: var(--font-size-16);
  font-weight: 700;
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: var(--border-radius-8);
  background: var(--color-key-900);
  color: var(--color-neutral-white);
  text-decoration: none;
  cursor: pointer;
}
.intro-btn:focus-visible {
  outline: 0.25rem solid var(--color-neutral-black);
  outline-offset: 0.125rem;
  box-shadow: 0 0 0 0.125rem var(--color-primitive-yellow-300);
}
.intro-btn:disabled {
  background: var(--color-neutral-solid-gray-300);
  color: var(--color-neutral-white);
  cursor: not-allowed;
}
@media (max-width: 40rem) {
  .intro-inner { padding: 2.5rem 1rem; }
  .intro h1 { font-size: var(--font-size-26); }
}
`;

export default function Home() {
  return (
    <main className="intro">
      <style>{css}</style>
      <div className="intro-inner">
        <h1>検査室や先生への「ご都合確認」の連絡を、自動で</h1>

        <p>
          ICUに配属された新人の看護師のためのページです。
          <br />
          MRIの検査室や脳神経外科の先生に、空いている時間をたずねる連絡を自動で送れるようにします。
          <br />
          決まった予約は、関係者に共有できるようにします。いまは準備中です。
        </p>

        {BUTTON_HREF ? (
          <a className="intro-btn" href={BUTTON_HREF}>ご都合確認の連絡を送る</a>
        ) : (
          <button type="button" className="intro-btn" disabled>
            ご都合確認の連絡を送る（準備中）
          </button>
        )}
      </div>
    </main>
  );
}
