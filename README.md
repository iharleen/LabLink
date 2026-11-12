# LabLink — Smart Laboratory Equipment Booking & Management Platform
Project 4 of the Smart Campus & Student Life series. A frontend-only demo for booking lab equipment, approving requests, reporting faults and viewing analytics.

## Features
Dashboard (stats computed from data), equipment catalogue (search/filter/sort, add/edit/delete with active-booking handling), booking with overlap-aware availability (peak concurrent quantity of Approved/Active bookings), My Bookings with filters and cancellation, Demo Admin Mode request management, maintenance module (maintenance blocks booking and flags future reservations for review), 5 Chart.js analytics charts with empty states, notifications, profile, light/dark theme, JSON export/import, reset/clear.

## Stack
HTML5, CSS3, vanilla JS, Chart.js and Lucide (CDN, app works if they fail to load), LocalStorage key `lablink_data_v1`.

## Structure
`index.html`, `css/style.css`, `js/{app,storage,equipment,bookings,maintenance,analytics,notifications}.js`

## Run
Open `index.html` in Chrome, or serve the folder with any static server.

## Deploy
GitHub Pages: push the folder to a repo → Settings → Pages → deploy from `main` / root.
Vercel: import the repo as a static project (no build command, output = root).

## Demo data
18 equipment items, 9 bookings, 3 maintenance reports, 5 notifications and a sample student, all demonstration records. Use *Restore demo data* in Profile & Settings to reset.

## Limitations
LocalStorage is browser-specific. There is no multi-user sync, no secure authentication (Demo Admin Mode is only a toggle) and no real inventory integration.

## Future enhancements
Real backend and authentication, email notifications, calendar view, QR check-in, automatic Active/Completed transitions.
