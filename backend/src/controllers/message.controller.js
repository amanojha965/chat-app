import User from "../models/user.model.js";
import Message from "../models/message.model.js";
import cloudinary from "../lib/cloudinary.js";
import { getReceiverSocketId, io } from "../lib/socket.js";

// 👇 Sidebar users
export const getUsersForSidebar = async (req, res) => {
  try {
    const loggedInUserId = req.user._id;

    const filteredUsers = await User.find({
      _id: { $ne: loggedInUserId },
    }).select("-password");

    res.status(200).json(filteredUsers);
  } catch (error) {
    console.error("Error in getUsersForSidebar:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

// 👇 Get chat messages
export const getMessages = async (req, res) => {
  try {
    const { id: userToChatId } = req.params;
    const myId = req.user._id;

    const messages = await Message.find({
      $or: [
        { senderId: myId, receiverId: userToChatId },
        { senderId: userToChatId, receiverId: myId },
      ],
    });

    res.status(200).json(messages);
  } catch (error) {
    console.log("Error in getMessages:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

// 👇 Send message
export const sendMessage = async (req, res) => {
  try {
    const { text, image } = req.body;
    const { id: receiverId } = req.params;
    const senderId = req.user._id;

    let imageUrl;

    if (image) {
      const uploadResponse = await cloudinary.uploader.upload(image);
      imageUrl = uploadResponse.secure_url;
    }

    const newMessage = new Message({
      senderId,
      receiverId,
      text,
      image: imageUrl,
      seen: false, // 👈 IMPORTANT
    });

    await newMessage.save();

    // 👇 send real-time message
    const receiverSocketId = getReceiverSocketId(receiverId);

    if (receiverSocketId) {
      io.to(receiverSocketId).emit("newMessage", newMessage);
    }

    res.status(201).json(newMessage);
  } catch (error) {
    console.log("Error in sendMessage:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

// 👇 Mark messages as seen + socket emit
export const markMessagesAsSeen = async (req, res) => {
  try {
    const { id: senderId } = req.params;
    const myId = req.user._id;

    await Message.updateMany(
      {
        senderId,
        receiverId: myId,
        seen: false,
      },
      {
        $set: { seen: true },
      }
    );

    // 👇 sender ko notify karo (REAL-TIME)
    const senderSocketId = getReceiverSocketId(senderId);

    if (senderSocketId) {
      io.to(senderSocketId).emit("messagesSeen", {
        senderId: myId,
      });
    }

    res.status(200).json({ message: "Messages marked as seen" });
  } catch (error) {
    console.log("Error in markMessagesAsSeen:", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};