import { useContext, useEffect, useState } from "react";
import SocketContext from "./socket-context";
import Button from "./components/Button";
import Input from "./components/Input";
import axios from "axios";
import { url } from "./global";
import { Link, useNavigate } from "react-router-dom";

function App() {
  const socket = useContext(SocketContext);

  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [room, setRoom] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const handleBackNavigation = (ev) => {
      ev.preventDefault();
      navigate("/");
    };
    window.addEventListener("popstate", handleBackNavigation);
  }, [navigate]);

  useEffect(() => {
    socket.connect();
    socket.on("disconnect", function () {
      console.log("disconnect");
    });
  }, [socket]);

  function join_room() {
    socket.connect();
    if (name === "") {
      setError("Enter nickname");
    } else if (room === "") {
      setError("Enter roomcode");
    } else {
      axios.get(`${url}/rooms/${room}`).then((res) => {
        if (res.data["error"]) {
          setError(res.data.error);
        } else {
          axios
            .post(`${url}/player/new`, { player_name: name, code: room })
            .then((res) => {
              if (res.data["error"]) {
                setError(res.data.error);
              } else {
                console.log(res.data.id);
                socket.emit("join", {
                  room: room,
                  name: name,
                });
                navigate("/waiting", {
                  state: { code: room, name: name, player_id: res.data.id },
                });
              }
            });
        }
      });
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-600 to-blue-200 text-white flex flex-col justify-center items-center gap-2">
      <div className="absolute top-10 text-2xl font-bold md:text-3xl lg:text-4xl">
        Quiz System
      </div>
      <div className="flex flex-col md:w-2/3 justify-center items-center gap-2 w-3/5">
        <div className={`text-red-500 h-6`}>{error}</div>
        <Input
          placeholder={"Enter Nickname"}
          callback={(ev) => setName(ev.target.value)}
          value={name}
          onFocusCallback={() => {
            setError("  ");
          }}
        />
        <Input
          placeholder={"Enter Roomcode"}
          callback={(ev) => setRoom(ev.target.value)}
          value={room}
          onFocusCallback={() => {
            setError("  ");
          }}
        />
        <div className="flex md:flex-row lg:flex-row gap-2">
          <Button
            text={"Join Room"}
            onClickCallback={() => {
              join_room();
            }}
          />
          <Link to={"/host"}>
            <Button text={"Host Room"} />
          </Link>
        </div>
      </div>
    </div>
  );
}

export default App;
