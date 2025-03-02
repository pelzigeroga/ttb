const express = require("express");
const cors = require("cors");
const db = require("./database"); // Verbindung zur SQLite-Datenbank
const routes = require("./routes"); // API-Routen
const app = express();

app.use(cors());
app.use(express.json());
app.use("/api", routes); // Alle Routen unter /api erreichbar

const port = process.env.PORT || 5000;
app.listen(port, () => {
    console.log(`✅ Backend läuft auf Port ${port}`);
});
