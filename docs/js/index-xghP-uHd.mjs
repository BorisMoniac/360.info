const B = () => ({
  query: "",
  scope: "all",
  caseSensitive: !1,
  includeHidden: !1,
  limit: 500
});
function T(e) {
  if (!e) return;
  const t = e.model;
  if (!(!t || typeof t != "object" || !("attachments" in t)))
    return t.project ?? t;
}
function j(e) {
  return T(e.app) ?? T(e.manager.activeApp);
}
function U(e, t) {
  const n = [{ title: "Проект", drawing: e }];
  return e.attachments.forEach((a) => {
    if (!t && a.hidden) return;
    const o = a.model;
    o && n.push({ title: a.name ?? "Вложение", drawing: o });
  }), n;
}
function C(e) {
  if (e == null) return;
  const t = typeof e;
  if (t === "string") return e;
  if (t === "number" || t === "boolean") return String(e);
}
function W(e, t, n) {
  let a;
  try {
    a = e.typedProperties();
  } catch {
    return;
  }
  if (!a || typeof a != "object") return;
  let o = 0;
  const s = (i, u, d) => {
    if (d > 6 || o > 600) return;
    if (o++, Array.isArray(i)) {
      for (let c = 0; c < i.length; c++) {
        const w = s(i[c], u + "[" + c + "]", d + 1);
        if (w) return w;
      }
      return;
    }
    const f = C(i);
    if (f !== void 0)
      return (n ? f : f.toLowerCase()).includes(t) ? (u || "значение") + ": " + f : void 0;
    if (!i || typeof i != "object") return;
    const m = i, b = C(m.$name), h = b ? u + " (" + b + ")" : u;
    if (m.$value !== void 0) {
      const c = s(m.$value, h, d + 1);
      if (c) return c;
    }
    for (const c in m) {
      if (c === "$value" || c === "$type" || c === "$values") continue;
      const w = m[c], L = u ? u + "." + c : c, S = C(w);
      if (S !== void 0) {
        o++;
        const l = n ? S : S.toLowerCase(), y = n ? c : c.toLowerCase();
        if (l.includes(t) || y.includes(t)) return L + ": " + S;
        continue;
      }
      const x = s(w, L, d + 1);
      if (x) return x;
    }
  };
  return s(a, "", 0);
}
function G(e, t, n) {
  const a = e.name ?? "";
  if ((n.caseSensitive ? a : a.toLowerCase()).includes(t)) return "имя: " + a;
  const o = e.$path ?? "";
  if ((n.caseSensitive ? o : o.toLowerCase()).includes(t)) return "путь: " + o;
  let s = "";
  try {
    s = e.typed?.name ?? "";
  } catch {
    s = "";
  }
  if (s && (n.caseSensitive ? s : s.toLowerCase()).includes(t))
    return "тип: " + s;
  if (n.scope !== "name")
    return W(e, t, n.caseSensitive);
}
async function V(e, t, n) {
  const a = Date.now(), o = t.query.trim(), s = t.caseSensitive ? o : o.toLowerCase(), i = [];
  let u = 0, d = !1;
  if (!s) return { hits: i, scanned: 0, models: 0, truncated: !1, elapsed: 0 };
  const f = U(e, t.includeHidden);
  for (const m of f) {
    if (d) break;
    const b = [];
    m.drawing.layers.forEach((h) => {
      b.push(h);
    });
    for (const h of b) {
      u++, u % 400 === 0 && (n?.(u, i.length, m.title), await J());
      const c = G(h, s, t);
      if (c && (i.push({
        index: i.length,
        layer: h,
        name: h.name ?? "без имени",
        model: m.title,
        path: h.$path ?? "",
        match: c
      }), i.length >= t.limit)) {
        d = !0;
        break;
      }
    }
  }
  return n?.(u, i.length, ""), { hits: i, scanned: u, models: f.length, truncated: d, elapsed: Date.now() - a };
}
function J() {
  return new Promise((e) => setTimeout(e, 0));
}
function _(e) {
  const t = e.cadview?.layer?.drawing;
  if (t) return t;
  const a = e.manager.activeWindow?.context?.layer;
  if (a?.drawing) return a.drawing;
  for (const o of e.manager.windows) {
    const i = o.context?.layer;
    if (i?.drawing) return i.drawing;
  }
}
function F(e) {
  return _(e) !== void 0;
}
function M(e, t, n) {
  const a = _(e);
  return a ? (a.selectLayers(t, n), !0) : !1;
}
function $(e) {
  return M(e, [], !1);
}
const R = "nashepo.info.search.v1";
function E(e) {
  return e.replace(/[&<>"]/g, (t) => t === "&" ? "&amp;" : t === "<" ? "&lt;" : t === ">" ? "&gt;" : "&quot;");
}
function K() {
  const e = B();
  try {
    const t = localStorage.getItem(R);
    if (!t) return e;
    const n = JSON.parse(t);
    return {
      query: typeof n.query == "string" ? n.query : e.query,
      scope: n.scope === "name" ? "name" : "all",
      caseSensitive: n.caseSensitive === !0,
      includeHidden: n.includeHidden === !0,
      limit: Number.isFinite(n.limit) ? Math.min(Math.max(Number(n.limit), 10), 5e3) : e.limit
    };
  } catch {
    return e;
  }
}
function Q(e) {
  try {
    localStorage.setItem(R, JSON.stringify(e));
  } catch {
  }
}
function Z(e, t, n, a) {
  const o = e.attachShadow ? e.shadowRoot || e.attachShadow({ mode: "open" }) : e, s = K();
  o.innerHTML = "<style>" + n + '</style><main class="app"><div class="query"><input id="query" type="search" placeholder="Значение, имя, GUID, что угодно" value="' + E(s.query) + '"><button class="primary" id="find">Найти</button></div><div class="options"><label>Искать<select id="scope"><option value="all">везде</option><option value="name">только имена</option></select></label><label><input id="case" type="checkbox"> регистр</label><label><input id="hidden" type="checkbox"> скрытые</label><label>предел<input id="limit" type="number" min="10" max="5000" step="10" value="' + s.limit + '"></label></div><div class="bar"><button id="all">Подсветить все</button><button id="prev" title="Предыдущий элемент">←</button><button id="next" title="Следующий элемент">→</button><span class="spacer"></span><button id="reset">Снять</button></div><div class="status" id="status">Введите значение и нажмите «Найти».</div><div class="list" id="list"><div class="empty">Пока ничего не найдено</div></div><div class="hint">Щелчок по строке подсвечивает элемент и переводит к нему камеру. Версия ' + E(a) + "</div></main>";
  const i = o.querySelector("#query"), u = o.querySelector("#scope"), d = o.querySelector("#case"), f = o.querySelector("#hidden"), m = o.querySelector("#limit"), b = o.querySelector("#find"), h = o.querySelector("#all"), c = o.querySelector("#prev"), w = o.querySelector("#next"), L = o.querySelector("#reset"), S = o.querySelector("#status"), x = o.querySelector("#list");
  u.value = s.scope, d.checked = s.caseSensitive, f.checked = s.includeHidden;
  let l = [], y = -1, q = !1;
  function p(r, v = !1) {
    S.textContent = r, S.classList.toggle("error", v);
  }
  function Y() {
    const r = Math.min(Math.max(parseInt(m.value, 10) || 500, 10), 5e3);
    return m.value = String(r), {
      query: i.value,
      scope: u.value === "name" ? "name" : "all",
      caseSensitive: d.checked,
      includeHidden: f.checked,
      limit: r
    };
  }
  function H() {
    const r = l.length > 0;
    h.disabled = !r || q, c.disabled = !r || q, w.disabled = !r || q, b.disabled = q;
  }
  function z() {
    if (!l.length) {
      x.innerHTML = '<div class="empty">Пока ничего не найдено</div>';
      return;
    }
    x.innerHTML = l.map(
      (r) => '<button class="row" data-index="' + r.index + '"><div class="name">' + E(r.name) + '</div><div class="meta"><span class="model">' + E(r.model) + "</span><span>" + E(r.path) + '</span></div><div class="match">' + E(r.match) + "</div></button>"
    ).join("");
  }
  function I(r) {
    y = r, x.querySelectorAll(".row").forEach((k) => {
      k.classList.toggle("active", Number(k.dataset.index) === r);
    }), x.querySelector(".row.active")?.scrollIntoView({ block: "nearest" });
  }
  function O(r) {
    if (r < 0 || r >= l.length) return;
    const v = l[r];
    if (!M(t, [v.layer], !0)) {
      p("Нет активного вида чертежа. Откройте окно проекта.", !0);
      return;
    }
    I(r), p("Элемент " + (r + 1) + " из " + l.length + ". " + v.model);
  }
  async function N() {
    const r = Y();
    if (Q(r), !r.query.trim()) {
      p("Введите значение для поиска.", !0);
      return;
    }
    const v = j(t);
    if (!v) {
      p("Нет открытого проекта.", !0);
      return;
    }
    F(t) || p("Нет активного вида чертежа. Поиск выполнится, но подсветка работать не будет."), q = !0, l = [], y = -1, H(), p("Поиск…");
    try {
      const g = await V(v, r, (k, X, P) => {
        p("Просмотрено " + k + ", найдено " + X + (P ? ". Модель: " + P : ""));
      });
      if (l = g.hits, z(), !l.length)
        p("Ничего не найдено. Просмотрено слоёв: " + g.scanned + " в моделях: " + g.models + ".");
      else {
        const k = g.truncated ? " Показаны первые " + r.limit + ", увеличьте предел." : "";
        p("Найдено: " + l.length + ". Просмотрено слоёв: " + g.scanned + " в моделях: " + g.models + " за " + Math.round(g.elapsed / 100) / 10 + " с." + k);
      }
    } catch (g) {
      p("Ошибка поиска: " + (g?.message ?? String(g)), !0);
    } finally {
      q = !1, H();
    }
  }
  b.addEventListener("click", () => {
    N();
  }), i.addEventListener("keydown", (r) => {
    r.key === "Enter" && N();
  }), h.addEventListener("click", () => {
    if (l.length) {
      if (!M(t, l.map((r) => r.layer), !0)) {
        p("Нет активного вида чертежа. Откройте окно проекта.", !0);
        return;
      }
      y = -1, I(-1), p("Подсвечено элементов: " + l.length + ".");
    }
  }), c.addEventListener("click", () => {
    l.length && O(y <= 0 ? l.length - 1 : y - 1);
  }), w.addEventListener("click", () => {
    l.length && O(y >= l.length - 1 ? 0 : y + 1);
  }), L.addEventListener("click", () => {
    $(t), y = -1, I(-1), p("Выделение снято.");
  }), x.addEventListener("click", (r) => {
    const v = r.target.closest(".row");
    v && O(Number(v.dataset.index));
  }), H();
}
const ee = ":host,.app{--bg: rgb(var(--v-theme-surface, 30 30 30));--fg: rgb(var(--v-theme-on-surface, 235 240 245));--muted: color-mix(in srgb, var(--fg) 55%, transparent);--line: color-mix(in srgb, var(--fg) 18%, transparent);--soft: color-mix(in srgb, var(--fg) 7%, transparent);--accent: #f2c94c;--accent-fg: #16191e}*{box-sizing:border-box}.app{display:flex;flex-direction:column;height:100%;min-height:0;gap:8px;padding:10px;font:13px/1.45 Ubuntu,system-ui,sans-serif;color:var(--fg)}.query{display:flex;gap:6px}.query input[type=search]{flex:1;min-width:0;padding:8px 10px;border:1px solid var(--line);border-radius:8px;background:var(--soft);color:inherit;font:inherit}.query input[type=search]:focus{outline:2px solid var(--accent);outline-offset:-1px}button{padding:7px 11px;border:1px solid var(--line);border-radius:8px;background:var(--soft);color:inherit;font:inherit;cursor:pointer;white-space:nowrap}button:hover:not(:disabled){border-color:var(--accent)}button:disabled{opacity:.45;cursor:default}button.primary{background:var(--accent);color:var(--accent-fg);border-color:transparent;font-weight:700}.options{display:flex;flex-wrap:wrap;align-items:center;gap:10px;color:var(--muted)}.options label{display:inline-flex;align-items:center;gap:5px}.options select,.options input[type=number]{padding:4px 6px;border:1px solid var(--line);border-radius:6px;background:var(--soft);color:inherit;font:inherit}.options input[type=number]{width:72px}.bar{display:flex;align-items:center;gap:6px;flex-wrap:wrap}.bar .spacer{flex:1}.status{color:var(--muted);min-height:18px}.status.error{color:#ff6b6b}.list{flex:1;min-height:0;overflow:auto;border:1px solid var(--line);border-radius:8px}.row{display:block;width:100%;padding:7px 9px;border:0;border-bottom:1px solid var(--line);border-radius:0;background:transparent;text-align:left;cursor:pointer}.row:last-child{border-bottom:0}.row:hover{background:var(--soft)}.row.active{background:color-mix(in srgb,var(--accent) 22%,transparent)}.row .name{font-weight:600;word-break:break-word}.row .meta{display:flex;gap:6px;align-items:baseline;color:var(--muted);font-size:12px}.row .model{color:var(--accent)}.row .match{color:var(--muted);font-family:ui-monospace,Consolas,monospace;font-size:11px;word-break:break-all}.empty{padding:18px;color:var(--muted);text-align:center}.hint{color:var(--muted);font-size:12px}", te = "0.1.0", A = "nashepo.info/search_panel";
function D(e) {
  return new Proxy(e, {
    get(t, n) {
      return n === "app" ? e.manager.activeApp : n === "cadview" ? e.manager.activeWindow?.context : Reflect.get(t, n);
    }
  });
}
const ne = {
  /** Открыть панель поиска. */
  open(e) {
    e.manager.revealView(A);
  },
  /** Смонтировать панель. */
  mount(e) {
    const t = e.el;
    if (!t) return;
    const n = document.createElement("div");
    n.style.height = "100%", t.replaceChildren(n), Z(n, D(e), ee, te);
  },
  /** Быстрый поиск: спросить значение и сразу подсветить все совпадения. */
  async quick(e) {
    const t = D(e), n = j(t);
    if (!n) {
      await e.showMessage("Нет открытого проекта.", "warning");
      return;
    }
    const a = await e.showInputBox({
      title: "Поиск по проекту",
      prompt: "Значение, имя, GUID или часть свойства",
      placeHolder: "Введите искомое значение"
    });
    if (!a || !a.trim()) return;
    const o = { ...B(), query: a }, s = e.beginProgress();
    s.indeterminate = !0, s.label = "Поиск по проекту";
    let i;
    try {
      i = await V(n, o, (d, f) => {
        s.details = "просмотрено " + d + ", найдено " + f;
      });
    } finally {
      e.endProgress(s);
    }
    if (!i.hits.length) {
      await e.showMessage("Ничего не найдено. Просмотрено слоёв: " + i.scanned + ".", "info");
      return;
    }
    const u = M(t, i.hits.map((d) => d.layer), !0);
    e.manager.revealView(A), await e.showMessage(
      u ? "Найдено элементов: " + i.hits.length + ". Они подсвечены в модели." : "Найдено элементов: " + i.hits.length + ", но активного вида чертежа нет.",
      u ? "info" : "warning"
    );
  },
  /** Снять подсветку. */
  clear(e) {
    $(D(e));
  }
};
export {
  ne as default
};
