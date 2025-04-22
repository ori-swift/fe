import { useContext, useEffect, useState } from "react";
import "./AlertTasksPage.css";
import { fetchAlertTasks } from "../../../api/alerts_api";
import AlertTaskModal from "../AlertTaskModal/AlertTaskModal";
import { AppContext } from "../../../App";


export default function AlertTasksPage() {
  const [tasks, setTasks] = useState([]);
  const [filters, setFilters] = useState({
    clientId: "",
    documentId: "",
    status: "",
    startDate: "",
    endDate: "",
  });
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ next: null, previous: null });
  const [selectedTask, setSelectedTask] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const {selectedCompany} = useContext(AppContext)
  console.log(selectedCompany);
  
  useEffect(() => {
    loadTasks();
  }, [page]);

  const loadTasks = async () => {
    const data = await fetchAlertTasks({ ...filters, companyId: selectedCompany.id, page });
    setTasks(data.results || []);
    setPagination({ next: data.next, previous: data.previous });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFilters({ ...filters, [name]: value });
  };

  const handleFilter = (e) => {
    e.preventDefault();
    setPage(1);
    loadTasks();
  };

  const handleRowClick = (task) => {
    setSelectedTask(task);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
  };

  // Status translations
  const statusTranslations = {
    "pending": "ממתין",
    "in_progress": "בתהליך",
    "completed": "הושלם",
    "failed": "נכשל"
  };

  return (
    <div className="alert-tasks-container">
      <h2 className="alert-tasks-title">משימות התראה</h2>
      <form className="alert-tasks-filter" onSubmit={handleFilter}>
        <input type="number" name="clientId" placeholder="מזהה לקוח" value={filters.clientId} onChange={handleChange} />
        <input type="number" name="documentId" placeholder="מזהה מסמך" value={filters.documentId} onChange={handleChange} />
        <select name="status" value={filters.status} onChange={handleChange}>
          <option value="">בחר סטטוס</option>
          <option value="pending">ממתין</option>
          <option value="in_progress">בתהליך</option>
          <option value="completed">הושלם</option>
          <option value="failed">נכשל</option>
        </select>
        <input type="date" name="startDate" value={filters.startDate} onChange={handleChange} placeholder="תאריך התחלה" />
        <input type="date" name="endDate" value={filters.endDate} onChange={handleChange} placeholder="תאריך סיום" />
        <button type="submit" className="alert-tasks-button">סנן</button>
      </form>

      <div className="alert-tasks-table-container">
        <table className="alert-tasks-table">
          <thead>
            <tr>
              <th>מזהה</th>
              <th>מזהה לקוח</th>
              <th>סטטוס</th>
              <th>זמן מתוזמן</th>
            </tr>
          </thead>
          <tbody>
            {tasks.map(task => (
              <tr key={task.id} onClick={() => handleRowClick(task)} className="alert-tasks-row">
                <td>{task.id}</td>
                <td>{task.client_id}</td>
                <td className={`status-${task.status}`}>{statusTranslations[task.status] || task.status}</td>
                <td>{new Date(task.scheduled_time).toLocaleString('he-IL')}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="alert-tasks-pagination">
        <button
          className="alert-tasks-button"
          disabled={!pagination.previous}
          onClick={() => setPage(prev => Math.max(prev - 1, 1))}
        >
          הקודם
        </button>
        <span className="alert-tasks-page-number">עמוד {page}</span>
        <button
          className="alert-tasks-button"
          disabled={!pagination.next}
          onClick={() => setPage(prev => prev + 1)}
        >
          הבא
        </button>
      </div>

      {selectedTask && (
        <AlertTaskModal
          show={showModal} 
          task={selectedTask} 
          onHide={handleCloseModal} 
        />
      )}
    </div>
  );
}