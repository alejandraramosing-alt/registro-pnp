import { useState } from "react";
import { SearchOutlined, ReloadOutlined, FileExcelOutlined } from "@ant-design/icons";
import { Table, Card, DatePicker, Button, Tag, Row, Col, Input, Select, Form } from "antd";
import "../styles/historial.css";


function HistorialAsistencias(){

const [fechaInicio,setFechaInicio] = useState(null);
const [fechaFin,setFechaFin] = useState(null);
const [historial,setHistorial] = useState([]);
const [loading,setLoading] = useState(false);
// 🔥 SELECCIÓN DE FILAS
const [filasSeleccionadas, setFilasSeleccionadas] = useState([]);
const [descargandoMasivo, setDescargandoMasivo] = useState(false);
const [selectedRowKeys, setSelectedRowKeys] = useState([]);


// NUEVOS ESTADOS
const [dni,setDni] = useState("");
const [nombre,setNombre] = useState("");
const [servicio,setServicio] = useState("todos");
const [jefeGrupo,setJefeGrupo] = useState("todos");





const buscar = async () => {

  setLoading(true);

  try {

    const response = await fetch(
      "http://192.168.1.137:3000/api/asistencia/historial",
      {
        method:"POST",
        headers:{
          "Content-Type":"application/json"
        },   
        body: JSON.stringify({
          fechaInicio: fechaInicio ? fechaInicio.format("YYYY-MM-DD") : "",
          fechaFin: fechaFin ? fechaFin.format("YYYY-MM-DD") : "",
          dni,
          nombre,
          servicio: servicio === "todos" ? "" : servicio,
          jefeGrupo: jefeGrupo === "todos" ? "" : jefeGrupo
        })
      }
    );

    if (!response.ok) {
      throw new Error("Error en backend");
    }

    const data = await response.json();

    const dataConId = data.map((r) => ({
  ...r,
  id: r.id
}));

    setHistorial(dataConId);

  } catch (error) {

    console.error(error);
    alert("Error cargando historial");

  }

  setLoading(false);

};













const limpiar = () => {
setFechaInicio(null);
setFechaFin(null);
setHistorial([]);
};

const exportarExcel = async () => {

const response = await fetch(
"http://192.168.1.137:3000/api/historial/excel",
{
method:"POST",
headers:{
"Content-Type":"application/json"
},
body:JSON.stringify({
fechaInicio: fechaInicio ? fechaInicio.format("YYYY-MM-DD") : "",
fechaFin: fechaFin ? fechaFin.format("YYYY-MM-DD") : ""
})
}
);

const blob = await response.blob();

const url = window.URL.createObjectURL(blob);

const a = document.createElement("a");

a.href = url;
a.download = "historial_asistencias.xlsx";

a.click();

};







// ===============================
// DESCARGA INDIVIDUAL
// ===============================
const descargarIndividual = async (registro) => {

  const response = await fetch(
    "http://192.168.1.137:3000/api/declaracion-individual",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        dni: registro.dni,
        fecha: registro.fecha
      })
    }
  );

  if (!response.ok) {
    alert("Error generando declaración");
    return;
  }

  const blob = await response.blob();

  const url = window.URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = `declaracion_${registro.dni}_${registro.fecha}.pdf`;
  a.click();
};


// ===============================
// DESCARGA MASIVA SECUENCIAL
// ===============================
const descargarSeleccionados = async () => {

  if (filasSeleccionadas.length === 0) {
    alert("Seleccione al menos un registro");
    return;
  }

  setDescargandoMasivo(true);

  for (const registro of filasSeleccionadas) {

    const response = await fetch(
      "http://192.168.1.137:3000/api/declaracion-individual",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          dni: registro.dni,
          fecha: registro.fecha
        })
      }
    );

    if (!response.ok) continue;

    const blob = await response.blob();

    const url = window.URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = `declaracion_${registro.dni}_${registro.fecha}.pdf`;
    a.click();

    // 🔥 pausa breve para evitar bloqueo del navegador
    await new Promise(r => setTimeout(r, 800));
  }

  setDescargandoMasivo(false);
};







const columns = [

{
title:"Fecha",
dataIndex:"fecha",
width:100,
sorter:(a,b)=> new Date(a.fecha) - new Date(b.fecha)
},

{
title:"DNI",
dataIndex:"dni",
width:100,
sorter:(a,b)=> a.dni - b.dni
},

{
title:"Apellido paterno",
dataIndex:"apellido_paterno",
width:120,
sorter:(a,b)=> a.apellido_paterno.localeCompare(b.apellido_paterno)
},

{
title:"Apellido materno",
dataIndex:"apellido_materno",
width:110,
sorter:(a,b)=> a.apellido_materno.localeCompare(b.apellido_materno)
},

{
title:"Nombres",
width: 110,
dataIndex:"nombres",
sorter:(a,b)=> a.nombres.localeCompare(b.nombres)
},


{
  title: "Horas",
  dataIndex: "horas_trabajadas",
  width: 90,
  sorter: (a, b) => a.horas_trabajadas - b.horas_trabajadas
},

{
title: "Servicio",
width: 180,
render: (_, r) => {

if (!r.servicios) return null;

const servicios = r.servicios.split(",");

return servicios.map((s, i) => {

const texto = s.trim().toUpperCase();

let color = "blue";

if (texto.includes("MAÑANA")) color = "gold";   // 🟡
if (texto.includes("TARDE")) color = "green";   // 🟢
if (texto.includes("NOCHE")) color = "blue";    // 🔵

return (
<Tag key={i} color={color}>
{texto}
</Tag>
);

});

}
},



{
title:"Jefe",
width:80,
render:(_,r)=>(
<Tag color={r.jefe_grupo==="SI"?"green":"red"}>
{r.jefe_grupo}
</Tag>
)
},

// 🔥 NUEVA COLUMNA ACCIONES
{
  title: "Declaración",
  width: 120,
  render: (_, r) => (
    <Button
      type="link"
      onClick={() => descargarIndividual(r)}
    >
      Descargar
    </Button>
  )
}

];







const eliminarRegistro = async (registro) => {

  const confirmar = window.confirm(
    `¿Eliminar registro de ${registro.nombres}?`
  );

  if (!confirmar) return;

  try {

    await fetch(
      `http://192.168.1.137:3000/api/asistencia/eliminar/${registro.id}`,
      { method: "DELETE" }
    );

    // 🔥 refrescar tabla
    buscar();

  } catch (error) {

    console.error(error);
    alert("Error eliminando registro");

  }
};





const eliminarSeleccionados = async () => {

  if (filasSeleccionadas.length === 0) {
    alert("Seleccione al menos un registro");
    return;
  }

  const confirmar = window.confirm(
    `¿Eliminar ${filasSeleccionadas.length} registros?`
  );

  if (!confirmar) return;

  try {

    const ids = filasSeleccionadas.map(r => r.id);

    await fetch(
      "http://192.168.1.137:3000/api/asistencia/eliminar-masivo",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ ids })
      }
    );

    // limpiar selección
    setFilasSeleccionadas([]);
    setSelectedRowKeys([]);

    // recargar
    buscar();

  } catch (error) {

    console.error(error);
    alert("Error eliminando registros");

  }
};






const historialFiltrado = historial.filter((r) => {

const coincideDni =
dni === "" || r.dni?.toString().includes(dni);

const coincideNombre =
nombre === "" || r.nombres?.toLowerCase().includes(nombre.toLowerCase());

const coincideServicio =
servicio === "todos" ||
r.servicios?.toLowerCase().includes(servicio.toLowerCase());

const coincideJefe =
jefeGrupo === "todos" || r.jefe_grupo === jefeGrupo;

return (
coincideDni &&
coincideNombre &&
coincideServicio &&
coincideJefe
);

});



const rowSelection = {
  selectedRowKeys,
  onChange: (keys, rows) => {
    setSelectedRowKeys(keys);
    setFilasSeleccionadas(rows);   // 🔥 CLAVE PARA DESCARGA
  },
  preserveSelectedRowKeys: true
};




return (

<div style={{
  height: "100vh",
  display: "flex",
  flexDirection: "column",
  padding: 10
}}>

  {/* 🔵 PANEL SUPERIOR — NO SE MUEVE */}
  <div
  style={{
    position: "sticky",
    top: 0,
    background: "#fff",
    marginTop:"50px",
    zIndex: 100
  }}
>



<Card title="CONSULTA Y FILTRA LAS ASISTENCIAS REGISTRADAS" style={{ marginTop: 5}}>
  <Row gutter={16} align="middle">

    {/* FECHAS */}
    <Col span={4}>
      <DatePicker
        style={{ width: "100%" }}
        placeholder="Desde"
        value={fechaInicio}
        onChange={setFechaInicio}
      />
    </Col>

    <Col span={4}>
      <DatePicker
        style={{ width: "100%" }}
        placeholder="Hasta"
        value={fechaFin}
        onChange={setFechaFin}
      />
    </Col>

    {/* DNI */}
    <Col span={3}>
      <Input
        placeholder="DNI"
        value={dni}
        onChange={(e)=>setDni(e.target.value)}
      />
    </Col>

    {/* NOMBRE */}
    <Col span={5}>
      <Input
        placeholder="Nombre"
        value={nombre}
        onChange={(e)=>setNombre(e.target.value)}
      />
    </Col>

    {/* SERVICIO */}
    <Col span={3}>
      <Select
        value={servicio}
        onChange={setServicio}
        options={[
          { value:"todos",label:"Servicio"},
          { value:"mañana",label:"Mañana"},
          { value:"tarde",label:"Tarde"},
          { value:"noche",label:"Noche"}
        ]}
      />
    </Col>

    {/* JEFE */}
    <Col span={3}>
      <Select
        value={jefeGrupo}
        onChange={setJefeGrupo}
        options={[
          { value:"todos",label:"Jefe"},
          { value:"SI",label:"SI"},
          { value:"NO",label:"NO"}
        ]}
      />
    </Col>

   {/* BOTONES AGRUPADOS */}
<Col span={2}>

  <div style={{
    display: "flex",
    gap: 8,
    justifyContent: "flex-end"
  }}>

    <Button
      type="primary"
      icon={<SearchOutlined />}
      onClick={buscar}
    />

    <Button
      icon={<ReloadOutlined />}
      onClick={limpiar}
    />

    

    

  </div>

</Col>

  </Row>

</Card>









{/* 🔥 BOTÓN DESCARGA MASIVA */}
<Row style={{ marginTop: 10 }}>
  <Col span={24} style={{ textAlign: "right" }}>

    <Button
      type="primary"
      disabled={filasSeleccionadas.length === 0}
      loading={descargandoMasivo}
      onClick={descargarSeleccionados}
    >
      Descargar seleccionados ({filasSeleccionadas.length})
    </Button>

    <Button
  danger
  disabled={filasSeleccionadas.length === 0}
  onClick={eliminarSeleccionados}
  style={{ marginLeft: 10 }}
>
  Eliminar seleccionados ({filasSeleccionadas.length})
</Button>

  </Col>
</Row>



    
  </div>

  {/* 🔥 TABLA CON SCROLL */}
  <div style={{
    flex: 1,
    marginTop: 1,
  }}>

      <Table
        columns={columns}
        dataSource={historial}
        loading={loading}
        rowKey="id"
        rowSelection={rowSelection}

        scroll={{ y: 220}}

        locale={{
          emptyText:"No hay asistencias registradas"
        }}

        pagination={{
          pageSize:8,
          showTotal:(total,range)=>`${range[0]}-${range[1]} de ${total} registros`
        }}
      />

    

  </div>

</div>

);

}

export default HistorialAsistencias;