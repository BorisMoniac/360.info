const He = () => ({
  query: "",
  property: "",
  caseSensitive: !1,
  includeHidden: !1
}), je = [
  { op: "contains", label: "содержит", needsValue: !0 },
  { op: "notContains", label: "не содержит", needsValue: !0 },
  { op: "equals", label: "равно", needsValue: !0 },
  { op: "notEquals", label: "не равно", needsValue: !0 },
  { op: "gt", label: "больше", needsValue: !0 },
  { op: "lt", label: "меньше", needsValue: !0 },
  { op: "exists", label: "заполнено", needsValue: !1 },
  { op: "missing", label: "пусто", needsValue: !1 }
], pe = "", ce = ["Имя", "Модель", "Путь"];
function Be(e, t) {
  return t === "Имя" ? e.name : t === "Модель" ? e.model : t === "Путь" ? e.path : e.props[t];
}
function ze(e) {
  const t = [e.name, e.model, e.path];
  for (const n in e.props) t.push(e.props[n]);
  return t;
}
function R(e) {
  const n = e.replace(/\s| /g, "").replace(",", ".").match(/-?\d+(\.\d+)?/);
  return n ? parseFloat(n[0]) : NaN;
}
function ie(e, t) {
  const n = e !== void 0 && e !== "";
  switch (t.op) {
    case "exists":
      return n;
    case "missing":
      return !n;
  }
  if (!n) return !1;
  const i = e.toLowerCase(), r = t.value.trim().toLowerCase();
  switch (t.op) {
    case "contains":
      return i.includes(r);
    case "notContains":
      return !i.includes(r);
    case "equals":
      return i === r;
    case "notEquals":
      return i !== r;
    case "gt":
    case "lt": {
      const l = R(e), a = R(t.value);
      return !Number.isFinite(l) || !Number.isFinite(a) ? !1 : t.op === "gt" ? l > a : l < a;
    }
    default:
      return !1;
  }
}
function et(e, t) {
  return t.key !== pe ? ie(Be(e, t.key), t) : t.op === "missing" ? ze(e).every((n) => !ie(n, { ...t, op: "exists" })) : ze(e).some((n) => ie(n, t));
}
function F(e) {
  return e.op === "exists" || e.op === "missing" ? !0 : e.value.trim() === "" ? !1 : e.op === "gt" || e.op === "lt" ? Number.isFinite(R(e.value)) : !0;
}
function tt(e, t) {
  const n = t.filter(F);
  return n.length ? e.filter((i) => n.every((r) => et(i, r))) : e;
}
function _e(e) {
  const t = /* @__PURE__ */ new Set();
  for (const i of e) for (const r in i.props) t.add(r);
  const n = [...t].sort((i, r) => i.localeCompare(r, "ru"));
  return [...ce, ...n];
}
const nt = 400;
function rt(e, t) {
  if (t === pe) return [];
  const n = /* @__PURE__ */ new Set();
  for (const i of e) {
    const r = Be(i, t);
    if (!(r === void 0 || r === "") && (n.add(r), n.size >= nt))
      break;
  }
  return [...n].sort((i, r) => {
    const l = R(i), a = R(r);
    return Number.isFinite(l) && Number.isFinite(a) && l !== a ? l - a : i.localeCompare(r, "ru");
  });
}
const ot = 8, it = 800, st = 400;
function Ae(e) {
  if (!e) return;
  const t = e.model;
  if (!(!t || typeof t != "object" || !("attachments" in t)))
    return t.project ?? t;
}
function G(e) {
  return Ae(e.app) ?? Ae(e.manager.activeApp);
}
function fe(e, t) {
  const n = [{ title: "Проект", drawing: e }];
  return e.attachments.forEach((i) => {
    if (!t && i.hidden) return;
    const r = i.model;
    r && n.push({ title: i.name ?? "Вложение", drawing: r });
  }), n;
}
function at(e) {
  if (e == null) return;
  const t = typeof e;
  if (t === "string") return e;
  if (t === "number" || t === "boolean") return String(e);
}
const ct = /* @__PURE__ */ new Set([
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
function Q(e) {
  const t = {};
  let n = 0;
  const i = (r, l, a) => {
    if (a > ot || n > it) return;
    n++;
    const d = at(r);
    if (d !== void 0) {
      l && d !== "" && (t[l] = d);
      return;
    }
    if (Array.isArray(r)) {
      for (let u = 0; u < r.length; u++) i(r[u], l + "[" + u + "]", a + 1);
      return;
    }
    if (!r || typeof r != "object") return;
    const f = r;
    if (f.$value !== void 0) {
      i(f.$value, l, a + 1);
      return;
    }
    for (const u in f)
      u.startsWith("$") || a === 0 && ct.has(u.toLowerCase()) || i(f[u], l ? l + "." + u : u, a + 1);
  };
  try {
    i(e.typedProperties(), "", 0);
  } catch {
  }
  return t;
}
function lt(e) {
  const t = e.lastIndexOf("|");
  if (t > 0) return e.slice(t + 1);
  const n = e.lastIndexOf(".");
  return n > 0 ? e.slice(n + 1) : e;
}
function dt(e, t, n) {
  const i = Q(e);
  for (const r in i) {
    const l = i[r], a = n ? l : l.toLowerCase(), d = n ? r : r.toLowerCase();
    if (a.includes(t) || d.includes(t)) return r + ": " + l;
  }
}
function ut(e, t) {
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
function pt(e, t, n, i, r) {
  for (const [a, d] of ut(e, r)) {
    if (!a.toLowerCase().includes(t)) continue;
    if (!n) {
      if (d) return a + ": " + d;
      continue;
    }
    if ((i ? d : d.toLowerCase()).includes(n)) return a + ": " + d;
  }
  const l = Q(e);
  for (const a in l) {
    const d = a.toLowerCase(), f = lt(a).toLowerCase();
    if (!d.includes(t) && !f.includes(t)) continue;
    const u = l[a];
    if (!n) return u ? a + ": " + u : void 0;
    if ((i ? u : u.toLowerCase()).includes(n)) return a + ": " + u;
  }
}
function ft(e, t, n, i) {
  const r = n.caseSensitive, l = n.property.trim().toLowerCase();
  if (l) return pt(e, l, t, r, i);
  const a = e.name ?? "";
  if ((r ? a : a.toLowerCase()).includes(t)) return "имя: " + a;
  const d = e.$path ?? "";
  if ((r ? d : d.toLowerCase()).includes(t)) return "путь: " + d;
  let f = "";
  try {
    f = e.typed?.name ?? "";
  } catch {
    f = "";
  }
  return f && (r ? f : f.toLowerCase()).includes(t) ? "тип: " + f : dt(e, t, r);
}
async function Ke(e, t, n) {
  const i = Date.now(), r = t.query.trim(), l = t.caseSensitive ? r : r.toLowerCase(), a = [];
  let d = 0;
  if (!l && !t.property.trim()) return { hits: a, scanned: 0, models: 0, elapsed: 0 };
  const f = fe(e, t.includeHidden);
  for (const u of f) {
    const x = [];
    u.drawing.layers.forEach((w) => {
      x.push(w);
    });
    for (const w of x) {
      d++, d % st === 0 && (n?.(d, a.length, u.title), await Pe());
      const _ = ft(w, l, t, u.title);
      _ && a.push({
        index: a.length,
        layer: w,
        name: w.name ?? "без имени",
        model: u.title,
        path: w.$path ?? "",
        match: _,
        props: {}
      });
    }
  }
  for (let u = 0; u < a.length; u++)
    a[u].props = Q(a[u].layer), u % 200 === 0 && (n?.(d, a.length, "чтение свойств"), await Pe());
  return n?.(d, a.length, ""), { hits: a, scanned: d, models: f.length, elapsed: Date.now() - i };
}
function Pe() {
  return new Promise((e) => setTimeout(e, 0));
}
const le = "Прочее", z = "Элемент";
function J(e) {
  const t = e.lastIndexOf("|");
  if (t > 0) return { group: e.slice(0, t), name: e.slice(t + 1) };
  const n = e.lastIndexOf(".");
  return n > 0 ? { group: e.slice(0, n), name: e.slice(n + 1) } : { group: le, name: e };
}
function ht(e) {
  const t = /* @__PURE__ */ new Map();
  t.set(z, [
    { key: "Имя", name: "Имя", value: e.name },
    { key: "Модель", name: "Модель", value: e.model },
    { key: "Путь", name: "Путь", value: e.path }
  ]);
  for (const i of Object.keys(e.props).sort((r, l) => r.localeCompare(l, "ru"))) {
    const { group: r, name: l } = J(i), a = t.get(r), d = { key: i, name: l, value: e.props[i] };
    a ? a.push(d) : t.set(r, [d]);
  }
  const n = [...t.entries()].filter(([i]) => i !== z).sort((i, r) => i[0] === le ? 1 : r[0] === le ? -1 : i[0].localeCompare(r[0], "ru"));
  return [
    { group: z, rows: t.get(z) },
    ...n.map(([i, r]) => ({ group: i, rows: r }))
  ];
}
function gt(e) {
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
function he(e) {
  if (e.cadview) return e.cadview;
  const t = e.manager.activeWindow?.context;
  if (t) return t;
  for (const n of e.manager.windows) {
    const i = n.context;
    if (i) return i;
  }
}
function mt(e) {
  return he(e) !== void 0;
}
function vt(e, t) {
  let n = e;
  for (let i = 0; n && i < 32; i++) {
    if (t.has(n)) return !0;
    n = n.layer;
  }
  return !1;
}
function X(e, t, n) {
  const i = he(e);
  if (!i) return !1;
  const r = new Set(t), l = Math3d.box3.alloc(), a = Math3d.box3.alloc();
  let d = 0;
  if (i.layer.clearSelected(), r.size && i.layer.selectObjects((f) => {
    const u = f;
    return vt(u?.layer, r) ? (u.qbounds && u.qbounds(a) && (d === 0 ? Math3d.box3.dup(l, a) : Math3d.box3.addBox(l, a), d++), !0) : !1;
  }, !0), d > 0)
    try {
      i.camera.zoom(l, i);
    } catch {
    }
  return i.invalidate(), !0;
}
function de(e) {
  const t = he(e);
  return t ? (t.layer.clearSelected(), t.invalidate(), !0) : !1;
}
async function bt(e) {
  const t = new Set(e);
  let n = 0;
  for (const i of t)
    try {
      if (i.hidden) continue;
      await i.setx("hidden", !0), n++;
    } catch {
    }
  return n;
}
async function yt(e, t) {
  const n = new Set(t);
  if (!n.size) return { visible: 0, hidden: 0 };
  const i = /* @__PURE__ */ new Set();
  for (const a of n) {
    let d = a.layer;
    for (let f = 0; d && f < 64; f++)
      i.add(d), d = d.layer;
  }
  let r = 0, l = 0;
  for (const a of fe(e, !0)) {
    const d = /* @__PURE__ */ new Map();
    a.drawing.layers.forEach((u) => {
      const x = u.layer, w = d.get(x);
      w ? w.push(u) : d.set(x, [u]);
    });
    const f = async (u) => {
      for (const x of d.get(u) ?? []) {
        const w = n.has(x) || i.has(x);
        try {
          w ? x.hidden && (await x.setx("hidden", !1), r++) : x.hidden || (await x.setx("hidden", !0), l++);
        } catch {
        }
        i.has(x) && await f(x);
      }
    };
    await f(void 0);
  }
  return { visible: r, hidden: l };
}
async function xt(e) {
  let t = 0;
  for (const n of fe(e, !0)) {
    const i = [];
    n.drawing.layers.forEach((r) => {
      r.hidden && i.push(r);
    });
    for (const r of i)
      try {
        await r.setx("hidden", !1), t++;
      } catch {
      }
  }
  return t;
}
const Fe = "nashepo.info.search.v2", Re = "nashepo.info.keys.v1", ue = /* @__PURE__ */ new Set();
function Te(e) {
  for (const t of ue) t(e);
}
const wt = (() => {
  try {
    return document.fonts?.check?.('16px "Material Symbols Outlined"') === !0;
  } catch {
    return !1;
  }
})();
function C(e, t) {
  return wt ? '<span class="ic">' + e + "</span>" : '<span class="ic-text">' + t + "</span>";
}
function y(e) {
  return e.replace(/[&<>"]/g, (t) => t === "&" ? "&amp;" : t === "<" ? "&lt;" : t === ">" ? "&gt;" : "&quot;");
}
function kt() {
  const e = He();
  try {
    const t = localStorage.getItem(Fe);
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
function W(e) {
  try {
    localStorage.setItem(Fe, JSON.stringify(e));
  } catch {
  }
}
function St() {
  try {
    const e = localStorage.getItem(Re), t = e ? JSON.parse(e) : void 0;
    return Array.isArray(t) ? t.filter((n) => typeof n == "string") : [];
  } catch {
    return [];
  }
}
function Lt(e) {
  try {
    localStorage.setItem(Re, JSON.stringify(e));
  } catch {
  }
}
function Et(e) {
  let t = e;
  for (; t; ) {
    const n = getComputedStyle(t).backgroundColor.match(/[\d.]+/g);
    if (n && n.length >= 3 && (n.length < 4 || Number(n[3]) > 0.1)) {
      const [i, r, l] = n.map(Number);
      return i * 0.299 + r * 0.587 + l * 0.114 > 140;
    }
    t = t.parentElement;
  }
  return !matchMedia("(prefers-color-scheme: dark)").matches;
}
function se(e, t) {
  const n = Et(e.parentElement ?? e);
  e.style.colorScheme = n ? "light" : "dark", t.classList.toggle("theme-light", n), t.classList.toggle("theme-dark", !n);
}
function qt(e, t, n, i) {
  const r = e.attachShadow ? e.shadowRoot || e.attachShadow({ mode: "open" }) : e, l = kt();
  r.innerHTML = "<style>" + n + '</style><main class="app" id="app"><div class="query"><input id="query" type="search" placeholder="Значение, имя, GUID, что угодно" value="' + y(l.query) + '"><button class="primary" id="find">Найти</button></div><div class="scope"><span class="scope-label">искать</span><div class="picker"><button id="param-button" class="picker-button" aria-expanded="false" title="Где искать"><span id="param-label" class="picker-value">везде</span>' + C("expand_more", "▾") + '</button><div id="param-popup" class="picker-popup" hidden><input id="param-filter" type="search" placeholder="параметр или его часть"><div id="param-options" class="picker-list"></div><div class="picker-foot">Enter — искать в том, что набрано</div></div></div><button id="param-clear" class="ib" title="Искать везде, по всем свойствам">' + C("close", "✕") + '</button></div><div class="options"><label><input id="case" type="checkbox"> учитывать регистр</label><label><input id="hidden" type="checkbox"> искать в скрытых</label></div><section class="block"><div class="block-head"><button class="fold" id="fold-conditions" aria-expanded="false">Условия отбора <span id="conditions-count"></span></button><button id="add-condition" title="Добавить условие">＋</button></div><div class="conditions" id="conditions" hidden></div></section><div class="toolbar"><button id="prev" class="ib" title="Предыдущий элемент">' + C("chevron_left", "‹") + '</button><button id="next" class="ib" title="Следующий элемент">' + C("chevron_right", "›") + '</button><button id="all" class="ib" title="Подсветить все найденные">' + C("select_all", "▣") + '</button><button id="reset" class="ib" title="Снять подсветку">' + C("deselect", "✕") + '</button><span class="sep"></span><button id="isolate-found" class="ib" title="Изолировать найденные: оставить видимым только список">' + C("filter_center_focus", "⊡") + '</button><button id="isolate-selected" class="ib" title="Изолировать выбранный элемент">' + C("center_focus_strong", "⊙") + '</button><button id="hide" class="ib" title="Скрыть элементы из списка">' + C("visibility_off", "⊘") + '</button><button id="show-all" class="ib" title="Показать всё скрытое в проекте">' + C("visibility", "◎") + '</button></div><div class="status" id="status">Введите значение и нажмите «Найти».</div><div class="list" id="list"><div class="empty">Пока ничего не найдено</div></div><section class="block props-block"><div class="block-head"><button class="fold" id="fold-props" aria-expanded="true">Свойства элемента</button><input id="prop-filter" type="search" placeholder="фильтр свойств"></div><div class="props" id="props"><div class="empty">Выберите элемент в списке</div></div></section><div class="hint">Щелчок по строке подсвечивает элемент и переводит к нему камеру. Версия ' + y(i) + "</div></main>";
  const a = r.querySelector("#app"), d = r.querySelector("#query"), f = r.querySelector("#param-button"), u = r.querySelector("#param-label"), x = r.querySelector("#param-popup"), w = r.querySelector("#param-filter"), _ = r.querySelector("#param-options"), Ye = r.querySelector("#param-clear"), ge = r.querySelector("#hide"), me = r.querySelector("#show-all"), ve = r.querySelector("#isolate-found"), be = r.querySelector("#isolate-selected"), Z = r.querySelector("#case"), ee = r.querySelector("#hidden"), ye = r.querySelector("#find"), xe = r.querySelector("#all"), we = r.querySelector("#prev"), ke = r.querySelector("#next"), De = r.querySelector("#reset"), Se = r.querySelector("#status"), T = r.querySelector("#list"), M = r.querySelector("#conditions"), Ue = r.querySelector("#conditions-count"), $e = r.querySelector("#add-condition"), te = r.querySelector("#fold-conditions"), Le = r.querySelector("#fold-props"), V = r.querySelector("#props"), Ee = r.querySelector("#prop-filter");
  Z.checked = l.caseSensitive, ee.checked = l.includeHidden, se(e, a);
  let S = [], m = [], L = [], We = 1, q = -1, k = !1, A, N = l.property, H = St();
  function v(o, s = !1) {
    Se.textContent = o, Se.classList.toggle("error", s);
  }
  function Y() {
    return {
      query: d.value,
      property: N,
      caseSensitive: Z.checked,
      includeHidden: ee.checked
    };
  }
  function E() {
    const o = m.length > 0, s = q >= 0 && m.some((c) => c.index === q);
    xe.disabled = !o || k, we.disabled = !o || k, ke.disabled = !o || k, ge.disabled = !o || k, ve.disabled = !o || k, be.disabled = !s || k, ye.disabled = k, me.disabled = k, a.classList.toggle("scoped", N.trim() !== ""), u.textContent = N.trim() || "везде", f.title = N.trim() ? "Искать в параметре: " + N : "Искать везде, по всем свойствам";
  }
  function Ge() {
    const o = new Set(H);
    for (const s of _e(S)) o.add(s);
    H = [...o].sort((s, c) => s.localeCompare(c, "ru")).slice(0, 1500), Lt(H);
  }
  function qe() {
    const o = w.value.trim().toLowerCase(), s = H.filter((h) => !o || h.toLowerCase().includes(o)), c = /* @__PURE__ */ new Map();
    for (const h of s) {
      const g = ce.includes(h) ? z : J(h).group, b = c.get(g);
      b ? b.push(h) : c.set(g, [h]);
    }
    const p = '<button class="picker-item' + (N.trim() ? "" : " active") + '" data-key="">везде, по всем свойствам</button>';
    if (!s.length) {
      _.innerHTML = p + '<div class="empty">' + (H.length ? "Ничего не подходит. Enter — искать в том, что набрано." : "Список появится после первого поиска. Имя параметра можно набрать и вручную.") + "</div>";
      return;
    }
    _.innerHTML = p + [...c.entries()].map(
      ([h, g]) => '<div class="picker-group">' + y(h) + "</div>" + g.map(
        (b) => '<button class="picker-item' + (b === N ? " active" : "") + '" data-key="' + y(b) + '" title="' + y(b) + '">' + y(ce.includes(b) ? b : J(b).name) + "</button>"
      ).join("")
    ).join("");
  }
  function D(o) {
    x.hidden = !o, f.setAttribute("aria-expanded", String(o)), o && (w.value = "", qe(), w.focus());
  }
  function ne(o) {
    N = o, W(Y()), E(), D(!1);
  }
  function I() {
    const o = _e(S);
    if (Ue.textContent = L.length ? "· " + L.length : "", !L.length) {
      M.innerHTML = '<div class="empty">Условий нет. Кнопка ＋ добавит условие по свойству.</div>';
      return;
    }
    const s = /* @__PURE__ */ new Map();
    for (const c of o) {
      const { group: p, name: h } = J(c), g = ["Имя", "Модель", "Путь"].includes(c) ? z : p, b = g === z ? c : h, j = s.get(g);
      j ? j.push({ key: c, name: b }) : s.set(g, [{ key: c, name: b }]);
    }
    M.innerHTML = L.map((c) => {
      const p = ['<option value="">любое свойство</option>'].concat([...s.entries()].map(
        ([O, Ze]) => '<optgroup label="' + y(O) + '">' + Ze.map(
          (oe) => '<option value="' + y(oe.key) + '"' + (oe.key === c.key ? " selected" : "") + ">" + y(oe.name) + "</option>"
        ).join("") + "</optgroup>"
      )).join(""), h = je.map(
        (O) => '<option value="' + O.op + '"' + (O.op === c.op ? " selected" : "") + ">" + O.label + "</option>"
      ).join(""), g = je.find((O) => O.op === c.op)?.needsValue ?? !0, b = c.op === "gt" || c.op === "lt", j = g && !F(c), Ne = j ? b && c.value.trim() !== "" ? "нужно число" : "введите значение" : "", P = g ? rt(S, c.key) : [], Ie = "cond-values-" + c.id, Xe = P.length ? '<datalist id="' + Ie + '">' + P.map((O) => '<option value="' + y(O) + '"></option>').join("") + "</datalist>" : "", Qe = b ? "число" : P.length ? "значение или часть" : "значение";
      return '<div class="condition' + (j ? " waiting" : "") + '" data-id="' + c.id + '"><select class="cond-key">' + p + '</select><select class="cond-op">' + h + '</select><input class="cond-value" type="search" placeholder="' + Qe + '" value="' + y(c.value) + '"' + (g ? "" : " disabled") + (P.length ? ' list="' + Ie + '"' : "") + '><button class="cond-remove" title="Удалить условие">×</button>' + Xe + (P.length ? '<div class="cond-hint">известных значений: ' + P.length + "</div>" : "") + (Ne ? '<div class="cond-hint">' + Ne + ", условие пока не применяется</div>" : "") + "</div>";
    }).join("");
  }
  function Je() {
    if (!m.length) {
      T.innerHTML = '<div class="empty">' + (S.length ? "Условия отбора не пропустили ни одного элемента" : "Пока ничего не найдено") + "</div>";
      return;
    }
    T.innerHTML = m.map(
      (o) => '<button class="row" data-index="' + o.index + '"><div class="name">' + y(o.name) + '</div><div class="meta"><span class="model">' + y(o.model) + "</span><span>" + y(o.path) + '</span></div><div class="match">' + y(o.match) + "</div></button>"
    ).join("");
  }
  function B() {
    const o = A ?? m.find((h) => h.index === q);
    if (!o) {
      V.innerHTML = '<div class="empty">Выберите элемент в списке или в модели</div>';
      return;
    }
    const s = Ee.value.trim().toLowerCase(), c = ht(o).map((h) => ({
      group: h.group,
      rows: s ? h.rows.filter((g) => g.name.toLowerCase().includes(s) || g.key.toLowerCase().includes(s) || g.value.toLowerCase().includes(s)) : h.rows
    })).filter((h) => h.rows.length);
    if (!c.length) {
      V.innerHTML = '<div class="empty">Ничего не подходит под фильтр</div>';
      return;
    }
    const p = A ? '<div class="props-note">Элемент выбран в модели</div>' : "";
    V.innerHTML = p + c.map(
      (h) => '<div class="prop-group"><div class="prop-group-name" title="' + y(h.group) + '">' + y(h.group) + '</div><table class="props-table"><tbody>' + h.rows.map(
        (g) => '<tr><th title="' + y(g.key) + '">' + y(g.name) + '</th><td title="' + y(g.value) + '">' + y(g.value) + "</td></tr>"
      ).join("") + "</tbody></table></div>"
    ).join("");
  }
  function K(o = !1) {
    if (m = tt(S, L), q = -1, Je(), B(), E(), o || !S.length) return;
    const s = L.filter(F).length;
    v(s ? "Найдено: " + S.length + ". После отбора по " + s + " условиям: " + m.length + "." : "Найдено: " + S.length + ".");
  }
  function U(o) {
    q = o, A = void 0, T.querySelectorAll(".row").forEach((s) => {
      s.classList.toggle("active", Number(s.dataset.index) === o);
    }), T.querySelector(".row.active")?.scrollIntoView({ block: "nearest" }), B(), E();
  }
  function re(o) {
    if (o < 0 || o >= m.length) return;
    const s = m[o];
    if (!X(t, [s.layer])) {
      v("Нет активного вида чертежа. Откройте окно проекта.", !0);
      return;
    }
    U(s.index), v("Элемент " + (o + 1) + " из " + m.length + ". " + s.model);
  }
  function Ce() {
    return m.findIndex((o) => o.index === q);
  }
  async function $() {
    const o = Y();
    if (W(o), !o.query.trim() && !o.property.trim()) {
      v("Введите значение для поиска или укажите параметр.", !0);
      return;
    }
    const s = G(t);
    if (!s) {
      v("Нет открытого проекта.", !0);
      return;
    }
    mt(t) || v("Нет активного вида чертежа. Поиск выполнится, но подсветка работать не будет."), k = !0, S = [], m = [], q = -1, E(), v("Поиск…");
    try {
      const c = await Ke(s, o, (p, h, g) => {
        v("Просмотрено " + p + ", найдено " + h + (g ? ". " + g : ""));
      });
      if (S = c.hits, I(), Ge(), K(!0), S.length) {
        const p = L.filter(F).length ? " После условий отбора: " + m.length + "." : "";
        v("Найдено: " + S.length + "." + p + " Просмотрено слоёв: " + c.scanned + " в моделях: " + c.models + " за " + Math.round(c.elapsed / 100) / 10 + " с.");
      } else {
        const p = o.property.trim() ? " Параметр: " + o.property.trim() + "." : "";
        v("Ничего не найдено." + p + " Просмотрено слоёв: " + c.scanned + " в моделях: " + c.models + ".");
      }
    } catch (c) {
      v("Ошибка поиска: " + (c?.message ?? String(c)), !0);
    } finally {
      k = !1, E();
    }
  }
  ye.addEventListener("click", () => {
    $();
  }), d.addEventListener("keydown", (o) => {
    o.key === "Enter" && $();
  }), f.addEventListener("click", () => D(x.hidden)), w.addEventListener("input", () => qe()), w.addEventListener("keydown", (o) => {
    const s = o.key;
    if (s === "Escape") {
      D(!1);
      return;
    }
    if (s !== "Enter") return;
    const c = w.value.trim();
    ne(c), $();
  }), _.addEventListener("click", (o) => {
    const s = o.target.closest(".picker-item");
    s && (ne(s.dataset.key ?? ""), $());
  }), Ye.addEventListener("click", () => {
    ne("");
  }), a.addEventListener("pointerdown", (o) => {
    if (x.hidden) return;
    const s = o.target;
    s.closest(".picker") || s.closest("#param-clear") || D(!1);
  }), Z.addEventListener("change", () => W(Y())), ee.addEventListener("change", () => W(Y())), ge.addEventListener("click", () => {
    (async () => {
      if (m.length) {
        k = !0, E(), v("Скрываю элементы…");
        try {
          const o = await bt(m.map((s) => s.layer));
          de(t), v("Скрыто элементов: " + o + ". Вернуть их можно кнопкой «Показать все».");
        } catch (o) {
          v("Не удалось скрыть: " + (o?.message ?? String(o)), !0);
        } finally {
          k = !1, E();
        }
      }
    })();
  });
  function Oe(o, s) {
    (async () => {
      const c = G(t);
      if (!c) {
        v("Нет открытого проекта.", !0);
        return;
      }
      if (o.length) {
        k = !0, E(), v("Изолирую…");
        try {
          const p = await yt(c, o);
          X(t, o, !0), v("Изолировано: " + s + ", элементов " + o.length + ". Скрыто веток: " + p.hidden + ". Вернуть вид можно кнопкой показа всего.");
        } catch (p) {
          v("Не удалось изолировать: " + (p?.message ?? String(p)), !0);
        } finally {
          k = !1, E();
        }
      }
    })();
  }
  ve.addEventListener("click", () => {
    Oe(m.map((o) => o.layer), "найденные");
  }), be.addEventListener("click", () => {
    const o = m.find((s) => s.index === q);
    o && Oe([o.layer], "выбранный элемент");
  }), me.addEventListener("click", () => {
    (async () => {
      const o = G(t);
      if (!o) {
        v("Нет открытого проекта.", !0);
        return;
      }
      k = !0, E(), v("Показываю скрытое…");
      try {
        const s = await xt(o);
        v(s ? "Показано элементов: " + s + "." : "Скрытых элементов не было.");
      } catch (s) {
        v("Не удалось показать: " + (s?.message ?? String(s)), !0);
      } finally {
        k = !1, E();
      }
    })();
  }), xe.addEventListener("click", () => {
    if (m.length) {
      if (!X(t, m.map((o) => o.layer))) {
        v("Нет активного вида чертежа. Откройте окно проекта.", !0);
        return;
      }
      q = -1, U(-1), v("Подсвечено элементов: " + m.length + ".");
    }
  }), we.addEventListener("click", () => {
    if (!m.length) return;
    const o = Ce();
    re(o <= 0 ? m.length - 1 : o - 1);
  }), ke.addEventListener("click", () => {
    if (!m.length) return;
    const o = Ce();
    re(o >= m.length - 1 ? 0 : o + 1);
  }), De.addEventListener("click", () => {
    de(t), q = -1, U(-1), v("Выделение снято.");
  }), T.addEventListener("click", (o) => {
    const s = o.target.closest(".row");
    if (!s) return;
    const c = Number(s.dataset.index);
    re(m.findIndex((p) => p.index === c));
  }), $e.addEventListener("click", () => {
    L.push({ id: We++, key: pe, op: "contains", value: "" }), M.hidden = !1, te.setAttribute("aria-expanded", "true"), I(), K();
  }), te.addEventListener("click", () => {
    const o = M.hidden;
    M.hidden = !o, te.setAttribute("aria-expanded", String(o)), o && I();
  }), Le.addEventListener("click", () => {
    const o = V.hidden;
    V.hidden = !o, Le.setAttribute("aria-expanded", String(o));
  }), Ee.addEventListener("input", () => B()), M.addEventListener("click", (o) => {
    const s = o.target.closest(".cond-remove");
    if (!s) return;
    const c = Number(s.closest(".condition").dataset.id);
    L = L.filter((p) => p.id !== c), I(), K();
  }), M.addEventListener("change", (o) => {
    const s = o.target, c = s.closest(".condition");
    if (!c) return;
    const p = L.find((h) => h.id === Number(c.dataset.id));
    p && (s.classList.contains("cond-key") && (p.key = s.value, I()), s.classList.contains("cond-op") && (p.op = s.value, I()), s.classList.contains("cond-value") && (p.value = s.value), K());
  }), M.addEventListener("input", (o) => {
    const s = o.target;
    if (!s.classList.contains("cond-value")) return;
    const c = s.closest(".condition");
    if (!c) return;
    const p = L.find((j) => j.id === Number(c.dataset.id));
    if (!p) return;
    p.value = s.value;
    const h = p.op === "gt" || p.op === "lt", g = !F(p);
    c.classList.toggle("waiting", g);
    let b = c.querySelector(".cond-hint");
    g ? (b || (b = document.createElement("div"), b.className = "cond-hint", c.appendChild(b)), b.textContent = (h && p.value.trim() !== "" ? "нужно число" : "введите значение") + ", условие пока не применяется") : b && b.remove(), K();
  });
  const Me = (o) => {
    if (!e.isConnected) {
      ue.delete(Me);
      return;
    }
    if (!o.length) {
      if (!A) return;
      A = void 0, B();
      return;
    }
    const s = o[0], c = m.find((p) => p.layer === s);
    if (c) {
      U(c.index);
      return;
    }
    A = gt(s), B();
  };
  ue.add(Me), a.addEventListener("pointerdown", () => se(e, a)), setTimeout(() => se(e, a), 500), I(), E();
}
const Ct = ':host,.app{--bg: rgb(var(--v-theme-surface, 30 30 30));--fg: rgb(var(--v-theme-on-surface, 235 240 245));--muted: color-mix(in srgb, var(--fg) 55%, transparent);--line: color-mix(in srgb, var(--fg) 18%, transparent);--soft: color-mix(in srgb, var(--fg) 7%, transparent);--accent: #f2c94c;--accent-fg: #16191e}*{box-sizing:border-box}.app{display:flex;flex-direction:column;height:100%;min-height:0;gap:7px;padding:9px;background:var(--bg);font:13px/1.45 Ubuntu,system-ui,sans-serif;color:var(--fg)}.query{display:flex;gap:6px}input[type=search],input[type=text],select{min-width:0;padding:6px 8px;border:1px solid var(--line);border-radius:7px;background:var(--soft);color:inherit;font:inherit}.query input[type=search]{flex:1;padding:8px 10px}input[type=search]:focus,select:focus{outline:2px solid var(--accent);outline-offset:-1px}button{padding:6px 10px;border:1px solid var(--line);border-radius:7px;background:var(--soft);color:inherit;font:inherit;cursor:pointer;white-space:nowrap}button:hover:not(:disabled){border-color:var(--accent)}button:disabled{opacity:.45;cursor:default}button.primary{background:var(--accent);color:var(--accent-fg);border-color:transparent;font-weight:700}.scope{display:flex;align-items:center;gap:6px}.scope-label{color:var(--muted);font-size:12px;white-space:nowrap}.app.scoped .scope-label{color:var(--accent)}.picker{position:relative;flex:1;min-width:0}.picker-button{display:flex;align-items:center;gap:4px;width:100%;padding:6px 8px;text-align:left}.picker-value{flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.app.scoped .picker-button{border-color:var(--accent)}.app.scoped .picker-value{color:var(--accent);font-weight:600}.picker-popup{position:absolute;z-index:20;top:calc(100% + 3px);left:0;right:0;display:flex;flex-direction:column;max-height:320px;padding:6px;border:1px solid var(--line);border-radius:8px;background:var(--bg);box-shadow:0 10px 28px #00000073}.picker-popup input{width:100%}.picker-list{flex:1;min-height:0;overflow:auto;margin-top:6px}.picker-group{padding:5px 6px 3px;color:var(--muted);font-size:11px;font-weight:700;overflow-wrap:anywhere}.picker-item{display:block;width:100%;padding:5px 8px;border:0;border-radius:6px;background:transparent;text-align:left;overflow-wrap:anywhere}.picker-item:hover{background:var(--soft)}.picker-item.active{background:color-mix(in srgb,var(--accent) 25%,transparent);font-weight:600}.picker-foot{padding-top:5px;color:var(--muted);font-size:11px}.options{display:flex;flex-wrap:wrap;gap:12px;color:var(--muted)}.options label{display:inline-flex;align-items:center;gap:5px}.block{border:1px solid var(--line);border-radius:8px}.block-head{display:flex;align-items:center;gap:6px;padding:4px 6px}.block-head .fold{flex:1;border:0;background:transparent;text-align:left;font-weight:600;padding:3px 2px}.block-head .fold:before{content:"▾ ";color:var(--muted)}.block-head .fold[aria-expanded=false]:before{content:"▸ "}.block-head input[type=search]{width:120px}.conditions{padding:0 6px 6px;display:flex;flex-direction:column;gap:5px}.condition{display:grid;grid-template-columns:minmax(0,1.3fr) minmax(0,.9fr) minmax(0,1fr) auto;gap:4px}.condition select,.condition input{font-size:12px}.condition.waiting select,.condition.waiting input{border-color:color-mix(in srgb,var(--accent) 60%,var(--line))}.cond-hint{grid-column:1 / -1;color:var(--muted);font-size:11px}.theme-dark{--popup-bg: #232323;--popup-fg: #edf1f6;--popup-head: #2f2f2f}.theme-light{--popup-bg: #ffffff;--popup-fg: #16191e;--popup-head: #ececec}option{background-color:var(--popup-bg, #232323);color:var(--popup-fg, #edf1f6)}optgroup{background-color:var(--popup-head, #2f2f2f);color:var(--popup-fg, #edf1f6);font-weight:700;font-style:normal}.bar{display:flex;align-items:center;gap:6px;flex-wrap:wrap}.bar .spacer{flex:1}.toolbar{display:flex;align-items:center;gap:2px;padding:2px;border:1px solid var(--line);border-radius:8px}.toolbar .sep{width:1px;align-self:stretch;margin:2px 4px;background:var(--line)}button.ib{display:inline-flex;align-items:center;justify-content:center;width:30px;height:28px;padding:0;border-color:transparent;background:transparent}button.ib:hover:not(:disabled){background:var(--soft);border-color:var(--line)}button.ib:active:not(:disabled){background:color-mix(in srgb,var(--accent) 25%,transparent)}.ic{font-family:Material Symbols Outlined;font-size:19px;line-height:1;font-weight:300;-webkit-font-feature-settings:"liga";font-variant-ligatures:common-ligatures}.ic-text{font-size:15px;line-height:1}.status{color:var(--muted);min-height:17px}.status.error{color:#ff6b6b}.list{flex:1 1 55%;min-height:90px;overflow:auto;border:1px solid var(--line);border-radius:8px}.row{display:block;width:100%;padding:6px 9px;border:0;border-bottom:1px solid var(--line);border-radius:0;background:transparent;text-align:left;cursor:pointer}.row:last-child{border-bottom:0}.row:hover{background:var(--soft)}.row.active{background:color-mix(in srgb,var(--accent) 22%,transparent)}.row .name{font-weight:600;word-break:break-word}.row .meta{display:flex;gap:6px;align-items:baseline;color:var(--muted);font-size:12px}.row .model{color:var(--accent)}.row .match{color:var(--muted);font-family:ui-monospace,Consolas,monospace;font-size:11px;word-break:break-all}.props-block{display:flex;flex-direction:column;flex:1 1 45%;min-height:90px}.props{flex:1;min-height:0;overflow:auto;padding:0 6px 6px}.props-note{padding:3px 5px;color:var(--accent);font-size:11px}.prop-group{margin-bottom:7px}.prop-group-name{padding:3px 5px;background:var(--soft);border-radius:5px;font-size:11px;font-weight:700;letter-spacing:.01em;overflow-wrap:anywhere}.props-table{width:100%;border-collapse:collapse;font-size:12px;table-layout:fixed}.props-table th,.props-table td{text-align:left;vertical-align:top;padding:3px 5px;border-bottom:1px solid var(--line);overflow-wrap:anywhere}.props-table th{width:42%;font-weight:500;color:var(--muted)}.empty{padding:14px;color:var(--muted);text-align:center}.hint{color:var(--muted);font-size:11px}', Ot = "0.6.0", Ve = "nashepo.info/search_panel";
function ae(e) {
  return new Proxy(e, {
    get(t, n) {
      return n === "app" ? e.manager.activeApp : n === "cadview" ? e.manager.activeWindow?.context : Reflect.get(t, n);
    }
  });
}
const Mt = {
  /** Открыть панель поиска. */
  open(e) {
    e.manager.revealView(Ve);
  },
  /** Смонтировать панель. */
  mount(e) {
    const t = e.el;
    if (!t) return;
    const n = document.createElement("div");
    n.style.height = "100%", t.replaceChildren(n), qt(n, ae(e), Ct, Ot);
  },
  /** Быстрый поиск: спросить значение и сразу подсветить все совпадения. */
  async quick(e) {
    const t = ae(e), n = G(t);
    if (!n) {
      await e.showMessage("Нет открытого проекта.", "warning");
      return;
    }
    const i = await e.showInputBox({
      title: "Поиск по проекту",
      prompt: "Значение, имя, GUID или часть свойства",
      placeHolder: "Введите искомое значение"
    });
    if (!i || !i.trim()) return;
    const r = { ...He(), query: i }, l = e.beginProgress();
    l.indeterminate = !0, l.label = "Поиск по проекту";
    let a;
    try {
      a = await Ke(n, r, (f, u) => {
        l.details = "просмотрено " + f + ", найдено " + u;
      });
    } finally {
      e.endProgress(l);
    }
    if (!a.hits.length) {
      await e.showMessage("Ничего не найдено. Просмотрено слоёв: " + a.scanned + ".", "info");
      return;
    }
    const d = X(t, a.hits.map((f) => f.layer));
    e.manager.revealView(Ve), await e.showMessage(
      d ? "Найдено элементов: " + a.hits.length + ". Они подсвечены в модели." : "Найдено элементов: " + a.hits.length + ", но активного вида чертежа нет.",
      d ? "info" : "warning"
    );
  },
  /** Снять подсветку. */
  clear(e) {
    de(ae(e));
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
      Te([]);
      return;
    }
    const i = [], r = /* @__PURE__ */ new Set();
    try {
      for (const l of n.selectedObjects()) {
        const a = l?.layer;
        a && !r.has(a) && (r.add(a), i.push(a));
      }
    } catch {
      return;
    }
    Te(i);
  }
};
export {
  Mt as default
};
