import express from "express";
import shortid from "shortid";
import validUrl from "valid-url";
import { Log } from "./logger.js";

const app = express();
app.use(express.json());

const store = new Map();
const now = () => Date.now();
const minutesToMs = (m) => m * 60 * 1000;
const BASE = "http://localhost:5000";

app.post("/shorturls", async (req, res) => {
  const { Url, shortCode, validity } = req.body;

  if (!Url) {
    await Log("backend", "error", "URLShortener", "Url required");
    return res.status(400).json({ error: "Url required" });
  }

  if (!validUrl.isWebUri(Url)) {
    await Log("backend", "error", "URLShortener", "Invalid URL");
    return res.status(400).json({ error: "Invalid URL" });
  }

  const code = shortCode?.trim() || shortid.generate();
  if (store.has(code)) {
    await Log("backend", "warning", "URLShortener", "Shortcode already exists");
    return res.status(400).json({ error: "Shortcode already exists" });
  }

  const ttl = Number.isFinite(validity) ? Number(validity) : 30;
  const expiry = now() + minutesToMs(ttl);

  const data = {
    longUrl: Url,
    shortCode: code,
    expiresAt: new Date(expiry).toISOString(),
    clicks: 0,
    clickTimes: [],
    createdAt: new Date().toISOString(),
  };

  store.set(code, data);
  await Log("backend", "info", "URLShortener", `Short URL created: ${code}`);

  res.status(201).json({
    shortLink: `${BASE}/${code}`,
    ...data,
  });
});

app.get("/:code", async (req, res) => {
  const { code } = req.params;
  const data = store.get(code);

  if (!data) {
    await Log("backend", "error", "URLShortener", "Code not found");
    return res.status(404).json({ error: "URL not found" });
  }

  if (new Date() > new Date(data.expiresAt)) {
    await Log("backend", "warning", "URLShortener", "Link expired");
    return res.status(410).json({ error: "Link expired" });
  }

  data.clicks++;
  data.clickTimes.push(new Date().toISOString());
  await Log("backend", "info", "URLShortener", `Redirected: ${code}`);
  res.redirect(data.longUrl);
});

app.get("/shorturl/:code", async (req, res) => {
  const { code } = req.params;
  const data = store.get(code);

  if (!data) {
    await Log("backend", "error", "URLShortener", "Stats not found");
    return res.status(404).json({ error: "URL not found" });
  }

  await Log("backend", "debug", "URLShortener", `Stats requested: ${code}`);

  res.json({
    longUrl: data.longUrl,
    shortLink: `${BASE}/${data.shortCode}`,
    shortCode: data.shortCode,
    clicks: data.clicks,
    expiresAt: data.expiresAt,
    createdAt: data.createdAt,
    clickTimes: data.clickTimes,
  });
});

app.get("/", async (req, res) => {
  await Log("backend", "info", "URLShortener", "Health check");
  res.json({
    msg: "In-memory URL Shortener running",
    endpoints: {
      shorten: "POST /shorturls { Url, shortCode?, validity? }",
      redirect: "GET /:code",
      stats: "GET /shorturl/:code",
    },
  });
});

app.listen(5000, async () => {
  await Log("backend", "info", "URLShortener", "Server started");
  console.log("Server running at port 5000");
});
