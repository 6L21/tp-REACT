import "./App.css";
import QuestionsComponent from "./components/questions";
import HomeComponent from "./components/home";
import ResultsComponent from "./components/results";
import { Routes, Route } from "react-router-dom";
import React, { useState, useEffect } from "react";
import openSocket from "socket.io-client";

import "bootstrap/dist/css/bootstrap.css";

const ENDPOINT = "http://localhost:8080";
const socket = openSocket(ENDPOINT, { transports: ["websocket"] });

const MESSAGES = {
  QUIZ_MESSAGE: "quiz",
  CLIENT_NUMBER_MESSAGE: "num_of_clients",
  CLIENT_ANSWERS_MESSAGE: "clients_answers",
  CLIENT_NAMES_MESSAGE: "clients_names",
  CLIENT_LAUNCHGAME_MESSAGE: "clients_launchgame",
  CLIENT_JOIN_MESSAGE: "nouveau_client",
  CLIENT_QUIT_MESSAGE: "client_quit",
  CLIENT_SCORES_MESSAGE: "clients_scores",
  GET_SCORES_MESSAGE: "get_scores",
  GAME_END: "game_end",
};
/*
IMPORTANT : Renommer les clients pour profiter des gif de fin de partie
*/

function App() {
  const [questions, setQuestions] = useState([]);
  const [clients, setClients] = useState([]);

  useEffect(() => {
    socket.on(MESSAGES.QUIZ_MESSAGE, (data) => {
      setQuestions(data.quiz);
    });

    socket.on(MESSAGES.CLIENT_NAMES_MESSAGE, (clients_names) => {
      setClients(clients_names);
    });
  }, []);

  //compte du nombre de clients connectés envoyé en props aux composants
  const clientsCount = Object.values(clients).length;

  return (
    <div className="App h-100">
      <div className="container">
        <div className="row">
          <div className=" col header">
            <h1 className="display-1 fw-bold">Kwizzz</h1>
            <p className="display-5"> Interactive and Multi-User Quizz.</p>
          </div>
        </div>
      </div>

      <Routes>
        <Route
          exact
          path="/"
          element={
            <HomeComponent
              socket={socket}
              messages={MESSAGES}
              clientsCount={clientsCount}
            />
          }
        />
        <Route
          path="/questions"
          element={
            <QuestionsComponent
              questions={questions}
              socket={socket}
              messages={MESSAGES}
              clientsCount={clientsCount}
            />
          }
        />
        <Route
          path="/results"
          element={
            <ResultsComponent
              socket={socket}
              messages={MESSAGES}
            />
          }
        />
      </Routes>

      <div className="container-fluid">
        <div className="row">
          <footer id="site-footer">
            <p>Copyright &copy;KWIZZZ 2022</p>
          </footer>
        </div>
      </div>
    </div>
  );
}

export default App;
