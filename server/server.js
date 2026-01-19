/**
 * Created by Jérémie on 01/12/2017.
 * Updated by Jérémie Garcia on  07/12/2021 - added documentation and functions
 * Updated by Jérémie Garcia on  04/12/2022 - more docs
 */

const fs = require("fs");
const path = require("path");
const express = require("express");
const kwiz = require("./kwiz_module/kwiz_module");

//make the server and the socketsio
const app = express();
const server = require("http").createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);

//server static file in the public directory
app.use(express.static(path.join(__dirname, "../client/build")));

const QUIZ_MESSAGE = "quiz";
const GET_SCORES_MESSAGE = "get_scores";
const CLIENT_NUMBER_MESSAGE = "num_of_clients";
const CLIENT_ANSWERS_MESSAGE = "clients_answers";
const CLIENT_NAMES_MESSAGE = "clients_names";
const CLIENT_LAUNCHGAME_MESSAGE = "clients_launchgame";
const CLIENT_JOIN_MESSAGE = "nouveau_client";
const CLIENT_SCORES_MESSAGE = "clients_scores";

const GAME_END = "game_end";

// Quand un client se connecte, on le note dans la console
io.on("connection", function (socket) {
  console.log("client connecté", socket.id);
  let clientID = socket.id;

  updateClientsCounter();

  //add client to the list
  kwiz.add_client(clientID);

  //Create a random user name and define it
  let rand = Math.random();
  let name = "name_" + rand;
  kwiz.set_client_name(clientID, name);

  sendNamesToClients();

  //Ajoute et partage le nom du nouveau client à tout les joueurs
  socket.on(CLIENT_JOIN_MESSAGE, (name) => {
    kwiz.set_client_name(clientID, name);
    sendNamesToClients();
    updateClientsCounter();
  });

  //lance la partie pour tous les clients
  socket.on(CLIENT_LAUNCHGAME_MESSAGE, () => {
    io.emit(CLIENT_LAUNCHGAME_MESSAGE);
  });

  //envoie le quiz au client qui vient de se connecter
  socket.emit(QUIZ_MESSAGE, kwiz.questions());

  //gère les réponses des clients et si la partie est finie
  socket.on(CLIENT_ANSWERS_MESSAGE, (answer) => {
    kwiz.update_client_answer(clientID, answer.questionID, answer.answer);
    sendAnswersToClients();

    let allFinished = checkIfGameFinished();
    if (allFinished) {
      io.emit(GAME_END);
    }
  });

  //sert à transmettre les scores pour le tableau des résultats
  socket.on(GET_SCORES_MESSAGE, () => {
    let scores = kwiz.get_scores();
    socket.emit(CLIENT_SCORES_MESSAGE, scores);
  });
});

//send to all clients the current number of connected clients
function updateClientsCounter() {
  let nb = kwiz.clients_count();
  io.emit(CLIENT_NUMBER_MESSAGE, nb);
}

//send to all client the current answers
function sendAnswersToClients() {
  let reply = kwiz.get_answers_counts();
  io.emit(CLIENT_ANSWERS_MESSAGE, reply);
}

//send to all client the current clients Names
function sendNamesToClients() {
  let reply = kwiz.get_clients_names();
  io.emit(CLIENT_NAMES_MESSAGE, reply);
}

function checkIfGameFinished() {
  let totalClients = kwiz.clients_count();
  
  let answersCount = kwiz.get_answers_counts();
  
  // Oncompte  le nombre total de réponses
  for (let qId in answersCount) {
    let votes = answersCount[qId];
    let totalVotes = 0;
    for (let i = 0; i < votes.length; i++) {
      totalVotes += votes[i];
    }
    
    // Si il manque des réponses, le jeu n'est pas fini
    if (totalVotes < totalClients) {
      return false;
    }
  }
  
  return true;
}

server.listen(8080);
