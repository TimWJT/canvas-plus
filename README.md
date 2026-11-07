# Canvas Plus

A trimmed Firefox extension for Canvas LMS. It works straight away on any school whose Canvas is at `*.instructure.com`. If your uni uses its own address (e.g. `canvas.sydney.edu.au`), type it into **Your Canvas address** in the popup once and allow access when Firefox asks.

It's a fork of [Better Canvas](https://github.com/UseBetterCanvas/bettercanvas) by ksucpea, licensed under AGPL-3.0, so this is AGPL-3.0 too (see `LICENSE`). If you publish it, its source has to stay public.

## Features

- **On/off switch** at the top of the popup turns all of Canvas Plus off (Canvas goes back to normal and reminders stop) without uninstalling it
- **Dark mode**, using Better Canvas's default dark colours
- **Card assignments**: upcoming work on each course card, with dd/mm dates, past-due items, relative due dates and a max-items slider
- **Better to-do list**: hover preview, hide completed, 24-hour time, past due, card colours, max items, labels, cross-off, and custom "+ Add" items
- **Dashboard notes**
- **Todo reminders**: a pop-up on other websites when an assignment is due soon
- **Condensed cards** and **Hide recent feedback**
- **Download course files**: opens in the Firefox sidebar (so it stays open while you browse, and follows whichever course tab you switch to). From there, tick files from a course's Modules and download them all at once into `Downloads/Canvas/<unit code>/<module>/`. It ticks files you haven't downloaded yet, can skip videos and VM images or zips (two separate options), greys out the skipped ones, and greys out locked files. (Merged in from my Canvas Bulk Downloader.)

## Changes from Better Canvas 5.12.0

Removed:
- scheduled dark mode and "use device dark mode"
- GPA calculator
- card grades
- gradient cards
- disable colour overlay
- full-width dashboard
- remove sidebar logo
- colour-coded tab icons
- everything under "More options": dark mode editor, card customisation, card colour palettes, themes and the online theme browser, fonts, GPA settings, report issue, and updates

How it differs under the hood:
- The Canvas features only run on Canvas: `*.instructure.com`, plus the one address you save in the popup (registered at runtime in `js/background.js`). Every other site gets only the small reminder script (`js/reminders.js`), not the whole extension.
- It makes no network requests except to Canvas. There are no Google Fonts, no theme server and no uninstall page.
- Course names and colours are fetched once per dashboard visit in one step, instead of needing the popup to be opened.

Bugs fixed:
- reminders could crash and stop saving a submitted assignment
- reminders and expired custom to-dos skipped items when deleting from a list
- 12-hour times showed "0:30am" instead of "12:30am"
- every reload of the dashboard notes added another input listener
- every dark-mode toggle added another iframe observer

## Install

1. Temporary: open `about:debugging#/runtime/this-firefox`, click **Load Temporary Add-on…** and pick `manifest.json`.
2. Permanent: zip the folder's contents (not the folder itself) and upload it to addons.mozilla.org. Choose "On your own" (unlisted) to keep it private, or "On this site" to list it publicly. Mozilla signs it and gives you an `.xpi` to install.

The downloader needs the `downloads` and `scripting` permissions and access to your Canvas site, so it needs Firefox 128 or newer.

Settings are stored in Firefox sync storage under this extension's own ID. They don't carry over from Better Canvas, and that includes your dashboard notes text.
