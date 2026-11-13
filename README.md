# Fire Triage Dashboard

A browser-based dashboard for exploring fire detections, viewing satellite imagery, and triaging observations. The project includes a small Node.js server that can proxy NASA FIRMS requests.

## Project files

- `fire_triage_dashboard_vyon_project.html` — dashboard UI and client-side logic.
- `server.js` — static file server and optional NASA FIRMS API proxy.
- `Fire_Triage_Dashboard_Visual.pptx` — project presentation.
- `explain.docx` — project explanation.

## Requirements

- Node.js 18 or newer
- npm
- A NASA FIRMS map key to load fire data through the server

## Run locally

In PowerShell:

```powershell
npm install
$env:NASA_FIRMS_MAP_KEY="your_key_here"
npm start
```

Then open [http://localhost:3000](http://localhost:3000).

The dashboard can be viewed without a FIRMS key, but the server-backed fire-data request requires `NASA_FIRMS_MAP_KEY`. Keep the key in your environment; do not put it in the HTML or commit it to this repository.

The dashboard loads Leaflet from unpkg and map tiles from Carto, so those views require an internet connection.
