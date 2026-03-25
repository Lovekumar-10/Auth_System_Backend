

// const logger = require("../../utils/logger");

// const eventWrapper = (eventType) => {
//   return (controllerFn) => async (req, res, next) => {
//     try {
//       // Run controller
//       const result = await controllerFn(req, res, next);

//       // Log success automatically
//       if (result && eventType) {
//         await  logger({
//           type: eventType,
//           message: result.logMessage || "Action completed successfully",
//           userId: result.userId || req.user?._id || null,
//           email: result.email || req.user?.email || req.body?.email || "Unknown",
//           req,
//         });
//       }

//       return result;
//     } catch (err) {
//       next(err); // pass error to central errorHandler
//     }
//   };
// };

// module.exports = eventWrapper;





const logger = require("../../utils/logger");

const eventWrapper = (eventType) => {
  return (controllerFn) => async (req, res, next) => {
    try {

      await controllerFn(req, res, next);

      if (eventType) {
        await logger({
          type: eventType,
          message: "Action completed successfully",
          userId: req.user?._id || null,
          email: req.user?.email || req.body?.email || "Unknown",
          req,
        });
      }

    } catch (err) {
      next(err);
    }
  };
};

module.exports = eventWrapper;