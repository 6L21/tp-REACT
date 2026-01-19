/**
 * Created by jgarcia on 26/11/2018.
 * Modified 26/11/2020
 * This modules contains function to process the questions and answers from clients
 */

//load questions file
let data = require('./questions.json');
let clients_data =  {};

//returns the list of questions and answers
let questions = function(){
    return data;
};

//returns the number of questions in the quiz
let questions_count = function(){
    return data.quiz.length;
};

//add a new client defined by its id (from socket.io)
let add_client = function(id){
    clients_data[id] = {};
};

//set the name of a client defined by its id (from socket.io)
let set_client_name = function (id, name){
    if(clients_data.hasOwnProperty(id)){
        clients_data[id].name = name;
    }else{
        console.error('client id ' + id, ' does not exists');
    }
};

// returns an array of clients names (if any)
let get_clients_names = function(){
    let reply = [];

    let keys = Object.keys(clients_data);
    let length = keys.length;
    let i;

    for(i = 0; i<length; i++) {
        let clientID = keys[i];
        let name = clients_data[clientID].name;
        if (name !== 'undefined') {
            reply.push(name);
        }
    }
    return reply;
};

//remove a client with its id (from socket.io)
let remove_client = function(id){
    delete clients_data[id];
};

//returns the number of connected clients (even those without a name)
let clients_count = function (){
    return Object.keys(clients_data).length;
};

// updates the data structure containing client options for each question.
// question must be 'q1', 'q2' or 'q3'
// option must be the complete text e.g. "Allemande" or "une couleur"
let update_client_answer = function(id, question, option){
    clients_data[id][question] = option;
};

let find_option_index = function(options, option) {
    let i;
    for (i = 0; i< options.length; i++){
        if(options[i] === option){
            return i;
        }
    }
    return undefined;
};

//returns an object with counts for each answer of each question
// example: { q1: [ 1, 2, 0 ], q2: [ 2, 0, 1 ], q3: [ 1, 0, 0 ] }
let get_answers_counts = function (){

    //Create the default reply
    let reply = {};
    let question_iter;
    for (question_iter = 0; question_iter < questions_count(); question_iter++){
        reply[data.quiz[question_iter].id] = [0,0,0];
    }

    let keys = Object.keys(clients_data);
    let length = keys.length;
    let client_iter;

    for(client_iter = 0; client_iter<length; client_iter++){
        let clientID = keys[client_iter];
        let answers = clients_data[clientID];

        for (question_iter = 0; question_iter < questions_count(); question_iter++){

            let question = data.quiz[question_iter];
            let id = question.id;
            if (answers.hasOwnProperty(id)){
                //find option id in the list of options and update the counter
                let option = answers[id];
                let option_index = find_option_index(question.options, option);
                if(option_index !== undefined){
                    reply[id][option_index]++;
                }
            }
        }
    }
    return reply;
};

//Nouvelle fonction pour le bonus des GIF en fonction de la place dans le classement
let get_scores = function() {
    let reply = [];
    let keys = Object.keys(clients_data);
    
    for (let i = 0; i < keys.length; i++) {
        let clientID = keys[i];
        let client = clients_data[clientID];
        let score = 0;
        
        // Parcourir toutes les questions
        for (let q = 0; q < data.quiz.length; q++) {
            let question = data.quiz[q];
            let id = question.id;
            
            // Si le client a répondu à cette question
            if (client.hasOwnProperty(id)) {
                // Si la réponse est correcte
                if (client[id] === question.answer) {
                    score++;
                }
            }
        }
        
        reply.push({
            name: client.name,
            score: score
        });
    }
    
    // Trier par score décroissant
    reply.sort(function(a, b) {
        return b.score - a.score;
    });
    
    return reply;
};

exports.questions = questions;
exports.find_option_index = find_option_index;
exports.add_client = add_client;
exports.remove_client = remove_client;
exports.set_client_name = set_client_name;
exports.get_clients_names = get_clients_names;
exports.update_client_answer = update_client_answer;
exports.clients_count = clients_count;
exports.get_answers_counts = get_answers_counts;
exports.get_scores = get_scores;