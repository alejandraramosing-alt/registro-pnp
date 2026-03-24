const express = require("express");
const cors = require("cors");
const axios = require("axios");

const app = express();
const ExcelJS = require("exceljs");
const PDFDocument = require("pdfkit");

app.use(cors());
app.use(express.json());

const FLOW_URL = "https://default176980b70c474b61853d7f53d2d72a.8d.environment.api.powerplatform.com:443/powerautomate/automations/direct/workflows/c8071441cf004557a005ea4c45d06268/triggers/manual/paths/invoke?api-version=1&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=S6VFj3pw2f4MJl8nh7iqSCvsue52TlJjuox0l2PgTIo";

/* API PRINCIPAL */
app.post("/api/policia/buscar", async (req, res) => {

  const { dni } = req.body;

  console.log("DNI recibido:", dni);

  try {

    const response = await axios.post(FLOW_URL, {
      dni: Number(dni)
    });

    res.json(response.data);

  } catch (error) {

    console.error(error);

    res.status(500).json({
      error: "Error consultando Power Automate"
    });

  }

});

app.get("/", (req, res) => {
  res.send("API Registro PNP funcionando");
});

app.post("/api/asistencia/registrar", async (req, res) => {

  try {

    const datos = req.body;

    const response = await axios.post(
      "https://default176980b70c474b61853d7f53d2d72a.8d.environment.api.powerplatform.com:443/powerautomate/automations/direct/workflows/ba64a6062f094921bbe804955b5eb0a9/triggers/manual/paths/invoke?api-version=1&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=8ZCW10uulVv5yn7fBZXs5X4hVJKNxZRGTZ9jE8OxNNs",
      datos,
      {
        validateStatus: () => true   // 🔥 CLAVE
      }
    );

    console.log("Status flujo:", response.status);
    console.log("Respuesta flujo:", response.data);

    // ✔ Siempre responder éxito al frontend
    res.json({
      duplicado: false,
      mensaje: "Asistencia registrada"
    });

  } catch (error) {

    console.error("Error real:", error);

    res.status(500).json({
      error: "Error registrando asistencia"
    });

  }

});
      
 













// ======================================
// REGULARIZACIÓN DE FECHA (SIN FIRMA)
// MISMA HOJA DE ASISTENCIA
// ======================================

app.post("/api/regularizacion/registrar", async (req, res) => {

  try {

    const datos = req.body;

    console.log("=== REGULARIZACION RECIBIDA ===");
    console.log(datos);
    console.log("===============================");

    const response = await axios.post(
      "https://default176980b70c474b61853d7f53d2d72a.8d.environment.api.powerplatform.com:443/powerautomate/automations/direct/workflows/796e430d8eab4572b26dca173463b21e/triggers/manual/paths/invoke?api-version=1&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=lYK-EenaEUcgCQ4pxUjOSiQ_5w3D9I6QM9HLZigX24c",
      datos,
      {
        validateStatus: () => true
      }
    );

    console.log("Status flujo regularización:", response.status);
    console.log("Respuesta flujo:", response.data);

    res.json({
      mensaje: "Regularización registrada correctamente"
    });

  } catch (error) {

    console.error("Error regularización:", error);

    res.status(500).json({
      error: "Error registrando regularización"
    });

  }

});



app.post("/api/asistencia/registrarhoras", async (req, res) => {

  try {

    const datos = req.body;
    console.log("=== DNI RECIBIDO ===");
   console.log(typeof datos.dni, datos.dni);
   console.log("====================");

    const response = await axios.post(
      "https://default176980b70c474b61853d7f53d2d72a.8d.environment.api.powerplatform.com:443/powerautomate/automations/direct/workflows/c2fd51ee2bcf4a56ba2194c1ff045833/triggers/manual/paths/invoke?api-version=1&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=dNAtF76qnLpPpR6Q6QaRbqfdkThlKtGSadAyM8WFPSI",
      datos
    );

    res.json({
      mensaje: "Asistencia registrada",
      data: response.data
    });

  } catch (error) {

    console.error(error);

    res.status(500).json({
      error: "Error registrando asistencia"
    });

  }

});



























app.post("/api/reporte/mensual", async (req, res) => {

  try {

    const { mes, anio, dni, nombre, fecha, jefeGrupo } = req.body;

    const response = await axios.post(
      "https://default176980b70c474b61853d7f53d2d72a.8d.environment.api.powerplatform.com:443/powerautomate/automations/direct/workflows/bf727203c40b4d4396659a1bc5c776de/triggers/manual/paths/invoke?api-version=1&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=ipNO1Y1dw0ZBs1PvH-wiRp53hWroWwaoJT6Bkidyvyc",
      {
  mes: Number(mes),
  anio: Number(anio),
  dni: dni || "",
  nombre: nombre || "",
  fecha: fecha || "",
  jefeGrupo: jefeGrupo || ""
}
    );


const registros = response.data;

const agrupado = {};

registros.forEach(r => {

  const dni = r["DNI"];

  if(!agrupado[dni]){
    agrupado[dni] = {
  grado: r["GRADO"],
  apellido_paterno: r["APELLIDO PATERNO"],
  apellido_materno: r["APELLIDO MATERNO"],
  nombres: r["NOMBRES"],
  cip: r["CIP"],
  dni: r["DNI"],
  codofin: r["CODOFIN"],

  // 🔥 CAMPOS PARA FILTROS
  jefe_grupo: r["JEFE DE GRUPO"],
  fecha: r["FECHA"],
  servicios: r["SERVICIOS"],

  dias_totales: 0,
  horas_totales: 0,
  monto: 0,
  pago_estado: 0  
};
  }

  agrupado[dni].dias_totales += Number(r["DIAS TRABAJADOS"] || 0);
  agrupado[dni].horas_totales += Number(r["HORAS TRABAJADAS"] || 0);
  agrupado[dni].monto = Number(
  (agrupado[dni].monto + Number(r["PAGO POLICIA"] || 0)).toFixed(2)
);
agrupado[dni].pago_estado += Number(r["PAGO ESTADO"] || 0);
});

const resultado = Object.values(agrupado);

res.json(resultado);


  } catch (error) {

    console.error(error);

    res.status(500).json({
      error: "Error obteniendo registros"
    });

  }

});




      

app.post("/api/asistencia/historial", async (req, res) => {

  try {

    const { fechaInicio, fechaFin, dni, nombre, servicio, jefeGrupo } = req.body;

    const response = await axios.post(
      "https://default176980b70c474b61853d7f53d2d72a.8d.environment.api.powerplatform.com:443/powerautomate/automations/direct/workflows/62009a9494a14a979e18c54e9969e499/triggers/manual/paths/invoke?api-version=1&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=iTLWVpXxHJktVlBxTkBSEwjGp63PTS3XS_Ni1CwJyxE",
      {
        fechaInicio,
        fechaFin,
        dni,
        nombre,
        servicio,
        jefeGrupo
      }
    );

    const datos = response.data;

    // 🔥 TRANSFORMACIÓN CLAVE
    const resultado = datos.map(r => ({
      fecha: r["FECHA DE SERVICIO"],
      dni: Number(r["DNI"]),
      grado: r["GRADO"],
      apellido_paterno: r["APELLIDO PATERNO"],
      apellido_materno: r["APELLIDO MATERNO"],
      nombres: r["NOMBRES"],
      servicios: r["SERVICIOS"],
      jefe_grupo: r["JEFE DE GRUPO"],
      horas_trabajadas: Number(r["HORAS TRABAJADAS"] || 0)  
    }));

    res.json(resultado);

  } catch (error) {

    console.error(error);

    res.status(500).json({
      error: "Error obteniendo historial"
    });

  }

});
;


app.post("/api/declaracion-individual", async (req, res) => {

  try {

    const { dni, fecha } = req.body;

    // 🔹 1. Llamar flujo Power Automate
    const response = await axios.post(
      "https://default176980b70c474b61853d7f53d2d72a.8d.environment.api.powerplatform.com:443/powerautomate/automations/direct/workflows/a1c26fda4f2f47269c60c0b39e7f84c0/triggers/manual/paths/invoke?api-version=1&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=sPpY3XPJq7GEsdG9QM-j2WL9larFWkXzaiU3T3Tmt8s",
      {
        dni: Number(dni),
        fecha
      }
    );

    const d = response.data;
    console.log(d)

    console.log("Datos recibidos:", d);

    // 🔹 2. Crear PDF
    const doc = new PDFDocument({ margin: 50 });

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=declaracion_${dni}.pdf`
    );

    doc.pipe(res);

    // ===============================
    // 🔵 AQUÍ VA EL TEXTO DEL DOCUMENTO
    // ===============================

    doc.fontSize(14).text(
      "RECIBO DE DINERO",
      { align: "center" }
    );

    doc.moveDown(2);

    const nombreCompleto =
      `${d.apellido_paterno} ${d.apellido_materno}, ${d.nombres}`;

    const jefeTexto =
      d.jefe === "SI"
        ? "Asimismo, declaro haber ejercido funciones como jefe de grupo durante el servicio."
        : "";

    doc.fontSize(12).text(
      `Yo, ${nombreCompleto}, identificado(a) con DNI Nº ${d.dni}, CIP Nº ${d.cip}, CODOFIN ${d.codofin} y GRADO: ${d.grado} ` +
      `he recibido de Gas Natural de Lima y Callao la cantidad de:   por concepto de merienda, estipulado en` +
      ` el numeral 4 del anexo 2 del Convenio Específico de Colaboración Interinstitucional entre la PNP  y Cálidda.`,
      { align: "justify" }
    );


    if (jefeTexto) {
      doc.moveDown();
      doc.text(jefeTexto, { align: "justify" });
    }

    doc.moveDown(2);

    doc.text(
      "Firmo la presente declaración en señal de conformidad.",
      { align: "justify" }
    );

// ===== INSERTAR FIRMA =====

doc.moveDown(2);   // 🔥 espacio antes de la firma

if (d.firmaBase64) {

  const firmaBuffer = Buffer.from(d.firmaBase64, "base64");

  const firmaWidth = 220;
  const x = (doc.page.width - firmaWidth) / 2;

  doc.image(firmaBuffer, x, doc.y, {
    width: firmaWidth
  });

   doc.moveDown(5);  
}

 

    doc.text(
      "______________________________",
      { align: "center" }
    );

    doc.moveDown(2);


    doc.text(
      nombreCompleto,
      { align: "center" }
    );

    doc.text(
      `DNI Nº ${d.dni}`,
      { align: "center" }
    );
    doc.text(
      `FECHA: ${d.fecha}`,
      { align: "center" }
    );

    // 🔹 Finalizar PDF
    doc.end();

  } catch (error) {

    console.error(error);

    res.status(500).json({
      error: "Error generando declaración"
    });

  }

});








const PORT = 3000;

app.listen(PORT, () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
});