/* Gambling Ad Blocker - content.js
 * สแกนหน้าเว็บหา element ที่เข้าข่ายเป็นโฆษณาเว็บพนันออนไลน์ แล้วซ่อนทิ้ง
 */

(function () {
  "use strict";

  // ---------- คำ/รูปแบบที่ใช้ตรวจจับ ----------
  // ครอบคลุมทั้งไทย/อังกฤษ คำที่เว็บพนันออนไลน์แถวเอเชียตะวันออกเฉียงใต้ใช้บ่อย
  const KEYWORDS = [
    // ไทย - คำทั่วไปเกี่ยวกับพนัน
    "เว็บพนัน", "พนันออนไลน์", "แทงบอล", "แทงบอลออนไลน์", "บาคาร่า",
    "บาคาร่าออนไลน์", "สล็อตออนไลน์", "สล็อตแตกง่าย", "คาสิโนออนไลน์",
    "คาสิโนสด", "ฝากถอนไม่มีขั้นต่ำ", "สมัครรับเครดิตฟรี", "เครดิตฟรี",
    "แจกเครดิตฟรี", "หวยออนไลน์", "หวยหุ้น", "ปั่นสล็อต", "เกมยิงปลา",
    "เว็บตรงไม่ผ่านเอเย่นต์", "เว็บสายตรง", "แตกหนัก", "แตกง่าย",
    "รวยทางลัด", "ทุนน้อยก็รวยได้", "สมัครเล่นฟรี", "โบนัส100%",
    // แบรนด์/คำที่มักพบใน banner พนัน (ตัวอย่างทั่วไป ไม่เจาะจงเว็บใดเว็บหนึ่ง)
    "ufabet", "ufagoal", "ufa", "sbobet", "pgslot", "pg slot", "joker123",
    "joker slot", "sagame", "dg casino", "ambbet", "betflix", "slotxo",
    "gclub", "royal online", "หวยยี่กี", "เว็บพนันบอล",
    // อังกฤษทั่วไป
    "online casino", "sports betting", "slot game", "free credit bonus",
    "bet now", "register to win"
  ];

  // ทำ regex จาก keyword (case-insensitive, ตัด whitespace)
  const KEYWORD_REGEX = new RegExp(
    KEYWORDS.map((k) => k.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|"),
    "i"
  );

  let enabled = true;
  let blockedCount = 0;

  // ---------- helper ----------
  function textMatches(str) {
    return !!str && KEYWORD_REGEX.test(str);
  }

  // เก็บ element ที่ "น่าจะเป็นกล่องโฆษณา" ทั้งกล่อง ไม่ใช่แค่ตัวรูป/ลิงก์เฉย ๆ
  // เดินขึ้นไปหา parent ที่ดูเป็น container ของ ad (เช่น <a><img></a> หรือ div ครอบ banner)
  function findAdContainer(el) {
    let node = el;
    let depth = 0;
    let candidate = el;
    while (node && depth < 4) {
      if (node.tagName === "A" || node.tagName === "IFRAME") {
        candidate = node;
      }
      // ถ้า parent มีขนาด/รูปแบบเหมือนกล่อง banner เดี่ยว ๆ (ไม่ใช่ body/main wrapper ใหญ่)
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
      const src = img.currentSrc || img.src || "";
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

  // สแกนข้อความล้วน ๆ ในบล็อกเล็ก ๆ (เช่น หัวข้อโฆษณา, ป้ายข้อความ) แบบระวังไม่ให้ไปโดนเนื้อหาข่าว/บทความจริง
  function scanTextBlocks(root) {
    const candidates = root.querySelectorAll(
      "div:not([data-gab-checked]), span:not([data-gab-checked]), p:not([data-gab-checked])"
    );
    candidates.forEach((el) => {
      el.setAttribute("data-gab-checked", "1");
      // เอาเฉพาะ element ที่ "ใบไม้" จริง ๆ (ไม่มีลูกเป็น element ใหญ่ ๆ) เพื่อลด false positive
      if (el.children.length > 2) return;
      const text = el.textContent || "";
      if (text.length > 200) return; // ยาวเกินไป น่าจะเป็นเนื้อหาบทความ ไม่ใช่ ad copy
      if (textMatches(text)) {
        hideElement(findAdContainer(el));
      }
    });
  }

  // ---------- Cluster detection ----------
  // เว็บพนันมักฝัง banner หลายอันเรียงกันเป็นชุดในโครงสร้างเดียวกัน เช่น
  // <a rel="nofollow noopener" target="_blank"><img></a> ซ้ำ ๆ กันในกล่องเดียว
  // ซึ่งบางอันอาจไม่มีคำ keyword โผล่เลย (ใช้ short link + ชื่อไฟล์รูปทั่วไป)
  // ถ้าในกลุ่มเดียวกันมีอันใดอันหนึ่งที่ยืนยันแล้วว่าเป็นพนัน (จาก keyword)
  // ให้ถือว่าทั้งกลุ่มเป็นชุดโฆษณาเดียวกัน แล้วซ่อนทั้งหมด
  function isBannerShapeLink(a) {
    if (!a || a.tagName !== "A") return false;
    const rel = (a.getAttribute("rel") || "").toLowerCase();
    const target = a.getAttribute("target");
    const imgs = a.querySelectorAll("img");
    if (imgs.length !== 1) return false;
    const text = (a.textContent || "").trim();
    if (text.length > 0) return false; // ลิงก์ต้องมีแค่รูป ไม่มีข้อความอื่น
    if (!rel.includes("nofollow")) return false;
    if (target !== "_blank") return false;
    return true;
  }

  function scanBannerClusters() {
    // เช็คทั้งเอกสารเสมอ เพราะสมาชิกในกลุ่มอาจถูกเพิ่มเข้ามาคนละรอบกัน
    const links = document.querySelectorAll('a[target="_blank"][rel]');
    const parents = new Set();
    links.forEach((a) => {
      if (isBannerShapeLink(a) && a.parentElement) {
        parents.add(a.parentElement);
      }
    });
    parents.forEach((parent) => {
      const siblings = Array.from(parent.children).filter(
        (c) => c.tagName === "A" && isBannerShapeLink(c)
      );
      if (siblings.length < 2) return; // ต้องมีอย่างน้อย 2 อันถึงจะถือว่าเป็น "ชุด"
      const anyConfirmed = siblings.some((c) => c.dataset.gabHidden === "1");
      if (anyConfirmed) {
        siblings.forEach((c) => hideElement(c));
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
    } catch (e) {
      // เงียบไว้ ไม่ให้ error ไปกวนหน้าเว็บอื่น
      console.debug("[GamblingAdBlocker] scan error", e);
    }
  }

  function reportCount() {
    try {
      chrome.runtime?.id &&
        chrome.storage?.local.set({ gabBlockedCount: blockedCount });
    } catch (e) {
      /* extension context อาจถูก invalidate ระหว่างรีโหลด ก็แค่ข้าม */
    }
  }

  // ---------- เริ่มทำงาน ----------
  function init() {
    chrome.storage?.local.get(["gabEnabled"], (res) => {
      enabled = res.gabEnabled !== false; // default = true
      if (enabled) runScan(document);
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }

  // เฝ้าดู DOM ที่โหลดเพิ่มทีหลัง (โฆษณาแบบ lazy-load / infinite scroll)
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
  observer.observe(document.documentElement, { childList: true, subtree: true });

  // ฟังคำสั่งเปิด/ปิดจาก popup
  chrome.runtime?.onMessage?.addListener((msg) => {
    if (msg?.type === "GAB_TOGGLE") {
      enabled = msg.enabled;
      if (enabled) runScan(document);
    }
  });
})();
