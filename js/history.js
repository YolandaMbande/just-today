import {
    load,
    key,
    status
} from "./storage.js";
const s = load(),
    today = new Date(),
    todayKey = key(today),
    $ = q => document.querySelector(q);
let cur = new Date(today.getFullYear(), today.getMonth(), 1),
    selected = null;
const mk = (y, m, d) => `${y}-${String(m+1).padStart(2,"0")}-${String(d).padStart(2,"0")}`;

function render() {
    const y = cur.getFullYear(),
        m = cur.getMonth(),
        g = $("#grid");
    g.innerHTML = "";
    $("#month").textContent = new Intl.DateTimeFormat("en-ZA", {
        month: "long",
        year: "numeric"
    }).format(cur).toLowerCase();
    for (let i = 0; i < new Date(y, m, 1).getDay(); i++) g.append(document.createElement("span"));
    for (let n = 1; n <= new Date(y, m + 1, 0).getDate(); n++) {
        const k = mk(y, m, n),
            st = status(s.days[k]),
            b = document.createElement("button");
        b.className = "day" + (st ? ` status-${st}` : "") + (k === todayKey ? " today" : "") + (k === selected ? " selected" : "");
        b.textContent = n;
        b.disabled = k > todayKey;
        b.onclick = () => {
            selected = k;
            render();
            detail(k)
        };
        g.append(b)
    }
    $("#next").disabled = y > today.getFullYear() || (y === today.getFullYear() && m >= today.getMonth())
}

function detail(k) {
    const d = s.days[k],
        [y, m, n] = k.split("-").map(Number),
        label = new Intl.DateTimeFormat("en-ZA", {
            weekday: "long",
            day: "numeric",
            month: "long"
        }).format(new Date(y, m - 1, n)).toLowerCase(),
        box = $("#detail");
    if (!d?.items?.length) {
        box.innerHTML = `<small>${label}</small><h2>nothing recorded.</h2><p>and that's completely fine.</p>`;
        return
    }
    const done = d.items.filter(x => x.completed).length;
    box.innerHTML = `<small>${label}</small><h2>${done} of ${d.items.length} done.</h2><p>${done===d.items.length?"you did what you came to do.":"a day doesn't have to be complete to count."}</p>`;
    const ul = document.createElement("ul");
    d.items.forEach(x => {
        const li = document.createElement("li");
        li.className = x.completed ? "done" : "";
        li.textContent = (x.completed ? "✓ " : "○ ") + x.text;
        ul.append(li)
    });
    box.append(ul)
}
$("#prev").onclick = () => {
    cur = new Date(cur.getFullYear(), cur.getMonth() - 1, 1);
    selected = null;
    render()
};
$("#next").onclick = () => {
    cur = new Date(cur.getFullYear(), cur.getMonth() + 1, 1);
    selected = null;
    render()
};
render();
if (s.days[todayKey]) {
    selected = todayKey;
    render();
    detail(todayKey)
}