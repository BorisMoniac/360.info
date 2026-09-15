const Ge = () => ({
  query: "",
  property: "",
  caseSensitive: !1,
  includeHidden: !1
}), Ke = [
  { op: "contains", label: "содержит", needsValue: !0 },
  { op: "notContains", label: "не содержит", needsValue: !0 },
  { op: "equals", label: "равно", needsValue: !0 },
  { op: "notEquals", label: "не равно", needsValue: !0 },
  { op: "gt", label: "больше", needsValue: !0 },
  { op: "lt", label: "меньше", needsValue: !0 },
  { op: "exists", label: "заполнено", needsValue: !1 },
  { op: "missing", label: "пусто", needsValue: !1 }
], Se = "", be = ["Имя", "Модель", "Путь"];
function Je(e, t) {
  return t === "Имя" ? e.name : t === "Модель" ? e.model : t === "Путь" ? e.path : e.props[t];
}
function Fe(e) {
  const t = [e.name, e.model, e.path];
  for (const n in e.props) t.push(e.props[n]);
  return t;
}
function W(e) {
  const n = e.replace(/\s| /g, "").replace(",", ".").match(/-?\d+(\.\d+)?/);
  return n ? parseFloat(n[0]) : NaN;
}
function he(e, t) {
  const n = e !== void 0 && e !== "";
  switch (t.op) {
    case "exists":
      return n;
    case "missing":
      return !n;
  }
  if (!n) return !1;
  const s = e.toLowerCase(), r = t.value.trim().toLowerCase();
  switch (t.op) {
    case "contains":
      return s.includes(r);
    case "notContains":
      return !s.includes(r);
    case "equals":
      return s === r;
    case "notEquals":
      return s !== r;
    case "gt":
    case "lt": {
      const l = W(e), a = W(t.value);
      return !Number.isFinite(l) || !Number.isFinite(a) ? !1 : t.op === "gt" ? l > a : l < a;
    }
    default:
      return !1;
  }
}
function st(e, t) {
  return t.key !== Se ? he(Je(e, t.key), t) : t.op === "missing" ? Fe(e).every((n) => !he(n, { ...t, op: "exists" })) : Fe(e).some((n) => he(n, t));
}
function $(e) {
  return e.op === "exists" || e.op === "missing" ? !0 : e.value.trim() === "" ? !1 : e.op === "gt" || e.op === "lt" ? Number.isFinite(W(e.value)) : !0;
}
function at(e, t) {
  const n = t.filter($);
  return n.length ? e.filter((s) => n.every((r) => st(s, r))) : e;
}
function Re(e) {
  const t = /* @__PURE__ */ new Set();
  for (const s of e) for (const r in s.props) t.add(r);
  const n = [...t].sort((s, r) => s.localeCompare(r, "ru"));
  return [...be, ...n];
}
const ct = 400;
function lt(e, t) {
  if (t === Se) return [];
  const n = /* @__PURE__ */ new Set();
  for (const s of e) {
    const r = Je(s, t);
    if (!(r === void 0 || r === "") && (n.add(r), n.size >= ct))
      break;
  }
  return [...n].sort((s, r) => {
    const l = W(s), a = W(r);
    return Number.isFinite(l) && Number.isFinite(a) && l !== a ? l - a : s.localeCompare(r, "ru");
  });
}
const dt = 8, ut = 800, pt = 400;
function Ye(e) {
  if (!e) return;
  const t = e.model;
  if (!(!t || typeof t != "object" || !("attachments" in t)))
    return t.project ?? t;
}
function ne(e) {
  return Ye(e.app) ?? Ye(e.manager.activeApp);
}
function Le(e, t) {
  const n = [{ title: "Проект", drawing: e }];
  return e.attachments.forEach((s) => {
    if (!t && s.hidden) return;
    const r = s.model;
    r && n.push({ title: s.name ?? "Вложение", drawing: r });
  }), n;
}
function ft(e) {
  if (e == null) return;
  const t = typeof e;
  if (t === "string") return e;
  if (t === "number" || t === "boolean") return String(e);
}
const ht = /* @__PURE__ */ new Set([
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
function ie(e) {
  const t = {};
  let n = 0;
  const s = (r, l, a) => {
    if (a > dt || n > ut) return;
    n++;
    const d = ft(r);
    if (d !== void 0) {
      l && d !== "" && (t[l] = d);
      return;
    }
    if (Array.isArray(r)) {
      for (let h = 0; h < r.length; h++) s(r[h], l + "[" + h + "]", a + 1);
      return;
    }
    if (!r || typeof r != "object") return;
    const v = r;
    if (v.$value !== void 0) {
      s(v.$value, l, a + 1);
      return;
    }
    for (const h in v)
      h.startsWith("$") || a === 0 && ht.has(h.toLowerCase()) || s(v[h], l ? l + "." + h : h, a + 1);
  };
  try {
    s(e.typedProperties(), "", 0);
  } catch {
  }
  return t;
}
function gt(e) {
  const t = e.lastIndexOf("|");
  if (t > 0) return e.slice(t + 1);
  const n = e.lastIndexOf(".");
  return n > 0 ? e.slice(n + 1) : e;
}
function mt(e, t, n) {
  const s = ie(e);
  for (const r in s) {
    const l = s[r], a = n ? l : l.toLowerCase(), d = n ? r : r.toLowerCase();
    if (a.includes(t) || d.includes(t)) return r + ": " + l;
  }
}
function vt(e, t) {
  let n = "";
  try {
    n = e.typed?.name ?? "";
  } catch {
    n = "";
  }
  return [
    ["Имя", e.name ?? ""],
    ["Модель", t],
    ["Путь", e.$path ?? ""],
    ["Тип", n]
  ];
}
function bt(e, t, n, s, r) {
  for (const [a, d] of vt(e, r)) {
    if (!a.toLowerCase().includes(t)) continue;
    if (!n) {
      if (d) return a + ": " + d;
      continue;
    }
    if ((s ? d : d.toLowerCase()).includes(n)) return a + ": " + d;
  }
  const l = ie(e);
  for (const a in l) {
    const d = a.toLowerCase(), v = gt(a).toLowerCase();
    if (!d.includes(t) && !v.includes(t)) continue;
    const h = l[a];
    if (!n) return h ? a + ": " + h : void 0;
    if ((s ? h : h.toLowerCase()).includes(n)) return a + ": " + h;
  }
}
function yt(e, t, n, s) {
  const r = n.caseSensitive, l = n.property.trim().toLowerCase();
  if (l) return bt(e, l, t, r, s);
  const a = e.name ?? "";
  if ((r ? a : a.toLowerCase()).includes(t)) return "имя: " + a;
  const d = e.$path ?? "";
  if ((r ? d : d.toLowerCase()).includes(t)) return "путь: " + d;
  let v = "";
  try {
    v = e.typed?.name ?? "";
  } catch {
    v = "";
  }
  return v && (r ? v : v.toLowerCase()).includes(t) ? "тип: " + v : mt(e, t, r);
}
async function ye(e, t, n) {
  const s = Date.now(), r = t.query.trim(), l = t.caseSensitive ? r : r.toLowerCase(), a = [];
  let d = 0;
  if (!l && !t.property.trim()) return { hits: a, scanned: 0, models: 0, elapsed: 0 };
  const v = Le(e, t.includeHidden);
  for (const h of v) {
    const z = [];
    h.drawing.layers.forEach((k) => {
      z.push(k);
    });
    for (const k of z) {
      d++, d % pt === 0 && (n?.(d, a.length, h.title), await De());
      const P = yt(k, l, t, h.title);
      P && a.push({
        index: a.length,
        layer: k,
        name: k.name ?? "без имени",
        model: h.title,
        path: k.$path ?? "",
        match: P,
        props: {}
      });
    }
  }
  for (let h = 0; h < a.length; h++)
    a[h].props = ie(a[h].layer), h % 200 === 0 && (n?.(d, a.length, "чтение свойств"), await De());
  return n?.(d, a.length, ""), { hits: a, scanned: d, models: v.length, elapsed: Date.now() - s };
}
function De() {
  return new Promise((e) => setTimeout(e, 0));
}
const we = "Прочее", H = "Элемент";
function re(e) {
  const t = e.lastIndexOf("|");
  if (t > 0) return { group: e.slice(0, t), name: e.slice(t + 1) };
  const n = e.lastIndexOf(".");
  return n > 0 ? { group: e.slice(0, n), name: e.slice(n + 1) } : { group: we, name: e };
}
function wt(e) {
  const t = /* @__PURE__ */ new Map();
  t.set(H, [
    { key: "Имя", name: "Имя", value: e.name },
    { key: "Модель", name: "Модель", value: e.model },
    { key: "Путь", name: "Путь", value: e.path }
  ]);
  for (const s of Object.keys(e.props).sort((r, l) => r.localeCompare(l, "ru"))) {
    const { group: r, name: l } = re(s), a = t.get(r), d = { key: s, name: l, value: e.props[s] };
    a ? a.push(d) : t.set(r, [d]);
  }
  const n = [...t.entries()].filter(([s]) => s !== H).sort((s, r) => s[0] === we ? 1 : r[0] === we ? -1 : s[0].localeCompare(r[0], "ru"));
  return [
    { group: H, rows: t.get(H) },
    ...n.map(([s, r]) => ({ group: s, rows: r }))
  ];
}
function xt(e) {
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
    props: ie(e)
  };
}
function se(e) {
  if (e.cadview) return e.cadview;
  const t = e.manager.activeWindow?.context;
  if (t) return t;
  for (const n of e.manager.windows) {
    const s = n.context;
    if (s) return s;
  }
}
function kt(e) {
  return se(e) !== void 0;
}
function St(e, t) {
  let n = e;
  for (let s = 0; n && s < 32; s++) {
    if (t.has(n)) return !0;
    n = n.layer;
  }
  return !1;
}
function oe(e, t, n) {
  const s = se(e);
  if (!s) return !1;
  const r = new Set(t), l = Math3d.box3.alloc(), a = Math3d.box3.alloc();
  let d = 0;
  if (s.layer.clearSelected(), r.size && s.layer.selectObjects((v) => {
    const h = v;
    return St(h?.layer, r) ? (h.qbounds && h.qbounds(a) && (d === 0 ? Math3d.box3.dup(l, a) : Math3d.box3.addBox(l, a), d++), !0) : !1;
  }, !0), d > 0)
    try {
      s.camera.zoom(l, s);
    } catch {
    }
  return s.invalidate(), !0;
}
function xe(e) {
  const t = se(e);
  return t ? (t.layer.clearSelected(), t.invalidate(), !0) : !1;
}
function ee(e) {
  se(e)?.invalidate();
}
function G(e, t) {
  try {
    return e.hidden === t ? !1 : (e.hidden = t, !0);
  } catch {
    return !1;
  }
}
function Ee(e) {
  const t = [e];
  try {
    e.walkChilds((n) => {
      t.push(n);
    });
  } catch {
  }
  return t;
}
async function Ue(e) {
  const t = /* @__PURE__ */ new Set();
  for (const s of e) for (const r of Ee(s)) t.add(r);
  let n = 0;
  for (const s of t) G(s, !0) && n++;
  return n;
}
async function Lt(e, t) {
  if (!t.length) return { visible: 0, hidden: 0 };
  const n = /* @__PURE__ */ new Set();
  for (const l of t) {
    for (const d of Ee(l)) n.add(d);
    let a = l.layer;
    for (let d = 0; a && d < 64; d++)
      n.add(a), a = a.layer;
  }
  let s = 0, r = 0;
  for (const l of Le(e, !0)) {
    const a = [];
    l.drawing.layers.forEach((d) => {
      a.push(d);
    });
    for (const d of a)
      n.has(d) ? G(d, !1) && s++ : G(d, !0) && r++;
  }
  return { visible: s, hidden: r };
}
async function Et(e) {
  const t = /* @__PURE__ */ new Set();
  for (const s of e) {
    for (const l of Ee(s)) t.add(l);
    let r = s.layer;
    for (let l = 0; r && l < 64; l++)
      t.add(r), r = r.layer;
  }
  let n = 0;
  for (const s of t) G(s, !1) && n++;
  return n;
}
function ge(e) {
  try {
    return !e.resolveHidden();
  } catch {
    return !0;
  }
}
async function qt(e) {
  let t = 0;
  for (const n of Le(e, !0)) {
    const s = [];
    n.drawing.layers.forEach((r) => {
      s.push(r);
    });
    for (const r of s) G(r, !1) && t++;
  }
  return t;
}
const Xe = "nashepo.info.search.v2", Qe = "nashepo.info.keys.v1", ke = /* @__PURE__ */ new Set();
function $e(e) {
  for (const t of ke) t(e);
}
const Ct = (() => {
  try {
    return document.fonts?.check?.('16px "Material Symbols Outlined"') === !0;
  } catch {
    return !1;
  }
})();
function O(e, t) {
  return Ct ? '<span class="ic">' + e + "</span>" : '<span class="ic-text">' + t + "</span>";
}
function y(e) {
  return e.replace(/[&<>"]/g, (t) => t === "&" ? "&amp;" : t === "<" ? "&lt;" : t === ">" ? "&gt;" : "&quot;");
}
function Ot() {
  const e = Ge();
  try {
    const t = localStorage.getItem(Xe);
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
function te(e) {
  try {
    localStorage.setItem(Xe, JSON.stringify(e));
  } catch {
  }
}
function Mt() {
  try {
    const e = localStorage.getItem(Qe), t = e ? JSON.parse(e) : void 0;
    return Array.isArray(t) ? t.filter((n) => typeof n == "string") : [];
  } catch {
    return [];
  }
}
function Nt(e) {
  try {
    localStorage.setItem(Qe, JSON.stringify(e));
  } catch {
  }
}
function jt(e) {
  let t = e;
  for (; t; ) {
    const n = getComputedStyle(t).backgroundColor.match(/[\d.]+/g);
    if (n && n.length >= 3 && (n.length < 4 || Number(n[3]) > 0.1)) {
      const [s, r, l] = n.map(Number);
      return s * 0.299 + r * 0.587 + l * 0.114 > 140;
    }
    t = t.parentElement;
  }
  return !matchMedia("(prefers-color-scheme: dark)").matches;
}
function me(e, t) {
  const n = jt(e.parentElement ?? e);
  e.style.colorScheme = n ? "light" : "dark", t.classList.toggle("theme-light", n), t.classList.toggle("theme-dark", !n);
}
function It(e, t, n, s) {
  const r = e.attachShadow ? e.shadowRoot || e.attachShadow({ mode: "open" }) : e, l = Ot();
  r.innerHTML = "<style>" + n + '</style><main class="app" id="app"><div class="query"><input id="query" type="search" placeholder="Значение, имя, GUID, что угодно" value="' + y(l.query) + '"><button class="primary" id="find">Найти</button></div><div class="scope"><span class="scope-label">искать</span><div class="picker"><button id="param-button" class="picker-button" aria-expanded="false" title="Где искать"><span id="param-label" class="picker-value">везде</span>' + O("expand_more", "▾") + '</button><div id="param-popup" class="picker-popup" hidden><input id="param-filter" type="search" placeholder="параметр или его часть"><div id="param-options" class="picker-list"></div><div class="picker-foot">Enter — искать в том, что набрано</div></div></div><button id="param-clear" class="ib" title="Искать везде, по всем свойствам">' + O("close", "✕") + '</button></div><div class="options"><label><input id="case" type="checkbox"> учитывать регистр</label><label><input id="hidden" type="checkbox"> искать в скрытых</label></div><section class="block"><div class="block-head"><button class="fold" id="fold-conditions" aria-expanded="false">Условия отбора <span id="conditions-count"></span></button><button id="add-condition" title="Добавить условие">＋</button></div><div class="conditions" id="conditions" hidden></div></section><div class="toolbar"><button id="prev" class="ib" title="Предыдущий элемент">' + O("chevron_left", "‹") + '</button><button id="next" class="ib" title="Следующий элемент">' + O("chevron_right", "›") + '</button><button id="all" class="ib" title="Подсветить все найденные">' + O("select_all", "▣") + '</button><button id="reset" class="ib" title="Снять подсветку">' + O("deselect", "✕") + '</button><span class="sep"></span><button id="isolate-found" class="ib" title="Изолировать найденные: оставить видимым только список">' + O("filter_center_focus", "⊡") + '</button><button id="isolate-selected" class="ib" title="Изолировать выбранный элемент">' + O("center_focus_strong", "⊙") + '</button><button id="hide" class="ib" title="Скрыть элементы из списка">' + O("visibility_off", "⊘") + '</button><button id="show-all" class="ib" title="Показать всё скрытое в проекте">' + O("visibility", "◎") + '</button></div><div class="status" id="status">Введите значение и нажмите «Найти».</div><div class="list" id="list"><div class="empty">Пока ничего не найдено</div></div><section class="block props-block"><div class="block-head"><button class="fold" id="fold-props" aria-expanded="true">Свойства элемента</button><input id="prop-filter" type="search" placeholder="фильтр свойств"></div><div class="props" id="props"><div class="empty">Выберите элемент в списке</div></div></section><div class="hint">Щелчок по строке подсвечивает элемент и переводит к нему камеру. Версия ' + y(s) + "</div></main>";
  const a = r.querySelector("#app"), d = r.querySelector("#query"), v = r.querySelector("#param-button"), h = r.querySelector("#param-label"), z = r.querySelector("#param-popup"), k = r.querySelector("#param-filter"), P = r.querySelector("#param-options"), Ze = r.querySelector("#param-clear"), qe = r.querySelector("#hide"), Ce = r.querySelector("#show-all"), Oe = r.querySelector("#isolate-found"), Me = r.querySelector("#isolate-selected"), ae = r.querySelector("#case"), ce = r.querySelector("#hidden"), Ne = r.querySelector("#find"), je = r.querySelector("#all"), Ie = r.querySelector("#prev"), _e = r.querySelector("#next"), et = r.querySelector("#reset"), ze = r.querySelector("#status"), B = r.querySelector("#list"), I = r.querySelector("#conditions"), tt = r.querySelector("#conditions-count"), nt = r.querySelector("#add-condition"), le = r.querySelector("#fold-conditions"), Ae = r.querySelector("#fold-props"), K = r.querySelector("#props"), He = r.querySelector("#prop-filter");
  ae.checked = l.caseSensitive, ce.checked = l.includeHidden, me(e, a);
  let L = [], b = [], E = [], rt = 1, q = -1, w = !1, T, _ = l.property, F = Mt();
  function m(o, i = !1) {
    ze.textContent = o, ze.classList.toggle("error", i);
  }
  function J() {
    return {
      query: d.value,
      property: _,
      caseSensitive: ae.checked,
      includeHidden: ce.checked
    };
  }
  function C() {
    const o = b.length > 0, i = q >= 0 && b.some((c) => c.index === q);
    je.disabled = !o || w, Ie.disabled = !o || w, _e.disabled = !o || w, qe.disabled = !o || w, Oe.disabled = !o || w, Me.disabled = !i || w, Ne.disabled = w, Ce.disabled = w, a.classList.toggle("scoped", _.trim() !== ""), h.textContent = _.trim() || "везде", v.title = _.trim() ? "Искать в параметре: " + _ : "Искать везде, по всем свойствам";
  }
  function ot() {
    const o = new Set(F);
    for (const i of Re(L)) o.add(i);
    F = [...o].sort((i, c) => i.localeCompare(c, "ru")).slice(0, 1500), Nt(F);
  }
  function Pe() {
    const o = k.value.trim().toLowerCase(), i = F.filter((f) => !o || f.toLowerCase().includes(o)), c = /* @__PURE__ */ new Map();
    for (const f of i) {
      const p = be.includes(f) ? H : re(f).group, g = c.get(p);
      g ? g.push(f) : c.set(p, [f]);
    }
    const u = '<button class="picker-item' + (_.trim() ? "" : " active") + '" data-key="">везде, по всем свойствам</button>';
    if (!i.length) {
      P.innerHTML = u + '<div class="empty">' + (F.length ? "Ничего не подходит. Enter — искать в том, что набрано." : "Список появится после первого поиска. Имя параметра можно набрать и вручную.") + "</div>";
      return;
    }
    P.innerHTML = u + [...c.entries()].map(
      ([f, p]) => '<div class="picker-group">' + y(f) + "</div>" + p.map(
        (g) => '<button class="picker-item' + (g === _ ? " active" : "") + '" data-key="' + y(g) + '" title="' + y(g) + '">' + y(be.includes(g) ? g : re(g).name) + "</button>"
      ).join("")
    ).join("");
  }
  function X(o) {
    z.hidden = !o, v.setAttribute("aria-expanded", String(o)), o && (k.value = "", Pe(), k.focus());
  }
  function de(o) {
    _ = o, te(J()), C(), X(!1);
  }
  function A() {
    const o = Re(L);
    if (tt.textContent = E.length ? "· " + E.length : "", !E.length) {
      I.innerHTML = '<div class="empty">Условий нет. Кнопка ＋ добавит условие по свойству.</div>';
      return;
    }
    const i = /* @__PURE__ */ new Map();
    for (const c of o) {
      const { group: u, name: f } = re(c), p = ["Имя", "Модель", "Путь"].includes(c) ? H : u, g = p === H ? c : f, M = i.get(p);
      M ? M.push({ key: c, name: g }) : i.set(p, [{ key: c, name: g }]);
    }
    I.innerHTML = E.map((c) => {
      const u = ['<option value="">любое свойство</option>'].concat([...i.entries()].map(
        ([S, pe]) => '<optgroup label="' + y(S) + '">' + pe.map(
          (fe) => '<option value="' + y(fe.key) + '"' + (fe.key === c.key ? " selected" : "") + ">" + y(fe.name) + "</option>"
        ).join("") + "</optgroup>"
      )).join(""), f = Ke.map(
        (S) => '<option value="' + S.op + '"' + (S.op === c.op ? " selected" : "") + ">" + S.label + "</option>"
      ).join(""), p = Ke.find((S) => S.op === c.op)?.needsValue ?? !0, g = c.op === "gt" || c.op === "lt", M = p && !$(c), Z = M ? g && c.value.trim() !== "" ? "нужно число" : "введите значение" : "", x = p ? lt(L, c.key) : [], N = "cond-values-" + c.id, U = x.length ? '<datalist id="' + N + '">' + x.map((S) => '<option value="' + y(S) + '"></option>').join("") + "</datalist>" : "", j = g ? "число" : x.length ? "значение или часть" : "значение";
      return '<div class="condition' + (M ? " waiting" : "") + '" data-id="' + c.id + '"><select class="cond-key">' + u + '</select><select class="cond-op">' + f + '</select><input class="cond-value" type="search" placeholder="' + j + '" value="' + y(c.value) + '"' + (p ? "" : " disabled") + (x.length ? ' list="' + N + '"' : "") + '><button class="cond-remove" title="Удалить условие">×</button>' + U + (x.length ? '<div class="cond-hint">известных значений: ' + x.length + "</div>" : "") + (Z ? '<div class="cond-hint">' + Z + ", условие пока не применяется</div>" : "") + "</div>";
    }).join("");
  }
  function R() {
    if (!b.length) {
      B.innerHTML = '<div class="empty">' + (L.length ? "Условия отбора не пропустили ни одного элемента" : "Пока ничего не найдено") + "</div>";
      return;
    }
    B.innerHTML = b.map((o) => {
      const i = ge(o.layer);
      return '<div class="row' + (i ? "" : " dimmed") + '" data-index="' + o.index + '"><button class="row-main" data-index="' + o.index + '"><div class="name">' + y(o.name) + '</div><div class="meta"><span class="model">' + y(o.model) + "</span><span>" + y(o.path) + '</span></div><div class="match">' + y(o.match) + '</div></button><button class="row-eye ib" data-index="' + o.index + '" title="' + (i ? "Виден. Нажмите, чтобы скрыть" : "Скрыт. Нажмите, чтобы показать") + '">' + (i ? O("lightbulb", "◉") : O("light_off", "○")) + "</button></div>";
    }).join("");
  }
  function Y() {
    const o = T ?? b.find((f) => f.index === q);
    if (!o) {
      K.innerHTML = '<div class="empty">Выберите элемент в списке или в модели</div>';
      return;
    }
    const i = He.value.trim().toLowerCase(), c = wt(o).map((f) => ({
      group: f.group,
      rows: i ? f.rows.filter((p) => p.name.toLowerCase().includes(i) || p.key.toLowerCase().includes(i) || p.value.toLowerCase().includes(i)) : f.rows
    })).filter((f) => f.rows.length);
    if (!c.length) {
      K.innerHTML = '<div class="empty">Ничего не подходит под фильтр</div>';
      return;
    }
    const u = T ? '<div class="props-note">Элемент выбран в модели</div>' : "";
    K.innerHTML = u + c.map(
      (f) => '<div class="prop-group"><div class="prop-group-name" title="' + y(f.group) + '">' + y(f.group) + '</div><table class="props-table"><tbody>' + f.rows.map(
        (p) => '<tr><th title="' + y(p.key) + '">' + y(p.name) + '</th><td title="' + y(p.value) + '">' + y(p.value) + "</td></tr>"
      ).join("") + "</tbody></table></div>"
    ).join("");
  }
  function D(o = !1) {
    if (b = at(L, E), q = -1, R(), Y(), C(), o || !L.length) return;
    const i = E.filter($).length;
    m(i ? "Найдено: " + L.length + ". После отбора по " + i + " условиям: " + b.length + "." : "Найдено: " + L.length + ".");
  }
  function V(o) {
    q = o, T = void 0, B.querySelectorAll(".row").forEach((i) => {
      i.classList.toggle("active", Number(i.dataset.index) === o);
    }), B.querySelector(".row.active")?.scrollIntoView({ block: "nearest" }), Y(), C();
  }
  function ue(o) {
    if (o < 0 || o >= b.length) return;
    const i = b[o];
    if (!oe(t, [i.layer])) {
      m("Нет активного вида чертежа. Откройте окно проекта.", !0);
      return;
    }
    V(i.index), m("Элемент " + (o + 1) + " из " + b.length + ". " + i.model);
  }
  function Te() {
    return b.findIndex((o) => o.index === q);
  }
  async function it(o, i, c, u) {
    m("В параметре «" + c + "» ничего нет, смотрю остальные…");
    const f = await ye(o, { ...i, property: "" });
    if (!f.hits.length) {
      m("Ничего не найдено ни в параметре «" + c + "», ни в остальных. Просмотрено слоёв: " + u + ".");
      return;
    }
    const p = i.caseSensitive ? i.query.trim() : i.query.trim().toLowerCase(), g = /* @__PURE__ */ new Map();
    for (const x of f.hits) {
      const N = /* @__PURE__ */ new Set(), U = (j, S) => {
        const pe = i.caseSensitive ? S : S.toLowerCase();
        S && pe.includes(p) && N.add(j);
      };
      U("Имя", x.name), U("Путь", x.path);
      for (const j in x.props) U(j, x.props[j]);
      for (const j of N) g.set(j, (g.get(j) ?? 0) + 1);
    }
    const M = [...g.entries()].sort((x, N) => N[1] - x[1]).slice(0, 3), Z = M.length ? " Значение встречается в: " + M.map(([x, N]) => "«" + x + "» (" + N + ")").join(", ") + "." : "";
    m("В параметре «" + c + "» ничего нет, но по всем свойствам нашлось " + f.hits.length + "." + Z + " Крестик справа от выбора параметра вернёт поиск везде.");
  }
  async function Q() {
    const o = J();
    if (te(o), !o.query.trim() && !o.property.trim()) {
      m("Введите значение для поиска или укажите параметр.", !0);
      return;
    }
    const i = ne(t);
    if (!i) {
      m("Нет открытого проекта.", !0);
      return;
    }
    kt(t) || m("Нет активного вида чертежа. Поиск выполнится, но подсветка работать не будет."), w = !0, L = [], b = [], q = -1, C(), m("Поиск…");
    try {
      const c = await ye(i, o, (u, f, p) => {
        m("Просмотрено " + u + ", найдено " + f + (p ? ". " + p : ""));
      });
      if (L = c.hits, A(), ot(), D(!0), L.length) {
        const u = E.filter($).length ? " После условий отбора: " + b.length + "." : "";
        m("Найдено: " + L.length + "." + u + " Просмотрено слоёв: " + c.scanned + " в моделях: " + c.models + " за " + Math.round(c.elapsed / 100) / 10 + " с.");
      } else {
        const u = o.property.trim();
        u && o.query.trim() ? await it(i, o, u, c.scanned) : m("Ничего не найдено. Просмотрено слоёв: " + c.scanned + " в моделях: " + c.models + ".");
      }
    } catch (c) {
      m("Ошибка поиска: " + (c?.message ?? String(c)), !0);
    } finally {
      w = !1, C();
    }
  }
  Ne.addEventListener("click", () => {
    Q();
  }), d.addEventListener("keydown", (o) => {
    o.key === "Enter" && Q();
  }), v.addEventListener("click", () => X(z.hidden)), k.addEventListener("input", () => Pe()), k.addEventListener("keydown", (o) => {
    const i = o.key;
    if (i === "Escape") {
      X(!1);
      return;
    }
    if (i !== "Enter") return;
    const c = k.value.trim();
    de(c), Q();
  }), P.addEventListener("click", (o) => {
    const i = o.target.closest(".picker-item");
    i && (de(i.dataset.key ?? ""), Q());
  }), Ze.addEventListener("click", () => {
    de("");
  }), a.addEventListener("pointerdown", (o) => {
    if (z.hidden) return;
    const i = o.target;
    i.closest(".picker") || i.closest("#param-clear") || X(!1);
  }), ae.addEventListener("change", () => te(J())), ce.addEventListener("change", () => te(J())), qe.addEventListener("click", () => {
    (async () => {
      if (b.length) {
        w = !0, C(), m("Скрываю элементы…");
        try {
          const o = await Ue(b.map((i) => i.layer));
          xe(t), ee(t), R(), m("Скрыто элементов: " + o + ". Вернуть их можно кнопкой «Показать все».");
        } catch (o) {
          m("Не удалось скрыть: " + (o?.message ?? String(o)), !0);
        } finally {
          w = !1, C();
        }
      }
    })();
  });
  function Ve(o, i) {
    (async () => {
      const c = ne(t);
      if (!c) {
        m("Нет открытого проекта.", !0);
        return;
      }
      if (o.length) {
        w = !0, C(), m("Изолирую…");
        try {
          const u = await Lt(c, o);
          oe(t, o, !0), ee(t), R(), V(q), m("Изолировано: " + i + ", элементов " + o.length + ". Скрыто веток: " + u.hidden + ". Вернуть вид можно кнопкой показа всего.");
        } catch (u) {
          m("Не удалось изолировать: " + (u?.message ?? String(u)), !0);
        } finally {
          w = !1, C();
        }
      }
    })();
  }
  Oe.addEventListener("click", () => {
    Ve(b.map((o) => o.layer), "найденные");
  }), Me.addEventListener("click", () => {
    const o = b.find((i) => i.index === q);
    o && Ve([o.layer], "выбранный элемент");
  }), Ce.addEventListener("click", () => {
    (async () => {
      const o = ne(t);
      if (!o) {
        m("Нет открытого проекта.", !0);
        return;
      }
      w = !0, C(), m("Показываю скрытое…");
      try {
        const i = await qt(o);
        ee(t), R(), m(i ? "Показано элементов: " + i + "." : "Скрытых элементов не было.");
      } catch (i) {
        m("Не удалось показать: " + (i?.message ?? String(i)), !0);
      } finally {
        w = !1, C();
      }
    })();
  }), je.addEventListener("click", () => {
    if (b.length) {
      if (!oe(t, b.map((o) => o.layer))) {
        m("Нет активного вида чертежа. Откройте окно проекта.", !0);
        return;
      }
      q = -1, V(-1), m("Подсвечено элементов: " + b.length + ".");
    }
  }), Ie.addEventListener("click", () => {
    if (!b.length) return;
    const o = Te();
    ue(o <= 0 ? b.length - 1 : o - 1);
  }), _e.addEventListener("click", () => {
    if (!b.length) return;
    const o = Te();
    ue(o >= b.length - 1 ? 0 : o + 1);
  }), et.addEventListener("click", () => {
    xe(t), q = -1, V(-1), m("Выделение снято.");
  }), B.addEventListener("click", (o) => {
    const i = o.target, c = i.closest(".row-eye");
    if (c) {
      const p = b.find((g) => g.index === Number(c.dataset.index));
      if (!p) return;
      (async () => {
        try {
          ge(p.layer) ? await Ue([p.layer]) : await Et([p.layer]), ee(t), R(), V(q), m(ge(p.layer) ? "Элемент показан: " + p.name : "Элемент скрыт: " + p.name);
        } catch (g) {
          m("Не удалось изменить видимость: " + (g?.message ?? String(g)), !0);
        }
      })();
      return;
    }
    const u = i.closest(".row");
    if (!u) return;
    const f = Number(u.dataset.index);
    ue(b.findIndex((p) => p.index === f));
  }), nt.addEventListener("click", () => {
    E.push({ id: rt++, key: Se, op: "contains", value: "" }), I.hidden = !1, le.setAttribute("aria-expanded", "true"), A(), D();
  }), le.addEventListener("click", () => {
    const o = I.hidden;
    I.hidden = !o, le.setAttribute("aria-expanded", String(o)), o && A();
  }), Ae.addEventListener("click", () => {
    const o = K.hidden;
    K.hidden = !o, Ae.setAttribute("aria-expanded", String(o));
  }), He.addEventListener("input", () => Y()), I.addEventListener("click", (o) => {
    const i = o.target.closest(".cond-remove");
    if (!i) return;
    const c = Number(i.closest(".condition").dataset.id);
    E = E.filter((u) => u.id !== c), A(), D();
  }), I.addEventListener("change", (o) => {
    const i = o.target, c = i.closest(".condition");
    if (!c) return;
    const u = E.find((f) => f.id === Number(c.dataset.id));
    u && (i.classList.contains("cond-key") && (u.key = i.value, A()), i.classList.contains("cond-op") && (u.op = i.value, A()), i.classList.contains("cond-value") && (u.value = i.value), D());
  }), I.addEventListener("input", (o) => {
    const i = o.target;
    if (!i.classList.contains("cond-value")) return;
    const c = i.closest(".condition");
    if (!c) return;
    const u = E.find((M) => M.id === Number(c.dataset.id));
    if (!u) return;
    u.value = i.value;
    const f = u.op === "gt" || u.op === "lt", p = !$(u);
    c.classList.toggle("waiting", p);
    let g = c.querySelector(".cond-hint");
    p ? (g || (g = document.createElement("div"), g.className = "cond-hint", c.appendChild(g)), g.textContent = (f && u.value.trim() !== "" ? "нужно число" : "введите значение") + ", условие пока не применяется") : g && g.remove(), D();
  });
  const Be = (o) => {
    if (!e.isConnected) {
      ke.delete(Be);
      return;
    }
    if (!o.length) {
      if (!T) return;
      T = void 0, Y();
      return;
    }
    const i = o[0], c = b.find((u) => u.layer === i);
    if (c) {
      V(c.index);
      return;
    }
    T = xt(i), Y();
  };
  ke.add(Be), a.addEventListener("pointerdown", () => me(e, a)), setTimeout(() => me(e, a), 500), A(), C();
}
const _t = ':host,.app{--bg: rgb(var(--v-theme-surface, 30 30 30));--fg: rgb(var(--v-theme-on-surface, 235 240 245));--muted: color-mix(in srgb, var(--fg) 55%, transparent);--line: color-mix(in srgb, var(--fg) 18%, transparent);--soft: color-mix(in srgb, var(--fg) 7%, transparent);--accent: #f2c94c;--accent-fg: #16191e}*{box-sizing:border-box}[hidden]{display:none!important}.app{display:flex;flex-direction:column;height:100%;min-height:0;gap:7px;padding:9px;background:var(--bg);font:13px/1.45 Ubuntu,system-ui,sans-serif;color:var(--fg)}.query{display:flex;gap:6px}input[type=search],input[type=text],select{min-width:0;padding:6px 8px;border:1px solid var(--line);border-radius:7px;background:var(--soft);color:inherit;font:inherit}.query input[type=search]{flex:1;padding:8px 10px}input[type=search]:focus,select:focus{outline:2px solid var(--accent);outline-offset:-1px}button{padding:6px 10px;border:1px solid var(--line);border-radius:7px;background:var(--soft);color:inherit;font:inherit;cursor:pointer;white-space:nowrap}button:hover:not(:disabled){border-color:var(--accent)}button:disabled{opacity:.45;cursor:default}button.primary{background:var(--accent);color:var(--accent-fg);border-color:transparent;font-weight:700}.scope{display:flex;align-items:center;gap:6px}.scope-label{color:var(--muted);font-size:12px;white-space:nowrap}.app.scoped .scope-label{color:var(--accent)}.picker{position:relative;flex:1;min-width:0}.picker-button{display:flex;align-items:center;gap:4px;width:100%;padding:6px 8px;text-align:left}.picker-value{flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.app.scoped .picker-button{border-color:var(--accent)}.app.scoped .picker-value{color:var(--accent);font-weight:600}.picker-popup{position:absolute;z-index:20;top:calc(100% + 3px);left:0;right:0;display:flex;flex-direction:column;max-height:320px;padding:6px;border:1px solid var(--line);border-radius:8px;background:var(--bg);box-shadow:0 10px 28px #00000073}.picker-popup input{width:100%}.picker-list{flex:1;min-height:0;overflow:auto;margin-top:6px}.picker-group{padding:5px 6px 3px;color:var(--muted);font-size:11px;font-weight:700;overflow-wrap:anywhere}.picker-item{display:block;width:100%;padding:5px 8px;border:0;border-radius:6px;background:transparent;text-align:left;overflow-wrap:anywhere}.picker-item:hover{background:var(--soft)}.picker-item.active{background:color-mix(in srgb,var(--accent) 25%,transparent);font-weight:600}.picker-foot{padding-top:5px;color:var(--muted);font-size:11px}.options{display:flex;flex-wrap:wrap;gap:12px;color:var(--muted)}.options label{display:inline-flex;align-items:center;gap:5px}.block{border:1px solid var(--line);border-radius:8px}.block-head{display:flex;align-items:center;gap:6px;padding:4px 6px}.block-head .fold{flex:1;border:0;background:transparent;text-align:left;font-weight:600;padding:3px 2px}.block-head .fold:before{content:"▾ ";color:var(--muted)}.block-head .fold[aria-expanded=false]:before{content:"▸ "}.block-head input[type=search]{width:120px}.conditions{padding:0 6px 6px;display:flex;flex-direction:column;gap:5px}.condition{display:grid;grid-template-columns:minmax(0,1.3fr) minmax(0,.9fr) minmax(0,1fr) auto;gap:4px}.condition select,.condition input{font-size:12px}.condition.waiting select,.condition.waiting input{border-color:color-mix(in srgb,var(--accent) 60%,var(--line))}.cond-hint{grid-column:1 / -1;color:var(--muted);font-size:11px}.theme-dark{--popup-bg: #232323;--popup-fg: #edf1f6;--popup-head: #2f2f2f}.theme-light{--popup-bg: #ffffff;--popup-fg: #16191e;--popup-head: #ececec}option{background-color:var(--popup-bg, #232323);color:var(--popup-fg, #edf1f6)}optgroup{background-color:var(--popup-head, #2f2f2f);color:var(--popup-fg, #edf1f6);font-weight:700;font-style:normal}.bar{display:flex;align-items:center;gap:6px;flex-wrap:wrap}.bar .spacer{flex:1}.toolbar{display:flex;align-items:center;gap:2px;padding:2px;border:1px solid var(--line);border-radius:8px}.toolbar .sep{width:1px;align-self:stretch;margin:2px 4px;background:var(--line)}button.ib{display:inline-flex;align-items:center;justify-content:center;width:30px;height:28px;padding:0;border-color:transparent;background:transparent}button.ib:hover:not(:disabled){background:var(--soft);border-color:var(--line)}button.ib:active:not(:disabled){background:color-mix(in srgb,var(--accent) 25%,transparent)}.ic{font-family:Material Symbols Outlined;font-size:19px;line-height:1;font-weight:300;-webkit-font-feature-settings:"liga";font-variant-ligatures:common-ligatures}.ic-text{font-size:15px;line-height:1}.status{color:var(--muted);min-height:17px}.status.error{color:#ff6b6b}.list{flex:1 1 55%;min-height:90px;overflow:auto;border:1px solid var(--line);border-radius:8px}.row{display:flex;align-items:flex-start;gap:2px;width:100%;border-bottom:1px solid var(--line)}.row-main{flex:1;min-width:0;padding:6px 4px 6px 9px;border:0;border-radius:0;background:transparent;text-align:left;cursor:pointer}.row-eye{flex:none;margin:4px 5px 0 0;width:26px;height:24px}.row-eye .ic{font-size:17px}.row:last-child{border-bottom:0}.row:hover{background:var(--soft)}.row.active{background:color-mix(in srgb,var(--accent) 22%,transparent)}.row.dimmed .row-main{opacity:.5}.row.dimmed .row-eye{color:var(--muted)}.row .name{font-weight:600;word-break:break-word}.row .meta{display:flex;gap:6px;align-items:baseline;color:var(--muted);font-size:12px}.row .model{color:var(--accent)}.row .match{color:var(--muted);font-family:ui-monospace,Consolas,monospace;font-size:11px;word-break:break-all}.props-block{display:flex;flex-direction:column;flex:1 1 45%;min-height:90px}.props{flex:1;min-height:0;overflow:auto;padding:0 6px 6px}.props-note{padding:3px 5px;color:var(--accent);font-size:11px}.prop-group{margin-bottom:7px}.prop-group-name{padding:3px 5px;background:var(--soft);border-radius:5px;font-size:11px;font-weight:700;letter-spacing:.01em;overflow-wrap:anywhere}.props-table{width:100%;border-collapse:collapse;font-size:12px;table-layout:fixed}.props-table th,.props-table td{text-align:left;vertical-align:top;padding:3px 5px;border-bottom:1px solid var(--line);overflow-wrap:anywhere}.props-table th{width:42%;font-weight:500;color:var(--muted)}.empty{padding:14px;color:var(--muted);text-align:center}.hint{color:var(--muted);font-size:11px}', zt = "0.7.0", We = "nashepo.info/search_panel";
function ve(e) {
  return new Proxy(e, {
    get(t, n) {
      return n === "app" ? e.manager.activeApp : n === "cadview" ? e.manager.activeWindow?.context : Reflect.get(t, n);
    }
  });
}
const At = {
  /** Открыть панель поиска. */
  open(e) {
    e.manager.revealView(We);
  },
  /** Смонтировать панель. */
  mount(e) {
    const t = e.el;
    if (!t) return;
    const n = document.createElement("div");
    n.style.height = "100%", t.replaceChildren(n), It(n, ve(e), _t, zt);
  },
  /** Быстрый поиск: спросить значение и сразу подсветить все совпадения. */
  async quick(e) {
    const t = ve(e), n = ne(t);
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
    const r = { ...Ge(), query: s }, l = e.beginProgress();
    l.indeterminate = !0, l.label = "Поиск по проекту";
    let a;
    try {
      a = await ye(n, r, (v, h) => {
        l.details = "просмотрено " + v + ", найдено " + h;
      });
    } finally {
      e.endProgress(l);
    }
    if (!a.hits.length) {
      await e.showMessage("Ничего не найдено. Просмотрено слоёв: " + a.scanned + ".", "info");
      return;
    }
    const d = oe(t, a.hits.map((v) => v.layer));
    e.manager.revealView(We), await e.showMessage(
      d ? "Найдено элементов: " + a.hits.length + ". Они подсвечены в модели." : "Найдено элементов: " + a.hits.length + ", но активного вида чертежа нет.",
      d ? "info" : "warning"
    );
  },
  /** Снять подсветку. */
  clear(e) {
    xe(ve(e));
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
      $e([]);
      return;
    }
    const s = [], r = /* @__PURE__ */ new Set();
    try {
      for (const l of n.selectedObjects()) {
        const a = l?.layer;
        a && !r.has(a) && (r.add(a), s.push(a));
      }
    } catch {
      return;
    }
    $e(s);
  }
};
export {
  At as default
};
