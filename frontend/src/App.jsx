import "./App.css";
import { useEffect, useState } from "react";
import axios from "axios";

function App() {
  const [trainerData, setTrainerData] = useState(null);
  const [idDiscord, setIdDiscord] = useState("");

  const getPokemon = async (id) => {
    const config = {
      headers: {
        "X-API-KEY": import.meta.env.VITE_API_KEY,
      },
    };

    try {
      const response = await axios.get(
        `${
          import.meta.env.VITE_BACKEND_URL ?? "http://localhost:5000"
        }/pokemon/trainer/${id}/regular`,
        config
      );
      setTrainerData(response.data);
    } catch (error) {
      console.error("Failed to fetch data:", error);
    }
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    getPokemon(idDiscord);
  };

  useEffect(() => {
    console.log(trainerData);
  }, [trainerData]);

  return (
    <div className="App">
      <form onSubmit={handleSubmit}>
        <label htmlFor="idDiscord">Id Discord</label>
        <input
          type="text"
          id="idDiscord"
          name="idDiscord"
          value={idDiscord}
          onChange={(e) => setIdDiscord(e.target.value)}
        />
        <button type="submit">Valider</button>
      </form>

      {trainerData && (
        <div>
          <h2>Pokemons :</h2>
          <p>Nombre de pokemons: {trainerData.sumPokemon}</p>
          <p>Nombre de pokémons différents: {trainerData.countPokemon}</p>
          <ul>
            {trainerData.pokemon.map((poke) => (
              <li key={poke.id}>{poke.name}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default App;
