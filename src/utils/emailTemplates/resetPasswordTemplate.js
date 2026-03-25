const resetPasswordTemplate = (resetURL) => {
  return `
  <div style="font-family:Arial;padding:20px">

    <h2>Password Reset Request</h2>

    <p>You requested to reset your password.</p>

    <p>Click the button below to reset it.</p>

    <a href="${resetURL}" 
       style="
       display:inline-block;
       padding:12px 20px;
       background:#ff4d4d;
       color:white;
       text-decoration:none;
       border-radius:5px;
       margin-top:10px;
       ">
       Reset Password
    </a>

    <p style="margin-top:20px">
      This link will expire in 1 hour.
    </p>

  </div>
  `;
};

module.exports = resetPasswordTemplate;