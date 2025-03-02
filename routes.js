const express = require("express");
const db = require("./database");
const router = express.Router();

// 📌 Alle Trainingsdaten abrufen
router.get("/training", (req, res) => {
    db.all("SELECT * FROM training ORDER BY datum", [], (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json(rows);
    });
});

// 📌 Neuen Eintrag hinzufügen
router.post("/training", (req, res) => {
    const { datum, uebung, gewicht, wiederholungen } = req.body;
    if (!datum || !uebung || !gewicht || !wiederholungen) {
        return res.status(400).json({ error: "Alle Felder sind erforderlich!" });
    }
    db.run(
        "INSERT INTO training (datum, uebung, gewicht, wiederholungen) VALUES (?, ?, ?, ?)",
        [datum, uebung, gewicht, wiederholungen],
        function (err) {
            if (err) {
                res.status(500).json({ error: err.message });
                return;
            }
            res.json({ id: this.lastID, datum, uebung, gewicht, wiederholungen });
        }
    );
});

// 📌 Eintrag bearbeiten
router.put("/training/:id", (req, res) => {
    const { id } = req.params;
    const { datum, uebung, gewicht, wiederholungen } = req.body;
    if (!datum || !uebung || !gewicht || !wiederholungen) {
        return res.status(400).json({ error: "Alle Felder sind erforderlich!" });
    }
    db.run(
        "UPDATE training SET datum = ?, uebung = ?, gewicht = ?, wiederholungen = ? WHERE id = ?",
        [datum, uebung, gewicht, wiederholungen, id],
        function (err) {
            if (err) {
                res.status(500).json({ error: err.message });
                return;
            }
            res.json({ message: "Eintrag aktualisiert", id });
        }
    );
});

// 📌 Eintrag löschen
router.delete("/training/:id", (req, res) => {
    const { id } = req.params;
    db.run("DELETE FROM training WHERE id = ?", id, function (err) {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json({ message: "Eintrag gelöscht", id });
    });
});

// 📌 Test-Route für die Datenbank
router.get("/test-db", (req, res) => {
    db.all("SELECT name FROM sqlite_master WHERE type='table'", [], (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json(rows);
    });
});

module.exports = router;
