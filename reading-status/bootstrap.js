/* Reading Status – minimal Zotero plugin. Status stored as a line in the Extra field. */
var PLUGIN_ID = "reading-status@pit.local";
var PREFIX = "Reading Status: ";
var LINE_RE = /^Reading Status:\s*(.*)$/im;

var STATUSES = [
  { key: "toread", label: "To Read",          color: "#8e8e93" },
  { key: "pass1",  label: "Reading: Pass 1",  color: "#e67e22" },
  { key: "pass2",  label: "Reading: Pass 2",  color: "#d4ac0d" },
  { key: "pass3",  label: "Reading: Pass 3",  color: "#3498db" },
  { key: "done",   label: "Read / Completed", color: "#27ae60" },
];

var menuID = null;
var columnKey = null;

function getStatus(item) {
  if (!item || !item.isRegularItem()) return null;
  var m = (item.getField("extra") || "").match(LINE_RE);
  if (!m) return null;
  var v = m[1].trim().toLowerCase();
  return STATUSES.find(s => s.label.toLowerCase() === v || s.key === v) || null;
}

async function setStatus(item, status) {
  if (!item.isRegularItem()) return;
  var extra = (item.getField("extra") || "").replace(/^Reading Status:.*(\r?\n)?/im, "").replace(/\s+$/, "");
  if (status) extra = PREFIX + status.label + (extra ? "\n" + extra : "");
  if (extra === (item.getField("extra") || "")) return;
  item.setField("extra", extra);
  await item.saveTx();
}

function selectedItems(context) {
  var items = (context && context.items) || Zotero.getActiveZoteroPane().getSelectedItems();
  return items.filter(i => i && i.isRegularItem());
}

async function applyToSelection(context, status) {
  for (var item of selectedItems(context)) await setStatus(item, status);
}

function statusMenuItem(status) {
  return {
    menuType: "menuitem",
    l10nID: "reading-status-" + (status ? status.key : "clear"),
    onShowing: (_e, ctx) => {
      var items = selectedItems(ctx);
      ctx.setEnabled(items.length > 0);
      if (status && ctx.menuElem) {
        var current = items.length === 1 ? getStatus(items[0]) : null;
        ctx.menuElem.setAttribute("type", "checkbox");
        ctx.menuElem.setAttribute("checked", current && current.key === status.key ? "true" : "false");
      }
    },
    onCommand: (_e, ctx) => applyToSelection(ctx, status),
  };
}

function addFTL(window) {
  window.MozXULElement.insertFTLIfNeeded("reading-status.ftl");
}

async function startup({ rootURI }) {
  await Zotero.initializationPromise;

  columnKey = await Zotero.ItemTreeManager.registerColumn({
    dataKey: "readingStatus",
    label: "Reading Status",
    pluginID: PLUGIN_ID,
    zoteroPersist: ["width", "hidden", "sortDirection"],
    // "<order>|<key>" so sorting follows the reading workflow
    dataProvider: (item) => {
      var s = getStatus(item);
      return s ? (STATUSES.indexOf(s) + 1) + "|" + s.key : "";
    },
    renderCell: (_index, data, column, _isFirst, doc) => {
      var cell = doc.createElement("span");
      cell.className = "cell " + column.className;
      var s = data && STATUSES.find(x => x.key === data.split("|")[1]);
      if (!s) return cell;
      var pill = doc.createElement("span");
      pill.textContent = s.label;
      pill.style.cssText = "display:inline-block;padding:0 6px;border-radius:8px;line-height:1.5;" +
        "font-size:0.9em;color:#fff;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:100%;" +
        "background:" + s.color + ";";
      cell.appendChild(pill);
      return cell;
    },
  });

  menuID = Zotero.MenuManager.registerMenu({
    menuID: "reading-status-context",
    pluginID: PLUGIN_ID,
    target: "main/library/item",
    menus: [{
      menuType: "submenu",
      l10nID: "reading-status-menu",
      menus: [
        ...STATUSES.map(statusMenuItem),
        { menuType: "separator" },
        statusMenuItem(null),
      ],
    }],
  });

  for (var win of Zotero.getMainWindows()) addFTL(win);
}

function onMainWindowLoad({ window }) { addFTL(window); }
function onMainWindowUnload() {}

function shutdown() {
  if (menuID) Zotero.MenuManager.unregisterMenu(menuID);
  if (columnKey) Zotero.ItemTreeManager.unregisterColumn(columnKey);
  menuID = columnKey = null;
}

function install() {}
function uninstall() {}
