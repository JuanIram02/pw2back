const serverStore = require("../serverStore");
const friendsUpdate = require("../socketHandlers/updates/friends");
const groupsUpdate = require("../socketHandlers/updates/groups");
const usersUpdate = require("../socketHandlers/updates/users");

const newConnectionHandler = async (socket, io) => {
    const userDetails = socket.user;

    serverStore.addNewConnectedUser({
        socketId: socket.id,
        userId: userDetails.userId,
    });

    // get users
    usersUpdate.updateUsers(userDetails.userId);

    // update pending friends invitations list
    friendsUpdate.updateFriendsPendingInvitations(userDetails.userId);

    //update friends list
    //friendsUpdate.updateFriendsPendingInvitations(userDetails.userId);

    //update friends list
    friendsUpdate.updateFriends(userDetails.userId);

    //update groups list
    groupsUpdate.updateGroups(userDetails.userId);
};

module.exports=newConnectionHandler;