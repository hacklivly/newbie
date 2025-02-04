import { useContext } from "react";
import { CallContext } from "../context/CallContext";

function Home() {
  const { onlineUsers, startCall, incomingCall, acceptCall } = useContext(CallContext);

  return (
    <div className="p-10">
      <h1 className="text-3xl font-bold">Airtalk Clone</h1>

      {incomingCall && (
        <div>
          <p>Incoming call from {incomingCall.callerId}</p>
          <button onClick={acceptCall} className="bg-green-500 p-2 text-white">Accept</button>
        </div>
      )}

      <h2 className="text-xl mt-5">Online Users:</h2>
      {onlineUsers.map((user) => (
        <button key={user} onClick={() => startCall(user)} className="block p-2 bg-blue-500 text-white mt-2">
          Call {user}
        </button>
      ))}
    </div>
  );
}

export default Home;
