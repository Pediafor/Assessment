import app from "./app";
import { config } from "dotenv";

config(); // load .env

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log(`UserService running on port ${PORT}`);
});
