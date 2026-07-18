# Gambling Ad Blocker

Automatically hides and removes gambling ads on any webpage. A Chrome Extension (Manifest V3) targeting Thai + English gambling keywords.

> **ภาษาไทย** — [คลิกที่นี่](README.th.md)

## Install

1. Open `chrome://extensions`
2. Enable **Developer mode** (top right)
3. Click **Load unpacked** → select this folder
4. Refresh any page

## How it works

- Scans every page for gambling keywords (Thai + English) in `alt`, `title`, `src`, `href`, `textContent`
- On match → hides the element and its container, removes the wrapper from the DOM
- Banner clusters in the same container: if any ad matches a keyword, all get hidden
- `MutationObserver` catches lazy-loaded and infinite-scroll ads
- Toggle on/off via extension popup
- Runs inside iframes too (`all_frames: true`)

## Files

| File | Purpose |
|------|---------|
| `manifest.json` | Extension config (Manifest V3) |
| `content.js` | Scanner + hider logic |
| `hide.css` | `.gab-hidden` class |
| `popup.html` / `popup.js` | Popup UI with toggle + counter |
| `icon.png` | Extension icon |

## Development

No build step, no bundler, no npm — edit a file, then reload the extension at `chrome://extensions`.
