import sequelize from "../security/config/database.js";
import { DataTypes } from "sequelize";
import { User } from "../security/models/user.js";

export const Message = sequelize.define("messages", {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    message: {
        type: DataTypes.STRING,
        allowNull: false
    },
    fromUserId: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    toFriendId: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    readed: {
        type: DataTypes.BOOLEAN,
        allowNull: false
    }
})

// User.belongsToMany(User, { through: "messages", as: "message", foreignKey: "userId", otherKey: "friendId" });
Message.belongsTo(User, { foreignKey: "fromUserId", as: "user" });
Message.belongsTo(User, { foreignKey: "toFriendId", as: "friend" });

try {
  await sequelize.sync({ alter: true });
  console.log("Message table created successfully!");
} catch (error) {
  console.error("Error creating table Message: ", error);
}