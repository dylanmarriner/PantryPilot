const express = require("express");
const cors = require("cors");
const aiRoutes = require("./routes/ai_routes");
const syncRoutes = require("./routes/sync_routes");
const authRoutes = require("./routes/auth_routes");
const inventoryRoutes = require("./routes/inventory_routes");
const dashboardRoutes = require("./routes/dashboard_routes");
const usersRoutes = require("./routes/users_routes");
const adminRoutes = require("./routes/admin_routes");
const groceryListRoutes = require("./routes/grocery_list_routes");

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/sync", syncRoutes);
app.use("/api/inventory", inventoryRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/users", usersRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/grocery-list", groceryListRoutes);

app.get("/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

module.exports = app;
