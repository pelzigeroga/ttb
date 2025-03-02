const sqlite3 = require("sqlite3").verbose();
const fs = require("fs");
const path = require("path");

// Stelle sicher, dass der "db"-Ordner existiert
const dbDir = path.join(__dirname, "db");
if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
}

// Datenbankpfad setzen
const dbPath = path.join(dbDir, "trainingstagebuch.db");

// Verbindung zur SQLite-Datenbank herstellen
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error("❌ Fehler beim Öffnen der Datenbank:", err.message);
    } else {
        console.log("✅ Erfolgreich mit SQLite-Datenbank verbunden");
        db.run(`CREATE TABLE IF NOT EXISTS training (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            datum TEXT,
            uebung TEXT,
            gewicht REAL,
            wiederholungen INTEGER
        )`);
    }
});

module.exports = db;
