import { Router } from 'express';
import Post from "../models/post.js";
import { User } from "../security/models/user.js";
import { Op } from 'sequelize';

const router = Router();

router.get('/list', async (req, res) => {
    try {
        const posts = await Post.findAll();
        res.status(200).send(posts);
    } catch (error) {
        console.error(error);
    }
})

router.get('/detail/:id', async (req, res) => {
    try {
        const userPosts = await Post.findAll({
            where: {
                belongsToUser: req.params.id
            }
        });
        res.status(200).send(userPosts);
    } catch (error) {
        console.error(error);
        res.status(500).send("Error retrieving details");
    }
})

router.post('/create', async (req, res) => {
    try {
        const newPost = await Post.create({
            content: req.body.content,
            belongsToUser: req.body.belongsToUser,
            userAvatar: req.body.userAvatar,
            userName: req.body.userName,
            userSurname: req.body.userSurname,
            media: req.body.media,
            mediaType: req.body.mediaType
        });
        res.status(200).send(newPost);
    } catch (error) {
        console.error(error);
        res.status(500).send('Error creating post');
    }
})

router.put('/update/:postId', async (req, res) => {
    const {avatar} = req.body
    try {
        const posts = await Post.update(
            {userAvatar: avatar},
            {where: {
                id: req.params.postId
            }}
        );
        res.status(200).send(posts);
    } catch (error) {
        console.error(error);
        res.status(500).send('Error updating post');
    }
})

router.post('/updatePostContentWithUpdatedUserTags', async (req, res) => {
    const {oldTag, newTag} = req.body;
    try {
        // 1. Obtener todas las publicaciones que contienen el userTag antiguo
        const postsToUpdate = await Post.findAll({
            where: {
                content: {
                    [Op.like]: `%${oldTag}%`
                }
            }
        });

        // 2. Reemplazar el userTag antiguo con el userTag nuevo en el contenido de esas publicaciones
        for (const post of postsToUpdate) {
            post.content = post.content.replace(new RegExp(oldTag, 'g'), newTag);
            await post.save(); // Guardar la publicación actualizada
        }

        res.status(200).send("Publicaciones actualizadas correctamente con el nuevo userTag");
    } catch (error) {
        console.error(error);
        res.status(500).send(error);
    }
});

export default router