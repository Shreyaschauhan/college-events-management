const express = require("express");
const cors = require("cors");
const app = express();

//Config
const PORT = 5001;

//Local Routes Import 
const authRoutes = require("./routes/authRoutes");
const eventRoutes = require("./routes/eventRoutes");
const enrollmentRoutes = require("./routes/enrollmentRoutes");

//Local Util Import
const connectDB = require("./config/db");


connectDB();

app.use(express.json());
app.use(cors());

app.get("/test", (req, res) => {
    res.send("Hello World!");
});

app.use("/api/auth/", authRoutes);
app.use("/api/events/", eventRoutes);
app.use("/api/enrollments/", enrollmentRoutes);

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});