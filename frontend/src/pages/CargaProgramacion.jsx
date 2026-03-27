import { useState, useEffect } from "react";
import axios from "axios";
import { Table, Input, Button, Card, Upload, message, Tag } from "antd";
import { UploadOutlined } from "@ant-design/icons";

function CargaProgramacion() {

  const [archivo, setArchivo] = useState(null);

  const [loading, setLoading] = useState(false);

  //  NUEVO
  const [programacionDB, setProgramacionDB] = useState([]);
  const [loadingDB, setLoadingDB] = useState(false);
  const [editandoId, setEditandoId] = useState(null);
  const [busqueda, setBusqueda] = useState("");
const [busquedaActiva, setBusquedaActiva] = useState("");
const [ultima, setUltima] = useState(null);

  //  TRAER DATOS BD
  const cargarProgramacion = async () => {
    try {
      setLoadingDB(true);

      const res = await axios.get(
        "http://192.168.1.137:3000/api/programacion/listar"
      );

      setProgramacionDB(res.data);

    } catch (error) {
      console.error(error);
      message.error("Error cargando datos");
    } finally {
      setLoadingDB(false);
    }
  };

  // 🔥 cargar al iniciar
  useEffect(() => {
    cargarProgramacion();
  }, []);



  // 🔹 EDITAR TABLA


const actualizarCampo = (id, campo, valor) => {
  const nuevaData = programacionDB.map(item =>
    item.id === id ? { ...item, [campo]: valor } : item
  );

  setProgramacionDB(nuevaData);
};

 

const ejecutarBusqueda = () => {
  setBusquedaActiva(busqueda);
};



const limpiarBusqueda = () => {
  setBusqueda("");
  setBusquedaActiva("");
};




const obtenerUltima = async () => {
  try {
    const res = await axios.get(
      "http://192.168.1.137:3000/api/programacion/ultima-actualizacion"
    );

    console.log("ULTIMA:", res.data); // 👈 AGREGA ESTO

    setUltima(res.data.ultima);

  } catch (error) {
    console.error(error);
  }
};

useEffect(() => {
  obtenerUltima();
}, []);




const dataFiltrada = programacionDB.filter(item =>
  (item.dni || "").toString().includes(busquedaActiva) ||
  (item.nombres || "").toLowerCase().includes(busquedaActiva.toLowerCase()) ||
  (item.apellido_paterno || "").toLowerCase().includes(busquedaActiva.toLowerCase()) ||
  (item.apellido_materno || "").toLowerCase().includes(busquedaActiva.toLowerCase())
);








const limpiarFecha = (f) => {
  if (!f) return null;
  return f.split("T")[0];
};

const guardarEdicion = async (row) => {
  try {

    console.log("ENVIANDO:", row); // 🔍 debug

    row.fecha_inicio = limpiarFecha(row.fecha_inicio);
    row.fecha_fin = limpiarFecha(row.fecha_fin);

    await axios.put(
      `http://192.168.1.137:3000/api/programacion/actualizar/${row.id}`,
      row
    );

    message.success("Actualizado ✅");
    setEditandoId(null);
    cargarProgramacion();

  } catch (error) {
    console.error(error);
    message.error("Error actualizando");
  }
};





const subirExcel = async () => {

  if (!archivo) {
    message.warning("Seleccione un archivo");
    return;
  }

  const formData = new FormData();
  formData.append("archivo", archivo); // 🔥 IMPORTANTE

  try {

    setLoading(true);

    await axios.post(
      "http://192.168.1.137:3000/api/programacion/cargar",
      formData
    );

    message.success("Programación cargada correctamente 🚀");

    cargarProgramacion();
    obtenerUltima();

  } catch (error) {
    console.error(error);
    message.error("Error al cargar archivo");
  } finally {
    setLoading(false);
  }
};



  // 🔹 COLUMNAS EDICIÓN
  const columns = [
    {
      title: "DNI",
      dataIndex: "dni",
      width: 120,
      render: (text, _, i) => (
        <Input value={text} onChange={(e)=>handleChange(e.target.value, i, "dni")} />
      )
    },
    {
      title: "Apellido Paterno",
      dataIndex: "apellido_paterno",
      render: (text, _, i) => (
        <Input value={text} onChange={(e)=>handleChange(e.target.value, i, "apellido_paterno")} />
      )
    },
    {
      title: "Apellido Materno",
      dataIndex: "apellido_materno",
      render: (text, _, i) => (
        <Input value={text} onChange={(e)=>handleChange(e.target.value, i, "apellido_materno")} />
      )
    },
    {
      title: "Nombres",
      dataIndex: "nombres",
      render: (text, _, i) => (
        <Input value={text} onChange={(e)=>handleChange(e.target.value, i, "nombres")} />
      )
    },
    {
      title: "Turno",
      dataIndex: "turno"
    },


    {
  title: "Inicio",
  dataIndex: "fecha_inicio",
  width: 120,
  render: (f) => f?.split("T")[0]
},
{
  title: "Fin",
  dataIndex: "fecha_fin",
  width: 120,
  render: (f) => f?.split("T")[0]
},



    {
      title: "Estado",
      render: (_, record) => {
        if (!record.dni || !record.nombres) {
          return <Tag color="red">Error</Tag>;
        }
        return <Tag color="green">OK</Tag>;
      }
    }
  ];

  // 🔹 COLUMNAS BD
 
const columnsDB = [

  {
    title: "DNI",
    dataIndex: "dni",
    render: (text, record) => {
      if (editandoId === record.id) {
        return (
          <Input
            value={text}
            onChange={(e) =>
  actualizarCampo(record.id, "dni", e.target.value)
}
          />
        );
      }
      return text;
    }
  },

  {
    title: "CIP",
    dataIndex: "cip",
    render: (text, record) => {
      if (editandoId === record.id) {
        return (
          <Input
            value={text}
            onChange={(e) => {
              record.cip = e.target.value;
              setProgramacionDB([...programacionDB]);
            }}
          />
        );
      }
      return text;
    }
  },

  {
    title: "CODOFIN",
    dataIndex: "codofin",
    render: (text, record) => {
      if (editandoId === record.id) {
        return (
          <Input
            value={text}
            onChange={(e) => {
              record.codofin = e.target.value;
              setProgramacionDB([...programacionDB]);
            }}
          />
        );
      }
      return text;
    }
  },

  {
    title: "Apellido Paterno",
    dataIndex: "apellido_paterno",
    render: (text, record) => {
      if (editandoId === record.id) {
        return (
          <Input
            value={text}
            onChange={(e) => {
              record.apellido_paterno = e.target.value;
              setProgramacionDB([...programacionDB]);
            }}
          />
        );
      }
      return text;
    }
  },

  {
    title: "Apellido Materno",
    dataIndex: "apellido_materno",
    render: (text, record) => {
      if (editandoId === record.id) {
        return (
          <Input
            value={text}
            onChange={(e) => {
              record.apellido_materno = e.target.value;
              setProgramacionDB([...programacionDB]);
            }}
          />
        );
      }
      return text;
    }
  },

  {
    title: "Nombres",
    dataIndex: "nombres",
    render: (text, record) => {
      if (editandoId === record.id) {
        return (
          <Input
            value={text}
            onChange={(e) => {
              record.nombres = e.target.value;
              setProgramacionDB([...programacionDB]);
            }}
          />
        );
      }
      return text;
    }
  },

  {
    title: "Celular",
    dataIndex: "celular",
    render: (text, record) => {
      if (editandoId === record.id) {
        return (
          <Input
            value={text}
            onChange={(e) => {
              record.celular = e.target.value;
              setProgramacionDB([...programacionDB]);
            }}
          />
        );
      }
      return text;
    }
  },

  {
    title: "Turno",
    dataIndex: "turno"
  },

  {
    title: "Puesto",
    dataIndex: "puesto"
  },

  {
    title: "Inicio",
    dataIndex: "fecha_inicio",
    render: (f) => f?.split("T")[0]
  },

  {
    title: "Fin",
    dataIndex: "fecha_fin",
    render: (f) => f?.split("T")[0]
  },

  // 🔥 CLAVE: ACCIONES
  {
    title: "Acciones",
    width: 100,
    render: (_, record) => {

      if (editandoId === record.id) {
        return (

            






          <>
            <Button
              type="primary"
              size="small"
              onClick={() => guardarEdicion(record)}
            >
              Guardar
            </Button>

            <Button
              size="small"
              onClick={() => setEditandoId(null)}
              style={{ marginLeft: 5 }}
            >
              Cancelar
            </Button>
          </>
        );
      }

      return (
        <Button
          size="small"
          onClick={() => setEditandoId(record.id)}
        >
          Editar
        </Button>
      );
    }
  }
];


  return (
   <div style={{ padding: 30, marginTop: 480 }}>

  {/* 🔵 ENCABEZADO */}
  <Card style={{ maxWidth: 1200, margin: "20PX auto" }}>
    
    <h2>Carga de Programación</h2>

<div style={{ marginBottom: 10 }}>
  <strong>Última actualización:</strong>{" "}
  {ultima
    ? new Date(ultima).toLocaleString()
    : "Sin registros"}
</div>





    <p>Suba la plantilla Excel con la programación del personal.</p>

    <Upload
      beforeUpload={(file) => {
        setArchivo(file);
        return false;
      }}
      maxCount={1}
    >
      <Button icon={<UploadOutlined />} size="large">
        Seleccionar Excel
      </Button>
    </Upload>



    <Button
  type="primary"
  size="large"
  loading={loading}
  style={{ marginTop: 15 }}
  onClick={subirExcel}
>
  Cargar programación
</Button>

    <br /><br />

  </Card>
  


      {/* 🔵 TABLA BD */}
      <Card
  title="📁 Programación Registrada"
  style={{ maxWidth: 1200, margin: "30px auto" }}
  extra={
    <Button type="primary" onClick={cargarProgramacion}>
      Refrescar Tabla
    </Button>
  }
>



    <div style={{ display: "flex", gap: 10, marginBottom: 15 }}>

  <Input
    placeholder="Buscar por DNI o nombre..."
    value={busqueda}
    onChange={(e) => setBusqueda(e.target.value)}
    style={{ maxWidth: 300 }}
    onPressEnter={ejecutarBusqueda} // Enter funciona
  />

  <Button type="primary" onClick={ejecutarBusqueda}>
    Buscar
  </Button>

  <Button onClick={limpiarBusqueda}>
    Limpiar
  </Button>

</div>

        <Table
          columns={columnsDB}
          dataSource={dataFiltrada}
          rowKey="id"
          loading={loadingDB}
          scroll={{ y: 400  }}
          pagination={{ pageSize: 10 }}
        />
<p>Total registros: {programacionDB.length}</p>
      </Card>

    </div>
  );
}

export default CargaProgramacion;