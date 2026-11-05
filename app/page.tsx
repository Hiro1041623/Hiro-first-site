// ─────────────────────────────────────────────────────────
// トップページ（紹介ページ）: 見出し1つ・説明3行・ボタン1つ
// 内容は CLAUDE.md 1章「このサイトの前提」にそっています。
// 見た目は DESIGN.md 7章: app/dads-tokens.css の変数だけを使う。
// 業務画面（タスク整理ツール）は /tool（app/tool/page.tsx）にあります。
// ─────────────────────────────────────────────────────────
import "./dads-tokens.css";

// ボタンの行き先は未定のため、押せない状態にしている（CLAUDE.md 1章「ボタンの行き先」）
const BUTTON_HREF = "";

// 大学病院によくある検査室・診療科（一般的な例。実際の病院の一覧に合わせて差し替える）
const GROUPS = [
  {
    key: "exam",
    label: "検査室",
    items: [
      "MRI検査室",
      "CT検査室",
      "一般撮影（X線）室",
      "超音波検査室",
      "内視鏡検査室",
      "心臓カテーテル検査室",
      "核医学検査室",
      "生理機能検査室",
    ],
  },
  {
    key: "dept",
    label: "診療科",
    items: [
      "脳神経外科",
      "脳神経内科",
      "循環器内科",
      "心臓血管外科",
      "呼吸器内科",
      "消化器内科",
      "消化器外科",
      "整形外科",
      "腎臓内科",
      "放射線科",
      "麻酔科",
      "救急科",
    ],
  },
];

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
.intro-groups {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;
  margin: 0 0 2rem;
}
.intro h2 {
  font-size: var(--font-size-18);
  line-height: var(--line-height-140);
  color: var(--color-neutral-solid-gray-900);
  margin: 0 0 0.5rem;
  padding: 0 0 0.5rem;
  border-bottom: 0.0625rem solid var(--color-neutral-solid-gray-200);
}
.intro ul {
  list-style: none;
  margin: 0;
  padding: 0;
}
.intro li {
  font-size: var(--font-size-16);
  line-height: var(--line-height-175);
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
  .intro-groups { grid-template-columns: 1fr; }
}
`;

export default function Home() {
  return (
    <main className="intro">
      <style>{css}</style>
      <div className="intro-inner">
        <h1>検査室・診療科の一覧</h1>
        <div className="intro-groups">
          {GROUPS.map((g) => (
            <section key={g.label} aria-labelledby={`g-${g.key}`}>
              <h2 id={`g-${g.key}`}>{g.label}</h2>
              <ul>
                {g.items.map((i) => <li key={i}>{i}</li>)}
              </ul>
            </section>
          ))}
        </div>

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
