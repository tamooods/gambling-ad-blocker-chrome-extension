# Gambling Ad Blocker (บล็อกโฆษณาเว็บพนัน)

ซ่อน/ลบโฆษณาเว็บพนันออนไลน์บนหน้าเว็บโดยอัตโนมัติ — Chrome Extension (Manifest V3)

> **English** — [click here](README.md)

## วิธีติดตั้ง

1. เปิด `chrome://extensions`
2. เปิด **Developer mode** (มุมบนขวา)
3. กด **Load unpacked** → เลือกโฟลเดอร์นี้
4. รีเฟรชหน้าเว็บที่ต้องการใช้

## วิธีการทำงาน

- สแกนทุกหน้าเว็บหา keyword การพนัน (ไทย + อังกฤษ) ใน `alt`, `title`, `src`, `href`, `textContent`
- ถ้าเจอ → ซ่อน element นั้น + container ที่อยู่ พร้อมลบ wrapper ทิ้งจาก DOM
- กลุ่ม banner ที่เรียงกันใน container เดียวกัน — ถ้าตัวใดตัวหนึ่งตรง keyword → ซ่อนทั้งหมด
- ใช้ `MutationObserver` จัดการโฆษณาที่โหลดมาทีหลัง (lazy-load / infinite scroll)
- เปิด/ปิดผ่าน popup extension
- ทำงานใน iframe ด้วย (`all_frames: true`)

## Files

| File | ที่มา |
|------|--------|
| `manifest.json` | ตั้งค่า extension (Manifest V3) |
| `content.js` | ตัวสแกนและซ่อนโฆษณา |
| `hide.css` | คลาส `gab-hidden` |
| `popup.html` / `popup.js` | ป๊อปอัป toggle + ตัวนับ |
| `icon.png` | ไอคอน |

## Development

ไม่ต้อง build, ไม่มี bundler, ไม่มี npm — แค่แก้ไฟล์แล้ว reload extension ที่ `chrome://extensions`
