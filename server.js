const express = require("express");
const cors = require("cors");

const countriesRoutes = require("./src/app/api/countries");

const app = express();

app.use(cors());
app.use(express.json());


// ==========================================
// ROUTES
// ==========================================

app.use("/api/countries", countriesRoutes);


// ==========================================
// TEST
// ==========================================

app.get("/", (req, res) => {

    res.json({
        success: true,
        message: "SDG Tracker API is running"
    });

});


// ==========================================
// START SERVER
// ==========================================

const PORT = 5000;

app.listen(PORT, () => {

    console.log(
        `SDG Tracker API running on http://localhost:${PORT}`
    );

});