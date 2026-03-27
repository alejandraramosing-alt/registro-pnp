import { useState, useRef } from "react";
import axios from "axios";
import SignatureCanvas from "react-signature-canvas";
import "../styles/registro.css";

function RegistroPNP() {

  const [dni, setDni] = useState("");
  const [policia, setPolicia] = useState({});
  const [servicios, setServicios] = useState([]);
  const [jefeGrupo, setJefeGrupo] = useState(false);
  const [mensaje, setMensaje] = useState("");
  // ===== HORAS EXTRAS =====

  const sigCanvas = useRef();

  const buscarPolicia = async () => {
  try {

    // 🔥 1. BUSCAR EN TU BD
    const resDB = await axios.get(
      `http://192.168.1.137:3000/api/programacion/buscar/${dni}`
    );

    if (resDB.data) {
      setPolicia(resDB.data);
      return;
    }

    // 🔥 2. SI NO EXISTE → POWER AUTOMATE
    const response = await axios.post(
      "http://192.168.1.137:3000/api/policia/buscar",
      { dni: dni }
    );

    setPolicia(response.data);

  } catch (error) {
    console.error(error);
    alert("No se encontró el personal");
  }
};

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

  const registrarAsistencia = async () => {

    if(!policia){
      alert("Debe buscar un policía primero");
      return;
    }

    if(servicios.length === 0){
      alert("Seleccione al menos un servicio");
      return;
    }

    if(sigCanvas.current.isEmpty()){
      alert("Debe firmar antes de registrar");
      return;
    }

    const firma = sigCanvas.current.toDataURL();

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
      servicios: servicios,
      jefeGrupo: jefeGrupo ? "SI" : "NO",
      firma: firma
    };

    try{

      await axios.post(
        "http://192.168.1.137:3000/api/asistencia/registrar",
        datos
      );

      setMensaje("Registro realizado correctamente");
      setPolicia(null);
      setDni("");
      setServicios([]);
      setJefeGrupo(false);
      sigCanvas.current.clear();

      setTimeout(()=>{
        setMensaje("");
      },3000);

    }catch(error){
  console.log("ERROR REAL:", error);
  alert("Error registrando asistencia");
}

  };




  return (

<div className="registro-container">

  {/* 🟦 PANEL IZQUIERDO */}
 <div className="registro-left">

    <h1 className="titulo-principal">
      Registro de Asistencia PNP
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

  {/* 🟩 PANEL DERECHO — FORMULARIO */}
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
          style={{ width: "100%", padding: 8 }}
        />
      </div>
    ))}
     </div>

    <hr />

    <h3 className="titulo-formulario">Servicio</h3>

    {["Mañana: 7am - 15pm","Tarde: 15pm - 23 pm","Noche: 23pm- 7am"].map(s => (

      <label key={s} className="servicio-item">
        <input
          type="checkbox"
          checked={servicios.includes(s)}
          onChange={() => manejarServicio(s)}
        />
        {" "}Serv. {s}
        <br />
      </label>
    ))}

    {/* 💰 TEXTO DE REFRIGERIO */}
{servicios.length > 0 && (
  <p style={{
    marginTop: "10px",
    fontWeight: "bold",
    color: "#0a7cff"
  }}>
    Refrigerio: S/ {servicios.length * 15}
  </p>
)}

    <br />

    <label className="servicio-item">
      <input
        type="checkbox"
        checked={jefeGrupo}
        onChange={(e)=>setJefeGrupo(e.target.checked)}
      />
      {" "}Soy jefe de grupo
    </label>

    <br /><br />

    <h3 className="titulo-formulario">Firma</h3>

    <SignatureCanvas
      ref={sigCanvas}
      penColor="black"
      canvasProps={{
        width: 490,
        height: 200,
        style:{border:"1px solid black"}
      }}
    />

    <br />



  <div className="firma-botones">

  <button
    className="btn-limpiar"
    onClick={()=>sigCanvas.current.clear()}
  >
    LIMPIAR FIRMA
  </button>

  <button
    className="btn-registrar"
    onClick={registrarAsistencia}
  >
    REGISTRAR
  </button>

</div>
</div>

</div>



);
}

export default RegistroPNP;