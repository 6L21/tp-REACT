import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function QuestionsComponent(props) {
  const { questions, socket, messages, clientsCount } = props;
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [answersStats, setAnswersStats] = useState({});
  const navigate = useNavigate();
  
  const handleClick = (q, opt) => {
    console.log("Question : " + q.id);
    console.log("Réponse : " + opt);
    //j'envoie la réponse au serveur
    socket.emit(messages.CLIENT_ANSWERS_MESSAGE, {
      questionID: q.id,
      answer: opt,
    });
    let newAnswers = { ...selectedAnswers, [q.id]: opt };
    setSelectedAnswers(newAnswers);
  };

  //ici je récupère les autres réponses des joueurs
  useEffect(() => {
    socket.on(messages.CLIENT_ANSWERS_MESSAGE, (stats) => {
      setAnswersStats(stats);
    });
  }, [socket, messages]);

  //J'attends de recevoir le signal de fin de jeu du serveur
  useEffect(() => {
    socket.on(messages.GAME_END, () => {
      navigate("/results");
    });
  }, [socket, navigate]);

  return (
    <div className="container questions overflow-auto p-2 fw-bold">
      <h1>Joueurs connectés : {clientsCount}</h1>

      <h2>Questions</h2>

      {questions.map((q) => {
        let totalVotes = 0;
        if (answersStats[q.id]) {
          for (let i = 0; i < answersStats[q.id].length; i++) {
            totalVotes += answersStats[q.id][i];
          }
        }

        const everyoneAnswered =
          totalVotes === clientsCount && clientsCount > 0;

        return (
          <div key={q.id} className="question-block border p-2 mb-3">
            <div className="question">
              <h3 id="question_title">
                {q.id} : {q.question}
              </h3>
              <br />

              {q.options.map((opt, index) => {
                //on compte le nombre de vote pour chaque réponse 
                const voteCount = answersStats[q.id]
                  ? answersStats[q.id][index]
                  : 0;
                
                //est ce que le joueur à sélectionné cette réponse ? 
                const isSelected = selectedAnswers[q.id] === opt;

                //est ce que cette réponse est la bonne réposnse ? 
                const isCorrect = opt === q.answer;

                //tant que personne n'as répondu on affiche ? 
                let displayText = "?";
                if (totalVotes > 0) {
                  // et on affiche le nombre de vote pour la réponse 
                  displayText = voteCount + "/" + clientsCount;
                }

                let colorClass = "";
                // on affiche en vert ou rouge si tout le monde a répondu
                if (everyoneAnswered) {
                  if (isCorrect) {
                    colorClass = "text-success";
                  } else {
                    colorClass = "text-danger";
                  }
                }

                return (
                  <div key={q.id + "_" + opt}>
                    <div className="option-row d-flex align-items-center">
                      <span className={"vote-counter me-2 " + colorClass}>
                        {displayText}
                      </span>

                      <div className="form-check">
                        <input
                          className="form-check-input"
                          type="radio"
                          name={q.id}
                          id={opt}
                          checked={isSelected}
                          disabled={everyoneAnswered}
                          onChange={() => handleClick(q, opt)}
                        />
                        <label
                          className="form-check-label"
                          htmlFor={opt}
                        >
                          {opt}
                        </label>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
export default QuestionsComponent;
