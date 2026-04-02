import dotenv from "dotenv";
dotenv.config();
import express from "express";
import cors from "cors";
import helmet from "helmet";
import contactRoutes from "./routes/contactRoutes.js";
import rateLimit from "express-rate-limit";
import slowDown from "express-slow-down";
import hpp from "hpp";

// Rate limiting - 5 requests per 2 mins per IP
const limiter = rateLimit({
  windowMs: 2 * 60 * 1000, // 2 minutes
  max: 5,
  message: { message: "Too many requests. Try later." },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => req.path === "/health",
});

// Slow down - progressive delay for repeated requests
const speedLimiter = slowDown({
  windowMs: 2 * 60 * 1000, // 2 minutes
  delayAfter: 2,
  delayMs: (used) => Math.min((used - 2) * 500, 5000),
});
const app = express();

// Trust proxy for correct IP detection behind Render
app.set("trust proxy", 1);

// Security headers with strict configuration
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'"],
        imgSrc: ["'self'", "data:", "https:"],
        connectSrc: ["'self'"],
        fontSrc: ["'self'"],
        objectSrc: ["'none'"],
        frameSrc: ["'none'"],
      },
    },
    crossOriginEmbedderPolicy: false,
    hsts: {
      maxAge: 31536000,
      includeSubDomains: true,
      preload: true,
    },
    referrerPolicy: { policy: "same-origin" },
  })
);

// HTTP Parameter Pollution protection
app.use(hpp());

// CORS - restrict to your frontend origin
const corsOptions = {
  origin: process.env.ALLOWED_ORIGIN || ["https://website-seven-khaki-57.vercel.app", "http://localhost:5174", "www.cccakgec.in", "ccakgec.in", "new-ccc.vercel.app","http://localhost:5173"],
  methods: ["GET", "POST"],
  allowedHeaders: ["Content-Type"],
  credentials: false,
};
app.use(cors(corsOptions));

// Suspicious IP tracking
const suspiciousIPs = new Map();
const BLOCK_DURATION = 60 * 60 * 1000;

// Security middleware - block suspicious IPs
app.use((req, res, next) => {
  const ip = req.ip || req.connection.remoteAddress;
  
  if (suspiciousIPs.has(ip)) {
    const blockTime = suspiciousIPs.get(ip);
    if (Date.now() - blockTime < BLOCK_DURATION) {
      return res.status(403).json({ message: "Access denied - suspicious activity detected" });
    } else {
      suspiciousIPs.delete(ip);
    }
  }
  
  const userAgent = req.headers["user-agent"] || "";
  const suspiciousPatterns = [
    /sqlmap/i, /nikto/i, /masscan/i, /nmap/i,
    /burpsuite/i, /dirbuster/i, /gobuster/i,
  ];
  
  if (suspiciousPatterns.some((pattern) => pattern.test(userAgent))) {
    suspiciousIPs.set(ip, Date.now());
    console.log(`🚫 Blocked scanner from IP: ${ip}`);
    return res.status(403).json({ message: "Access denied" });
  }
  
  next();
});

// Request logging with security monitoring
app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  const ip = req.ip || req.connection.remoteAddress || "unknown";
  
  console.log(`[${timestamp}] ${req.method} ${req.path} - ${ip}`);
  
  if (req.path.includes("../") || req.path.includes("..") || req.path.includes("<script")) {
    console.log(`⚠️ Suspicious request from ${ip}: ${req.path}`);
    suspiciousIPs.set(ip, Date.now());
    return res.status(400).json({ message: "Bad request" });
  }
  
  next();
});

console.log("EMAIL_USER:", process.env.EMAIL_USER);
console.log("EMAIL_PASS:", process.env.EMAIL_PASS ? "***" : "undefined");

app.use(express.json({ limit: "10kb", strict: true }));
app.use("/api/contact", speedLimiter, limiter);

// Health check endpoint
app.get("/health", (req, res) => {
  res.status(200).json({ status: "OK", timestamp: new Date().toISOString() });
});

// Routes
app.use("/api/contact", contactRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: "Endpoint not found" });
});

// Error handler
app.use((err, req, res, next) => {
  console.error("Error:", err.stack);
  res.status(500).json({ message: "Internal server error" });
});

// Server
const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`CORS allowed origin: ${corsOptions.origin}`);
});

// Export for Vercel serverless
export default app;

// Graceful shutdown
const gracefulShutdown = (signal) => {
  console.log(`\n${signal} received. Shutting down gracefully...`);
  server.close(() => {
    console.log("Server closed");
    process.exit(0);
  });
};

process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
process.on("SIGINT", () => gracefulShutdown("SIGINT"));