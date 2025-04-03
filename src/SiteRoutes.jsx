import { Routes, Route } from "react-router-dom";
import Auth from "./components/Auth/Auth";
import Settings from "./components/Settings/Settings";
import Home from "./components/Home/Home";
import Clients from "./components/Clients/Clients";
import ClientPage from "./components/Clients/ClientPage/ClientPage";
import DocumentsPage from "./components/DocumentsPage/DocumentsPage";
import PlaybookPage from "./components/Playbook/PlaybookPage/PlaybookPage";
import DocumentPage from "./components/DocumentsPage/DocumentPage/DocumentPage";
import AddPlaybookPage from "./components/Playbook/AddPlaybookPage/AddPlaybookPage";
import CompanySelectionPage from "./components/CompanySelectionPage/CompanySelectionPage";
import AllDocs from "./components/AllDocs/AllDocs";
import TemplatesPage from "./components/templatesArea/TemplatesPage/TemplatesPage";



function SiteRoutes() {
  return (
    <Routes>
      <Route path="/auth" element={<Auth />} />
      <Route path="/settings" element={<Settings />} />
      <Route path="/select-company" element={<CompanySelectionPage/>} />
      <Route path="/home" element={<Home />} />
      <Route path="/" element={<Home />} />
      <Route path="/clients" element={<Clients />} />
      <Route path="/client-page" element={<ClientPage />} />
      <Route path="/all-docs" element={<AllDocs />} />
      <Route path="/client-page/:id" element={<ClientPage />} />
      <Route path="/documents" element={<DocumentsPage />} />
      <Route path="/document/:docId" element={<DocumentPage />} />
      <Route path="/playbook/:id" element={<PlaybookPage />} />
      <Route path="/add-playbook" element={<AddPlaybookPage />} />
      <Route path="/templates" element={<TemplatesPage />} />

    </Routes>
  );
}

export default SiteRoutes;
