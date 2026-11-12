// Settings menu. Every control writes straight to storage.sync; content.js listens and applies it live.
const switches = ["dark_mode", "assignments_due", "remind", "better_todo", "dashboard_notes", "condensed_cards", "hide_feedback"];
const checkboxes = ["assignment_date_format", "card_overdues", "relative_dues", "hover_preview", "hide_completed", "todo_hr24", "todo_overdues", "todo_colors"];
const sliders = ["num_assignments", "num_todo_items"];

chrome.storage.sync.get([...switches, ...checkboxes, ...sliders], sync => {
    switches.forEach(option => {
        const el = document.getElementById(option);
        const on = el.querySelector(".on");
        const off = el.querySelector(".off");
        const slider = el.querySelector(".slider");
        // the slider is a real switch for keyboards and screen readers too
        slider.setAttribute("role", "switch");
        slider.tabIndex = 0;
        slider.setAttribute("aria-label", el.querySelector(".option-name").textContent);
        const show = state => {
            on.checked = state;
            off.checked = !state;
            on.classList.toggle("checked", state);
            off.classList.toggle("checked", !state);
            slider.setAttribute("aria-checked", String(state));
        };
        show(sync[option] === true);
        const flip = () => {
            const state = !on.checked;
            show(state);
            chrome.storage.sync.set({ [option]: state });
        };
        slider.addEventListener("click", flip);
        slider.addEventListener("keydown", e => {
            if (e.key === " " || e.key === "Enter") { e.preventDefault(); flip(); }
        });
    });

    checkboxes.forEach(option => {
        const el = document.getElementById(option);
        el.checked = sync[option] === true;
        el.addEventListener("change", () => chrome.storage.sync.set({ [option]: el.checked }));
    });

    sliders.forEach(option => {
        const el = document.querySelector(`[data-option="${option}"]`);
        const label = document.getElementById(option + "_value");
        el.value = sync[option];
        label.textContent = sync[option];
        el.addEventListener("input", () => {
            label.textContent = el.value;
            chrome.storage.sync.set({ [option]: parseInt(el.value) });
        });
    });
});

// Power button: turns the whole add-on off on Canvas. Saves at once but never reloads a page;
// on a Canvas tab it offers a Reload button instead.
(async () => {
    const $ = id => document.getElementById(id);
    const [{ enabled, canvas_host }, [tab]] = await Promise.all([
        chrome.storage.sync.get(["enabled", "canvas_host"]),
        chrome.tabs.query({ active: true, currentWindow: true }),
    ]);
    let onCanvas = false;
    try {
        const host = new URL(tab.url).hostname;
        onCanvas = (host.endsWith(".instructure.com") || host === "canvas.sydney.edu.au") || (!!canvas_host && host === canvas_host.split(":")[0]);
    } catch { /* about: pages */ }
    const startOn = enabled !== false;
    let on = startOn;
    const show = () => {
        $("power").setAttribute("aria-checked", String(on));
        $("power").title = on ? "Turn the add-on off" : "Turn the add-on on";
        document.body.classList.toggle("off", !on);
        $("rest").inert = !on;
        const changed = on !== startOn && onCanvas;
        $("off-msg").textContent = on
            ? (changed ? "Back on. Reload to use it on this page." : "")
            : "Off. Nothing is changed on Canvas." + (changed ? " Reload to see this page without it." : "");
        $("off-reload").hidden = !changed;
        $("off-bar").hidden = !$("off-msg").textContent;
    };
    show();
    $("power").addEventListener("click", () => {
        on = !on;
        show();
        chrome.storage.sync.set({ enabled: on });
    });
    $("off-reload").addEventListener("click", async () => {
        await chrome.tabs.reload(tab.id);
        window.close();
    });
})();

// Opens the downloader in Firefox's sidebar, which stays open while you click around the page.
document.getElementById("openDownloader").addEventListener("click", () => {
    browser.sidebarAction.open(); // must run straight from the click, before anything async
    window.close();
});

// Canvas address: saving asks Firefox for access to that site, then background.js turns the add-on on there.
const hostInput = document.getElementById("canvas_host");
const hostStatus = document.getElementById("host_status");
chrome.storage.sync.get("canvas_host", ({ canvas_host }) => { hostInput.value = canvas_host || ""; });

function cleanHost(text) {
    return text.trim().toLowerCase().replace(/^[a-z]+:\/\//, "").split(/[/?#]/)[0];
}

document.getElementById("save_host").addEventListener("click", () => {
    const host = cleanHost(hostInput.value);
    if (host && !/^[a-z0-9.-]+\.[a-z]{2,}$/.test(host)) {
        hostStatus.textContent = "That doesn't look like a web address.";
        return;
    }
    hostInput.value = host;
    // both calls start straight from the click: Firefox only shows the permission prompt for a click,
    // and the popup can close when the prompt appears
    chrome.storage.sync.set({ canvas_host: host });
    if (!host || (host.endsWith(".instructure.com") || host === "canvas.sydney.edu.au")) {
        hostStatus.textContent = host ? "Saved. Reload your Canvas tab." : "Cleared.";
        return;
    }
    browser.permissions.request({ origins: [`https://${host}/*`] }).then(ok => {
        hostStatus.textContent = ok ? "Saved. Reload your Canvas tab." : "Firefox access wasn't allowed, so it won't run there yet.";
    });
});
