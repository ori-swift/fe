// AlertTaskModal.jsx
import React from "react";
import { Modal, Button, Table } from "react-bootstrap";
import { Link } from "react-router-dom";
import "./AlertTaskModal.css";

const AlertTaskModal = ({ show, task, onHide }) => {
  if (!task) return null;

  // Method status translations
  const methodTranslations = {
    "sms": "מסרון",
    "email": "אימייל",
    "call": "שיחה",
    "push": "התראה"
  };

  // Status translations
  const statusTranslations = {
    "pending": "ממתין",
    "in_progress": "בתהליך",
    "completed": "הושלם",
    "failed": "נכשל"
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('he-IL');
  };

  return (
    <Modal show={show} onHide={onHide} size="lg" dir="rtl" className="alert-task-modal">
      <Modal.Header closeButton>
        <Modal.Title>פרטי משימת התראה #{task.id}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <div className="alert-task-modal-content">
          <div className="alert-task-modal-section">
            <h4>פרטים כללים</h4>
            <div className="alert-task-modal-info">
              <div className="alert-task-modal-info-item">
                <span className="alert-task-modal-label">מזהה משימה:</span>
                <span>{task.id}</span>
              </div>
              <div className="alert-task-modal-info-item">
                <span className="alert-task-modal-label">מזהה לקוח:</span>
                <Link to={`/client-page/${task.client_id}`}>{task.client_id}</Link>
              </div>
              <div className="alert-task-modal-info-item">
                <span className="alert-task-modal-label">מזהה מסמך:</span>
                <Link to={`/document/${task.document_id}`}>{task.document_id}</Link>
              </div>
              <div className="alert-task-modal-info-item">
                <span className="alert-task-modal-label">מזהה תבנית:</span>
                <Link to={`/playbook/${task.playbook_id}`}>{task.playbook_id}</Link>
              </div>
              <div className="alert-task-modal-info-item">
                <span className="alert-task-modal-label">סטטוס:</span>
                <span className={`status-${task.status}`}>
                  {statusTranslations[task.status] || task.status}
                </span>
              </div>
              <div className="alert-task-modal-info-item">
                <span className="alert-task-modal-label">זמן מתוזמן:</span>
                <span>{formatDate(task.scheduled_time)}</span>
              </div>
              <div className="alert-task-modal-info-item">
                <span className="alert-task-modal-label">נוצר ב:</span>
                <span>{formatDate(task.created_at)}</span>
              </div>
              <div className="alert-task-modal-info-item">
                <span className="alert-task-modal-label">עודכן ב:</span>
                <span>{formatDate(task.updated_at)}</span>
              </div>
            </div>
            {task.notes && (
              <div className="alert-task-modal-notes">
                <span className="alert-task-modal-label">הערות:</span>
                <p>{task.notes}</p>
              </div>
            )}
          </div>

          <div className="alert-task-modal-section">
            <h4>שיטות התראה</h4>
            {task.methods && task.methods.length > 0 ? (
              <Table striped bordered hover className="alert-task-modal-methods-table">
                <thead>
                  <tr>
                    <th style={{ width: "8%" }}>מזהה</th>
                    <th style={{ width: "12%" }}>שיטה</th>
                    <th style={{ width: "12%" }}>סטטוס</th>
                    <th style={{ width: "40%" }}>הערות</th>
                    <th style={{ width: "14%" }}>נוצר ב</th>
                    <th style={{ width: "14%" }}>עודכן ב</th>
                  </tr>
                </thead>
                <tbody>
                  {task.methods.map(method => (
                    <tr key={method.id}>
                      <td>{method.id}</td>
                      <td>{methodTranslations[method.method] || method.method}</td>
                      <td className={`status-${method.status}`}>
                        {statusTranslations[method.status] || method.status}
                      </td>
                      <td className="notes-column" title={method.notes}>
                        {method.notes?.length > 50 ? `${method.notes.substring(0, 50)}...` : method.notes}
                      </td>
                      <td>{formatDate(method.created_at)}</td>
                      <td>{formatDate(method.updated_at)}</td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            ) : (
              <p>אין שיטות התראה זמינות</p>
            )}
          </div>
        </div>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>
          סגור
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default AlertTaskModal;