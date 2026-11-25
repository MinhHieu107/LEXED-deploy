require("dotenv").config();

const express = require("express");
const cors = require("cors");
const app = express();

const allowedOrigins = [
    "http://localhost:5173",
    "https://lexed-deploy.vercel.app",
    process.env.FRONTEND_URL
].filter(Boolean);

app.use(cors({
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) {
            return callback(null, true);
        }

        return callback(new Error("Origin is not allowed by CORS"));
    },
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true
}));

app.use(express.json());


app.get("/health", (req, res) => {
    res.status(200).json({ status: "ok" });
});

app.use("/examBank", require("./routes/examBankRoutes"));
app.use("/examBank", require("./routes/questionRoutes"));
app.use("/auth", require("./routes/authRoutes"));
app.use("/notes", require("./routes/noteRoutes"));
app.use("/progress", require("./routes/progressRoutes"));
app.use("/flashcardSets", require("./routes/flashcardSetRoutes"));
app.use("/", require("./routes/classRoutes"));

const port = Number(process.env.PORT) || 8080;
app.listen(port, "0.0.0.0", () => {
    console.log(`LEXED API is running on port ${port}`);
});
