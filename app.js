"use strict";

// ---------- ユーティリティ ----------
const teamById = Object.fromEntries(TEAMS.map(t => [t.id, t]));
const groupTeams = g => TEAMS.filter(t => t.group === g);
const groupMatches = g => MATCHES.filter(m => m.group === g);
const fmtDate = iso => {
  const [y, mo, d] = iso.split("-").map(Number);
  const dow = "日月火水木金土"[new Date(y, mo - 1, d).getDay()];
  return `${mo}/${d}(${dow})`;
};
const label = id => `${teamById[id].flag} ${teamById[id].ja}`;
const esc = s => s.replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

// ---------- 順位表計算 ----------
// extra: { matchId: [h, a] } 仮想結果(シナリオ計算用)
function computeTable(group, extra = {}) {
  const rows = {};
  groupTeams(group).forEach(t => {
    rows[t.id] = { id: t.id, pld: 0, w: 0, d: 0, l: 0, gf: 0, ga: 0, gd: 0, pts: 0 };
  });
  for (const m of groupMatches(group)) {
    const sc = m.score || extra[m.id];
    if (!sc) continue;
    const [hg, ag] = sc;
    const H = rows[m.home], A = rows[m.away];
    H.pld++; A.pld++;
    H.gf += hg; H.ga += ag; A.gf += ag; A.ga += hg;
    if (hg > ag) { H.w++; A.l++; H.pts += 3; }
    else if (hg < ag) { A.w++; H.l++; A.pts += 3; }
    else { H.d++; A.d++; H.pts++; A.pts++; }
  }
  const list = Object.values(rows);
  list.forEach(r => { r.gd = r.gf - r.ga; });
  list.sort((a, b) => b.pts - a.pts || b.gd - a.gd || b.gf - a.gf || a.id.localeCompare(b.id));
  return list;
}

// ---------- シナリオ全列挙 ----------
// 残り試合の勝敗(H勝/分/A勝)を全列挙し、各シナリオでの最終勝ち点を返す。
// 勝ち点が並んだ場合の順位は得失点差等で決まるため、ここでは
// 「最良順位(タイブレークを全て制す)」「最悪順位(全て落とす)」の両方を見る。
function enumerateScenarios(group) {
  const remaining = groupMatches(group).filter(m => !m.score);
  const base = {};
  computeTable(group).forEach(r => { base[r.id] = r.pts; });
  const scenarios = [];
  const n = remaining.length;
  const total = Math.pow(3, n);
  for (let code = 0; code < total; code++) {
    const pts = { ...base };
    const outcomes = {}; // matchId -> "H" | "D" | "A"
    let c = code;
    for (let i = 0; i < n; i++) {
      const o = c % 3; c = (c - o) / 3;
      const m = remaining[i];
      if (o === 0) { pts[m.home] += 3; outcomes[m.id] = "H"; }
      else if (o === 1) { pts[m.home] += 1; pts[m.away] += 1; outcomes[m.id] = "D"; }
      else { pts[m.away] += 3; outcomes[m.id] = "A"; }
    }
    scenarios.push({ pts, outcomes });
  }
  return { scenarios, remaining };
}

const rankBest = (id, pts) =>
  1 + Object.entries(pts).filter(([k, v]) => k !== id && v > pts[id]).length;
const rankWorst = (id, pts) =>
  1 + Object.entries(pts).filter(([k, v]) => k !== id && v >= pts[id]).length;

// シナリオ集合に対する判定
function judge(id, scenarios) {
  let allWorstTop2 = true, allBestTop2 = true, someBestTop2 = false,
      allBestBottom = true, someBestTop3 = false;
  for (const s of scenarios) {
    const rb = rankBest(id, s.pts), rw = rankWorst(id, s.pts);
    if (rw > 2) allWorstTop2 = false;
    if (rb > 2) allBestTop2 = false;
    if (rb <= 2) someBestTop2 = true;
    if (rb < 4) allBestBottom = false;
    if (rb <= 3) someBestTop3 = true;
  }
  return {
    qualified: allWorstTop2,        // 何があっても2位以内
    qualifiedOnGD: allBestTop2,     // 勝ち点上は2位以内確保(同点時は得失点差等次第)
    canTop2: someBestTop2,          // 2位以内の可能性が残る
    canThird: someBestTop3,         // 3位以内の可能性が残る
    lastEverywhere: allBestBottom,  // 全シナリオで最下位
  };
}

// チームの次の未消化試合
function nextMatchOf(id) {
  const t = teamById[id];
  return groupMatches(t.group)
    .filter(m => !m.score && (m.home === id || m.away === id))
    .sort((a, b) => a.date.localeCompare(b.date) || a.md - b.md)[0] || null;
}

// ---------- 突破条件の文章生成 ----------
function analyze(id) {
  const t = teamById[id];
  const { scenarios, remaining } = enumerateScenarios(t.group);
  const ownRemaining = remaining.filter(m => m.home === id || m.away === id);
  const overall = judge(id, scenarios);
  const table = computeTable(t.group);
  const pos = table.findIndex(r => r.id === id) + 1;
  const row = table[pos - 1];
  const played = row.pld > 0;
  const groupStarted = table.some(r => r.pld > 0);

  // ステータス判定
  let status, badge;
  if (overall.qualified) {
    status = "突破確定";
    badge = "ok";
  } else if (!overall.canTop2 && overall.canThird) {
    status = "3位突破に望み";
    badge = "warn";
  } else if (!overall.canTop2 && !overall.canThird) {
    status = "敗退決定";
    badge = "bad";
  } else if (overall.qualifiedOnGD) {
    status = "突破濃厚(得失点差次第)";
    badge = "ok";
  } else {
    status = ownRemaining.length === 3 && !groupStarted ? "開幕前" : "突破争い中";
    badge = "live";
  }

  const lines = [];

  if (!groupStarted) {
    lines.push(`グループ${t.group}はまだ開幕前です。${matchLine(ownRemaining[0])} が初戦になります。`);
    lines.push("各グループ上位2チームが決勝トーナメント(ラウンド32)に進出。さらに各グループ3位のうち成績上位8チーム(12組中)も進出します。");
    lines.push("2連勝すれば突破がほぼ確実、勝ち点6で文句なし。勝ち点4でも突破有力、勝ち点3〜2は3位での突破に懸かるラインです。");
  } else if (overall.qualified) {
    lines.push("グループ2位以内が確定しました。残り試合の結果にかかわらず決勝トーナメント進出です。🎉");
  } else if (!overall.canTop2 && overall.canThird) {
    lines.push("グループ2位以内の可能性は消滅しました。3位に入り、各グループ3位の成績上位8チームに残れば突破できます(他グループの結果次第)。");
  } else if (!overall.canTop2 && !overall.canThird) {
    lines.push("グループステージ敗退が決定しました。");
  } else {
    if (overall.qualifiedOnGD) {
      lines.push("勝ち点の上では2位以内をほぼ確保。同勝ち点で並ばれた場合のみ得失点差・総得点の勝負になります。");
    }
    // 自力突破の判定
    if (ownRemaining.length > 0) {
      const winAll = scenarios.filter(s =>
        ownRemaining.every(m => s.outcomes[m.id] === (m.home === id ? "H" : "A")));
      const jWin = judge(id, winAll);
      if (jWin.qualified) {
        lines.push(`残り${ownRemaining.length}試合に全て勝てば、他会場の結果にかかわらず突破が確定します(自力突破が可能)。`);
      } else if (jWin.qualifiedOnGD) {
        lines.push(`残り${ownRemaining.length}試合に全勝しても同勝ち点で並ぶ可能性があり、その場合は得失点差・総得点の勝負になります。`);
      } else if (jWin.canTop2) {
        lines.push("全勝しても自力では確定せず、他カードの結果次第です。");
      }
      // 引き分け以上で足りるか
      const drawPlus = scenarios.filter(s =>
        ownRemaining.every(m => {
          const o = s.outcomes[m.id];
          return o === "D" || o === (m.home === id ? "H" : "A");
        }));
      if (!jWin.qualified ? false : judge(id, drawPlus).qualified) {
        lines.push("残り試合は引き分け以上でも突破が確定します。");
      }
    }
  }

  // 次戦の勝ち・分け・負けシナリオ
  const next = nextMatchOf(id);
  let nextBlock = null;
  if (next && overall.canTop2 && !overall.qualified) {
    const oppId = next.home === id ? next.away : next.home;
    const cases = [];
    const defs = [
      ["勝った場合", next.home === id ? "H" : "A"],
      ["引き分けた場合", "D"],
      ["負けた場合", next.home === id ? "A" : "H"],
    ];
    for (const [labelTxt, oc] of defs) {
      const subset = scenarios.filter(s => s.outcomes[next.id] === oc);
      const j = judge(id, subset);
      let txt;
      if (j.qualified) txt = "その時点で突破確定 🎉";
      else if (j.qualifiedOnGD) txt = "勝ち点では2位以内を確保(同勝ち点なら得失点差次第)";
      else if (j.canTop2) txt = "突破の可能性あり(他の結果次第)";
      else if (j.canThird) txt = "2位以内は消滅、3位突破に懸ける";
      else txt = "敗退が決定";
      cases.push({ label: labelTxt, txt });
    }
    nextBlock = { match: next, opp: oppId, cases };
  }

  return { team: t, status, badge, lines, nextBlock, table, pos, groupStarted, remaining: ownRemaining };
}

function matchLine(m) {
  return `${fmtDate(m.date)} ${label(m.home)} vs ${label(m.away)}`;
}

// ---------- 3位比較表 ----------
function thirdPlaceTable() {
  const thirds = "ABCDEFGHIJKL".split("").map(g => {
    const r = computeTable(g)[2];
    return { ...r, group: g };
  });
  thirds.sort((a, b) => b.pts - a.pts || b.gd - a.gd || b.gf - a.gf);
  return thirds;
}

// ---------- 描画 ----------
const $ = sel => document.querySelector(sel);

function render(id) {
  const a = analyze(id);
  const t = a.team;
  document.title = `${t.ja}のGS突破条件 | 2026W杯`;

  $("#hero").innerHTML = `
    <div class="hero-flag">${t.flag}</div>
    <div class="hero-main">
      <div class="hero-name">${esc(t.ja)} <span class="hero-en">${esc(t.en)}</span></div>
      <div class="hero-meta">グループ${t.group} ・ 現在${a.groupStarted ? `${a.pos}位` : "開幕前"}</div>
    </div>
    <div class="badge badge-${a.badge}">${esc(a.status)}</div>`;

  $("#conditions").innerHTML = `
    <h2>📋 突破条件</h2>
    <ul>${a.lines.map(l => `<li>${esc(l)}</li>`).join("")}</ul>
    ${a.nextBlock ? renderNextBlock(a.nextBlock) : ""}`;

  $("#standings").innerHTML = renderStandings(a);
  $("#fixtures").innerHTML = renderFixtures(t);
  $("#thirds").innerHTML = renderThirds();
  location.hash = id;
  $("#search-input").value = "";
  closeDropdown();
}

function renderNextBlock(nb) {
  const m = nb.match;
  return `
    <div class="next-match">
      <div class="next-title">⚔️ 次戦: ${fmtDate(m.date)} vs ${label(nb.opp)} <span class="md">第${m.md}節・${esc(m.venue)}</span></div>
      <table class="case-table">
        ${nb.cases.map(c => `<tr><th>${esc(c.label)}</th><td>${esc(c.txt)}</td></tr>`).join("")}
      </table>
    </div>`;
}

function renderStandings(a) {
  const rows = a.table.map((r, i) => `
    <tr class="${r.id === a.team.id ? "me" : ""} ${i < 2 ? "q-zone" : i === 2 ? "t-zone" : ""}">
      <td>${i + 1}</td>
      <td class="team-cell">${label(r.id)}</td>
      <td>${r.pld}</td><td>${r.w}</td><td>${r.d}</td><td>${r.l}</td>
      <td>${r.gd > 0 ? "+" + r.gd : r.gd}</td><td class="pts">${r.pts}</td>
    </tr>`).join("");
  return `
    <h2>📊 グループ${a.team.group} 順位表</h2>
    <table class="standings">
      <thead><tr><th>#</th><th>チーム</th><th>試</th><th>勝</th><th>分</th><th>敗</th><th>得失</th><th>点</th></tr></thead>
      <tbody>${rows}</tbody>
    </table>
    <p class="legend"><span class="dot dot-q"></span>2位以内=突破 <span class="dot dot-t"></span>3位=各組3位の上位8チームなら突破</p>`;
}

function renderFixtures(t) {
  const rows = groupMatches(t.group).map(m => {
    const sc = m.score ? `${m.score[0]} - ${m.score[1]}` : "－";
    const mine = m.home === t.id || m.away === t.id;
    return `
      <tr class="${mine ? "me" : ""}">
        <td>第${m.md}節</td><td>${fmtDate(m.date)}</td>
        <td class="team-cell right">${label(m.home)}</td>
        <td class="score">${sc}</td>
        <td class="team-cell">${label(m.away)}</td>
      </tr>`;
  }).join("");
  return `<h2>🗓️ グループ${t.group} 日程・結果</h2>
    <table class="fixtures"><tbody>${rows}</tbody></table>`;
}

function renderThirds() {
  const anyPlayed = MATCHES.some(m => m.score);
  if (!anyPlayed) return "";
  const rows = thirdPlaceTable().map((r, i) => `
    <tr class="${i < 8 ? "q-zone" : ""}">
      <td>${i + 1}</td><td>${r.group}組</td>
      <td class="team-cell">${label(r.id)}</td>
      <td>${r.pld}</td><td>${r.gd > 0 ? "+" + r.gd : r.gd}</td><td class="pts">${r.pts}</td>
    </tr>`).join("");
  return `
    <h2>🥉 各グループ3位 成績比較(上位8チームが突破)</h2>
    <table class="standings">
      <thead><tr><th>#</th><th>組</th><th>チーム</th><th>試</th><th>得失</th><th>点</th></tr></thead>
      <tbody>${rows}</tbody>
    </table>`;
}

// ---------- 検索(コンボボックス) ----------
function buildDropdown(filter = "") {
  const q = filter.trim().toLowerCase();
  const groups = "ABCDEFGHIJKL".split("");
  let html = "";
  for (const g of groups) {
    const hits = groupTeams(g).filter(t =>
      !q || t.ja.includes(filter.trim()) || t.en.toLowerCase().includes(q) || t.id.toLowerCase().includes(q));
    if (!hits.length) continue;
    html += `<div class="dd-group">グループ ${g}</div>`;
    html += hits.map(t =>
      `<button class="dd-item" data-id="${t.id}" type="button">
         <span class="dd-flag">${t.flag}</span><span>${esc(t.ja)}</span><span class="dd-en">${esc(t.en)}</span>
       </button>`).join("");
  }
  $("#dropdown").innerHTML = html || `<div class="dd-empty">該当する国がありません</div>`;
}

function openDropdown() { $("#dropdown").classList.add("open"); }
function closeDropdown() { $("#dropdown").classList.remove("open"); }

function initSearch() {
  const input = $("#search-input");
  input.addEventListener("focus", () => { buildDropdown(input.value); openDropdown(); });
  input.addEventListener("input", () => { buildDropdown(input.value); openDropdown(); });
  input.addEventListener("keydown", e => {
    if (e.key === "Enter") {
      const first = $("#dropdown .dd-item");
      if (first) render(first.dataset.id);
    } else if (e.key === "Escape") closeDropdown();
  });
  $("#search-toggle").addEventListener("click", () => {
    const dd = $("#dropdown");
    if (dd.classList.contains("open")) closeDropdown();
    else { buildDropdown(""); openDropdown(); input.focus(); }
  });
  $("#dropdown").addEventListener("click", e => {
    const btn = e.target.closest(".dd-item");
    if (btn) render(btn.dataset.id);
  });
  document.addEventListener("click", e => {
    if (!e.target.closest(".searchbox")) closeDropdown();
  });
}

// ---------- 起動 ----------
window.addEventListener("hashchange", () => {
  const id = location.hash.replace("#", "").toUpperCase();
  if (teamById[id]) render(id);
});

initSearch();
$("#updated").textContent = `データ更新: ${DATA_UPDATED}`;
const initial = location.hash.replace("#", "").toUpperCase();
render(teamById[initial] ? initial : "JPN");
