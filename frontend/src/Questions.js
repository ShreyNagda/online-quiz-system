import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import { url } from "./global";
import { useEffect, useState } from "react";
import Button from "./components/Button";
import FilePicker from "./components/FilePicker";
function Questions() {
  const { state } = useLocation();
  const { name, code } = state;

  const [error, setError] = useState("");
  const [file, setFile] = useState(null);
  const [questions, setQuestions] = useState([]);

  const navigate = useNavigate();

  useEffect(() => {
    const handleBackNavigation = (ev) => {
      ev.preventDefault();
      navigate("/waiting", { state: state });
    };
    window.addEventListener("popstate", handleBackNavigation);
  }, [navigate, state]);

  function add_questions() {
    const formdata = new FormData();
    formdata.append("file", file);
    axios
      .post(`${url}/questions/${code}/addall`, formdata, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      })
      .then((res) => {
        if (res.data["error"]) {
          setError(res.data.error);
        } else {
          navigate("/waiting", {
            state: { code: code, name: name, player_id: null },
          });
        }
      });
  }
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-600 to-blue-200 text-white flex flex-col justify-center items-center gap-2 p-2">
      <div className="absolute top-10 text-2xl font-bold md:text-3xl lg:text-4xl">
        Add Questions
      </div>
      <div>{error}</div>
      <FilePicker
        onFileSelect={(_file) => {
          setFile(_file);
          const formdata = new FormData();
          formdata.append("file", _file);
          axios
            .post(`${url}/questions/${code}/preview`, formdata, {
              headers: { "Content-Type": "multipart/form-data" },
            })
            .then((res) => {
              setQuestions(res.data);
            });
        }}
      />
      {questions && (
        <div>
          {questions.map((question) => (
            <div key={question["qno"]} className="">
              <div className="text-lg font-bold">
                {question["question_no"]}. {question["text"]}
              </div>
              <div className="grid grid-cols-2">
                {question["options"].map((option) => {
                  return (
                    <div key={option}>
                      {String.fromCharCode(
                        question["options"].indexOf(option) + 97
                      )}
                      . {option}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
      <Button
        className={"mt-3"}
        text={"Add Questions"}
        onClickCallback={() => {
          add_questions();
        }}
      />
    </div>
  );
}
export default Questions;
