const Me = () => ({
  query: "",
  property: "",
  caseSensitive: !1,
  includeHidden: !1
}), ke = [
  { op: "contains", label: "содержит", needsValue: !0 },
  { op: "notContains", label: "не содержит", needsValue: !0 },
  { op: "equals", label: "равно", needsValue: !0 },
  { op: "notEquals", label: "не равно", needsValue: !0 },
  { op: "gt", label: "больше", needsValue: !0 },
  { op: "lt", label: "меньше", needsValue: !0 },
  { op: "exists", label: "заполнено", needsValue: !1 },
  { op: "missing", label: "пусто", needsValue: !1 }
], ae = "", Fe = ["Имя", "Модель", "Путь"];
function Ne(e, t) {
  return t === "Имя" ? e.name : t === "Модель" ? e.model : t === "Путь" ? e.path : e.props[t];
}
function Se(e) {
  const t = [e.name, e.model, e.path];
  for (const n in e.props) t.push(e.props[n]);
  return t;
}
function D(e) {
  const n = e.replace(/\s| /g, "").replace(",", ".").match(/-?\d+(\.\d+)?/);
  return n ? parseFloat(n[0]) : NaN;
}
function ee(e, t) {
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
      const l = D(e), a = D(t.value);
      return !Number.isFinite(l) || !Number.isFinite(a) ? !1 : t.op === "gt" ? l > a : l < a;
    }
    default:
      return !1;
  }
}
function De(e, t) {
  return t.key !== ae ? ee(Ne(e, t.key), t) : t.op === "missing" ? Se(e).every((n) => !ee(n, { ...t, op: "exists" })) : Se(e).some((n) => ee(n, t));
}
function F(e) {
  return e.op === "exists" || e.op === "missing" ? !0 : e.value.trim() === "" ? !1 : e.op === "gt" || e.op === "lt" ? Number.isFinite(D(e.value)) : !0;
}
function Ke(e, t) {
  const n = t.filter(F);
  return n.length ? e.filter((r) => n.every((o) => De(r, o))) : e;
}
function Le(e) {
  const t = /* @__PURE__ */ new Set();
  for (const r of e) for (const o in r.props) t.add(o);
  const n = [...t].sort((r, o) => r.localeCompare(o, "ru"));
  return [...Fe, ...n];
}
const Ue = 400;
function Ye(e, t) {
  if (t === ae) return [];
  const n = /* @__PURE__ */ new Set();
  for (const r of e) {
    const o = Ne(r, t);
    if (!(o === void 0 || o === "") && (n.add(o), n.size >= Ue))
      break;
  }
  return [...n].sort((r, o) => {
    const l = D(r), a = D(o);
    return Number.isFinite(l) && Number.isFinite(a) && l !== a ? l - a : r.localeCompare(o, "ru");
  });
}
const $e = 8, We = 800, Ge = 400;
function Ee(e) {
  if (!e) return;
  const t = e.model;
  if (!(!t || typeof t != "object" || !("attachments" in t)))
    return t.project ?? t;
}
function U(e) {
  return Ee(e.app) ?? Ee(e.manager.activeApp);
}
function ce(e, t) {
  const n = [{ title: "Проект", drawing: e }];
  return e.attachments.forEach((r) => {
    if (!t && r.hidden) return;
    const o = r.model;
    o && n.push({ title: r.name ?? "Вложение", drawing: o });
  }), n;
}
function Xe(e) {
  if (e == null) return;
  const t = typeof e;
  if (t === "string") return e;
  if (t === "number" || t === "boolean") return String(e);
}
const Je = /* @__PURE__ */ new Set([
  "hidden",
  "disabled",
  "unplottable",
  "color",
  "lineweight",
  "linetype",
  "name",
  "layer",
  "key",
  "uuid",
  "modelname"
]);
function $(e) {
  const t = {};
  let n = 0;
  const r = (o, l, a) => {
    if (a > $e || n > We) return;
    n++;
    const d = Xe(o);
    if (d !== void 0) {
      l && d !== "" && (t[l] = d);
      return;
    }
    if (Array.isArray(o)) {
      for (let p = 0; p < o.length; p++) r(o[p], l + "[" + p + "]", a + 1);
      return;
    }
    if (!o || typeof o != "object") return;
    const f = o;
    if (f.$value !== void 0) {
      r(f.$value, l, a + 1);
      return;
    }
    for (const p in f)
      p.startsWith("$") || a === 0 && Je.has(p.toLowerCase()) || r(f[p], l ? l + "." + p : p, a + 1);
  };
  try {
    r(e.typedProperties(), "", 0);
  } catch {
  }
  return t;
}
function Qe(e) {
  const t = e.lastIndexOf("|");
  if (t > 0) return e.slice(t + 1);
  const n = e.lastIndexOf(".");
  return n > 0 ? e.slice(n + 1) : e;
}
function Ze(e, t, n) {
  const r = $(e);
  for (const o in r) {
    const l = r[o], a = n ? l : l.toLowerCase(), d = n ? o : o.toLowerCase();
    if (a.includes(t) || d.includes(t)) return o + ": " + l;
  }
}
function et(e, t, n, r) {
  const o = $(e);
  for (const l in o) {
    const a = l.toLowerCase(), d = Qe(l).toLowerCase();
    if (!a.includes(t) && !d.includes(t)) continue;
    const f = o[l];
    if (!n) return f ? l + ": " + f : void 0;
    if ((r ? f : f.toLowerCase()).includes(n)) return l + ": " + f;
  }
}
function tt(e, t, n) {
  const r = n.caseSensitive, o = n.property.trim().toLowerCase();
  if (o) return et(e, o, t, r);
  const l = e.name ?? "";
  if ((r ? l : l.toLowerCase()).includes(t)) return "имя: " + l;
  const a = e.$path ?? "";
  if ((r ? a : a.toLowerCase()).includes(t)) return "путь: " + a;
  let d = "";
  try {
    d = e.typed?.name ?? "";
  } catch {
    d = "";
  }
  return d && (r ? d : d.toLowerCase()).includes(t) ? "тип: " + d : Ze(e, t, r);
}
async function je(e, t, n) {
  const r = Date.now(), o = t.query.trim(), l = t.caseSensitive ? o : o.toLowerCase(), a = [];
  let d = 0;
  if (!l && !t.property.trim()) return { hits: a, scanned: 0, models: 0, elapsed: 0 };
  const f = ce(e, t.includeHidden);
  for (const p of f) {
    const y = [];
    p.drawing.layers.forEach((x) => {
      y.push(x);
    });
    for (const x of y) {
      d++, d % Ge === 0 && (n?.(d, a.length, p.title), await qe());
      const z = tt(x, l, t);
      z && a.push({
        index: a.length,
        layer: x,
        name: x.name ?? "без имени",
        model: p.title,
        path: x.$path ?? "",
        match: z,
        props: {}
      });
    }
  }
  for (let p = 0; p < a.length; p++)
    a[p].props = $(a[p].layer), p % 200 === 0 && (n?.(d, a.length, "чтение свойств"), await qe());
  return n?.(d, a.length, ""), { hits: a, scanned: d, models: f.length, elapsed: Date.now() - r };
}
function qe() {
  return new Promise((e) => setTimeout(e, 0));
}
const oe = "Прочее", V = "Элемент";
function re(e) {
  const t = e.lastIndexOf("|");
  if (t > 0) return { group: e.slice(0, t), name: e.slice(t + 1) };
  const n = e.lastIndexOf(".");
  return n > 0 ? { group: e.slice(0, n), name: e.slice(n + 1) } : { group: oe, name: e };
}
function nt(e) {
  const t = /* @__PURE__ */ new Map();
  t.set(V, [
    { key: "Имя", name: "Имя", value: e.name },
    { key: "Модель", name: "Модель", value: e.model },
    { key: "Путь", name: "Путь", value: e.path }
  ]);
  for (const r of Object.keys(e.props).sort((o, l) => o.localeCompare(l, "ru"))) {
    const { group: o, name: l } = re(r), a = t.get(o), d = { key: r, name: l, value: e.props[r] };
    a ? a.push(d) : t.set(o, [d]);
  }
  const n = [...t.entries()].filter(([r]) => r !== V).sort((r, o) => r[0] === oe ? 1 : o[0] === oe ? -1 : r[0].localeCompare(o[0], "ru"));
  return [
    { group: V, rows: t.get(V) },
    ...n.map(([r, o]) => ({ group: r, rows: o }))
  ];
}
function ot(e) {
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
    props: $(e)
  };
}
function le(e) {
  if (e.cadview) return e.cadview;
  const t = e.manager.activeWindow?.context;
  if (t) return t;
  for (const n of e.manager.windows) {
    const r = n.context;
    if (r) return r;
  }
}
function rt(e) {
  return le(e) !== void 0;
}
function st(e, t) {
  let n = e;
  for (let r = 0; n && r < 32; r++) {
    if (t.has(n)) return !0;
    n = n.layer;
  }
  return !1;
}
function Y(e, t, n) {
  const r = le(e);
  if (!r) return !1;
  const o = new Set(t), l = Math3d.box3.alloc(), a = Math3d.box3.alloc();
  let d = 0;
  if (r.layer.clearSelected(), o.size && r.layer.selectObjects((f) => {
    const p = f;
    return st(p?.layer, o) ? (p.qbounds && p.qbounds(a) && (d === 0 ? Math3d.box3.dup(l, a) : Math3d.box3.addBox(l, a), d++), !0) : !1;
  }, !0), d > 0)
    try {
      r.camera.zoom(l, r);
    } catch {
    }
  return r.invalidate(), !0;
}
function se(e) {
  const t = le(e);
  return t ? (t.layer.clearSelected(), t.invalidate(), !0) : !1;
}
async function it(e) {
  const t = new Set(e);
  let n = 0;
  for (const r of t)
    try {
      if (r.hidden) continue;
      await r.setx("hidden", !0), n++;
    } catch {
    }
  return n;
}
async function at(e, t) {
  const n = new Set(t);
  if (!n.size) return { visible: 0, hidden: 0 };
  const r = /* @__PURE__ */ new Set();
  for (const a of n) {
    let d = a.layer;
    for (let f = 0; d && f < 64; f++)
      r.add(d), d = d.layer;
  }
  let o = 0, l = 0;
  for (const a of ce(e, !0)) {
    const d = /* @__PURE__ */ new Map();
    a.drawing.layers.forEach((p) => {
      const y = p.layer, x = d.get(y);
      x ? x.push(p) : d.set(y, [p]);
    });
    const f = async (p) => {
      for (const y of d.get(p) ?? []) {
        const x = n.has(y) || r.has(y);
        try {
          x ? y.hidden && (await y.setx("hidden", !1), o++) : y.hidden || (await y.setx("hidden", !0), l++);
        } catch {
        }
        r.has(y) && await f(y);
      }
    };
    await f(void 0);
  }
  return { visible: o, hidden: l };
}
async function ct(e) {
  let t = 0;
  for (const n of ce(e, !0)) {
    const r = [];
    n.drawing.layers.forEach((o) => {
      o.hidden && r.push(o);
    });
    for (const o of r)
      try {
        await o.setx("hidden", !1), t++;
      } catch {
      }
  }
  return t;
}
const Ie = "nashepo.info.search.v2", ie = /* @__PURE__ */ new Set();
function Ce(e) {
  for (const t of ie) t(e);
}
const lt = (() => {
  try {
    return document.fonts?.check?.('16px "Material Symbols Outlined"') === !0;
  } catch {
    return !1;
  }
})();
function j(e, t) {
  return lt ? '<span class="ic">' + e + "</span>" : '<span class="ic-text">' + t + "</span>";
}
function b(e) {
  return e.replace(/[&<>"]/g, (t) => t === "&" ? "&amp;" : t === "<" ? "&lt;" : t === ">" ? "&gt;" : "&quot;");
}
function dt() {
  const e = Me();
  try {
    const t = localStorage.getItem(Ie);
    if (!t) return e;
    const n = JSON.parse(t);
    return {
      query: typeof n.query == "string" ? n.query : e.query,
      property: typeof n.property == "string" ? n.property : e.property,
      caseSensitive: n.caseSensitive === !0,
      includeHidden: n.includeHidden === !0
    };
  } catch {
    return e;
  }
}
function R(e) {
  try {
    localStorage.setItem(Ie, JSON.stringify(e));
  } catch {
  }
}
function ut(e) {
  let t = e;
  for (; t; ) {
    const n = getComputedStyle(t).backgroundColor.match(/[\d.]+/g);
    if (n && n.length >= 3 && (n.length < 4 || Number(n[3]) > 0.1)) {
      const [r, o, l] = n.map(Number);
      return r * 0.299 + o * 0.587 + l * 0.114 > 140;
    }
    t = t.parentElement;
  }
  return !matchMedia("(prefers-color-scheme: dark)").matches;
}
function te(e, t) {
  const n = ut(e.parentElement ?? e);
  e.style.colorScheme = n ? "light" : "dark", t.classList.toggle("theme-light", n), t.classList.toggle("theme-dark", !n);
}
function pt(e, t, n, r) {
  const o = e.attachShadow ? e.shadowRoot || e.attachShadow({ mode: "open" }) : e, l = dt();
  o.innerHTML = "<style>" + n + '</style><main class="app" id="app"><div class="query"><input id="query" type="search" placeholder="Значение, имя, GUID, что угодно" value="' + b(l.query) + '"><button class="primary" id="find">Найти</button></div><div class="scope"><span class="scope-label">в параметре</span><input id="param" list="param-list" placeholder="любой параметр" value="' + b(l.property) + '"><datalist id="param-list"></datalist><button id="param-clear" title="Искать везде">×</button></div><div class="options"><label><input id="case" type="checkbox"> учитывать регистр</label><label><input id="hidden" type="checkbox"> искать в скрытых</label></div><section class="block"><div class="block-head"><button class="fold" id="fold-conditions" aria-expanded="false">Условия отбора <span id="conditions-count"></span></button><button id="add-condition" title="Добавить условие">＋</button></div><div class="conditions" id="conditions" hidden></div></section><div class="toolbar"><button id="prev" class="ib" title="Предыдущий элемент">' + j("chevron_left", "‹") + '</button><button id="next" class="ib" title="Следующий элемент">' + j("chevron_right", "›") + '</button><button id="all" class="ib" title="Подсветить все найденные">' + j("select_all", "▣") + '</button><button id="reset" class="ib" title="Снять подсветку">' + j("deselect", "✕") + '</button><span class="sep"></span><button id="isolate" class="ib" title="Изолировать: оставить видимым только выбранный элемент, а если он не выбран — весь список">' + j("center_focus_strong", "⊙") + '</button><button id="hide" class="ib" title="Скрыть элементы из списка">' + j("visibility_off", "⊘") + '</button><button id="show-all" class="ib" title="Показать всё скрытое в проекте">' + j("visibility", "◎") + '</button></div><div class="status" id="status">Введите значение и нажмите «Найти».</div><div class="list" id="list"><div class="empty">Пока ничего не найдено</div></div><section class="block props-block"><div class="block-head"><button class="fold" id="fold-props" aria-expanded="true">Свойства элемента</button><input id="prop-filter" type="search" placeholder="фильтр свойств"></div><div class="props" id="props"><div class="empty">Выберите элемент в списке</div></div></section><div class="hint">Щелчок по строке подсвечивает элемент и переводит к нему камеру. Версия ' + b(r) + "</div></main>";
  const a = o.querySelector("#app"), d = o.querySelector("#query"), f = o.querySelector("#param"), p = o.querySelector("#param-list"), y = o.querySelector("#param-clear"), x = o.querySelector("#hide"), z = o.querySelector("#show-all"), de = o.querySelector("#isolate"), W = o.querySelector("#case"), G = o.querySelector("#hidden"), ue = o.querySelector("#find"), pe = o.querySelector("#all"), fe = o.querySelector("#prev"), he = o.querySelector("#next"), Te = o.querySelector("#reset"), ge = o.querySelector("#status"), A = o.querySelector("#list"), C = o.querySelector("#conditions"), Ve = o.querySelector("#conditions-count"), ze = o.querySelector("#add-condition"), X = o.querySelector("#fold-conditions"), me = o.querySelector("#fold-props"), H = o.querySelector("#props"), ve = o.querySelector("#prop-filter");
  W.checked = l.caseSensitive, G.checked = l.includeHidden, te(e, a);
  let S = [], h = [], L = [], Ae = 1, O = -1, w = !1, I;
  function g(s, i = !1) {
    ge.textContent = s, ge.classList.toggle("error", i);
  }
  function P() {
    return {
      query: d.value,
      property: f.value,
      caseSensitive: W.checked,
      includeHidden: G.checked
    };
  }
  function E() {
    const s = h.length > 0;
    pe.disabled = !s || w, fe.disabled = !s || w, he.disabled = !s || w, x.disabled = !s || w, de.disabled = !s || w, ue.disabled = w, z.disabled = w, a.classList.toggle("scoped", f.value.trim() !== "");
  }
  function He() {
    const s = /* @__PURE__ */ new Set();
    for (const i of Le(S)) {
      s.add(i);
      const c = re(i).name;
      c && c !== i && s.add(c);
    }
    p.innerHTML = [...s].sort((i, c) => i.localeCompare(c, "ru")).slice(0, 400).map((i) => '<option value="' + b(i) + '"></option>').join("");
  }
  function M() {
    const s = Le(S);
    if (Ve.textContent = L.length ? "· " + L.length : "", !L.length) {
      C.innerHTML = '<div class="empty">Условий нет. Кнопка ＋ добавит условие по свойству.</div>';
      return;
    }
    const i = /* @__PURE__ */ new Map();
    for (const c of s) {
      const { group: u, name: v } = re(c), m = ["Имя", "Модель", "Путь"].includes(c) ? V : u, k = m === V ? c : v, N = i.get(m);
      N ? N.push({ key: c, name: k }) : i.set(m, [{ key: c, name: k }]);
    }
    C.innerHTML = L.map((c) => {
      const u = ['<option value="">любое свойство</option>'].concat([...i.entries()].map(
        ([q, Re]) => '<optgroup label="' + b(q) + '">' + Re.map(
          (Z) => '<option value="' + b(Z.key) + '"' + (Z.key === c.key ? " selected" : "") + ">" + b(Z.name) + "</option>"
        ).join("") + "</optgroup>"
      )).join(""), v = ke.map(
        (q) => '<option value="' + q.op + '"' + (q.op === c.op ? " selected" : "") + ">" + q.label + "</option>"
      ).join(""), m = ke.find((q) => q.op === c.op)?.needsValue ?? !0, k = c.op === "gt" || c.op === "lt", N = m && !F(c), we = N ? k && c.value.trim() !== "" ? "нужно число" : "введите значение" : "", T = m ? Ye(S, c.key) : [], xe = "cond-values-" + c.id, _e = T.length ? '<datalist id="' + xe + '">' + T.map((q) => '<option value="' + b(q) + '"></option>').join("") + "</datalist>" : "", Be = k ? "число" : T.length ? "значение или часть" : "значение";
      return '<div class="condition' + (N ? " waiting" : "") + '" data-id="' + c.id + '"><select class="cond-key">' + u + '</select><select class="cond-op">' + v + '</select><input class="cond-value" type="search" placeholder="' + Be + '" value="' + b(c.value) + '"' + (m ? "" : " disabled") + (T.length ? ' list="' + xe + '"' : "") + '><button class="cond-remove" title="Удалить условие">×</button>' + _e + (T.length ? '<div class="cond-hint">известных значений: ' + T.length + "</div>" : "") + (we ? '<div class="cond-hint">' + we + ", условие пока не применяется</div>" : "") + "</div>";
    }).join("");
  }
  function Pe() {
    if (!h.length) {
      A.innerHTML = '<div class="empty">' + (S.length ? "Условия отбора не пропустили ни одного элемента" : "Пока ничего не найдено") + "</div>";
      return;
    }
    A.innerHTML = h.map(
      (s) => '<button class="row" data-index="' + s.index + '"><div class="name">' + b(s.name) + '</div><div class="meta"><span class="model">' + b(s.model) + "</span><span>" + b(s.path) + '</span></div><div class="match">' + b(s.match) + "</div></button>"
    ).join("");
  }
  function _() {
    const s = I ?? h.find((v) => v.index === O);
    if (!s) {
      H.innerHTML = '<div class="empty">Выберите элемент в списке или в модели</div>';
      return;
    }
    const i = ve.value.trim().toLowerCase(), c = nt(s).map((v) => ({
      group: v.group,
      rows: i ? v.rows.filter((m) => m.name.toLowerCase().includes(i) || m.key.toLowerCase().includes(i) || m.value.toLowerCase().includes(i)) : v.rows
    })).filter((v) => v.rows.length);
    if (!c.length) {
      H.innerHTML = '<div class="empty">Ничего не подходит под фильтр</div>';
      return;
    }
    const u = I ? '<div class="props-note">Элемент выбран в модели</div>' : "";
    H.innerHTML = u + c.map(
      (v) => '<div class="prop-group"><div class="prop-group-name" title="' + b(v.group) + '">' + b(v.group) + '</div><table class="props-table"><tbody>' + v.rows.map(
        (m) => '<tr><th title="' + b(m.key) + '">' + b(m.name) + '</th><td title="' + b(m.value) + '">' + b(m.value) + "</td></tr>"
      ).join("") + "</tbody></table></div>"
    ).join("");
  }
  function B(s = !1) {
    if (h = Ke(S, L), O = -1, Pe(), _(), E(), s || !S.length) return;
    const i = L.filter(F).length;
    g(i ? "Найдено: " + S.length + ". После отбора по " + i + " условиям: " + h.length + "." : "Найдено: " + S.length + ".");
  }
  function K(s) {
    O = s, I = void 0, A.querySelectorAll(".row").forEach((i) => {
      i.classList.toggle("active", Number(i.dataset.index) === s);
    }), A.querySelector(".row.active")?.scrollIntoView({ block: "nearest" }), _();
  }
  function J(s) {
    if (s < 0 || s >= h.length) return;
    const i = h[s];
    if (!Y(t, [i.layer])) {
      g("Нет активного вида чертежа. Откройте окно проекта.", !0);
      return;
    }
    K(i.index), g("Элемент " + (s + 1) + " из " + h.length + ". " + i.model);
  }
  function be() {
    return h.findIndex((s) => s.index === O);
  }
  async function Q() {
    const s = P();
    if (R(s), !s.query.trim() && !s.property.trim()) {
      g("Введите значение для поиска или укажите параметр.", !0);
      return;
    }
    const i = U(t);
    if (!i) {
      g("Нет открытого проекта.", !0);
      return;
    }
    rt(t) || g("Нет активного вида чертежа. Поиск выполнится, но подсветка работать не будет."), w = !0, S = [], h = [], O = -1, E(), g("Поиск…");
    try {
      const c = await je(i, s, (u, v, m) => {
        g("Просмотрено " + u + ", найдено " + v + (m ? ". " + m : ""));
      });
      if (S = c.hits, M(), He(), B(!0), S.length) {
        const u = L.filter(F).length ? " После условий отбора: " + h.length + "." : "";
        g("Найдено: " + S.length + "." + u + " Просмотрено слоёв: " + c.scanned + " в моделях: " + c.models + " за " + Math.round(c.elapsed / 100) / 10 + " с.");
      } else {
        const u = s.property.trim() ? " Параметр: " + s.property.trim() + "." : "";
        g("Ничего не найдено." + u + " Просмотрено слоёв: " + c.scanned + " в моделях: " + c.models + ".");
      }
    } catch (c) {
      g("Ошибка поиска: " + (c?.message ?? String(c)), !0);
    } finally {
      w = !1, E();
    }
  }
  ue.addEventListener("click", () => {
    Q();
  }), d.addEventListener("keydown", (s) => {
    s.key === "Enter" && Q();
  }), f.addEventListener("keydown", (s) => {
    s.key === "Enter" && Q();
  }), f.addEventListener("input", () => {
    R(P()), E();
  }), y.addEventListener("click", () => {
    f.value = "", R(P()), E(), f.focus();
  }), W.addEventListener("change", () => R(P())), G.addEventListener("change", () => R(P())), x.addEventListener("click", () => {
    (async () => {
      if (h.length) {
        w = !0, E(), g("Скрываю элементы…");
        try {
          const s = await it(h.map((i) => i.layer));
          se(t), g("Скрыто элементов: " + s + ". Вернуть их можно кнопкой «Показать все».");
        } catch (s) {
          g("Не удалось скрыть: " + (s?.message ?? String(s)), !0);
        } finally {
          w = !1, E();
        }
      }
    })();
  }), de.addEventListener("click", () => {
    (async () => {
      const s = U(t);
      if (!s) {
        g("Нет открытого проекта.", !0);
        return;
      }
      const i = h.find((u) => u.index === O), c = i ? [i.layer] : h.map((u) => u.layer);
      if (c.length) {
        w = !0, E(), g("Изолирую…");
        try {
          const u = await at(s, c);
          Y(t, c, !0), g("Изолировано элементов: " + c.length + ". Скрыто веток: " + u.hidden + ". Вернуть вид можно кнопкой показа всего.");
        } catch (u) {
          g("Не удалось изолировать: " + (u?.message ?? String(u)), !0);
        } finally {
          w = !1, E();
        }
      }
    })();
  }), z.addEventListener("click", () => {
    (async () => {
      const s = U(t);
      if (!s) {
        g("Нет открытого проекта.", !0);
        return;
      }
      w = !0, E(), g("Показываю скрытое…");
      try {
        const i = await ct(s);
        g(i ? "Показано элементов: " + i + "." : "Скрытых элементов не было.");
      } catch (i) {
        g("Не удалось показать: " + (i?.message ?? String(i)), !0);
      } finally {
        w = !1, E();
      }
    })();
  }), pe.addEventListener("click", () => {
    if (h.length) {
      if (!Y(t, h.map((s) => s.layer))) {
        g("Нет активного вида чертежа. Откройте окно проекта.", !0);
        return;
      }
      O = -1, K(-1), g("Подсвечено элементов: " + h.length + ".");
    }
  }), fe.addEventListener("click", () => {
    if (!h.length) return;
    const s = be();
    J(s <= 0 ? h.length - 1 : s - 1);
  }), he.addEventListener("click", () => {
    if (!h.length) return;
    const s = be();
    J(s >= h.length - 1 ? 0 : s + 1);
  }), Te.addEventListener("click", () => {
    se(t), O = -1, K(-1), g("Выделение снято.");
  }), A.addEventListener("click", (s) => {
    const i = s.target.closest(".row");
    if (!i) return;
    const c = Number(i.dataset.index);
    J(h.findIndex((u) => u.index === c));
  }), ze.addEventListener("click", () => {
    L.push({ id: Ae++, key: ae, op: "contains", value: "" }), C.hidden = !1, X.setAttribute("aria-expanded", "true"), M(), B();
  }), X.addEventListener("click", () => {
    const s = C.hidden;
    C.hidden = !s, X.setAttribute("aria-expanded", String(s)), s && M();
  }), me.addEventListener("click", () => {
    const s = H.hidden;
    H.hidden = !s, me.setAttribute("aria-expanded", String(s));
  }), ve.addEventListener("input", () => _()), C.addEventListener("click", (s) => {
    const i = s.target.closest(".cond-remove");
    if (!i) return;
    const c = Number(i.closest(".condition").dataset.id);
    L = L.filter((u) => u.id !== c), M(), B();
  }), C.addEventListener("change", (s) => {
    const i = s.target, c = i.closest(".condition");
    if (!c) return;
    const u = L.find((v) => v.id === Number(c.dataset.id));
    u && (i.classList.contains("cond-key") && (u.key = i.value, M()), i.classList.contains("cond-op") && (u.op = i.value, M()), i.classList.contains("cond-value") && (u.value = i.value), B());
  }), C.addEventListener("input", (s) => {
    const i = s.target;
    if (!i.classList.contains("cond-value")) return;
    const c = i.closest(".condition");
    if (!c) return;
    const u = L.find((N) => N.id === Number(c.dataset.id));
    if (!u) return;
    u.value = i.value;
    const v = u.op === "gt" || u.op === "lt", m = !F(u);
    c.classList.toggle("waiting", m);
    let k = c.querySelector(".cond-hint");
    m ? (k || (k = document.createElement("div"), k.className = "cond-hint", c.appendChild(k)), k.textContent = (v && u.value.trim() !== "" ? "нужно число" : "введите значение") + ", условие пока не применяется") : k && k.remove(), B();
  });
  const ye = (s) => {
    if (!e.isConnected) {
      ie.delete(ye);
      return;
    }
    if (!s.length) {
      if (!I) return;
      I = void 0, _();
      return;
    }
    const i = s[0], c = h.find((u) => u.layer === i);
    if (c) {
      K(c.index);
      return;
    }
    I = ot(i), _();
  };
  ie.add(ye), a.addEventListener("pointerdown", () => te(e, a)), setTimeout(() => te(e, a), 500), M(), E();
}
const ft = ':host,.app{--bg: rgb(var(--v-theme-surface, 30 30 30));--fg: rgb(var(--v-theme-on-surface, 235 240 245));--muted: color-mix(in srgb, var(--fg) 55%, transparent);--line: color-mix(in srgb, var(--fg) 18%, transparent);--soft: color-mix(in srgb, var(--fg) 7%, transparent);--accent: #f2c94c;--accent-fg: #16191e}*{box-sizing:border-box}.app{display:flex;flex-direction:column;height:100%;min-height:0;gap:7px;padding:9px;background:var(--bg);font:13px/1.45 Ubuntu,system-ui,sans-serif;color:var(--fg)}.query{display:flex;gap:6px}input[type=search],input[type=text],select{min-width:0;padding:6px 8px;border:1px solid var(--line);border-radius:7px;background:var(--soft);color:inherit;font:inherit}.query input[type=search]{flex:1;padding:8px 10px}input[type=search]:focus,select:focus{outline:2px solid var(--accent);outline-offset:-1px}button{padding:6px 10px;border:1px solid var(--line);border-radius:7px;background:var(--soft);color:inherit;font:inherit;cursor:pointer;white-space:nowrap}button:hover:not(:disabled){border-color:var(--accent)}button:disabled{opacity:.45;cursor:default}button.primary{background:var(--accent);color:var(--accent-fg);border-color:transparent;font-weight:700}.scope{display:flex;align-items:center;gap:6px}.scope-label{color:var(--muted);font-size:12px;white-space:nowrap}.scope input{flex:1;min-width:0}.scope button{padding:5px 9px}.app.scoped .scope input{border-color:var(--accent)}.app.scoped .scope-label{color:var(--accent)}.options{display:flex;flex-wrap:wrap;gap:12px;color:var(--muted)}.options label{display:inline-flex;align-items:center;gap:5px}.block{border:1px solid var(--line);border-radius:8px}.block-head{display:flex;align-items:center;gap:6px;padding:4px 6px}.block-head .fold{flex:1;border:0;background:transparent;text-align:left;font-weight:600;padding:3px 2px}.block-head .fold:before{content:"▾ ";color:var(--muted)}.block-head .fold[aria-expanded=false]:before{content:"▸ "}.block-head input[type=search]{width:120px}.conditions{padding:0 6px 6px;display:flex;flex-direction:column;gap:5px}.condition{display:grid;grid-template-columns:minmax(0,1.3fr) minmax(0,.9fr) minmax(0,1fr) auto;gap:4px}.condition select,.condition input{font-size:12px}.condition.waiting select,.condition.waiting input{border-color:color-mix(in srgb,var(--accent) 60%,var(--line))}.cond-hint{grid-column:1 / -1;color:var(--muted);font-size:11px}.theme-dark{--popup-bg: #232323;--popup-fg: #edf1f6;--popup-head: #2f2f2f}.theme-light{--popup-bg: #ffffff;--popup-fg: #16191e;--popup-head: #ececec}option{background-color:var(--popup-bg, #232323);color:var(--popup-fg, #edf1f6)}optgroup{background-color:var(--popup-head, #2f2f2f);color:var(--popup-fg, #edf1f6);font-weight:700;font-style:normal}.bar{display:flex;align-items:center;gap:6px;flex-wrap:wrap}.bar .spacer{flex:1}.toolbar{display:flex;align-items:center;gap:2px;padding:2px;border:1px solid var(--line);border-radius:8px}.toolbar .sep{width:1px;align-self:stretch;margin:2px 4px;background:var(--line)}button.ib{display:inline-flex;align-items:center;justify-content:center;width:30px;height:28px;padding:0;border-color:transparent;background:transparent}button.ib:hover:not(:disabled){background:var(--soft);border-color:var(--line)}button.ib:active:not(:disabled){background:color-mix(in srgb,var(--accent) 25%,transparent)}.ic{font-family:Material Symbols Outlined;font-size:19px;line-height:1;font-weight:300;-webkit-font-feature-settings:"liga";font-variant-ligatures:common-ligatures}.ic-text{font-size:15px;line-height:1}.status{color:var(--muted);min-height:17px}.status.error{color:#ff6b6b}.list{flex:1 1 55%;min-height:90px;overflow:auto;border:1px solid var(--line);border-radius:8px}.row{display:block;width:100%;padding:6px 9px;border:0;border-bottom:1px solid var(--line);border-radius:0;background:transparent;text-align:left;cursor:pointer}.row:last-child{border-bottom:0}.row:hover{background:var(--soft)}.row.active{background:color-mix(in srgb,var(--accent) 22%,transparent)}.row .name{font-weight:600;word-break:break-word}.row .meta{display:flex;gap:6px;align-items:baseline;color:var(--muted);font-size:12px}.row .model{color:var(--accent)}.row .match{color:var(--muted);font-family:ui-monospace,Consolas,monospace;font-size:11px;word-break:break-all}.props-block{display:flex;flex-direction:column;flex:1 1 45%;min-height:90px}.props{flex:1;min-height:0;overflow:auto;padding:0 6px 6px}.props-note{padding:3px 5px;color:var(--accent);font-size:11px}.prop-group{margin-bottom:7px}.prop-group-name{padding:3px 5px;background:var(--soft);border-radius:5px;font-size:11px;font-weight:700;letter-spacing:.01em;overflow-wrap:anywhere}.props-table{width:100%;border-collapse:collapse;font-size:12px;table-layout:fixed}.props-table th,.props-table td{text-align:left;vertical-align:top;padding:3px 5px;border-bottom:1px solid var(--line);overflow-wrap:anywhere}.props-table th{width:42%;font-weight:500;color:var(--muted)}.empty{padding:14px;color:var(--muted);text-align:center}.hint{color:var(--muted);font-size:11px}', ht = "0.5.0", Oe = "nashepo.info/search_panel";
function ne(e) {
  return new Proxy(e, {
    get(t, n) {
      return n === "app" ? e.manager.activeApp : n === "cadview" ? e.manager.activeWindow?.context : Reflect.get(t, n);
    }
  });
}
const gt = {
  /** Открыть панель поиска. */
  open(e) {
    e.manager.revealView(Oe);
  },
  /** Смонтировать панель. */
  mount(e) {
    const t = e.el;
    if (!t) return;
    const n = document.createElement("div");
    n.style.height = "100%", t.replaceChildren(n), pt(n, ne(e), ft, ht);
  },
  /** Быстрый поиск: спросить значение и сразу подсветить все совпадения. */
  async quick(e) {
    const t = ne(e), n = U(t);
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
    const o = { ...Me(), query: r }, l = e.beginProgress();
    l.indeterminate = !0, l.label = "Поиск по проекту";
    let a;
    try {
      a = await je(n, o, (f, p) => {
        l.details = "просмотрено " + f + ", найдено " + p;
      });
    } finally {
      e.endProgress(l);
    }
    if (!a.hits.length) {
      await e.showMessage("Ничего не найдено. Просмотрено слоёв: " + a.scanned + ".", "info");
      return;
    }
    const d = Y(t, a.hits.map((f) => f.layer));
    e.manager.revealView(Oe), await e.showMessage(
      d ? "Найдено элементов: " + a.hits.length + ". Они подсвечены в модели." : "Найдено элементов: " + a.hits.length + ", но активного вида чертежа нет.",
      d ? "info" : "warning"
    );
  },
  /** Снять подсветку. */
  clear(e) {
    se(ne(e));
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
      Ce([]);
      return;
    }
    const r = [], o = /* @__PURE__ */ new Set();
    try {
      for (const l of n.selectedObjects()) {
        const a = l?.layer;
        a && !o.has(a) && (o.add(a), r.push(a));
      }
    } catch {
      return;
    }
    Ce(r);
  }
};
export {
  gt as default
};
