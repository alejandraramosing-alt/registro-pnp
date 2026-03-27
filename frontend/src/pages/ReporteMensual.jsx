import { useState, useMemo } from "react";
import {
  Table,
  Card,
  Row,
  Col,
  Input,
  Select,
  Button,
  Tooltip  
} from "antd";
import {
  SearchOutlined,
  ReloadOutlined,
  FileExcelOutlined
} from "@ant-design/icons";

import ExcelJS from "exceljs";
import { saveAs } from "file-saver";

function ReporteMensual() {

  // =============================
  // ESTADOS
  // =============================

  const [mes, setMes] = useState("03");
  const [anio, setAnio] = useState("2026");
  const [dni, setDni] = useState([]);
  const [nombre, setNombre] = useState("");
  const [fecha, setFecha] = useState("");
  const [jefeGrupo, setJefeGrupo] = useState("");

  const [reporte, setReporte] = useState([]);
  const [loading, setLoading] = useState(false);

  const nombresMes = {
    "01":"ENERO","02":"FEBRERO","03":"MARZO","04":"ABRIL",
    "05":"MAYO","06":"JUNIO","07":"JULIO","08":"AGOSTO",
    "09":"SEPTIEMBRE","10":"OCTUBRE","11":"NOVIEMBRE","12":"DICIEMBRE"
  };

  // =============================
  // BUSCAR
  // =============================

  const buscar = async () => {

    setLoading(true);

    const response = await fetch(
      "http://192.168.1.137:3000/api/reporte/mensual",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mes: Number(mes),
          anio: Number(anio),
          dni: Array.isArray(dni) ? dni.join(",") : dni,
          nombre,
          fecha,
          jefeGrupo
        })
      }
    );

    const data = await response.json();
    setReporte(Array.isArray(data) ? data : []);

    setLoading(false);
  };

  const limpiar = () => {
    setDni("");
    setNombre("");
    setFecha("");
    setJefeGrupo("");
    setReporte([]);
  };




const reporteFiltrado = useMemo(() => {

  return reporte.filter(r => {

    const cumpleDni =
      dni.length === 0 ||
      dni.includes(String(r.dni));

    const cumpleNombre =
      !nombre ||
      r.nombres?.toLowerCase().includes(nombre.toLowerCase());

    return cumpleDni && cumpleNombre;

  });

}, [reporte, dni, nombre]);








  // =============================
  // TOTALES
  // =============================

const totales = useMemo(() => {

  let dias = 0;
  let horas = 0;
  let monto = 0;

  reporteFiltrado.forEach(r => {
    dias += Number(r.dias_totales || 0);
    horas += Number(r.horas_totales || 0);
    monto += Number(r.monto || 0);
  });

  return { dias, horas, monto };

}, [reporteFiltrado]);




  // =============================
// CAJA CHICA — RESUMEN FINANCIERO
// =============================

const cajaChica = useMemo(() => {

  let totalFacturarConIGV = 0;

  reporteFiltrado.forEach(r => {
    totalFacturarConIGV += Number(r.pago_estado || 0);
  });

  const detraccion = totalFacturarConIGV * 0.12;
  const igv = totalFacturarConIGV * 0.18 / 1.18;
  const totalSinIGV = totalFacturarConIGV - igv;
  const depositoCuenta = totalFacturarConIGV - detraccion;

  return {
    totalFacturarConIGV,
    detraccion,
    igv,
    totalSinIGV,
    depositoCuenta
  };

}, [reporteFiltrado]);

  // =============================
  // EXCEL
  // =============================

const exportarExcel = async () => {

  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet("Reporte");

  // =============================
  // TITULO OFICIAL
  // =============================

  const titulo =
    "RELACIÓN NOMINAL DEL PERSONAL PNP, POR CONCEPTO DE PAGO DE PRESTACIÓN DE SERVICIO POLICIAL EXTRAORDINARIO CONVENIO DE COOPERACIÓN INTERINSTITUCIONAL ENTRE GAS NATURAL DE LIMA Y CALLAO S.A Y LA PNP, CORRESPONDIENTE AL MES DE "
    + nombresMes[mes] + " " + anio + ".";

  sheet.mergeCells("A1:O2");

  const titleCell = sheet.getCell("A1");

  titleCell.value = titulo;

  titleCell.alignment = {
    vertical: "middle",
    horizontal: "center",
    wrapText: true
  };

  titleCell.font = { bold: true, size: 12 };

  titleCell.fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "A9D08E" }
  };

  sheet.addRow([]);

  // =============================
  // ENCABEZADOS
  // =============================

  const headers = [
    "N°","GRADO","APELLIDOS PATERNO","APELLIDOS MATERNO",
    "NOMBRES","CIP","DNI","CODOFIN","AÑO","MES",
    "DIAS TOTALES","HORAS TOTALES","PAGO X HORA","MONTO","ENTIDAD"
  ];

  const headerRow = sheet.addRow(headers);

  headerRow.eachCell(cell => {
    cell.font = { bold: true };
    cell.alignment = { horizontal: "center", vertical: "middle" };

    cell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "A9D08E" }
    };

    cell.border = {
      top:{style:"thin"},
      left:{style:"thin"},
      bottom:{style:"thin"},
      right:{style:"thin"}
    };
  });

  // =============================
  // DATOS + TOTALES
  // =============================

  let totalDias = 0;
  let totalHoras = 0;
  let totalMonto = 0;

  reporte.forEach((r, i) => {

    const dias = Number(r.dias_totales || 0);
    const horas = Number(r.horas_totales || 0);
    const monto = Number(r.monto || 0);

    totalDias += dias;
    totalHoras += horas;
    totalMonto += monto;

    const row = sheet.addRow([
      i + 1,
      r.grado,
      r.apellido_paterno,
      r.apellido_materno,
      r.nombres,
      Number(r.cip),
      Number(r.dni),
      Number(r.codofin),
      Number(anio),
      nombresMes[mes],
      dias,
      horas,
      13.23,
      monto,
      "Gas Natural de Lima y Callao S.A"
    ]);

    row.getCell(13).numFmt = "0.00";
    row.getCell(14).numFmt = "#,##0.00";

    row.eachCell(cell => {
      cell.border = {
        top:{style:"thin"},
        left:{style:"thin"},
        bottom:{style:"thin"},
        right:{style:"thin"}
      };
    });

  });

  // =============================
  // FILA TOTAL OFICIAL
  // =============================

  const totalRow = sheet.addRow([
    "", "", "", "", "", "", "", "", "", "MONTO TOTAL",
    totalDias,
    totalHoras,
    "",
    totalMonto,
    ""
  ]);

  totalRow.font = { bold: true };

  totalRow.getCell(11).numFmt = "0";
  totalRow.getCell(12).numFmt = "0";
  totalRow.getCell(14).numFmt = "#,##0.00";

  totalRow.eachCell(cell => {
    cell.border = {
      top:{style:"thin"},
      left:{style:"thin"},
      bottom:{style:"thin"},
      right:{style:"thin"}
    };
  });

  // =============================
  // ANCHO COLUMNAS
  // =============================

  sheet.columns.forEach(column => {
    column.width = 18;
  });

  // =============================
  // DESCARGA
  // =============================

  const buffer = await workbook.xlsx.writeBuffer();

  saveAs(
    new Blob([buffer]),
    `Relacion_Nominal_PNP_${mes}_${anio}.xlsx`
  );

};
  

















  // =============================
  // COLUMNAS
  // =============================

  const columns = [

    {
      title:"Grado",
      dataIndex:"grado",
      sorter:(a,b)=>a.grado.localeCompare(b.grado)
    },

    {
      title:"Apellido paterno",
      dataIndex:"apellido_paterno"
    },

    {
      title:"Apellido materno",
      dataIndex:"apellido_materno"
    },

    {
      title:"Nombres",
      dataIndex:"nombres"
    },

    {
      title:"CIP",
      dataIndex:"cip"
    },

    {
      title:"DNI",
      dataIndex:"dni"
    },

    {
      title:"CODOFIN",
      dataIndex:"codofin"
    },

    {
      title:"Días",
      dataIndex:"dias_totales"
    },

    {
      title:"Horas",
      dataIndex:"horas_totales"
    },

    {
      title:"Monto",
      render:(_,r)=>`S/ ${Number(r.monto).toFixed(2)}`
    }

  ];

  // =============================
  // INTERFAZ
  // =============================



  const descripcionFiltro = useMemo(() => {

  const partes = [];

  // Mes y año (siempre)
  partes.push(`${nombresMes[mes]} ${anio}`);

  if (jefeGrupo === "SI")
    partes.push("Solo jefes de grupo");

  if (jefeGrupo === "NO")
    partes.push("Sin jefes de grupo");

  if (dni.length > 0)
  partes.push(`DNI: ${dni.join(", ")}`);

  if (nombre)
    partes.push(`Nombre: ${nombre}`);

  if (fecha)
    partes.push(`Fecha: ${fecha}`);

  return partes.join(" — ");

}, [mes, anio, dni, nombre, fecha, jefeGrupo]);






  return (

<div style={{
  height: "100vh",
  display: "flex",
  flexDirection: "column",
  padding: 50
}}>

  {/* PANEL FILTROS */}
  <div
  style={{
    background: "#fff",
    marginTop:"50px"
  }}
>

<Card title="REPORTE MENSUAL DE SERVICIOS">

  <Row gutter={16} align="middle">

    <Col span={3}>
      <Select
        value={mes}
        onChange={setMes}
        options={Object.entries(nombresMes).map(([k,v])=>({
          value:k,label:v
        }))}
      />
    </Col>

    <Col span={3}>
      <Input
        placeholder="Año"
        value={anio}
        onChange={e=>setAnio(e.target.value)}
      />
    </Col>

<Col span={3}>
  <Select
    mode="tags"
    style={{ width: "100%" }}
    placeholder="DNI (puede ingresar varios)"
    value={dni}
    onChange={setDni}
  />
</Col>

    <Col span={5}>
      <Input
        placeholder="Nombre"
        value={nombre}
        onChange={e=>setNombre(e.target.value)}
      />
    </Col>

    <Col span={3}>
      <Select
        value={jefeGrupo}
        onChange={setJefeGrupo}
        options={[
          { value:"",label:"Jefe" },
          { value:"SI",label:"SI" },
          { value:"NO",label:"NO" }
        ]}
      />
    </Col>

    <Col span={4}>
      <div style={{ display:"flex", gap:8 }}>

        <Button
          type="primary"
          icon={<SearchOutlined />}
          onClick={buscar}
        />

        <Button
          icon={<ReloadOutlined />}
          onClick={limpiar}
        />

        <Button
          icon={<FileExcelOutlined />}
          onClick={exportarExcel}
        />

      </div>
    </Col>

  </Row>

</Card>

  </div>

  {/* TABLA */}
  {/* CONTENIDO DESPLAZABLE */}

<div style={{
  flex: 1,

  marginTop: 1,
}}>
  <Table
    columns={columns}
    dataSource={reporteFiltrado}
    loading={loading}
    rowKey={(r,i)=>i}

    pagination={{
      pageSize:8,
      showTotal:(total,range)=>
        `${range[0]}-${range[1]} de ${total} registros`
    }}
  />

  {/* TOTALES */}
  <div style={{
    marginTop:10,
    textAlign:"right",
    fontWeight:"bold"
  }}>
    TOTAL — Días: {totales.dias} | Horas: {totales.horas} | Monto: S/ {totales.monto.toFixed(2)}
  </div>

</div>
<Card
  bordered={false}
  style={{
    borderRadius: 18,
    marginTop: 24,
    background: "#fff"
  }}
  title={
    <div style={{ textAlign: "center" }}>

      <div style={{
        fontSize: 26,
        fontWeight: 700,
        color: "#2F6B4F",
        letterSpacing: 1
      }}>
        RESUMEN FINANCIERO — CAJA CHICA
      </div>

      <div style={{
        fontSize: 16,
        color: "#777",
        marginTop: 6
      }}>
        {descripcionFiltro}
      </div>

      <div style={{
        marginTop: 6,
        color: "#999",
        fontSize: 13
      }}>
        Valores calculados según los filtros aplicados
      </div>

    </div>
  }
>
<Row gutter={[24, 24]} justify="center">

  {/* ===== TOTAL FACTURAR ===== */}
  <Col xs={24} sm={12} md={8} lg={5}>
    <Tooltip title="Suma de todos los pagos al Estado del mes">

      <div style={{
        height: 220,
        borderRadius: 20,
        overflow: "hidden",
        background: "#EEF3F4",
        textAlign: "center",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between"
      }}>

        <div style={{ paddingTop: 22 }}>
          <img src="/facturar.png" style={{ width: 48, alignItems: "center" }} />
          <div style={{
            fontSize: 18,
            fontWeight: 500,
            color: "#3C5A5A",
            marginTop: 10
          }}>
            Total facturar
          </div>
        </div>

        <div style={{
          background: "#1FA6A6",
          padding: "18px 12px",
          color: "#fff"
        }}>
          <div style={{ fontSize: 30, fontWeight: 700 }}>
            S/ {cajaChica.totalFacturarConIGV.toFixed(2)}
          </div>
          <div style={{ fontSize: 14, opacity: 0.9 }}>
            Con IGV
          </div>
        </div>

      </div>

    </Tooltip>
  </Col>


  {/* ===== DEPÓSITO A CUENTA ===== */}
  <Col xs={24} sm={12} md={8} lg={5}>
    <Tooltip title="Total facturar con IGV − Detracción">

      <div style={{
        height: 220,
        borderRadius: 20,
        background: "#1F6F4A",
        textAlign: "center",
        color: "#fff",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center"
      }}>

        <div style={{
  display: "flex",
  justifyContent: "center",
  alignItems: "center"
}}>
  <img src="/deposito.png" style={{ width: 48 }} />
</div>

        <div style={{
          fontSize: 18,
          fontWeight: 600,
          marginBottom: 12
        }}>
          Depósito a cuenta
        </div>

        <div style={{
          fontSize: 32,
          fontWeight: 800
        }}>
          S/ {cajaChica.depositoCuenta.toFixed(2)}
        </div>

      </div>

    </Tooltip>
  </Col>


  {/* ===== IGV ===== */}
  <Col xs={24} sm={12} md={8} lg={4}>
    <Tooltip title="IGV">

      <div style={{
        height: 220,
        borderRadius: 20,
        background: "#FFF4CC",
        textAlign: "center",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center"
      }}>

        <div style={{
          fontSize: 16,
          fontWeight: 600,
          color: "#A57900"
        }}>
          IGV
        </div>

        <div style={{
          fontSize: 30,
          fontWeight: 700,
          color: "#8A6D00",
          marginTop: 12
        }}>
          S/ {cajaChica.igv.toFixed(2)}
        </div>

      </div>

    </Tooltip>
  </Col>


  {/* ===== DETRACCIÓN ===== */}
  <Col xs={24} sm={12} md={8} lg={4}>
    <Tooltip title="Detracción">

      <div style={{
        height: 220,
        borderRadius: 20,
        background: "#E6F7EE",
        textAlign: "center",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center"
      }}>

        <div style={{
          fontSize: 16,
          fontWeight: 600,
          color: "#1F8A4D"
        }}>
          Detracción
        </div>

        <div style={{
          fontSize: 30,
          fontWeight: 700,
          color: "#0FA35B",
          marginTop: 12
        }}>
          S/ {cajaChica.detraccion.toFixed(2)}
        </div>

      </div>

    </Tooltip>
  </Col>


  {/* ===== TOTAL SIN IGV ===== */}
  <Col xs={24} sm={12} md={8} lg={4}>
    <Tooltip title="Total sin IGV">

      <div style={{
        height: 220,
        borderRadius: 20,
        background: "#F5F7F9",
        textAlign: "center",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center"
      }}>

        <div style={{
          fontSize: 16,
          fontWeight: 600,
          color: "#444"
        }}>
          Total sin IGV
        </div>

        <div style={{
          fontSize: 30,
          fontWeight: 700,
          color: "#333",
          marginTop: 12
        }}>
          S/ {cajaChica.totalSinIGV.toFixed(2)}
        </div>

      </div>

    </Tooltip>
  </Col>

</Row>

</Card>

</div>

  );
}

export default ReporteMensual;