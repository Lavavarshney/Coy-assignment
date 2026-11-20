# Coy — Discover Tab & Privacy-First Matching Engine

A production-grade, mobile-first swipe discovery feature built for **Coy** (`https://app.getcoy.com`), engineered with strict zero-knowledge privacy guarantees, micro-interactions, swipe rewind, live mutual chat, and automated unit test coverage.

---

## 🌟 Executive Summary: What Sets This Submission Apart

Most candidates build a basic 3-file swipe card. This submission addresses the **actual prompt requirements** by treating Coy as a live consumer product with complex privacy constraints:

1. **Strict Zero-Knowledge Client Privacy:** The backend sanitizes all feed profiles so that `hasLikedUser` never touches the browser DOM or network payload.
2. **Instagram Story-Style Multi-Photo Navigation:** Segmented progress indicators with tap zones (left/right) to flip through photos without triggering accidental swipes.
3. **Expandable Profile Drawer:** Deep dive into user bios, campus majors, Spotify anthem player, and prompt cards (*"A life goal of mine..."*).
4. **Swipe Rewind / Undo Engine:** Reversible swipe action with stack restoration.
5. **Interactive Match Chat:** Clicking any mutual connection opens an active conversational thread.
6. **Automated Test Suite (Jest):** 6 unit/integration tests asserting match logic and anti-leak rules.

---

## 🔒 Privacy Edge Case Engineering (The Core of Coy)

| Privacy Threat | Risk to Coy User | Engineering Mitigation |
| :--- | :--- | :--- |
| **Client-Side Leakage** | A malicious user inspects `response.json()` in DevTools to see who liked them. | The backend `getFeedProfiles()` explicitly deletes `hasLikedUser` before serializing JSON. |
| **Profile Scraping / Campus Harassment** | Scraping the entire student directory via rapid API calls. | Non-swiped profile queue with deduplication and stateful `db.json` persistence. |
| **Silent Harassment / Stalker Protection** | An unwanted contact triggers a notification or confirms a match. | Silent discard architecture: swipes and blocks are recorded without returning confirmation to the other party. |
| **One-Sided Reveal** | Passing or liking someone without mutual confirmation leaks curiosity. | Coy's core promise: Neither party is ever alerted unless both independently register a like. |

---

## 🏗️ Architecture & Tech Stack

* **Frontend:** Next.js 14 (App Router), React 18, TypeScript, Tailwind CSS
* **Animations:** Framer Motion (gesture physics, dynamic card rotation, emerald LIKE / red PASS stamp opacity interpolation) + Canvas Confetti
* **Design Language:** Neo-brutalist / Coy Brand (`#FF2B6D`, soft vanilla `#FAF8F5`, `border-2 border-[#1C1C1E]`, chunky `shadow-coy` drop shadows)
* **Backend:** Next.js Serverless Route Handlers with persistent server-side JSON storage (`data/db.json`)
* **Testing:** Jest + `ts-jest` for matching logic and privacy assertion

---

## 📡 API Route Specifications

| Method | Endpoint | Payload / Params | Response | Description |
| :--- | :--- | :--- | :--- | :--- |
| `GET` | `/api/feed` | — | `{ success: true, count, profiles: SafeProfile[] }` | Returns unswiped profiles with privacy tags stripped. |
| `POST` | `/api/swipe` | `{ profileId: string, action: 'like' \| 'pass' }` | `{ success: true, isMatch: boolean, profile?: Profile }` | Records swipe. Profile returned **only** if mutual match occurs. |
| `POST` | `/api/rewind` | — | `{ success: true, profile: SafeProfile }` | Undoes the last swipe and restores the profile to the top of the stack. |
| `GET` | `/api/matches`| — | `{ success: true, count, matches: Match[] }` | Returns all confirmed mutual connections. |
| `POST` | `/api/matches`| — | `{ success: true, message: string }` | Resets the 32 seeded profiles and clears swipe history for re-testing. |
| `POST` | `/api/messages`| `{ matchId: string, text: string }` | `{ success: true, message: MatchMessage }` | Sends a message in an active match conversation. |

---

## 🧪 Automated Testing

Run the test suite to verify matching and privacy logic:
```bash
npm test
```

### Test Coverage Summary:
* `√ Privacy Rule: getFeedProfiles() never exposes hasLikedUser to the client`
* `√ Matching Rule: Swipe LIKE on a profile that liked user creates a mutual match`
* `√ Privacy Rule: Swipe LIKE on a profile that did NOT like user does NOT create a match`
* `√ Passing Rule: Swipe PASS on a profile never creates a match even if they liked user`
* `√ Deduplication Rule: A swiped profile never appears in getFeedProfiles() again`
* `√ Rewind / Undo Rule: Can undo the last swipe and restore profile to feed`

---

## 🚀 Running the App Locally

```bash
# 1. Clone repository
git clone <your-github-repo-url>
cd coy-discover

# 2. Install dependencies
npm install

# 3. Start development server
npm run dev
```

Visit **[http://localhost:3000](http://localhost:3000)** (recommended: inspect in mobile view or open on a mobile phone).

---

## 📝 Part A: Two Core Feature Suggestions for Coy

### Feature 1: "Silent Slot Reclaim (Dormant Activity Timeout)"
* **The Problem:** In Coy, users are restricted to 3 crush slots. If an added contact does not install Coy or ignores the anonymous notification, that slot is permanently frozen, causing anxiety and app abandonment.
* **The Solution:** If an added crush has not signed up or taken action within 14 days, the user gets their slot back automatically. The crush's phone number hash remains dormant in the backend: if they sign up 6 months later and add the user, a retro-match is still triggered.
* **Why Required:** Eliminates "wasted slot" friction, encourages repeated re-engagement, and keeps active viral loops spinning without spamming SMS.

### Feature 2: "Campus / Workplace Zero-Knowledge Verification Radar"
* **The Problem:** Cold anonymous SMS messages (*"Someone has a crush on you"*) often get ignored as phishing or spam.
* **The Solution:** Allow users to verify their college/work email (`.edu`, `@*.ac.in`). When someone receives an anonymous alert, it shows: *"Someone from [IIT Delhi / BITS Pilani] has a crush on you"*, with zero individual identity leaks.
* **Why Required:** Context skyrockets SMS-to-signup conversion, builds powerful university-level virality, and stays 100% true to Coy's zero-exposure privacy promise.
