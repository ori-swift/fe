import { Link, useNavigate } from "react-router-dom";
import "./Header.css";
import { useContext } from "react";
import { AppContext } from "../../App";

const Header = ({ handleLogout, isLogged }) => {

  const {userData, selectedCompany} = useContext(AppContext)  
  
  const nav = useNavigate();
  return (
    <nav className="header-container">
      <div className="header-logo" onClick={()=>nav("/home")}>Swift-Collect</div>
      <div className="header-links">
        <Link to="/settings" className="header-link">הגדרות</Link>
        {!isLogged && <Link to="/settings" className="header-link">התחבר</Link>}
        {isLogged && <Link to="/clients" className="header-link">לקוחות</Link>}
        {isLogged && <Link to="/all-docs" className="header-link">מסמכים</Link>}
        {isLogged && <Link to="/all-playbooks" className="header-link">פלייבוקים</Link>}
        {isLogged && <Link to="/templates" className="header-link">תבניות התראה</Link>}
        {isLogged && <button onClick={handleLogout} className="header-logout">התנתק {userData?.user?.username}</button>}
        {selectedCompany && <Link to="/select-company" className="header-link header-link-company">{selectedCompany.company_name}</Link>}
      </div>
    </nav>
  );
};

export default Header;
