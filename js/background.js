// Fills in any missing settings on install or update. Defaults match the setup copied from Better Canvas.
const defaults = {
    "enabled": true,
    "canvas_host": "",
    "dark_mode": true,
    "dark_preset": {
        "background-0": "#161616",
        "background-1": "#1e1e1e",
        "background-2": "#262626",
        "borders": "#3c3c3c",
        "text-0": "#f5f5f5",
        "text-1": "#e2e2e2",
        "text-2": "#ababab",
        "links": "#56Caf0",
        "sidebar": "#1e1e1e",
        "sidebar-text": "#f5f5f5"
    },
    "assignments_due": true,
    "assignment_date_format": true,
    "card_overdues": true,
    "relative_dues": true,
    "num_assignments": 4,
    "better_todo": true,
    "hover_preview": true,
    "hide_completed": false,
    "todo_hr24": false,
    "todo_overdues": false,
    "todo_colors": false,
    "num_todo_items": 4,
    "dashboard_notes": true,
    "dashboard_notes_text": "",
    "condensed_cards": false,
    "hide_feedback": false,
    "remind": true,
    "reminders": [],
    "custom_cards": {},
    "custom_assignments": [],
    "custom_assignments_overflow": ["custom_assignments"],
    "assignment_states": {},
};

chrome.runtime.onInstalled.addListener(async () => {
    const sync = await chrome.storage.sync.get(null);
    const missing = {};
    for (const [key, value] of Object.entries(defaults)) {
        if (sync[key] === undefined) missing[key] = value;
    }
    if (Object.keys(missing).length > 0) await chrome.storage.sync.set(missing);
});

// Course file downloader: queued here so downloads keep going after the popup closes.
// Only the add-on's own downloader page may ask, and only for https files on a Canvas address.
(globalThis.browser || chrome).runtime.onMessage.addListener((msg, sender) => {
    if (msg?.type !== "download") return;
    if (!sender.url || !sender.url.startsWith(chrome.runtime.getURL("html/downloader.html"))) return;
    return queueDownloads(msg);
});

function isCanvasHostname(host, canvasHost) {
    return host.endsWith(".instructure.com") || host === "canvas.sydney.edu.au" || (!!canvasHost && host === canvasHost.split(":")[0]);
}

async function queueDownloads({ courseId, files }) {
    if (!/^\d+$/.test(String(courseId)) || !Array.isArray(files)) return { queued: 0, failed: [], done: [] };
    const { canvas_host } = await chrome.storage.sync.get("canvas_host");
    const key = "done_" + courseId;
    const done = new Set((await chrome.storage.local.get(key))[key] || []);
    let queued = 0;
    const failed = [];
    const ok = [];
    for (const f of files) {
        try {
            const url = new URL(f.url);
            if (url.protocol !== "https:" || !isCanvasHostname(url.hostname, canvas_host)) throw new Error("Not a Canvas file link");
            if (typeof f.filename !== "string" || f.filename.split("/").some(part => part === ".." || part === "")) throw new Error("Bad file name");
            await chrome.downloads.download({ url: f.url, filename: f.filename, conflictAction: "uniquify", saveAs: false });
            done.add(f.id);
            ok.push(f.id);
            queued++;
        } catch (e) {
            console.warn("Download failed", f.filename, e);
            failed.push(f.filename);
        }
    }
    await chrome.storage.local.set({ [key]: [...done] });
    return { queued, failed, done: ok };
}

// Canvas on a uni's own address (e.g. canvas.unsw.edu.au) can't be listed in the manifest,
// so once you save it in the popup and allow access, the Canvas scripts are registered for it here.
const CUSTOM_ID = "custom-canvas";

async function syncCanvasScripts() {
    const { canvas_host } = await chrome.storage.sync.get("canvas_host");
    const existing = await chrome.scripting.getRegisteredContentScripts({ ids: [CUSTOM_ID] });
    if (existing.length) await chrome.scripting.unregisterContentScripts({ ids: [CUSTOM_ID] });
    if (!canvas_host || (canvas_host.endsWith(".instructure.com") || canvas_host === "canvas.sydney.edu.au")) return; // covered by the manifest
    const match = `https://${canvas_host}/*`;
    if (!(await chrome.permissions.contains({ origins: [match] }))) return;
    await chrome.scripting.registerContentScripts([{
        id: CUSTOM_ID,
        matches: [match],
        js: ["js/reminders.js", "js/content.js"],
        css: ["css/content.css"],
        runAt: "document_start",
        persistAcrossSessions: false,
    }]);
}

syncCanvasScripts().catch(e => console.warn("Canvas scripts not registered", e));
chrome.runtime.onStartup.addListener(() => {}); // wakes this script at browser start so the line above runs
chrome.permissions.onAdded.addListener(() => syncCanvasScripts());
chrome.permissions.onRemoved.addListener(() => syncCanvasScripts());
chrome.storage.onChanged.addListener((changes, area) => {
    if (area === "sync" && changes.canvas_host) syncCanvasScripts();
});
