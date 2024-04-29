import axios from "axios";
import { useContext, useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { url } from "./global";

// import { TailSpin } from "react-loader-spinner";
// import { Bars } from "react-loading-icons";
import Button from "./components/Button";
// import Circles from "react-loading-icons/dist/esm/components/circles";
import ThreeDots from "react-loading-icons/dist/esm/components/three-dots";
// import SpinningCircles from "react-loading-icons/dist/esm/components/spinning-circles";
import SocketContext from "./socket-context";

function Waiting() {
  const navigate = useNavigate();
  const { state } = useLocation();
  const { code, name, player_id } = state;

  const [room, setRoom] = useState({});

  const [players, setPlayers] = useState([]);

  const socket = useContext(SocketContext);

  const isHost = name === "host";
  useEffect(() => {
    const handleBackNavigation = (ev) => {
      ev.preventDefault();
      navigate("/waiting", { state: state });
    };
    window.addEventListener("popstate", handleBackNavigation);
  }, [navigate, state]);
  console.log(isHost);
  useEffect(() => {
    socket.on("message", function (data) {
      console.log(data);
      if (data.includes("joined")) {
        console.log("New Participant");
        axios.get(`${url}/player/getall/${code}`).then((res) => {
          if (res.data["error"]) {
            console.log(res.data.error);
          } else {
            setPlayers(res.data);
          }
        });
      }
      if (data.includes("start")) {
        console.log("Start");
        window.localStorage.setItem("code", code);
        window.localStorage.setItem("player_id", player_id);
        window.localStorage.setItem("isHost", isHost);
        navigate("/quiz");
      }
    });
  }, [socket, navigate, code, player_id, isHost]);

  useEffect(() => {
    axios.get(`${url}/rooms/${code}`).then((res) => {
      if (res.data["error"]) {
      } else {
        setRoom(res.data);
      }
    });
  }, [code]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-600 to-blue-200 text-white flex flex-col items-center gap-2 p-2">
      <div className="mt-2 text-2xl font-bold md:text-3xl lg:text-4xl">
        {room["room_name"]}
      </div>
      <div className="mt-2 text-lg font-bold md:text-xl lg:text-2xl">
        {room["room_code"]}
      </div>
      {name !== "host" || name === null ? (
        <>
          <div className="text-lg">Waiting for Host to start</div>
          <div>
            {players.map((player) => (
              <li>{player["player_name"]}</li>
            ))}
          </div>
        </>
      ) : (
        <div className="absolute top-1/2 flex flex-col gap-10 items-center">
          <ThreeDots color="#3f51bc" />
          <Button
            text={"Start Quiz"}
            onClickCallback={() => {
              socket.emit("start", { room: code });
              axios.get(`${url}/rooms/${code}/start`);
            }}
          />
        </div>
      )}
    </div>
  );
}

export default Waiting;
