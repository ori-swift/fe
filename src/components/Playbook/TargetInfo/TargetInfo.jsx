import { useNavigate } from "react-router-dom";

const TargetInfo = ({ playbook }) => {
    const nav = useNavigate();
    if (playbook.document) {
        return (
            <div className="playbook-page-target-info document">
                <svg className="playbook-page-target-icon" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                    <polyline points="14 2 14 8 20 8"></polyline>
                    <line x1="16" y1="13" x2="8" y2="13"></line>
                    <line x1="16" y1="17" x2="8" y2="17"></line>
                    <polyline points="10 9 9 9 8 9"></polyline>
                </svg>
                <span className="playbook-page-target-label">מסמך:</span>
                <a href="#"
                    className="playbook-page-target-link"
                    onClick={(e) => {
                        nav("/document/" + playbook.document.id)
                        // e.preventDefault(); alert("צפייה במסמך אינה מיושמת עדיין");
                    }}>
                    {playbook.document.provider_doc_id}
                </a>
            </div>
        );
    } else if (playbook.client) {
        return (
            <div className="playbook-page-target-info client">
                <svg className="playbook-page-target-icon" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                    <circle cx="12" cy="7" r="4"></circle>
                </svg>
                <span className="playbook-page-target-label">לקוח:</span>
                <a href="#"
                    className="playbook-page-target-link"
                    onClick={(e) => {
                        // e.preventDefault(); alert("צפייה בלקוח אינה מיושמת עדיין");
                        nav("/client-page/" + playbook.client.id)
                    }}>
                    {playbook.client.name}
                </a>
            </div>
        );
    } else {
        return (
            <div className="playbook-page-target-info global">
                <svg className="playbook-page-target-icon" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="2" y1="12" x2="22" y2="12"></line>
                    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
                </svg>
                <span className="playbook-page-target-label">פלייבוק גלובלי</span>
            </div>
        );
    }
};

export default TargetInfo