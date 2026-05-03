import express from "express";
import cors from "cors";
import bodyParser from "body-parser";

const app = express();

app.use(cors());
app.use(bodyParser.json());

const VERIFY_TOKEN = "wa_verify_41be7547-98a";

// WEBHOOK VERIFICATION
app.get("/webhook", (req, res) => {
    const mode = req.query["hub.mode"];
    const token = req.query["hub.verify_token"];
    const challenge = req.query["hub.challenge"];

    console.log("Verification request received");

    if (mode === "subscribe" && token === VERIFY_TOKEN) {
        console.log("Webhook verified successfully");
        return res.status(200).send(challenge);
    }

    return res.sendStatus(403);
});

// RECEIVE WHATSAPP MESSAGES
app.post("/webhook", async (req, res) => {
    console.log("Incoming webhook:");

    console.log(JSON.stringify(req.body, null, 2));

    res.sendStatus(200);
});

const PORT = 3000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});