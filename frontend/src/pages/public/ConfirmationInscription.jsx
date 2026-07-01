import { useParams, Link } from "react-router-dom";

export default function ConfirmationInscription() {
  const { id } = useParams();

  return (
    <div className="confirmation-shell d-flex justify-content-center align-items-center">
      <div className="confirmation-card card shadow-lg border-0" style={{ maxWidth: "560px", width: "100%" }}>
        <div className="card-body text-center p-4 p-md-5">
          <div className="confirmation-badge mb-3">
            <i className="bi bi-stars"></i> Inscription enregistrée
          </div>

          <div className="confirmation-icon mb-4">
            <i className="bi bi-check-lg"></i>
          </div>

          <h2 className="fw-bold mb-3 text-success">Inscription confirmée !</h2>
          <p className="text-muted mb-4 px-2">
            Votre demande a bien été prise en compte. Un administrateur validera votre
            cotisation ultérieurement et vous accompagnera jusqu’à la confirmation finale.
          </p>

          <div className="confirmation-steps text-start">
            <div className="confirmation-step">
              <div className="step-icon">
                <i className="bi bi-calendar2-event"></i>
              </div>
              <div>
                <strong>Présentez-vous à l’événement</strong>
                <div className="small text-muted">Le jour prévu, avec votre justificatif si nécessaire.</div>
              </div>
            </div>

            <div className="confirmation-step">
              <div className="step-icon">
                <i className="bi bi-person-check"></i>
              </div>
              <div>
                <strong>Validation sur place</strong>
                <div className="small text-muted">Un administrateur enregistrera votre cotisation directement.</div>
              </div>
            </div>

            <div className="confirmation-step">
              <div className="step-icon">
                <i className="bi bi-receipt"></i>
              </div>
              <div>
                <strong>Reçu de paiement</strong>
                <div className="small text-muted">Vous recevrez votre reçu après la validation finale.</div>
              </div>
            </div>
          </div>

          <Link to="/login" className="confirmation-btn btn btn-primary mt-4 px-4 py-2">
            <i className="bi bi-box-arrow-in-right me-2"></i> Espace administrateur
          </Link>
        </div>
      </div>
    </div>
  );
}
