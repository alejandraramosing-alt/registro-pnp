import "../styles/menuOpciones.css";

function MenuOpciones({ setPantalla }) {

  return (

    <div className="menu-container">

      <h1 className="menu-title">
        ¿Qué quieres hacer hoy?
      </h1>

      <div className="menu-cards">

        {/* 🟩 Registrar asistencia */}
        <div
          className="menu-card"
          onClick={() => setPantalla("registro")}
        >
          <h2>Registrar asistencia</h2>
          <p>Registrar asistencia diaria del personal</p>
        </div>

        {/* 🟨 Regularización */}
        <div
          className="menu-card"
          onClick={() => setPantalla("regularizacion")}
        >
          <h2>Regularizar fecha de servicio</h2>
          <p>Registrar asistencia de una fecha anterior</p>
        </div>

        {/* 🟦 Horas extras */}
        <div
          className="menu-card"
          onClick={() => setPantalla("horasExtras")}
        >
          <h2>Agregar horas extras</h2>
          <p>Registrar horas adicionales del personal</p>
        </div>

      </div>

    </div>

  );
}

export default MenuOpciones;