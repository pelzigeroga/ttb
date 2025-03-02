const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const cors = require("cors");

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(express.json());
app.use(cors());

// Datenbankverbindung
const db = new sqlite3.Database("trainingstagebuch.db", (err) => {
    if (err) {
        console.error("Fehler beim Öffnen der DB:", err.message);
    } else {
        console.log("Datenbank erfolgreich verbunden");
        db.run(`CREATE TABLE IF NOT EXISTS training (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            datum TEXT,
            uebung TEXT,
            gewicht REAL,
            wiederholungen INTEGER
        )`);
    }
});

// Eintrag hinzufügen
app.post("/api/training", (req, res) => {
    const { datum, uebung, gewicht, wiederholungen } = req.body;
    const sql = "INSERT INTO training (datum, uebung, gewicht, wiederholungen) VALUES (?, ?, ?, ?)";
    db.run(sql, [datum, uebung, gewicht, wiederholungen], function (err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ id: this.lastID, datum, uebung, gewicht, wiederholungen });
    });
});

// Alle Einträge abrufen
app.get("/api/training", (req, res) => {
    db.all("SELECT * FROM training ORDER BY datum", [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

// Einzelnen Eintrag bearbeiten
app.put("/api/training/:id", (req, res) => {
    const { id } = req.params;
    const { datum, uebung, gewicht, wiederholungen } = req.body;
    const sql = "UPDATE training SET datum = ?, uebung = ?, gewicht = ?, wiederholungen = ? WHERE id = ?";
    db.run(sql, [datum, uebung, gewicht, wiederholungen, id], function (err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ id, datum, uebung, gewicht, wiederholungen });
    });
});

// Eintrag löschen
app.delete("/api/training/:id", (req, res) => {
    const { id } = req.params;
    db.run("DELETE FROM training WHERE id = ?", id, function (err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: "Eintrag gelöscht", id });
    });
});

app.listen(port, () => {
    console.log(`Server läuft auf Port ${port}`);
});
