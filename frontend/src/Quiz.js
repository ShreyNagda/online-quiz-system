import { useCallback, useEffect, useState } from "react";
import { url } from "./global";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import ThreeDots from "react-loading-icons/dist/esm/components/three-dots";
import { socket } from "./socket";
import Button from "./components/Button";

function Quiz() {
  const player_id = window.localStorage.getItem("player_id");
  const code = window.localStorage.getItem("code");

  const navigate = useNavigate();

  const initialTime = 10;
  const [seconds, setSeconds] = useState(initialTime);
  const [questions, setQuestions] = useState([]);
  const [error, setError] = useState("");
  const [index, setIndex] = useState(0);
  const [showAnswerScreen, setShowAnswerScreen] = useState(false);
  const [message, setMessage] = useState("");
  const [selectedOption, setSelectedOption] = useState(null);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const handleBackNavigation = (ev) => {
      ev.preventDefault();
      navigate("/quiz");
    };
    window.addEventListener("popstate", handleBackNavigation);
  }, [navigate]);

  useEffect(() => {
    console.log("Fetching data");
    console.log();
    axios
      .get(`${url}/questions/${window.localStorage.getItem("code")}`)
      .then((res) => {
        if (res.data["error"]) {
          setError(res.data.error);
        } else {
          setQuestions(res.data);
          console.log(res.data);
          setLoading(false);
        }
      });
  }, []);
  const incrementIndex = useCallback(() => {
    if (index >= questions.length - 1) {
      console.log("finished");
      axios.get(`${url}/rooms/${code}/finish`);
      navigate("/leaderboard", { state: { code: code } });
    } else {
      setIndex(index + 1);
    }
  }, [index, questions.length, navigate, code]);

  useEffect(() => {
    const interval = setInterval(() => {
      setSeconds((prevSeconds) => prevSeconds - 1);
    }, 1000);
    if (seconds === 0) {
      if (showAnswerScreen) {
        incrementIndex();
        setShowAnswerScreen(false);
      } else {
        setMessage("Not Attempted");
        setSelectedOption(null);
        setShowAnswerScreen(true);
      }
      if (index < questions.length) {
        setSeconds(initialTime);
      } else {
        clearInterval(interval);
        socket.send("finished");
        axios.get(`${url}/rooms/${code}/finish`);
        navigate("/leaderboard", { state: { code: code } });
      }
    }
    return () => clearInterval(interval);
  }, [
    seconds,
    showAnswerScreen,
    incrementIndex,
    initialTime,
    index,
    questions.length,
    navigate,
    code,
  ]);

  if (loading === true) {
    <ThreeDots />;
  }

  if (window.localStorage.getItem("isHost") === "true") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-600 to-blue-200 text-white flex items-center justify-center flex-col gap-2">
        <div className="text-2xl">Quiz is Started!</div>
        <Button
          text={"Go to Leaderboard"}
          onClickCallback={() => {
            axios
              .get(`${url}/rooms/${code}/state`)
              .then((res) => console.log(res.data));
          }}
        />
        <div className="text-red-400">{error}</div>
      </div>
    );
  }

  if (showAnswerScreen) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-600 to-blue-200 text-white flex items-center justify-center flex-col gap-2">
        <div>{message}</div>
        <div>Next Question in {seconds}</div>
      </div>
    );
  }
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-600 to-blue-200 text-white flex flex-col justify-center items-center gap-2 p-2">
      <div className="text-2xl">{seconds}</div>
      <div className="text-lg">
        {loading === false && questions[index]["text"]}
      </div>
      <div className="grid grid-cols-2 gap-10">
        {loading === false &&
          questions[index]["options"].map((option, index) => (
            <button
              onClick={(ev) => {
                setSelectedOption(ev.target.innerText.substring(3));
              }}
              className={`${
                option === selectedOption
                  ? "border-white"
                  : "border-transparent"
              } border-2 px-2 rounded flex`}
            >
              {String.fromCharCode(index + 65)}. {option}
            </button>
          ))}
      </div>
      <Button
        text={"Submit"}
        onClickCallback={() => {
          axios
            .post(`${url}/player/${player_id}/update`, {
              question: questions[index],
              time: seconds,
              option: selectedOption,
            })
            .then((res) => {
              setShowAnswerScreen(true);
              setSeconds(initialTime + seconds);
              setMessage(res.data);
              setSelectedOption(null);
            });
        }}
      />
    </div>
  );
}
export default Quiz;
