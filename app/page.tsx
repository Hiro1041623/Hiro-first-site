// ─────────────────────────────────────────────────────────
// トップページ（見出し1つ・説明3行・ボタン1つ）
// 内容は docs/01_customer.md の「はじめの3行」に合わせています。
//
// ※ 以前の業務ツールの骨組み（一覧／新規登録／設定）は git の履歴に残っています。
//   /build で業務ツールを作るときは、そちらを元に戻して使えます。
// ─────────────────────────────────────────────────────────

/** 色み。医療・介護・公共向けの "sea"（globals.css の [data-tone] から選ぶ） */
const TONE = "sea";

export default function Home() {
  return (
    <div className="app" data-tone={TONE} style={{ background: "var(--bg)" }}>
      <main className="app-body">
        <section className="panel">
          <h1
            style={{
              fontSize: "var(--t-2xl)",
              color: "var(--text)",
              margin: "0 0 var(--s5)",
              lineHeight: 1.4,
            }}
          >
            今日の受け持ち患者から、やるべきことと順番が分かる
          </h1>

          <p
            style={{
              fontSize: "var(--t-md)",
              color: "var(--text-sub)",
              lineHeight: 1.8,
              margin: "0 0 var(--s6)",
            }}
          >
            ICUに配属された、新人〜3年目の看護師のためのツールです。
            <br />
            本日担当する患者のカルテ情報から、やるべきケアやタスクを書き出します。
            <br />
            やる順番と、それぞれにかかる時間が分かります。
          </p>

          <button type="button" className="btn">
            今日のタスクを整理する
          </button>
        </section>
      </main>
    </div>
  );
}
