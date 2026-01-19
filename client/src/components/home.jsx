import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function HomeComponent(props) {
  const navigate = useNavigate();
  const [nameInput, setNameInput] = useState("");
  const [clients, setClients] = useState({});
  const [notification, setNotification] = useState("");
  const { socket, messages, clientsCount } = props;

  //je récupère la liste des joueurs connectés et signale si un nouveau client se connecte
  useEffect(() => {
    socket.on(messages.CLIENT_NAMES_MESSAGE, (clients_names) => {
      let oldCount = Object.values(clients).length;
      let newCount = Object.values(clients_names).length;
      
      if (newCount > oldCount && oldCount > 0) {
        setNotification("Nouveau joueur !");
        setTimeout(() => {
          setNotification("");
        }, 3000);
      }
      
      setClients(clients_names);
    });
  }, [socket, messages, clients]);

  //j'attends que quelqu'un lance la partie
  useEffect(() => {
    socket.on(messages.CLIENT_LAUNCHGAME_MESSAGE, () => {
      navigate("/questions");
    });
  }, [socket, messages, navigate]);

  //pseudo par défaut de l'API Kwizz si aucun pseudo n'est entré, sinon il est mis à jour
  const joinGame = () => {
      const playerName = nameInput.trim();
      sessionStorage.setItem(messages.CLIENT_NAMES_MESSAGE, playerName);
      socket.emit(messages.CLIENT_JOIN_MESSAGE, playerName);
  };

  //envoi au serveur du signal de lancement de la partie
  const launchGame = () => {
    socket.emit(messages.CLIENT_LAUNCHGAME_MESSAGE);
  };

  return (
    <div className="home-container container d-flex p-2 fw-bold">
      {notification && (
        <div className="alert alert-success position-fixed top-0 start-50 translate-middle-x mt-3" style={{ zIndex: 1000 }}>
          {notification}
        </div>
      )}
      
      <div className="bienvenue col-md-6 float-start">
        <h1>Bienvenue</h1>
        <p>Entrez votre pseudo</p>
        <input
          type="text"
          placeholder="xx_MichelDu64"
          className="col-md-8 m-2"
          value={nameInput}
          onChange={(e) => setNameInput(e.target.value)}
        />
        <button onClick={joinGame} className="col-md-4 m-2 ">
          Modifier le pseudo
        </button>
        <button onClick={launchGame} className="col-md-4 m-2">
          Lancer la partie
        </button>
      </div>

      <div className="clients col-md-6 float-end p-2 fw-bold border">
        <h1>Joueurs connectés : {clientsCount}</h1>
        <div className="liste container-fluid overflow-auto">
          <table id="clientsTable">
            <tbody>
              {
                Object.values(clients).map((name, index) => (
                  <tr key={index}>
                    <td>
                      <strong>{name}</strong>
                    </td>
                  </tr>
                ))
              }
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default HomeComponent;
