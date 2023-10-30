import { Sequelize } from "sequelize";

const sequelize = new Sequelize("express", "root", "diegodangeloJW90", {
  host: "localhost",
  dialect: "mysql",
  alter: {
    drop: false, // Evita eliminar columnas existentes
  }
});
try {
  await sequelize.authenticate();
  console.log("Connection has been established successfully.");
} catch (error) {
  console.error("Unable to connect to the database:", error);
}

export default sequelize