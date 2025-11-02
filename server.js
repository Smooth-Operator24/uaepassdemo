import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import bodyParser from "body-parser";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.static(path.join(__dirname, "public")));
app.use(bodyParser.urlencoded({ extended: true }));

// Home page
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public/index.html"));
});

// Fake UAE Pass login form (single identifier)
app.get("/fake-uaepass", (req, res) => {
  res.sendFile(path.join(__dirname, "public/fake-uaepass.html"));
});

// Handle dummy input and redirect to dashboard with generated details
app.post("/fake-uaepass/auth", (req, res) => {
  const raw = (req.body.identifier || "").trim();

  // Basic detection: if contains @ -> email, otherwise treat as mobile
  const isEmail = raw.includes("@");
  const email = isEmail ? raw : "";
  const mobile = isEmail ? "" : raw.replace(/\s+/g, "");

  // Generate deterministic dummy details from identifier (so same input -> same output)
  // Simple hash-like number from string
  function hashNum(str, len = 12) {
    let h = 0;
    for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) >>> 0;
    return String(h).padStart(len, "0").slice(0, len);
  }

  const idnBase = hashNum(raw, 12);
  const emiratesId = `784${idnBase.slice(0,12)}`;
  const demoName = isEmail
    ? raw.split("@")[0].replace(/[^\w]/g, " ").replace(/\b\w/g, c => c.toUpperCase()) || "Demo User"
    : `User ${raw.slice(-4) || "Demo"}`;

  // Trade license and VAT are mocked (semi-random)
  const tradeLicense = `TL-${hashNum(raw,8).slice(0,8)}`;
  const vatReg = `VAT-${hashNum(raw,6).slice(0,6)}`;

  const q = new URLSearchParams({
    name: demoName,
    email,
    mobile,
    idn: emiratesId,
    trade: tradeLicense,
    vat: vatReg
  }).toString();

  res.redirect(`/dashboard.html?${q}`);
});

// Simple logout redirect
app.get("/logout", (req, res) => {
  res.redirect("/");
});

app.listen(PORT, () => console.log(`Mock UAE Pass demo running at http://localhost:${PORT}`));
