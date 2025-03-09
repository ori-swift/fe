import { Link } from "react-router-dom";
import "./Header.css";

const Header = ({ handleLogout, isLogged }) => {


  return (
    <nav className="header-container">
      <div className="header-logo">Swift-Collect</div>
      <div className="header-links">
        <Link to="/" className="header-link">דף הבית</Link>
        <Link to="/settings" className="header-link">הגדרות</Link>
        {isLogged && <button onClick={handleLogout} className="header-logout">התנתק</button>}
        {!isLogged && <Link to="/settings" className="header-link">התחבר</Link>}
        {isLogged && <Link to="/clients" className="header-link">לקוחות</Link>}
      </div>
    </nav>
  );
};

export default Header;
