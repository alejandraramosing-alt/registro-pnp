import { useState } from "react";
import axios from "axios";
import "../styles/registro.css";

function HorasExtras() {

  const [dni, setDni] = useState("");
  const [policia, setPolicia] = useState({});
  const [horasExtras, setHorasExtras] = useState(1);
  const [mensaje, setMensaje] = useState("");
  const [fecha, setFecha] = useState("");

  // 🔎 Buscar policía


  const buscarPolicia = async () => {

  if (!dni) {
    alert("Ingrese un DNI");
    return;
  }

  try {

    const res = await axios.get(
      `http://192.168.1.137:3000/api/programacion/buscar/${dni}`
    );

    if (!res.data) {
      alert("No existe en la programación");
      setPolicia({});
      return;
    }

    setPolicia(res.data);

  } catch (error) {

    console.error(error);
    alert("Error consultando base de datos");

  }
};
  







  // 📅 Registrar horas extras
  const registrarHorasExtras = async () => {

    if (!policia?.nombres) {
      alert("Debe buscar un policía primero");
      return;
    }

    if (!fecha) {
      alert("Seleccione la fecha de la actividad");
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
      horas_extras: horasExtras,

      tipoRegistro: "HORAS_EXTRAS"
    };

    try {

      await axios.post(
        "http://192.168.1.137:3000/api/asistencia/registrarhoras",
        datos
      );

      setMensaje("Horas extras registradas correctamente");

      setPolicia({});
      setDni("");
      setHorasExtras(1);
      setFecha("");

    } catch (error) {

      console.error(error);
      alert("Error registrando horas extras");

    }
  };





  















  return (

<div className="registro-container">

  {/* 🟦 PANEL IZQUIERDO */}
  <div className="registro-left">

    <h1 className="titulo-principal">
      Registro de Horas Extras
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

  {/* 🟩 PANEL DERECHO */}
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

    {/* 📅 FECHA */}
    <h3 className="titulo-formulario">
      Fecha de la actividad
    </h3>

    <input
      type="date"
      value={fecha}
      onChange={(e)=>setFecha(e.target.value)}
    />

    <hr />

    {/* ⏱ HORAS */}
    <h3 className="titulo-formulario">
      Seleccione las horas extras
    </h3>

    <div style={{
      display:"grid",
      gridTemplateColumns:"repeat(3,1fr)",
      gap:"12px",
      marginBottom:"20px"
    }}>
      {[1,2,3,4,5,6,7,8].map(h => (
        <button
          key={h}
          onClick={()=>setHorasExtras(h)}
          style={{
            height:"55px",
            fontSize:"20px",
            fontWeight:"bold",
            borderRadius:"12px",
            border:"none",
            cursor:"pointer",
            background: horasExtras === h ? "#1e90ff" : "#e6e6e6",
            color: horasExtras === h ? "white" : "#333"
          }}
        >
          {h}h
        </button>
      ))}
    </div>

    <p style={{ fontWeight:"bold", color:"#0a7cff" }}>
      Horas seleccionadas: {horasExtras}
    </p>

    <br />

    <div className="firma-botones">
      <button
        className="btn-registrar"
        onClick={registrarHorasExtras}
      >
        REGISTRAR
      </button>
    </div>

    {mensaje && <p>{mensaje}</p>}

  </div>

</div>

  );
}

export default HorasExtras;