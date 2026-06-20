import express from "express";
import http from "http";
import dotenv from "dotenv";
import mongoose from "mongoose";
import { Server } from "socket.io";
import User from "./models/user.model.js";
dotenv.config();

const port = process.env.PORT || 5000;
const mongodbUrl = process.env.MONGODB_URI;

const connectDb = async () => {
    try {
        await mongoose.connect(mongodbUrl);
        console.log("db connected");
    } catch (error) {
        console.log("db error");
    }
}

const app = express();

app.use(express.json());

const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: process.env.NEXT_BASE_URL
    }
})

app.post("/emit", async (req, res) => {
    try {
        const { event, userId, data } = req.body;

        const user = await User.findById(userId);

        if (user.socketId) {
            io.to(user.socketId).emit(event,data)
        }

        return res.json({ success: true })
    } catch (error) {
        return res.json({ success: false })
    }
})

io.on("connection", (socket) => {
    console.log(socket.id)
    socket.on("identity", async (userId) => {
        socket.userId = userId
        await User.findByIdAndUpdate(userId, {
            socketId: socket.id,
            isOnline: true
        })
    })

    socket.on("update-location", async ({ userId, latitude, longitude }) => {
        await User.findByIdAndUpdate(userId, {
            location: {
                type: "Point",
                coordinates: [longitude, latitude]
            }
        })
    })

    socket.on("join-ride", (bookingId) => {
        console.log("join ride: ", bookingId);
        socket.join(`ride-${bookingId}`)
    })

    socket.on("driver-location-update", ({ bookingId, latitude, longitude, status }) => {
        io.to(`ride-${bookingId}`).emit("driver-location", {
            latitude,
            longitude
        })
    })

    socket.on("chat-message", (data) => {
        console.log("message received:", data);

        const room = io.sockets.adapter.rooms.get(`ride-${data.bookingId}`);
        console.log("users in room:", room);
        io.to(`ride-${data.bookingId}`).emit("chat-message", data);
    })

    socket.on("disconnect", async () => {
        if (!socket.userId) return;
        await User.findByIdAndUpdate(socket.userId, {
            socketId: null,
            isOnline: false
        })
    })
})

server.listen(port, () => {
    connectDb();
    console.log("server started");  
})