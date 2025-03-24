import { Routes, Route } from "react-router-dom";
import Auth from "./components/Auth/Auth";
import Settings from "./components/Settings/Settings";
import Home from "./components/Home/Home";
import Clients from "./components/Clients/Clients";
import ClientPage from "./components/Clients/ClientPage/ClientPage";
import DocumentsPage from "./components/DocumentsPage/DocumentsPage";
import PlaybookPage from "./components/Playbook/PlaybookPage/PlaybookPage";


function SiteRoutes() {
  return (
    <Routes>
      <Route path="/auth" element={<Auth />} />
      <Route path="/settings" element={<Settings />} />
      <Route path="/home" element={<Home />} />
      <Route path="/" element={<Home />} />
      <Route path="/clients" element={<Clients />} />
      <Route path="/client-page" element={<ClientPage />} />
      <Route path="/documents" element={<DocumentsPage />} />
      <Route path="/playbook/:id" element={<PlaybookPage />} />

    </Routes>
  );
}

export default SiteRoutes;
