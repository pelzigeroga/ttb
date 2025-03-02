const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const cors = require("cors");
const stringSimilarity = require("string-similarity");

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
            wiederholungen INTEGER,
            benutzer TEXT
        )`);
    }
});

// Eintrag hinzufügen (mit Fuzzy-Matching)
app.post("/api/training", (req, res) => {
    const { datum, uebung, gewicht, wiederholungen, benutzer } = req.body;
    if (!datum || !uebung || !gewicht || !wiederholungen || !benutzer) {
        return res.status(400).json({ error: "Alle Felder sind erforderlich!" });
    }
    db.all("SELECT DISTINCT uebung FROM training WHERE benutzer = ?", [benutzer], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        const bekannteUebungen = rows.map(row => row.uebung);
        const matches = stringSimilarity.findBestMatch(uebung, bekannteUebungen);
        const korrigierteUebung = matches.bestMatch.rating > 0.8 ? matches.bestMatch.target : uebung;
        const sql = "INSERT INTO training (datum, uebung, gewicht, wiederholungen, benutzer) VALUES (?, ?, ?, ?, ?)";
        db.run(sql, [datum, korrigierteUebung, gewicht, wiederholungen, benutzer], function (err) {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ id: this.lastID, datum, uebung: korrigierteUebung, gewicht, wiederholungen, benutzer });
        });
    });
});

// Alle Einträge abrufen (mit Filterung)
app.get("/api/training", (req, res) => {
    const { benutzer, filterFeld, filterWert } = req.query;
    if (!benutzer) return res.status(400).json({ error: "Benutzer erforderlich!" });
    let sql = "SELECT * FROM training WHERE benutzer = ?";
    let params = [benutzer];
    if (filterFeld && filterWert) {
        sql += ` AND ${filterFeld} LIKE ?`;
        params.push(`%${filterWert}%`);
    }
    sql += " ORDER BY datum";
    db.all(sql, params, (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

// Einzelnen Eintrag bearbeiten
app.put("/api/training/:id", (req, res) => {
    const { id } = req.params;
    const { datum, uebung, gewicht, wiederholungen } = req.body;
    if (!datum || !uebung || !gewicht || !wiederholungen) {
        return res.status(400).json({ error: "Alle Felder sind erforderlich!" });
    }
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

// Statistiken abrufen
app.get("/api/statistiken", (req, res) => {
    const { benutzer } = req.query;
    if (!benutzer) return res.status(400).json({ error: "Benutzer erforderlich!" });
    const sql = `SELECT uebung, COUNT(*) AS anzahl, 
                ROUND(AVG(gewicht), 2) AS avg_weight, 
                ROUND(MAX(gewicht), 2) AS max_weight,
                ROUND(AVG(wiederholungen), 2) AS avg_reps,
                MAX(wiederholungen) AS max_reps
                FROM training WHERE benutzer = ? GROUP BY uebung`;
    db.all(sql, [benutzer], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

app.listen(port, () => {
    console.log(`Server läuft auf Port ${port}`);
});
