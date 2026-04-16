import { create } from "zustand";
import toast from "react-hot-toast";
import { axiosInstance } from "../lib/axios";
import { useAuthStore } from "./useAuthStore";

export const useChatStore = create((set, get) => ({
  messages: [],
  users: [],
  selectedUser: null,
  isUsersLoading: false,
  isMessagesLoading: false,

  getUsers: async () => {
    set({ isUsersLoading: true });
    try {
      const res = await axiosInstance.get("/messages/users");
      set({ users: res.data });
    } catch (error) {
      toast.error(error.response.data.message);
    } finally {
      set({ isUsersLoading: false });
    }
  },

  getMessages: async (userId) => {
    set({ isMessagesLoading: true });
    try {
      const res = await axiosInstance.get(`/messages/${userId}`);
      set({ messages: res.data });
    } catch (error) {
      toast.error(error.response.data.message);
    } finally {
      set({ isMessagesLoading: false });
    }
  },

  sendMessage: async (formData) => {
    const { selectedUser } = get();

    try {
      const res = await axiosInstance.post(
        `/messages/send/${selectedUser._id}`,
        formData
      );

      set((state) => ({
        messages: [...state.messages, res.data],
      }));
    } catch (error) {
      toast.error(
        error?.response?.data?.message || "Failed to send message"
      );
    }
  },

  subscribeToMessages: () => {
    const { selectedUser } = get();
    if (!selectedUser) return;

    const socket = useAuthStore.getState().socket;
    if (!socket) return;

    socket.on("newMessage", (newMessage) => {
      const { selectedUser } = get();

      if (!selectedUser) return;

      const isRelevantMessage =
        newMessage.senderId?.toString() === selectedUser._id?.toString() ||
        newMessage.receiverId?.toString() === selectedUser._id?.toString();

      if (!isRelevantMessage) return;

      set({
        messages: [...get().messages, newMessage],
      });
    });

    socket.on("messagesSeen", ({ senderId }) => {
      const { messages, selectedUser } = get();

      if (!selectedUser) return;

      if (selectedUser._id?.toString() !== senderId?.toString()) return;

      const updatedMessages = messages.map((msg) =>
        msg.senderId?.toString() === selectedUser._id?.toString()
          ? { ...msg, seen: true }
          : msg
      );

      set({ messages: updatedMessages });
    });
  },

  unsubscribeFromMessages: () => {
    const socket = useAuthStore.getState().socket;
    if (!socket) return;

    socket.off("newMessage");
    socket.off("messagesSeen");
  },

  setSelectedUser: (selectedUser) => set({ selectedUser }),
}));