const verifyEmailTemplate = (name, verifyURL) => {
  return `
  <div style="font-family:Arial;padding:20px">
    <h2>Welcome ${name} 🎉</h2>

    <p>Thanks for registering with our platform.</p>

    <p>Please verify your email by clicking the button below.</p>

    <a href="${verifyURL}" 
       style="
       display:inline-block;
       padding:12px 20px;
       background:#4CAF50;
       color:white;
       text-decoration:none;
       border-radius:5px;
       margin-top:10px;
       ">
       Verify Email
    </a>

    <p style="margin-top:20px">
      If you did not create this account, please ignore this email.
    </p>

  </div>
  `;
};

module.exports = verifyEmailTemplate;