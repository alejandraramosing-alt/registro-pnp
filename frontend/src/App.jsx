import { useState } from "react";
import { Layout, ConfigProvider } from "antd";
import esES from "antd/locale/es_ES";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import HistorialAsistencias from "./pages/HistorialAsistencias";
import ReporteMensual from "./pages/ReporteMensual";
import RegistroPNP from "./components/RegistroPNP";
import HorasExtras from "./components/HorasExtras";
import Regularizacion from "./components/Regularizacion";
import MenuOpciones from "./pages/MenuOpciones";
import "./styles/layout.css";
import CargaProgramacion from "./pages/CargaProgramacion";

const { Content } = Layout;

function App() {

  const [pantalla, setPantalla] = useState("cargaProgramacion");

  return (

     <ConfigProvider
    locale={esES}
    theme={{
      token: {
        colorPrimary: "#85d1ec" // cambia el azul
      }
    }}
  >

  
    <Layout style={{ minHeight:"100vh", width:"100%" }}>

      <Navbar pantalla={pantalla} setPantalla={setPantalla} />

      <Content
        style={{
          padding:"120px 20px 40px",
          marginTop:"0",
          minHeight:"100vh",
          background:"#ffffff",
          display:"flex",
          justifyContent:"center"
        }}
      >

        {/* ESTE DIV CENTRA TODO — NO QUITAR */}
        <div
          style={{
            width:"100%",
            maxWidth:"1200px",
            display:"flex",
            flexDirection:"column",
            alignItems:"center",
            minHeight:"100%"
          }}
        >
         
          {pantalla === "registro" && <RegistroPNP />}
          
          {pantalla === "horasExtras" && <HorasExtras />}
          {pantalla === "regularizacion" && <Regularizacion />}

          {pantalla === "home" && <Home />}
          {pantalla === "menu" && <MenuOpciones setPantalla={setPantalla} />}
          

          {pantalla === "historial" && <HistorialAsistencias />}

          {pantalla === "reporte" && <ReporteMensual />}
{pantalla === "cargaProgramacion" && <CargaProgramacion />}
        </div>

      </Content>

    </Layout>

  </ConfigProvider>

  );
}

export default App;