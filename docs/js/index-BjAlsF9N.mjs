const ge = () => ({
  query: "",
  caseSensitive: !1,
  includeHidden: !1
}), ce = [
  { op: "contains", label: "содержит", needsValue: !0 },
  { op: "notContains", label: "не содержит", needsValue: !0 },
  { op: "equals", label: "равно", needsValue: !0 },
  { op: "notEquals", label: "не равно", needsValue: !0 },
  { op: "gt", label: "больше", needsValue: !0 },
  { op: "lt", label: "меньше", needsValue: !0 },
  { op: "exists", label: "заполнено", needsValue: !1 },
  { op: "missing", label: "пусто", needsValue: !1 }
], he = "", Ce = ["Имя", "Модель", "Путь"];
function Oe(e, t) {
  return t === "Имя" ? e.name : t === "Модель" ? e.model : t === "Путь" ? e.path : e.props[t];
}
function le(e) {
  const t = [e.name, e.model, e.path];
  for (const n in e.props) t.push(e.props[n]);
  return t;
}
function W(e) {
  const n = e.replace(/\s| /g, "").replace(",", ".").match(/-?\d+(\.\d+)?/);
  return n ? parseFloat(n[0]) : NaN;
}
function U(e, t) {
  const n = e !== void 0 && e !== "";
  switch (t.op) {
    case "exists":
      return n;
    case "missing":
      return !n;
  }
  if (!n) return !1;
  const r = e.toLowerCase(), o = t.value.trim().toLowerCase();
  switch (t.op) {
    case "contains":
      return r.includes(o);
    case "notContains":
      return !r.includes(o);
    case "equals":
      return r === o;
    case "notEquals":
      return r !== o;
    case "gt":
    case "lt": {
      const i = W(e), a = W(t.value);
      return !Number.isFinite(i) || !Number.isFinite(a) ? !1 : t.op === "gt" ? i > a : i < a;
    }
    default:
      return !1;
  }
}
function Ne(e, t) {
  return t.key !== he ? U(Oe(e, t.key), t) : t.op === "missing" ? le(e).every((n) => !U(n, { ...t, op: "exists" })) : le(e).some((n) => U(n, t));
}
function z(e) {
  return e.op === "exists" || e.op === "missing" ? !0 : e.value.trim() === "" ? !1 : e.op === "gt" || e.op === "lt" ? Number.isFinite(W(e.value)) : !0;
}
function Me(e, t) {
  const n = t.filter(z);
  return n.length ? e.filter((r) => n.every((o) => Ne(r, o))) : e;
}
function Te(e) {
  const t = /* @__PURE__ */ new Set();
  for (const r of e) for (const o in r.props) t.add(o);
  const n = [...t].sort((r, o) => r.localeCompare(o, "ru"));
  return [...Ce, ...n];
}
const je = 8, Ve = 800, He = 400;
function de(e) {
  if (!e) return;
  const t = e.model;
  if (!(!t || typeof t != "object" || !("attachments" in t)))
    return t.project ?? t;
}
function me(e) {
  return de(e.app) ?? de(e.manager.activeApp);
}
function Ie(e, t) {
  const n = [{ title: "Проект", drawing: e }];
  return e.attachments.forEach((r) => {
    if (!t && r.hidden) return;
    const o = r.model;
    o && n.push({ title: r.name ?? "Вложение", drawing: o });
  }), n;
}
function Pe(e) {
  if (e == null) return;
  const t = typeof e;
  if (t === "string") return e;
  if (t === "number" || t === "boolean") return String(e);
}
function Q(e) {
  const t = {};
  let n = 0;
  const r = (o, i, a) => {
    if (a > je || n > Ve) return;
    n++;
    const p = Pe(o);
    if (p !== void 0) {
      i && (t[i] = p);
      return;
    }
    if (Array.isArray(o)) {
      for (let d = 0; d < o.length; d++) r(o[d], i + "[" + d + "]", a + 1);
      return;
    }
    if (!o || typeof o != "object") return;
    const m = o;
    if (m.$value !== void 0) {
      r(m.$value, i, a + 1);
      return;
    }
    for (const d in m)
      d.startsWith("$") || r(m[d], i ? i + "." + d : d, a + 1);
  };
  try {
    r(e.typedProperties(), "", 0);
  } catch {
  }
  return t;
}
function ze(e, t, n) {
  const r = Q(e);
  for (const o in r) {
    const i = r[o], a = n ? i : i.toLowerCase(), p = n ? o : o.toLowerCase();
    if (a.includes(t) || p.includes(t)) return o + ": " + i;
  }
}
function Ae(e, t, n) {
  const r = e.name ?? "";
  if ((n ? r : r.toLowerCase()).includes(t)) return "имя: " + r;
  const o = e.$path ?? "";
  if ((n ? o : o.toLowerCase()).includes(t)) return "путь: " + o;
  let i = "";
  try {
    i = e.typed?.name ?? "";
  } catch {
    i = "";
  }
  return i && (n ? i : i.toLowerCase()).includes(t) ? "тип: " + i : ze(e, t, n);
}
async function ve(e, t, n) {
  const r = Date.now(), o = t.query.trim(), i = t.caseSensitive ? o : o.toLowerCase(), a = [];
  let p = 0;
  if (!i) return { hits: a, scanned: 0, models: 0, elapsed: 0 };
  const m = Ie(e, t.includeHidden);
  for (const d of m) {
    const T = [];
    d.drawing.layers.forEach((k) => {
      T.push(k);
    });
    for (const k of T) {
      p++, p % He === 0 && (n?.(p, a.length, d.title), await ue());
      const j = Ae(k, i, t.caseSensitive);
      j && a.push({
        index: a.length,
        layer: k,
        name: k.name ?? "без имени",
        model: d.title,
        path: k.$path ?? "",
        match: j,
        props: {}
      });
    }
  }
  for (let d = 0; d < a.length; d++)
    a[d].props = Q(a[d].layer), d % 200 === 0 && (n?.(p, a.length, "чтение свойств"), await ue());
  return n?.(p, a.length, ""), { hits: a, scanned: p, models: m.length, elapsed: Date.now() - r };
}
function ue() {
  return new Promise((e) => setTimeout(e, 0));
}
const G = "Прочее", M = "Элемент";
function be(e) {
  const t = e.indexOf("|");
  if (t > 0) return { group: e.slice(0, t), name: e.slice(t + 1) };
  const n = e.lastIndexOf(".");
  return n > 0 ? { group: e.slice(0, n), name: e.slice(n + 1) } : { group: G, name: e };
}
function Be(e) {
  const t = /* @__PURE__ */ new Map();
  t.set(M, [
    { key: "Имя", name: "Имя", value: e.name },
    { key: "Модель", name: "Модель", value: e.model },
    { key: "Путь", name: "Путь", value: e.path }
  ]);
  for (const r of Object.keys(e.props).sort((o, i) => o.localeCompare(i, "ru"))) {
    const { group: o, name: i } = be(r), a = t.get(o), p = { key: r, name: i, value: e.props[r] };
    a ? a.push(p) : t.set(o, [p]);
  }
  const n = [...t.entries()].filter(([r]) => r !== M).sort((r, o) => r[0] === G ? 1 : o[0] === G ? -1 : r[0].localeCompare(o[0], "ru"));
  return [
    { group: M, rows: t.get(M) },
    ...n.map(([r, o]) => ({ group: r, rows: o }))
  ];
}
function Re(e) {
  let t = "";
  try {
    t = e.modelName ?? "";
  } catch {
    t = "";
  }
  return {
    name: e.name ?? "без имени",
    model: t,
    path: e.$path ?? "",
    props: Q(e)
  };
}
function Z(e) {
  if (e.cadview) return e.cadview;
  const t = e.manager.activeWindow?.context;
  if (t) return t;
  for (const n of e.manager.windows) {
    const r = n.context;
    if (r) return r;
  }
}
function _e(e) {
  return Z(e) !== void 0;
}
function De(e, t) {
  let n = e;
  for (let r = 0; n && r < 32; r++) {
    if (t.has(n)) return !0;
    n = n.layer;
  }
  return !1;
}
function J(e, t, n) {
  const r = Z(e);
  if (!r) return !1;
  const o = new Set(t), i = Math3d.box3.alloc(), a = Math3d.box3.alloc();
  let p = 0;
  if (r.layer.clearSelected(), o.size && r.layer.selectObjects((m) => {
    const d = m;
    return De(d?.layer, o) ? (d.qbounds && d.qbounds(a) && (p === 0 ? Math3d.box3.dup(i, a) : Math3d.box3.addBox(i, a), p++), !0) : !1;
  }, !0), p > 0)
    try {
      r.camera.zoom(i, r);
    } catch {
    }
  return r.invalidate(), !0;
}
function ye(e) {
  const t = Z(e);
  return t ? (t.layer.clearSelected(), t.invalidate(), !0) : !1;
}
const xe = "nashepo.info.search.v2", X = /* @__PURE__ */ new Set();
function pe(e) {
  for (const t of X) t(e);
}
function v(e) {
  return e.replace(/[&<>"]/g, (t) => t === "&" ? "&amp;" : t === "<" ? "&lt;" : t === ">" ? "&gt;" : "&quot;");
}
function Fe() {
  const e = ge();
  try {
    const t = localStorage.getItem(xe);
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
function Y(e) {
  try {
    localStorage.setItem(xe, JSON.stringify(e));
  } catch {
  }
}
function Ue(e) {
  let t = e;
  for (; t; ) {
    const n = getComputedStyle(t).backgroundColor.match(/[\d.]+/g);
    if (n && n.length >= 3 && (n.length < 4 || Number(n[3]) > 0.1)) {
      const [r, o, i] = n.map(Number);
      return r * 0.299 + o * 0.587 + i * 0.114 > 140;
    }
    t = t.parentElement;
  }
  return !matchMedia("(prefers-color-scheme: dark)").matches;
}
function $(e, t) {
  const n = Ue(e.parentElement ?? e);
  e.style.colorScheme = n ? "light" : "dark", t.classList.toggle("theme-light", n), t.classList.toggle("theme-dark", !n);
}
function Ye(e, t, n, r) {
  const o = e.attachShadow ? e.shadowRoot || e.attachShadow({ mode: "open" }) : e, i = Fe();
  o.innerHTML = "<style>" + n + '</style><main class="app" id="app"><div class="query"><input id="query" type="search" placeholder="Значение, имя, GUID, что угодно" value="' + v(i.query) + '"><button class="primary" id="find">Найти</button></div><div class="options"><label><input id="case" type="checkbox"> учитывать регистр</label><label><input id="hidden" type="checkbox"> искать в скрытых</label></div><section class="block"><div class="block-head"><button class="fold" id="fold-conditions" aria-expanded="false">Условия отбора <span id="conditions-count"></span></button><button id="add-condition" title="Добавить условие">＋</button></div><div class="conditions" id="conditions" hidden></div></section><div class="bar"><button id="all">Подсветить все</button><button id="prev" title="Предыдущий элемент">←</button><button id="next" title="Следующий элемент">→</button><span class="spacer"></span><button id="reset">Снять</button></div><div class="status" id="status">Введите значение и нажмите «Найти».</div><div class="list" id="list"><div class="empty">Пока ничего не найдено</div></div><section class="block props-block"><div class="block-head"><button class="fold" id="fold-props" aria-expanded="true">Свойства элемента</button><input id="prop-filter" type="search" placeholder="фильтр свойств"></div><div class="props" id="props"><div class="empty">Выберите элемент в списке</div></div></section><div class="hint">Щелчок по строке подсвечивает элемент и переводит к нему камеру. Версия ' + v(r) + "</div></main>";
  const a = o.querySelector("#app"), p = o.querySelector("#query"), m = o.querySelector("#case"), d = o.querySelector("#hidden"), T = o.querySelector("#find"), k = o.querySelector("#all"), j = o.querySelector("#prev"), ee = o.querySelector("#next"), we = o.querySelector("#reset"), te = o.querySelector("#status"), V = o.querySelector("#list"), L = o.querySelector("#conditions"), ke = o.querySelector("#conditions-count"), Le = o.querySelector("#add-condition"), R = o.querySelector("#fold-conditions"), ne = o.querySelector("#fold-props"), H = o.querySelector("#props"), oe = o.querySelector("#prop-filter");
  m.checked = i.caseSensitive, d.checked = i.includeHidden, $(e, a);
  let w = [], f = [], x = [], Se = 1, S = -1, C = !1, O;
  function b(s, c = !1) {
    te.textContent = s, te.classList.toggle("error", c);
  }
  function _() {
    return { query: p.value, caseSensitive: m.checked, includeHidden: d.checked };
  }
  function A() {
    const s = f.length > 0;
    k.disabled = !s || C, j.disabled = !s || C, ee.disabled = !s || C, T.disabled = C;
  }
  function N() {
    const s = Te(w);
    if (ke.textContent = x.length ? "· " + x.length : "", !x.length) {
      L.innerHTML = '<div class="empty">Условий нет. Кнопка ＋ добавит условие по свойству.</div>';
      return;
    }
    const c = /* @__PURE__ */ new Map();
    for (const l of s) {
      const { group: u, name: g } = be(l), h = ["Имя", "Модель", "Путь"].includes(l) ? M : u, y = h === M ? l : g, q = c.get(h);
      q ? q.push({ key: l, name: y }) : c.set(h, [{ key: l, name: y }]);
    }
    L.innerHTML = x.map((l) => {
      const u = ['<option value="">любое свойство</option>'].concat([...c.entries()].map(
        ([E, Ee]) => '<optgroup label="' + v(E) + '">' + Ee.map(
          (F) => '<option value="' + v(F.key) + '"' + (F.key === l.key ? " selected" : "") + ">" + v(F.name) + "</option>"
        ).join("") + "</optgroup>"
      )).join(""), g = ce.map(
        (E) => '<option value="' + E.op + '"' + (E.op === l.op ? " selected" : "") + ">" + E.label + "</option>"
      ).join(""), h = ce.find((E) => E.op === l.op)?.needsValue ?? !0, y = l.op === "gt" || l.op === "lt", q = h && !z(l), ae = q ? y && l.value.trim() !== "" ? "нужно число" : "введите значение" : "";
      return '<div class="condition' + (q ? " waiting" : "") + '" data-id="' + l.id + '"><select class="cond-key">' + u + '</select><select class="cond-op">' + g + '</select><input class="cond-value" type="search" placeholder="' + (y ? "число" : "значение") + '" value="' + v(l.value) + '"' + (h ? "" : " disabled") + '><button class="cond-remove" title="Удалить условие">×</button>' + (ae ? '<div class="cond-hint">' + ae + ", условие пока не применяется</div>" : "") + "</div>";
    }).join("");
  }
  function qe() {
    if (!f.length) {
      V.innerHTML = '<div class="empty">' + (w.length ? "Условия отбора не пропустили ни одного элемента" : "Пока ничего не найдено") + "</div>";
      return;
    }
    V.innerHTML = f.map(
      (s) => '<button class="row" data-index="' + s.index + '"><div class="name">' + v(s.name) + '</div><div class="meta"><span class="model">' + v(s.model) + "</span><span>" + v(s.path) + '</span></div><div class="match">' + v(s.match) + "</div></button>"
    ).join("");
  }
  function I() {
    const s = O ?? f.find((g) => g.index === S);
    if (!s) {
      H.innerHTML = '<div class="empty">Выберите элемент в списке или в модели</div>';
      return;
    }
    const c = oe.value.trim().toLowerCase(), l = Be(s).map((g) => ({
      group: g.group,
      rows: c ? g.rows.filter((h) => h.name.toLowerCase().includes(c) || h.key.toLowerCase().includes(c) || h.value.toLowerCase().includes(c)) : g.rows
    })).filter((g) => g.rows.length);
    if (!l.length) {
      H.innerHTML = '<div class="empty">Ничего не подходит под фильтр</div>';
      return;
    }
    const u = O ? '<div class="props-note">Элемент выбран в модели</div>' : "";
    H.innerHTML = u + l.map(
      (g) => '<div class="prop-group"><div class="prop-group-name" title="' + v(g.group) + '">' + v(g.group) + '</div><table class="props-table"><tbody>' + g.rows.map(
        (h) => '<tr><th title="' + v(h.key) + '">' + v(h.name) + '</th><td title="' + v(h.value) + '">' + v(h.value) + "</td></tr>"
      ).join("") + "</tbody></table></div>"
    ).join("");
  }
  function P(s = !1) {
    if (f = Me(w, x), S = -1, qe(), I(), A(), s || !w.length) return;
    const c = x.filter(z).length;
    b(c ? "Найдено: " + w.length + ". После отбора по " + c + " условиям: " + f.length + "." : "Найдено: " + w.length + ".");
  }
  function B(s) {
    S = s, O = void 0, V.querySelectorAll(".row").forEach((c) => {
      c.classList.toggle("active", Number(c.dataset.index) === s);
    }), V.querySelector(".row.active")?.scrollIntoView({ block: "nearest" }), I();
  }
  function D(s) {
    if (s < 0 || s >= f.length) return;
    const c = f[s];
    if (!J(t, [c.layer])) {
      b("Нет активного вида чертежа. Откройте окно проекта.", !0);
      return;
    }
    B(c.index), b("Элемент " + (s + 1) + " из " + f.length + ". " + c.model);
  }
  function re() {
    return f.findIndex((s) => s.index === S);
  }
  async function se() {
    const s = _();
    if (Y(s), !s.query.trim()) {
      b("Введите значение для поиска.", !0);
      return;
    }
    const c = me(t);
    if (!c) {
      b("Нет открытого проекта.", !0);
      return;
    }
    _e(t) || b("Нет активного вида чертежа. Поиск выполнится, но подсветка работать не будет."), C = !0, w = [], f = [], S = -1, A(), b("Поиск…");
    try {
      const l = await ve(c, s, (u, g, h) => {
        b("Просмотрено " + u + ", найдено " + g + (h ? ". " + h : ""));
      });
      if (w = l.hits, N(), P(!0), !w.length)
        b("Ничего не найдено. Просмотрено слоёв: " + l.scanned + " в моделях: " + l.models + ".");
      else {
        const u = x.filter(z).length ? " После условий отбора: " + f.length + "." : "";
        b("Найдено: " + w.length + "." + u + " Просмотрено слоёв: " + l.scanned + " в моделях: " + l.models + " за " + Math.round(l.elapsed / 100) / 10 + " с.");
      }
    } catch (l) {
      b("Ошибка поиска: " + (l?.message ?? String(l)), !0);
    } finally {
      C = !1, A();
    }
  }
  T.addEventListener("click", () => {
    se();
  }), p.addEventListener("keydown", (s) => {
    s.key === "Enter" && se();
  }), m.addEventListener("change", () => Y(_())), d.addEventListener("change", () => Y(_())), k.addEventListener("click", () => {
    if (f.length) {
      if (!J(t, f.map((s) => s.layer))) {
        b("Нет активного вида чертежа. Откройте окно проекта.", !0);
        return;
      }
      S = -1, B(-1), b("Подсвечено элементов: " + f.length + ".");
    }
  }), j.addEventListener("click", () => {
    if (!f.length) return;
    const s = re();
    D(s <= 0 ? f.length - 1 : s - 1);
  }), ee.addEventListener("click", () => {
    if (!f.length) return;
    const s = re();
    D(s >= f.length - 1 ? 0 : s + 1);
  }), we.addEventListener("click", () => {
    ye(t), S = -1, B(-1), b("Выделение снято.");
  }), V.addEventListener("click", (s) => {
    const c = s.target.closest(".row");
    if (!c) return;
    const l = Number(c.dataset.index);
    D(f.findIndex((u) => u.index === l));
  }), Le.addEventListener("click", () => {
    x.push({ id: Se++, key: he, op: "contains", value: "" }), L.hidden = !1, R.setAttribute("aria-expanded", "true"), N(), P();
  }), R.addEventListener("click", () => {
    const s = L.hidden;
    L.hidden = !s, R.setAttribute("aria-expanded", String(s)), s && N();
  }), ne.addEventListener("click", () => {
    const s = H.hidden;
    H.hidden = !s, ne.setAttribute("aria-expanded", String(s));
  }), oe.addEventListener("input", () => I()), L.addEventListener("click", (s) => {
    const c = s.target.closest(".cond-remove");
    if (!c) return;
    const l = Number(c.closest(".condition").dataset.id);
    x = x.filter((u) => u.id !== l), N(), P();
  }), L.addEventListener("change", (s) => {
    const c = s.target, l = c.closest(".condition");
    if (!l) return;
    const u = x.find((g) => g.id === Number(l.dataset.id));
    u && (c.classList.contains("cond-key") && (u.key = c.value), c.classList.contains("cond-op") && (u.op = c.value, N()), c.classList.contains("cond-value") && (u.value = c.value), P());
  }), L.addEventListener("input", (s) => {
    const c = s.target;
    if (!c.classList.contains("cond-value")) return;
    const l = c.closest(".condition");
    if (!l) return;
    const u = x.find((q) => q.id === Number(l.dataset.id));
    if (!u) return;
    u.value = c.value;
    const g = u.op === "gt" || u.op === "lt", h = !z(u);
    l.classList.toggle("waiting", h);
    let y = l.querySelector(".cond-hint");
    h ? (y || (y = document.createElement("div"), y.className = "cond-hint", l.appendChild(y)), y.textContent = (g && u.value.trim() !== "" ? "нужно число" : "введите значение") + ", условие пока не применяется") : y && y.remove(), P();
  });
  const ie = (s) => {
    if (!e.isConnected) {
      X.delete(ie);
      return;
    }
    if (!s.length) {
      if (!O) return;
      O = void 0, I();
      return;
    }
    const c = s[0], l = f.find((u) => u.layer === c);
    if (l) {
      B(l.index);
      return;
    }
    O = Re(c), I();
  };
  X.add(ie), a.addEventListener("pointerdown", () => $(e, a)), setTimeout(() => $(e, a), 500), N(), A();
}
const $e = ':host,.app{--bg: rgb(var(--v-theme-surface, 30 30 30));--fg: rgb(var(--v-theme-on-surface, 235 240 245));--muted: color-mix(in srgb, var(--fg) 55%, transparent);--line: color-mix(in srgb, var(--fg) 18%, transparent);--soft: color-mix(in srgb, var(--fg) 7%, transparent);--accent: #f2c94c;--accent-fg: #16191e}*{box-sizing:border-box}.app{display:flex;flex-direction:column;height:100%;min-height:0;gap:7px;padding:9px;background:var(--bg);font:13px/1.45 Ubuntu,system-ui,sans-serif;color:var(--fg)}.query{display:flex;gap:6px}input[type=search],input[type=text],select{min-width:0;padding:6px 8px;border:1px solid var(--line);border-radius:7px;background:var(--soft);color:inherit;font:inherit}.query input[type=search]{flex:1;padding:8px 10px}input[type=search]:focus,select:focus{outline:2px solid var(--accent);outline-offset:-1px}button{padding:6px 10px;border:1px solid var(--line);border-radius:7px;background:var(--soft);color:inherit;font:inherit;cursor:pointer;white-space:nowrap}button:hover:not(:disabled){border-color:var(--accent)}button:disabled{opacity:.45;cursor:default}button.primary{background:var(--accent);color:var(--accent-fg);border-color:transparent;font-weight:700}.options{display:flex;flex-wrap:wrap;gap:12px;color:var(--muted)}.options label{display:inline-flex;align-items:center;gap:5px}.block{border:1px solid var(--line);border-radius:8px}.block-head{display:flex;align-items:center;gap:6px;padding:4px 6px}.block-head .fold{flex:1;border:0;background:transparent;text-align:left;font-weight:600;padding:3px 2px}.block-head .fold:before{content:"▾ ";color:var(--muted)}.block-head .fold[aria-expanded=false]:before{content:"▸ "}.block-head input[type=search]{width:120px}.conditions{padding:0 6px 6px;display:flex;flex-direction:column;gap:5px}.condition{display:grid;grid-template-columns:minmax(0,1.3fr) minmax(0,.9fr) minmax(0,1fr) auto;gap:4px}.condition select,.condition input{font-size:12px}.condition.waiting select,.condition.waiting input{border-color:color-mix(in srgb,var(--accent) 60%,var(--line))}.cond-hint{grid-column:1 / -1;color:var(--muted);font-size:11px}.theme-dark{--popup-bg: #232323;--popup-fg: #edf1f6;--popup-head: #2f2f2f}.theme-light{--popup-bg: #ffffff;--popup-fg: #16191e;--popup-head: #ececec}option{background-color:var(--popup-bg, #232323);color:var(--popup-fg, #edf1f6)}optgroup{background-color:var(--popup-head, #2f2f2f);color:var(--popup-fg, #edf1f6);font-weight:700;font-style:normal}.bar{display:flex;align-items:center;gap:6px;flex-wrap:wrap}.bar .spacer{flex:1}.status{color:var(--muted);min-height:17px}.status.error{color:#ff6b6b}.list{flex:1 1 55%;min-height:90px;overflow:auto;border:1px solid var(--line);border-radius:8px}.row{display:block;width:100%;padding:6px 9px;border:0;border-bottom:1px solid var(--line);border-radius:0;background:transparent;text-align:left;cursor:pointer}.row:last-child{border-bottom:0}.row:hover{background:var(--soft)}.row.active{background:color-mix(in srgb,var(--accent) 22%,transparent)}.row .name{font-weight:600;word-break:break-word}.row .meta{display:flex;gap:6px;align-items:baseline;color:var(--muted);font-size:12px}.row .model{color:var(--accent)}.row .match{color:var(--muted);font-family:ui-monospace,Consolas,monospace;font-size:11px;word-break:break-all}.props-block{display:flex;flex-direction:column;flex:1 1 45%;min-height:90px}.props{flex:1;min-height:0;overflow:auto;padding:0 6px 6px}.props-note{padding:3px 5px;color:var(--accent);font-size:11px}.prop-group{margin-bottom:7px}.prop-group-name{padding:3px 5px;background:var(--soft);border-radius:5px;font-size:11px;font-weight:700;letter-spacing:.01em;overflow-wrap:anywhere}.props-table{width:100%;border-collapse:collapse;font-size:12px;table-layout:fixed}.props-table th,.props-table td{text-align:left;vertical-align:top;padding:3px 5px;border-bottom:1px solid var(--line);overflow-wrap:anywhere}.props-table th{width:42%;font-weight:500;color:var(--muted)}.empty{padding:14px;color:var(--muted);text-align:center}.hint{color:var(--muted);font-size:11px}', Ke = "0.3.1", fe = "nashepo.info/search_panel";
function K(e) {
  return new Proxy(e, {
    get(t, n) {
      return n === "app" ? e.manager.activeApp : n === "cadview" ? e.manager.activeWindow?.context : Reflect.get(t, n);
    }
  });
}
const We = {
  /** Открыть панель поиска. */
  open(e) {
    e.manager.revealView(fe);
  },
  /** Смонтировать панель. */
  mount(e) {
    const t = e.el;
    if (!t) return;
    const n = document.createElement("div");
    n.style.height = "100%", t.replaceChildren(n), Ye(n, K(e), $e, Ke);
  },
  /** Быстрый поиск: спросить значение и сразу подсветить все совпадения. */
  async quick(e) {
    const t = K(e), n = me(t);
    if (!n) {
      await e.showMessage("Нет открытого проекта.", "warning");
      return;
    }
    const r = await e.showInputBox({
      title: "Поиск по проекту",
      prompt: "Значение, имя, GUID или часть свойства",
      placeHolder: "Введите искомое значение"
    });
    if (!r || !r.trim()) return;
    const o = { ...ge(), query: r }, i = e.beginProgress();
    i.indeterminate = !0, i.label = "Поиск по проекту";
    let a;
    try {
      a = await ve(n, o, (m, d) => {
        i.details = "просмотрено " + m + ", найдено " + d;
      });
    } finally {
      e.endProgress(i);
    }
    if (!a.hits.length) {
      await e.showMessage("Ничего не найдено. Просмотрено слоёв: " + a.scanned + ".", "info");
      return;
    }
    const p = J(t, a.hits.map((m) => m.layer));
    e.manager.revealView(fe), await e.showMessage(
      p ? "Найдено элементов: " + a.hits.length + ". Они подсвечены в модели." : "Найдено элементов: " + a.hits.length + ", но активного вида чертежа нет.",
      p ? "info" : "warning"
    );
  },
  /** Снять подсветку. */
  clear(e) {
    ye(K(e));
  },
  /**
   * Выделение в модели изменилось.
   *
   * Программа шлёт это событие при выборе элемента в 3D. Выбранные объекты
   * лежат в слое чертежа активного вида, а нужный нам слой элемента — в поле
   * layer каждого объекта. Так же читает выделение и штатная панель свойств.
   */
  selection_changed(e) {
    const n = (e.cadview ?? e.manager.activeWindow?.context)?.layer?.drawing;
    if (!n?.selectedObjects) {
      pe([]);
      return;
    }
    const r = [], o = /* @__PURE__ */ new Set();
    try {
      for (const i of n.selectedObjects()) {
        const a = i?.layer;
        a && !o.has(a) && (o.add(a), r.push(a));
      }
    } catch {
      return;
    }
    pe(r);
  }
};
export {
  We as default
};
