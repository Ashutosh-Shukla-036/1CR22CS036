import express from "express";
import shortid from "shortid";
import validUrl from "valid-url";

const app = express();
app.use(express.json());

const store = new Map();

const now = () => Date.now();
const minutesToMs = (m) => m * 60 * 1000;
const BASE = "http://localhost:5000"; // define BASE so it works

app.post("/shorten", (req, res) => {
  const { longUrl, shortCode, ttlMinutes, maxClicks } = req.body;

  if (!longUrl) return res.status(400).json({ error: "longUrl required" });
  if (!validUrl.isWebUri(longUrl)) {
    return res.status(400).json({ error: "Invalid URL" });
  }

  const code = shortCode?.trim() || shortid.generate();
  if (store.has(code)) {
    return res.status(400).json({ error: "Shortcode already exists" });
  }

  const ttl = Number.isFinite(ttlMinutes) ? Number(ttlMinutes) : 30;
  const expiry = now() + minutesToMs(ttl);
  const created = now();

  const data = {
    longUrl,
    shortCode: code,
    expiresAt: new Date(expiry).toISOString(),
    clicks: 0,
    clickTimes: [], // store each click timestamp
    maxClicks: maxClicks ?? null,
    createdAt: new Date(created).toISOString(),
  };

  store.set(code, data);

  res.status(201).json({
    shortLink: `${BASE}/${code}`,
    ...data,
  });
});

app.get("/:code", (req, res) => {
  const { code } = req.params;
  const data = store.get(code);
  if (!data) return res.status(404).json({ error: "URL not found" });

  if (new Date() > new Date(data.expiresAt)) {
    return res.status(410).json({ error: "Link expired" });
  }

  if (data.maxClicks !== null && data.clicks >= data.maxClicks) {
    return res.status(410).json({ error: "Max clicks reached" });
  }

  data.clicks++;
  data.clickTimes.push(new Date().toISOString()); // log time of each click
  return res.redirect(data.longUrl);
});

app.get("/stats/:code", (req, res) => {
  const { code } = req.params;
  const data = store.get(code);
  if (!data) return res.status(404).json({ error: "URL not found" });

  res.json({
    longUrl: data.longUrl,
    shortLink: `${BASE}/${data.shortCode}`,
    shortCode: data.shortCode,
    clicks: data.clicks,
    maxClicks: data.maxClicks,
    expiresAt: data.expiresAt,
    createdAt: data.createdAt,
    clickTimes: data.clickTimes, // show detailed click timestamps
  });
});

app.get("/", (req, res) => {
  res.json({
    msg: "In-memory URL Shortener running",
    endpoints: {
      shorten: "POST /shorten { longUrl, shortCode?, ttlMinutes?, maxClicks? }",
      redirect: "GET /:code",
      stats: "GET /stats/:code",
    },
  });
});

app.listen(5000, () => console.log(`Server running at port 5000`));
