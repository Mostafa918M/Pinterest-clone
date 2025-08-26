require("dotenv").config();
const express = require("express");
const cookieParser = require("cookie-parser");
const boardRoutes = require("./routes/board.route");
const cors = require('cors')
const {
  handleNotFound,
  globalError,
} = require("./middlewares/globalErrorHandler");

// Import routes
const authRoute = require("./routes/auth.route");
const userRoute = require("./routes/user.route");
const pinRoutes = require("./routes/pin.route");

const app = express();

const allowedOrigins = [process.env.FRONTEND_URL];
app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
    methods: ['GET','POST','PUT','PATCH','DELETE','OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(express.json());
app.use(cookieParser());

app.use("/api/v1/auth", authRoute);
app.use("/api/v1/users", userRoute);
app.use("/api/v1/pins", pinRoutes);
app.use("/api/v1/boards", boardRoutes);

app.use(handleNotFound);
app.use(globalError);

module.exports = app;
