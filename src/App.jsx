import { useState, useEffect } from "react";
import axios from "axios";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
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

      // Assume que a API retorna um array de leituras
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
      <h1>🌐 Monitoramento IoTebe</h1>

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
          {selectedSpotId && <button onClick={fetchSpotData}>🔄 Atualizar</button>}
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

          {chartData.length > 0 && (
            <div className="chart-container">
              <h3>📊 Variação de Dados</h3>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,229,255,0.2)" />
                  <XAxis dataKey="time" stroke="#7ee7ff" />
                  <YAxis stroke="#7ee7ff" />
                  <Tooltip contentStyle={{ background: "#0d1b2a", border: "1px solid #00e5ff" }} />
                  <Legend />
                  <Line type="monotone" dataKey="temp" stroke="#00e5ff" name="Temperatura" />
                  <Line type="monotone" dataKey="velAxial" stroke="#ff6b6b" name="Vel. Axial" />
                  <Line type="monotone" dataKey="velHorizontal" stroke="#00ff9d" name="Vel. Horizontal" />
                  <Line type="monotone" dataKey="velVertical" stroke="#ffa600" name="Vel. Vertical" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default App;
