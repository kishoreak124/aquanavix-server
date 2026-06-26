const express = require("express");
const axios = require("axios");

const app = express();
const PORT = process.env.PORT || 3000;

// Your Firebase Realtime Database URL
const FIREBASE_URL = "https://smart-marine-boundary-system-default-rtdb.firebaseio.com";

app.get("/gps", async (req, res) => {

    const deviceId = req.query.deviceId || "AQN001";
    const lat = parseFloat(req.query.lat);
    const lon = parseFloat(req.query.lon);
    const status = req.query.status || "SAFE";

    const boatData = {
        latitude: lat,
        longitude: lon,
        status: status,
        timestamp: new Date().toLocaleString(),
        lastUpdate: Date.now()
    };

    try {

        // Update boat location
        await axios.put(
            `${FIREBASE_URL}/boats/${deviceId}.json`,
            boatData
        );

        // Save alert history
        if (
            status === "WARNING" ||
            status === "DANGER" ||
            status === "ENTRY"
        ) {

            await axios.post(
                `${FIREBASE_URL}/alerts.json`,
                {
                    boatId: deviceId,
                    latitude: lat,
                    longitude: lon,
                    status: status,
                    timestamp: new Date().toLocaleString(),
                    lastUpdate: Date.now()
                }
            );
        }

        res.json({
            success: true,
            deviceId: deviceId,
            message: "GPS uploaded successfully"
        });

    } catch (error) {

        console.log(error.message);

        res.status(500).json({
            success: false,
            error: error.message
        });
    }

});

app.get("/", (req, res) => {
    res.send("AquaNavix Server Running");
});

app.listen(PORT, () => {
    console.log("AquaNavix Server Started on Port " + PORT);
});
