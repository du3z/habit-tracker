import "dotenv/config";

export const env = {
  port: process.env.PORT || 4000,
  databaseUrl: process.env.DATABASE_URL,
  jwtSecret: process.env.JWT_SECRET || "dev_secret",
  clientOrigin: process.env.CLIENT_ORIGIN || "http://localhost:5173",
};
