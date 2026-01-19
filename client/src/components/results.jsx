import { useEffect, useState } from "react";

function ResultsComponent(props) {
  const { socket, messages } = props;
  const [scores, setScores] = useState([]);
  const [gif1, setGif1] = useState("");
  const [gif2, setGif2] = useState("");
  const [gif3, setGif3] = useState("");

  const apiKey = "CXkhRW3Q0TeTxmVTA7nAwobaKwkeQI5S";

  //récupération des gifs pour le podium
  useEffect(() => {
    fetch("https://api.giphy.com/v1/gifs/KZ9I2l0rT8LFMtwTJN?api_key=" + apiKey)
      .then((response) => response.json())
      .then((data) => {
        setGif1(data.data.images.original.url);
      });

    fetch("https://api.giphy.com/v1/gifs/rKBXZ6XsYnYLaKth5G?api_key=" + apiKey)
      .then((response) => response.json())
      .then((data) => {
        setGif2(data.data.images.original.url);
      });

    fetch("https://api.giphy.com/v1/gifs/QKbJ4MFtLDTNaxezaD?api_key=" + apiKey)
      .then((response) => response.json())
      .then((data) => {
        setGif3(data.data.images.original.url);
      });
  }, []);

  //récupération des scores
  useEffect(() => {
    socket.emit(messages.GET_SCORES_MESSAGE);

    socket.on(messages.CLIENT_SCORES_MESSAGE, (data) => {
      setScores(data);
    });
  }, [socket, messages]);

  const currentClientName = sessionStorage.getItem(
    messages.CLIENT_NAMES_MESSAGE
  );

  let currentClientRank = 0;
  let currentClientGif = "";

  //attribution du rang et du gif, ne fonctionne pas 
  // si les pseudo n'ont pas été modifiés
  for (let i = 0; i < scores.length; i++) {
    if (scores[i].name === currentClientName) {
      currentClientRank = i + 1;
      if (currentClientRank === 1) currentClientGif = gif1;
      if (currentClientRank === 2) currentClientGif = gif2;
      if (currentClientRank === 3) currentClientGif = gif3;
      break;
    }
  }

  //message personnalisé selon le rang
  let message = "";
  if (currentClientRank === 1) {
    message = "Bravo à " + currentClientName + " !";
  }
  if (currentClientRank === 2) {
    message = "Peut mieux faire " + currentClientName;
  }
  if (currentClientRank === 3) {
    message = "T'as même pas essayé " + currentClientName;
  }

  return (
    <div className="results container p-2 fw-bold border">
      <h2>Résultats</h2>

      <div className="row container-fluid">
        <div className="col-md-6 float-start">
          <table className="table table-striped">
            <thead>
              <tr>
                <th>Pseudo</th>
                <th>Score</th>
              </tr>
            </thead>
            <tbody>
              {scores.map((Client) => {
                return (
                  <tr key={Client.name}>
                    <td>{Client.name}</td>
                    <td>{Client.score}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          <h3>{message}</h3>
        </div>

        <div className="col-md-4 d-flex float-end">
          {
            <div>
              <img src={currentClientGif} alt={"Rang " + currentClientRank} />
            </div>
          }
        </div>
      </div>
    </div>
  );
}

export default ResultsComponent;
