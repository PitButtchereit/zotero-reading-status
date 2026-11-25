# Zotero Reading Status

Minimal Zotero plugin (Zotero 8–10) to track where you are with a paper:

**To Read → Reading: Pass 1 → Pass 2 → Pass 3 → Completed**

- Set status via right-click → **Reading Status** (works on multiple items)
- Color-coded, sortable **Reading Status** column in the item list
- Stored as a `Reading Status: <key>` line (e.g. `pass1`) in the item's **Extra** field → syncs, survives uninstall, searchable

## Install

1. Download `reading-status.xpi` from the [latest release](../../releases/latest).
   (Firefox users: right-click → *Save Link As…*, otherwise Firefox tries to install it.)
2. In Zotero: **Tools → Plugins** → gear icon → **Install Plugin From File…** → pick the `.xpi`.
3. Enable the column: right-click any column header in the item list → tick **Reading Status**.

Updates install automatically through Zotero's plugin updater.

## Build locally

```bash
cd reading-status && zip -r ../reading-status.xpi manifest.json bootstrap.js locale
```

## License

MIT

## Changing labels / colors

Edit both:
- `reading-status/bootstrap.js` → `STATUSES` (`label`, `color`) – column text
- `reading-status/locale/en-US/reading-status.ftl` – right-click menu text

Don't change the `key` values: they're what's stored in your items.
