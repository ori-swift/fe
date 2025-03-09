import { Routes, Route } from "react-router-dom";
import Auth from "./components/Auth/Auth";
import Settings from "./components/Settings/Settings";
import Home from "./components/Home/Home";
import Clients from "./components/Clients/Clients";


function SiteRoutes() {
  return (
    <Routes>
      <Route path="/auth" element={<Auth />} />
      <Route path="/settings" element={<Settings />} />
      <Route path="/home" element={<Home />} />
      <Route path="/" element={<Home />} />
      <Route path="/clients" element={<Clients />} />
      {/* <Route path="/documents" element={<Documents />} /> */}

    </Routes>
  );
}

export default SiteRoutes;
