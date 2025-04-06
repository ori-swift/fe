import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import './AllPlaybooks.css';
import { getPlaybooks } from '../../../api/playbook_api';
import { AppContext } from '../../../App';

const AllPlaybooks = () => {
  const [playbooks, setPlaybooks] = useState([]);
  const [filteredPlaybooks, setFilteredPlaybooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    search: '',
    docType: '',
    client: '',
    hasDocument: ''
  });

  const {selectedCompany} = useContext(AppContext)
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPlaybooks = async () => {
      try {
        const result = await getPlaybooks({company:selectedCompany.id});
        setPlaybooks(result);
        setFilteredPlaybooks(result);
      } catch (error) {
        console.error('Error fetching playbooks:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchPlaybooks();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [filters, playbooks]);

  const applyFilters = () => {
    let filtered = [...playbooks];

    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(
        p =>
          p.company_data?.name?.toLowerCase().includes(searchLower) ||
          p.client_data?.name?.toLowerCase().includes(searchLower)
      );
    }

    if (filters.docType) {
      filtered = filtered.filter(p => p.doc_type === filters.docType);
    }

    if (filters.client) {
      filtered = filtered.filter(p => p.client_data?.id === parseInt(filters.client));
    }

    if (filters.hasDocument === 'yes') {
      filtered = filtered.filter(p => p.document !== null);
    } else if (filters.hasDocument === 'no') {
      filtered = filtered.filter(p => p.document === null);
    }

    setFilteredPlaybooks(filtered);
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const handlePlaybookClick = (id) => {
    navigate(`/playbook/${id}`);
  };

  const resetFilters = () => {
    setFilters({
      search: '',
      docType: '',
      client: '',
      hasDocument: ''
    });
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('he-IL', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const countAlerts = (p) => {
    let count = 0;
    if (p.config?.phases) {
      p.config.phases.forEach(ph => {
        if (ph.alerts) {
          Object.values(ph.alerts).forEach(arr => count += arr.length);
        }
      });
    }
    return count;
  };

  const clientOptions = [...new Map(playbooks.filter(p => p.client_data).map(p => [p.client_data.id, p.client_data])).values()];
  const docTypeOptions = [...new Set(playbooks.filter(p => p.doc_type).map(p => p.doc_type))];

  if (loading) return <div className="all-playbooks-loading">טוען פלייבוקים...</div>;

  return (
    <div className="all-playbooks-container">
      <div className="all-playbooks-header">
        <h1>פלייבוקים</h1>
        <div className="all-playbooks-count">{filteredPlaybooks.length} מתוך {playbooks.length} פלייבוקים</div>
      </div>

      <div className="all-playbooks-filters">
        <div className="all-playbooks-filter-group">
          <input type="text" name="search" value={filters.search} onChange={handleFilterChange} placeholder="חיפוש לפי שם לקוח" className="all-playbooks-search-input" />
        </div>
        <div className="all-playbooks-filter-group">
          <select name="docType" value={filters.docType} onChange={handleFilterChange} className="all-playbooks-select">
            <option value="">כל סוגי המסמכים</option>
            {docTypeOptions.map(type => (
              <option key={type} value={type}>
                {type === 'tax_invoice' ? 'חשבונית מס' : type === 'proforma' ? 'חשבונית עסקה' : type}
              </option>
            ))}
          </select>
        </div>
        <div className="all-playbooks-filter-group">
          <select name="client" value={filters.client} onChange={handleFilterChange} className="all-playbooks-select">
            <option value="">כל הלקוחות</option>
            {clientOptions.map(client => (
              <option key={client.id} value={client.id}>{client.name}</option>
            ))}
          </select>
        </div>
        <div className="all-playbooks-filter-group">
          <select name="hasDocument" value={filters.hasDocument} onChange={handleFilterChange} className="all-playbooks-select">
            <option value="">כל המסמכים</option>
            <option value="yes">יש מסמך</option>
            <option value="no">אין מסמך</option>
          </select>
        </div>
        <button onClick={resetFilters} className="all-playbooks-reset-btn">איפוס סינון</button>
      </div>

      {filteredPlaybooks.length === 0 ? (
        <div className="all-playbooks-no-results">לא נמצאו פלייבוקים התואמים את הסינון שלך.</div>
      ) : (
        <table className="all-playbooks-table">
          <thead>
            <tr>
              <th>#</th>              
              <th>לקוח</th>
              <th>סוג מסמך</th>
              <th>שלבים</th>
              <th>התראות</th>
              <th>מסמך</th>
              <th>נוצר בתאריך</th>
              <th>ימי עבודה</th>
            </tr>
          </thead>
          <tbody>
            {filteredPlaybooks.map(playbook => (
              <tr key={playbook.id} onClick={() => handlePlaybookClick(playbook.id)} className="all-playbooks-row">
                <td>#{playbook.id}</td>
                
                <td>{playbook.client_data?.name || 'אין'}</td>
                <td>
                  {playbook.doc_type === 'tax_invoice' ? 'חשבונית מס' :
                   playbook.doc_type === 'proforma' ? 'חשבונית עסקה' : playbook.doc_type || '-'}
                </td>
                <td>{playbook.config?.phases?.length || 0}</td>
                <td>{countAlerts(playbook)}</td>
                <td>{playbook.document ? `#${playbook.document}` : '-'}</td>
                <td>{formatDate(playbook.created_at)}</td>
                <td>{playbook.only_business_days ? 'ימי עסקים בלבד' : 'כל הימים'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default AllPlaybooks;
