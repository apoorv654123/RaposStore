import { aj } from "./lib/arcjet.js";
import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import helmet from "helmet";
import morgan from "morgan";
import path from "path";
import productRoutes from "./routes/productRoutes.js";
import { sql } from "./config/db.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const __dirname = path.resolve();

app.use(express.json());
app.use(cors());
app.use(helmet(
  {
    contentSecurityPolicy: false,
  }
));
app.use(morgan("dev"));

// Arcjet middleware for rate limiting and bot detection
app.use(async (req, res, next) => {
  try {
    const decision = await aj.protect(req, {
      requested: 1,
    });

    if (decision.isDenied()) {
      if (decision.reason.isRateLimit()) {
        res.status(429).json({
          error: "Too many requests, please try again later.",
        });
      } else if (decision.reason.isBot()) {
        res.status(403).json({
          error: "Access denied for bots.",
        });
      } else {
        res.status(403).json({ error: "Forbidden" });
      }
      return;
    }

    if (
      decision.results.some(
        (result) => result.reason.isBot() && result.reason.isSpoofed()
      )
    ) {
      res.status(403).json({
        error: "Spoofed bot detected",
      });
    }

    next();
  } catch (error) {
    console.error("Arcjet middleware error:", error);
    next(error);
  }
});

app.use("/api/products", productRoutes);

if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "/frontend/dist")));

  app.get("/*splat", (req, res) => {
    res.sendFile(path.resolve(__dirname, "frontend", "dist", "index.html"));
  });
}

async function initDB() {
  try {
    await sql`
            CREATE TABLE IF NOT EXISTS products(
                id SERIAL PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                image VARCHAR(255) NOT NULL,
                price DECIMAL(10, 2) NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `;

    console.log("Database initialized successfully");
  } catch (error) {
    console.log("Database error, Error initDB", error);
  }
}

initDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server is running on PORT ${PORT}`);
  });
});
