import React, { useEffect, useState, useCallback, useMemo } from "react";
import "./ProviderSettings.css";
import { refreshProviderData, fetchProviders } from "../../api/general_be_api";
import { deleteCompany, updateCompany, updateCompanyProvider } from "../../api/company_api";
import ChoosePlanModal from "../ChoosePlanModal/ChoosePlanModal";
import CompanyShareModal from "../CompanyShareModal/CompanyShareModal";

const TABS = {
  COMPANY: 'company',
  PROVIDER: 'provider',
  PLANS: 'plans'
};

const ProviderSettings = ({ ps }) => {
  // ----- state -----
  const [providers, setProviders] = useState({});
  const [requiredFields, setRequiredFields] = useState({});
  const [companyFormData, setCompanyFormData] = useState({
    company_name: "",
    email: "",
    language: "he",
    net_days: 0
  });
  const [providerFormData, setProviderFormData] = useState({});
  const [selectedProvider, setSelectedProvider] = useState("");

  const [activeTab, setActiveTab] = useState(TABS.COMPANY);
  const [isEditingCompany, setIsEditingCompany] = useState(false);
  const [isEditingProvider, setIsEditingProvider] = useState(false);

  const [errorCompany, setErrorCompany] = useState("");
  const [errorProvider, setErrorProvider] = useState("");

  const [loadingCompany, setLoadingCompany] = useState(false);
  const [loadingProvider, setLoadingProvider] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const [showChoosePlanModal, setShowChoosePlanModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [show, setShow] = useState(false);

  // ----- memoized values -----
  const isAdmin = useMemo(() => ps.relation === "admin", [ps.relation]);
  const planName = useMemo(() => ps.plan?.name || "", [ps.plan]);

  // ----- effects -----
  useEffect(() => {
    const initializeData = async () => {
      try {
        const data = await fetchProviders();
        setProviders(data);

        // Set current provider and required fields
        const provider = Object.values(data).find((p) => p.name === ps.provider_name);
        if (provider) {
          setSelectedProvider(String(provider.id));
          const fields = provider.req_fields || {};
          setRequiredFields(fields);

          // Initialize provider form data
          const initialProviderData = Object.keys(fields).reduce((acc, key) => {
            acc[key] = ps.cred_json?.[key] || "";
            return acc;
          }, {});
          setProviderFormData(initialProviderData);
        }

        // Initialize company form data
        setCompanyFormData({
          company_name: ps.company_name || "",
          email: ps.email || "",
          language: ps.language || "he",
          // net_days: ps.net_days || 0,
          // useDocumentDate: (ps.net_days || 0) === 0  // add this line
          net_days: ps.net_days ?? 0,
          useDocumentDate: ps.net_days === -1
        });

      } catch (error) {
        setErrorCompany("שגיאה בטעינת רשימת ספקים");
      }
    };

    initializeData();
  }, [ps]);

  // ----- handlers -----
  const handleCompanyChange = useCallback((e) => {
    const { name, value, type, checked } = e.target;
    setCompanyFormData(prev => ({
      ...prev,
      [name]: type === "checkbox"
        ? checked
        : name === "net_days"
          ? parseInt(value) || 0
          : value
    }));
  }, []);

  const handleProviderChange = useCallback((e) => {
    const { name, value } = e.target;
    setProviderFormData(prev => ({ ...prev, [name]: value }));
  }, []);

  const handleProviderSelect = useCallback((e) => {
    const providerId = e.target.value;
    setSelectedProvider(providerId);

    if (!providerId) {
      setRequiredFields({});
      setProviderFormData({});
      return;
    }

    const selected = providers[providerId];
    const newFields = selected?.req_fields || {};

    setRequiredFields(
      Object.entries(newFields).reduce((acc, [k, v]) => {
        acc[k] = { nickname: v.nickname, type: v.type };
        return acc;
      }, {})
    );

    setProviderFormData(
      Object.keys(newFields).reduce((acc, key) => ({ ...acc, [key]: "" }), {})
    );
  }, [providers]);

  const handleDeleteCompany = useCallback(async () => {
    if (!window.confirm("האם אתה בטוח שברצונך למחוק את החברה?")) return;

    try {
      await deleteCompany(ps.id);
    } catch (error) {
      alert("שגיאה במחיקת החברה");
    }
  }, [ps.id]);

  const handleSaveCompany = useCallback(async () => {
    setLoadingCompany(true);
    setErrorCompany("");

    try {
      const { useDocumentDate, net_days, ...rest } = companyFormData;
      // const payload = useDocumentDate ? rest : { ...rest, net_days };

      await updateCompany({
        ...companyFormData,
        net_days: companyFormData.useDocumentDate ? -1 : companyFormData.net_days,
      }, ps.id);

      alert("הפרטים הכלליים עודכנו בהצלחה");
      setIsEditingCompany(false);
    } catch (error) {
      setErrorCompany("שגיאה בעדכון פרטי החברה");
    } finally {
      setLoadingCompany(false);
    }
  }, [companyFormData, ps.id]);

  const handleSaveProvider = useCallback(async () => {
    // Validate required fields
    const emptyField = Object.entries(requiredFields).find(
      ([key, field]) => !providerFormData[key]?.trim()
    );

    if (emptyField) {
      setErrorProvider(`${emptyField[1].nickname} לא יכול להיות ריק`);
      return;
    }

    setLoadingProvider(true);
    setErrorProvider("");

    try {
      await updateCompanyProvider(
        { ...providerFormData, provider_id: selectedProvider },
        ps.id
      );
      alert("הפרטים של הספק עודכנו בהצלחה");
      setIsEditingProvider(false);
    } catch (error) {
      setErrorProvider("שגיאה בעדכון נתוני הספק");
    } finally {
      setLoadingProvider(false);
    }
  }, [providerFormData, requiredFields, selectedProvider, ps.id]);

  const handleRefreshData = useCallback(async () => {
    setRefreshing(true);
    try {
      await refreshProviderData(ps.id);
      alert("הנתונים יתעדכנו במהלך הדקות הקרובות");
    } catch (error) {
      alert("שגיאה ברענון נתונים");
    } finally {
      setRefreshing(false);
    }
  }, [ps.id]);

  const handleCancelCompanyEdit = useCallback(() => {
    setIsEditingCompany(false);
    setErrorCompany("");
    // Reset form to original values
    setCompanyFormData({
      company_name: ps.company_name || "",
      email: ps.email || "",
      language: ps.language || "he",
      net_days: ps.net_days || 0,
      useDocumentDate: ps.net_days === -1
    });
  }, [ps]);

  const handleCancelProviderEdit = useCallback(() => {
    setIsEditingProvider(false);
    setErrorProvider("");
    setSelectedProvider(String(ps.provider_id));
    // Reset provider form data
    const provider = Object.values(providers).find((p) => p.name === ps.provider_name);
    if (provider) {
      const fields = provider.req_fields || {};
      setProviderFormData(
        Object.keys(fields).reduce((acc, key) => {
          acc[key] = ps.cred_json?.[key] || "";
          return acc;
        }, {})
      );
    }
  }, [ps, providers]);

  // ----- render helpers -----
  const renderField = (label, content, compact = true) => (
    <div className={`settings-field ${compact ? 'compact' : ''}`}>
      <label>{label}</label>
      <div className="field-content">{content}</div>
    </div>
  );

  const renderActionButtons = (isEditing, onSave, onCancel, isLoading) => (
    <div className="settings-actions">
      {isEditing ? (
        <>
          <button className="btn-save" onClick={onSave} disabled={isLoading}>
            {isLoading ? <span className="spinner" /> : "שמור"}
          </button>
          <button className="btn-cancel" onClick={onCancel}>ביטול</button>
        </>
      ) : (
        isAdmin && (
          <button className="btn-edit" onClick={() => isEditing === false && (activeTab === TABS.COMPANY ? setIsEditingCompany(true) : setIsEditingProvider(true))}>
            ערוך
          </button>
        )
      )}
    </div>
  );

  // ----- tab content renderers -----
  const renderCompanyTab = () => (
    <div className="tab-content">
      <div className="tab-header">
        <h3>פרטי חברה</h3>
        {renderActionButtons(isEditingCompany, handleSaveCompany, handleCancelCompanyEdit, loadingCompany)}
      </div>

      <div className="fields-grid">
        {renderField(
          "שם החברה",
          isEditingCompany ? (
            <input
              name="company_name"
              value={companyFormData.company_name}
              onChange={handleCompanyChange}
              className="input-compact"
            />
          ) : (
            <span className="field-value">{companyFormData.company_name}</span>
          )
        )}

        {renderField(
          "שפה",
          isEditingCompany ? (
            <select
              name="language"
              value={companyFormData.language}
              onChange={handleCompanyChange}
              className="input-compact"
            >
              <option value="he">עברית</option>
              <option value="en">English</option>
              <option value="fr">Français</option>
              <option value="ru">Русский</option>
              <option value="ar">العربية</option>
            </select>
          ) : (
            <span className="field-value">{companyFormData.language}</span>
          )
        )}

        {renderField(
          "אימייל",
          isEditingCompany ? (
            <input
              name="email"
              type="email"
              value={companyFormData.email}
              onChange={handleCompanyChange}
              className="input-compact"
            />
          ) : (
            <span className="field-value">{companyFormData.email || "—"}</span>
          )
        )}

        {renderField(
          "תנאי התשלום: שוטף פלוס",
          <>
            {isEditingCompany ? (
              <>
                {!companyFormData.useDocumentDate && (
                  <input
                    name="net_days"
                    type="number"
                    min="0"
                    value={companyFormData.net_days === -1? 0 : companyFormData.net_days}
                    onChange={handleCompanyChange}
                    className="input-compact input-number"
                  />
                )}
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    name="useDocumentDate"
                    checked={companyFormData.useDocumentDate}
                    onChange={handleCompanyChange}
                  />
                  קח את מועד התשלום מתוך המסמך
                </label>
              </>
            ) : (              
              <span className="field-value">                
                { companyFormData.net_days === -1 ? "יילקח מתוך המסמך" : companyFormData.net_days}
                
              </span>
            )}
          </>
        )}
      </div>

      {errorCompany && <div className="error-message">{errorCompany}</div>}
    </div>
  );

  const renderProviderTab = () => (
    <div className="tab-content">
      <div className="tab-header">
        <h3>הגדרות ספק</h3>
        <div className="header-actions">
          {renderActionButtons(isEditingProvider, handleSaveProvider, handleCancelProviderEdit, loadingProvider)}
          <button className="btn-refresh" onClick={handleRefreshData} disabled={refreshing}>
            {refreshing ? <span className="spinner" /> : "🔄 רענן נתונים"}
          </button>
        </div>
      </div>

      <div className="fields-grid">
        {renderField(
          "ספק",
          isEditingProvider ? (
            <select value={selectedProvider} onChange={handleProviderSelect} className="input-compact">
              <option value="">-- בחר ספק --</option>
              {Object.entries(providers).map(([id, provider]) => (
                <option key={id} value={id}>
                  {provider.name}
                </option>
              ))}
            </select>
          ) : (
            <span className="field-value">{ps.provider_name}</span>
          )
        )}

        {Object.entries(requiredFields).map(([key, field]) =>
          renderField(
            field.nickname,
            isEditingProvider && (
              <input
                name={key}
                type={field.type === "password" ? "password" : "text"}
                value={providerFormData[key] || ""}
                onChange={handleProviderChange}
                className="input-compact"
              />
            )
          )
        )}
      </div>

      {errorProvider && <div className="error-message">{errorProvider}</div>}
    </div>
  );

  const renderPlansTab = () => (
    <div className="tab-content">
      <div className="tab-header">
        <h3>תוכניות ושיתופים</h3>
      </div>

      <div className="fields-grid">
        {renderField(
          "תוכנית נוכחית",
          <div className="plan-display">
            <span className={`plan-badge plan-badge-${planName.toLowerCase().replace(" ", "-")}`}>
              {planName}
            </span>
            {isAdmin && (
              <button className="btn-action" onClick={() => setShowChoosePlanModal(true)}>
                שנה תוכנית
              </button>
            )}
          </div>
        )}

        {isAdmin && renderField(
          "ניהול שיתופים",
          <button className="btn-action" onClick={() => setShowShareModal(true)}>
            פתח ניהול שיתופים
          </button>
        )}

        {isAdmin && renderField(
          "פעולות מתקדמות",
          <button className="btn-danger" onClick={handleDeleteCompany}>
            🗑️ מחק חברה
          </button>
        )}
      </div>
    </div>
  );

  // ----- render -----
  return (
    <div className="provider-settings-wrapper">
      <ChoosePlanModal
        show={showChoosePlanModal}
        setShow={setShowChoosePlanModal}
        companyId={ps.id}
        currentPlanName={planName}
      />
      <CompanyShareModal
        show={showShareModal}
        setShow={setShowShareModal}
        companyId={ps.id}
      />

      <button
        className="settings-toggle-btn"
        onClick={() => setShow(!show)}
      >
        {show ? "סגור הגדרות" : "⚙️ הגדרות"}
      </button>

      {show && (
        <div className="settings-panel">
          <div className="settings-header">
            <h2 className="settings-title">הגדרות {companyFormData.company_name}</h2>
          </div>

          <div className="settings-tabs">
            <button
              className={`tab-btn ${activeTab === TABS.COMPANY ? 'active' : ''}`}
              onClick={() => setActiveTab(TABS.COMPANY)}
            >
              פרטי חברה
            </button>
            <button
              className={`tab-btn ${activeTab === TABS.PROVIDER ? 'active' : ''}`}
              onClick={() => setActiveTab(TABS.PROVIDER)}
            >
              הגדרות ספק
            </button>
            <button
              className={`tab-btn ${activeTab === TABS.PLANS ? 'active' : ''}`}
              onClick={() => setActiveTab(TABS.PLANS)}
            >
              תוכניות ושיתופים
            </button>
          </div>

          <div className="settings-body">
            {activeTab === TABS.COMPANY && renderCompanyTab()}
            {activeTab === TABS.PROVIDER && renderProviderTab()}
            {activeTab === TABS.PLANS && renderPlansTab()}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProviderSettings;