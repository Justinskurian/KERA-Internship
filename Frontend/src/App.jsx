import { Route, Routes } from "react-router-dom";
import "./App.css";
import Details from "./Components/Details";
import Home from "./Components/Home";
import ProductionOrder from "./Components/ProductionOrder";
import OrderCalendar from "./Components/OrderCalender";
import AssignMachines from "./Components/AssignMachines";
import Login from "./Components/Login";

function App() {
  return (
    <>
      <Routes>
      <Route path="/" element={<Login />}></Route>
        <Route path="/home" element={<Home child={<ProductionOrder/>} />}></Route>
        <Route path="/details/:orderId" element={<Home child={<Details />}/>}></Route>
        <Route path="/details/" element={<Home child={<Details />}/>}></Route>
        <Route path="/calender" element={<Home child={<OrderCalendar />}/>}></Route>
        <Route path="/assign" element={<Home child={<AssignMachines />}/>}></Route>
      </Routes>
    </>
  );
}

export default App;
