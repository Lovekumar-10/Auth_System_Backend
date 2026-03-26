const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const helmet = require("helmet");

const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const { globalLimiter } = require("./middleware/rateLimiter");
const cron = require("node-cron");
const deletePendingUsers = require("./utils/deletePendingUsers");



const app = express();


// mongoDB Conncetion
connectDB();

// ✅ 🔥 CORS FIRST (MOST IMPORTANT)
app.use(
  cors({
    // origin: "http://localhost:5173",
    origin: "https://auth-system-frontend-alpha.vercel.app",
    credentials: true,
  })
);


// Middlerwares
app.use(globalLimiter);

// Security headers
app.use(helmet());


// Input sanitization
app.use(express.json({ limit: "10kb" })); // limit body size
app.use(express.urlencoded({ extended: true, limit: "10kb" }));




app.use(cookieParser());



// // CORS configuration
// const allowedOrigins = ["http://localhost:5173"]; 
// app.use(
//   cors({
//     origin: function (origin, callback) {
//       // allow requests with no origin (like Postman or server-to-server)
//       if (!origin) return callback(null, true);
//       if (allowedOrigins.indexOf(origin) === -1) {
//         const msg = "The CORS policy for this site does not allow access from the specified origin.";
//         return callback(new Error(msg), false);
//       }
//       return callback(null, true);
//     },
//     credentials: true, // allow cookies
//   })
// );





// router defined ok  
app.use("/api/auth", authRoutes);


// Cron Job for deleting users pending deletion
cron.schedule("0 1 * * *", () => {
  console.log("Running daily cleanup for pending deletion users...");
  deletePendingUsers();
});

app.use((err, req, res, next) => {

  const statusCode = err.statusCode || 500;

  res.status(statusCode).json({
    success: false,
    message: err.message || "Server Error"
  });

});

module.exports = app;   





