# Coy — Standalone "Discover" Tab Application

This project is a standalone implementation of a mobile-first, swipe-based **"Discover"** feature for **Coy** (mirrored after Tinder/Bumble card discovery, while rigorously upholding Coy's core privacy promise).

---

## 🚀 Overview & Architecture

### Tech Stack
* **Frontend:** Next.js 14 (App Router), React 18, TypeScript, Tailwind CSS
* **Animations & Gestures:** Framer Motion (drag constraints, physics-based rotation, swipe stamp badges) + Canvas Confetti
* **Design Language:** Neo-brutalist / Coy-inspired aesthetics (Hot pink `#FF2B6D`, thick dark borders `border-2 border-[#1C1C1E]`, chunky shadows `shadow-coy`, rounded pills, overlapping avatar match state)
* **Backend & Persistence:** Next.js API Routes with server-side JSON storage (`data/db.json`), ensuring swipes and matches persist across page reloads.

---

## 🛠️ Requirements & Features Implemented

### 1. Profile Data (32 Seeded Profiles)
- Seeded with **32 realistic, diverse student/young adult profiles** (name, age, high-res portrait photos, location/college, bios, and interest tags).
- Several profiles are pre-seeded with `hasLikedUser: true` to trigger instant mutual matches during demo presentations.
- **Privacy Enforcement:** The backend strips the `hasLikedUser` flag before sending feed data to the client, preventing any client-side reverse-engineering or inspection.

### 2. Swipe Experience
- **Touch / Mobile Gestures:** Drag cards horizontally left or right with dynamic card tilt and smooth spring release.
- **Desktop Buttons:** Circular Pass (❌) and Like (❤️) action buttons with click and hover states.
- **Visual Feedback:** Dynamic "LIKE" (emerald) and "PASS" (red) feedback stamps that fade in based on drag distance.
- **Deduplication:** Profiles swiped once are permanently tracked in `data/db.json` and will never appear in the feed again.
- **Empty State:** When all profiles have been swiped, a cheerful "All caught up!" empty screen shows the total match count and a "Reset Demo" button.

### 3. Mutual Matching & Privacy Guarantee
- A match occurs **only** when the user likes someone who had already liked them back.
- **"It's a Match!" celebration modal:** Features overlapping circular avatars (matching Coy's onboarding graphics), vibrant celebratory confetti bursts, and actionable options to jump to Matches or keep swiping.
- Matches view accessible via bottom navigation bar displaying all confirmed mutual connections with photos, bios, and timestamps.
- **Zero Exposure Guarantee:** Swiping "pass" or receiving a one-sided like reveals zero personal information to either party.

### 4. Backend APIs
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/feed` | Returns profiles not yet swiped by the user (sanitized). |
| `POST` | `/api/swipe` | Records a like or pass action; returns `{ isMatch: boolean, profile?: Profile }`. |
| `GET` | `/api/matches` | Returns all confirmed mutual matches. |
| `POST` | `/api/matches` | Demo reset utility endpoint to wipe swipes and restore fresh 32 profiles. |

---

## 💻 How to Run Locally

### 1. Clone & Install
```bash
git clone <your-repo-url>
cd coy-discover
npm install
```

### 2. Run the Development Server
```bash
npm run dev
```
Open **[http://localhost:3000](http://localhost:3000)** in your browser (preferably in mobile preview mode or on a phone).

---

## 🧪 Demoing & Testing
1. **Swipe Right on Aanya, Meera, Tara, or Diya:** Instant match triggers with confetti and the Coy overlapping circles modal.
2. **Swipe Left (Pass) on any card:** Card leaves the feed and will not re-appear.
3. **Check the Matches tab:** View all accumulated matches with timestamp details.
4. **Reload the page:** Notice your swipe history and matches remain completely intact.
5. **Click Reset (↺ top right):** Instantly restore the entire seed stack for clean re-testing.
