import sequelize from "../config/database.js";
import { DataTypes } from "sequelize";

const Role = sequelize.define("roles", {
  role: {
    type: DataTypes.STRING,
    allowNull: false
  }
})

try {
  await sequelize.sync({ force: false });
  console.log("Role table created successfully!");
} catch (error) {
  console.error("Error creating table Role: ", error);
}

export default Role