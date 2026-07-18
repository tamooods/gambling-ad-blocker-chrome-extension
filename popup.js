const toggle = document.getElementById("toggle");
const countEl = document.getElementById("count");
const reloadBtn = document.getElementById("reload");

chrome.storage.local.get(["gabEnabled", "gabBlockedCount"], (res) => {
  toggle.checked = res.gabEnabled !== false;
  countEl.textContent = res.gabBlockedCount || 0;
});

toggle.addEventListener("change", () => {
  const enabled = toggle.checked;
  chrome.storage.local.set({ gabEnabled: enabled });
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (tabs[0]?.id) {
      chrome.tabs.sendMessage(tabs[0].id, { type: "GAB_TOGGLE", enabled });
    }
  });
});

reloadBtn.addEventListener("click", () => {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (tabs[0]?.id) chrome.tabs.reload(tabs[0].id);
  });
});
