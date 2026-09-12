const De = () => ({
  query: "",
  property: "",
  caseSensitive: !1,
  includeHidden: !1
}), He = [
  { op: "contains", label: "содержит", needsValue: !0 },
  { op: "notContains", label: "не содержит", needsValue: !0 },
  { op: "equals", label: "равно", needsValue: !0 },
  { op: "notEquals", label: "не равно", needsValue: !0 },
  { op: "gt", label: "больше", needsValue: !0 },
  { op: "lt", label: "меньше", needsValue: !0 },
  { op: "exists", label: "заполнено", needsValue: !1 },
  { op: "missing", label: "пусто", needsValue: !1 }
], xe = "", me = ["Имя", "Модель", "Путь"];
function Ue(e, t) {
  return t === "Имя" ? e.name : t === "Модель" ? e.model : t === "Путь" ? e.path : e.props[t];
}
function Ve(e) {
  const t = [e.name, e.model, e.path];
  for (const n in e.props) t.push(e.props[n]);
  return t;
}
function U(e) {
  const n = e.replace(/\s| /g, "").replace(",", ".").match(/-?\d+(\.\d+)?/);
  return n ? parseFloat(n[0]) : NaN;
}
function pe(e, t) {
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
      const l = U(e), a = U(t.value);
      return !Number.isFinite(l) || !Number.isFinite(a) ? !1 : t.op === "gt" ? l > a : l < a;
    }
    default:
      return !1;
  }
}
function ot(e, t) {
  return t.key !== xe ? pe(Ue(e, t.key), t) : t.op === "missing" ? Ve(e).every((n) => !pe(n, { ...t, op: "exists" })) : Ve(e).some((n) => pe(n, t));
}
function D(e) {
  return e.op === "exists" || e.op === "missing" ? !0 : e.value.trim() === "" ? !1 : e.op === "gt" || e.op === "lt" ? Number.isFinite(U(e.value)) : !0;
}
function it(e, t) {
  const n = t.filter(D);
  return n.length ? e.filter((s) => n.every((o) => ot(s, o))) : e;
}
function Be(e) {
  const t = /* @__PURE__ */ new Set();
  for (const s of e) for (const o in s.props) t.add(o);
  const n = [...t].sort((s, o) => s.localeCompare(o, "ru"));
  return [...me, ...n];
}
const st = 400;
function at(e, t) {
  if (t === xe) return [];
  const n = /* @__PURE__ */ new Set();
  for (const s of e) {
    const o = Ue(s, t);
    if (!(o === void 0 || o === "") && (n.add(o), n.size >= st))
      break;
  }
  return [...n].sort((s, o) => {
    const l = U(s), a = U(o);
    return Number.isFinite(l) && Number.isFinite(a) && l !== a ? l - a : s.localeCompare(o, "ru");
  });
}
const ct = 8, lt = 800, dt = 400;
function Ke(e) {
  if (!e) return;
  const t = e.model;
  if (!(!t || typeof t != "object" || !("attachments" in t)))
    return t.project ?? t;
}
function Z(e) {
  return Ke(e.app) ?? Ke(e.manager.activeApp);
}
function ke(e, t) {
  const n = [{ title: "Проект", drawing: e }];
  return e.attachments.forEach((s) => {
    if (!t && s.hidden) return;
    const o = s.model;
    o && n.push({ title: s.name ?? "Вложение", drawing: o });
  }), n;
}
function ut(e) {
  if (e == null) return;
  const t = typeof e;
  if (t === "string") return e;
  if (t === "number" || t === "boolean") return String(e);
}
const pt = /* @__PURE__ */ new Set([
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
function re(e) {
  const t = {};
  let n = 0;
  const s = (o, l, a) => {
    if (a > ct || n > lt) return;
    n++;
    const d = ut(o);
    if (d !== void 0) {
      l && d !== "" && (t[l] = d);
      return;
    }
    if (Array.isArray(o)) {
      for (let p = 0; p < o.length; p++) s(o[p], l + "[" + p + "]", a + 1);
      return;
    }
    if (!o || typeof o != "object") return;
    const m = o;
    if (m.$value !== void 0) {
      s(m.$value, l, a + 1);
      return;
    }
    for (const p in m)
      p.startsWith("$") || a === 0 && pt.has(p.toLowerCase()) || s(m[p], l ? l + "." + p : p, a + 1);
  };
  try {
    s(e.typedProperties(), "", 0);
  } catch {
  }
  return t;
}
function ft(e) {
  const t = e.lastIndexOf("|");
  if (t > 0) return e.slice(t + 1);
  const n = e.lastIndexOf(".");
  return n > 0 ? e.slice(n + 1) : e;
}
function ht(e, t, n) {
  const s = re(e);
  for (const o in s) {
    const l = s[o], a = n ? l : l.toLowerCase(), d = n ? o : o.toLowerCase();
    if (a.includes(t) || d.includes(t)) return o + ": " + l;
  }
}
function gt(e, t) {
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
function mt(e, t, n, s, o) {
  for (const [a, d] of gt(e, o)) {
    if (!a.toLowerCase().includes(t)) continue;
    if (!n) {
      if (d) return a + ": " + d;
      continue;
    }
    if ((s ? d : d.toLowerCase()).includes(n)) return a + ": " + d;
  }
  const l = re(e);
  for (const a in l) {
    const d = a.toLowerCase(), m = ft(a).toLowerCase();
    if (!d.includes(t) && !m.includes(t)) continue;
    const p = l[a];
    if (!n) return p ? a + ": " + p : void 0;
    if ((s ? p : p.toLowerCase()).includes(n)) return a + ": " + p;
  }
}
function vt(e, t, n, s) {
  const o = n.caseSensitive, l = n.property.trim().toLowerCase();
  if (l) return mt(e, l, t, o, s);
  const a = e.name ?? "";
  if ((o ? a : a.toLowerCase()).includes(t)) return "имя: " + a;
  const d = e.$path ?? "";
  if ((o ? d : d.toLowerCase()).includes(t)) return "путь: " + d;
  let m = "";
  try {
    m = e.typed?.name ?? "";
  } catch {
    m = "";
  }
  return m && (o ? m : m.toLowerCase()).includes(t) ? "тип: " + m : ht(e, t, o);
}
async function ve(e, t, n) {
  const s = Date.now(), o = t.query.trim(), l = t.caseSensitive ? o : o.toLowerCase(), a = [];
  let d = 0;
  if (!l && !t.property.trim()) return { hits: a, scanned: 0, models: 0, elapsed: 0 };
  const m = ke(e, t.includeHidden);
  for (const p of m) {
    const z = [];
    p.drawing.layers.forEach((k) => {
      z.push(k);
    });
    for (const k of z) {
      d++, d % dt === 0 && (n?.(d, a.length, p.title), await Fe());
      const T = vt(k, l, t, p.title);
      T && a.push({
        index: a.length,
        layer: k,
        name: k.name ?? "без имени",
        model: p.title,
        path: k.$path ?? "",
        match: T,
        props: {}
      });
    }
  }
  for (let p = 0; p < a.length; p++)
    a[p].props = re(a[p].layer), p % 200 === 0 && (n?.(d, a.length, "чтение свойств"), await Fe());
  return n?.(d, a.length, ""), { hits: a, scanned: d, models: m.length, elapsed: Date.now() - s };
}
function Fe() {
  return new Promise((e) => setTimeout(e, 0));
}
const be = "Прочее", P = "Элемент";
function ee(e) {
  const t = e.lastIndexOf("|");
  if (t > 0) return { group: e.slice(0, t), name: e.slice(t + 1) };
  const n = e.lastIndexOf(".");
  return n > 0 ? { group: e.slice(0, n), name: e.slice(n + 1) } : { group: be, name: e };
}
function bt(e) {
  const t = /* @__PURE__ */ new Map();
  t.set(P, [
    { key: "Имя", name: "Имя", value: e.name },
    { key: "Модель", name: "Модель", value: e.model },
    { key: "Путь", name: "Путь", value: e.path }
  ]);
  for (const s of Object.keys(e.props).sort((o, l) => o.localeCompare(l, "ru"))) {
    const { group: o, name: l } = ee(s), a = t.get(o), d = { key: s, name: l, value: e.props[s] };
    a ? a.push(d) : t.set(o, [d]);
  }
  const n = [...t.entries()].filter(([s]) => s !== P).sort((s, o) => s[0] === be ? 1 : o[0] === be ? -1 : s[0].localeCompare(o[0], "ru"));
  return [
    { group: P, rows: t.get(P) },
    ...n.map(([s, o]) => ({ group: s, rows: o }))
  ];
}
function yt(e) {
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
    props: re(e)
  };
}
function oe(e) {
  if (e.cadview) return e.cadview;
  const t = e.manager.activeWindow?.context;
  if (t) return t;
  for (const n of e.manager.windows) {
    const s = n.context;
    if (s) return s;
  }
}
function wt(e) {
  return oe(e) !== void 0;
}
function xt(e, t) {
  let n = e;
  for (let s = 0; n && s < 32; s++) {
    if (t.has(n)) return !0;
    n = n.layer;
  }
  return !1;
}
function te(e, t, n) {
  const s = oe(e);
  if (!s) return !1;
  const o = new Set(t), l = Math3d.box3.alloc(), a = Math3d.box3.alloc();
  let d = 0;
  if (s.layer.clearSelected(), o.size && s.layer.selectObjects((m) => {
    const p = m;
    return xt(p?.layer, o) ? (p.qbounds && p.qbounds(a) && (d === 0 ? Math3d.box3.dup(l, a) : Math3d.box3.addBox(l, a), d++), !0) : !1;
  }, !0), d > 0)
    try {
      s.camera.zoom(l, s);
    } catch {
    }
  return s.invalidate(), !0;
}
function ye(e) {
  const t = oe(e);
  return t ? (t.layer.clearSelected(), t.invalidate(), !0) : !1;
}
function fe(e) {
  oe(e)?.invalidate();
}
function ne(e, t) {
  try {
    return e.hidden === t ? !1 : (e.hidden = t, !0);
  } catch {
    return !1;
  }
}
function $e(e) {
  const t = [e];
  try {
    e.walkChilds((n) => {
      t.push(n);
    });
  } catch {
  }
  return t;
}
async function kt(e) {
  const t = /* @__PURE__ */ new Set();
  for (const s of e) for (const o of $e(s)) t.add(o);
  let n = 0;
  for (const s of t) ne(s, !0) && n++;
  return n;
}
async function St(e, t) {
  if (!t.length) return { visible: 0, hidden: 0 };
  const n = /* @__PURE__ */ new Set();
  for (const l of t) {
    for (const d of $e(l)) n.add(d);
    let a = l.layer;
    for (let d = 0; a && d < 64; d++)
      n.add(a), a = a.layer;
  }
  let s = 0, o = 0;
  for (const l of ke(e, !0)) {
    const a = [];
    l.drawing.layers.forEach((d) => {
      a.push(d);
    });
    for (const d of a)
      n.has(d) ? ne(d, !1) && s++ : ne(d, !0) && o++;
  }
  return { visible: s, hidden: o };
}
async function Lt(e) {
  let t = 0;
  for (const n of ke(e, !0)) {
    const s = [];
    n.drawing.layers.forEach((o) => {
      s.push(o);
    });
    for (const o of s) ne(o, !1) && t++;
  }
  return t;
}
const We = "nashepo.info.search.v2", Ge = "nashepo.info.keys.v1", we = /* @__PURE__ */ new Set();
function Re(e) {
  for (const t of we) t(e);
}
const Et = (() => {
  try {
    return document.fonts?.check?.('16px "Material Symbols Outlined"') === !0;
  } catch {
    return !1;
  }
})();
function M(e, t) {
  return Et ? '<span class="ic">' + e + "</span>" : '<span class="ic-text">' + t + "</span>";
}
function y(e) {
  return e.replace(/[&<>"]/g, (t) => t === "&" ? "&amp;" : t === "<" ? "&lt;" : t === ">" ? "&gt;" : "&quot;");
}
function qt() {
  const e = De();
  try {
    const t = localStorage.getItem(We);
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
function Q(e) {
  try {
    localStorage.setItem(We, JSON.stringify(e));
  } catch {
  }
}
function Ct() {
  try {
    const e = localStorage.getItem(Ge), t = e ? JSON.parse(e) : void 0;
    return Array.isArray(t) ? t.filter((n) => typeof n == "string") : [];
  } catch {
    return [];
  }
}
function Ot(e) {
  try {
    localStorage.setItem(Ge, JSON.stringify(e));
  } catch {
  }
}
function Mt(e) {
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
function he(e, t) {
  const n = Mt(e.parentElement ?? e);
  e.style.colorScheme = n ? "light" : "dark", t.classList.toggle("theme-light", n), t.classList.toggle("theme-dark", !n);
}
function Nt(e, t, n, s) {
  const o = e.attachShadow ? e.shadowRoot || e.attachShadow({ mode: "open" }) : e, l = qt();
  o.innerHTML = "<style>" + n + '</style><main class="app" id="app"><div class="query"><input id="query" type="search" placeholder="Значение, имя, GUID, что угодно" value="' + y(l.query) + '"><button class="primary" id="find">Найти</button></div><div class="scope"><span class="scope-label">искать</span><div class="picker"><button id="param-button" class="picker-button" aria-expanded="false" title="Где искать"><span id="param-label" class="picker-value">везде</span>' + M("expand_more", "▾") + '</button><div id="param-popup" class="picker-popup" hidden><input id="param-filter" type="search" placeholder="параметр или его часть"><div id="param-options" class="picker-list"></div><div class="picker-foot">Enter — искать в том, что набрано</div></div></div><button id="param-clear" class="ib" title="Искать везде, по всем свойствам">' + M("close", "✕") + '</button></div><div class="options"><label><input id="case" type="checkbox"> учитывать регистр</label><label><input id="hidden" type="checkbox"> искать в скрытых</label></div><section class="block"><div class="block-head"><button class="fold" id="fold-conditions" aria-expanded="false">Условия отбора <span id="conditions-count"></span></button><button id="add-condition" title="Добавить условие">＋</button></div><div class="conditions" id="conditions" hidden></div></section><div class="toolbar"><button id="prev" class="ib" title="Предыдущий элемент">' + M("chevron_left", "‹") + '</button><button id="next" class="ib" title="Следующий элемент">' + M("chevron_right", "›") + '</button><button id="all" class="ib" title="Подсветить все найденные">' + M("select_all", "▣") + '</button><button id="reset" class="ib" title="Снять подсветку">' + M("deselect", "✕") + '</button><span class="sep"></span><button id="isolate-found" class="ib" title="Изолировать найденные: оставить видимым только список">' + M("filter_center_focus", "⊡") + '</button><button id="isolate-selected" class="ib" title="Изолировать выбранный элемент">' + M("center_focus_strong", "⊙") + '</button><button id="hide" class="ib" title="Скрыть элементы из списка">' + M("visibility_off", "⊘") + '</button><button id="show-all" class="ib" title="Показать всё скрытое в проекте">' + M("visibility", "◎") + '</button></div><div class="status" id="status">Введите значение и нажмите «Найти».</div><div class="list" id="list"><div class="empty">Пока ничего не найдено</div></div><section class="block props-block"><div class="block-head"><button class="fold" id="fold-props" aria-expanded="true">Свойства элемента</button><input id="prop-filter" type="search" placeholder="фильтр свойств"></div><div class="props" id="props"><div class="empty">Выберите элемент в списке</div></div></section><div class="hint">Щелчок по строке подсвечивает элемент и переводит к нему камеру. Версия ' + y(s) + "</div></main>";
  const a = o.querySelector("#app"), d = o.querySelector("#query"), m = o.querySelector("#param-button"), p = o.querySelector("#param-label"), z = o.querySelector("#param-popup"), k = o.querySelector("#param-filter"), T = o.querySelector("#param-options"), Je = o.querySelector("#param-clear"), Se = o.querySelector("#hide"), Le = o.querySelector("#show-all"), Ee = o.querySelector("#isolate-found"), qe = o.querySelector("#isolate-selected"), ie = o.querySelector("#case"), se = o.querySelector("#hidden"), Ce = o.querySelector("#find"), Oe = o.querySelector("#all"), Me = o.querySelector("#prev"), Ne = o.querySelector("#next"), Xe = o.querySelector("#reset"), je = o.querySelector("#status"), V = o.querySelector("#list"), I = o.querySelector("#conditions"), Qe = o.querySelector("#conditions-count"), Ze = o.querySelector("#add-condition"), ae = o.querySelector("#fold-conditions"), Ie = o.querySelector("#fold-props"), B = o.querySelector("#props"), _e = o.querySelector("#prop-filter");
  ie.checked = l.caseSensitive, se.checked = l.includeHidden, he(e, a);
  let L = [], b = [], E = [], et = 1, C = -1, w = !1, H, _ = l.property, K = Ct();
  function g(r, i = !1) {
    je.textContent = r, je.classList.toggle("error", i);
  }
  function $() {
    return {
      query: d.value,
      property: _,
      caseSensitive: ie.checked,
      includeHidden: se.checked
    };
  }
  function q() {
    const r = b.length > 0, i = C >= 0 && b.some((c) => c.index === C);
    Oe.disabled = !r || w, Me.disabled = !r || w, Ne.disabled = !r || w, Se.disabled = !r || w, Ee.disabled = !r || w, qe.disabled = !i || w, Ce.disabled = w, Le.disabled = w, a.classList.toggle("scoped", _.trim() !== ""), p.textContent = _.trim() || "везде", m.title = _.trim() ? "Искать в параметре: " + _ : "Искать везде, по всем свойствам";
  }
  function tt() {
    const r = new Set(K);
    for (const i of Be(L)) r.add(i);
    K = [...r].sort((i, c) => i.localeCompare(c, "ru")).slice(0, 1500), Ot(K);
  }
  function ze() {
    const r = k.value.trim().toLowerCase(), i = K.filter((f) => !r || f.toLowerCase().includes(r)), c = /* @__PURE__ */ new Map();
    for (const f of i) {
      const h = me.includes(f) ? P : ee(f).group, v = c.get(h);
      v ? v.push(f) : c.set(h, [f]);
    }
    const u = '<button class="picker-item' + (_.trim() ? "" : " active") + '" data-key="">везде, по всем свойствам</button>';
    if (!i.length) {
      T.innerHTML = u + '<div class="empty">' + (K.length ? "Ничего не подходит. Enter — искать в том, что набрано." : "Список появится после первого поиска. Имя параметра можно набрать и вручную.") + "</div>";
      return;
    }
    T.innerHTML = u + [...c.entries()].map(
      ([f, h]) => '<div class="picker-group">' + y(f) + "</div>" + h.map(
        (v) => '<button class="picker-item' + (v === _ ? " active" : "") + '" data-key="' + y(v) + '" title="' + y(v) + '">' + y(me.includes(v) ? v : ee(v).name) + "</button>"
      ).join("")
    ).join("");
  }
  function W(r) {
    z.hidden = !r, m.setAttribute("aria-expanded", String(r)), r && (k.value = "", ze(), k.focus());
  }
  function ce(r) {
    _ = r, Q($()), q(), W(!1);
  }
  function A() {
    const r = Be(L);
    if (Qe.textContent = E.length ? "· " + E.length : "", !E.length) {
      I.innerHTML = '<div class="empty">Условий нет. Кнопка ＋ добавит условие по свойству.</div>';
      return;
    }
    const i = /* @__PURE__ */ new Map();
    for (const c of r) {
      const { group: u, name: f } = ee(c), h = ["Имя", "Модель", "Путь"].includes(c) ? P : u, v = h === P ? c : f, O = i.get(h);
      O ? O.push({ key: c, name: v }) : i.set(h, [{ key: c, name: v }]);
    }
    I.innerHTML = E.map((c) => {
      const u = ['<option value="">любое свойство</option>'].concat([...i.entries()].map(
        ([S, de]) => '<optgroup label="' + y(S) + '">' + de.map(
          (ue) => '<option value="' + y(ue.key) + '"' + (ue.key === c.key ? " selected" : "") + ">" + y(ue.name) + "</option>"
        ).join("") + "</optgroup>"
      )).join(""), f = He.map(
        (S) => '<option value="' + S.op + '"' + (S.op === c.op ? " selected" : "") + ">" + S.label + "</option>"
      ).join(""), h = He.find((S) => S.op === c.op)?.needsValue ?? !0, v = c.op === "gt" || c.op === "lt", O = h && !D(c), X = O ? v && c.value.trim() !== "" ? "нужно число" : "введите значение" : "", x = h ? at(L, c.key) : [], N = "cond-values-" + c.id, Y = x.length ? '<datalist id="' + N + '">' + x.map((S) => '<option value="' + y(S) + '"></option>').join("") + "</datalist>" : "", j = v ? "число" : x.length ? "значение или часть" : "значение";
      return '<div class="condition' + (O ? " waiting" : "") + '" data-id="' + c.id + '"><select class="cond-key">' + u + '</select><select class="cond-op">' + f + '</select><input class="cond-value" type="search" placeholder="' + j + '" value="' + y(c.value) + '"' + (h ? "" : " disabled") + (x.length ? ' list="' + N + '"' : "") + '><button class="cond-remove" title="Удалить условие">×</button>' + Y + (x.length ? '<div class="cond-hint">известных значений: ' + x.length + "</div>" : "") + (X ? '<div class="cond-hint">' + X + ", условие пока не применяется</div>" : "") + "</div>";
    }).join("");
  }
  function nt() {
    if (!b.length) {
      V.innerHTML = '<div class="empty">' + (L.length ? "Условия отбора не пропустили ни одного элемента" : "Пока ничего не найдено") + "</div>";
      return;
    }
    V.innerHTML = b.map(
      (r) => '<button class="row" data-index="' + r.index + '"><div class="name">' + y(r.name) + '</div><div class="meta"><span class="model">' + y(r.model) + "</span><span>" + y(r.path) + '</span></div><div class="match">' + y(r.match) + "</div></button>"
    ).join("");
  }
  function F() {
    const r = H ?? b.find((f) => f.index === C);
    if (!r) {
      B.innerHTML = '<div class="empty">Выберите элемент в списке или в модели</div>';
      return;
    }
    const i = _e.value.trim().toLowerCase(), c = bt(r).map((f) => ({
      group: f.group,
      rows: i ? f.rows.filter((h) => h.name.toLowerCase().includes(i) || h.key.toLowerCase().includes(i) || h.value.toLowerCase().includes(i)) : f.rows
    })).filter((f) => f.rows.length);
    if (!c.length) {
      B.innerHTML = '<div class="empty">Ничего не подходит под фильтр</div>';
      return;
    }
    const u = H ? '<div class="props-note">Элемент выбран в модели</div>' : "";
    B.innerHTML = u + c.map(
      (f) => '<div class="prop-group"><div class="prop-group-name" title="' + y(f.group) + '">' + y(f.group) + '</div><table class="props-table"><tbody>' + f.rows.map(
        (h) => '<tr><th title="' + y(h.key) + '">' + y(h.name) + '</th><td title="' + y(h.value) + '">' + y(h.value) + "</td></tr>"
      ).join("") + "</tbody></table></div>"
    ).join("");
  }
  function R(r = !1) {
    if (b = it(L, E), C = -1, nt(), F(), q(), r || !L.length) return;
    const i = E.filter(D).length;
    g(i ? "Найдено: " + L.length + ". После отбора по " + i + " условиям: " + b.length + "." : "Найдено: " + L.length + ".");
  }
  function G(r) {
    C = r, H = void 0, V.querySelectorAll(".row").forEach((i) => {
      i.classList.toggle("active", Number(i.dataset.index) === r);
    }), V.querySelector(".row.active")?.scrollIntoView({ block: "nearest" }), F(), q();
  }
  function le(r) {
    if (r < 0 || r >= b.length) return;
    const i = b[r];
    if (!te(t, [i.layer])) {
      g("Нет активного вида чертежа. Откройте окно проекта.", !0);
      return;
    }
    G(i.index), g("Элемент " + (r + 1) + " из " + b.length + ". " + i.model);
  }
  function Ae() {
    return b.findIndex((r) => r.index === C);
  }
  async function rt(r, i, c, u) {
    g("В параметре «" + c + "» ничего нет, смотрю остальные…");
    const f = await ve(r, { ...i, property: "" });
    if (!f.hits.length) {
      g("Ничего не найдено ни в параметре «" + c + "», ни в остальных. Просмотрено слоёв: " + u + ".");
      return;
    }
    const h = i.caseSensitive ? i.query.trim() : i.query.trim().toLowerCase(), v = /* @__PURE__ */ new Map();
    for (const x of f.hits) {
      const N = /* @__PURE__ */ new Set(), Y = (j, S) => {
        const de = i.caseSensitive ? S : S.toLowerCase();
        S && de.includes(h) && N.add(j);
      };
      Y("Имя", x.name), Y("Путь", x.path);
      for (const j in x.props) Y(j, x.props[j]);
      for (const j of N) v.set(j, (v.get(j) ?? 0) + 1);
    }
    const O = [...v.entries()].sort((x, N) => N[1] - x[1]).slice(0, 3), X = O.length ? " Значение встречается в: " + O.map(([x, N]) => "«" + x + "» (" + N + ")").join(", ") + "." : "";
    g("В параметре «" + c + "» ничего нет, но по всем свойствам нашлось " + f.hits.length + "." + X + " Крестик справа от выбора параметра вернёт поиск везде.");
  }
  async function J() {
    const r = $();
    if (Q(r), !r.query.trim() && !r.property.trim()) {
      g("Введите значение для поиска или укажите параметр.", !0);
      return;
    }
    const i = Z(t);
    if (!i) {
      g("Нет открытого проекта.", !0);
      return;
    }
    wt(t) || g("Нет активного вида чертежа. Поиск выполнится, но подсветка работать не будет."), w = !0, L = [], b = [], C = -1, q(), g("Поиск…");
    try {
      const c = await ve(i, r, (u, f, h) => {
        g("Просмотрено " + u + ", найдено " + f + (h ? ". " + h : ""));
      });
      if (L = c.hits, A(), tt(), R(!0), L.length) {
        const u = E.filter(D).length ? " После условий отбора: " + b.length + "." : "";
        g("Найдено: " + L.length + "." + u + " Просмотрено слоёв: " + c.scanned + " в моделях: " + c.models + " за " + Math.round(c.elapsed / 100) / 10 + " с.");
      } else {
        const u = r.property.trim();
        u && r.query.trim() ? await rt(i, r, u, c.scanned) : g("Ничего не найдено. Просмотрено слоёв: " + c.scanned + " в моделях: " + c.models + ".");
      }
    } catch (c) {
      g("Ошибка поиска: " + (c?.message ?? String(c)), !0);
    } finally {
      w = !1, q();
    }
  }
  Ce.addEventListener("click", () => {
    J();
  }), d.addEventListener("keydown", (r) => {
    r.key === "Enter" && J();
  }), m.addEventListener("click", () => W(z.hidden)), k.addEventListener("input", () => ze()), k.addEventListener("keydown", (r) => {
    const i = r.key;
    if (i === "Escape") {
      W(!1);
      return;
    }
    if (i !== "Enter") return;
    const c = k.value.trim();
    ce(c), J();
  }), T.addEventListener("click", (r) => {
    const i = r.target.closest(".picker-item");
    i && (ce(i.dataset.key ?? ""), J());
  }), Je.addEventListener("click", () => {
    ce("");
  }), a.addEventListener("pointerdown", (r) => {
    if (z.hidden) return;
    const i = r.target;
    i.closest(".picker") || i.closest("#param-clear") || W(!1);
  }), ie.addEventListener("change", () => Q($())), se.addEventListener("change", () => Q($())), Se.addEventListener("click", () => {
    (async () => {
      if (b.length) {
        w = !0, q(), g("Скрываю элементы…");
        try {
          const r = await kt(b.map((i) => i.layer));
          ye(t), fe(t), g("Скрыто элементов: " + r + ". Вернуть их можно кнопкой «Показать все».");
        } catch (r) {
          g("Не удалось скрыть: " + (r?.message ?? String(r)), !0);
        } finally {
          w = !1, q();
        }
      }
    })();
  });
  function Pe(r, i) {
    (async () => {
      const c = Z(t);
      if (!c) {
        g("Нет открытого проекта.", !0);
        return;
      }
      if (r.length) {
        w = !0, q(), g("Изолирую…");
        try {
          const u = await St(c, r);
          te(t, r, !0), fe(t), g("Изолировано: " + i + ", элементов " + r.length + ". Скрыто веток: " + u.hidden + ". Вернуть вид можно кнопкой показа всего.");
        } catch (u) {
          g("Не удалось изолировать: " + (u?.message ?? String(u)), !0);
        } finally {
          w = !1, q();
        }
      }
    })();
  }
  Ee.addEventListener("click", () => {
    Pe(b.map((r) => r.layer), "найденные");
  }), qe.addEventListener("click", () => {
    const r = b.find((i) => i.index === C);
    r && Pe([r.layer], "выбранный элемент");
  }), Le.addEventListener("click", () => {
    (async () => {
      const r = Z(t);
      if (!r) {
        g("Нет открытого проекта.", !0);
        return;
      }
      w = !0, q(), g("Показываю скрытое…");
      try {
        const i = await Lt(r);
        fe(t), g(i ? "Показано элементов: " + i + "." : "Скрытых элементов не было.");
      } catch (i) {
        g("Не удалось показать: " + (i?.message ?? String(i)), !0);
      } finally {
        w = !1, q();
      }
    })();
  }), Oe.addEventListener("click", () => {
    if (b.length) {
      if (!te(t, b.map((r) => r.layer))) {
        g("Нет активного вида чертежа. Откройте окно проекта.", !0);
        return;
      }
      C = -1, G(-1), g("Подсвечено элементов: " + b.length + ".");
    }
  }), Me.addEventListener("click", () => {
    if (!b.length) return;
    const r = Ae();
    le(r <= 0 ? b.length - 1 : r - 1);
  }), Ne.addEventListener("click", () => {
    if (!b.length) return;
    const r = Ae();
    le(r >= b.length - 1 ? 0 : r + 1);
  }), Xe.addEventListener("click", () => {
    ye(t), C = -1, G(-1), g("Выделение снято.");
  }), V.addEventListener("click", (r) => {
    const i = r.target.closest(".row");
    if (!i) return;
    const c = Number(i.dataset.index);
    le(b.findIndex((u) => u.index === c));
  }), Ze.addEventListener("click", () => {
    E.push({ id: et++, key: xe, op: "contains", value: "" }), I.hidden = !1, ae.setAttribute("aria-expanded", "true"), A(), R();
  }), ae.addEventListener("click", () => {
    const r = I.hidden;
    I.hidden = !r, ae.setAttribute("aria-expanded", String(r)), r && A();
  }), Ie.addEventListener("click", () => {
    const r = B.hidden;
    B.hidden = !r, Ie.setAttribute("aria-expanded", String(r));
  }), _e.addEventListener("input", () => F()), I.addEventListener("click", (r) => {
    const i = r.target.closest(".cond-remove");
    if (!i) return;
    const c = Number(i.closest(".condition").dataset.id);
    E = E.filter((u) => u.id !== c), A(), R();
  }), I.addEventListener("change", (r) => {
    const i = r.target, c = i.closest(".condition");
    if (!c) return;
    const u = E.find((f) => f.id === Number(c.dataset.id));
    u && (i.classList.contains("cond-key") && (u.key = i.value, A()), i.classList.contains("cond-op") && (u.op = i.value, A()), i.classList.contains("cond-value") && (u.value = i.value), R());
  }), I.addEventListener("input", (r) => {
    const i = r.target;
    if (!i.classList.contains("cond-value")) return;
    const c = i.closest(".condition");
    if (!c) return;
    const u = E.find((O) => O.id === Number(c.dataset.id));
    if (!u) return;
    u.value = i.value;
    const f = u.op === "gt" || u.op === "lt", h = !D(u);
    c.classList.toggle("waiting", h);
    let v = c.querySelector(".cond-hint");
    h ? (v || (v = document.createElement("div"), v.className = "cond-hint", c.appendChild(v)), v.textContent = (f && u.value.trim() !== "" ? "нужно число" : "введите значение") + ", условие пока не применяется") : v && v.remove(), R();
  });
  const Te = (r) => {
    if (!e.isConnected) {
      we.delete(Te);
      return;
    }
    if (!r.length) {
      if (!H) return;
      H = void 0, F();
      return;
    }
    const i = r[0], c = b.find((u) => u.layer === i);
    if (c) {
      G(c.index);
      return;
    }
    H = yt(i), F();
  };
  we.add(Te), a.addEventListener("pointerdown", () => he(e, a)), setTimeout(() => he(e, a), 500), A(), q();
}
const jt = ':host,.app{--bg: rgb(var(--v-theme-surface, 30 30 30));--fg: rgb(var(--v-theme-on-surface, 235 240 245));--muted: color-mix(in srgb, var(--fg) 55%, transparent);--line: color-mix(in srgb, var(--fg) 18%, transparent);--soft: color-mix(in srgb, var(--fg) 7%, transparent);--accent: #f2c94c;--accent-fg: #16191e}*{box-sizing:border-box}[hidden]{display:none!important}.app{display:flex;flex-direction:column;height:100%;min-height:0;gap:7px;padding:9px;background:var(--bg);font:13px/1.45 Ubuntu,system-ui,sans-serif;color:var(--fg)}.query{display:flex;gap:6px}input[type=search],input[type=text],select{min-width:0;padding:6px 8px;border:1px solid var(--line);border-radius:7px;background:var(--soft);color:inherit;font:inherit}.query input[type=search]{flex:1;padding:8px 10px}input[type=search]:focus,select:focus{outline:2px solid var(--accent);outline-offset:-1px}button{padding:6px 10px;border:1px solid var(--line);border-radius:7px;background:var(--soft);color:inherit;font:inherit;cursor:pointer;white-space:nowrap}button:hover:not(:disabled){border-color:var(--accent)}button:disabled{opacity:.45;cursor:default}button.primary{background:var(--accent);color:var(--accent-fg);border-color:transparent;font-weight:700}.scope{display:flex;align-items:center;gap:6px}.scope-label{color:var(--muted);font-size:12px;white-space:nowrap}.app.scoped .scope-label{color:var(--accent)}.picker{position:relative;flex:1;min-width:0}.picker-button{display:flex;align-items:center;gap:4px;width:100%;padding:6px 8px;text-align:left}.picker-value{flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.app.scoped .picker-button{border-color:var(--accent)}.app.scoped .picker-value{color:var(--accent);font-weight:600}.picker-popup{position:absolute;z-index:20;top:calc(100% + 3px);left:0;right:0;display:flex;flex-direction:column;max-height:320px;padding:6px;border:1px solid var(--line);border-radius:8px;background:var(--bg);box-shadow:0 10px 28px #00000073}.picker-popup input{width:100%}.picker-list{flex:1;min-height:0;overflow:auto;margin-top:6px}.picker-group{padding:5px 6px 3px;color:var(--muted);font-size:11px;font-weight:700;overflow-wrap:anywhere}.picker-item{display:block;width:100%;padding:5px 8px;border:0;border-radius:6px;background:transparent;text-align:left;overflow-wrap:anywhere}.picker-item:hover{background:var(--soft)}.picker-item.active{background:color-mix(in srgb,var(--accent) 25%,transparent);font-weight:600}.picker-foot{padding-top:5px;color:var(--muted);font-size:11px}.options{display:flex;flex-wrap:wrap;gap:12px;color:var(--muted)}.options label{display:inline-flex;align-items:center;gap:5px}.block{border:1px solid var(--line);border-radius:8px}.block-head{display:flex;align-items:center;gap:6px;padding:4px 6px}.block-head .fold{flex:1;border:0;background:transparent;text-align:left;font-weight:600;padding:3px 2px}.block-head .fold:before{content:"▾ ";color:var(--muted)}.block-head .fold[aria-expanded=false]:before{content:"▸ "}.block-head input[type=search]{width:120px}.conditions{padding:0 6px 6px;display:flex;flex-direction:column;gap:5px}.condition{display:grid;grid-template-columns:minmax(0,1.3fr) minmax(0,.9fr) minmax(0,1fr) auto;gap:4px}.condition select,.condition input{font-size:12px}.condition.waiting select,.condition.waiting input{border-color:color-mix(in srgb,var(--accent) 60%,var(--line))}.cond-hint{grid-column:1 / -1;color:var(--muted);font-size:11px}.theme-dark{--popup-bg: #232323;--popup-fg: #edf1f6;--popup-head: #2f2f2f}.theme-light{--popup-bg: #ffffff;--popup-fg: #16191e;--popup-head: #ececec}option{background-color:var(--popup-bg, #232323);color:var(--popup-fg, #edf1f6)}optgroup{background-color:var(--popup-head, #2f2f2f);color:var(--popup-fg, #edf1f6);font-weight:700;font-style:normal}.bar{display:flex;align-items:center;gap:6px;flex-wrap:wrap}.bar .spacer{flex:1}.toolbar{display:flex;align-items:center;gap:2px;padding:2px;border:1px solid var(--line);border-radius:8px}.toolbar .sep{width:1px;align-self:stretch;margin:2px 4px;background:var(--line)}button.ib{display:inline-flex;align-items:center;justify-content:center;width:30px;height:28px;padding:0;border-color:transparent;background:transparent}button.ib:hover:not(:disabled){background:var(--soft);border-color:var(--line)}button.ib:active:not(:disabled){background:color-mix(in srgb,var(--accent) 25%,transparent)}.ic{font-family:Material Symbols Outlined;font-size:19px;line-height:1;font-weight:300;-webkit-font-feature-settings:"liga";font-variant-ligatures:common-ligatures}.ic-text{font-size:15px;line-height:1}.status{color:var(--muted);min-height:17px}.status.error{color:#ff6b6b}.list{flex:1 1 55%;min-height:90px;overflow:auto;border:1px solid var(--line);border-radius:8px}.row{display:block;width:100%;padding:6px 9px;border:0;border-bottom:1px solid var(--line);border-radius:0;background:transparent;text-align:left;cursor:pointer}.row:last-child{border-bottom:0}.row:hover{background:var(--soft)}.row.active{background:color-mix(in srgb,var(--accent) 22%,transparent)}.row .name{font-weight:600;word-break:break-word}.row .meta{display:flex;gap:6px;align-items:baseline;color:var(--muted);font-size:12px}.row .model{color:var(--accent)}.row .match{color:var(--muted);font-family:ui-monospace,Consolas,monospace;font-size:11px;word-break:break-all}.props-block{display:flex;flex-direction:column;flex:1 1 45%;min-height:90px}.props{flex:1;min-height:0;overflow:auto;padding:0 6px 6px}.props-note{padding:3px 5px;color:var(--accent);font-size:11px}.prop-group{margin-bottom:7px}.prop-group-name{padding:3px 5px;background:var(--soft);border-radius:5px;font-size:11px;font-weight:700;letter-spacing:.01em;overflow-wrap:anywhere}.props-table{width:100%;border-collapse:collapse;font-size:12px;table-layout:fixed}.props-table th,.props-table td{text-align:left;vertical-align:top;padding:3px 5px;border-bottom:1px solid var(--line);overflow-wrap:anywhere}.props-table th{width:42%;font-weight:500;color:var(--muted)}.empty{padding:14px;color:var(--muted);text-align:center}.hint{color:var(--muted);font-size:11px}', It = "0.6.2", Ye = "nashepo.info/search_panel";
function ge(e) {
  return new Proxy(e, {
    get(t, n) {
      return n === "app" ? e.manager.activeApp : n === "cadview" ? e.manager.activeWindow?.context : Reflect.get(t, n);
    }
  });
}
const _t = {
  /** Открыть панель поиска. */
  open(e) {
    e.manager.revealView(Ye);
  },
  /** Смонтировать панель. */
  mount(e) {
    const t = e.el;
    if (!t) return;
    const n = document.createElement("div");
    n.style.height = "100%", t.replaceChildren(n), Nt(n, ge(e), jt, It);
  },
  /** Быстрый поиск: спросить значение и сразу подсветить все совпадения. */
  async quick(e) {
    const t = ge(e), n = Z(t);
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
    const o = { ...De(), query: s }, l = e.beginProgress();
    l.indeterminate = !0, l.label = "Поиск по проекту";
    let a;
    try {
      a = await ve(n, o, (m, p) => {
        l.details = "просмотрено " + m + ", найдено " + p;
      });
    } finally {
      e.endProgress(l);
    }
    if (!a.hits.length) {
      await e.showMessage("Ничего не найдено. Просмотрено слоёв: " + a.scanned + ".", "info");
      return;
    }
    const d = te(t, a.hits.map((m) => m.layer));
    e.manager.revealView(Ye), await e.showMessage(
      d ? "Найдено элементов: " + a.hits.length + ". Они подсвечены в модели." : "Найдено элементов: " + a.hits.length + ", но активного вида чертежа нет.",
      d ? "info" : "warning"
    );
  },
  /** Снять подсветку. */
  clear(e) {
    ye(ge(e));
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
      Re([]);
      return;
    }
    const s = [], o = /* @__PURE__ */ new Set();
    try {
      for (const l of n.selectedObjects()) {
        const a = l?.layer;
        a && !o.has(a) && (o.add(a), s.push(a));
      }
    } catch {
      return;
    }
    Re(s);
  }
};
export {
  _t as default
};
