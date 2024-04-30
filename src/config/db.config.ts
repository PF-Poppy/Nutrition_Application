import dotenv from "dotenv";

dotenv.config();
export default {
  HOST: process.env.DB_HOST || "localhost",
  USER: process.env.DB_USER || "myadmin",
  PASSWORD: process.env.DB_PASSWORD || "UZ6Qwo&|^h0*M9/",
  DB: process.env.DB_NAME || "petfoodreccomendation",
};