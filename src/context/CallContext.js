import { createContext, useEffect, useState, useRef } from "react";
import { io } from "socket.io-client";
import Peer from "peerjs";

const socket = io("http://localhost:5000");
export const CallContext = createContext();

export const CallProvider = ({ children }) => {
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [incomingCall, setIncomingCall] = useState(null);
  const [peer, setPeer] = useState(null);
  const myStream = useRef(null);

  useEffect(() => {
    const userId = localStorage.getItem("userId") || `user-${Math.random()}`;
    localStorage.setItem("userId", userId);

    socket.emit("user-online", userId);
    socket.on("update-online-users", (users) => setOnlineUsers(users));

    const peerInstance = new Peer();
    peerInstance.on("open", (id) => console.log("Peer connected:", id));
    setPeer(peerInstance);

    navigator.mediaDevices.getUserMedia({ audio: true }).then((stream) => {
      myStream.current = stream;
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const startCall = (receiverId) => {
    if (!peer || !myStream.current) return;
    const call = peer.call(receiverId, myStream.current);
    call.on("stream", (remoteStream) => {
      new Audio(remoteStream).play();
    });

    socket.emit("call-user", {
      callerId: localStorage.getItem("userId"),
      receiverId,
      signalData: peer.signalData,
    });
  };

  socket.on("incoming-call", ({ callerId, signalData }) => {
    setIncomingCall({ callerId, signalData });
  });

  const acceptCall = () => {
    if (!incomingCall || !peer || !myStream.current) return;
    const call = peer.answer(myStream.current);
    call.on("stream", (remoteStream) => {
      new Audio(remoteStream).play();
    });

    socket.emit("accept-call", {
      callerId: incomingCall.callerId,
      signalData: peer.signalData,
    });
  };

  return (
    <CallContext.Provider value={{ onlineUsers, startCall, incomingCall, acceptCall }}>
      {children}
    </CallContext.Provider>
  );
};
