const fe = () => ({
  query: "",
  caseSensitive: !1,
  includeHidden: !1
}), ae = [
  { op: "contains", label: "содержит", needsValue: !0 },
  { op: "notContains", label: "не содержит", needsValue: !0 },
  { op: "equals", label: "равно", needsValue: !0 },
  { op: "notEquals", label: "не равно", needsValue: !0 },
  { op: "gt", label: "больше", needsValue: !0 },
  { op: "lt", label: "меньше", needsValue: !0 },
  { op: "exists", label: "заполнено", needsValue: !1 },
  { op: "missing", label: "пусто", needsValue: !1 }
], ge = "", Ce = ["Имя", "Модель", "Путь"];
function Oe(e, t) {
  return t === "Имя" ? e.name : t === "Модель" ? e.model : t === "Путь" ? e.path : e.props[t];
}
function ce(e) {
  const t = [e.name, e.model, e.path];
  for (const n in e.props) t.push(e.props[n]);
  return t;
}
function G(e) {
  const n = e.replace(/\s| /g, "").replace(",", ".").match(/-?\d+(\.\d+)?/);
  return n ? parseFloat(n[0]) : NaN;
}
function Y(e, t) {
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
      const l = G(e), i = G(t.value);
      return !Number.isFinite(l) || !Number.isFinite(i) ? !1 : t.op === "gt" ? l > i : l < i;
    }
    default:
      return !1;
  }
}
function Ne(e, t) {
  return t.key !== ge ? Y(Oe(e, t.key), t) : t.op === "missing" ? ce(e).every((n) => !Y(n, { ...t, op: "exists" })) : ce(e).some((n) => Y(n, t));
}
function A(e) {
  return e.op === "exists" || e.op === "missing" ? !0 : e.value.trim() === "" ? !1 : e.op === "gt" || e.op === "lt" ? Number.isFinite(G(e.value)) : !0;
}
function Te(e, t) {
  const n = t.filter(A);
  return n.length ? e.filter((s) => n.every((o) => Ne(s, o))) : e;
}
function Me(e) {
  const t = /* @__PURE__ */ new Set();
  for (const s of e) for (const o in s.props) t.add(o);
  const n = [...t].sort((s, o) => s.localeCompare(o, "ru"));
  return [...Ce, ...n];
}
const Ve = 8, je = 800, He = 400;
function le(e) {
  if (!e) return;
  const t = e.model;
  if (!(!t || typeof t != "object" || !("attachments" in t)))
    return t.project ?? t;
}
function me(e) {
  return le(e.app) ?? le(e.manager.activeApp);
}
function Ie(e, t) {
  const n = [{ title: "Проект", drawing: e }];
  return e.attachments.forEach((s) => {
    if (!t && s.hidden) return;
    const o = s.model;
    o && n.push({ title: s.name ?? "Вложение", drawing: o });
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
  const s = (o, l, i) => {
    if (i > Ve || n > je) return;
    n++;
    const m = Pe(o);
    if (m !== void 0) {
      l && (t[l] = m);
      return;
    }
    if (Array.isArray(o)) {
      for (let u = 0; u < o.length; u++) s(o[u], l + "[" + u + "]", i + 1);
      return;
    }
    if (!o || typeof o != "object") return;
    const v = o;
    if (v.$value !== void 0) {
      s(v.$value, l, i + 1);
      return;
    }
    for (const u in v)
      u.startsWith("$") || s(v[u], l ? l + "." + u : u, i + 1);
  };
  try {
    s(e.typedProperties(), "", 0);
  } catch {
  }
  return t;
}
function Ae(e, t, n) {
  const s = Q(e);
  for (const o in s) {
    const l = s[o], i = n ? l : l.toLowerCase(), m = n ? o : o.toLowerCase();
    if (i.includes(t) || m.includes(t)) return o + ": " + l;
  }
}
function Be(e, t, n) {
  const s = e.name ?? "";
  if ((n ? s : s.toLowerCase()).includes(t)) return "имя: " + s;
  const o = e.$path ?? "";
  if ((n ? o : o.toLowerCase()).includes(t)) return "путь: " + o;
  let l = "";
  try {
    l = e.typed?.name ?? "";
  } catch {
    l = "";
  }
  return l && (n ? l : l.toLowerCase()).includes(t) ? "тип: " + l : Ae(e, t, n);
}
async function he(e, t, n) {
  const s = Date.now(), o = t.query.trim(), l = t.caseSensitive ? o : o.toLowerCase(), i = [];
  let m = 0;
  if (!l) return { hits: i, scanned: 0, models: 0, elapsed: 0 };
  const v = Ie(e, t.includeHidden);
  for (const u of v) {
    const M = [];
    u.drawing.layers.forEach((k) => {
      M.push(k);
    });
    for (const k of M) {
      m++, m % He === 0 && (n?.(m, i.length, u.title), await de());
      const V = Be(k, l, t.caseSensitive);
      V && i.push({
        index: i.length,
        layer: k,
        name: k.name ?? "без имени",
        model: u.title,
        path: k.$path ?? "",
        match: V,
        props: {}
      });
    }
  }
  for (let u = 0; u < i.length; u++)
    i[u].props = Q(i[u].layer), u % 200 === 0 && (n?.(m, i.length, "чтение свойств"), await de());
  return n?.(m, i.length, ""), { hits: i, scanned: m, models: v.length, elapsed: Date.now() - s };
}
function de() {
  return new Promise((e) => setTimeout(e, 0));
}
const J = "Прочее", T = "Элемент";
function ve(e) {
  const t = e.indexOf("|");
  if (t > 0) return { group: e.slice(0, t), name: e.slice(t + 1) };
  const n = e.lastIndexOf(".");
  return n > 0 ? { group: e.slice(0, n), name: e.slice(n + 1) } : { group: J, name: e };
}
function ze(e) {
  const t = /* @__PURE__ */ new Map();
  t.set(T, [
    { key: "Имя", name: "Имя", value: e.name },
    { key: "Модель", name: "Модель", value: e.model },
    { key: "Путь", name: "Путь", value: e.path }
  ]);
  for (const s of Object.keys(e.props).sort((o, l) => o.localeCompare(l, "ru"))) {
    const { group: o, name: l } = ve(s), i = t.get(o), m = { key: s, name: l, value: e.props[s] };
    i ? i.push(m) : t.set(o, [m]);
  }
  const n = [...t.entries()].filter(([s]) => s !== T).sort((s, o) => s[0] === J ? 1 : o[0] === J ? -1 : s[0].localeCompare(o[0], "ru"));
  return [
    { group: T, rows: t.get(T) },
    ...n.map(([s, o]) => ({ group: s, rows: o }))
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
function be(e) {
  const t = e.cadview?.layer?.drawing;
  if (t) return t;
  const s = e.manager.activeWindow?.context?.layer;
  if (s?.drawing) return s.drawing;
  for (const o of e.manager.windows) {
    const i = o.context?.layer;
    if (i?.drawing) return i.drawing;
  }
}
function _e(e) {
  return be(e) !== void 0;
}
function R(e, t, n) {
  const s = be(e);
  return s ? (s.selectLayers(t, n), !0) : !1;
}
function ye(e) {
  return R(e, [], !1);
}
const we = "nashepo.info.search.v2", X = /* @__PURE__ */ new Set();
function ue(e) {
  for (const t of X) t(e);
}
function h(e) {
  return e.replace(/[&<>"]/g, (t) => t === "&" ? "&amp;" : t === "<" ? "&lt;" : t === ">" ? "&gt;" : "&quot;");
}
function De() {
  const e = fe();
  try {
    const t = localStorage.getItem(we);
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
function $(e) {
  try {
    localStorage.setItem(we, JSON.stringify(e));
  } catch {
  }
}
function Fe(e) {
  let t = e;
  for (; t; ) {
    const n = getComputedStyle(t).backgroundColor.match(/[\d.]+/g);
    if (n && n.length >= 3 && (n.length < 4 || Number(n[3]) > 0.1)) {
      const [s, o, l] = n.map(Number);
      return s * 0.299 + o * 0.587 + l * 0.114 > 140;
    }
    t = t.parentElement;
  }
  return !matchMedia("(prefers-color-scheme: dark)").matches;
}
function K(e, t) {
  const n = Fe(e.parentElement ?? e);
  e.style.colorScheme = n ? "light" : "dark", t.classList.toggle("theme-light", n), t.classList.toggle("theme-dark", !n);
}
function Ue(e, t, n, s) {
  const o = e.attachShadow ? e.shadowRoot || e.attachShadow({ mode: "open" }) : e, l = De();
  o.innerHTML = "<style>" + n + '</style><main class="app" id="app"><div class="query"><input id="query" type="search" placeholder="Значение, имя, GUID, что угодно" value="' + h(l.query) + '"><button class="primary" id="find">Найти</button></div><div class="options"><label><input id="case" type="checkbox"> учитывать регистр</label><label><input id="hidden" type="checkbox"> искать в скрытых</label></div><section class="block"><div class="block-head"><button class="fold" id="fold-conditions" aria-expanded="false">Условия отбора <span id="conditions-count"></span></button><button id="add-condition" title="Добавить условие">＋</button></div><div class="conditions" id="conditions" hidden></div></section><div class="bar"><button id="all">Подсветить все</button><button id="prev" title="Предыдущий элемент">←</button><button id="next" title="Следующий элемент">→</button><span class="spacer"></span><button id="reset">Снять</button></div><div class="status" id="status">Введите значение и нажмите «Найти».</div><div class="list" id="list"><div class="empty">Пока ничего не найдено</div></div><section class="block props-block"><div class="block-head"><button class="fold" id="fold-props" aria-expanded="true">Свойства элемента</button><input id="prop-filter" type="search" placeholder="фильтр свойств"></div><div class="props" id="props"><div class="empty">Выберите элемент в списке</div></div></section><div class="hint">Щелчок по строке подсвечивает элемент и переводит к нему камеру. Версия ' + h(s) + "</div></main>";
  const i = o.querySelector("#app"), m = o.querySelector("#query"), v = o.querySelector("#case"), u = o.querySelector("#hidden"), M = o.querySelector("#find"), k = o.querySelector("#all"), V = o.querySelector("#prev"), Z = o.querySelector("#next"), xe = o.querySelector("#reset"), ee = o.querySelector("#status"), j = o.querySelector("#list"), L = o.querySelector("#conditions"), ke = o.querySelector("#conditions-count"), Le = o.querySelector("#add-condition"), _ = o.querySelector("#fold-conditions"), te = o.querySelector("#fold-props"), H = o.querySelector("#props"), ne = o.querySelector("#prop-filter");
  v.checked = l.caseSensitive, u.checked = l.includeHidden, K(e, i);
  let x = [], p = [], w = [], Se = 1, S = -1, C = !1, O;
  function b(r, a = !1) {
    ee.textContent = r, ee.classList.toggle("error", a);
  }
  function D() {
    return { query: m.value, caseSensitive: v.checked, includeHidden: u.checked };
  }
  function B() {
    const r = p.length > 0;
    k.disabled = !r || C, V.disabled = !r || C, Z.disabled = !r || C, M.disabled = C;
  }
  function N() {
    const r = Me(x);
    if (ke.textContent = w.length ? "· " + w.length : "", !w.length) {
      L.innerHTML = '<div class="empty">Условий нет. Кнопка ＋ добавит условие по свойству.</div>';
      return;
    }
    const a = /* @__PURE__ */ new Map();
    for (const c of r) {
      const { group: d, name: f } = ve(c), g = ["Имя", "Модель", "Путь"].includes(c) ? T : d, y = g === T ? c : f, q = a.get(g);
      q ? q.push({ key: c, name: y }) : a.set(g, [{ key: c, name: y }]);
    }
    L.innerHTML = w.map((c) => {
      const d = ['<option value="">любое свойство</option>'].concat([...a.entries()].map(
        ([E, Ee]) => '<optgroup label="' + h(E) + '">' + Ee.map(
          (U) => '<option value="' + h(U.key) + '"' + (U.key === c.key ? " selected" : "") + ">" + h(U.name) + "</option>"
        ).join("") + "</optgroup>"
      )).join(""), f = ae.map(
        (E) => '<option value="' + E.op + '"' + (E.op === c.op ? " selected" : "") + ">" + E.label + "</option>"
      ).join(""), g = ae.find((E) => E.op === c.op)?.needsValue ?? !0, y = c.op === "gt" || c.op === "lt", q = g && !A(c), ie = q ? y && c.value.trim() !== "" ? "нужно число" : "введите значение" : "";
      return '<div class="condition' + (q ? " waiting" : "") + '" data-id="' + c.id + '"><select class="cond-key">' + d + '</select><select class="cond-op">' + f + '</select><input class="cond-value" type="search" placeholder="' + (y ? "число" : "значение") + '" value="' + h(c.value) + '"' + (g ? "" : " disabled") + '><button class="cond-remove" title="Удалить условие">×</button>' + (ie ? '<div class="cond-hint">' + ie + ", условие пока не применяется</div>" : "") + "</div>";
    }).join("");
  }
  function qe() {
    if (!p.length) {
      j.innerHTML = '<div class="empty">' + (x.length ? "Условия отбора не пропустили ни одного элемента" : "Пока ничего не найдено") + "</div>";
      return;
    }
    j.innerHTML = p.map(
      (r) => '<button class="row" data-index="' + r.index + '"><div class="name">' + h(r.name) + '</div><div class="meta"><span class="model">' + h(r.model) + "</span><span>" + h(r.path) + '</span></div><div class="match">' + h(r.match) + "</div></button>"
    ).join("");
  }
  function I() {
    const r = O ?? p.find((f) => f.index === S);
    if (!r) {
      H.innerHTML = '<div class="empty">Выберите элемент в списке или в модели</div>';
      return;
    }
    const a = ne.value.trim().toLowerCase(), c = ze(r).map((f) => ({
      group: f.group,
      rows: a ? f.rows.filter((g) => g.name.toLowerCase().includes(a) || g.key.toLowerCase().includes(a) || g.value.toLowerCase().includes(a)) : f.rows
    })).filter((f) => f.rows.length);
    if (!c.length) {
      H.innerHTML = '<div class="empty">Ничего не подходит под фильтр</div>';
      return;
    }
    const d = O ? '<div class="props-note">Элемент выбран в модели</div>' : "";
    H.innerHTML = d + c.map(
      (f) => '<div class="prop-group"><div class="prop-group-name" title="' + h(f.group) + '">' + h(f.group) + '</div><table class="props-table"><tbody>' + f.rows.map(
        (g) => '<tr><th title="' + h(g.key) + '">' + h(g.name) + '</th><td title="' + h(g.value) + '">' + h(g.value) + "</td></tr>"
      ).join("") + "</tbody></table></div>"
    ).join("");
  }
  function P(r = !1) {
    if (p = Te(x, w), S = -1, qe(), I(), B(), r || !x.length) return;
    const a = w.filter(A).length;
    b(a ? "Найдено: " + x.length + ". После отбора по " + a + " условиям: " + p.length + "." : "Найдено: " + x.length + ".");
  }
  function z(r) {
    S = r, O = void 0, j.querySelectorAll(".row").forEach((a) => {
      a.classList.toggle("active", Number(a.dataset.index) === r);
    }), j.querySelector(".row.active")?.scrollIntoView({ block: "nearest" }), I();
  }
  function F(r) {
    if (r < 0 || r >= p.length) return;
    const a = p[r];
    if (!R(t, [a.layer], !0)) {
      b("Нет активного вида чертежа. Откройте окно проекта.", !0);
      return;
    }
    z(a.index), b("Элемент " + (r + 1) + " из " + p.length + ". " + a.model);
  }
  function oe() {
    return p.findIndex((r) => r.index === S);
  }
  async function re() {
    const r = D();
    if ($(r), !r.query.trim()) {
      b("Введите значение для поиска.", !0);
      return;
    }
    const a = me(t);
    if (!a) {
      b("Нет открытого проекта.", !0);
      return;
    }
    _e(t) || b("Нет активного вида чертежа. Поиск выполнится, но подсветка работать не будет."), C = !0, x = [], p = [], S = -1, B(), b("Поиск…");
    try {
      const c = await he(a, r, (d, f, g) => {
        b("Просмотрено " + d + ", найдено " + f + (g ? ". " + g : ""));
      });
      if (x = c.hits, N(), P(!0), !x.length)
        b("Ничего не найдено. Просмотрено слоёв: " + c.scanned + " в моделях: " + c.models + ".");
      else {
        const d = w.filter(A).length ? " После условий отбора: " + p.length + "." : "";
        b("Найдено: " + x.length + "." + d + " Просмотрено слоёв: " + c.scanned + " в моделях: " + c.models + " за " + Math.round(c.elapsed / 100) / 10 + " с.");
      }
    } catch (c) {
      b("Ошибка поиска: " + (c?.message ?? String(c)), !0);
    } finally {
      C = !1, B();
    }
  }
  M.addEventListener("click", () => {
    re();
  }), m.addEventListener("keydown", (r) => {
    r.key === "Enter" && re();
  }), v.addEventListener("change", () => $(D())), u.addEventListener("change", () => $(D())), k.addEventListener("click", () => {
    if (p.length) {
      if (!R(t, p.map((r) => r.layer), !0)) {
        b("Нет активного вида чертежа. Откройте окно проекта.", !0);
        return;
      }
      S = -1, z(-1), b("Подсвечено элементов: " + p.length + ".");
    }
  }), V.addEventListener("click", () => {
    if (!p.length) return;
    const r = oe();
    F(r <= 0 ? p.length - 1 : r - 1);
  }), Z.addEventListener("click", () => {
    if (!p.length) return;
    const r = oe();
    F(r >= p.length - 1 ? 0 : r + 1);
  }), xe.addEventListener("click", () => {
    ye(t), S = -1, z(-1), b("Выделение снято.");
  }), j.addEventListener("click", (r) => {
    const a = r.target.closest(".row");
    if (!a) return;
    const c = Number(a.dataset.index);
    F(p.findIndex((d) => d.index === c));
  }), Le.addEventListener("click", () => {
    w.push({ id: Se++, key: ge, op: "contains", value: "" }), L.hidden = !1, _.setAttribute("aria-expanded", "true"), N(), P();
  }), _.addEventListener("click", () => {
    const r = L.hidden;
    L.hidden = !r, _.setAttribute("aria-expanded", String(r)), r && N();
  }), te.addEventListener("click", () => {
    const r = H.hidden;
    H.hidden = !r, te.setAttribute("aria-expanded", String(r));
  }), ne.addEventListener("input", () => I()), L.addEventListener("click", (r) => {
    const a = r.target.closest(".cond-remove");
    if (!a) return;
    const c = Number(a.closest(".condition").dataset.id);
    w = w.filter((d) => d.id !== c), N(), P();
  }), L.addEventListener("change", (r) => {
    const a = r.target, c = a.closest(".condition");
    if (!c) return;
    const d = w.find((f) => f.id === Number(c.dataset.id));
    d && (a.classList.contains("cond-key") && (d.key = a.value), a.classList.contains("cond-op") && (d.op = a.value, N()), a.classList.contains("cond-value") && (d.value = a.value), P());
  }), L.addEventListener("input", (r) => {
    const a = r.target;
    if (!a.classList.contains("cond-value")) return;
    const c = a.closest(".condition");
    if (!c) return;
    const d = w.find((q) => q.id === Number(c.dataset.id));
    if (!d) return;
    d.value = a.value;
    const f = d.op === "gt" || d.op === "lt", g = !A(d);
    c.classList.toggle("waiting", g);
    let y = c.querySelector(".cond-hint");
    g ? (y || (y = document.createElement("div"), y.className = "cond-hint", c.appendChild(y)), y.textContent = (f && d.value.trim() !== "" ? "нужно число" : "введите значение") + ", условие пока не применяется") : y && y.remove(), P();
  });
  const se = (r) => {
    if (!e.isConnected) {
      X.delete(se);
      return;
    }
    if (!r.length) {
      if (!O) return;
      O = void 0, I();
      return;
    }
    const a = r[0], c = p.find((d) => d.layer === a);
    if (c) {
      z(c.index);
      return;
    }
    O = Re(a), I();
  };
  X.add(se), i.addEventListener("pointerdown", () => K(e, i)), setTimeout(() => K(e, i), 500), N(), B();
}
const Ye = ':host,.app{--bg: rgb(var(--v-theme-surface, 30 30 30));--fg: rgb(var(--v-theme-on-surface, 235 240 245));--muted: color-mix(in srgb, var(--fg) 55%, transparent);--line: color-mix(in srgb, var(--fg) 18%, transparent);--soft: color-mix(in srgb, var(--fg) 7%, transparent);--accent: #f2c94c;--accent-fg: #16191e}*{box-sizing:border-box}.app{display:flex;flex-direction:column;height:100%;min-height:0;gap:7px;padding:9px;background:var(--bg);font:13px/1.45 Ubuntu,system-ui,sans-serif;color:var(--fg)}.query{display:flex;gap:6px}input[type=search],input[type=text],select{min-width:0;padding:6px 8px;border:1px solid var(--line);border-radius:7px;background:var(--soft);color:inherit;font:inherit}.query input[type=search]{flex:1;padding:8px 10px}input[type=search]:focus,select:focus{outline:2px solid var(--accent);outline-offset:-1px}button{padding:6px 10px;border:1px solid var(--line);border-radius:7px;background:var(--soft);color:inherit;font:inherit;cursor:pointer;white-space:nowrap}button:hover:not(:disabled){border-color:var(--accent)}button:disabled{opacity:.45;cursor:default}button.primary{background:var(--accent);color:var(--accent-fg);border-color:transparent;font-weight:700}.options{display:flex;flex-wrap:wrap;gap:12px;color:var(--muted)}.options label{display:inline-flex;align-items:center;gap:5px}.block{border:1px solid var(--line);border-radius:8px}.block-head{display:flex;align-items:center;gap:6px;padding:4px 6px}.block-head .fold{flex:1;border:0;background:transparent;text-align:left;font-weight:600;padding:3px 2px}.block-head .fold:before{content:"▾ ";color:var(--muted)}.block-head .fold[aria-expanded=false]:before{content:"▸ "}.block-head input[type=search]{width:120px}.conditions{padding:0 6px 6px;display:flex;flex-direction:column;gap:5px}.condition{display:grid;grid-template-columns:minmax(0,1.3fr) minmax(0,.9fr) minmax(0,1fr) auto;gap:4px}.condition select,.condition input{font-size:12px}.condition.waiting select,.condition.waiting input{border-color:color-mix(in srgb,var(--accent) 60%,var(--line))}.cond-hint{grid-column:1 / -1;color:var(--muted);font-size:11px}.theme-dark{--popup-bg: #232323;--popup-fg: #edf1f6}.theme-light{--popup-bg: #ffffff;--popup-fg: #16191e}option{background-color:var(--popup-bg, #232323);color:var(--popup-fg, #edf1f6)}.bar{display:flex;align-items:center;gap:6px;flex-wrap:wrap}.bar .spacer{flex:1}.status{color:var(--muted);min-height:17px}.status.error{color:#ff6b6b}.list{flex:1 1 55%;min-height:90px;overflow:auto;border:1px solid var(--line);border-radius:8px}.row{display:block;width:100%;padding:6px 9px;border:0;border-bottom:1px solid var(--line);border-radius:0;background:transparent;text-align:left;cursor:pointer}.row:last-child{border-bottom:0}.row:hover{background:var(--soft)}.row.active{background:color-mix(in srgb,var(--accent) 22%,transparent)}.row .name{font-weight:600;word-break:break-word}.row .meta{display:flex;gap:6px;align-items:baseline;color:var(--muted);font-size:12px}.row .model{color:var(--accent)}.row .match{color:var(--muted);font-family:ui-monospace,Consolas,monospace;font-size:11px;word-break:break-all}.props-block{display:flex;flex-direction:column;flex:1 1 45%;min-height:90px}.props{flex:1;min-height:0;overflow:auto;padding:0 6px 6px}.props-note{padding:3px 5px;color:var(--accent);font-size:11px}.prop-group{margin-bottom:7px}.prop-group-name{padding:3px 5px;background:var(--soft);border-radius:5px;font-size:11px;font-weight:700;letter-spacing:.01em;overflow-wrap:anywhere}.props-table{width:100%;border-collapse:collapse;font-size:12px;table-layout:fixed}.props-table th,.props-table td{text-align:left;vertical-align:top;padding:3px 5px;border-bottom:1px solid var(--line);overflow-wrap:anywhere}.props-table th{width:42%;font-weight:500;color:var(--muted)}.empty{padding:14px;color:var(--muted);text-align:center}.hint{color:var(--muted);font-size:11px}', $e = "0.3.0", pe = "nashepo.info/search_panel";
function W(e) {
  return new Proxy(e, {
    get(t, n) {
      return n === "app" ? e.manager.activeApp : n === "cadview" ? e.manager.activeWindow?.context : Reflect.get(t, n);
    }
  });
}
const Ke = {
  /** Открыть панель поиска. */
  open(e) {
    e.manager.revealView(pe);
  },
  /** Смонтировать панель. */
  mount(e) {
    const t = e.el;
    if (!t) return;
    const n = document.createElement("div");
    n.style.height = "100%", t.replaceChildren(n), Ue(n, W(e), Ye, $e);
  },
  /** Быстрый поиск: спросить значение и сразу подсветить все совпадения. */
  async quick(e) {
    const t = W(e), n = me(t);
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
    const o = { ...fe(), query: s }, l = e.beginProgress();
    l.indeterminate = !0, l.label = "Поиск по проекту";
    let i;
    try {
      i = await he(n, o, (v, u) => {
        l.details = "просмотрено " + v + ", найдено " + u;
      });
    } finally {
      e.endProgress(l);
    }
    if (!i.hits.length) {
      await e.showMessage("Ничего не найдено. Просмотрено слоёв: " + i.scanned + ".", "info");
      return;
    }
    const m = R(t, i.hits.map((v) => v.layer), !0);
    e.manager.revealView(pe), await e.showMessage(
      m ? "Найдено элементов: " + i.hits.length + ". Они подсвечены в модели." : "Найдено элементов: " + i.hits.length + ", но активного вида чертежа нет.",
      m ? "info" : "warning"
    );
  },
  /** Снять подсветку. */
  clear(e) {
    ye(W(e));
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
      ue([]);
      return;
    }
    const s = [], o = /* @__PURE__ */ new Set();
    try {
      for (const l of n.selectedObjects()) {
        const i = l?.layer;
        i && !o.has(i) && (o.add(i), s.push(i));
      }
    } catch {
      return;
    }
    ue(s);
  }
};
export {
  Ke as default
};
