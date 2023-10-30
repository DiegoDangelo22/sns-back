import { Router } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { User } from '../models/user.js';
import Role from '../models/role.js';
import Joi from 'joi';

const router = Router();

const signupSchema = Joi.object({
    name: Joi.string().min(2).required(),
    surname: Joi.string().min(3).required(),
    email: Joi.string().required(),
    password: Joi.string().min(5).required(),
    avatar: Joi.string().required(),
    tag: Joi.string().required()
})

const loginSchema = Joi.object({
    email: Joi.string().required(),
    password: Joi.string().min(5).required()
})

router.post('/signup', async (req, res) => {
    const duplicatedUser = await User.findOne({
        where: {
            email: req.body.email
        }
    });
    if(duplicatedUser) {
        res.status(400).send("Email already exists");
        return;
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(req.body.password, salt);

    try {
        await signupSchema.validateAsync(req.body);
        const newUser = await User.create({
            name: req.body.name,
            surname: req.body.surname,
            email: req.body.email,
            password: hashedPassword,
            avatar: req.body.avatar,
            tag: req.body.tag
        });
        res.status(200).send(`User created!
        Email: ${newUser.email}
        Password: ${newUser.password}`);
    } catch (error) {
        res.status(500).send(error.details[0].message);
    }
});

router.post('/login', async (req, res) => {
    const user = await User.findOne({
        where: {
            email: req.body.email
        }
    });
    if(!user) return res.status(400).send("User doesn't exists");

    const validPassword = await bcrypt.compare(req.body.password, user.password);
    if(!validPassword) return res.status(400).send("Incorrect password");

    try {
        await loginSchema.validateAsync(req.body);
        const token = jwt.sign({id: user.id}, `${process.env.TOKEN_SECRET}`, {expiresIn: '1h'});
        res.status(200).json({token});
    } catch (error) {
        res.status(500).send(error.details[0].message);
    }
})

export default router