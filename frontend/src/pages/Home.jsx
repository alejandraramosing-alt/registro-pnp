function Home() {
  return (
    <div style={styles.fondo}>

      {/* CONTENIDO CENTRADO */}
      <div style={styles.contenido}>

        <h1 style={styles.titulo}>
          Registro y Control de Servicios Policiales Extraordinarios
        </h1>

        <p style={styles.subtitulo}>
          Sistema de asistencia del personal PNP — Cálidda
        </p>

        <div style={styles.logos}>

          <img
            src="/logo-calidda.png"
            alt="Cálidda"
            style={{ height: 60 }}
          />

          <span style={styles.separador}>•</span>

          <img
            src="/logo-pnp.png"
            alt="PNP"
            style={{ height: 60 }}
          />

        </div>

      </div>

    </div>
  );
}

export default Home;

const styles = {

  /* FONDO A PANTALLA COMPLETA */
  fondo: {
    position: "fixed",      // 🔥 ocupa toda la pantalla
    top: 0,
    left: 0,
    width: "100vw",
    height: "100vh",

    backgroundImage: "url('/inicio.png')",
    backgroundSize: "cover",      // 🔥 LLENA TODA LA PANTALLA
    backgroundPosition: "center",
    backgroundRepeat: "no-repeat",

    zIndex: 0
  },

   /* CONTENIDO ENCIMA */
  contenido: {
    position: "relative",
    zIndex: 1,
    textAlign: "center",
    marginTop: "270px",
    color: "#1f3a5f"
  },

 

  titulo: {
    fontSize: "42px",
    fontWeight: 600,
    color: "#1f3a5f",
    lineHeight: 1.2
  },

  subtitulo: {
    fontSize: "20px",
    color: "#6b7280",
    marginTop: "12px"
  },

  logos: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    marginTop: "20px",
    gap: "12px"
  },

  separador: {
    fontSize: "26px",
    color: "#9ca3af"
  }

};