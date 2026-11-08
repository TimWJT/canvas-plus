# Store listing: More Settings for Canvas

Copy these into the fields on addons.mozilla.org when you submit.

## Name
More Settings for Canvas

## Summary (max 250 characters)
Dark mode, upcoming assignments on course cards, a better to-do list, due-soon reminders and bulk download of course files for Canvas LMS. Based on Better Canvas.

## Description
(AMO joins plain lines into one paragraph, so the list uses Markdown "- " bullets with blank lines around it.)

The Canvas settings you wish it had. A trimmed-down, faster version of Better Canvas, with a course file downloader added.

- **Dark mode** for all of Canvas
- **Assignments on course cards**: upcoming and past-due work, with relative due dates
- **Better to-do list**: hide completed items, cross things off, add your own to-dos
- **Due-soon reminders** that pop up on other websites
- **Dashboard notes**
- **Download course files**: tick files from a course's Modules and download them all at once, sorted into folders by unit and module
- **One switch** to turn it all off without uninstalling

Works straight away on any `*.instructure.com` Canvas and on canvas.sydney.edu.au. For another address, type it into the popup once.

Based on [Better Canvas](https://github.com/UseBetterCanvas/bettercanvas) by ksucpea (AGPL-3.0). Source: https://github.com/TimWJT/more-settings-for-canvas

No data collected. Only talks to your own Canvas site. Not affiliated with Instructure or Better Canvas.

## Categories
Appearance, Download Management

## Tags
canvas, lms, university, dark mode, assignments, todo

## License
GNU Affero General Public License v3.0 only (required: it's a fork of Better Canvas).

## Support website
https://github.com/TimWJT/more-settings-for-canvas

## Privacy policy
Leave "This add-on has a Privacy Policy" unticked. It collects nothing.

## Notes for the reviewer
- No build step and no minified code. The files you upload are the source. Fork of Better Canvas 5.12.0 (AGPL-3.0); some innerHTML warnings come from that original code and only insert Canvas's own data or fixed strings.
- Canvas features only run on `*.instructure.com`, canvas.sydney.edu.au, and one extra address the user types in the popup. That address is requested at runtime through the optional `https://*/*` host permission and registered with `scripting`.
- `https://*/*` content script: only the small `js/reminders.js`, which shows a due-soon reminder from data already in storage. It makes no requests.
- `downloads`: saves course files the user ticks into `Downloads/Canvas/<unit>/<module>/`.
- No network requests except to the user's Canvas site. No remote code, no analytics.
