import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import { socket } from "./socket";
import SocketContext from "./socket-context";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import Host from "./Host";
import Waiting from "./Waiting";
import Questions from "./Questions";
import Quiz from "./Quiz";
import Leaderboard from "./Leaderboard";

const root = ReactDOM.createRoot(document.getElementById("root"));

root.render(
  <SocketContext.Provider value={socket}>
    <BrowserRouter>
      <Routes>
        <Route index element={<App />} />
        <Route path="/host" element={<Host />} />
        <Route path="/waiting" element={<Waiting />} />
        <Route path="/questions" element={<Questions />} />
        <Route path="/quiz" element={<Quiz />} />
        <Route path="/leaderboard" element={<Leaderboard />} />
      </Routes>
    </BrowserRouter>
  </SocketContext.Provider>
);
