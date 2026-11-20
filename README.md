# Coy — Discover Tab & Privacy-First Matching Engine
### SDE Intern Assignment Submission

---

## 🌟 1. Overview & Architecture

This repository contains a standalone, production-ready implementation of the **"Discover"** tab for **Coy** (`https://app.getcoy.com`). It extends Coy's core secret-crush value proposition with a fluid, mobile-first swipe discovery mechanism (similar to Bumble and Tinder) while rigorously upholding Coy's defining brand promise: **Zero Social Exposure & Complete Mutual Privacy**.

The project is architected as a cohesive full-stack web application built to mirror the craftsmanship, aesthetic language, and privacy rigor of a live consumer mobile application.

### 🛠️ Tech Stack
* **Frontend Framework:** Next.js 14 (App Router), React 18, TypeScript
* **Styling & Design System:** Tailwind CSS with custom Neo-Brutalist design tokens (Hot Pink `#FF2B6D`, Coy Vanilla `#FAF8F5`, chunky borders `border-2 border-[#1C1C1E]`, drop-shadows `shadow-coy`)
* **Motion & Touch Engine:** Framer Motion (gesture physics, card drag constraints, velocity fling exit animations, stamp badge opacity interpolation) + Canvas Confetti
* **Backend:** Next.js Serverless Route Handlers (`/api/feed`, `/api/swipe`, `/api/matches`, `/api/block`)
* **Data Persistence:** Dual-layer persistence architecture (server-side JSON storage at `/tmp/coy_db.json` with synchronous client-side reconciliation) designed specifically to handle serverless cold boots and ephemeral environments
* **Test Suite:** Automated Jest testing suite (`ts-jest`) validating matching algorithms and zero-leak privacy rules

---

## 📋 2. Assignment Requirements Matrix

Every single functional requirement outlined in the prompt has been implemented and strictly adhered to:

| Category | Requirement | Implementation Details |
| :--- | :--- | :--- |
| **Navigation** | Simple tab bar with placeholder "Home" and active "Discover" tab | Implemented in `TabBar.tsx` and `HomePlaceholder.tsx`. The "Home" tab is intentionally kept blank/placeholder while full functionality lives in "Discover" and "Matches". |
| **Profile Data** | Seed at least 30 mock profiles (name, age, photo, bio, college/city, interests) | **32 realistic, verified profiles** of 21–22 year old Indian college students (IIT Delhi, BITS Pilani, NID, etc.) with custom bios, major, interests, and Spotify anthems. |
| **Pre-Seeded Matches** | Some seeded profiles should have already liked the logged-in user | **13 profiles** pre-seeded with `hasLikedUser: true` to trigger matches during evaluation; **19 profiles** pre-seeded with `hasLikedUser: false`. |
| **Swipe Gestures** | Show one card at a time. Drag gestures on mobile, buttons on desktop | Touch drag gestures on mobile viewports (`< md`), with dedicated circular Like (❤️) and Pass (❌) buttons rendered exclusively on desktop (`md+`). |
| **Animation Quality** | Smooth card animations and clear feedback on each swipe | Directional physical flyout animations (`animate(x, ±600)`), GPU-accelerated rotation (`[-22°, 22°]`), and green **LIKE** / red **PASS** stamps that dynamically fade in based on drag distance. |
| **Irreversibility** | A profile that has been swiped on must never appear again | Permanent deduplication tracked across disk and client storage. Once swiped, the ID is filtered from all subsequent queries. |
| **Empty State** | Clear empty state when there are no profiles left | Cheerful "All caught up!" screen displaying the total number of mutual matches and a CTA to view them. |
| **Mutual Matching** | Match happens only when both users have liked each other | Handled atomically on the backend. Right swiping on a mutual like instantly triggers the celebratory **"It's a match!"** modal. |
| **Matches View** | A view listing all mutual connections | Dedicated "Matches" tab with live badge counter displaying all confirmed mutual matches with photos, details, and timestamps. |
| **Core Privacy** | Never reveal who has liked the user unless it is mutual | **Zero-knowledge backend**: The server strictly strips `hasLikedUser` from all API payloads before sending data to the browser. |
| **APIs & Persistence**| `GET /feed`, `POST /swipe`, `GET /matches`, persistent across reloads | Fully implemented and verified across page reloads and server cold boots. |

---

## 🚀 3. What Extra Has Been Done (Going Beyond the Prompt)

To demonstrate the product polish expected in a high-performing SDE role, the following enhancements were built into the codebase:

1. **"Ghost Shield" Anti-Stalker & Silent Block Engine:**
   * A dedicated privacy setting accessible via the **Shield (🛡️)** button in the header.
   * Allows silently blocking an unwanted acquaintance or ex-partner.
   * **Anti-Retaliation Architecture:** The blocked user is immediately scrubbed from the feed and matches. If the blocked user attempts to swipe on you, the server returns a neutral `200 OK` with `{ isMatch: false }`—preventing the stalker from learning they were blocked.
2. **Expandable Profile Details Sheet:**
   * Tapping the info (`ℹ️`) button smoothly expands the card to show university major, Spotify Anthem player badge, and prompt cards (*"A life goal of mine..."*).
3. **Coy Signature Match Celebration:**
   * Replicates Coy's exact visual metaphor: two overlapping avatar rings with an animated heart intersection badge, celebratory confetti explosions, and dual navigation options.
4. **Resilient Serverless Dual-Persistence:**
   * Implemented client-side storage reconciliation on top of the backend JSON storage, ensuring zero match counter flickers or card resets when deployed on serverless platforms (e.g., Vercel).
5. **Secret Evaluator Reset Protocol (`?reset=true`):**
   * Built a zero-friction URL reset parameter allowing evaluators to reset the demo cleanly without violating the core assignment rule that users cannot reset in the UI.

---

## 🧠 4. Engineering Philosophy & Role Alignment

The assignment prompt specifically notes:
> *"This assignment mirrors the work you would do in the role: understanding a live consumer product, thinking about its privacy edge cases, and writing clean, tested backend logic."*

Here is how each dimension was engineered:

### A. Understanding a Live Consumer Product (Coy)
* **Psychological Context:** In stranger-dating apps (Tinder), rejection has low stakes. In Coy, users express interest in people they already know or see on campus. Rejection carries high social risk.
* **The Promise:** Coy is essentially an escrow service for mutual attraction. Unless attraction is confirmed from both sides simultaneously, curiosity must never become a revelation.
* **Respecting Constraints:** Swipes are irreversible. The UI enforces permanent deduplication so users cannot game the algorithm or repeatedly guess who liked them.

### B. Thinking About Privacy Edge Cases

| Threat / Edge Case | Vulnerability in Standard Apps | How Coy-Discover Solves It |
| :--- | :--- | :--- |
| **Client-Side Data Leakage** | Many apps send `{ id: 'p1', hasLikedUser: true }` and check the boolean in React. Any user opening Chrome DevTools $\to$ Network tab can inspect who liked them without swiping. | **Zero-Knowledge Sanitization (`lib/db.ts`):** The server explicitly strips `hasLikedUser` and `isBlocked` before serializing JSON. The client DOM and network tab contain zero information about prior likes. |
| **Directory Scraping / Enumeration** | Malicious users repeatedly query `/api/feed` to scrape the entire campus student directory. | Non-swiped profile queue with permanent deduplication, pagination boundaries, and stateful storage tracking. |
| **Retaliation from Blocked Contacts** | Returning a `403 Forbidden: You are blocked` confirms to a stalker that they were blocked, often triggering confrontation. | **Silent Neutral Dropping:** The API returns `200 OK` and `{ isMatch: false }`. The caller receives no error code, preventing real-world social retaliation. |
| **One-Sided Reveal** | Passing or liking someone without mutual confirmation leaks curiosity. | A match requires $\text{action} == \text{'like'}\ \land\ \text{target.hasLikedUser} == \text{true}$. Passing returns `{ isMatch: false }` and permanently buries the card. |

### C. Writing Clean, Tested Backend Logic
* **Clean Architecture:** Strict separation between Controller/Route Handlers (`app/api/*`) and the Data Access Layer (`lib/db.ts`).
* **Automated Test Coverage:** Backed by 8 automated Jest test cases validating all matching rules and privacy constraints.

Run the test suite anytime:
```bash
npm test
```
**Test Results:**
```
PASS __tests__/matching.test.ts
  Coy Discover & Privacy Matching Logic
    √ Privacy Rule: getFeedProfiles() never exposes hasLikedUser to the client (13 ms)
    √ Matching Rule: Swipe LIKE on a profile that liked user creates a mutual match (5 ms)
    √ Privacy Rule: Swipe LIKE on a profile that did NOT like user does NOT create a match (3 ms)
    √ Passing Rule: Swipe PASS on a profile never creates a match even if they liked user (3 ms)
    √ Deduplication Rule: A swiped profile never appears in getFeedProfiles() again (4 ms)
    √ Ghost Shield Rule 1: A blocked user is completely filtered out from getFeedProfiles() (2 ms)
    √ Ghost Shield Rule 2: If a blocked user swipes LIKE, it succeeds neutrally with NO match and NO error (3 ms)
    √ Ghost Shield Rule 3: Silently blocking a user instantly purges any active match with zero alerts (5 ms)

Test Suites: 1 passed, 1 total
Tests:       8 passed, 8 total
```

---

## 💡 5. Part A: Two Core Feature Suggestions for Coy

Based on direct exploration of Coy's production app (`https://app.getcoy.com`):

### Feature 1: "Silent Slot Reclaim (Dormant Activity Timeout)"
* **The Problem:** Users receive only 3 crush slots by default. If an added contact does not have the app, ignores the SMS, or has switched numbers, that slot is permanently burned. Users experience anxiety over "wasting" slots and frequently churn when their 3 slots sit dormant.
* **The Solution:** If an added crush has not signed up or taken action within 14 days, the user automatically gets their slot back. Coy preserves a cryptographic hash of the phone number in a dormant backend registry: if that person eventually signs up months later and adds the user, a retro-match is still triggered.
* **Why Required:** Solves slot anxiety, drives long-term retention, and keeps active viral loops spinning without spamming SMS notifications.

### Feature 2: "Campus / Workplace Zero-Knowledge Verification Radar"
* **The Problem:** Cold anonymous SMS messages (*"Someone has a crush on you on Coy"*) often get ignored as phishing or spam due to total lack of context.
* **The Solution:** Allow users to optionally verify their university or company email (`.edu`, `@*.ac.in`). When someone receives an anonymous crush alert, it displays: *"Someone from [IIT Delhi / BITS Pilani] has a crush on you"*, with zero individual identity revealed.
* **Why Required:** Shared context dramatically increases SMS click-through and signup conversion, leverages existing college network effects, and remains 100% compliant with Coy's zero-exposure privacy promise.

---

## 🏃 6. How to Run the Project Locally

### Prerequisites
* Node.js (v18 or higher recommended)
* npm or pnpm

### 1. Clone & Install
```bash
git clone https://github.com/Lavavarshney/Coy-assignment.git
cd Coy-assignment
npm install
```

### 2. Run the Development Server
```bash
npm run dev
```
Open **[http://localhost:3000](http://localhost:3000)** in your browser.

> **Tip:** For the optimal mobile-first experience, open Chrome DevTools (`F12`) and toggle the device toolbar to an iPhone or Android viewport.

### 3. Run the Automated Tests
```bash
npm test
```

---

## 🔄 7. Evaluator Reset Protocol (How to Reset the Demo)

Per the assignment specifications:
> *"A profile that has been swiped on must never appear again."*
> *"A clear empty state when there are no profiles left."*

To honor this rule, **no reset button exists in the user-facing UI**; once cards are swiped, the empty state permanently persists across reloads.

**To reset the entire demo back to card #1 (Aarav Sharma) with 0 swipes and 0 matches for evaluation:**

Simply visit:
👉 **`http://localhost:3000/?reset=true`** (Local)
👉 **`https://coyassignment.vercel.app/?reset=true`** (Live Deployment)

The app will automatically clear client and server storage and redirect cleanly to a pristine demo state.

---

## 🌐 Live Deployment
* **Live Demo:** [https://coyassignment.vercel.app](https://coyassignment.vercel.app)
* **GitHub Repository:** [https://github.com/Lavavarshney/Coy-assignment](https://github.com/Lavavarshney/Coy-assignment)
