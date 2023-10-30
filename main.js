import { Router, json } from 'express';
import express from 'express';
import cors from 'cors';
import authRoute from './security/controllers/auth.js';
import userRoute from './security/controllers/user.js';
import postRoute from './controllers/post.js';
import messageRoute from './controllers/message.js'; 
import http from 'http';
import path from 'path';
import { Server } from 'socket.io';
import multer from 'multer';
import hyperid from 'hyperid';

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, './public/images/avatars/')
  },
  filename: (req, file, cb) => {
    const instance = hyperid();
    cb(null, `${hyperid.decode(instance(), {urlSafe:true}).uuid+path.extname(file.originalname)}`)
  }
})

const upload = multer({ storage: storage })

const router = Router();
const app = express();

app.use('/public', express.static('public'));

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: 'http://localhost:5173'
  }
});

app.use(json())
app.use(cors({ origin: "http://localhost:5173" }));

app.post('/avatar', upload.single('avatarToUpload'), (req, res) => {
  const uploadedFile = req.file;

  const responseData = {
    fileName: uploadedFile.originalname,
    fileSize: uploadedFile.size,
    filePath: path.join('public/images/avatars', uploadedFile.filename)
  };

  res.json(responseData);
})

app.use(router);
app.use("/users", authRoute);
app.use("/users", userRoute);
app.use("/posts", postRoute);
app.use("/messages", messageRoute);

let PORT = process.env.PORT || 3000;

io.on("connection", (socket) => {
  socket.on("direct_message_request", ({userId, friendId}) => {
    const sortedUserIds = [userId, friendId].sort((a, b) => a - b);
    const roomName = `dm_${sortedUserIds[0]}_${sortedUserIds[1]}`;

    socket.on('leave', () => {
      socket.leave(roomName);
    });

    socket.join(roomName);

    io.to(roomName).emit("direct_message_started", {room: roomName});
    
    socket.on('direct_message', (message) => {
      io.to(roomName).emit('direct_message', message);
      socket.broadcast.emit('unread_message', message)
    });
    
  });
  
});

server.listen(PORT, () => {
  console.log(`Socket.io server is up and running on ${PORT}`);
});