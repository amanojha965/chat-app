import { axiosInstance } from "../lib/axios";
import { useChatStore } from "../store/useChatStore";
import { useEffect, useRef } from "react";

import ChatHeader from "./ChatHeader";
import MessageInput from "./MessageInput";
import MessageSkeleton from "./skeletons/MessageSkeleton";
import { useAuthStore } from "../store/useAuthStore";
import { formatMessageTime } from "../lib/utils";

const ChatContainer = () => {
  const {
    messages,
    getMessages,
    isMessagesLoading,
    selectedUser,
    subscribeToMessages,
    unsubscribeFromMessages,
  } = useChatStore();

  const { authUser } = useAuthStore();
  const messageEndRef = useRef(null);

  useEffect(() => {
    if (!selectedUser?._id) return;

    getMessages(selectedUser._id);
    subscribeToMessages();

    const markSeen = async () => {
      try {
        await axiosInstance.put(`/messages/mark-seen/${selectedUser._id}`);
      } catch (err) {
        console.log("mark seen error:", err);
      }
    };

    markSeen();

    return () => unsubscribeFromMessages();
  }, [selectedUser?._id]);

  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  if (isMessagesLoading) {
    return (
      <div className="flex-1 flex flex-col overflow-hidden">
        <ChatHeader />
        <MessageSkeleton />
        <MessageInput />
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <ChatHeader />

      <div className="flex-1 overflow-y-auto overflow-x-hidden p-4 space-y-4">
        {messages.map((message, index) => {
          // 🔥 FIX (important)
          const isOwnMessage =
            message.senderId?.toString() === authUser._id?.toString();

          return (
            <div
              key={message._id}
              className={`chat ${isOwnMessage ? "chat-end" : "chat-start"}`}
              ref={index === messages.length - 1 ? messageEndRef : null}
            >
              {/* Avatar */}
              <div className="chat-image avatar">
                <div className="size-10 rounded-full border">
                  <img
                    src={
                      isOwnMessage
                        ? authUser.profilePic || "/avatar.png"
                        : selectedUser.profilePic || "/avatar.png"
                    }
                    alt="profile"
                  />
                </div>
              </div>

              {/* Time */}
              <div className="chat-header mb-1">
                <time className="text-xs opacity-50 ml-1">
                  {formatMessageTime(message.createdAt)}
                </time>
              </div>

              {/* Message Bubble */}
              <div className="flex flex-col items-end max-w-[75%]">
                <div className="chat-bubble break-words whitespace-pre-wrap flex flex-col">
                  {message.image && (
                    <img
                      src={message.image}
                      alt="Attachment"
                      className="sm:max-w-[200px] rounded-md mb-2"
                    />
                  )}
                  {message.text && <p>{message.text}</p>}
                </div>

                {/* ✅ Seen / Sent */}
                {isOwnMessage && (
                  <span className="text-xs mt-1 flex items-center gap-1 opacity-70">
                    {message.seen ? (
                      <>
                        <span className="text-blue-500">✓✓</span>
                        <span>Seen</span>
                      </>
                    ) : (
                      <>
                        <span className="text-zinc-400">✓</span>
                        <span>Sent</span>
                      </>
                    )}
                  </span>
                )}
              </div>
            </div>
          );
        })}

        <div ref={messageEndRef} />
      </div>

      <MessageInput />
    </div>
  );
};

export default ChatContainer;