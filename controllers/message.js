import { Router } from 'express';
import { Message } from "../models/message.js";
import { Op } from 'sequelize';

const router = Router();

router.post('/create', async (req, res) => {
    try {
        const newMessage = await Message.create({
            message: req.body.message,
            fromUserId: req.body.userId,
            toFriendId: req.body.friendId,
            readed: req.body.readed
        });
        res.status(200).send(newMessage);
    } catch (error) {
        console.error(error);
        res.status(500).send('Error creating message');
    }
})

router.get('/list/:userId/:friendId', async (req, res) => {
    try {
        const messages = await Message.findAll({
            where: {
                [Op.or]: [
                    {fromUserId: req.params.userId, toFriendId: req.params.friendId},
                    {fromUserId: req.params.friendId, toFriendId: req.params.userId}
                ]
            }
        });
        res.status(200).send(messages);
    } catch (error) {
        console.error(error);
        res.status(500).send('Error retrieving messages');
    }
})

router.get('/unreadMessages', async (req, res) => {
    try {
        const messages = await Message.findAll({
            where: {
                readed: 0
            }
        });
        res.status(200).send(messages);
    } catch (error) {
        res.status(500).send(error);
    }
})

router.patch('/readed/:userId/:friendId', async (req, res) => {
    try {
        const updatedMessage = await Message.update(
            {readed: 1},
            {where: {
                fromUserId: req.params.userId, toFriendId: req.params.friendId
            }}
        )
        res.status(200).send(updatedMessage);
    } catch (error) {
        res.status(500).send(error);
    }
})

export default router