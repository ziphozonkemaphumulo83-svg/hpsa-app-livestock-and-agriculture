# HPSA App

## Overview
HPSA (Health & Productivity Support App) is an offline-ready web application designed for managing sales, census data, and household records. It can be packaged as an APK using WebIntoApp without requiring Firebase hosting.

The app supports:
- User login and registration
- Sales summary and report dashboards
- Census data collection and household management
- Offline persistence using IndexedDB and LocalStorage
- CSV export of sales and census data

---

## Features

### Login & Registration
- Users can login using previously registered credentials stored in LocalStorage.
- Registration stores user credentials locally, allowing offline login.

### Sales Summary & Report
- View sales dashboards with KPIs (Households, Cows, Goats, Chickens, etc.)
- Filter data by dip tank, participant, or village
- Export reports to CSV for offline use

### Census Management
- Add household and individual data offline
- Track livestock, people, demographics
- Generate census reports and summaries
- Filter by participant, village, or dip tank

### Offline Support
- IndexedDB for storing census and sales data
- LocalStorage for user session and profile
- All features work offline after first load

### UI & UX
- Responsive, mobile-friendly design
- Dark/light themed dashboards
- Toast notifications and modals
- Smooth screen transitions

---

## App Flow Diagram

```text
+----------------+          +-------------------+          +------------------+
|   index.html   |  Login   | sales-summary.html|  View    | sales-report.html|
| (Login/Welcome)| -------->|   (Dashboard)     | -------->|  (Reports)       |
+----------------+          +-------------------+          +------------------+
        |                           |
        | Register                  | Filter / Export CSV
        v                           v
+----------------+          +-------------------+
| register.html  |          | census.html       |
| (Register Form)| -------->| (Census Dashboard)|
+----------------+          +-------------------+
                                    |
                                    | Add / View
                                    v
                           +-----------------------+
                           | census-household.html |
                           | (Household Input)     |
                           +-----------------------+
                                    |
                                    | Generate
                                    v
                           +-----------------------+
                           | census-report.html    |
                           | (Census Report)       |
                           +-----------------------+
