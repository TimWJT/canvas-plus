// Todo reminder pop-ups. Runs on every https site; content.js reuses these helpers on Canvas.

// True for Canvas pages, where content.js handles reminders instead.
function isCanvasHost(host, canvasHost) {
    return host.endsWith(".instructure.com") || (!!canvasHost && host === canvasHost);
}

// var, not const: on a custom Canvas address this file can be injected twice
var canvas_svg = `<svg xmlns="http://www.w3.org/2000/svg" fill="#ff4545" width="25px" height="25px" viewBox="-192 -192 2304.00 2304.00" stroke="white"><g stroke-width="0"><rect x="-192" y="-192" width="2304.00" height="2304.00" rx="0" fill="none" strokewidth="0"/></g><g stroke-linecap="round" stroke-linejoin="round"/><g> <path d="M958.568 277.97C1100.42 277.97 1216.48 171.94 1233.67 34.3881 1146.27 12.8955 1054.57 0 958.568 0 864.001 0 770.867 12.8955 683.464 34.3881 700.658 171.94 816.718 277.97 958.568 277.97ZM35.8207 682.031C173.373 699.225 279.403 815.285 279.403 957.136 279.403 1098.99 173.373 1215.05 35.8207 1232.24 12.8953 1144.84 1.43262 1051.7 1.43262 957.136 1.43262 862.569 12.8953 769.434 35.8207 682.031ZM528.713 957.142C528.713 1005.41 489.581 1044.55 441.31 1044.55 393.038 1044.55 353.907 1005.41 353.907 957.142 353.907 908.871 393.038 869.74 441.31 869.74 489.581 869.74 528.713 908.871 528.713 957.142ZM1642.03 957.136C1642.03 1098.99 1748.06 1215.05 1885.61 1232.24 1908.54 1144.84 1920 1051.7 1920 957.136 1920 862.569 1908.54 769.434 1885.61 682.031 1748.06 699.225 1642.03 815.285 1642.03 957.136ZM1567.51 957.142C1567.51 1005.41 1528.38 1044.55 1480.11 1044.55 1431.84 1044.55 1392.71 1005.41 1392.71 957.142 1392.71 908.871 1431.84 869.74 1480.11 869.74 1528.38 869.74 1567.51 908.871 1567.51 957.142ZM958.568 1640.6C816.718 1640.6 700.658 1746.63 683.464 1884.18 770.867 1907.11 864.001 1918.57 958.568 1918.57 1053.14 1918.57 1146.27 1907.11 1233.67 1884.18 1216.48 1746.63 1100.42 1640.6 958.568 1640.6ZM1045.98 1480.11C1045.98 1528.38 1006.85 1567.51 958.575 1567.51 910.304 1567.51 871.172 1528.38 871.172 1480.11 871.172 1431.84 910.304 1392.71 958.575 1392.71 1006.85 1392.71 1045.98 1431.84 1045.98 1480.11ZM1045.98 439.877C1045.98 488.148 1006.85 527.28 958.575 527.28 910.304 527.28 871.172 488.148 871.172 439.877 871.172 391.606 910.304 352.474 958.575 352.474 1006.85 352.474 1045.98 391.606 1045.98 439.877ZM1441.44 1439.99C1341.15 1540.29 1333.98 1697.91 1418.52 1806.8 1579 1712.23 1713.68 1577.55 1806.82 1418.5 1699.35 1332.53 1541.74 1339.7 1441.44 1439.99ZM1414.21 1325.37C1414.21 1373.64 1375.08 1412.77 1326.8 1412.77 1278.53 1412.77 1239.4 1373.64 1239.4 1325.37 1239.4 1277.1 1278.53 1237.97 1326.8 1237.97 1375.08 1237.97 1414.21 1277.1 1414.21 1325.37ZM478.577 477.145C578.875 376.846 586.039 219.234 501.502 110.339 341.024 204.906 206.338 339.592 113.203 498.637 220.666 584.607 378.278 576.01 478.577 477.145ZM679.155 590.32C679.155 638.591 640.024 677.723 591.752 677.723 543.481 677.723 504.349 638.591 504.349 590.32 504.349 542.048 543.481 502.917 591.752 502.917 640.024 502.917 679.155 542.048 679.155 590.32ZM1440 475.712C1540.3 576.01 1697.91 583.174 1806.8 498.637 1712.24 338.159 1577.55 203.473 1418.51 110.339 1332.54 217.801 1341.13 375.413 1440 475.712ZM1414.21 590.32C1414.21 638.591 1375.08 677.723 1326.8 677.723 1278.53 677.723 1239.4 638.591 1239.4 590.32 1239.4 542.048 1278.53 502.917 1326.8 502.917 1375.08 502.917 1414.21 542.048 1414.21 590.32ZM477.145 1438.58C376.846 1338.28 219.234 1331.12 110.339 1415.65 204.906 1576.13 339.593 1710.82 498.637 1805.39 584.607 1696.49 577.443 1538.88 477.145 1438.58ZM679.155 1325.37C679.155 1373.64 640.024 1412.77 591.752 1412.77 543.481 1412.77 504.349 1373.64 504.349 1325.37 504.349 1277.1 543.481 1237.97 591.752 1237.97 640.024 1237.97 679.155 1277.1 679.155 1325.37Z"/></g></svg>`;

// reminder = { d: due ms, t: title, h: link, c: times hidden (-1 = submitted) }
async function getReminders() {
    return (await chrome.storage.sync.get("reminders")).reminders || [];
}

async function insertReminders(incoming) {
    const saved = await getReminders();
    let changed = false;
    for (const r of incoming) {
        const i = saved.findIndex(s => s.h === r.h);
        if (i === -1) {
            saved.push(r);
            changed = true;
        } else if (r.c === -1 && saved[i].c !== -1) {
            saved[i] = r; // submitted since it was saved
            changed = true;
        }
    }
    if (changed) chrome.storage.sync.set({ "reminders": saved });
}

async function hideReminder(href) {
    const saved = await getReminders();
    const r = saved.find(s => s.h === href);
    if (!r) return;
    r.c++;
    chrome.storage.sync.set({ "reminders": saved });
}

function createReminder(reminder, location) {
    const remaining = getRelativeDate(new Date(reminder.d));
    const wrapper = makeElement("div", location, { "className": "bettercanvas-reminder-wrapper" });
    const container = makeElement("div", wrapper, { "className": "bettercanvas-reminder-container" });
    const svg = makeElement("div", container, { "innerHTML": canvas_svg });
    const content = makeElement("a", container, { "className": "bettercanvas-reminder-content", "href": reminder.h });
    const title = makeElement("h2", content, { "className": "bettercanvas-reminder-title", "textContent": reminder.t });
    const due = makeElement("p", content, { "className": "bettercanvas-reminder-due", "textContent": `Assignment due in ${remaining.time}` });
    const hidebtn = makeElement("button", wrapper, { "className": "bettercanvas-reminder-hide", "textContent": "x" });
    hidebtn.addEventListener("click", () => {
        hideReminder(reminder.h);
        wrapper.remove();
    });
    return container;
}

async function reminderWatch() {
    const existing = document.getElementById("bettercanvas-reminders");
    const { remind, enabled } = await chrome.storage.sync.get(["remind", "enabled"]);
    if (remind !== true || enabled === false) {
        if (existing) existing.style.display = "none";
        return;
    }
    const container = existing || makeElement("div", document.body, { "id": "bettercanvas-reminders" });
    container.style.display = "flex";
    container.textContent = "";
    const firstAlert = 1000 * 60 * 60 * 6 * 50; // as in Better Canvas: anything due in the next ~12 days
    const secondAlert = 1000 * 60 * 60 * 2;     // after hiding once, shows again in the last 2 hours
    const now = Date.now();
    const saved = await getReminders();
    const upcoming = saved.filter(r => r.d >= now);
    upcoming.forEach(r => {
        if ((r.c === 0 && r.d < now + firstAlert) || (r.c === 1 && r.d < now + secondAlert)) createReminder(r, container);
    });
    if (upcoming.length !== saved.length) chrome.storage.sync.set({ "reminders": upcoming });
}

function makeElement(element, location, options) {
    let creation = document.createElement(element);
    Object.keys(options).forEach(key => {
        creation[key] = options[key];
    });
    location.appendChild(creation);
    return creation
}


function getRelativeDate(date, short = false) {
    let now = new Date();
    let timeSince = (now.getTime() - date.getTime()) / 60000;
    let time = "min";
    timeSince = Math.abs(timeSince);
    if (timeSince >= 60) {
        timeSince /= 60;
        time = short ? "h" : "hour";
        if (timeSince >= 24) {
            timeSince /= 24;
            time = short ? "d" : "day";
            if (timeSince >= 7) {
                timeSince /= 7;
                time = short ? "w" : "week";
            }
        }
    }
    timeSince = Math.round(timeSince);
    let relative = timeSince + (short ? "" : " ") + time + (timeSince > 1 && !short ? "s" : "");
    return { time: relative, ms: now.getTime() - date.getTime() };
}

// On other sites, show reminders now and every minute. Canvas pages are handled by content.js.
if (window.top === window && !window.moreSettingsCanvasReminders) {
    window.moreSettingsCanvasReminders = true;
    chrome.storage.sync.get("canvas_host").then(({ canvas_host }) => {
        if (isCanvasHost(location.hostname, canvas_host)) return;
        setTimeout(reminderWatch, 2000);
        setInterval(reminderWatch, 60000);
        chrome.storage.onChanged.addListener((changes, area) => {
            if (area === "sync" && (changes.remind || changes.enabled)) reminderWatch();
        });
    });
}
