import dotenv from "dotenv";
import { connectToDB } from "./config/DBConnection.js";
import app from "./app.js";
dotenv.config();

const port = process.env.PORT || 8080;

app.listen(port, "0.0.0.0", () => {
  console.log(`Server running on port ${port}`);
});

connectToDB()
  .then(() => {
    console.log("DB connected successfully");
  })
  .catch((error) => {
    console.error("DB connection failed:", error);
  });