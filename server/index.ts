import "dotenv/config"; // Load environment variables from .env file
import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";

const app = express();

declare module 'http' {
  interface IncomingMessage {
    rawBody: unknown
  }
}

// Production security headers
if (process.env.NODE_ENV === "production") {
  app.use((req, res, next) => {
    // Security headers
    res.setHeader("X-Content-Type-Options", "nosniff");
    res.setHeader("X-Frame-Options", "DENY");
    res.setHeader("X-XSS-Protection", "1; mode=block");
    res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
    
    // Remove X-Powered-By header
    res.removeHeader("X-Powered-By");
    
    // Content Security Policy for production
    if (!req.path.startsWith("/api")) {
      res.setHeader(
        "Content-Security-Policy",
        "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:;"
      );
    }
    
    next();
  });
}

// Trust proxy if behind reverse proxy (EasyPanel, Cloudflare, etc.)
if (process.env.TRUST_PROXY === "true") {
  app.set("trust proxy", 1);
}

// Body parsing with size limits
app.use(express.json({
  limit: "10mb",
  verify: (req, _res, buf) => {
    req.rawBody = buf;
  }
}));
app.use(express.urlencoded({ extended: false, limit: "10mb" }));

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

// Health check endpoint (before other routes)
app.get("/health", (_req: Request, res: Response) => {
  res.status(200).json({
    status: "healthy",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || "development",
  });
});

// Readiness check endpoint
app.get("/ready", (_req: Request, res: Response) => {
  // Add any readiness checks here (database connection, etc.)
  res.status(200).json({
    status: "ready",
    timestamp: new Date().toISOString(),
  });
});

(async () => {
  try {
    const httpServer = await registerRoutes(app);

    // Production error handler - don't expose stack traces
    app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
      const status = err.status || err.statusCode || 500;
      const isDevelopment = process.env.NODE_ENV === "development";
      
      // Log error details
      log(`Error ${status}: ${err.message}${isDevelopment ? `\n${err.stack}` : ""}`, "error");

      // Don't expose internal errors in production
      const message = isDevelopment 
        ? err.message 
        : status >= 500 
          ? "Internal Server Error" 
          : err.message;

      res.status(status).json({ 
        message,
        ...(isDevelopment && { stack: err.stack })
      });
    });

    // Setup vite in development, serve static files in production
    if (process.env.NODE_ENV === "development") {
      await setupVite(app, httpServer);
    } else {
      serveStatic(app);
    }

    // Start server
    const port = parseInt(process.env.PORT || '5000', 10);
    
    httpServer.listen(port, "0.0.0.0", () => {
      log(`🚀 Server running on port ${port} in ${process.env.NODE_ENV || "development"} mode`);
      log(`📊 Health check available at /health`);
      log(`✅ Readiness check available at /ready`);
    });

    // Graceful shutdown handling
    const gracefulShutdown = (signal: string) => {
      log(`Received ${signal}, starting graceful shutdown...`);
      
      httpServer.close(() => {
        log("HTTP server closed");
        process.exit(0);
      });

      // Force close after 10 seconds
      setTimeout(() => {
        log("Forced shutdown after timeout");
        process.exit(1);
      }, 10000);
    };

    process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
    process.on("SIGINT", () => gracefulShutdown("SIGINT"));

    // Handle uncaught exceptions
    process.on("uncaughtException", (err) => {
      log(`Uncaught Exception: ${err.message}`, "error");
      log(err.stack || "", "error");
      gracefulShutdown("uncaughtException");
    });

    // Handle unhandled promise rejections
    process.on("unhandledRejection", (reason, promise) => {
      log(`Unhandled Rejection at: ${promise}, reason: ${reason}`, "error");
      gracefulShutdown("unhandledRejection");
    });

  } catch (error) {
    log(`Failed to start server: ${error instanceof Error ? error.message : String(error)}`, "error");
    if (error instanceof Error && error.stack) {
      log(error.stack, "error");
    }
    process.exit(1);
  }
})();
