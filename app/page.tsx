// ─────────────────────────────────────────────────────────
// これは「業務アプリの画面」です。宣伝ページ（LP）ではありません。
//
// 今日の受け持ちのタスクを、優先度の順に並べ、
// 残り全部であと何分かかるかを出すツール（docs/03_spec.md）。
//
// 画面の骨格（この形は崩さない）:
//   左メニュー（.side）＋ 上部バー（.topbar）＋ 本体（.content）
//   一覧 / 新規登録 / 設定 の3画面を view で切り替える
// ─────────────────────────────────────────────────────────
"use client";

import { useEffect, useMemo, useState } from "react";

// ═══════════════════════════════════════════════════════════
//  画面の型 ── docs/03_spec.md「0. 画面の型」のとおり
//  ⚠ 新しいCSSは書かない。globals.css の選択肢から選ぶこと。
// ═══════════════════════════════════════════════════════════

/** 色み。医療・介護・公共 */
const TONE = "sea";

/** 密度。1勤務10〜25件程度を想定 */
const DENSITY = "normal";

/** 画面の型。区分（優先度）ごとに束ねる */
const LAYOUT: "queue" | "stage" | "due" = "stage";

/** 数え方 */
const UNIT = "件";

/** 優先度。この順番で一覧に並ぶ */
const CATEGORIES = ["すぐ", "時刻どおり", "合間に"];

// ═══════════════════════════════════════════════════════════

/** 1件のタスク。入力するのは5項目（done は状態） */
type Record = {
  id: string;
  task: string;      // やること
  bed: string;       // ベッド（患者名は入れない）
  priority: string;  // 優先度（CATEGORIES のどれか）
  time: string;      // 予定時刻 HH:MM（空でもよい）
  minutes: number;   // かかる時間（分）
  done: boolean;     // 済みか
};

type View = "list" | "new" | "settings";
type Filter = "open" | "done" | "all";

const KEY = "icu-task-data";
const NAME_KEY = "icu-task-appname";

/** 画面の言葉。ここを直せば画面じゅうの文言が揃って変わる */
const TEXT = {
  sub: "優先度の順に、今日やることが並びます",
  open: "残り",
  done: "済み",
  toTo: "済みにする",
  toBack: "残りに戻す",
  catLabel: "優先度",
  stat2: "残りの合計時間",
  headOpen: "残り（優先度の順）",
};

/** 分を「1時間35分」の形に */
const hm = (m: number) => {
  const h = Math.floor(m / 60);
  const r = m % 60;
  return h > 0 ? `${h}時間${r > 0 ? `${r}分` : ""}` : `${r}分`;
};

/** 並べ方: 優先度の順 → 予定時刻の早い順（時刻なしは後ろ） */
const order = (a: Record, b: Record) => {
  const p = CATEGORIES.indexOf(a.priority) - CATEGORIES.indexOf(b.priority);
  if (p !== 0) return p;
  return (a.time || "99:99").localeCompare(b.time || "99:99");
};

/**
 * 見本データ。一般的な ICU の業務の例。
 * ⚠ 実在の人名・病院名は使わない。患者はベッド番号だけで区別する
 */
const SAMPLE: Record[] = [
  { id: "s01", task: "人工呼吸器の設定と気道内圧の確認", bed: "3番", priority: "すぐ",       time: "09:00", minutes: 10, done: false },
  { id: "s02", task: "動脈ラインの波形とルートの確認",   bed: "5番", priority: "すぐ",       time: "09:10", minutes: 10, done: false },
  { id: "s03", task: "定時の抗菌薬投与",                 bed: "3番", priority: "時刻どおり", time: "10:00", minutes: 15, done: false },
  { id: "s04", task: "血液ガスの採血",                   bed: "5番", priority: "時刻どおり", time: "10:00", minutes: 10, done: false },
  { id: "s05", task: "体位変換",                         bed: "3番", priority: "時刻どおり", time: "11:00", minutes: 15, done: false },
  { id: "s06", task: "体位変換",                         bed: "5番", priority: "時刻どおり", time: "11:00", minutes: 15, done: false },
  { id: "s07", task: "鎮静スケールの評価",               bed: "5番", priority: "時刻どおり", time: "12:00", minutes: 5,  done: false },
  { id: "s08", task: "全身清拭",                         bed: "5番", priority: "合間に",     time: "",      minutes: 30, done: false },
  { id: "s09", task: "口腔ケア",                         bed: "3番", priority: "合間に",     time: "",      minutes: 15, done: false },
  { id: "s10", task: "看護記録の入力",                   bed: "3番", priority: "合間に",     time: "",      minutes: 20, done: false },
  { id: "s11", task: "申し送り内容の確認",               bed: "3番", priority: "すぐ",       time: "08:30", minutes: 10, done: true },
  { id: "s12", task: "輸液ポンプの残量確認",             bed: "5番", priority: "すぐ",       time: "08:40", minutes: 5,  done: true },
  { id: "s13", task: "バイタルサインの測定",             bed: "3番", priority: "時刻どおり", time: "08:45", minutes: 10, done: true },
  { id: "s14", task: "バイタルサインの測定",             bed: "5番", priority: "時刻どおり", time: "08:50", minutes: 10, done: true },
];

/** 一覧をどう束ねるか */
type Group = { key: string; label: string; items: Record[] };

function grouped(list: Record[], filter: Filter): Group[] {
  if (filter === "open") {
    // 優先度ごとに束ねる。CATEGORIES の順に並べ、中身が無い束は出さない
    return CATEGORIES.map((c) => ({
      key: c,
      label: c,
      items: list.filter((i) => i.priority === c),
    })).filter((g) => g.items.length > 0);
  }
  return [{ key: "all", label: filter === "done" ? TEXT.done : "すべて", items: list }];
}

const EMPTY_FORM = { task: "", bed: "", priority: CATEGORIES[0], time: "", minutes: "" };

export default function Home() {
  const [items, setItems] = useState<Record[]>([]);
  const [appName, setAppName] = useState("今日の受け持ちタスク");
  const [loaded, setLoaded] = useState(false);

  const [view, setView] = useState<View>("list");
  const [filter, setFilter] = useState<Filter>("open");
  const [q, setQ] = useState("");
  const [editing, setEditing] = useState<Record | null>(null);

  const [form, setForm] = useState(EMPTY_FORM);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      setItems(raw ? (JSON.parse(raw) as Record[]) : SAMPLE);
      const n = localStorage.getItem(NAME_KEY);
      if (n) setAppName(n);
    } catch {
      setItems(SAMPLE);
    }
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (!loaded) return;
    localStorage.setItem(KEY, JSON.stringify(items));
    localStorage.setItem(NAME_KEY, appName);
  }, [items, appName, loaded]);

  // 見本データのまま触っていない状態か（1件でも足す・消すと false になる）
  const isSample = items.length === SAMPLE.length && items.every((i) => i.id.startsWith("s"));

  const counts = useMemo(
    () => ({
      open: items.filter((i) => !i.done).length,
      done: items.filter((i) => i.done).length,
      all: items.length,
    }),
    [items]
  );

  /** 残りのタスクにかかる時間の合計（分） */
  const remaining = useMemo(
    () => items.filter((i) => !i.done).reduce((s, i) => s + (i.minutes || 0), 0),
    [items]
  );

  const shown = useMemo(() => {
    const k = q.trim().toLowerCase();
    return items
      .filter((i) => (filter === "all" ? true : filter === "open" ? !i.done : i.done))
      .filter((i) => !k || (i.task + i.bed + i.priority).toLowerCase().includes(k))
      .sort(order);
  }, [items, filter, q]);

  const groups = useMemo(() => grouped(shown, filter), [shown, filter]);

  const minutesNum = Number(form.minutes);
  const canSave = form.task.trim() !== "" && form.bed.trim() !== "" && minutesNum > 0;

  function resetForm() {
    setForm(EMPTY_FORM);
    setEditing(null);
  }

  function save() {
    if (!canSave) return;
    const data = {
      task: form.task.trim(),
      bed: form.bed.trim(),
      priority: form.priority,
      time: form.time,
      minutes: Math.round(minutesNum),
    };
    if (editing) {
      setItems(items.map((i) => (i.id === editing.id ? { ...i, ...data } : i)));
    } else {
      setItems([...items, { id: String(Date.now()), ...data, done: false }]);
    }
    resetForm();
    setView("list");
  }

  function startEdit(r: Record) {
    setEditing(r);
    setForm({ task: r.task, bed: r.bed, priority: r.priority, time: r.time, minutes: String(r.minutes) });
    setView("new");
  }

  const toggle = (id: string) => setItems(items.map((i) => (i.id === id ? { ...i, done: !i.done } : i)));
  const remove = (id: string) => setItems(items.filter((i) => i.id !== id));

  const NAV: { k: View; label: string; count?: number }[] = [
    { k: "list", label: "一覧", count: counts.open },
    { k: "new", label: "新規登録" },
    { k: "settings", label: "設定" },
  ];

  const titles: { [K in View]: [string, string] } = {
    list: ["一覧", TEXT.sub],
    new: [editing ? "編集" : "新規登録", "入力して保存すると、一覧の優先度の束に入ります"],
    settings: ["設定", "表示名の変更と、データの初期化"],
  };

  return (
    <div className="shell" data-tone={TONE} data-density={DENSITY}>
      {/* ───────── 左メニュー ───────── */}
      <nav className="side">
        <div className="side-brand">
          <div className="n">{appName}</div>
          <div className="s">この端末に保存</div>
        </div>
        <div className="side-label">メニュー</div>
        <div className="side-nav">
          {NAV.map((n) => (
            <button
              key={n.k}
              className="side-item"
              aria-current={view === n.k ? "page" : undefined}
              onClick={() => { if (n.k !== "new") resetForm(); setView(n.k); }}
            >
              {n.label}
              {typeof n.count === "number" && <span className="c">{n.count}</span>}
            </button>
          ))}
        </div>
        <div className="side-foot">患者名は入力せず、ベッド番号で管理します</div>
      </nav>

      {/* ───────── 本体 ───────── */}
      <div className="main">
        <header className="topbar">
          <span className="t">{titles[view][0]}</span>
          <span className="d">{titles[view][1]}</span>
          {view === "list" && (
            <span className="right">
              <button className="btn" onClick={() => { resetForm(); setView("new"); }}>新規登録</button>
            </span>
          )}
        </header>

        <div className="content">
          {/* ── 一覧 ── */}
          {view === "list" && (
            <>
              {isSample && (
                <div className="notice">
                  表示中のデータは<b>見本</b>です。そのまま触って試せます。
                  消したいときは、左メニューの<b>設定</b>から。
                </div>
              )}

              <div className="stats">
                <div className="stat"><div className="n accent">{counts.open}</div><div className="l">{TEXT.open}</div></div>
                <div className="stat"><div className="n">{hm(remaining)}</div><div className="l">{TEXT.stat2}</div></div>
                <div className="stat"><div className="n">{counts.all}</div><div className="l">全{UNIT}</div></div>
              </div>

              <div className="filters">
                <div className="search">
                  <input className="field" value={q} onChange={(e) => setQ(e.target.value)}
                    placeholder="やること・ベッド番号で検索" />
                </div>
                <div className="seg">
                  {(["open", "done", "all"] as Filter[]).map((f) => (
                    <button key={f} aria-pressed={filter === f} onClick={() => setFilter(f)}>
                      {f === "open" ? `${TEXT.open} ${counts.open}`
                        : f === "done" ? `${TEXT.done} ${counts.done}`
                        : `全部 ${counts.all}`}
                    </button>
                  ))}
                </div>
              </div>

              <div className="list">
                {shown.length === 0 ? (
                  <>
                    <div className="list-head">
                      {filter === "open" ? TEXT.headOpen : filter === "done" ? TEXT.done : "すべて"}
                      <span className="count">0 {UNIT}</span>
                    </div>
                    <div className="empty">
                      <div className="t">{q ? "見つかりませんでした" : "ここに表示するタスクがありません"}</div>
                      <div className="d">
                        {q ? "検索の言葉を変えてみてください。" : "右上の「新規登録」から追加できます。"}
                      </div>
                    </div>
                  </>
                ) : (
                  groups.map((g) => (
                    <div key={g.key}>
                      <div className="group-head">
                        {g.label}
                        <span className="count">
                          {g.items.length} {UNIT}・{hm(g.items.reduce((s, i) => s + (i.minutes || 0), 0))}
                        </span>
                      </div>
                      {g.items.map((r) => (
                        <div className="row" key={r.id}>
                          <div className="row-main">
                            <div className="row-title">{r.task}</div>
                            <div className="row-sub">ベッド {r.bed}</div>
                          </div>
                          <div className="row-meta">
                            <span className="badge">{r.minutes}分</span>
                            {filter !== "open" && <span className="badge">{r.priority}</span>}
                            <span className="row-time">{r.time || "時刻なし"}</span>
                            <button className="btn-ghost" onClick={() => startEdit(r)}>編集</button>
                            <button className="btn-ghost" onClick={() => toggle(r.id)}>
                              {r.done ? TEXT.toBack : TEXT.toTo}
                            </button>
                            <button className="btn-ghost danger-btn" onClick={() => remove(r.id)}>削除</button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ))
                )}
              </div>
              <p className="note">データはこの端末のブラウザにだけ保存されます。外部には送信されません。</p>
            </>
          )}

          {/* ── 新規登録・編集 ── */}
          {view === "new" && (
            <div className="panel">
              <div className="form-row">
                <label className="label" htmlFor="f-task">やること<span className="req">必須</span></label>
                <input id="f-task" className="field" value={form.task}
                  onChange={(e) => setForm({ ...form, task: e.target.value })}
                  onKeyDown={(e) => { if (e.key === "Enter") save(); }}
                  placeholder="例：体位変換" />
              </div>

              <div className="form-row">
                <div className="inline">
                  <div>
                    <label className="label" htmlFor="f-bed">ベッド<span className="req">必須</span></label>
                    <input id="f-bed" className="field" value={form.bed}
                      onChange={(e) => setForm({ ...form, bed: e.target.value })}
                      placeholder="例：3番" />
                  </div>
                  <div>
                    <label className="label" htmlFor="f-pri">{TEXT.catLabel}</label>
                    <select id="f-pri" className="select" value={form.priority}
                      onChange={(e) => setForm({ ...form, priority: e.target.value })}>
                      {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
                    </select>
                  </div>
                </div>
                <span className="hint">患者名ではなく、ベッド番号で入力します</span>
              </div>

              <div className="form-row">
                <div className="inline">
                  <div>
                    <label className="label" htmlFor="f-time">予定時刻</label>
                    <input id="f-time" className="field" type="time" value={form.time}
                      onChange={(e) => setForm({ ...form, time: e.target.value })} />
                  </div>
                  <div>
                    <label className="label" htmlFor="f-min">かかる時間（分）<span className="req">必須</span></label>
                    <input id="f-min" className="field" type="number" min={1} inputMode="numeric"
                      value={form.minutes}
                      onChange={(e) => setForm({ ...form, minutes: e.target.value })}
                      placeholder="例：15" />
                  </div>
                </div>
                <span className="hint">時刻が決まっていないものは、予定時刻を空けておけます</span>
              </div>

              <div className="form-actions">
                <button className="btn" onClick={save} disabled={!canSave}>
                  {editing ? "保存する" : "一覧に追加"}
                </button>
                <button className="btn-ghost" onClick={() => { resetForm(); setView("list"); }}>やめる</button>
                <span className="spacer" />
                {editing && (
                  <button className="btn-ghost danger-btn"
                    onClick={() => { remove(editing.id); resetForm(); setView("list"); }}>
                    この1{UNIT}を削除
                  </button>
                )}
              </div>
            </div>
          )}

          {/* ── 設定 ── */}
          {view === "settings" && (
            <div className="panel">
              <div className="form-row">
                <label className="label" htmlFor="f-app">画面の表示名</label>
                <input id="f-app" className="field" value={appName}
                  onChange={(e) => setAppName(e.target.value)} />
                <span className="hint">左上に表示されます。変えるとすぐ反映されます</span>
              </div>

              <div className="form-row">
                <label className="label">データ</label>
                <div className="inline">
                  <button className="btn-ghost" onClick={() => setItems(SAMPLE)}>見本データを入れ直す</button>
                  <button className="btn-ghost danger-btn"
                    onClick={() => { if (confirm("全部消します。よろしいですか？")) setItems([]); }}>
                    全部消す
                  </button>
                </div>
                <span className="hint">
                  現在 {counts.all} {UNIT}（{TEXT.open} {counts.open} / {TEXT.done} {counts.done}）
                </span>
              </div>

              <p className="note">
                データはこの端末のブラウザにだけ保存されます。別の端末や他の人とは共有されません。
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
