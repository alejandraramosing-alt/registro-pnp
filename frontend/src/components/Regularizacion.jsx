import { useState } from "react";
import axios from "axios";
import "../styles/registro.css";

function Regularizacion() {

  const [dni, setDni] = useState("");
  const [policia, setPolicia] = useState({});
  const [fecha, setFecha] = useState("");
  const [servicios, setServicios] = useState([]);
  const [mensaje, setMensaje] = useState("");

  // 🔎 Buscar policía
  const buscarPolicia = async () => {

    if (!dni) {
      alert("Ingrese un DNI");
      return;
    }

    try {
      const response = await axios.post(
        "http://192.168.1.118:3000/api/policia/buscar",
        { dni }
      );

      setPolicia(response.data);

    } catch {
      alert("NO SE ENCONTRO AL PERSONAL");
    }
  };

  // ✔ Manejo servicios (máx 2)
  const manejarServicio = (valor) => {

    if (servicios.includes(valor)) {
      setServicios(servicios.filter(s => s !== valor));
    } else {

      if (servicios.length >= 2) {
        alert("Solo puede seleccionar máximo 2 servicios");
        return;
      }

      setServicios([...servicios, valor]);
    }
  };

  // 📅 Registrar regularización
  const registrarRegularizacion = async () => {

    if (!policia?.nombres) {
      alert("Debe buscar un policía primero");
      return;
    }

    if (!fecha) {
      alert("Seleccione una fecha");
      return;
    }

    if (servicios.length === 0) {
      alert("Seleccione al menos un servicio");
      return;
    }

    const datos = {
      dni: Number(dni),

      grado: policia.grado,
      nombres: policia.nombres,
      apellido_paterno: policia.apellido_paterno,
      apellido_materno: policia.apellido_materno,
      cip: policia.cip,
      codofin: policia.codofin,
      celular: policia.celular,
      puesto: policia.puesto,

      fecha_servicio: fecha,
      servicios,
      tipoRegistro: "REGULARIZACION"
    };

    await axios.post(
      "http://192.168.1.118:3000/api/regularizacion/registrar",
      datos
    );

    setMensaje("Regularización registrada correctamente");

    setPolicia({});
    setDni([]);
    setFecha("");
    setServicios([]);
  };

  return (

<div className="registro-container">

  {/* PANEL IZQUIERDO */}
  <div className="registro-left">

    <h1 className="titulo-principal">
      Regularización de Fecha
    </h1>

    <input
      type="number"
      placeholder="Ingrese DNI"
      value={dni}
      onChange={(e)=>setDni(e.target.value)}
      className="input-dni"
    />

    <div className="dni-buttons">
      <button className="btn-buscar" onClick={buscarPolicia}>
        Buscar
      </button>
    </div>

  </div>

  {/* PANEL DERECHO */}
  <div className="registro-card">

    <h3 className="titulo-formulario">Datos</h3>

    <div className="form-grid">

      {[
        ["grado","GRADO"],
        ["nombres","NOMBRES"],
        ["apellido_paterno","APELLIDO PATERNO"],
        ["apellido_materno","APELLIDO MATERNO"],
        ["cip","CIP"],
        ["codofin","CODOFIN"],
        ["celular","CELULAR"],
        ["puesto","PUESTO"]
      ].map(([campo,label]) => (
        <div key={campo} className="campo">
          <p>{label}</p>
          <input
  type="text"
  value={policia?.[campo] || ""}
  onChange={(e)=>
    setPolicia({...policia, [campo]: e.target.value})
  }
/>
        </div>
      ))}

    </div>

    <hr />

    {/* FECHA */}
    <h3 className="titulo-formulario">Fecha del servicio</h3>

    <input
      type="date"
      value={fecha}
      onChange={(e)=>setFecha(e.target.value)}
    />

    <hr />

    {/* SERVICIO */}
    <h3 className="titulo-formulario">Servicio</h3>

    {["Mañana: 7am - 15pm","Tarde: 15pm - 23 pm","Noche: 23pm- 7am"].map(s => (

      <label key={s} className="servicio-item">
        <input
          type="checkbox"
          checked={servicios.includes(s)}
          onChange={()=>manejarServicio(s)}
        />
        {" "}Servicio {s}
      </label>

    ))}

    {servicios.length > 0 && (
      <p style={{
        marginTop: "10px",
        fontWeight: "bold",
        color: "#0a7cff"
      }}>
        Refrigerio estimado: S/ {servicios.length * 15}
      </p>
    )}

    <br />

    <div className="firma-botones">
      <button
        className="btn-registrar"
        onClick={registrarRegularizacion}
      >
        REGISTRAR
      </button>
    </div>

    {mensaje && <p>{mensaje}</p>}

  </div>

</div>

  );
}

export default Regularizacion;