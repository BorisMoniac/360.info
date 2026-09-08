const Le = () => ({
  query: "",
  property: "",
  caseSensitive: !1,
  includeHidden: !1
}), me = [
  { op: "contains", label: "содержит", needsValue: !0 },
  { op: "notContains", label: "не содержит", needsValue: !0 },
  { op: "equals", label: "равно", needsValue: !0 },
  { op: "notEquals", label: "не равно", needsValue: !0 },
  { op: "gt", label: "больше", needsValue: !0 },
  { op: "lt", label: "меньше", needsValue: !0 },
  { op: "exists", label: "заполнено", needsValue: !1 },
  { op: "missing", label: "пусто", needsValue: !1 }
], Se = "", Pe = ["Имя", "Модель", "Путь"];
function Ve(e, t) {
  return t === "Имя" ? e.name : t === "Модель" ? e.model : t === "Путь" ? e.path : e.props[t];
}
function ve(e) {
  const t = [e.name, e.model, e.path];
  for (const n in e.props) t.push(e.props[n]);
  return t;
}
function Q(e) {
  const n = e.replace(/\s| /g, "").replace(",", ".").match(/-?\d+(\.\d+)?/);
  return n ? parseFloat(n[0]) : NaN;
}
function G(e, t) {
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
      const l = Q(e), a = Q(t.value);
      return !Number.isFinite(l) || !Number.isFinite(a) ? !1 : t.op === "gt" ? l > a : l < a;
    }
    default:
      return !1;
  }
}
function Ae(e, t) {
  return t.key !== Se ? G(Ve(e, t.key), t) : t.op === "missing" ? ve(e).every((n) => !G(n, { ...t, op: "exists" })) : ve(e).some((n) => G(n, t));
}
function B(e) {
  return e.op === "exists" || e.op === "missing" ? !0 : e.value.trim() === "" ? !1 : e.op === "gt" || e.op === "lt" ? Number.isFinite(Q(e.value)) : !0;
}
function ze(e, t) {
  const n = t.filter(B);
  return n.length ? e.filter((s) => n.every((o) => Ae(s, o))) : e;
}
function be(e) {
  const t = /* @__PURE__ */ new Set();
  for (const s of e) for (const o in s.props) t.add(o);
  const n = [...t].sort((s, o) => s.localeCompare(o, "ru"));
  return [...Pe, ...n];
}
const Be = 8, Re = 800, _e = 400;
function ye(e) {
  if (!e) return;
  const t = e.model;
  if (!(!t || typeof t != "object" || !("attachments" in t)))
    return t.project ?? t;
}
function Z(e) {
  return ye(e.app) ?? ye(e.manager.activeApp);
}
function qe(e, t) {
  const n = [{ title: "Проект", drawing: e }];
  return e.attachments.forEach((s) => {
    if (!t && s.hidden) return;
    const o = s.model;
    o && n.push({ title: s.name ?? "Вложение", drawing: o });
  }), n;
}
function De(e) {
  if (e == null) return;
  const t = typeof e;
  if (t === "string") return e;
  if (t === "number" || t === "boolean") return String(e);
}
function D(e) {
  const t = {};
  let n = 0;
  const s = (o, l, a) => {
    if (a > Be || n > Re) return;
    n++;
    const d = De(o);
    if (d !== void 0) {
      l && (t[l] = d);
      return;
    }
    if (Array.isArray(o)) {
      for (let p = 0; p < o.length; p++) s(o[p], l + "[" + p + "]", a + 1);
      return;
    }
    if (!o || typeof o != "object") return;
    const f = o;
    if (f.$value !== void 0) {
      s(f.$value, l, a + 1);
      return;
    }
    for (const p in f)
      p.startsWith("$") || s(f[p], l ? l + "." + p : p, a + 1);
  };
  try {
    s(e.typedProperties(), "", 0);
  } catch {
  }
  return t;
}
function Fe(e) {
  const t = e.indexOf("|");
  if (t > 0) return e.slice(t + 1);
  const n = e.lastIndexOf(".");
  return n > 0 ? e.slice(n + 1) : e;
}
function Ke(e, t, n) {
  const s = D(e);
  for (const o in s) {
    const l = s[o], a = n ? l : l.toLowerCase(), d = n ? o : o.toLowerCase();
    if (a.includes(t) || d.includes(t)) return o + ": " + l;
  }
}
function Ue(e, t, n, s) {
  const o = D(e);
  for (const l in o) {
    const a = l.toLowerCase(), d = Fe(l).toLowerCase();
    if (!a.includes(t) && !d.includes(t)) continue;
    const f = o[l];
    if (!n) return f ? l + ": " + f : void 0;
    if ((s ? f : f.toLowerCase()).includes(n)) return l + ": " + f;
  }
}
function Ye(e, t, n) {
  const s = n.caseSensitive, o = n.property.trim().toLowerCase();
  if (o) return Ue(e, o, t, s);
  const l = e.name ?? "";
  if ((s ? l : l.toLowerCase()).includes(t)) return "имя: " + l;
  const a = e.$path ?? "";
  if ((s ? a : a.toLowerCase()).includes(t)) return "путь: " + a;
  let d = "";
  try {
    d = e.typed?.name ?? "";
  } catch {
    d = "";
  }
  return d && (s ? d : d.toLowerCase()).includes(t) ? "тип: " + d : Ke(e, t, s);
}
async function Ee(e, t, n) {
  const s = Date.now(), o = t.query.trim(), l = t.caseSensitive ? o : o.toLowerCase(), a = [];
  let d = 0;
  if (!l && !t.property.trim()) return { hits: a, scanned: 0, models: 0, elapsed: 0 };
  const f = qe(e, t.includeHidden);
  for (const p of f) {
    const R = [];
    p.drawing.layers.forEach((S) => {
      R.push(S);
    });
    for (const S of R) {
      d++, d % _e === 0 && (n?.(d, a.length, p.title), await we());
      const T = Ye(S, l, t);
      T && a.push({
        index: a.length,
        layer: S,
        name: S.name ?? "без имени",
        model: p.title,
        path: S.$path ?? "",
        match: T,
        props: {}
      });
    }
  }
  for (let p = 0; p < a.length; p++)
    a[p].props = D(a[p].layer), p % 200 === 0 && (n?.(d, a.length, "чтение свойств"), await we());
  return n?.(d, a.length, ""), { hits: a, scanned: d, models: f.length, elapsed: Date.now() - s };
}
function we() {
  return new Promise((e) => setTimeout(e, 0));
}
const ee = "Прочее", j = "Элемент";
function te(e) {
  const t = e.indexOf("|");
  if (t > 0) return { group: e.slice(0, t), name: e.slice(t + 1) };
  const n = e.lastIndexOf(".");
  return n > 0 ? { group: e.slice(0, n), name: e.slice(n + 1) } : { group: ee, name: e };
}
function $e(e) {
  const t = /* @__PURE__ */ new Map();
  t.set(j, [
    { key: "Имя", name: "Имя", value: e.name },
    { key: "Модель", name: "Модель", value: e.model },
    { key: "Путь", name: "Путь", value: e.path }
  ]);
  for (const s of Object.keys(e.props).sort((o, l) => o.localeCompare(l, "ru"))) {
    const { group: o, name: l } = te(s), a = t.get(o), d = { key: s, name: l, value: e.props[s] };
    a ? a.push(d) : t.set(o, [d]);
  }
  const n = [...t.entries()].filter(([s]) => s !== j).sort((s, o) => s[0] === ee ? 1 : o[0] === ee ? -1 : s[0].localeCompare(o[0], "ru"));
  return [
    { group: j, rows: t.get(j) },
    ...n.map(([s, o]) => ({ group: s, rows: o }))
  ];
}
function We(e) {
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
    props: D(e)
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
function Ge(e) {
  return se(e) !== void 0;
}
function Je(e, t) {
  let n = e;
  for (let s = 0; n && s < 32; s++) {
    if (t.has(n)) return !0;
    n = n.layer;
  }
  return !1;
}
function ne(e, t, n) {
  const s = se(e);
  if (!s) return !1;
  const o = new Set(t), l = Math3d.box3.alloc(), a = Math3d.box3.alloc();
  let d = 0;
  if (s.layer.clearSelected(), o.size && s.layer.selectObjects((f) => {
    const p = f;
    return Je(p?.layer, o) ? (p.qbounds && p.qbounds(a) && (d === 0 ? Math3d.box3.dup(l, a) : Math3d.box3.addBox(l, a), d++), !0) : !1;
  }, !0), d > 0)
    try {
      s.camera.zoom(l, s);
    } catch {
    }
  return s.invalidate(), !0;
}
function oe(e) {
  const t = se(e);
  return t ? (t.layer.clearSelected(), t.invalidate(), !0) : !1;
}
async function Xe(e) {
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
async function Qe(e) {
  let t = 0;
  for (const n of qe(e, !0)) {
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
const Ce = "nashepo.info.search.v2", re = /* @__PURE__ */ new Set();
function xe(e) {
  for (const t of re) t(e);
}
function b(e) {
  return e.replace(/[&<>"]/g, (t) => t === "&" ? "&amp;" : t === "<" ? "&lt;" : t === ">" ? "&gt;" : "&quot;");
}
function Ze() {
  const e = Le();
  try {
    const t = localStorage.getItem(Ce);
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
function z(e) {
  try {
    localStorage.setItem(Ce, JSON.stringify(e));
  } catch {
  }
}
function et(e) {
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
function J(e, t) {
  const n = et(e.parentElement ?? e);
  e.style.colorScheme = n ? "light" : "dark", t.classList.toggle("theme-light", n), t.classList.toggle("theme-dark", !n);
}
function tt(e, t, n, s) {
  const o = e.attachShadow ? e.shadowRoot || e.attachShadow({ mode: "open" }) : e, l = Ze();
  o.innerHTML = "<style>" + n + '</style><main class="app" id="app"><div class="query"><input id="query" type="search" placeholder="Значение, имя, GUID, что угодно" value="' + b(l.query) + '"><button class="primary" id="find">Найти</button></div><div class="scope"><span class="scope-label">в параметре</span><input id="param" list="param-list" placeholder="любой параметр" value="' + b(l.property) + '"><datalist id="param-list"></datalist><button id="param-clear" title="Искать везде">×</button></div><div class="options"><label><input id="case" type="checkbox"> учитывать регистр</label><label><input id="hidden" type="checkbox"> искать в скрытых</label></div><section class="block"><div class="block-head"><button class="fold" id="fold-conditions" aria-expanded="false">Условия отбора <span id="conditions-count"></span></button><button id="add-condition" title="Добавить условие">＋</button></div><div class="conditions" id="conditions" hidden></div></section><div class="bar"><button id="all">Подсветить все</button><button id="prev" title="Предыдущий элемент">←</button><button id="next" title="Следующий элемент">→</button><span class="spacer"></span><button id="reset">Снять</button></div><div class="bar"><button id="hide" title="Скрыть элементы из списка">Скрыть найденные</button><button id="show-all" title="Показать всё скрытое в проекте">Показать все</button></div><div class="status" id="status">Введите значение и нажмите «Найти».</div><div class="list" id="list"><div class="empty">Пока ничего не найдено</div></div><section class="block props-block"><div class="block-head"><button class="fold" id="fold-props" aria-expanded="true">Свойства элемента</button><input id="prop-filter" type="search" placeholder="фильтр свойств"></div><div class="props" id="props"><div class="empty">Выберите элемент в списке</div></div></section><div class="hint">Щелчок по строке подсвечивает элемент и переводит к нему камеру. Версия ' + b(s) + "</div></main>";
  const a = o.querySelector("#app"), d = o.querySelector("#query"), f = o.querySelector("#param"), p = o.querySelector("#param-list"), R = o.querySelector("#param-clear"), S = o.querySelector("#hide"), T = o.querySelector("#show-all"), F = o.querySelector("#case"), K = o.querySelector("#hidden"), ie = o.querySelector("#find"), ae = o.querySelector("#all"), ce = o.querySelector("#prev"), le = o.querySelector("#next"), Oe = o.querySelector("#reset"), de = o.querySelector("#status"), I = o.querySelector("#list"), q = o.querySelector("#conditions"), Me = o.querySelector("#conditions-count"), Ne = o.querySelector("#add-condition"), U = o.querySelector("#fold-conditions"), ue = o.querySelector("#fold-props"), H = o.querySelector("#props"), pe = o.querySelector("#prop-filter");
  F.checked = l.caseSensitive, K.checked = l.includeHidden, J(e, a);
  let k = [], g = [], w = [], je = 1, E = -1, x = !1, M;
  function h(r, i = !1) {
    de.textContent = r, de.classList.toggle("error", i);
  }
  function P() {
    return {
      query: d.value,
      property: f.value,
      caseSensitive: F.checked,
      includeHidden: K.checked
    };
  }
  function L() {
    const r = g.length > 0;
    ae.disabled = !r || x, ce.disabled = !r || x, le.disabled = !r || x, S.disabled = !r || x, ie.disabled = x, T.disabled = x, a.classList.toggle("scoped", f.value.trim() !== "");
  }
  function Te() {
    const r = /* @__PURE__ */ new Set();
    for (const i of be(k)) {
      r.add(i);
      const c = te(i).name;
      c && c !== i && r.add(c);
    }
    p.innerHTML = [...r].sort((i, c) => i.localeCompare(c, "ru")).slice(0, 400).map((i) => '<option value="' + b(i) + '"></option>').join("");
  }
  function N() {
    const r = be(k);
    if (Me.textContent = w.length ? "· " + w.length : "", !w.length) {
      q.innerHTML = '<div class="empty">Условий нет. Кнопка ＋ добавит условие по свойству.</div>';
      return;
    }
    const i = /* @__PURE__ */ new Map();
    for (const c of r) {
      const { group: u, name: m } = te(c), v = ["Имя", "Модель", "Путь"].includes(c) ? j : u, y = v === j ? c : m, C = i.get(v);
      C ? C.push({ key: c, name: y }) : i.set(v, [{ key: c, name: y }]);
    }
    q.innerHTML = w.map((c) => {
      const u = ['<option value="">любое свойство</option>'].concat([...i.entries()].map(
        ([O, He]) => '<optgroup label="' + b(O) + '">' + He.map(
          (W) => '<option value="' + b(W.key) + '"' + (W.key === c.key ? " selected" : "") + ">" + b(W.name) + "</option>"
        ).join("") + "</optgroup>"
      )).join(""), m = me.map(
        (O) => '<option value="' + O.op + '"' + (O.op === c.op ? " selected" : "") + ">" + O.label + "</option>"
      ).join(""), v = me.find((O) => O.op === c.op)?.needsValue ?? !0, y = c.op === "gt" || c.op === "lt", C = v && !B(c), he = C ? y && c.value.trim() !== "" ? "нужно число" : "введите значение" : "";
      return '<div class="condition' + (C ? " waiting" : "") + '" data-id="' + c.id + '"><select class="cond-key">' + u + '</select><select class="cond-op">' + m + '</select><input class="cond-value" type="search" placeholder="' + (y ? "число" : "значение") + '" value="' + b(c.value) + '"' + (v ? "" : " disabled") + '><button class="cond-remove" title="Удалить условие">×</button>' + (he ? '<div class="cond-hint">' + he + ", условие пока не применяется</div>" : "") + "</div>";
    }).join("");
  }
  function Ie() {
    if (!g.length) {
      I.innerHTML = '<div class="empty">' + (k.length ? "Условия отбора не пропустили ни одного элемента" : "Пока ничего не найдено") + "</div>";
      return;
    }
    I.innerHTML = g.map(
      (r) => '<button class="row" data-index="' + r.index + '"><div class="name">' + b(r.name) + '</div><div class="meta"><span class="model">' + b(r.model) + "</span><span>" + b(r.path) + '</span></div><div class="match">' + b(r.match) + "</div></button>"
    ).join("");
  }
  function V() {
    const r = M ?? g.find((m) => m.index === E);
    if (!r) {
      H.innerHTML = '<div class="empty">Выберите элемент в списке или в модели</div>';
      return;
    }
    const i = pe.value.trim().toLowerCase(), c = $e(r).map((m) => ({
      group: m.group,
      rows: i ? m.rows.filter((v) => v.name.toLowerCase().includes(i) || v.key.toLowerCase().includes(i) || v.value.toLowerCase().includes(i)) : m.rows
    })).filter((m) => m.rows.length);
    if (!c.length) {
      H.innerHTML = '<div class="empty">Ничего не подходит под фильтр</div>';
      return;
    }
    const u = M ? '<div class="props-note">Элемент выбран в модели</div>' : "";
    H.innerHTML = u + c.map(
      (m) => '<div class="prop-group"><div class="prop-group-name" title="' + b(m.group) + '">' + b(m.group) + '</div><table class="props-table"><tbody>' + m.rows.map(
        (v) => '<tr><th title="' + b(v.key) + '">' + b(v.name) + '</th><td title="' + b(v.value) + '">' + b(v.value) + "</td></tr>"
      ).join("") + "</tbody></table></div>"
    ).join("");
  }
  function A(r = !1) {
    if (g = ze(k, w), E = -1, Ie(), V(), L(), r || !k.length) return;
    const i = w.filter(B).length;
    h(i ? "Найдено: " + k.length + ". После отбора по " + i + " условиям: " + g.length + "." : "Найдено: " + k.length + ".");
  }
  function _(r) {
    E = r, M = void 0, I.querySelectorAll(".row").forEach((i) => {
      i.classList.toggle("active", Number(i.dataset.index) === r);
    }), I.querySelector(".row.active")?.scrollIntoView({ block: "nearest" }), V();
  }
  function Y(r) {
    if (r < 0 || r >= g.length) return;
    const i = g[r];
    if (!ne(t, [i.layer])) {
      h("Нет активного вида чертежа. Откройте окно проекта.", !0);
      return;
    }
    _(i.index), h("Элемент " + (r + 1) + " из " + g.length + ". " + i.model);
  }
  function fe() {
    return g.findIndex((r) => r.index === E);
  }
  async function $() {
    const r = P();
    if (z(r), !r.query.trim() && !r.property.trim()) {
      h("Введите значение для поиска или укажите параметр.", !0);
      return;
    }
    const i = Z(t);
    if (!i) {
      h("Нет открытого проекта.", !0);
      return;
    }
    Ge(t) || h("Нет активного вида чертежа. Поиск выполнится, но подсветка работать не будет."), x = !0, k = [], g = [], E = -1, L(), h("Поиск…");
    try {
      const c = await Ee(i, r, (u, m, v) => {
        h("Просмотрено " + u + ", найдено " + m + (v ? ". " + v : ""));
      });
      if (k = c.hits, N(), Te(), A(!0), k.length) {
        const u = w.filter(B).length ? " После условий отбора: " + g.length + "." : "";
        h("Найдено: " + k.length + "." + u + " Просмотрено слоёв: " + c.scanned + " в моделях: " + c.models + " за " + Math.round(c.elapsed / 100) / 10 + " с.");
      } else {
        const u = r.property.trim() ? " Параметр: " + r.property.trim() + "." : "";
        h("Ничего не найдено." + u + " Просмотрено слоёв: " + c.scanned + " в моделях: " + c.models + ".");
      }
    } catch (c) {
      h("Ошибка поиска: " + (c?.message ?? String(c)), !0);
    } finally {
      x = !1, L();
    }
  }
  ie.addEventListener("click", () => {
    $();
  }), d.addEventListener("keydown", (r) => {
    r.key === "Enter" && $();
  }), f.addEventListener("keydown", (r) => {
    r.key === "Enter" && $();
  }), f.addEventListener("input", () => {
    z(P()), L();
  }), R.addEventListener("click", () => {
    f.value = "", z(P()), L(), f.focus();
  }), F.addEventListener("change", () => z(P())), K.addEventListener("change", () => z(P())), S.addEventListener("click", () => {
    (async () => {
      if (g.length) {
        x = !0, L(), h("Скрываю элементы…");
        try {
          const r = await Xe(g.map((i) => i.layer));
          oe(t), h("Скрыто элементов: " + r + ". Вернуть их можно кнопкой «Показать все».");
        } catch (r) {
          h("Не удалось скрыть: " + (r?.message ?? String(r)), !0);
        } finally {
          x = !1, L();
        }
      }
    })();
  }), T.addEventListener("click", () => {
    (async () => {
      const r = Z(t);
      if (!r) {
        h("Нет открытого проекта.", !0);
        return;
      }
      x = !0, L(), h("Показываю скрытое…");
      try {
        const i = await Qe(r);
        h(i ? "Показано элементов: " + i + "." : "Скрытых элементов не было.");
      } catch (i) {
        h("Не удалось показать: " + (i?.message ?? String(i)), !0);
      } finally {
        x = !1, L();
      }
    })();
  }), ae.addEventListener("click", () => {
    if (g.length) {
      if (!ne(t, g.map((r) => r.layer))) {
        h("Нет активного вида чертежа. Откройте окно проекта.", !0);
        return;
      }
      E = -1, _(-1), h("Подсвечено элементов: " + g.length + ".");
    }
  }), ce.addEventListener("click", () => {
    if (!g.length) return;
    const r = fe();
    Y(r <= 0 ? g.length - 1 : r - 1);
  }), le.addEventListener("click", () => {
    if (!g.length) return;
    const r = fe();
    Y(r >= g.length - 1 ? 0 : r + 1);
  }), Oe.addEventListener("click", () => {
    oe(t), E = -1, _(-1), h("Выделение снято.");
  }), I.addEventListener("click", (r) => {
    const i = r.target.closest(".row");
    if (!i) return;
    const c = Number(i.dataset.index);
    Y(g.findIndex((u) => u.index === c));
  }), Ne.addEventListener("click", () => {
    w.push({ id: je++, key: Se, op: "contains", value: "" }), q.hidden = !1, U.setAttribute("aria-expanded", "true"), N(), A();
  }), U.addEventListener("click", () => {
    const r = q.hidden;
    q.hidden = !r, U.setAttribute("aria-expanded", String(r)), r && N();
  }), ue.addEventListener("click", () => {
    const r = H.hidden;
    H.hidden = !r, ue.setAttribute("aria-expanded", String(r));
  }), pe.addEventListener("input", () => V()), q.addEventListener("click", (r) => {
    const i = r.target.closest(".cond-remove");
    if (!i) return;
    const c = Number(i.closest(".condition").dataset.id);
    w = w.filter((u) => u.id !== c), N(), A();
  }), q.addEventListener("change", (r) => {
    const i = r.target, c = i.closest(".condition");
    if (!c) return;
    const u = w.find((m) => m.id === Number(c.dataset.id));
    u && (i.classList.contains("cond-key") && (u.key = i.value), i.classList.contains("cond-op") && (u.op = i.value, N()), i.classList.contains("cond-value") && (u.value = i.value), A());
  }), q.addEventListener("input", (r) => {
    const i = r.target;
    if (!i.classList.contains("cond-value")) return;
    const c = i.closest(".condition");
    if (!c) return;
    const u = w.find((C) => C.id === Number(c.dataset.id));
    if (!u) return;
    u.value = i.value;
    const m = u.op === "gt" || u.op === "lt", v = !B(u);
    c.classList.toggle("waiting", v);
    let y = c.querySelector(".cond-hint");
    v ? (y || (y = document.createElement("div"), y.className = "cond-hint", c.appendChild(y)), y.textContent = (m && u.value.trim() !== "" ? "нужно число" : "введите значение") + ", условие пока не применяется") : y && y.remove(), A();
  });
  const ge = (r) => {
    if (!e.isConnected) {
      re.delete(ge);
      return;
    }
    if (!r.length) {
      if (!M) return;
      M = void 0, V();
      return;
    }
    const i = r[0], c = g.find((u) => u.layer === i);
    if (c) {
      _(c.index);
      return;
    }
    M = We(i), V();
  };
  re.add(ge), a.addEventListener("pointerdown", () => J(e, a)), setTimeout(() => J(e, a), 500), N(), L();
}
const nt = ':host,.app{--bg: rgb(var(--v-theme-surface, 30 30 30));--fg: rgb(var(--v-theme-on-surface, 235 240 245));--muted: color-mix(in srgb, var(--fg) 55%, transparent);--line: color-mix(in srgb, var(--fg) 18%, transparent);--soft: color-mix(in srgb, var(--fg) 7%, transparent);--accent: #f2c94c;--accent-fg: #16191e}*{box-sizing:border-box}.app{display:flex;flex-direction:column;height:100%;min-height:0;gap:7px;padding:9px;background:var(--bg);font:13px/1.45 Ubuntu,system-ui,sans-serif;color:var(--fg)}.query{display:flex;gap:6px}input[type=search],input[type=text],select{min-width:0;padding:6px 8px;border:1px solid var(--line);border-radius:7px;background:var(--soft);color:inherit;font:inherit}.query input[type=search]{flex:1;padding:8px 10px}input[type=search]:focus,select:focus{outline:2px solid var(--accent);outline-offset:-1px}button{padding:6px 10px;border:1px solid var(--line);border-radius:7px;background:var(--soft);color:inherit;font:inherit;cursor:pointer;white-space:nowrap}button:hover:not(:disabled){border-color:var(--accent)}button:disabled{opacity:.45;cursor:default}button.primary{background:var(--accent);color:var(--accent-fg);border-color:transparent;font-weight:700}.scope{display:flex;align-items:center;gap:6px}.scope-label{color:var(--muted);font-size:12px;white-space:nowrap}.scope input{flex:1;min-width:0}.scope button{padding:5px 9px}.app.scoped .scope input{border-color:var(--accent)}.app.scoped .scope-label{color:var(--accent)}.options{display:flex;flex-wrap:wrap;gap:12px;color:var(--muted)}.options label{display:inline-flex;align-items:center;gap:5px}.block{border:1px solid var(--line);border-radius:8px}.block-head{display:flex;align-items:center;gap:6px;padding:4px 6px}.block-head .fold{flex:1;border:0;background:transparent;text-align:left;font-weight:600;padding:3px 2px}.block-head .fold:before{content:"▾ ";color:var(--muted)}.block-head .fold[aria-expanded=false]:before{content:"▸ "}.block-head input[type=search]{width:120px}.conditions{padding:0 6px 6px;display:flex;flex-direction:column;gap:5px}.condition{display:grid;grid-template-columns:minmax(0,1.3fr) minmax(0,.9fr) minmax(0,1fr) auto;gap:4px}.condition select,.condition input{font-size:12px}.condition.waiting select,.condition.waiting input{border-color:color-mix(in srgb,var(--accent) 60%,var(--line))}.cond-hint{grid-column:1 / -1;color:var(--muted);font-size:11px}.theme-dark{--popup-bg: #232323;--popup-fg: #edf1f6;--popup-head: #2f2f2f}.theme-light{--popup-bg: #ffffff;--popup-fg: #16191e;--popup-head: #ececec}option{background-color:var(--popup-bg, #232323);color:var(--popup-fg, #edf1f6)}optgroup{background-color:var(--popup-head, #2f2f2f);color:var(--popup-fg, #edf1f6);font-weight:700;font-style:normal}.bar{display:flex;align-items:center;gap:6px;flex-wrap:wrap}.bar .spacer{flex:1}.status{color:var(--muted);min-height:17px}.status.error{color:#ff6b6b}.list{flex:1 1 55%;min-height:90px;overflow:auto;border:1px solid var(--line);border-radius:8px}.row{display:block;width:100%;padding:6px 9px;border:0;border-bottom:1px solid var(--line);border-radius:0;background:transparent;text-align:left;cursor:pointer}.row:last-child{border-bottom:0}.row:hover{background:var(--soft)}.row.active{background:color-mix(in srgb,var(--accent) 22%,transparent)}.row .name{font-weight:600;word-break:break-word}.row .meta{display:flex;gap:6px;align-items:baseline;color:var(--muted);font-size:12px}.row .model{color:var(--accent)}.row .match{color:var(--muted);font-family:ui-monospace,Consolas,monospace;font-size:11px;word-break:break-all}.props-block{display:flex;flex-direction:column;flex:1 1 45%;min-height:90px}.props{flex:1;min-height:0;overflow:auto;padding:0 6px 6px}.props-note{padding:3px 5px;color:var(--accent);font-size:11px}.prop-group{margin-bottom:7px}.prop-group-name{padding:3px 5px;background:var(--soft);border-radius:5px;font-size:11px;font-weight:700;letter-spacing:.01em;overflow-wrap:anywhere}.props-table{width:100%;border-collapse:collapse;font-size:12px;table-layout:fixed}.props-table th,.props-table td{text-align:left;vertical-align:top;padding:3px 5px;border-bottom:1px solid var(--line);overflow-wrap:anywhere}.props-table th{width:42%;font-weight:500;color:var(--muted)}.empty{padding:14px;color:var(--muted);text-align:center}.hint{color:var(--muted);font-size:11px}', ot = "0.4.0", ke = "nashepo.info/search_panel";
function X(e) {
  return new Proxy(e, {
    get(t, n) {
      return n === "app" ? e.manager.activeApp : n === "cadview" ? e.manager.activeWindow?.context : Reflect.get(t, n);
    }
  });
}
const rt = {
  /** Открыть панель поиска. */
  open(e) {
    e.manager.revealView(ke);
  },
  /** Смонтировать панель. */
  mount(e) {
    const t = e.el;
    if (!t) return;
    const n = document.createElement("div");
    n.style.height = "100%", t.replaceChildren(n), tt(n, X(e), nt, ot);
  },
  /** Быстрый поиск: спросить значение и сразу подсветить все совпадения. */
  async quick(e) {
    const t = X(e), n = Z(t);
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
    const o = { ...Le(), query: s }, l = e.beginProgress();
    l.indeterminate = !0, l.label = "Поиск по проекту";
    let a;
    try {
      a = await Ee(n, o, (f, p) => {
        l.details = "просмотрено " + f + ", найдено " + p;
      });
    } finally {
      e.endProgress(l);
    }
    if (!a.hits.length) {
      await e.showMessage("Ничего не найдено. Просмотрено слоёв: " + a.scanned + ".", "info");
      return;
    }
    const d = ne(t, a.hits.map((f) => f.layer));
    e.manager.revealView(ke), await e.showMessage(
      d ? "Найдено элементов: " + a.hits.length + ". Они подсвечены в модели." : "Найдено элементов: " + a.hits.length + ", но активного вида чертежа нет.",
      d ? "info" : "warning"
    );
  },
  /** Снять подсветку. */
  clear(e) {
    oe(X(e));
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
      xe([]);
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
    xe(s);
  }
};
export {
  rt as default
};
