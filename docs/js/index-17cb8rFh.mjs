const oe = () => ({
  query: "",
  caseSensitive: !1,
  includeHidden: !1
}), Z = [
  { op: "contains", label: "содержит", needsValue: !0 },
  { op: "notContains", label: "не содержит", needsValue: !0 },
  { op: "equals", label: "равно", needsValue: !0 },
  { op: "notEquals", label: "не равно", needsValue: !0 },
  { op: "gt", label: "больше", needsValue: !0 },
  { op: "lt", label: "меньше", needsValue: !0 },
  { op: "exists", label: "заполнено", needsValue: !1 },
  { op: "missing", label: "пусто", needsValue: !1 }
], ie = "", ve = ["Имя", "Модель", "Путь"];
function be(e, t) {
  return t === "Имя" ? e.name : t === "Модель" ? e.model : t === "Путь" ? e.path : e.props[t];
}
function ee(e) {
  const t = [e.name, e.model, e.path];
  for (const n in e.props) t.push(e.props[n]);
  return t;
}
function K(e) {
  const n = e.replace(/\s| /g, "").replace(",", ".").match(/-?\d+(\.\d+)?/);
  return n ? parseFloat(n[0]) : NaN;
}
function _(e, t) {
  const n = e !== void 0 && e !== "";
  switch (t.op) {
    case "exists":
      return n;
    case "missing":
      return !n;
  }
  if (!n) return !1;
  const s = e.toLowerCase(), o = t.value.trim().toLowerCase();
  switch (t.op) {
    case "contains":
      return s.includes(o);
    case "notContains":
      return !s.includes(o);
    case "equals":
      return s === o;
    case "notEquals":
      return s !== o;
    case "gt":
    case "lt": {
      const a = K(e), l = K(t.value);
      return !Number.isFinite(a) || !Number.isFinite(l) ? !1 : t.op === "gt" ? a > l : a < l;
    }
    default:
      return !1;
  }
}
function ye(e, t) {
  return t.key !== ie ? _(be(e, t.key), t) : t.op === "missing" ? ee(e).every((n) => !_(n, { ...t, op: "exists" })) : ee(e).some((n) => _(n, t));
}
function I(e) {
  return e.op === "exists" || e.op === "missing" ? !0 : e.value.trim() === "" ? !1 : e.op === "gt" || e.op === "lt" ? Number.isFinite(K(e.value)) : !0;
}
function xe(e, t) {
  const n = t.filter(I);
  return n.length ? e.filter((s) => n.every((o) => ye(s, o))) : e;
}
function we(e) {
  const t = /* @__PURE__ */ new Set();
  for (const s of e) for (const o in s.props) t.add(o);
  const n = [...t].sort((s, o) => s.localeCompare(o, "ru"));
  return [...ve, ...n];
}
const ke = 8, Le = 800, qe = 400;
function te(e) {
  if (!e) return;
  const t = e.model;
  if (!(!t || typeof t != "object" || !("attachments" in t)))
    return t.project ?? t;
}
function se(e) {
  return te(e.app) ?? te(e.manager.activeApp);
}
function Se(e, t) {
  const n = [{ title: "Проект", drawing: e }];
  return e.attachments.forEach((s) => {
    if (!t && s.hidden) return;
    const o = s.model;
    o && n.push({ title: s.name ?? "Вложение", drawing: o });
  }), n;
}
function Ee(e) {
  if (e == null) return;
  const t = typeof e;
  if (t === "string") return e;
  if (t === "number" || t === "boolean") return String(e);
}
function ae(e) {
  const t = {};
  let n = 0;
  const s = (o, a, l) => {
    if (l > ke || n > Le) return;
    n++;
    const g = Ee(o);
    if (g !== void 0) {
      a && (t[a] = g);
      return;
    }
    if (Array.isArray(o)) {
      for (let d = 0; d < o.length; d++) s(o[d], a + "[" + d + "]", l + 1);
      return;
    }
    if (!o || typeof o != "object") return;
    const h = o;
    if (h.$value !== void 0) {
      s(h.$value, a, l + 1);
      return;
    }
    for (const d in h)
      d.startsWith("$") || s(h[d], a ? a + "." + d : d, l + 1);
  };
  try {
    s(e.typedProperties(), "", 0);
  } catch {
  }
  return t;
}
function Ce(e, t, n) {
  const s = ae(e);
  for (const o in s) {
    const a = s[o], l = n ? a : a.toLowerCase(), g = n ? o : o.toLowerCase();
    if (l.includes(t) || g.includes(t)) return o + ": " + a;
  }
}
function Ne(e, t, n) {
  const s = e.name ?? "";
  if ((n ? s : s.toLowerCase()).includes(t)) return "имя: " + s;
  const o = e.$path ?? "";
  if ((n ? o : o.toLowerCase()).includes(t)) return "путь: " + o;
  let a = "";
  try {
    a = e.typed?.name ?? "";
  } catch {
    a = "";
  }
  return a && (n ? a : a.toLowerCase()).includes(t) ? "тип: " + a : Ce(e, t, n);
}
async function le(e, t, n) {
  const s = Date.now(), o = t.query.trim(), a = t.caseSensitive ? o : o.toLowerCase(), l = [];
  let g = 0;
  if (!a) return { hits: l, scanned: 0, models: 0, elapsed: 0 };
  const h = Se(e, t.includeHidden);
  for (const d of h) {
    const N = [];
    d.drawing.layers.forEach((k) => {
      N.push(k);
    });
    for (const k of N) {
      g++, g % qe === 0 && (n?.(g, l.length, d.title), await ne());
      const O = Ne(k, a, t.caseSensitive);
      O && l.push({
        index: l.length,
        layer: k,
        name: k.name ?? "без имени",
        model: d.title,
        path: k.$path ?? "",
        match: O,
        props: {}
      });
    }
  }
  for (let d = 0; d < l.length; d++)
    l[d].props = ae(l[d].layer), d % 200 === 0 && (n?.(g, l.length, "чтение свойств"), await ne());
  return n?.(g, l.length, ""), { hits: l, scanned: g, models: h.length, elapsed: Date.now() - s };
}
function ne() {
  return new Promise((e) => setTimeout(e, 0));
}
function ce(e) {
  const t = e.cadview?.layer?.drawing;
  if (t) return t;
  const s = e.manager.activeWindow?.context?.layer;
  if (s?.drawing) return s.drawing;
  for (const o of e.manager.windows) {
    const l = o.context?.layer;
    if (l?.drawing) return l.drawing;
  }
}
function Oe(e) {
  return ce(e) !== void 0;
}
function P(e, t, n) {
  const s = ce(e);
  return s ? (s.selectLayers(t, n), !0) : !1;
}
function de(e) {
  return P(e, [], !1);
}
const ue = "nashepo.info.search.v2";
function b(e) {
  return e.replace(/[&<>"]/g, (t) => t === "&" ? "&amp;" : t === "<" ? "&lt;" : t === ">" ? "&gt;" : "&quot;");
}
function Ve() {
  const e = oe();
  try {
    const t = localStorage.getItem(ue);
    if (!t) return e;
    const n = JSON.parse(t);
    return {
      query: typeof n.query == "string" ? n.query : e.query,
      caseSensitive: n.caseSensitive === !0,
      includeHidden: n.includeHidden === !0
    };
  } catch {
    return e;
  }
}
function F(e) {
  try {
    localStorage.setItem(ue, JSON.stringify(e));
  } catch {
  }
}
function Te(e) {
  let t = e;
  for (; t; ) {
    const n = getComputedStyle(t).backgroundColor.match(/[\d.]+/g);
    if (n && n.length >= 3 && (n.length < 4 || Number(n[3]) > 0.1)) {
      const [s, o, a] = n.map(Number);
      return s * 0.299 + o * 0.587 + a * 0.114 > 140;
    }
    t = t.parentElement;
  }
  return !matchMedia("(prefers-color-scheme: dark)").matches;
}
function Y(e, t) {
  const n = Te(e.parentElement ?? e);
  e.style.colorScheme = n ? "light" : "dark", t.classList.toggle("theme-light", n), t.classList.toggle("theme-dark", !n);
}
function He(e, t, n, s) {
  const o = e.attachShadow ? e.shadowRoot || e.attachShadow({ mode: "open" }) : e, a = Ve();
  o.innerHTML = "<style>" + n + '</style><main class="app" id="app"><div class="query"><input id="query" type="search" placeholder="Значение, имя, GUID, что угодно" value="' + b(a.query) + '"><button class="primary" id="find">Найти</button></div><div class="options"><label><input id="case" type="checkbox"> учитывать регистр</label><label><input id="hidden" type="checkbox"> искать в скрытых</label></div><section class="block"><div class="block-head"><button class="fold" id="fold-conditions" aria-expanded="false">Условия отбора <span id="conditions-count"></span></button><button id="add-condition" title="Добавить условие">＋</button></div><div class="conditions" id="conditions" hidden></div></section><div class="bar"><button id="all">Подсветить все</button><button id="prev" title="Предыдущий элемент">←</button><button id="next" title="Следующий элемент">→</button><span class="spacer"></span><button id="reset">Снять</button></div><div class="status" id="status">Введите значение и нажмите «Найти».</div><div class="list" id="list"><div class="empty">Пока ничего не найдено</div></div><section class="block props-block"><div class="block-head"><button class="fold" id="fold-props" aria-expanded="true">Свойства элемента</button><input id="prop-filter" type="search" placeholder="фильтр свойств"></div><div class="props" id="props"><div class="empty">Выберите элемент в списке</div></div></section><div class="hint">Щелчок по строке подсвечивает элемент и переводит к нему камеру. Версия ' + b(s) + "</div></main>";
  const l = o.querySelector("#app"), g = o.querySelector("#query"), h = o.querySelector("#case"), d = o.querySelector("#hidden"), N = o.querySelector("#find"), k = o.querySelector("#all"), O = o.querySelector("#prev"), U = o.querySelector("#next"), pe = o.querySelector("#reset"), W = o.querySelector("#status"), V = o.querySelector("#list"), q = o.querySelector("#conditions"), fe = o.querySelector("#conditions-count"), ge = o.querySelector("#add-condition"), j = o.querySelector("#fold-conditions"), G = o.querySelector("#fold-props"), T = o.querySelector("#props"), J = o.querySelector("#prop-filter");
  h.checked = a.caseSensitive, d.checked = a.includeHidden, Y(e, l);
  let w = [], p = [], y = [], he = 1, S = -1, E = !1;
  function v(r, i = !1) {
    W.textContent = r, W.classList.toggle("error", i);
  }
  function B() {
    return { query: g.value, caseSensitive: h.checked, includeHidden: d.checked };
  }
  function M() {
    const r = p.length > 0;
    k.disabled = !r || E, O.disabled = !r || E, U.disabled = !r || E, N.disabled = E;
  }
  function C() {
    const r = we(w);
    if (fe.textContent = y.length ? "· " + y.length : "", !y.length) {
      q.innerHTML = '<div class="empty">Условий нет. Кнопка ＋ добавит условие по свойству.</div>';
      return;
    }
    q.innerHTML = y.map((i) => {
      const c = ['<option value="">любое свойство</option>'].concat(r.map(
        (L) => '<option value="' + b(L) + '"' + (L === i.key ? " selected" : "") + ">" + b(L) + "</option>"
      )).join(""), u = Z.map(
        (L) => '<option value="' + L.op + '"' + (L.op === i.op ? " selected" : "") + ">" + L.label + "</option>"
      ).join(""), f = Z.find((L) => L.op === i.op)?.needsValue ?? !0, m = i.op === "gt" || i.op === "lt", x = f && !I(i), A = x ? m && i.value.trim() !== "" ? "нужно число" : "введите значение" : "";
      return '<div class="condition' + (x ? " waiting" : "") + '" data-id="' + i.id + '"><select class="cond-key">' + c + '</select><select class="cond-op">' + u + '</select><input class="cond-value" type="search" placeholder="' + (m ? "число" : "значение") + '" value="' + b(i.value) + '"' + (f ? "" : " disabled") + '><button class="cond-remove" title="Удалить условие">×</button>' + (A ? '<div class="cond-hint">' + A + ", условие пока не применяется</div>" : "") + "</div>";
    }).join("");
  }
  function me() {
    if (!p.length) {
      V.innerHTML = '<div class="empty">' + (w.length ? "Условия отбора не пропустили ни одного элемента" : "Пока ничего не найдено") + "</div>";
      return;
    }
    V.innerHTML = p.map(
      (r) => '<button class="row" data-index="' + r.index + '"><div class="name">' + b(r.name) + '</div><div class="meta"><span class="model">' + b(r.model) + "</span><span>" + b(r.path) + '</span></div><div class="match">' + b(r.match) + "</div></button>"
    ).join("");
  }
  function z() {
    const r = p.find((f) => f.index === S);
    if (!r) {
      T.innerHTML = '<div class="empty">Выберите элемент в списке</div>';
      return;
    }
    const i = J.value.trim().toLowerCase(), c = [
      ["Имя", r.name],
      ["Модель", r.model],
      ["Путь", r.path]
    ];
    for (const f of Object.keys(r.props).sort((m, x) => m.localeCompare(x, "ru")))
      c.push([f, r.props[f]]);
    const u = i ? c.filter(([f, m]) => f.toLowerCase().includes(i) || m.toLowerCase().includes(i)) : c;
    if (!u.length) {
      T.innerHTML = '<div class="empty">Ничего не подходит под фильтр</div>';
      return;
    }
    T.innerHTML = '<table class="props-table"><tbody>' + u.map(
      ([f, m]) => '<tr><th title="' + b(f) + '">' + b(f) + '</th><td title="' + b(m) + '">' + b(m) + "</td></tr>"
    ).join("") + "</tbody></table>";
  }
  function H(r = !1) {
    if (p = xe(w, y), S = -1, me(), z(), M(), r || !w.length) return;
    const i = y.filter(I).length;
    v(i ? "Найдено: " + w.length + ". После отбора по " + i + " условиям: " + p.length + "." : "Найдено: " + w.length + ".");
  }
  function D(r) {
    S = r, V.querySelectorAll(".row").forEach((i) => {
      i.classList.toggle("active", Number(i.dataset.index) === r);
    }), V.querySelector(".row.active")?.scrollIntoView({ block: "nearest" }), z();
  }
  function R(r) {
    if (r < 0 || r >= p.length) return;
    const i = p[r];
    if (!P(t, [i.layer], !0)) {
      v("Нет активного вида чертежа. Откройте окно проекта.", !0);
      return;
    }
    D(i.index), v("Элемент " + (r + 1) + " из " + p.length + ". " + i.model);
  }
  function X() {
    return p.findIndex((r) => r.index === S);
  }
  async function Q() {
    const r = B();
    if (F(r), !r.query.trim()) {
      v("Введите значение для поиска.", !0);
      return;
    }
    const i = se(t);
    if (!i) {
      v("Нет открытого проекта.", !0);
      return;
    }
    Oe(t) || v("Нет активного вида чертежа. Поиск выполнится, но подсветка работать не будет."), E = !0, w = [], p = [], S = -1, M(), v("Поиск…");
    try {
      const c = await le(i, r, (u, f, m) => {
        v("Просмотрено " + u + ", найдено " + f + (m ? ". " + m : ""));
      });
      if (w = c.hits, C(), H(!0), !w.length)
        v("Ничего не найдено. Просмотрено слоёв: " + c.scanned + " в моделях: " + c.models + ".");
      else {
        const u = y.filter(I).length ? " После условий отбора: " + p.length + "." : "";
        v("Найдено: " + w.length + "." + u + " Просмотрено слоёв: " + c.scanned + " в моделях: " + c.models + " за " + Math.round(c.elapsed / 100) / 10 + " с.");
      }
    } catch (c) {
      v("Ошибка поиска: " + (c?.message ?? String(c)), !0);
    } finally {
      E = !1, M();
    }
  }
  N.addEventListener("click", () => {
    Q();
  }), g.addEventListener("keydown", (r) => {
    r.key === "Enter" && Q();
  }), h.addEventListener("change", () => F(B())), d.addEventListener("change", () => F(B())), k.addEventListener("click", () => {
    if (p.length) {
      if (!P(t, p.map((r) => r.layer), !0)) {
        v("Нет активного вида чертежа. Откройте окно проекта.", !0);
        return;
      }
      S = -1, D(-1), v("Подсвечено элементов: " + p.length + ".");
    }
  }), O.addEventListener("click", () => {
    if (!p.length) return;
    const r = X();
    R(r <= 0 ? p.length - 1 : r - 1);
  }), U.addEventListener("click", () => {
    if (!p.length) return;
    const r = X();
    R(r >= p.length - 1 ? 0 : r + 1);
  }), pe.addEventListener("click", () => {
    de(t), S = -1, D(-1), v("Выделение снято.");
  }), V.addEventListener("click", (r) => {
    const i = r.target.closest(".row");
    if (!i) return;
    const c = Number(i.dataset.index);
    R(p.findIndex((u) => u.index === c));
  }), ge.addEventListener("click", () => {
    y.push({ id: he++, key: ie, op: "contains", value: "" }), q.hidden = !1, j.setAttribute("aria-expanded", "true"), C(), H();
  }), j.addEventListener("click", () => {
    const r = q.hidden;
    q.hidden = !r, j.setAttribute("aria-expanded", String(r)), r && C();
  }), G.addEventListener("click", () => {
    const r = T.hidden;
    T.hidden = !r, G.setAttribute("aria-expanded", String(r));
  }), J.addEventListener("input", () => z()), q.addEventListener("click", (r) => {
    const i = r.target.closest(".cond-remove");
    if (!i) return;
    const c = Number(i.closest(".condition").dataset.id);
    y = y.filter((u) => u.id !== c), C(), H();
  }), q.addEventListener("change", (r) => {
    const i = r.target, c = i.closest(".condition");
    if (!c) return;
    const u = y.find((f) => f.id === Number(c.dataset.id));
    u && (i.classList.contains("cond-key") && (u.key = i.value), i.classList.contains("cond-op") && (u.op = i.value, C()), i.classList.contains("cond-value") && (u.value = i.value), H());
  }), q.addEventListener("input", (r) => {
    const i = r.target;
    if (!i.classList.contains("cond-value")) return;
    const c = i.closest(".condition");
    if (!c) return;
    const u = y.find((A) => A.id === Number(c.dataset.id));
    if (!u) return;
    u.value = i.value;
    const f = u.op === "gt" || u.op === "lt", m = !I(u);
    c.classList.toggle("waiting", m);
    let x = c.querySelector(".cond-hint");
    m ? (x || (x = document.createElement("div"), x.className = "cond-hint", c.appendChild(x)), x.textContent = (f && u.value.trim() !== "" ? "нужно число" : "введите значение") + ", условие пока не применяется") : x && x.remove(), H();
  }), l.addEventListener("pointerdown", () => Y(e, l)), setTimeout(() => Y(e, l), 500), C(), M();
}
const Ie = ':host,.app{--bg: rgb(var(--v-theme-surface, 30 30 30));--fg: rgb(var(--v-theme-on-surface, 235 240 245));--muted: color-mix(in srgb, var(--fg) 55%, transparent);--line: color-mix(in srgb, var(--fg) 18%, transparent);--soft: color-mix(in srgb, var(--fg) 7%, transparent);--accent: #f2c94c;--accent-fg: #16191e}*{box-sizing:border-box}.app{display:flex;flex-direction:column;height:100%;min-height:0;gap:7px;padding:9px;background:var(--bg);font:13px/1.45 Ubuntu,system-ui,sans-serif;color:var(--fg)}.query{display:flex;gap:6px}input[type=search],input[type=text],select{min-width:0;padding:6px 8px;border:1px solid var(--line);border-radius:7px;background:var(--soft);color:inherit;font:inherit}.query input[type=search]{flex:1;padding:8px 10px}input[type=search]:focus,select:focus{outline:2px solid var(--accent);outline-offset:-1px}button{padding:6px 10px;border:1px solid var(--line);border-radius:7px;background:var(--soft);color:inherit;font:inherit;cursor:pointer;white-space:nowrap}button:hover:not(:disabled){border-color:var(--accent)}button:disabled{opacity:.45;cursor:default}button.primary{background:var(--accent);color:var(--accent-fg);border-color:transparent;font-weight:700}.options{display:flex;flex-wrap:wrap;gap:12px;color:var(--muted)}.options label{display:inline-flex;align-items:center;gap:5px}.block{border:1px solid var(--line);border-radius:8px}.block-head{display:flex;align-items:center;gap:6px;padding:4px 6px}.block-head .fold{flex:1;border:0;background:transparent;text-align:left;font-weight:600;padding:3px 2px}.block-head .fold:before{content:"▾ ";color:var(--muted)}.block-head .fold[aria-expanded=false]:before{content:"▸ "}.block-head input[type=search]{width:120px}.conditions{padding:0 6px 6px;display:flex;flex-direction:column;gap:5px}.condition{display:grid;grid-template-columns:minmax(0,1.3fr) minmax(0,.9fr) minmax(0,1fr) auto;gap:4px}.condition select,.condition input{font-size:12px}.condition.waiting select,.condition.waiting input{border-color:color-mix(in srgb,var(--accent) 60%,var(--line))}.cond-hint{grid-column:1 / -1;color:var(--muted);font-size:11px}.theme-dark{--popup-bg: #232323;--popup-fg: #edf1f6}.theme-light{--popup-bg: #ffffff;--popup-fg: #16191e}option{background-color:var(--popup-bg, #232323);color:var(--popup-fg, #edf1f6)}.bar{display:flex;align-items:center;gap:6px;flex-wrap:wrap}.bar .spacer{flex:1}.status{color:var(--muted);min-height:17px}.status.error{color:#ff6b6b}.list{flex:1 1 55%;min-height:90px;overflow:auto;border:1px solid var(--line);border-radius:8px}.row{display:block;width:100%;padding:6px 9px;border:0;border-bottom:1px solid var(--line);border-radius:0;background:transparent;text-align:left;cursor:pointer}.row:last-child{border-bottom:0}.row:hover{background:var(--soft)}.row.active{background:color-mix(in srgb,var(--accent) 22%,transparent)}.row .name{font-weight:600;word-break:break-word}.row .meta{display:flex;gap:6px;align-items:baseline;color:var(--muted);font-size:12px}.row .model{color:var(--accent)}.row .match{color:var(--muted);font-family:ui-monospace,Consolas,monospace;font-size:11px;word-break:break-all}.props-block{display:flex;flex-direction:column;flex:1 1 45%;min-height:90px}.props{flex:1;min-height:0;overflow:auto;padding:0 6px 6px}.props-table{width:100%;border-collapse:collapse;font-size:12px;table-layout:fixed}.props-table th,.props-table td{text-align:left;vertical-align:top;padding:3px 5px;border-bottom:1px solid var(--line);overflow-wrap:anywhere}.props-table th{width:42%;font-weight:500;color:var(--muted)}.empty{padding:14px;color:var(--muted);text-align:center}.hint{color:var(--muted);font-size:11px}', Me = "0.2.1", re = "nashepo.info/search_panel";
function $(e) {
  return new Proxy(e, {
    get(t, n) {
      return n === "app" ? e.manager.activeApp : n === "cadview" ? e.manager.activeWindow?.context : Reflect.get(t, n);
    }
  });
}
const Ae = {
  /** Открыть панель поиска. */
  open(e) {
    e.manager.revealView(re);
  },
  /** Смонтировать панель. */
  mount(e) {
    const t = e.el;
    if (!t) return;
    const n = document.createElement("div");
    n.style.height = "100%", t.replaceChildren(n), He(n, $(e), Ie, Me);
  },
  /** Быстрый поиск: спросить значение и сразу подсветить все совпадения. */
  async quick(e) {
    const t = $(e), n = se(t);
    if (!n) {
      await e.showMessage("Нет открытого проекта.", "warning");
      return;
    }
    const s = await e.showInputBox({
      title: "Поиск по проекту",
      prompt: "Значение, имя, GUID или часть свойства",
      placeHolder: "Введите искомое значение"
    });
    if (!s || !s.trim()) return;
    const o = { ...oe(), query: s }, a = e.beginProgress();
    a.indeterminate = !0, a.label = "Поиск по проекту";
    let l;
    try {
      l = await le(n, o, (h, d) => {
        a.details = "просмотрено " + h + ", найдено " + d;
      });
    } finally {
      e.endProgress(a);
    }
    if (!l.hits.length) {
      await e.showMessage("Ничего не найдено. Просмотрено слоёв: " + l.scanned + ".", "info");
      return;
    }
    const g = P(t, l.hits.map((h) => h.layer), !0);
    e.manager.revealView(re), await e.showMessage(
      g ? "Найдено элементов: " + l.hits.length + ". Они подсвечены в модели." : "Найдено элементов: " + l.hits.length + ", но активного вида чертежа нет.",
      g ? "info" : "warning"
    );
  },
  /** Снять подсветку. */
  clear(e) {
    de($(e));
  }
};
export {
  Ae as default
};
