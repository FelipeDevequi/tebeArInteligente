import { useState, useEffect } from "react";
import axios from "axios";
import "./App.css";

function App() {
  const API_KEY = "8mX7gZlFBm0bJ7jjhjg8atBpr5eGql72xYvIMpT4";

  const [spots, setSpots] = useState([]);
  const [selectedSpotId, setSelectedSpotId] = useState("");
  const [spotData, setSpotData] = useState(null);
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchSpots = async () => {
      try {
        setLoading(true);
        const res = await axios.get("https://api.iotebe.com/v2/spot", {
          headers: { "x-api-key": API_KEY },
        });
        setSpots(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchSpots();
  }, []);

  const fetchSpotData = async () => {
    if (!selectedSpotId) return;
    try {
      setLoading(true);
      const res = await axios.get(
        `https://api.iotebe.com/v2/spot/${selectedSpotId}/ng1vt/global_data/data`,
        { headers: { "x-api-key": API_KEY } }
      );
      
      const data = res.data.map((item) => ({
        time: new Date(item.timestamp).toLocaleTimeString(),
        temp: item.temperature,
        velAxial: item.velocity_axial,
        velHorizontal: item.velocity_horizontal,
        velVertical: item.velocity_vertical,
      }));

      setSpotData(res.data[0]);
      setChartData(data.reverse().slice(0, 10)); // Últimos 10 pontos
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const infoItems = spotData
    ? [
        { label: "🌡️ Temperatura", value: `${spotData.temperature} °C` },
        { label: "📈 Aceleração Axial", value: spotData.acceleration_axial },
        { label: "📉 Aceleração Horizontal", value: spotData.acceleration_horizontal },
        { label: "📊 Aceleração Vertical", value: spotData.acceleration_vertical },
        { label: "⚙️ Velocidade Axial", value: spotData.velocity_axial },
        { label: "💨 Velocidade Horizontal", value: spotData.velocity_horizontal },
        { label: "🌀 Velocidade Vertical", value: spotData.velocity_vertical },
      ]
    : [];

  return (
    <div className="App">
      <h1>Monitoramento Ar -Tebe</h1>

      {loading && <p className="loading">Carregando...</p>}

      {spots.length > 0 && (
        <div className="select-container">
          <select value={selectedSpotId} onChange={(e) => setSelectedSpotId(e.target.value)}>
            <option value="">Selecione um ponto de coleta</option>
            {spots.map((spot) => (
              <option key={spot.spot_id} value={spot.spot_id}>
                {spot.spot_name}
              </option>
            ))}
          </select>
          {selectedSpotId && <button onClick={fetchSpotData}>Atualizar</button>}
        </div>
      )}

      {spotData && (
        <div className="card">
          <h2>📍 {spotData.spot_name || "Ponto selecionado"}</h2>
          <p className="time">{new Date(spotData.timestamp).toLocaleString()}</p>
          <div className="info">
            {infoItems.map((item, idx) => (
              <div key={idx}>
                <h3>{item.label}</h3>
                <p>{item.value}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
