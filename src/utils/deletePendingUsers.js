const User = require("../models/User");
const UserSession = require("../models/UserSession");

const deletePendingUsers = async () => {
  try {
    const fifteenDaysAgo = new Date(Date.now() - 15 * 24 * 60 * 60 * 1000);

    const usersToDelete = await User.find({
      pendingDeletion: true,
      deletionRequestedAt: { $lte: fifteenDaysAgo },
    });

    for (let user of usersToDelete) {
      // Delete all sessions of this user
      await UserSession.deleteMany({ userId: user._id });

      // Delete the user
      await User.findByIdAndDelete(user._id);

      console.log(`Deleted user: ${user.email}`);
    }
  } catch (err) {
    console.error("Error deleting pending users:", err);
  }
};

module.exports = deletePendingUsers;