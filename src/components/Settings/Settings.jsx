
import { useContext, useEffect, useState } from "react";
import { AppContext } from "../../App";
import "./Settings.css";
import { useNavigate } from "react-router-dom";
import ProviderSettings from "../ProviderSettings/ProviderSettings";
import NewProviderModal from "../ProviderSettings/NewProviderModal/NewProviderModal";

export default function Settings() {
  const { userData, isLogged } = useContext(AppContext);
  const [showNewProviderModal, setShowNewProviderModal] = useState(false);  

  const nav = useNavigate();
  useEffect(() => {
    if (!isLogged) {
      nav("/auth");
    }    
  }, [isLogged, nav]);
  
  if (!userData) {
    return <p>טוען...</p>;
  }

  console.log(userData.user.onboarding_status);
  
  return (
    <div className="settings-container">
      <NewProviderModal show={showNewProviderModal} setShow={setShowNewProviderModal} />
      <div className="settings-header">
        <button
          type="button"
          className="settings-add-button"
          onClick={() => setShowNewProviderModal(true)}
        >
          הוסף חברה
        </button>
        <hr/>
        <h2 className="settings-title">החברות שלי</h2>        

        {userData.user.onboarding_status === "company_added" && <h4>
          עליך לעדכן פרטי התחברות לספק החשבוניות שלך לצורך הפעלת מערכת סוויפט
          </h4>}
      </div>
      <div className="settings-list">
        {userData.companies.map((ps) => (
          <div key={ps.id} className="settings-provider-card">
            <span className="settings-provider-name">{ps.company_name}  | {ps.plan.name}  | {ps.relation} </span>            
            <ProviderSettings ps={ps} />
          </div>
        ))}
      </div>
    </div>
  );
}