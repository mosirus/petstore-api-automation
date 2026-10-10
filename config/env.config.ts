import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(__dirname, "../.env") });

export const ENV = {
  API_BASE_URL: process.env.API_BASE_URL || "https://petstore.swagger.io/v2",
};
