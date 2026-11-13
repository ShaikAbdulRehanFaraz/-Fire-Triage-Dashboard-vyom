const express = require("express");
const path = require("path");

const app = express();
const PORT = 3000;

// Key comes from the terminal, NOT from the dashboard page:
//   Windows (cmd):        set NASA_FIRMS_MAP_KEY=your_key_here
//   Windows (PowerShell): $env:NASA_FIRMS_MAP_KEY="your_key_here"
//   Linux/Mac:            export NASA_FIRMS_MAP_KEY=your_key_here
const MAP_KEY = (process.env.NASA_FIRMS_MAP_KEY || "").trim();

// Allow the dashboard to call this API from any origin / file
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  next();
});

// Serve the dashboard at http://localhost:3000
app.use(express.static(__dirname));
app.get("/", (req, res) =>
  res.sendFile(path.join(__dirname, "fire_triage_dashboard_vyon_project.html"))
);

app.get("/api/fires", async (req, res) => {
  if (!MAP_KEY) {
    return res.status(503).json({ error: "Set NASA_FIRMS_MAP_KEY first, then restart node server.js." });
  }

  const allowed = ["VIIRS_SNPP_NRT", "VIIRS_NOAA20_NRT", "MODIS_NRT"];
  const source = allowed.includes(req.query.source) ? req.query.source : "VIIRS_NOAA20_NRT";
  const bbox = /^-?[\d.]+,-?[\d.]+,-?[\d.]+,-?[\d.]+$/.test(req.query.bbox || "")
    ? req.query.bbox : "68,6,98,36"; // India default
  const days = Math.min(10, Math.max(1, parseInt(req.query.days) || 1));

  const url = `https://firms.modaps.eosdis.nasa.gov/api/area/csv/${MAP_KEY}/${source}/${bbox}/${days}`;

  try {
    const response = await fetch(url); // needs Node 18+
    const csv = await response.text();
    if (!response.ok || !/^latitude/i.test(csv)) {
      return res.status(502).json({ error: "NASA FIRMS request failed", details: csv.slice(0, 300) });
    }
    res.type("text/csv").send(csv);
  } catch (error) {
    res.status(502).json({ error: "Unable to connect to NASA FIRMS", details: error.message });
  }
});

app.listen(PORT, () => console.log(`Dashboard + API running at http://localhost:${PORT}`));
