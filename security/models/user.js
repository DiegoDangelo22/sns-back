import sequelize from "../config/database.js";
import { DataTypes } from "sequelize";

export const User = sequelize.define("users", {
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  surname: {
    type: DataTypes.STRING,
    allowNull: false
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false
  },
  avatar: {
    type: DataTypes.STRING
  },
  tag: {
    type: DataTypes.STRING,
    allowNull: false
  },
  description: {
    type: DataTypes.STRING,
    allowNull: true
  }
});

export const Friendship = sequelize.define("friendships", {
  status: {
    type: DataTypes.ENUM("pending", "accepted"),
    allowNull: false,
    defaultValue: "pending"
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  friendId: {
    type: DataTypes.INTEGER,
    allowNull: false
  }
});

User.belongsToMany(User, { through: "friendships", as: "friend", foreignKey: "userId", otherKey: "friendId" });

try {
  await sequelize.sync({ alter: true });
  console.log("User table created successfully!");
} catch (error) {
  console.error("Error creating table User: ", error);
}