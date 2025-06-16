// ChoosePlanModal.jsx
import React, { useContext, useEffect, useState } from "react";
import { Modal, Button, Form, Card, Row, Col, Alert } from "react-bootstrap";
import "./ChoosePlanModal.css";
import { fetchPlans } from "../../api/general_be_api";
import { createPaymentLink, updateCompanyPlan } from "../../api/billing_api";
import { AppContext } from "../../App";

const ChoosePlanModal = ({ show, setShow, companyId, currentPlanName }) => {
  const [selectedPlanId, setSelectedPlanId] = useState(null);
  const [plans, setPlans] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [phone, setPhone] = useState("");
  const [error, setError] = useState("");

  const needPaymentLink = currentPlanName === "restrict" || currentPlanName === "free-trial";

  const {refetchUserData} = useContext(AppContext)
  useEffect(() => {
    fetchPlans().then(setPlans);
  }, []);

  const handleClose = () => {
    setShow(false);
    setSelectedPlanId(null);
    setPhone("");
    setError("");
  };

  const shouldShowPlan = (plan) => {
    if (plan.name === "free-trial") return false;
    if (plan.name === currentPlanName) return false;
    return true;
  };

  const handleSubmit = async () => {
    setRefreshing(true);
    setError("");

    try {
      // console.log(needPaymentLink);
      // console.log(selectedPlanId, companyId);
      
      if (needPaymentLink) {
        const url = await createPaymentLink({
          plan_id: selectedPlanId,
          company_id: companyId,
          phone,
        });
        // console.log(url);
        // return;
        window.open(url, "_blank");
      } else {
        await updateCompanyPlan(companyId, selectedPlanId);
      }
      await refetchUserData();
      handleClose();
    } catch (e) {
      setError(`שגיאה ביצירת קישור תשלום. נסה שוב או פנה לתמיכה. מידע נוסף: ${e.message}`);
    }

    setRefreshing(false);
  };

  return (
    <Modal show={show} onHide={handleClose} centered className="plan-modal-wrapper">
      <div className="plan-modal-container">
        <Modal.Header closeButton className="plan-modal-header">
          <Modal.Title className="plan-modal-title">בחר מסלול</Modal.Title>
        </Modal.Header>
        <Modal.Body className="plan-modal-body">
          <Row className="plan-modal-plans-row">
            {plans.filter(shouldShowPlan).map((plan) => {
              const isSelected = selectedPlanId === plan.id;
              return (
                <Col md={6} key={plan.id} className="plan-modal-plan-col">
                  <Card
                    className={`plan-modal-card ${isSelected ? "plan-modal-card-selected" : ""}`}
                    onClick={() => setSelectedPlanId(plan.id)}
                  >
                    <Card.Body className="plan-modal-card-body">
                      <div className="plan-modal-plan-header">
                        <Form.Check
                          type="radio"
                          name="plan"
                          checked={isSelected}
                          onChange={() => setSelectedPlanId(plan.id)}
                          className="plan-modal-radio"
                          id={`plan-radio-${plan.id}`}
                        />
                        <label htmlFor={`plan-radio-${plan.id}`} className="plan-modal-plan-name">
                          {plan.price_nis} ₪ - {plan.name}
                        </label>
                      </div>
                      <div className="plan-modal-plan-details">
                        <div className="plan-modal-feature">
                          <span className="plan-modal-feature-label">התראות:</span>
                          <span className="plan-modal-feature-value">{plan.max_alerts}</span>
                        </div>
                        <div className="plan-modal-feature">
                          <span className="plan-modal-feature-label">אימיילים:</span>
                          <span className="plan-modal-feature-value">{plan.max_email}</span>
                        </div>
                        <div className="plan-modal-feature">
                          <span className="plan-modal-feature-label">SMS:</span>
                          <span className="plan-modal-feature-value">{plan.max_sms}</span>
                        </div>
                        <div className="plan-modal-feature">
                          <span className="plan-modal-feature-label">וואטסאפ:</span>
                          <span className="plan-modal-feature-value">{plan.max_whatsapp}</span>
                        </div>
                      </div>
                    </Card.Body>
                  </Card>
                </Col>
              );
            })}
          </Row>

          {needPaymentLink && (
            <Form.Group className="plan-modal-form-group mt-3">
              <Form.Label className="plan-modal-form-label">מספר טלפון</Form.Label>
              <Form.Control
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="05XXXXXXXX"
                className="plan-modal-form-control"
              />
            </Form.Group>
          )}

          {error && <Alert variant="danger" className="mt-3">{error}</Alert>}

          <div className="plan-modal-footer">
            <Button
              variant="primary"
              onClick={handleSubmit}
              disabled={!selectedPlanId || (needPaymentLink && !phone)}
              className="plan-modal-submit-btn"
            >
              {refreshing ? <span className="spinner"></span> : 
              needPaymentLink ? "המשך לתשלום": "המשך"}
            </Button>
          </div>
        </Modal.Body>
      </div>
    </Modal>
  );
};

export default ChoosePlanModal;

// // ChoosePlanModal.jsx
// import React, { useEffect, useState } from "react";
// import { Modal, Button, Form, Card, Row, Col, Alert } from "react-bootstrap";
// import "./ChoosePlanModal.css";
// import { fetchPlans } from "../../api/general_be_api";
// import { createPaymentLink } from "../../api/billing_api";


// const ChoosePlanModal = ({ show, setShow, companyId, currentPlanName }) => {
//   const [selectedPlanId, setSelectedPlanId] = useState(null);
//   const [plans, setPlans] = useState([]);
//   const [refreshing, setRefreshing] = useState(false);
//   const [phone, setPhone] = useState("");
//   const [error, setError] = useState("");

//   useEffect(() => {
//     fetchPlans().then(setPlans);
//   }, []);

//   const handleClose = () => {
//     setShow(false);
//     setSelectedPlanId(null);
//     setPhone("");
//     setError("");
//   };

//   const isRestrict = currentPlanName === "restrict";
//   const shouldShowPlan = (plan) => {
//     if (plan.name === "free-trial" && !isRestrict) return false;
//     if (plan.name === currentPlanName) return false;
//     return true;
//   };

//   const handleSubmit = async () => {
//     setRefreshing(true);
//     setError("");

//     try {
//       const url = await createPaymentLink({
//         plan_id: selectedPlanId,
//         company_id: companyId,
//         phone,
//       });      
//       console.log(url);
//       // return;
      
//       window.open(url, "_blank");
//       handleClose();
//     } catch (e) {
//       setError(`\u05e9\u05d2\u05d9\u05d0\u05d4 \u05d1\u05d9\u05e6\u05d9\u05e8\u05ea \u05e7\u05d9\u05e9\u05d5\u05e8 \u05ea\u05e9\u05dc\u05d5\u05dd. \u05e0\u05e1\u05d4 \u05e9\u05d5\u05d1 \u05d0\u05d5 \u05e4\u05e0\u05d4 \u05dc\u05ea\u05de\u05d9\u05db\u05d4. \u05de\u05d9\u05d3\u05e2 \u05e0\u05d5\u05e1\u05e3: ${e.message}`);
//     }

//     setRefreshing(false);
//   };

//   return (
//     <Modal show={show} onHide={handleClose} centered className="plan-modal-wrapper">
//       <div className="plan-modal-container">
//         <Modal.Header closeButton className="plan-modal-header">
//           <Modal.Title className="plan-modal-title">בחר מסלול</Modal.Title>
//         </Modal.Header>
//         <Modal.Body className="plan-modal-body">
//           <Row className="plan-modal-plans-row">
//             {plans.filter(shouldShowPlan).map((plan) => {
//               const isSelected = selectedPlanId === plan.id;
//               return (
//                 <Col md={6} key={plan.id} className="plan-modal-plan-col">
//                   <Card
//                     className={`plan-modal-card ${isSelected ? "plan-modal-card-selected" : ""}`}
//                     onClick={() => setSelectedPlanId(plan.id)}
//                   >
//                     <Card.Body className="plan-modal-card-body">
//                       <div className="plan-modal-plan-header">
//                         <Form.Check
//                           type="radio"
//                           name="plan"
//                           checked={isSelected}
//                           onChange={() => setSelectedPlanId(plan.id)}
//                           className="plan-modal-radio"
//                           id={`plan-radio-${plan.id}`}
//                         />
//                         <label htmlFor={`plan-radio-${plan.id}`} className="plan-modal-plan-name">
//                           {plan.price_nis} ₪ - {plan.name}
//                         </label>
//                       </div>
//                       <div className="plan-modal-plan-details">
//                         <div className="plan-modal-feature">
//                           <span className="plan-modal-feature-label">התראות:</span>
//                           <span className="plan-modal-feature-value">{plan.max_alerts}</span>
//                         </div>
//                         <div className="plan-modal-feature">
//                           <span className="plan-modal-feature-label">אימיילים:</span>
//                           <span className="plan-modal-feature-value">{plan.max_email}</span>
//                         </div>
//                         <div className="plan-modal-feature">
//                           <span className="plan-modal-feature-label">SMS:</span>
//                           <span className="plan-modal-feature-value">{plan.max_sms}</span>
//                         </div>
//                         <div className="plan-modal-feature">
//                           <span className="plan-modal-feature-label">וואטסאפ:</span>
//                           <span className="plan-modal-feature-value">{plan.max_whatsapp}</span>
//                         </div>
//                       </div>
//                     </Card.Body>
//                   </Card>
//                 </Col>
//               );
//             })}
//           </Row>

//           <Form.Group className="plan-modal-form-group mt-3">
//             <Form.Label className="plan-modal-form-label">מספר טלפון</Form.Label>
//             <Form.Control
//               type="text"
//               value={phone}
//               onChange={(e) => setPhone(e.target.value)}
//               placeholder="05XXXXXXXX"
//               className="plan-modal-form-control"
//             />
//           </Form.Group>

//           {error && <Alert variant="danger" className="mt-3">{error}</Alert>}

//           <div className="plan-modal-footer">
//             <Button
//               variant="primary"
//               onClick={handleSubmit}
//               disabled={!selectedPlanId || !phone}
//               className="plan-modal-submit-btn"
//             >
//               {refreshing ? <span className="spinner"></span> : "המשך לתשלום"}
//             </Button>
//           </div>
//         </Modal.Body>
//       </div>
//     </Modal>
//   );
// };

// export default ChoosePlanModal;
