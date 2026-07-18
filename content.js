(function () {
  "use strict";
  const KEYWORDS = [
    "เว็บพนัน",
    "พนันออนไลน์",
    "แทงบอล",
    "แทงบอลออนไลน์",
    "บาคาร่า",
    "บาคาร่าออนไลน์",
    "สล็อตออนไลน์",
    "สล็อตแตกง่าย",
    "คาสิโนออนไลน์",
    "คาสิโนสด",
    "ฝากถอนไม่มีขั้นต่ำ",
    "สมัครรับเครดิตฟรี",
    "เครดิตฟรี",
    "แจกเครดิตฟรี",
    "หวยออนไลน์",
    "หวยหุ้น",
    "ปั่นสล็อต",
    "เกมยิงปลา",
    "เว็บตรงไม่ผ่านเอเย่นต์",
    "เว็บสายตรง",
    "แตกหนัก",
    "แตกง่าย",
    "รวยทางลัด",
    "ทุนน้อยก็รวยได้",
    "สมัครเล่นฟรี",
    "โบนัส100%",
    "ufabet",
    "ufagoal",
    "ufa",
    "sbobet",
    "pgslot",
    "pg slot",
    "joker123",
    "joker slot",
    "sagame",
    "dg casino",
    "ambbet",
    "betflix",
    "slotxo",
    "gclub",
    "royal online",
    "หวยยี่กี",
    "เว็บพนันบอล",
    "online casino",
    "sports betting",
    "slot game",
    "free credit bonus",
    "bet now",
    "register to win",
    "lotto",
    "pgjoker",
    "mammoth",
    "crypto88",
    "texas24",
    "teenoi69",
    "macau69",
    "789bet",
    "789lady",
    "bng55",
    "nato",
    "baccarat",
    "bacara",
    "sexygame",
  ];

  const KEYWORD_REGEX = new RegExp(
    KEYWORDS.map((k) => k.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|"),
    "i",
  );

  let enabled = true;
  let blockedCount = 0;

  function textMatches(str) {
    return !!str && KEYWORD_REGEX.test(str);
  }

  function findAdContainer(el) {
    let node = el;
    let depth = 0;
    let candidate = el;
    while (node && depth < 4) {
      if (node.tagName === "A" || node.tagName === "IFRAME") {
        candidate = node;
      }
      const parent = node.parentElement;
      if (!parent) break;
      node = parent;
      depth++;
    }
    return candidate;
  }

  function hideElement(el) {
    if (!el || el.dataset.gabHidden === "1") return;
    el.dataset.gabHidden = "1";
    el.classList.add("gab-hidden");
    blockedCount++;
    reportCount();
  }

  function scanImages(root) {
    const imgs = root.querySelectorAll("img:not([data-gab-checked])");
    imgs.forEach((img) => {
      img.setAttribute("data-gab-checked", "1");
      const src = img.currentSrc || img.src || img.dataset.lazySrc || "";
      const alt = img.alt || "";
      const title = img.title || "";
      if (textMatches(alt) || textMatches(title) || textMatches(src)) {
        hideElement(findAdContainer(img));
      }
    });
  }

  function scanLinks(root) {
    const links = root.querySelectorAll("a:not([data-gab-checked])");
    links.forEach((a) => {
      a.setAttribute("data-gab-checked", "1");
      const href = a.getAttribute("href") || "";
      const text = a.textContent || "";
      if (textMatches(href) || textMatches(text)) {
        hideElement(findAdContainer(a));
      }
    });
  }

  function scanIframes(root) {
    const frames = root.querySelectorAll("iframe:not([data-gab-checked])");
    frames.forEach((f) => {
      f.setAttribute("data-gab-checked", "1");
      const src = f.getAttribute("src") || "";
      const title = f.getAttribute("title") || "";
      if (textMatches(src) || textMatches(title)) {
        hideElement(f);
      }
    });
  }

  function scanTextBlocks(root) {
    const candidates = root.querySelectorAll(
      "div:not([data-gab-checked]), span:not([data-gab-checked]), p:not([data-gab-checked])",
    );
    candidates.forEach((el) => {
      el.setAttribute("data-gab-checked", "1");
      if (el.children.length > 2) return;
      const text = el.textContent || "";
      if (text.length > 200) return;
      if (textMatches(text)) {
        hideElement(findAdContainer(el));
      }
    });
  }

  function scanBannerClusters() {
    const seen = new Set();
    const links = document.querySelectorAll(
      'a[target="_blank"][rel*="nofollow"]',
    );

    links.forEach((a) => {
      if (a.dataset.gabMapped === "1") return;

      let node = a.parentElement;
      let depth = 0;
      let container = null;
      while (node && depth < 5) {
        const group = node.querySelectorAll(
          'a[target="_blank"][rel*="nofollow"]',
        );
        if (group.length >= 2) {
          container = node;
          break;
        }
        node = node.parentElement;
        depth++;
      }

      if (!container || seen.has(container)) return;
      seen.add(container);

      const group = container.querySelectorAll(
        'a[target="_blank"][rel*="nofollow"]',
      );
      if (group.length < 2) return;

      const anyConfirmed = Array.from(group).some(
        (c) => c.dataset.gabHidden === "1",
      );
      if (anyConfirmed) {
        group.forEach((c) => {
          c.dataset.gabMapped = "1";
          hideElement(c);
        });
      }
    });
  }

  function runScan(root) {
    if (!enabled) return;
    try {
      scanImages(root);
      scanLinks(root);
      scanIframes(root);
      scanTextBlocks(root);
      scanBannerClusters();
      removeAdWrappers();
    } catch (e) {
      console.debug("[GamblingAdBlocker] scan error", e);
    }
  }

  function removeAdWrappers() {
    const hiddenAs = document.querySelectorAll(
      'a[data-gab-hidden="1"][target="_blank"][rel*="nofollow"]',
    );
    const seen = new Set();
    hiddenAs.forEach((a) => {
      let outerWrapper = null;
      let node = a.parentElement;
      let depth = 0;
      while (node && depth < 8) {
        const cls = (node.className || "").toLowerCase();
        const tag = node.tagName.toLowerCase();
        const id = (node.id || "").toLowerCase();
        const isAd =
          (tag === "aside" && /\bad\b/.test(cls)) ||
          /\b(adt|adrg|adlf|adcen|adrow)\b/.test(cls) ||
          id.includes("ad");
        if (isAd) outerWrapper = node;
        node = node.parentElement;
        depth++;
      }
      if (outerWrapper && !seen.has(outerWrapper)) {
        const bannerLinks = outerWrapper.querySelectorAll(
          'a[target="_blank"][rel*="nofollow"]',
        );
        const visibleBanners = Array.from(bannerLinks).filter(
          (l) => !l.dataset.gabHidden,
        );
        if (visibleBanners.length === 0) {
          seen.add(outerWrapper);
          outerWrapper.remove();
        }
      }
    });
    if (seen.size === 0) {
      const allMapped = document.querySelectorAll('a[data-gab-mapped="1"]');
      const parents = new Set();
      allMapped.forEach((a) => {
        let p = a.parentElement;
        if (p && p.parentElement) parents.add(p.parentElement);
      });
      parents.forEach((parent) => {
        const bannerLinks = parent.querySelectorAll(
          'a[target="_blank"][rel*="nofollow"]',
        );
        if (bannerLinks.length < 2) return;
        const visible = Array.from(bannerLinks).filter(
          (l) => !l.dataset.gabHidden,
        );
        if (visible.length === 0 && !seen.has(parent)) {
          seen.add(parent);
          parent.remove();
        }
      });
    }
  }

  function reportCount() {
    try {
      chrome.runtime?.id &&
        chrome.storage?.local.set({ gabBlockedCount: blockedCount });
    } catch (e) {}
  }

  function init() {
    chrome.storage?.local.get(["gabEnabled"], (res) => {
      enabled = res.gabEnabled !== false;
      if (enabled) runScan(document);
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }

  const observer = new MutationObserver((mutations) => {
    if (!enabled) return;
    for (const m of mutations) {
      m.addedNodes.forEach((node) => {
        if (node.nodeType === 1) {
          runScan(node);
        }
      });
    }
  });
  observer.observe(document.documentElement, {
    childList: true,
    subtree: true,
  });

  chrome.runtime?.onMessage?.addListener((msg) => {
    if (msg?.type === "GAB_TOGGLE") {
      enabled = msg.enabled;
      if (enabled) runScan(document);
    }
  });
})();
