import { Layout, Menu } from "antd";
import {
  UserOutlined,
  FileSearchOutlined,
  FileTextOutlined,
  HourglassFilled,
  CalendarOutlined
} from "@ant-design/icons";
const { Header } = Layout;

function Navbar({ pantalla, setPantalla }) {

return (


<Header
style={{
background:"#0f2a44",
display:"flex",
alignItems:"center",
padding:"0 30px",
position:"fixed",
top:0,
left:0,
width:"100%",
zIndex:1000
}}
>

{/* LOGO Y TITULO */}

<div
style={{
display:"flex",
alignItems:"center",
color:"white",
minWidth:"320px"
}}
>

<img
src="/logo-calidda.png"
style={{
height:45,
marginRight:12
}}
/>

<div>

<div style={{fontSize:18,fontWeight:600}}>
Seguridad Integral
</div>

</div>

</div>

<Menu
  theme="dark"
  mode="horizontal"
  selectedKeys={[pantalla]}
  style={{
    background:"#0f2a44",
    marginLeft:"auto",
    flex: 1,
    minWidth: 0
  }}
>

  <Menu.Item
    key="home"
    icon={<UserOutlined />}
    onClick={()=>setPantalla("home")}
  >
    INICIO
  </Menu.Item>

<Menu.Item
  key="cargaProgramacion"
  icon={<CalendarOutlined />}
  onClick={() => setPantalla("cargaProgramacion")}
>
  CARGAR PROGRAMACIÓN
</Menu.Item>

  {/* 🔥 NUEVO */}
  <Menu.Item
    key="menu"
    icon={<UserOutlined />}
    onClick={()=>setPantalla("menu")}
  >
    MENÚ
  </Menu.Item>
  
  <Menu.Item
    key="historial"
    icon={<FileSearchOutlined />}
    onClick={()=>setPantalla("historial")}
  >
    HISTORIAL
  </Menu.Item>

  <Menu.Item
    key="reporte"
    icon={<FileTextOutlined />}
    onClick={()=>setPantalla("reporte")}
  >
    REPORTE MENSUAL
  </Menu.Item>

</Menu>

</Header>

)

}

export default Navbar;