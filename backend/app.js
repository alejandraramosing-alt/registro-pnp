const express = require("express");
const cors = require("cors");
const axios = require("axios");

const app = express();
const ExcelJS = require("exceljs");
const PDFDocument = require("pdfkit");
const { Pool } = require("pg");
const XLSX = require("xlsx");
const fileUpload = require("express-fileupload");

app.use(fileUpload());




app.post("/api/programacion/validar", async (req, res) => {
  try {

    const file = req.files?.file;

if (!file) {
  return res.status(400).json({
    error: "No se envió archivo"
  });
}




    const workbook = XLSX.read(file.data);
    const sheet = workbook.Sheets[workbook.SheetNames[0]];

    const data = XLSX.utils.sheet_to_json(sheet);

    const errores = [];
    const datosLimpios = [];

    data.forEach((row, index) => {

      const fila = index + 3; // por encabezado

      // 🔹 VALIDACIONES
      if (!row["DNI"]) {
        errores.push(`Fila ${fila}: DNI vacío`);
      }

      if (!row["APELLIDOS Y NOMBRES"]) {
        errores.push(`Fila ${fila}: Nombre vacío`);
      }

      if (!row["FECHA INICIO"] || !row["FECHA TERMINO"]) {
        errores.push(`Fila ${fila}: Fechas incompletas`);
      }

      // 🔹 VALIDAR FORMATO FECHA
      const validarFecha = (f) => /^\d{2}\/\d{2}\/\d{4}$/.test(f);

      if (row["FECHA INICIO"] && !validarFecha(row["FECHA INICIO"])) {
        errores.push(`Fila ${fila}: Fecha inicio inválida`);
      }

      if (row["FECHA TERMINO"] && !validarFecha(row["FECHA TERMINO"])) {
        errores.push(`Fila ${fila}: Fecha término inválida`);
      }

      // 🔹 SEPARAR NOMBRE
      const separado = separarNombre(row["APELLIDOS Y NOMBRES"]);

const limpio = {
  dni: row["DNI"],
  grado: row["GRADO"],
  nombre_completo: row["APELLIDOS Y NOMBRES"],

  apellido_paterno: separado.apellido_paterno,
  apellido_materno: separado.apellido_materno,
  nombres: separado.nombres,

  cip: row["CIP"],
  codofin: row["CODOFIN"],
  turno: row["TURNO"],
  puesto: row["PUESTO"],
  fecha_inicio: formatearFecha(row["FECHA INICIO"]),
  fecha_fin: formatearFecha(row["FECHA TERMINO"]),
  celular: row["CELULAR"]
};


      datosLimpios.push(limpio);
    });

    if (errores.length > 0) {
      return res.json({
        ok: false,
        errores
      });
    }

    res.json({
      ok: true,
      data: datosLimpios
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error validando Excel" });
  }
});


const separarNombre = (nombreCompleto) => {

  if (!nombreCompleto) {
    return {
      apellido_paterno: "",
      apellido_materno: "",
      nombres: ""
    };
  }

  nombreCompleto = nombreCompleto.replace(/,/g, " ");
  const partes = nombreCompleto.trim().split(/\s+/);

  if (partes.length === 1) {
    return { apellido_paterno: partes[0], apellido_materno: "", nombres: "" };
  }

  if (partes.length === 2) {
    return { apellido_paterno: partes[0], apellido_materno: "", nombres: partes[1] };
  }

  if (partes.length === 3) {
    return { apellido_paterno: partes[0], apellido_materno: partes[1], nombres: partes[2] };
  }

  return {
    apellido_paterno: partes[0],
    apellido_materno: partes[1],
    nombres: partes.slice(2).join(" ")
  };
};




const formatearFecha = (fecha) => {
  if (!fecha) return null;

  // Si Excel manda número (formato serial)
  if (typeof fecha === "number") {
    const date = new Date((fecha - 25569) * 86400 * 1000);
    return date.toISOString().split("T")[0];
  }

  // Si viene como "31/03/2026"
  if (typeof fecha === "string" && fecha.includes("/")) {
    const [d, m, y] = fecha.split("/");
    return `${y}-${m}-${d}`;
  }

  return fecha;
};



const pool = new Pool({
  connectionString: process.env.DATABASE_URL || "postgresql://TU_URL_COMPLETA",
  ssl: {
    rejectUnauthorized: false
  }
});

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






app.post("/api/programacion/cargar", async (req, res) => {
  try {

    const file = req.files?.archivo;

    if (!file) {
      return res.status(400).json({ error: "No se envió archivo" });
    }

    const workbook = XLSX.read(file.data);
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const data = XLSX.utils.sheet_to_json(sheet);

    for (const row of data) {

      const nombreCompleto = row["APELLIDOS Y NOMBRES"] || "";
      const separado = separarNombre(row["APELLIDOS Y NOMBRES"]);

await pool.query(`
  INSERT INTO programacion (
    dni, grado, nombres, apellido_paterno, apellido_materno,
    cip, codofin, turno, puesto,
    fecha_inicio, fecha_fin, celular
  )
  VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)
`, [
  row["DNI"],
  row["GRADO"],
  separado.nombres,
  separado.apellido_paterno,
  separado.apellido_materno,
  row["CIP"],
  row["CODOFIN"],
  row["TURNO"],
  row["PUESTO"],
  formatearFecha(row["FECHA INICIO"]),
  formatearFecha(row["FECHA TERMINO"]),
  row["CELULAR"]
]);
    }

    res.json({ mensaje: "Programación cargada correctamente" });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error cargando programación" });
  }
});




app.put("/api/programacion/actualizar/:id", async (req, res) => {
  try {

    const { id } = req.params;
    const data = req.body;

    await pool.query(`
      UPDATE programacion SET
        dni = $1,
        grado = $2,
        apellido_paterno = $3,
        apellido_materno = $4,
        nombres = $5,
        cip = $6,
        codofin = $7,
        turno = $8,
        puesto = $9,
        fecha_inicio = $10,
        fecha_fin = $11,
        celular = $12
      WHERE id = $13
    `, [
      data.dni,
      data.grado,
      data.apellido_paterno,
      data.apellido_materno,
      data.nombres,
      data.cip,
      data.codofin,
      data.turno,
      data.puesto,
      data.fecha_inicio,
      data.fecha_fin,
      data.celular,
      id
    ]);

    res.json({ mensaje: "Actualizado correctamente" });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error actualizando" });
  }
});









app.get("/api/programacion/listar", async (req, res) => {
  try {

    const result = await pool.query(`
      SELECT *
      FROM programacion
      ORDER BY fecha_inicio DESC
      LIMIT 200
    `);

    res.json(result.rows);

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error obteniendo programación" });
  }
});


app.post("/api/asistencia/registrar", async (req, res) => {
  try {

    const datos = req.body;

    // 🔥 1. TRAER CONFIGURACIÓN
    const configResult = await pool.query(
      "SELECT * FROM configuracion LIMIT 1"
    );

    const config = configResult.rows[0];

    const pagoHoraPolicia = Number(config.pago_hora_policia);
    const pagoHoraEstado = Number(config.pago_hora_estado);
    const refrigerioUnitario = Number(config.refrigerio_por_servicio);

    // 🔥 2. CÁLCULOS
    const cantidadServicios = datos.servicios.length;
    const totalRefrigerio = cantidadServicios * refrigerioUnitario;
    const esJefe = datos.jefeGrupo === "SI";

    const horas = (cantidadServicios * 8) + (esJefe ? cantidadServicios : 0);
    const dias = horas / 8;

    const refrigerio = cantidadServicios * refrigerioUnitario;
    const pagoPolicia = horas * pagoHoraPolicia;
    const pagoEstado = horas * pagoHoraEstado;

    // 🔥 3. INSERT
    const query = `
      INSERT INTO asistencias (
        dni,
        grado,
        nombres,
        apellido_paterno,
        apellido_materno,
        cip,
        codofin,
        celular,
        puesto,
        servicios,
        jefe_grupo,
        fecha,
        horas_trabajadas,
        dias_trabajados,
        pago_policia,
        pago_estado,
        firma,
        tipo_registro,
        cantidad_servicios,
refrigerio_unitario,
total_refrigerio
      )
      VALUES (
        $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,
        CURRENT_DATE,
        $12,$13,$14,$15,$16,$17,$18,$19,$20
      )
      RETURNING *;
    `;

    const values = [
      datos.dni,
      datos.grado,
      datos.nombres,
      datos.apellido_paterno,
      datos.apellido_materno,
      datos.cip,
      datos.codofin,
      datos.celular,
      datos.puesto,
      datos.servicios.join(","), // 🔥 clave
      datos.jefeGrupo,
      horas,
      dias,
      pagoPolicia,
      pagoEstado,
      datos.firma,
      "ASISTENCIA",
      cantidadServicios,
  refrigerioUnitario,
  totalRefrigerio
    ];

    const result = await pool.query(query, values);

    res.json({
      mensaje: "Asistencia registrada",
      data: result.rows[0]
    });

  } catch (error) {

    console.error("ERROR POSTGRES:", error);

    if (error.code === "23505") {
      return res.json({
        duplicado: true,
        mensaje: "Ya registró hoy"
      });
    }

    res.status(500).json({
      error: "Error registrando asistencia"
    });
  }
});





app.get("/api/programacion/ultima-actualizacion", async (req, res) => {
  try {

    const result = await pool.query(`
      SELECT MAX(created_at) as ultima
      FROM programacion
    `);

    res.json({
      ultima: result.rows[0].ultima
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: "Error obteniendo última actualización"
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

    // 🔥 CONFIG
    const configResult = await pool.query("SELECT * FROM configuracion LIMIT 1");
    const config = configResult.rows[0];

    const pagoHoraPolicia = Number(config.pago_hora_policia);
    const pagoHoraEstado = Number(config.pago_hora_estado);
    const refrigerioUnitario = Number(config.refrigerio_por_servicio);

    // 🔥 CÁLCULOS
    const cantidadServicios = datos.servicios.length;

    const horas = cantidadServicios * 8;
    const dias = horas / 8;

    const refrigerio = cantidadServicios * refrigerioUnitario;
    const pagoPolicia = horas * pagoHoraPolicia;
    const pagoEstado = horas * pagoHoraEstado;

    // 🔥 INSERT
    const query = `
      INSERT INTO asistencias (
        dni, grado, nombres, apellido_paterno, apellido_materno,
        cip, codofin, celular, puesto,
        servicios, jefe_grupo,
        fecha,
        horas_trabajadas, dias_trabajados,
        pago_policia, pago_estado,
        tipo_registro
      )
      VALUES (
        $1,$2,$3,$4,$5,$6,$7,$8,$9,
        $10,'NO',
        $11,
        $12,$13,$14,$15,
        'REGULARIZACION'
      )
      RETURNING *;
    `;

    const values = [
      datos.dni,
      datos.grado,
      datos.nombres,
      datos.apellido_paterno,
      datos.apellido_materno,
      datos.cip,
      datos.codofin,
      datos.celular,
      datos.puesto,
      datos.servicios.join(","),
      datos.fecha_servicio,
      horas,
      dias,
      pagoPolicia,
      pagoEstado
    ];

    const result = await pool.query(query, values);

    res.json({
      mensaje: "Regularización registrada",
      data: result.rows[0]
    });

  } catch (error) {

    console.error("ERROR REGULARIZACION:", error);

    res.status(500).json({
      error: "Error registrando regularización"
    });
  }
});








app.post("/api/asistencia/registrarhoras", async (req, res) => {
  try {

    const datos = req.body;

    // 🔥 CONFIG
    const configResult = await pool.query("SELECT * FROM configuracion LIMIT 1");
    const config = configResult.rows[0];

    const pagoHoraPolicia = Number(config.pago_hora_policia);
    const pagoHoraEstado = Number(config.pago_hora_estado);

    // 🔥 CÁLCULOS
    const horas = Number(datos.horas_extras);
    const dias = horas / 8;

    const pagoPolicia = horas * pagoHoraPolicia;
    const pagoEstado = horas * pagoHoraEstado;

    // 🔥 INSERT
    const query = `
      INSERT INTO asistencias (
        dni, grado, nombres, apellido_paterno, apellido_materno,
        cip, codofin, celular, puesto,
        fecha,
        horas_trabajadas, dias_trabajados,
        pago_policia, pago_estado,
        tipo_registro
      )
      VALUES (
        $1,$2,$3,$4,$5,$6,$7,$8,$9,
        $10,
        $11,$12,$13,$14,
        'HORAS_EXTRAS'
      )
      RETURNING *;
    `;

    const values = [
      datos.dni,
      datos.grado,
      datos.nombres,
      datos.apellido_paterno,
      datos.apellido_materno,
      datos.cip,
      datos.codofin,
      datos.celular,
      datos.puesto,
      datos.fecha_servicio,
      horas,
      dias,
      pagoPolicia,
      pagoEstado
    ];

    const result = await pool.query(query, values);

    res.json({
      mensaje: "Horas extras registradas",
      data: result.rows[0]
    });

  } catch (error) {

    console.error("ERROR HORAS:", error);

    res.status(500).json({
      error: "Error registrando horas extras"
    });
  }
});




























app.post("/api/reporte/mensual", async (req, res) => {
  try {

    const { mes, anio, dni, nombre, jefeGrupo } = req.body;

    let query = `
      SELECT 
        dni,
        grado,
        apellido_paterno,
        apellido_materno,
        nombres,
        cip,
        codofin,

        SUM(dias_trabajados) as dias_totales,
        SUM(horas_trabajadas) as horas_totales,
        SUM(pago_policia) as monto,
        SUM(pago_estado) as pago_estado

      FROM asistencias
      WHERE EXTRACT(MONTH FROM fecha) = $1
      AND EXTRACT(YEAR FROM fecha) = $2
    `;

    const values = [mes, anio];
    let index = 3;

    // 🔍 FILTROS DINÁMICOS

    if (dni) {
      query += ` AND CAST(dni AS TEXT) LIKE $${index++}`;
      values.push(`%${dni}%`);
    }

    if (nombre) {
      query += ` AND LOWER(nombres) LIKE $${index++}`;
      values.push(`%${nombre.toLowerCase()}%`);
    }

    if (jefeGrupo) {
      query += ` AND jefe_grupo = $${index++}`;
      values.push(jefeGrupo);
    }

    query += `
      GROUP BY 
        dni, grado, apellido_paterno, apellido_materno,
        nombres, cip, codofin
      ORDER BY nombres ASC
    `;

    const result = await pool.query(query, values);

    res.json(result.rows);

  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: "Error generando reporte"
    });
  }
});






app.post("/api/asistencia/eliminar-masivo", async (req, res) => {
  try {

    const { ids } = req.body;

    await pool.query(`
      DELETE FROM asistencias
      WHERE id = ANY($1)
    `, [ids]);

    res.json({ mensaje: "Registros eliminados" });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: "Error eliminando registros"
    });
  }
});




      



app.post("/api/asistencia/historial", async (req, res) => {
  try {

    const { fechaInicio, fechaFin, dni, nombre, servicio, jefeGrupo } = req.body;

    let query = `
      SELECT id, *
      FROM asistencias
      WHERE 1=1
    `;

    const values = [];
    let index = 1;

    if (fechaInicio) {
      query += ` AND fecha >= $${index++}`;
      values.push(fechaInicio);
    }

    if (fechaFin) {
      query += ` AND fecha <= $${index++}`;
      values.push(fechaFin);
    }

    if (dni) {
      query += ` AND CAST(dni AS TEXT) LIKE $${index++}`;
      values.push(`%${dni}%`);
    }

    if (nombre) {
      query += ` AND LOWER(nombres) LIKE $${index++}`;
      values.push(`%${nombre.toLowerCase()}%`);
    }

    if (servicio) {
      query += ` AND LOWER(servicios) LIKE $${index++}`;
      values.push(`%${servicio.toLowerCase()}%`);
    }

    if (jefeGrupo) {
      query += ` AND jefe_grupo = $${index++}`;
      values.push(jefeGrupo);
    }

    query += ` ORDER BY fecha DESC`;

    const result = await pool.query(query, values);

    res.json(result.rows);

  } catch (error) {

    console.error("ERROR HISTORIAL:", error);

    res.status(500).json({
      error: "Error obteniendo historial"
    });
  }
});







app.post("/api/declaracion-individual", async (req, res) => {

  try {

    const { dni, fecha } = req.body;

    // 🔹 1. TRAER DATOS DESDE TU BD (NO SOLO POWER AUTOMATE)
    const result = await pool.query(`
      SELECT *
      FROM asistencias
      WHERE dni = $1 AND fecha = $2
      LIMIT 1
    `, [dni, fecha]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Registro no encontrado" });
    }

    const r = result.rows[0];

    const monto = Number(r.total_refrigerio || 0);
    const montoTexto = `S/ ${Number(monto).toFixed(2)}`;


    // 🔹 4. CREAR PDF
    const doc = new PDFDocument({ margin: 50 });

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=declaracion_${dni}.pdf`
    );

    doc.pipe(res);

    // ===============================
    // 🟦 TÍTULO
    // ===============================

    doc.fontSize(16).text(
      "RECIBO DE DINERO",
      { align: "center" }
    );

    doc.moveDown(2);

    const nombreCompleto =
      `${r.apellido_paterno} ${r.apellido_materno}, ${r.nombres}`;

    // ===============================
    // 🟩 CUERPO
    // ===============================

    doc.fontSize(12).text(
      `Yo, ${nombreCompleto}, identificado(a) con DNI Nº ${r.dni}, ` +
      `CIP Nº ${r.cip}, CODOFIN ${r.codofin} y GRADO: ${r.grado}, ` +
      `declaro haber recibido de Gas Natural de Lima y Callao S.A. ` +
      `la suma de ${montoTexto} soles, ` +
      `por concepto de merienda, conforme al Convenio de Colaboración Interinstitucional.`,
      { align: "justify" }
    );

    // 🔹 JEFE DE GRUPO
    if (r.jefe_grupo === "SI") {
      doc.moveDown();
      doc.text(
        "Asimismo, declaro haber ejercido funciones como jefe de grupo durante el servicio.",
        { align: "justify" }
      );
    }

    doc.moveDown(2);

    doc.text(
      "Firmo la presente declaración en señal de conformidad.",
      { align: "justify" }
    );

    // ===============================
    // ✍️ FIRMA
    // ===============================

    doc.moveDown(2);

    if (r.firma) {

  try {

    // 🔥 quitar encabezado base64
    const base64Data = r.firma.replace(/^data:image\/\w+;base64,/, "");

    const firmaBuffer = Buffer.from(base64Data, "base64");

    const firmaWidth = 220;
    const x = (doc.page.width - firmaWidth) / 2;

    doc.image(firmaBuffer, x, doc.y, {
      width: firmaWidth
    });

    doc.moveDown(5);

  } catch (e) {
    console.error("Error cargando firma:", e);
  }

}

    // ===============================
    // 🧾 PIE
    // ===============================

    doc.text(
      "______________________________",
      { align: "center" }
    );

    doc.moveDown(2);

    doc.text(nombreCompleto, { align: "center" });
    doc.text(`DNI Nº ${r.dni}`, { align: "center" });
    doc.text(`FECHA: ${r.fecha}`, { align: "center" });

    doc.end();

  } catch (error) {

    console.error(error);

    res.status(500).json({
      error: "Error generando declaración"
    });

  }

});









app.get("/api/programacion/buscar/:dni", async (req, res) => {
  try {

    const { dni } = req.params;

    const result = await pool.query(`
      SELECT *
      FROM programacion
      WHERE dni = $1
      ORDER BY fecha_inicio DESC
      LIMIT 1
    `, [dni]);

    if (result.rows.length === 0) {
      return res.json(null);
    }

    res.json(result.rows[0]);

  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: "Error buscando en programación"
    });
  }
});



const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
});