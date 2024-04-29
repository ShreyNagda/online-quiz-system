import axios from "axios";
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { url } from "./global";
import Button from "./components/Button";

function Leaderboard() {
  const { state } = useLocation();
  const { code } = state;
  const [players, setPlayers] = useState([]);

  const navigate = useNavigate();

  useEffect(() => {
    const handleBackNavigation = (ev) => {
      ev.preventDefault();
      navigate("/leaderboard", { state: state });
    };
    window.addEventListener("popstate", handleBackNavigation);
  }, [navigate, state]);

  useEffect(() => {
    axios.get(`${url}/player/leaderboard/${code}`).then((res) => {
      if (res.data["error"]) {
      } else {
        setPlayers(res.data);
        console.log(res.data);
      }
    });
  }, [code]);
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-600 to-blue-200 text-white flex flex-col items-center justify-center">
      <div>Finished</div>
      <div>
        {players.length > 0 &&
          players.map((player) => (
            <div>
              {player["player_name"]}
              {"\t\t"}
              {player["current_score"]}
            </div>
          ))}
      </div>
      <Button
        text={"Go To Homepage"}
        onClickCallback={() => {
          console.log("Go to Homepage");
          navigate("/");
        }}
      />
    </div>
  );
}

export default Leaderboard;
