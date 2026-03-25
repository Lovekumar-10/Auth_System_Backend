// const mongoose = require("mongoose");

// const userSchema = new mongoose.Schema(
//   {
//     role: {
//       type: String,
//       default: "user",
//       enum: ["user", "admin"],
//     },

//     name: {
//       type: String,
//       required: true,
//       trim: true,
//     },

//     email: {
//       type: String,
//       required: true,
//       unique: true,
//       lowercase: true,
//       trim: true,
//     },

//     password: {
//       type: String,
//       required: true,
//       minlength: 8,
//     },

//     isVerified: {
//       type: Boolean,
//       default: false,
//     },
    
//     // refreshToken: String,

//     emailVerificationToken: String,
//     emailVerificationExpires: Date,

//     passwordResetToken: String,
//     passwordResetExpires: Date,
//   },
//   { timestamps: true }
// );

// const User = mongoose.model("User", userSchema);

// module.exports = User;





const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    role: {
      type: String,
      default: "user",
      enum: ["user", "admin"],
    },

    name: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true, // simple index only
    },

    password: {
      type: String,
      required: true,
      minlength: 8,
    },

    isVerified: {
      type: Boolean,
      default: false,
    },

    passwordChangedAt: Date,

    emailVerificationToken: String,
    emailVerificationExpires: Date,

    passwordResetToken: String,
    passwordResetExpires: Date,
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);

module.exports = User;