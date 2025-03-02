const sqlite3 = require("sqlite3").verbose();
const path = require("path");

// Datenbank im "db"-Ordner speichern
const dbPath = path.join(__dirname, "db", "trainingstagebuch.db");

// Verbindung zur SQLite-Datenbank
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
