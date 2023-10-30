import sequelize from "../security/config/database.js";
import { DataTypes } from "sequelize";
import { User } from '../security/models/user.js';

const Post = sequelize.define("posts", {
    content: {
        type: DataTypes.STRING,
        allowNull: false
    },
    belongsToUser: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    userAvatar: {
        type: DataTypes.STRING,
        allowNull: false
    },
    userName: {
        type: DataTypes.STRING,
        allowNull: false
    },
    userSurname: {
        type: DataTypes.STRING,
        allowNull: false
    },
    media: {
        type: DataTypes.STRING,
        allowNull: true
    },
    mediaType: {
        type: DataTypes.STRING,
        allowNull: true
    }
})

Post.belongsTo(User, {foreignKey: 'belongsToUser'})
User.hasMany(Post, {foreignKey: 'belongsToUser'})

try {
    await sequelize.sync({alter:true});
    console.log("Post table created successfully!");
} catch (error) {
    console.error("Error creating table Post: ", error);
}

export default Post