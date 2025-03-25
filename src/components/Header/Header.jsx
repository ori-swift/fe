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
        {selectedCompany && <Link to="/settings" className="header-link">{selectedCompany.company_name}</Link>}
        <Link to="/settings" className="header-link">הגדרות</Link>
        {isLogged && <button onClick={handleLogout} className="header-logout">התנתק {userData?.user?.username}</button>}
        {!isLogged && <Link to="/settings" className="header-link">התחבר</Link>}
        {isLogged && <Link to="/clients" className="header-link">לקוחות</Link>}
      </div>
    </nav>
  );
};

export default Header;
