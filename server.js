const express = require("express");
const path = require("path");

const app = express();
const PORT = Number(process.env.PORT) || 3000;

// Prefer a server-side secret. The x-api-key header is a fallback for users
// connecting through the dashboard; only use it over HTTPS when deployed.
const SERVER_MAP_KEY = (process.env.NASA_FIRMS_MAP_KEY || "").trim();

// The dashboard can be hosted separately (for example, on GitHub Pages), so
// allow its GET requests and the browser's preflight for the x-api-key header.
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, X-API-Key");
  if (req.method === "OPTIONS") return res.sendStatus(204);
  next();
});

app.get("/api/health", (req, res) => {
  res.json({ ok: true, mapKeyConfigured: Boolean(SERVER_MAP_KEY) });
});

// Serve the actual dashboard file in this repository.
app.use(express.static(__dirname));
app.get("/", (req, res) => res.sendFile(path.join(__dirname, "index.html")));

app.get("/api/fires", async (req, res) => {
  const mapKey = SERVER_MAP_KEY || (req.get("x-api-key") || "").trim();
  if (!mapKey) {
    return res.status(503).json({
      error: "No NASA FIRMS key provided. Set NASA_FIRMS_MAP_KEY on the server or enter your MAP_KEY in the dashboard.",
    });
  }

  const allowedSources = ["VIIRS_SNPP_NRT", "VIIRS_NOAA20_NRT", "MODIS_NRT"];
  const source = allowedSources.includes(req.query.source) ? req.query.source : "VIIRS_SNPP_NRT";
  let bbox = req.query.bbox === "world" ? "-180,-85,180,85" : req.query.bbox;
  const coords = typeof bbox === "string" ? bbox.split(",").map(Number) : [];
  const validBbox = coords.length === 4 && coords.every(Number.isFinite) &&
    coords[0] >= -180 && coords[0] < coords[2] && coords[2] <= 180 &&
    coords[1] >= -90 && coords[1] < coords[3] && coords[3] <= 90;
  if (!validBbox) bbox = "68,6,98,36"; // India default

  const requestedDays = Number.parseInt(req.query.days, 10);
  const days = Number.isFinite(requestedDays) ? Math.min(10, Math.max(1, requestedDays)) : 1;
  const url = `https://firms.modaps.eosdis.nasa.gov/api/area/csv/${encodeURIComponent(mapKey)}/${source}/${bbox}/${days}`;

  try {
    const response = await fetch(url);
    const csv = await response.text();
    if (!response.ok || !/^latitude/i.test(csv.trim())) {
      return res.status(502).json({
        error: "NASA FIRMS request failed. Check that the MAP_KEY is valid and try again.",
        details: csv.slice(0, 300),
      });
    }
    res.type("text/csv").send(csv);
  } catch (error) {
    res.status(502).json({ error: "Unable to connect to NASA FIRMS", details: error.message });
  }
});

app.listen(PORT, () => console.log(`Dashboard + API running on port ${PORT}`));
