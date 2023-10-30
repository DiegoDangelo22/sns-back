import { Router } from "express";
import { User, Friendship } from "../models/user.js";
import { Op } from 'sequelize';

const router = Router();

router.get('/list', async (req, res) => {
    const users = await User.findAll();
    res.status(200).send(users);
})

router.get('/usersTag', async (req, res) => {
    try {
        const users = await User.findAll();
        let tags = []
        users.forEach((user)=>{tags.push({userTag: user.tag, userId: user.id})})
        res.status(200).send(tags);
    } catch (error) {
        console.error(error);
    }
})

router.get('/detail/:id', async (req, res) => {
    try {
        const userData = await User.findByPk(req.params.id);
        res.status(200).send(userData);
    } catch (error) {
        console.error(error);
        res.status(500).send("Error retrieving details");
    }
})

router.patch('/updateAvatar/:id', async (req, res) => {
    const { avatar } = req.body;
    try {
        const updatedUser = await User.update(
            { avatar: avatar },
            { where: {
                id: req.params.id
            }}
        )
        if (updatedUser[0] === 1) {
            res.status(200).json({ affectedRows: updatedUser[0] });
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Internal server error' });
    }
})

router.patch('/updateTag/:userId', async (req, res) => {
    try {
        const updatedUser = await User.update(
            {tag: req.body.tag},
            {where: {
                id: req.params.userId
            }}
        )
        res.status(200).send(updatedUser);
    } catch (error) {
        res.status(500).send("Internal server error");
    }
})

router.patch('/updateDescription/:userId', async (req, res) => {
    const { description } = req.body;
    try {
        const updatedUser = await User.update(
            { description: description },
            { where: {
                id: req.params.userId
            }}
        )
        updatedUser[0] === 1 ? res.status(200).json({ affectedRows: updatedUser[0] }) : res.status(404).json({ message: 'User not found'})
    } catch (error) {
        res.status(500).json({ message: 'Internal server error' });
    }
})

router.get('/friends/search', async (req, res) => {
    const searchTerm = req.query.term;
    try {
        const users = await User.findAll({
            where: {
                [Op.or]: [
                    { name: { [Op.like]: `%${searchTerm}%` } },
                    { surname: { [Op.like]: `%${searchTerm}%` } }
                ]
            }
        })
        res.json(users);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al buscar usuarios' });
    }
})

router.post('/friends/add', async (req, res) => {
    try {
        const friendshipAlreadyExists = await Friendship.findAll({
            where: {
                [Op.or]: [
                    {userId: req.body.userId,
                    friendId: req.body.friendId},
                    {userId: req.body.friendId,
                    friendId: req.body.userId}
                ]
            }
        })

        if(friendshipAlreadyExists.length===1) {
            res.status(500).send("You are already friends");
            return;
        }

        if(req.body.userId !== req.body.friendId) {
            const friendship = await Friendship.create({
                status: 'pending',
                userId: req.body.userId,
                friendId: req.body.friendId
            })
            res.status(200).send(friendship)
        } else {
            res.status(500).send("You can not add yourself")
        }
    } catch (error) {
        console.error(error);
        res.status(500).send("Error adding friend");
    }
})

router.post('/friends/delete', async (req, res) => {
    try {
        const deletedFriend = await Friendship.destroy({
            where: {
                [Op.or]: [
                    {userId: req.body.userId,
                    friendId: req.body.friendId},
                    {userId: req.body.friendId,
                    friendId: req.body.userId}
                ]
            }
        })
        res.status(200).send({deletedFriend})
    } catch (error) {
        console.error(error);
        res.status(500).send("Error deleting friend");
    }
})

router.post('/friends/accept', async (req, res) => {
    try {
        const friendship = await Friendship.findOne({where: {
            status: 'pending',
            userId: req.body.userId,
            friendId: req.body.friendId
        }});
        friendship.status = 'accepted';
        await friendship.save();
        res.status(200).send(friendship);
    } catch (error) {
        console.error(error);
        res.status(500).send("Error accepting friend");
    }
})

router.post('/friends/decline', async (req, res) => {
    try {
        await Friendship.destroy({where: {
            status: 'pending',
            userId: req.body.userId,
            friendId: req.body.friendId
        }});
        res.status(200).send('Friend request declined');
    } catch (error) {
        console.error(error);
        res.status(500).send("Error declining friend");
    }
})

router.get('/friendships/:userId', async (req, res) => {
    try {
        const friendships = await Friendship.findAll({
            where: {
                [Op.or]: [
                    { userId: req.params.userId },
                    { friendId: req.params.userId }
                ]
            }
        })
        res.status(200).send(friendships);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al buscar la solicitud de amistad' });
    }
})

export default router