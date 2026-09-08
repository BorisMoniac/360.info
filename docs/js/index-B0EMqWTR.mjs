const ee = () => ({
  query: "",
  caseSensitive: !1,
  includeHidden: !1
}), W = [
  { op: "contains", label: "содержит", needsValue: !0 },
  { op: "notContains", label: "не содержит", needsValue: !0 },
  { op: "equals", label: "равно", needsValue: !0 },
  { op: "notEquals", label: "не равно", needsValue: !0 },
  { op: "gt", label: "больше", needsValue: !0 },
  { op: "lt", label: "меньше", needsValue: !0 },
  { op: "exists", label: "заполнено", needsValue: !1 },
  { op: "missing", label: "пусто", needsValue: !1 }
], _ = "", fe = ["Имя", "Модель", "Путь"];
function ge(e, t) {
  return t === "Имя" ? e.name : t === "Модель" ? e.model : t === "Путь" ? e.path : e.props[t];
}
function G(e) {
  const t = [e.name, e.model, e.path];
  for (const r in e.props) t.push(e.props[r]);
  return t;
}
function B(e, t) {
  const r = e !== void 0 && e !== "";
  switch (t.op) {
    case "exists":
      return r;
    case "missing":
      return !r;
  }
  if (!r) return !1;
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
      const c = parseFloat(e.replace(",", ".")), a = parseFloat(t.value.replace(",", "."));
      return !Number.isFinite(c) || !Number.isFinite(a) ? !1 : t.op === "gt" ? c > a : c < a;
    }
    default:
      return !1;
  }
}
function he(e, t) {
  return t.key !== _ ? B(ge(e, t.key), t) : t.op === "missing" ? G(e).every((r) => !B(r, { ...t, op: "exists" })) : G(e).some((r) => B(r, t));
}
function be(e, t) {
  const r = t.filter((s) => s.op === "exists" || s.op === "missing" || s.value.trim() !== "" || s.key !== _);
  return r.length ? e.filter((s) => r.every((o) => he(s, o))) : e;
}
function ve(e) {
  const t = /* @__PURE__ */ new Set();
  for (const s of e) for (const o in s.props) t.add(o);
  const r = [...t].sort((s, o) => s.localeCompare(o, "ru"));
  return [...fe, ...r];
}
const me = 8, ye = 800, xe = 400;
function J(e) {
  if (!e) return;
  const t = e.model;
  if (!(!t || typeof t != "object" || !("attachments" in t)))
    return t.project ?? t;
}
function te(e) {
  return J(e.app) ?? J(e.manager.activeApp);
}
function we(e, t) {
  const r = [{ title: "Проект", drawing: e }];
  return e.attachments.forEach((s) => {
    if (!t && s.hidden) return;
    const o = s.model;
    o && r.push({ title: s.name ?? "Вложение", drawing: o });
  }), r;
}
function ke(e) {
  if (e == null) return;
  const t = typeof e;
  if (t === "string") return e;
  if (t === "number" || t === "boolean") return String(e);
}
function ne(e) {
  const t = {};
  let r = 0;
  const s = (o, c, a) => {
    if (a > me || r > ye) return;
    r++;
    const f = ke(o);
    if (f !== void 0) {
      c && (t[c] = f);
      return;
    }
    if (Array.isArray(o)) {
      for (let l = 0; l < o.length; l++) s(o[l], c + "[" + l + "]", a + 1);
      return;
    }
    if (!o || typeof o != "object") return;
    const b = o;
    if (b.$value !== void 0) {
      s(b.$value, c, a + 1);
      return;
    }
    for (const l in b)
      l.startsWith("$") || s(b[l], c ? c + "." + l : l, a + 1);
  };
  try {
    s(e.typedProperties(), "", 0);
  } catch {
  }
  return t;
}
function Le(e, t, r) {
  const s = ne(e);
  for (const o in s) {
    const c = s[o], a = r ? c : c.toLowerCase(), f = r ? o : o.toLowerCase();
    if (a.includes(t) || f.includes(t)) return o + ": " + c;
  }
}
function qe(e, t, r) {
  const s = e.name ?? "";
  if ((r ? s : s.toLowerCase()).includes(t)) return "имя: " + s;
  const o = e.$path ?? "";
  if ((r ? o : o.toLowerCase()).includes(t)) return "путь: " + o;
  let c = "";
  try {
    c = e.typed?.name ?? "";
  } catch {
    c = "";
  }
  return c && (r ? c : c.toLowerCase()).includes(t) ? "тип: " + c : Le(e, t, r);
}
async function oe(e, t, r) {
  const s = Date.now(), o = t.query.trim(), c = t.caseSensitive ? o : o.toLowerCase(), a = [];
  let f = 0;
  if (!c) return { hits: a, scanned: 0, models: 0, elapsed: 0 };
  const b = we(e, t.includeHidden);
  for (const l of b) {
    const E = [];
    l.drawing.layers.forEach((w) => {
      E.push(w);
    });
    for (const w of E) {
      f++, f % xe === 0 && (r?.(f, a.length, l.title), await X());
      const C = qe(w, c, t.caseSensitive);
      C && a.push({
        index: a.length,
        layer: w,
        name: w.name ?? "без имени",
        model: l.title,
        path: w.$path ?? "",
        match: C,
        props: {}
      });
    }
  }
  for (let l = 0; l < a.length; l++)
    a[l].props = ne(a[l].layer), l % 200 === 0 && (r?.(f, a.length, "чтение свойств"), await X());
  return r?.(f, a.length, ""), { hits: a, scanned: f, models: b.length, elapsed: Date.now() - s };
}
function X() {
  return new Promise((e) => setTimeout(e, 0));
}
function re(e) {
  const t = e.cadview?.layer?.drawing;
  if (t) return t;
  const s = e.manager.activeWindow?.context?.layer;
  if (s?.drawing) return s.drawing;
  for (const o of e.manager.windows) {
    const a = o.context?.layer;
    if (a?.drawing) return a.drawing;
  }
}
function Se(e) {
  return re(e) !== void 0;
}
function N(e, t, r) {
  const s = re(e);
  return s ? (s.selectLayers(t, r), !0) : !1;
}
function se(e) {
  return N(e, [], !1);
}
const ie = "nashepo.info.search.v2";
function m(e) {
  return e.replace(/[&<>"]/g, (t) => t === "&" ? "&amp;" : t === "<" ? "&lt;" : t === ">" ? "&gt;" : "&quot;");
}
function Ee() {
  const e = ee();
  try {
    const t = localStorage.getItem(ie);
    if (!t) return e;
    const r = JSON.parse(t);
    return {
      query: typeof r.query == "string" ? r.query : e.query,
      caseSensitive: r.caseSensitive === !0,
      includeHidden: r.includeHidden === !0
    };
  } catch {
    return e;
  }
}
function D(e) {
  try {
    localStorage.setItem(ie, JSON.stringify(e));
  } catch {
  }
}
function Q(e, t) {
  const s = getComputedStyle(t).backgroundColor.match(/[\d.]+/g);
  if (!s || s.length < 3) return;
  const [o, c, a] = s.map(Number), f = o * 0.299 + c * 0.587 + a * 0.114 > 128;
  e.style.colorScheme = f ? "light" : "dark";
}
function Ce(e, t, r, s) {
  const o = e.attachShadow ? e.shadowRoot || e.attachShadow({ mode: "open" }) : e, c = Ee();
  o.innerHTML = "<style>" + r + '</style><main class="app" id="app"><div class="query"><input id="query" type="search" placeholder="Значение, имя, GUID, что угодно" value="' + m(c.query) + '"><button class="primary" id="find">Найти</button></div><div class="options"><label><input id="case" type="checkbox"> учитывать регистр</label><label><input id="hidden" type="checkbox"> искать в скрытых</label></div><section class="block"><div class="block-head"><button class="fold" id="fold-conditions" aria-expanded="false">Условия отбора <span id="conditions-count"></span></button><button id="add-condition" title="Добавить условие">＋</button></div><div class="conditions" id="conditions" hidden></div></section><div class="bar"><button id="all">Подсветить все</button><button id="prev" title="Предыдущий элемент">←</button><button id="next" title="Следующий элемент">→</button><span class="spacer"></span><button id="reset">Снять</button></div><div class="status" id="status">Введите значение и нажмите «Найти».</div><div class="list" id="list"><div class="empty">Пока ничего не найдено</div></div><section class="block props-block"><div class="block-head"><button class="fold" id="fold-props" aria-expanded="true">Свойства элемента</button><input id="prop-filter" type="search" placeholder="фильтр свойств"></div><div class="props" id="props"><div class="empty">Выберите элемент в списке</div></div></section><div class="hint">Щелчок по строке подсвечивает элемент и переводит к нему камеру. Версия ' + m(s) + "</div></main>";
  const a = o.querySelector("#app"), f = o.querySelector("#query"), b = o.querySelector("#case"), l = o.querySelector("#hidden"), E = o.querySelector("#find"), w = o.querySelector("#all"), C = o.querySelector("#prev"), z = o.querySelector("#next"), ae = o.querySelector("#reset"), F = o.querySelector("#status"), O = o.querySelector("#list"), k = o.querySelector("#conditions"), ce = o.querySelector("#conditions-count"), le = o.querySelector("#add-condition"), T = o.querySelector("#fold-conditions"), Y = o.querySelector("#fold-props"), V = o.querySelector("#props"), $ = o.querySelector("#prop-filter");
  b.checked = c.caseSensitive, l.checked = c.includeHidden, Q(e, a);
  let x = [], u = [], y = [], de = 1, L = -1, q = !1;
  function v(n, i = !1) {
    F.textContent = n, F.classList.toggle("error", i);
  }
  function M() {
    return { query: f.value, caseSensitive: b.checked, includeHidden: l.checked };
  }
  function I() {
    const n = u.length > 0;
    w.disabled = !n || q, C.disabled = !n || q, z.disabled = !n || q, E.disabled = q;
  }
  function S() {
    const n = ve(x);
    if (ce.textContent = y.length ? "· " + y.length : "", !y.length) {
      k.innerHTML = '<div class="empty">Условий нет. Кнопка ＋ добавит условие по свойству.</div>';
      return;
    }
    k.innerHTML = y.map((i) => {
      const d = ['<option value="">любое свойство</option>'].concat(n.map(
        (g) => '<option value="' + m(g) + '"' + (g === i.key ? " selected" : "") + ">" + m(g) + "</option>"
      )).join(""), p = W.map(
        (g) => '<option value="' + g.op + '"' + (g.op === i.op ? " selected" : "") + ">" + g.label + "</option>"
      ).join(""), h = W.find((g) => g.op === i.op)?.needsValue ?? !0;
      return '<div class="condition" data-id="' + i.id + '"><select class="cond-key">' + d + '</select><select class="cond-op">' + p + '</select><input class="cond-value" type="search" placeholder="значение" value="' + m(i.value) + '"' + (h ? "" : " disabled") + '><button class="cond-remove" title="Удалить условие">×</button></div>';
    }).join("");
  }
  function ue() {
    if (!u.length) {
      O.innerHTML = '<div class="empty">' + (x.length ? "Условия отбора не пропустили ни одного элемента" : "Пока ничего не найдено") + "</div>";
      return;
    }
    O.innerHTML = u.map(
      (n) => '<button class="row" data-index="' + n.index + '"><div class="name">' + m(n.name) + '</div><div class="meta"><span class="model">' + m(n.model) + "</span><span>" + m(n.path) + '</span></div><div class="match">' + m(n.match) + "</div></button>"
    ).join("");
  }
  function A() {
    const n = u.find((h) => h.index === L);
    if (!n) {
      V.innerHTML = '<div class="empty">Выберите элемент в списке</div>';
      return;
    }
    const i = $.value.trim().toLowerCase(), d = [
      ["Имя", n.name],
      ["Модель", n.model],
      ["Путь", n.path]
    ];
    for (const h of Object.keys(n.props).sort((g, pe) => g.localeCompare(pe, "ru")))
      d.push([h, n.props[h]]);
    const p = i ? d.filter(([h, g]) => h.toLowerCase().includes(i) || g.toLowerCase().includes(i)) : d;
    if (!p.length) {
      V.innerHTML = '<div class="empty">Ничего не подходит под фильтр</div>';
      return;
    }
    V.innerHTML = '<table class="props-table"><tbody>' + p.map(
      ([h, g]) => '<tr><th title="' + m(h) + '">' + m(h) + '</th><td title="' + m(g) + '">' + m(g) + "</td></tr>"
    ).join("") + "</tbody></table>";
  }
  function H(n = !1) {
    u = be(x, y), L = -1, ue(), A(), I(), !n && x.length && v(y.length ? "Найдено: " + x.length + ". После условий отбора: " + u.length + "." : "Найдено: " + x.length + ".");
  }
  function P(n) {
    L = n, O.querySelectorAll(".row").forEach((i) => {
      i.classList.toggle("active", Number(i.dataset.index) === n);
    }), O.querySelector(".row.active")?.scrollIntoView({ block: "nearest" }), A();
  }
  function j(n) {
    if (n < 0 || n >= u.length) return;
    const i = u[n];
    if (!N(t, [i.layer], !0)) {
      v("Нет активного вида чертежа. Откройте окно проекта.", !0);
      return;
    }
    P(i.index), v("Элемент " + (n + 1) + " из " + u.length + ". " + i.model);
  }
  function K() {
    return u.findIndex((n) => n.index === L);
  }
  async function U() {
    const n = M();
    if (D(n), !n.query.trim()) {
      v("Введите значение для поиска.", !0);
      return;
    }
    const i = te(t);
    if (!i) {
      v("Нет открытого проекта.", !0);
      return;
    }
    Se(t) || v("Нет активного вида чертежа. Поиск выполнится, но подсветка работать не будет."), q = !0, x = [], u = [], L = -1, I(), v("Поиск…");
    try {
      const d = await oe(i, n, (p, h, g) => {
        v("Просмотрено " + p + ", найдено " + h + (g ? ". " + g : ""));
      });
      if (x = d.hits, S(), H(!0), !x.length)
        v("Ничего не найдено. Просмотрено слоёв: " + d.scanned + " в моделях: " + d.models + ".");
      else {
        const p = y.length ? " После условий отбора: " + u.length + "." : "";
        v("Найдено: " + x.length + "." + p + " Просмотрено слоёв: " + d.scanned + " в моделях: " + d.models + " за " + Math.round(d.elapsed / 100) / 10 + " с.");
      }
    } catch (d) {
      v("Ошибка поиска: " + (d?.message ?? String(d)), !0);
    } finally {
      q = !1, I();
    }
  }
  E.addEventListener("click", () => {
    U();
  }), f.addEventListener("keydown", (n) => {
    n.key === "Enter" && U();
  }), b.addEventListener("change", () => D(M())), l.addEventListener("change", () => D(M())), w.addEventListener("click", () => {
    if (u.length) {
      if (!N(t, u.map((n) => n.layer), !0)) {
        v("Нет активного вида чертежа. Откройте окно проекта.", !0);
        return;
      }
      L = -1, P(-1), v("Подсвечено элементов: " + u.length + ".");
    }
  }), C.addEventListener("click", () => {
    if (!u.length) return;
    const n = K();
    j(n <= 0 ? u.length - 1 : n - 1);
  }), z.addEventListener("click", () => {
    if (!u.length) return;
    const n = K();
    j(n >= u.length - 1 ? 0 : n + 1);
  }), ae.addEventListener("click", () => {
    se(t), L = -1, P(-1), v("Выделение снято.");
  }), O.addEventListener("click", (n) => {
    const i = n.target.closest(".row");
    if (!i) return;
    const d = Number(i.dataset.index);
    j(u.findIndex((p) => p.index === d));
  }), le.addEventListener("click", () => {
    y.push({ id: de++, key: _, op: "contains", value: "" }), k.hidden = !1, T.setAttribute("aria-expanded", "true"), S(), H();
  }), T.addEventListener("click", () => {
    const n = k.hidden;
    k.hidden = !n, T.setAttribute("aria-expanded", String(n)), n && S();
  }), Y.addEventListener("click", () => {
    const n = V.hidden;
    V.hidden = !n, Y.setAttribute("aria-expanded", String(n));
  }), $.addEventListener("input", () => A()), k.addEventListener("click", (n) => {
    const i = n.target.closest(".cond-remove");
    if (!i) return;
    const d = Number(i.closest(".condition").dataset.id);
    y = y.filter((p) => p.id !== d), S(), H();
  }), k.addEventListener("change", (n) => {
    const i = n.target, d = i.closest(".condition");
    if (!d) return;
    const p = y.find((h) => h.id === Number(d.dataset.id));
    p && (i.classList.contains("cond-key") && (p.key = i.value), i.classList.contains("cond-op") && (p.op = i.value, S()), i.classList.contains("cond-value") && (p.value = i.value), H());
  }), k.addEventListener("input", (n) => {
    const i = n.target;
    if (!i.classList.contains("cond-value")) return;
    const d = i.closest(".condition");
    if (!d) return;
    const p = y.find((h) => h.id === Number(d.dataset.id));
    p && (p.value = i.value, H());
  }), a.addEventListener("pointerdown", () => Q(e, a)), S(), I();
}
const Oe = ':host,.app{--bg: rgb(var(--v-theme-surface, 30 30 30));--fg: rgb(var(--v-theme-on-surface, 235 240 245));--muted: color-mix(in srgb, var(--fg) 55%, transparent);--line: color-mix(in srgb, var(--fg) 18%, transparent);--soft: color-mix(in srgb, var(--fg) 7%, transparent);--accent: #f2c94c;--accent-fg: #16191e}*{box-sizing:border-box}.app{display:flex;flex-direction:column;height:100%;min-height:0;gap:7px;padding:9px;background:var(--bg);font:13px/1.45 Ubuntu,system-ui,sans-serif;color:var(--fg)}.query{display:flex;gap:6px}input[type=search],input[type=text],select{min-width:0;padding:6px 8px;border:1px solid var(--line);border-radius:7px;background:var(--soft);color:inherit;font:inherit}.query input[type=search]{flex:1;padding:8px 10px}input[type=search]:focus,select:focus{outline:2px solid var(--accent);outline-offset:-1px}button{padding:6px 10px;border:1px solid var(--line);border-radius:7px;background:var(--soft);color:inherit;font:inherit;cursor:pointer;white-space:nowrap}button:hover:not(:disabled){border-color:var(--accent)}button:disabled{opacity:.45;cursor:default}button.primary{background:var(--accent);color:var(--accent-fg);border-color:transparent;font-weight:700}.options{display:flex;flex-wrap:wrap;gap:12px;color:var(--muted)}.options label{display:inline-flex;align-items:center;gap:5px}.block{border:1px solid var(--line);border-radius:8px}.block-head{display:flex;align-items:center;gap:6px;padding:4px 6px}.block-head .fold{flex:1;border:0;background:transparent;text-align:left;font-weight:600;padding:3px 2px}.block-head .fold:before{content:"▾ ";color:var(--muted)}.block-head .fold[aria-expanded=false]:before{content:"▸ "}.block-head input[type=search]{width:120px}.conditions{padding:0 6px 6px;display:flex;flex-direction:column;gap:5px}.condition{display:grid;grid-template-columns:minmax(0,1.3fr) minmax(0,.9fr) minmax(0,1fr) auto;gap:4px}.condition select,.condition input{font-size:12px}.bar{display:flex;align-items:center;gap:6px;flex-wrap:wrap}.bar .spacer{flex:1}.status{color:var(--muted);min-height:17px}.status.error{color:#ff6b6b}.list{flex:1 1 55%;min-height:90px;overflow:auto;border:1px solid var(--line);border-radius:8px}.row{display:block;width:100%;padding:6px 9px;border:0;border-bottom:1px solid var(--line);border-radius:0;background:transparent;text-align:left;cursor:pointer}.row:last-child{border-bottom:0}.row:hover{background:var(--soft)}.row.active{background:color-mix(in srgb,var(--accent) 22%,transparent)}.row .name{font-weight:600;word-break:break-word}.row .meta{display:flex;gap:6px;align-items:baseline;color:var(--muted);font-size:12px}.row .model{color:var(--accent)}.row .match{color:var(--muted);font-family:ui-monospace,Consolas,monospace;font-size:11px;word-break:break-all}.props-block{display:flex;flex-direction:column;flex:1 1 45%;min-height:90px}.props{flex:1;min-height:0;overflow:auto;padding:0 6px 6px}.props-table{width:100%;border-collapse:collapse;font-size:12px;table-layout:fixed}.props-table th,.props-table td{text-align:left;vertical-align:top;padding:3px 5px;border-bottom:1px solid var(--line);overflow-wrap:anywhere}.props-table th{width:42%;font-weight:500;color:var(--muted)}.empty{padding:14px;color:var(--muted);text-align:center}.hint{color:var(--muted);font-size:11px}', Ve = "0.2.0", Z = "nashepo.info/search_panel";
function R(e) {
  return new Proxy(e, {
    get(t, r) {
      return r === "app" ? e.manager.activeApp : r === "cadview" ? e.manager.activeWindow?.context : Reflect.get(t, r);
    }
  });
}
const He = {
  /** Открыть панель поиска. */
  open(e) {
    e.manager.revealView(Z);
  },
  /** Смонтировать панель. */
  mount(e) {
    const t = e.el;
    if (!t) return;
    const r = document.createElement("div");
    r.style.height = "100%", t.replaceChildren(r), Ce(r, R(e), Oe, Ve);
  },
  /** Быстрый поиск: спросить значение и сразу подсветить все совпадения. */
  async quick(e) {
    const t = R(e), r = te(t);
    if (!r) {
      await e.showMessage("Нет открытого проекта.", "warning");
      return;
    }
    const s = await e.showInputBox({
      title: "Поиск по проекту",
      prompt: "Значение, имя, GUID или часть свойства",
      placeHolder: "Введите искомое значение"
    });
    if (!s || !s.trim()) return;
    const o = { ...ee(), query: s }, c = e.beginProgress();
    c.indeterminate = !0, c.label = "Поиск по проекту";
    let a;
    try {
      a = await oe(r, o, (b, l) => {
        c.details = "просмотрено " + b + ", найдено " + l;
      });
    } finally {
      e.endProgress(c);
    }
    if (!a.hits.length) {
      await e.showMessage("Ничего не найдено. Просмотрено слоёв: " + a.scanned + ".", "info");
      return;
    }
    const f = N(t, a.hits.map((b) => b.layer), !0);
    e.manager.revealView(Z), await e.showMessage(
      f ? "Найдено элементов: " + a.hits.length + ". Они подсвечены в модели." : "Найдено элементов: " + a.hits.length + ", но активного вида чертежа нет.",
      f ? "info" : "warning"
    );
  },
  /** Снять подсветку. */
  clear(e) {
    se(R(e));
  }
};
export {
  He as default
};
