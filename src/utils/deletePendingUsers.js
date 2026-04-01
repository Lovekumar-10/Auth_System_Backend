const User = require("../models/User");
const UserSession = require("../models/UserSession");

const deletePendingUsers = async () => {
  try {
    const fifteenDaysAgo = new Date(Date.now() - 15 * 24 * 60 * 60 * 1000);

    // Get users to delete
    const usersToDelete = await User.find({
      pendingDeletion: true,
      deletionRequestedAt: { $lte: fifteenDaysAgo },
    }).select("_id email");

    if (!usersToDelete.length) {
      console.log("No users to delete.");
      return;
    }

    const userIds = usersToDelete.map((user) => user._id);

 
    await UserSession.deleteMany({ userId: { $in: userIds } });


    await User.deleteMany({ _id: { $in: userIds } });

    console.log(`Deleted ${usersToDelete.length} users`);
  } catch (err) {
    console.error("Error deleting pending users:", err);
  }
};

module.exports = deletePendingUsers;