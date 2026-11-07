// Settings menu. Every control writes straight to storage.sync; content.js listens and applies it live.
const switches = ["enabled", "dark_mode", "assignments_due", "remind", "better_todo", "dashboard_notes", "condensed_cards", "hide_feedback"];
const checkboxes = ["assignment_date_format", "card_overdues", "relative_dues", "hover_preview", "hide_completed", "todo_hr24", "todo_overdues", "todo_colors"];
const sliders = ["num_assignments", "num_todo_items"];

chrome.storage.sync.get([...switches, ...checkboxes, ...sliders], sync => {
    switches.forEach(option => {
        const el = document.getElementById(option);
        const on = el.querySelector("#on");
        const off = el.querySelector("#off");
        const show = state => {
            on.checked = state;
            off.checked = !state;
            on.classList.toggle("checked", state);
            off.classList.toggle("checked", !state);
            if (option === "enabled") {
                document.getElementById("enabled_label").textContent = state ? "On" : "Off";
                document.querySelector(".options").classList.toggle("all-off", !state);
            }
        };
        // the master switch counts as on unless it has been turned off
        show(option === "enabled" ? sync[option] !== false : sync[option] === true);
        el.querySelector(".slider").addEventListener("mouseup", () => {
            const state = !on.checked;
            show(state);
            chrome.storage.sync.set({ [option]: state });
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

// Opens the downloader in Firefox's sidebar, which stays open while you click around the page.
document.getElementById("openDownloader").addEventListener("click", () => {
    browser.sidebarAction.open(); // must run straight from the click, before anything async
    window.close();
});

// Canvas address: saving asks Firefox for access to that site, then background.js turns Canvas Plus on there.
const hostInput = document.getElementById("canvas_host");
const hostStatus = document.getElementById("host_status");
chrome.storage.sync.get("canvas_host", ({ canvas_host }) => { hostInput.value = canvas_host || ""; });

function cleanHost(text) {
    return text.trim().toLowerCase().replace(/^[a-z]+:\/\//, "").split(/[/?#]/)[0];
}

document.getElementById("save_host").addEventListener("click", () => {
    const host = cleanHost(hostInput.value);
    if (host && !/^[a-z0-9.-]+\.[a-z]{2,}(:\d+)?$/.test(host)) {
        hostStatus.textContent = "That doesn't look like a web address.";
        return;
    }
    hostInput.value = host;
    // both calls start straight from the click: Firefox only shows the permission prompt for a click,
    // and the popup can close when the prompt appears
    chrome.storage.sync.set({ canvas_host: host });
    if (!host || host.endsWith(".instructure.com")) {
        hostStatus.textContent = host ? "Saved. Reload your Canvas tab." : "Cleared.";
        return;
    }
    browser.permissions.request({ origins: [`https://${host}/*`] }).then(ok => {
        hostStatus.textContent = ok ? "Saved. Reload your Canvas tab." : "Firefox access wasn't allowed, so it won't run there yet.";
    });
});
