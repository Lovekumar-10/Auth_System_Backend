// const jwt = require("jsonwebtoken");
// const User = require("../../models/User");

// const getMeController = async (req, res) => {
//   try {
//     let user = null;

//     const token = req.cookies?.token;

//     if (token) {
//       try {
//         const decoded = jwt.verify(
//           token,
//           process.env.ACCESS_TOKEN_SECRET
//         );

//         const foundUser = await User.findById(decoded.id).select("-password");

//         if (foundUser) {
//           user = foundUser;
//         }
//       } catch (err) {

//         user = null;
//       }
//     }

//     return res.status(200).json({
//       user,
//     });

//   } catch (error) {
//     console.error("GetMe Error:", error);

//     return res.status(500).json({
//       message: "Server error",
//     });
//   }
// };

// module.exports = getMeController;













const getMeController = (req, res) => {
  return res.status(200).json({
    user: req.user,
  });
};

module.exports = getMeController;