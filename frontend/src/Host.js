import { useNavigate } from "react-router-dom";
import Button from "./components/Button";
import Input from "./components/Input";
import { useContext, useReducer, useState } from "react";
import axios from "axios";
import { url } from "./global";
import SocketContext from "./socket-context";

function Host() {
  const navigate = useNavigate();

  const [roomName, setRoomName] = useState("");
  const [roomCode, setRoomCode] = useState("");
  const [error, setError] = useState();

  const socket = useContext(SocketContext);

  const [state, dispatch] = useReducer(
    (state, action) => {
      switch (action.type) {
        case "INC":
          return { max_players: state.max_players + 1 };
        case "DEC":
          if (state.max_players <= 2) {
            return state;
          }
          return { max_players: state.max_players - 1 };
        default:
          return state;
      }
    },
    { max_players: 5 }
  );
  function generateCode() {
    const chars = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    let code = "";
    for (let i = 0; i < 4; i++) {
      code += chars.charAt(Math.random() * chars.length);
    }
    setRoomCode(code);
  }

  function host_room() {
    if (roomName === "") {
      setError("Enter room name");
    } else if (roomCode === "") {
      setError("Enter room code or click generate");
    } else {
      axios
        .post(`${url}/rooms/create`, {
          room_name: roomName,
          room_code: roomCode,
          max_players: state.max_players,
        })
        .then((res) => {
          if (res.data["error"]) {
            setError(res.data.error);
          } else {
            socket.emit("join", { name: "host", room: roomCode });
            navigate("/questions", {
              state: { code: roomCode, name: "host" },
            });
          }
        });
    }
  }
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-600 to-blue-200 text-white flex flex-col justify-center items-center gap-2">
      <Button
        text={"X"}
        onClickCallback={() => {
          navigate(-1);
        }}
        className={" absolute top-5 left-5 "}
      />
      <div className="flex flex-col w-4/5 md:w-2/3 justify-center items-center gap-2">
        <div className={`text-red-500 h-6`}>{error}</div>
        <Input
          placeholder={"Enter Room name"}
          value={roomName}
          callback={(ev) => setRoomName(ev.target.value)}
          onFocusCallback={() => setError("")}
        />
        <div className="flex w-full gap-3">
          <Input
            placeholder={"Enter Room code"}
            callback={(ev) => setRoomCode(ev.target.value)}
            value={roomCode}
            onFocusCallback={() => setError("")}
          />
          <Button text={"Generate"} onClickCallback={() => generateCode()} />
        </div>
        <div className="px-2 pl-3 rounded bg-white text-black w-full flex justify-between items-center">
          <div>Max Participants</div>
          <div>
            <Button
              text={"-"}
              onClickCallback={() => {
                dispatch({ type: "DEC" });
              }}
              className={" py-0 text-lg font-bold"}
            />
            {state.max_players}
            <Button
              text={"+"}
              onClickCallback={() => {
                dispatch({ type: "INC" });
              }}
              className={" py-0 text-lg font-bold"}
            />
          </div>
        </div>
        <Button text={"Host Room"} onClickCallback={() => host_room()} />
      </div>
    </div>
  );
}

export default Host;
