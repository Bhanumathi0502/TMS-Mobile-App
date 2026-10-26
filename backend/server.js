const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const dotenv = require("dotenv");
const path = require("path");

dotenv.config();

const connectDB = require("./src/config/db");
const { errorHandler } = require("./src/middleware/errorHandler");

const authRoutes = require("./src/routes/auth.routes");
const masterRoutes = require("./src/routes/master.routes");
const complaintRoutes = require("./src/routes/complaint.routes");
const reportRoutes = require("./src/routes/report.routes");
const notificationRoutes = require("./src/routes/notification.routes");

const app = express();

app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: "10mb" }));
app.use(morgan("dev"));

app.use("/uploads", express.static(path.join(__dirname, "src/uploads")));

app.get("/", (req, res) => res.json({ ok: true, message: "TMS API Running" }));

app.use("/api/auth", authRoutes);
app.use("/api/masters", masterRoutes);
app.use("/api/complaints", complaintRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/notifications", notificationRoutes);

app.use(errorHandler);

connectDB().then(() => {
  const port = process.env.PORT || 5000;
  app.listen(port, () => console.log(` Backend running on http://localhost:${port}`));
});
