import React, { useEffect, useState } from "react";
import { Modal, Button, Form, Card, Row, Col } from "react-bootstrap";
import "./ChoosePlanModal.css";
import { fetchPlans } from "../../api/general_be_api";
import { updateCompanyPlan } from "../../api/company_api";

const ChoosePlanModal = ({ show, setShow, companyId }) => {
  const [selectedPlanId, setSelectedPlanId] = useState(null);
  const [plans, setPlans] = useState([])
  const [refreshing, setRefreshing] = useState(false);
  const [cardInfo, setCardInfo] = useState({
    number: "",
    expiry: "",
    cvv: "",
  });


  useEffect(() => {
    // fetch plans
    fetchPlans().then(setPlans)
  }, [])

  const handleClose = () => {
    setShow(false);
    setSelectedPlanId(null);
    setCardInfo({ number: "", expiry: "", cvv: "" });
  };

  const handleSubmit = async () => {
    alert("Demo-processing-payment - not fully implemented");

    try {
      setRefreshing(true)
      await updateCompanyPlan(companyId, selectedPlanId);
      setRefreshing(false)
      handleClose();
    } catch (error) {
      alert("Error on updating plan. please retry later or contact support")
    }
  };

  return (
    <Modal show={show} onHide={handleClose} centered className="plan-modal-wrapper">
      <div className="plan-modal-container">
        <Modal.Header closeButton className="plan-modal-header">
          <Modal.Title className="plan-modal-title">בחר מסלול</Modal.Title>
        </Modal.Header>
        <Modal.Body className="plan-modal-body">
          <Row className="plan-modal-plans-row">
            {plans.map((plan) => (
              <Col md={6} key={plan.id} className="plan-modal-plan-col">
                <Card
                  className={`plan-modal-card ${selectedPlanId === plan.id ? "plan-modal-card-selected" : ""
                    }`}
                  onClick={() => setSelectedPlanId(plan.id)}
                >
                  <Card.Body className="plan-modal-card-body">
                    <div className="plan-modal-plan-header">
                      <Form.Check
                        type="radio"
                        name="plan"
                        checked={selectedPlanId === plan.id}
                        onChange={() => setSelectedPlanId(plan.id)}
                        className="plan-modal-radio"
                        id={`plan-radio-${plan.id}`}
                      />
                      <label
                        htmlFor={`plan-radio-${plan.id}`}
                        className="plan-modal-plan-name"
                      >
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
            ))}
          </Row>

          {selectedPlanId && (
            <Form className="plan-modal-payment-form">
              <h4 className="plan-modal-payment-title">פרטי תשלום</h4>
              <Form.Group className="plan-modal-form-group">
                <Form.Label className="plan-modal-form-label">מספר כרטיס</Form.Label>
                <Form.Control
                  type="text"
                  value={cardInfo.number}
                  onChange={(e) => setCardInfo({ ...cardInfo, number: e.target.value })}
                  placeholder="1234 5678 9012 3456"
                  className="plan-modal-form-control"
                />
              </Form.Group>
              <div className="plan-modal-form-row">
                <Form.Group className="plan-modal-form-group plan-modal-form-group-half">
                  <Form.Label className="plan-modal-form-label">תוקף</Form.Label>
                  <Form.Control
                    type="text"
                    value={cardInfo.expiry}
                    onChange={(e) => setCardInfo({ ...cardInfo, expiry: e.target.value })}
                    placeholder="MM/YY"
                    className="plan-modal-form-control"
                  />
                </Form.Group>
                <Form.Group className="plan-modal-form-group plan-modal-form-group-half">
                  <Form.Label className="plan-modal-form-label">CVV</Form.Label>
                  <Form.Control
                    type="text"
                    value={cardInfo.cvv}
                    onChange={(e) => setCardInfo({ ...cardInfo, cvv: e.target.value })}
                    placeholder="123"
                    className="plan-modal-form-control"
                  />
                </Form.Group>
              </div>
            </Form>
          )}

          <div className="plan-modal-footer">
            <Button
              variant="primary"
              onClick={handleSubmit}
              disabled={!selectedPlanId || !cardInfo.number || !cardInfo.expiry || !cardInfo.cvv}
              className="plan-modal-submit-btn"
            >
              {refreshing ? <span className="spinner"></span> : "אשר ובצע תשלום"}
            </Button>
          </div>
        </Modal.Body>
      </div>
    </Modal>
  );
};

export default ChoosePlanModal;