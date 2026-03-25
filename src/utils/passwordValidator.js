// // utils/passwordValidator.js
// const zxcvbn = require("zxcvbn");

// /**
//  * Validates password strength and rules.
//  * @param {string} password - The password to validate
//  * @returns {Object} { valid: boolean, message: string, suggestions?: Array<string> }
//  */
// const validatePassword = (password) => {
//   if (!password) return { valid: false, message: "Password is required" };

//   // Length check
//   if (password.length < 8)
//     return { valid: false, message: "Password must be at least 8 characters" };

//   // Uppercase check
//   if (!/[A-Z]/.test(password))
//     return { valid: false, message: "Password must include an uppercase letter" };

//   // Lowercase check
//   if (!/[a-z]/.test(password))
//     return { valid: false, message: "Password must include a lowercase letter" };

//   // Number check
//   if (!/[0-9]/.test(password))
//     return { valid: false, message: "Password must include a number" };

//   // Special character check
//   if (!/[@$!%*?&]/.test(password))
//     return { valid: false, message: "Password must include a special character" };

//   // Advanced strength check using zxcvbn
//   const strength = zxcvbn(password);
//   if (strength.score < 3) {
//     return {
//       valid: false,
//       message: "Password too weak",
//       suggestions: strength.feedback.suggestions
//     };
//   }

//   // If everything passed
//   return { valid: true };
// };

// module.exports = validatePassword;






// utils/passwordValidator.js
const zxcvbn = require("zxcvbn");

/**
 * Backend password validator (ALIGNED with frontend)
 * @param {string} password
 * @returns {Object}
 */
const validatePassword = (password) => {
  // Same requirement structure as frontend
  const requirements = [
    { label: "At least 8 characters", met: password?.length >= 8 },
    { label: "At least 1 number", met: /[0-9]/.test(password || "") },
    { label: "At least 1 lowercase letter", met: /[a-z]/.test(password || "") },
    { label: "At least 1 uppercase letter", met: /[A-Z]/.test(password || "") },
    { label: "At least 1 special character", met: /[!-/:-@[-`{-~]/.test(password || "") },
  ];

  // If no password → same behavior as frontend
  if (!password) {
    return {
      valid: false,
      requirements: requirements.map(r => ({ ...r, met: false })),
    };
  }

  // Count how many rules passed
  const metCount = requirements.filter(r => r.met).length;

  // SAME zxcvbn logic as frontend
  const entropy = zxcvbn(password).score;

  // FINAL RESULT (exact same as frontend)
  const valid = metCount === 5 && entropy >= 2;

  return {
    valid,
    requirements,
  };
};

module.exports = validatePassword;