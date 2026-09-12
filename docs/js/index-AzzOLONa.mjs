const Re = () => ({
  query: "",
  property: "",
  caseSensitive: !1,
  includeHidden: !1
}), Pe = [
  { op: "contains", label: "содержит", needsValue: !0 },
  { op: "notContains", label: "не содержит", needsValue: !0 },
  { op: "equals", label: "равно", needsValue: !0 },
  { op: "notEquals", label: "не равно", needsValue: !0 },
  { op: "gt", label: "больше", needsValue: !0 },
  { op: "lt", label: "меньше", needsValue: !0 },
  { op: "exists", label: "заполнено", needsValue: !1 },
  { op: "missing", label: "пусто", needsValue: !1 }
], be = "", fe = ["Имя", "Модель", "Путь"];
function Ye(e, t) {
  return t === "Имя" ? e.name : t === "Модель" ? e.model : t === "Путь" ? e.path : e.props[t];
}
function Te(e) {
  const t = [e.name, e.model, e.path];
  for (const n in e.props) t.push(e.props[n]);
  return t;
}
function U(e) {
  const n = e.replace(/\s| /g, "").replace(",", ".").match(/-?\d+(\.\d+)?/);
  return n ? parseFloat(n[0]) : NaN;
}
function de(e, t) {
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
function tt(e, t) {
  return t.key !== be ? de(Ye(e, t.key), t) : t.op === "missing" ? Te(e).every((n) => !de(n, { ...t, op: "exists" })) : Te(e).some((n) => de(n, t));
}
function D(e) {
  return e.op === "exists" || e.op === "missing" ? !0 : e.value.trim() === "" ? !1 : e.op === "gt" || e.op === "lt" ? Number.isFinite(U(e.value)) : !0;
}
function nt(e, t) {
  const n = t.filter(D);
  return n.length ? e.filter((s) => n.every((o) => tt(s, o))) : e;
}
function Ve(e) {
  const t = /* @__PURE__ */ new Set();
  for (const s of e) for (const o in s.props) t.add(o);
  const n = [...t].sort((s, o) => s.localeCompare(o, "ru"));
  return [...fe, ...n];
}
const rt = 400;
function ot(e, t) {
  if (t === be) return [];
  const n = /* @__PURE__ */ new Set();
  for (const s of e) {
    const o = Ye(s, t);
    if (!(o === void 0 || o === "") && (n.add(o), n.size >= rt))
      break;
  }
  return [...n].sort((s, o) => {
    const l = U(s), a = U(o);
    return Number.isFinite(l) && Number.isFinite(a) && l !== a ? l - a : s.localeCompare(o, "ru");
  });
}
const it = 8, st = 800, at = 400;
function He(e) {
  if (!e) return;
  const t = e.model;
  if (!(!t || typeof t != "object" || !("attachments" in t)))
    return t.project ?? t;
}
function Z(e) {
  return He(e.app) ?? He(e.manager.activeApp);
}
function ye(e, t) {
  const n = [{ title: "Проект", drawing: e }];
  return e.attachments.forEach((s) => {
    if (!t && s.hidden) return;
    const o = s.model;
    o && n.push({ title: s.name ?? "Вложение", drawing: o });
  }), n;
}
function ct(e) {
  if (e == null) return;
  const t = typeof e;
  if (t === "string") return e;
  if (t === "number" || t === "boolean") return String(e);
}
const lt = /* @__PURE__ */ new Set([
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
function ne(e) {
  const t = {};
  let n = 0;
  const s = (o, l, a) => {
    if (a > it || n > st) return;
    n++;
    const d = ct(o);
    if (d !== void 0) {
      l && d !== "" && (t[l] = d);
      return;
    }
    if (Array.isArray(o)) {
      for (let u = 0; u < o.length; u++) s(o[u], l + "[" + u + "]", a + 1);
      return;
    }
    if (!o || typeof o != "object") return;
    const h = o;
    if (h.$value !== void 0) {
      s(h.$value, l, a + 1);
      return;
    }
    for (const u in h)
      u.startsWith("$") || a === 0 && lt.has(u.toLowerCase()) || s(h[u], l ? l + "." + u : u, a + 1);
  };
  try {
    s(e.typedProperties(), "", 0);
  } catch {
  }
  return t;
}
function dt(e) {
  const t = e.lastIndexOf("|");
  if (t > 0) return e.slice(t + 1);
  const n = e.lastIndexOf(".");
  return n > 0 ? e.slice(n + 1) : e;
}
function ut(e, t, n) {
  const s = ne(e);
  for (const o in s) {
    const l = s[o], a = n ? l : l.toLowerCase(), d = n ? o : o.toLowerCase();
    if (a.includes(t) || d.includes(t)) return o + ": " + l;
  }
}
function pt(e, t) {
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
function ft(e, t, n, s, o) {
  for (const [a, d] of pt(e, o)) {
    if (!a.toLowerCase().includes(t)) continue;
    if (!n) {
      if (d) return a + ": " + d;
      continue;
    }
    if ((s ? d : d.toLowerCase()).includes(n)) return a + ": " + d;
  }
  const l = ne(e);
  for (const a in l) {
    const d = a.toLowerCase(), h = dt(a).toLowerCase();
    if (!d.includes(t) && !h.includes(t)) continue;
    const u = l[a];
    if (!n) return u ? a + ": " + u : void 0;
    if ((s ? u : u.toLowerCase()).includes(n)) return a + ": " + u;
  }
}
function ht(e, t, n, s) {
  const o = n.caseSensitive, l = n.property.trim().toLowerCase();
  if (l) return ft(e, l, t, o, s);
  const a = e.name ?? "";
  if ((o ? a : a.toLowerCase()).includes(t)) return "имя: " + a;
  const d = e.$path ?? "";
  if ((o ? d : d.toLowerCase()).includes(t)) return "путь: " + d;
  let h = "";
  try {
    h = e.typed?.name ?? "";
  } catch {
    h = "";
  }
  return h && (o ? h : h.toLowerCase()).includes(t) ? "тип: " + h : ut(e, t, o);
}
async function he(e, t, n) {
  const s = Date.now(), o = t.query.trim(), l = t.caseSensitive ? o : o.toLowerCase(), a = [];
  let d = 0;
  if (!l && !t.property.trim()) return { hits: a, scanned: 0, models: 0, elapsed: 0 };
  const h = ye(e, t.includeHidden);
  for (const u of h) {
    const w = [];
    u.drawing.layers.forEach((x) => {
      w.push(x);
    });
    for (const x of w) {
      d++, d % at === 0 && (n?.(d, a.length, u.title), await Be());
      const T = ht(x, l, t, u.title);
      T && a.push({
        index: a.length,
        layer: x,
        name: x.name ?? "без имени",
        model: u.title,
        path: x.$path ?? "",
        match: T,
        props: {}
      });
    }
  }
  for (let u = 0; u < a.length; u++)
    a[u].props = ne(a[u].layer), u % 200 === 0 && (n?.(d, a.length, "чтение свойств"), await Be());
  return n?.(d, a.length, ""), { hits: a, scanned: d, models: h.length, elapsed: Date.now() - s };
}
function Be() {
  return new Promise((e) => setTimeout(e, 0));
}
const ge = "Прочее", P = "Элемент";
function ee(e) {
  const t = e.lastIndexOf("|");
  if (t > 0) return { group: e.slice(0, t), name: e.slice(t + 1) };
  const n = e.lastIndexOf(".");
  return n > 0 ? { group: e.slice(0, n), name: e.slice(n + 1) } : { group: ge, name: e };
}
function gt(e) {
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
  const n = [...t.entries()].filter(([s]) => s !== P).sort((s, o) => s[0] === ge ? 1 : o[0] === ge ? -1 : s[0].localeCompare(o[0], "ru"));
  return [
    { group: P, rows: t.get(P) },
    ...n.map(([s, o]) => ({ group: s, rows: o }))
  ];
}
function mt(e) {
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
    props: ne(e)
  };
}
function we(e) {
  if (e.cadview) return e.cadview;
  const t = e.manager.activeWindow?.context;
  if (t) return t;
  for (const n of e.manager.windows) {
    const s = n.context;
    if (s) return s;
  }
}
function vt(e) {
  return we(e) !== void 0;
}
function bt(e, t) {
  let n = e;
  for (let s = 0; n && s < 32; s++) {
    if (t.has(n)) return !0;
    n = n.layer;
  }
  return !1;
}
function te(e, t, n) {
  const s = we(e);
  if (!s) return !1;
  const o = new Set(t), l = Math3d.box3.alloc(), a = Math3d.box3.alloc();
  let d = 0;
  if (s.layer.clearSelected(), o.size && s.layer.selectObjects((h) => {
    const u = h;
    return bt(u?.layer, o) ? (u.qbounds && u.qbounds(a) && (d === 0 ? Math3d.box3.dup(l, a) : Math3d.box3.addBox(l, a), d++), !0) : !1;
  }, !0), d > 0)
    try {
      s.camera.zoom(l, s);
    } catch {
    }
  return s.invalidate(), !0;
}
function me(e) {
  const t = we(e);
  return t ? (t.layer.clearSelected(), t.invalidate(), !0) : !1;
}
async function yt(e) {
  const t = new Set(e);
  let n = 0;
  for (const s of t)
    try {
      if (s.hidden) continue;
      await s.setx("hidden", !0), n++;
    } catch {
    }
  return n;
}
async function wt(e, t) {
  const n = new Set(t);
  if (!n.size) return { visible: 0, hidden: 0 };
  const s = /* @__PURE__ */ new Set();
  for (const a of n) {
    let d = a.layer;
    for (let h = 0; d && h < 64; h++)
      s.add(d), d = d.layer;
  }
  let o = 0, l = 0;
  for (const a of ye(e, !0)) {
    const d = /* @__PURE__ */ new Map();
    a.drawing.layers.forEach((u) => {
      const w = u.layer, x = d.get(w);
      x ? x.push(u) : d.set(w, [u]);
    });
    const h = async (u) => {
      for (const w of d.get(u) ?? []) {
        const x = n.has(w) || s.has(w);
        try {
          x ? w.hidden && (await w.setx("hidden", !1), o++) : w.hidden || (await w.setx("hidden", !0), l++);
        } catch {
        }
        s.has(w) && await h(w);
      }
    };
    await h(void 0);
  }
  return { visible: o, hidden: l };
}
async function xt(e) {
  let t = 0;
  for (const n of ye(e, !0)) {
    const s = [];
    n.drawing.layers.forEach((o) => {
      o.hidden && s.push(o);
    });
    for (const o of s)
      try {
        await o.setx("hidden", !1), t++;
      } catch {
      }
  }
  return t;
}
const De = "nashepo.info.search.v2", Ue = "nashepo.info.keys.v1", ve = /* @__PURE__ */ new Set();
function Ke(e) {
  for (const t of ve) t(e);
}
const kt = (() => {
  try {
    return document.fonts?.check?.('16px "Material Symbols Outlined"') === !0;
  } catch {
    return !1;
  }
})();
function N(e, t) {
  return kt ? '<span class="ic">' + e + "</span>" : '<span class="ic-text">' + t + "</span>";
}
function y(e) {
  return e.replace(/[&<>"]/g, (t) => t === "&" ? "&amp;" : t === "<" ? "&lt;" : t === ">" ? "&gt;" : "&quot;");
}
function St() {
  const e = Re();
  try {
    const t = localStorage.getItem(De);
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
    localStorage.setItem(De, JSON.stringify(e));
  } catch {
  }
}
function Lt() {
  try {
    const e = localStorage.getItem(Ue), t = e ? JSON.parse(e) : void 0;
    return Array.isArray(t) ? t.filter((n) => typeof n == "string") : [];
  } catch {
    return [];
  }
}
function Et(e) {
  try {
    localStorage.setItem(Ue, JSON.stringify(e));
  } catch {
  }
}
function qt(e) {
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
function ue(e, t) {
  const n = qt(e.parentElement ?? e);
  e.style.colorScheme = n ? "light" : "dark", t.classList.toggle("theme-light", n), t.classList.toggle("theme-dark", !n);
}
function Ct(e, t, n, s) {
  const o = e.attachShadow ? e.shadowRoot || e.attachShadow({ mode: "open" }) : e, l = St();
  o.innerHTML = "<style>" + n + '</style><main class="app" id="app"><div class="query"><input id="query" type="search" placeholder="Значение, имя, GUID, что угодно" value="' + y(l.query) + '"><button class="primary" id="find">Найти</button></div><div class="scope"><span class="scope-label">искать</span><div class="picker"><button id="param-button" class="picker-button" aria-expanded="false" title="Где искать"><span id="param-label" class="picker-value">везде</span>' + N("expand_more", "▾") + '</button><div id="param-popup" class="picker-popup" hidden><input id="param-filter" type="search" placeholder="параметр или его часть"><div id="param-options" class="picker-list"></div><div class="picker-foot">Enter — искать в том, что набрано</div></div></div><button id="param-clear" class="ib" title="Искать везде, по всем свойствам">' + N("close", "✕") + '</button></div><div class="options"><label><input id="case" type="checkbox"> учитывать регистр</label><label><input id="hidden" type="checkbox"> искать в скрытых</label></div><section class="block"><div class="block-head"><button class="fold" id="fold-conditions" aria-expanded="false">Условия отбора <span id="conditions-count"></span></button><button id="add-condition" title="Добавить условие">＋</button></div><div class="conditions" id="conditions" hidden></div></section><div class="toolbar"><button id="prev" class="ib" title="Предыдущий элемент">' + N("chevron_left", "‹") + '</button><button id="next" class="ib" title="Следующий элемент">' + N("chevron_right", "›") + '</button><button id="all" class="ib" title="Подсветить все найденные">' + N("select_all", "▣") + '</button><button id="reset" class="ib" title="Снять подсветку">' + N("deselect", "✕") + '</button><span class="sep"></span><button id="isolate-found" class="ib" title="Изолировать найденные: оставить видимым только список">' + N("filter_center_focus", "⊡") + '</button><button id="isolate-selected" class="ib" title="Изолировать выбранный элемент">' + N("center_focus_strong", "⊙") + '</button><button id="hide" class="ib" title="Скрыть элементы из списка">' + N("visibility_off", "⊘") + '</button><button id="show-all" class="ib" title="Показать всё скрытое в проекте">' + N("visibility", "◎") + '</button></div><div class="status" id="status">Введите значение и нажмите «Найти».</div><div class="list" id="list"><div class="empty">Пока ничего не найдено</div></div><section class="block props-block"><div class="block-head"><button class="fold" id="fold-props" aria-expanded="true">Свойства элемента</button><input id="prop-filter" type="search" placeholder="фильтр свойств"></div><div class="props" id="props"><div class="empty">Выберите элемент в списке</div></div></section><div class="hint">Щелчок по строке подсвечивает элемент и переводит к нему камеру. Версия ' + y(s) + "</div></main>";
  const a = o.querySelector("#app"), d = o.querySelector("#query"), h = o.querySelector("#param-button"), u = o.querySelector("#param-label"), w = o.querySelector("#param-popup"), x = o.querySelector("#param-filter"), T = o.querySelector("#param-options"), $e = o.querySelector("#param-clear"), xe = o.querySelector("#hide"), ke = o.querySelector("#show-all"), Se = o.querySelector("#isolate-found"), Le = o.querySelector("#isolate-selected"), re = o.querySelector("#case"), oe = o.querySelector("#hidden"), Ee = o.querySelector("#find"), qe = o.querySelector("#all"), Ce = o.querySelector("#prev"), Oe = o.querySelector("#next"), We = o.querySelector("#reset"), Me = o.querySelector("#status"), H = o.querySelector("#list"), z = o.querySelector("#conditions"), Ge = o.querySelector("#conditions-count"), Je = o.querySelector("#add-condition"), ie = o.querySelector("#fold-conditions"), Ne = o.querySelector("#fold-props"), B = o.querySelector("#props"), je = o.querySelector("#prop-filter");
  re.checked = l.caseSensitive, oe.checked = l.includeHidden, ue(e, a);
  let E = [], b = [], q = [], Xe = 1, O = -1, k = !1, V, _ = l.property, K = Lt();
  function m(r, i = !1) {
    Me.textContent = r, Me.classList.toggle("error", i);
  }
  function $() {
    return {
      query: d.value,
      property: _,
      caseSensitive: re.checked,
      includeHidden: oe.checked
    };
  }
  function C() {
    const r = b.length > 0, i = O >= 0 && b.some((c) => c.index === O);
    qe.disabled = !r || k, Ce.disabled = !r || k, Oe.disabled = !r || k, xe.disabled = !r || k, Se.disabled = !r || k, Le.disabled = !i || k, Ee.disabled = k, ke.disabled = k, a.classList.toggle("scoped", _.trim() !== ""), u.textContent = _.trim() || "везде", h.title = _.trim() ? "Искать в параметре: " + _ : "Искать везде, по всем свойствам";
  }
  function Qe() {
    const r = new Set(K);
    for (const i of Ve(E)) r.add(i);
    K = [...r].sort((i, c) => i.localeCompare(c, "ru")).slice(0, 1500), Et(K);
  }
  function Ie() {
    const r = x.value.trim().toLowerCase(), i = K.filter((f) => !r || f.toLowerCase().includes(r)), c = /* @__PURE__ */ new Map();
    for (const f of i) {
      const g = fe.includes(f) ? P : ee(f).group, v = c.get(g);
      v ? v.push(f) : c.set(g, [f]);
    }
    const p = '<button class="picker-item' + (_.trim() ? "" : " active") + '" data-key="">везде, по всем свойствам</button>';
    if (!i.length) {
      T.innerHTML = p + '<div class="empty">' + (K.length ? "Ничего не подходит. Enter — искать в том, что набрано." : "Список появится после первого поиска. Имя параметра можно набрать и вручную.") + "</div>";
      return;
    }
    T.innerHTML = p + [...c.entries()].map(
      ([f, g]) => '<div class="picker-group">' + y(f) + "</div>" + g.map(
        (v) => '<button class="picker-item' + (v === _ ? " active" : "") + '" data-key="' + y(v) + '" title="' + y(v) + '">' + y(fe.includes(v) ? v : ee(v).name) + "</button>"
      ).join("")
    ).join("");
  }
  function W(r) {
    w.hidden = !r, h.setAttribute("aria-expanded", String(r)), r && (x.value = "", Ie(), x.focus());
  }
  function se(r) {
    _ = r, Q($()), C(), W(!1);
  }
  function A() {
    const r = Ve(E);
    if (Ge.textContent = q.length ? "· " + q.length : "", !q.length) {
      z.innerHTML = '<div class="empty">Условий нет. Кнопка ＋ добавит условие по свойству.</div>';
      return;
    }
    const i = /* @__PURE__ */ new Map();
    for (const c of r) {
      const { group: p, name: f } = ee(c), g = ["Имя", "Модель", "Путь"].includes(c) ? P : p, v = g === P ? c : f, M = i.get(g);
      M ? M.push({ key: c, name: v }) : i.set(g, [{ key: c, name: v }]);
    }
    z.innerHTML = q.map((c) => {
      const p = ['<option value="">любое свойство</option>'].concat([...i.entries()].map(
        ([L, ce]) => '<optgroup label="' + y(L) + '">' + ce.map(
          (le) => '<option value="' + y(le.key) + '"' + (le.key === c.key ? " selected" : "") + ">" + y(le.name) + "</option>"
        ).join("") + "</optgroup>"
      )).join(""), f = Pe.map(
        (L) => '<option value="' + L.op + '"' + (L.op === c.op ? " selected" : "") + ">" + L.label + "</option>"
      ).join(""), g = Pe.find((L) => L.op === c.op)?.needsValue ?? !0, v = c.op === "gt" || c.op === "lt", M = g && !D(c), X = M ? v && c.value.trim() !== "" ? "нужно число" : "введите значение" : "", S = g ? ot(E, c.key) : [], j = "cond-values-" + c.id, Y = S.length ? '<datalist id="' + j + '">' + S.map((L) => '<option value="' + y(L) + '"></option>').join("") + "</datalist>" : "", I = v ? "число" : S.length ? "значение или часть" : "значение";
      return '<div class="condition' + (M ? " waiting" : "") + '" data-id="' + c.id + '"><select class="cond-key">' + p + '</select><select class="cond-op">' + f + '</select><input class="cond-value" type="search" placeholder="' + I + '" value="' + y(c.value) + '"' + (g ? "" : " disabled") + (S.length ? ' list="' + j + '"' : "") + '><button class="cond-remove" title="Удалить условие">×</button>' + Y + (S.length ? '<div class="cond-hint">известных значений: ' + S.length + "</div>" : "") + (X ? '<div class="cond-hint">' + X + ", условие пока не применяется</div>" : "") + "</div>";
    }).join("");
  }
  function Ze() {
    if (!b.length) {
      H.innerHTML = '<div class="empty">' + (E.length ? "Условия отбора не пропустили ни одного элемента" : "Пока ничего не найдено") + "</div>";
      return;
    }
    H.innerHTML = b.map(
      (r) => '<button class="row" data-index="' + r.index + '"><div class="name">' + y(r.name) + '</div><div class="meta"><span class="model">' + y(r.model) + "</span><span>" + y(r.path) + '</span></div><div class="match">' + y(r.match) + "</div></button>"
    ).join("");
  }
  function F() {
    const r = V ?? b.find((f) => f.index === O);
    if (!r) {
      B.innerHTML = '<div class="empty">Выберите элемент в списке или в модели</div>';
      return;
    }
    const i = je.value.trim().toLowerCase(), c = gt(r).map((f) => ({
      group: f.group,
      rows: i ? f.rows.filter((g) => g.name.toLowerCase().includes(i) || g.key.toLowerCase().includes(i) || g.value.toLowerCase().includes(i)) : f.rows
    })).filter((f) => f.rows.length);
    if (!c.length) {
      B.innerHTML = '<div class="empty">Ничего не подходит под фильтр</div>';
      return;
    }
    const p = V ? '<div class="props-note">Элемент выбран в модели</div>' : "";
    B.innerHTML = p + c.map(
      (f) => '<div class="prop-group"><div class="prop-group-name" title="' + y(f.group) + '">' + y(f.group) + '</div><table class="props-table"><tbody>' + f.rows.map(
        (g) => '<tr><th title="' + y(g.key) + '">' + y(g.name) + '</th><td title="' + y(g.value) + '">' + y(g.value) + "</td></tr>"
      ).join("") + "</tbody></table></div>"
    ).join("");
  }
  function R(r = !1) {
    if (b = nt(E, q), O = -1, Ze(), F(), C(), r || !E.length) return;
    const i = q.filter(D).length;
    m(i ? "Найдено: " + E.length + ". После отбора по " + i + " условиям: " + b.length + "." : "Найдено: " + E.length + ".");
  }
  function G(r) {
    O = r, V = void 0, H.querySelectorAll(".row").forEach((i) => {
      i.classList.toggle("active", Number(i.dataset.index) === r);
    }), H.querySelector(".row.active")?.scrollIntoView({ block: "nearest" }), F(), C();
  }
  function ae(r) {
    if (r < 0 || r >= b.length) return;
    const i = b[r];
    if (!te(t, [i.layer])) {
      m("Нет активного вида чертежа. Откройте окно проекта.", !0);
      return;
    }
    G(i.index), m("Элемент " + (r + 1) + " из " + b.length + ". " + i.model);
  }
  function ze() {
    return b.findIndex((r) => r.index === O);
  }
  async function et(r, i, c, p) {
    m("В параметре «" + c + "» ничего нет, смотрю остальные…");
    const f = await he(r, { ...i, property: "" });
    if (!f.hits.length) {
      m("Ничего не найдено ни в параметре «" + c + "», ни в остальных. Просмотрено слоёв: " + p + ".");
      return;
    }
    const g = i.caseSensitive ? i.query.trim() : i.query.trim().toLowerCase(), v = /* @__PURE__ */ new Map();
    for (const S of f.hits) {
      const j = /* @__PURE__ */ new Set(), Y = (I, L) => {
        const ce = i.caseSensitive ? L : L.toLowerCase();
        L && ce.includes(g) && j.add(I);
      };
      Y("Имя", S.name), Y("Путь", S.path);
      for (const I in S.props) Y(I, S.props[I]);
      for (const I of j) v.set(I, (v.get(I) ?? 0) + 1);
    }
    const M = [...v.entries()].sort((S, j) => j[1] - S[1]).slice(0, 3), X = M.length ? " Значение встречается в: " + M.map(([S, j]) => "«" + S + "» (" + j + ")").join(", ") + "." : "";
    m("В параметре «" + c + "» ничего нет, но по всем свойствам нашлось " + f.hits.length + "." + X + " Крестик справа от выбора параметра вернёт поиск везде.");
  }
  async function J() {
    const r = $();
    if (Q(r), !r.query.trim() && !r.property.trim()) {
      m("Введите значение для поиска или укажите параметр.", !0);
      return;
    }
    const i = Z(t);
    if (!i) {
      m("Нет открытого проекта.", !0);
      return;
    }
    vt(t) || m("Нет активного вида чертежа. Поиск выполнится, но подсветка работать не будет."), k = !0, E = [], b = [], O = -1, C(), m("Поиск…");
    try {
      const c = await he(i, r, (p, f, g) => {
        m("Просмотрено " + p + ", найдено " + f + (g ? ". " + g : ""));
      });
      if (E = c.hits, A(), Qe(), R(!0), E.length) {
        const p = q.filter(D).length ? " После условий отбора: " + b.length + "." : "";
        m("Найдено: " + E.length + "." + p + " Просмотрено слоёв: " + c.scanned + " в моделях: " + c.models + " за " + Math.round(c.elapsed / 100) / 10 + " с.");
      } else {
        const p = r.property.trim();
        p && r.query.trim() ? await et(i, r, p, c.scanned) : m("Ничего не найдено. Просмотрено слоёв: " + c.scanned + " в моделях: " + c.models + ".");
      }
    } catch (c) {
      m("Ошибка поиска: " + (c?.message ?? String(c)), !0);
    } finally {
      k = !1, C();
    }
  }
  Ee.addEventListener("click", () => {
    J();
  }), d.addEventListener("keydown", (r) => {
    r.key === "Enter" && J();
  }), h.addEventListener("click", () => W(w.hidden)), x.addEventListener("input", () => Ie()), x.addEventListener("keydown", (r) => {
    const i = r.key;
    if (i === "Escape") {
      W(!1);
      return;
    }
    if (i !== "Enter") return;
    const c = x.value.trim();
    se(c), J();
  }), T.addEventListener("click", (r) => {
    const i = r.target.closest(".picker-item");
    i && (se(i.dataset.key ?? ""), J());
  }), $e.addEventListener("click", () => {
    se("");
  }), a.addEventListener("pointerdown", (r) => {
    if (w.hidden) return;
    const i = r.target;
    i.closest(".picker") || i.closest("#param-clear") || W(!1);
  }), re.addEventListener("change", () => Q($())), oe.addEventListener("change", () => Q($())), xe.addEventListener("click", () => {
    (async () => {
      if (b.length) {
        k = !0, C(), m("Скрываю элементы…");
        try {
          const r = await yt(b.map((i) => i.layer));
          me(t), m("Скрыто элементов: " + r + ". Вернуть их можно кнопкой «Показать все».");
        } catch (r) {
          m("Не удалось скрыть: " + (r?.message ?? String(r)), !0);
        } finally {
          k = !1, C();
        }
      }
    })();
  });
  function _e(r, i) {
    (async () => {
      const c = Z(t);
      if (!c) {
        m("Нет открытого проекта.", !0);
        return;
      }
      if (r.length) {
        k = !0, C(), m("Изолирую…");
        try {
          const p = await wt(c, r);
          te(t, r, !0), m("Изолировано: " + i + ", элементов " + r.length + ". Скрыто веток: " + p.hidden + ". Вернуть вид можно кнопкой показа всего.");
        } catch (p) {
          m("Не удалось изолировать: " + (p?.message ?? String(p)), !0);
        } finally {
          k = !1, C();
        }
      }
    })();
  }
  Se.addEventListener("click", () => {
    _e(b.map((r) => r.layer), "найденные");
  }), Le.addEventListener("click", () => {
    const r = b.find((i) => i.index === O);
    r && _e([r.layer], "выбранный элемент");
  }), ke.addEventListener("click", () => {
    (async () => {
      const r = Z(t);
      if (!r) {
        m("Нет открытого проекта.", !0);
        return;
      }
      k = !0, C(), m("Показываю скрытое…");
      try {
        const i = await xt(r);
        m(i ? "Показано элементов: " + i + "." : "Скрытых элементов не было.");
      } catch (i) {
        m("Не удалось показать: " + (i?.message ?? String(i)), !0);
      } finally {
        k = !1, C();
      }
    })();
  }), qe.addEventListener("click", () => {
    if (b.length) {
      if (!te(t, b.map((r) => r.layer))) {
        m("Нет активного вида чертежа. Откройте окно проекта.", !0);
        return;
      }
      O = -1, G(-1), m("Подсвечено элементов: " + b.length + ".");
    }
  }), Ce.addEventListener("click", () => {
    if (!b.length) return;
    const r = ze();
    ae(r <= 0 ? b.length - 1 : r - 1);
  }), Oe.addEventListener("click", () => {
    if (!b.length) return;
    const r = ze();
    ae(r >= b.length - 1 ? 0 : r + 1);
  }), We.addEventListener("click", () => {
    me(t), O = -1, G(-1), m("Выделение снято.");
  }), H.addEventListener("click", (r) => {
    const i = r.target.closest(".row");
    if (!i) return;
    const c = Number(i.dataset.index);
    ae(b.findIndex((p) => p.index === c));
  }), Je.addEventListener("click", () => {
    q.push({ id: Xe++, key: be, op: "contains", value: "" }), z.hidden = !1, ie.setAttribute("aria-expanded", "true"), A(), R();
  }), ie.addEventListener("click", () => {
    const r = z.hidden;
    z.hidden = !r, ie.setAttribute("aria-expanded", String(r)), r && A();
  }), Ne.addEventListener("click", () => {
    const r = B.hidden;
    B.hidden = !r, Ne.setAttribute("aria-expanded", String(r));
  }), je.addEventListener("input", () => F()), z.addEventListener("click", (r) => {
    const i = r.target.closest(".cond-remove");
    if (!i) return;
    const c = Number(i.closest(".condition").dataset.id);
    q = q.filter((p) => p.id !== c), A(), R();
  }), z.addEventListener("change", (r) => {
    const i = r.target, c = i.closest(".condition");
    if (!c) return;
    const p = q.find((f) => f.id === Number(c.dataset.id));
    p && (i.classList.contains("cond-key") && (p.key = i.value, A()), i.classList.contains("cond-op") && (p.op = i.value, A()), i.classList.contains("cond-value") && (p.value = i.value), R());
  }), z.addEventListener("input", (r) => {
    const i = r.target;
    if (!i.classList.contains("cond-value")) return;
    const c = i.closest(".condition");
    if (!c) return;
    const p = q.find((M) => M.id === Number(c.dataset.id));
    if (!p) return;
    p.value = i.value;
    const f = p.op === "gt" || p.op === "lt", g = !D(p);
    c.classList.toggle("waiting", g);
    let v = c.querySelector(".cond-hint");
    g ? (v || (v = document.createElement("div"), v.className = "cond-hint", c.appendChild(v)), v.textContent = (f && p.value.trim() !== "" ? "нужно число" : "введите значение") + ", условие пока не применяется") : v && v.remove(), R();
  });
  const Ae = (r) => {
    if (!e.isConnected) {
      ve.delete(Ae);
      return;
    }
    if (!r.length) {
      if (!V) return;
      V = void 0, F();
      return;
    }
    const i = r[0], c = b.find((p) => p.layer === i);
    if (c) {
      G(c.index);
      return;
    }
    V = mt(i), F();
  };
  ve.add(Ae), a.addEventListener("pointerdown", () => ue(e, a)), setTimeout(() => ue(e, a), 500), A(), C();
}
const Ot = ':host,.app{--bg: rgb(var(--v-theme-surface, 30 30 30));--fg: rgb(var(--v-theme-on-surface, 235 240 245));--muted: color-mix(in srgb, var(--fg) 55%, transparent);--line: color-mix(in srgb, var(--fg) 18%, transparent);--soft: color-mix(in srgb, var(--fg) 7%, transparent);--accent: #f2c94c;--accent-fg: #16191e}*{box-sizing:border-box}[hidden]{display:none!important}.app{display:flex;flex-direction:column;height:100%;min-height:0;gap:7px;padding:9px;background:var(--bg);font:13px/1.45 Ubuntu,system-ui,sans-serif;color:var(--fg)}.query{display:flex;gap:6px}input[type=search],input[type=text],select{min-width:0;padding:6px 8px;border:1px solid var(--line);border-radius:7px;background:var(--soft);color:inherit;font:inherit}.query input[type=search]{flex:1;padding:8px 10px}input[type=search]:focus,select:focus{outline:2px solid var(--accent);outline-offset:-1px}button{padding:6px 10px;border:1px solid var(--line);border-radius:7px;background:var(--soft);color:inherit;font:inherit;cursor:pointer;white-space:nowrap}button:hover:not(:disabled){border-color:var(--accent)}button:disabled{opacity:.45;cursor:default}button.primary{background:var(--accent);color:var(--accent-fg);border-color:transparent;font-weight:700}.scope{display:flex;align-items:center;gap:6px}.scope-label{color:var(--muted);font-size:12px;white-space:nowrap}.app.scoped .scope-label{color:var(--accent)}.picker{position:relative;flex:1;min-width:0}.picker-button{display:flex;align-items:center;gap:4px;width:100%;padding:6px 8px;text-align:left}.picker-value{flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.app.scoped .picker-button{border-color:var(--accent)}.app.scoped .picker-value{color:var(--accent);font-weight:600}.picker-popup{position:absolute;z-index:20;top:calc(100% + 3px);left:0;right:0;display:flex;flex-direction:column;max-height:320px;padding:6px;border:1px solid var(--line);border-radius:8px;background:var(--bg);box-shadow:0 10px 28px #00000073}.picker-popup input{width:100%}.picker-list{flex:1;min-height:0;overflow:auto;margin-top:6px}.picker-group{padding:5px 6px 3px;color:var(--muted);font-size:11px;font-weight:700;overflow-wrap:anywhere}.picker-item{display:block;width:100%;padding:5px 8px;border:0;border-radius:6px;background:transparent;text-align:left;overflow-wrap:anywhere}.picker-item:hover{background:var(--soft)}.picker-item.active{background:color-mix(in srgb,var(--accent) 25%,transparent);font-weight:600}.picker-foot{padding-top:5px;color:var(--muted);font-size:11px}.options{display:flex;flex-wrap:wrap;gap:12px;color:var(--muted)}.options label{display:inline-flex;align-items:center;gap:5px}.block{border:1px solid var(--line);border-radius:8px}.block-head{display:flex;align-items:center;gap:6px;padding:4px 6px}.block-head .fold{flex:1;border:0;background:transparent;text-align:left;font-weight:600;padding:3px 2px}.block-head .fold:before{content:"▾ ";color:var(--muted)}.block-head .fold[aria-expanded=false]:before{content:"▸ "}.block-head input[type=search]{width:120px}.conditions{padding:0 6px 6px;display:flex;flex-direction:column;gap:5px}.condition{display:grid;grid-template-columns:minmax(0,1.3fr) minmax(0,.9fr) minmax(0,1fr) auto;gap:4px}.condition select,.condition input{font-size:12px}.condition.waiting select,.condition.waiting input{border-color:color-mix(in srgb,var(--accent) 60%,var(--line))}.cond-hint{grid-column:1 / -1;color:var(--muted);font-size:11px}.theme-dark{--popup-bg: #232323;--popup-fg: #edf1f6;--popup-head: #2f2f2f}.theme-light{--popup-bg: #ffffff;--popup-fg: #16191e;--popup-head: #ececec}option{background-color:var(--popup-bg, #232323);color:var(--popup-fg, #edf1f6)}optgroup{background-color:var(--popup-head, #2f2f2f);color:var(--popup-fg, #edf1f6);font-weight:700;font-style:normal}.bar{display:flex;align-items:center;gap:6px;flex-wrap:wrap}.bar .spacer{flex:1}.toolbar{display:flex;align-items:center;gap:2px;padding:2px;border:1px solid var(--line);border-radius:8px}.toolbar .sep{width:1px;align-self:stretch;margin:2px 4px;background:var(--line)}button.ib{display:inline-flex;align-items:center;justify-content:center;width:30px;height:28px;padding:0;border-color:transparent;background:transparent}button.ib:hover:not(:disabled){background:var(--soft);border-color:var(--line)}button.ib:active:not(:disabled){background:color-mix(in srgb,var(--accent) 25%,transparent)}.ic{font-family:Material Symbols Outlined;font-size:19px;line-height:1;font-weight:300;-webkit-font-feature-settings:"liga";font-variant-ligatures:common-ligatures}.ic-text{font-size:15px;line-height:1}.status{color:var(--muted);min-height:17px}.status.error{color:#ff6b6b}.list{flex:1 1 55%;min-height:90px;overflow:auto;border:1px solid var(--line);border-radius:8px}.row{display:block;width:100%;padding:6px 9px;border:0;border-bottom:1px solid var(--line);border-radius:0;background:transparent;text-align:left;cursor:pointer}.row:last-child{border-bottom:0}.row:hover{background:var(--soft)}.row.active{background:color-mix(in srgb,var(--accent) 22%,transparent)}.row .name{font-weight:600;word-break:break-word}.row .meta{display:flex;gap:6px;align-items:baseline;color:var(--muted);font-size:12px}.row .model{color:var(--accent)}.row .match{color:var(--muted);font-family:ui-monospace,Consolas,monospace;font-size:11px;word-break:break-all}.props-block{display:flex;flex-direction:column;flex:1 1 45%;min-height:90px}.props{flex:1;min-height:0;overflow:auto;padding:0 6px 6px}.props-note{padding:3px 5px;color:var(--accent);font-size:11px}.prop-group{margin-bottom:7px}.prop-group-name{padding:3px 5px;background:var(--soft);border-radius:5px;font-size:11px;font-weight:700;letter-spacing:.01em;overflow-wrap:anywhere}.props-table{width:100%;border-collapse:collapse;font-size:12px;table-layout:fixed}.props-table th,.props-table td{text-align:left;vertical-align:top;padding:3px 5px;border-bottom:1px solid var(--line);overflow-wrap:anywhere}.props-table th{width:42%;font-weight:500;color:var(--muted)}.empty{padding:14px;color:var(--muted);text-align:center}.hint{color:var(--muted);font-size:11px}', Mt = "0.6.1", Fe = "nashepo.info/search_panel";
function pe(e) {
  return new Proxy(e, {
    get(t, n) {
      return n === "app" ? e.manager.activeApp : n === "cadview" ? e.manager.activeWindow?.context : Reflect.get(t, n);
    }
  });
}
const Nt = {
  /** Открыть панель поиска. */
  open(e) {
    e.manager.revealView(Fe);
  },
  /** Смонтировать панель. */
  mount(e) {
    const t = e.el;
    if (!t) return;
    const n = document.createElement("div");
    n.style.height = "100%", t.replaceChildren(n), Ct(n, pe(e), Ot, Mt);
  },
  /** Быстрый поиск: спросить значение и сразу подсветить все совпадения. */
  async quick(e) {
    const t = pe(e), n = Z(t);
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
    const o = { ...Re(), query: s }, l = e.beginProgress();
    l.indeterminate = !0, l.label = "Поиск по проекту";
    let a;
    try {
      a = await he(n, o, (h, u) => {
        l.details = "просмотрено " + h + ", найдено " + u;
      });
    } finally {
      e.endProgress(l);
    }
    if (!a.hits.length) {
      await e.showMessage("Ничего не найдено. Просмотрено слоёв: " + a.scanned + ".", "info");
      return;
    }
    const d = te(t, a.hits.map((h) => h.layer));
    e.manager.revealView(Fe), await e.showMessage(
      d ? "Найдено элементов: " + a.hits.length + ". Они подсвечены в модели." : "Найдено элементов: " + a.hits.length + ", но активного вида чертежа нет.",
      d ? "info" : "warning"
    );
  },
  /** Снять подсветку. */
  clear(e) {
    me(pe(e));
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
      Ke([]);
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
    Ke(s);
  }
};
export {
  Nt as default
};
