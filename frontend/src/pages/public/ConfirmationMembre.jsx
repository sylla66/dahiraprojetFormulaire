import { Link } from "react-router-dom";

export default function ConfirmationMembre() {
  return (
    <div className="public-page">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-lg-7">
            <div className="card shadow-sm dashboard-card">
              <div className="card-body p-4 p-lg-5 text-center">
                <div className="hero-pill mb-3"><i className="bi bi-check-circle-fill"></i> Confirmation</div>
                <div className="mb-4">
                  <i className="bi bi-check-circle-fill text-success" style={{ fontSize: "4rem" }}></i>
                </div>
                <h3 className="text-success mb-3">Adhésion confirmée !</h3>
                <p className="mb-4 text-muted">
                  Votre inscription a bien été prise en compte. Bienvenue dans le Dahira !
                </p>

                <div className="card bg-light border-0 text-start">
                  <div className="card-body">
                    <h6 className="fw-semibold"><i className="bi bi-info-circle me-2"></i> Prochaines étapes</h6>
                    <ol className="mb-0 small text-muted">
                      <li>Un administrateur validera votre profil.</li>
                      <li>Vous serez informé des prochains événements.</li>
                      <li>Vous pourrez dès à présent vous inscrire aux événements.</li>
                    </ol>
                  </div>
                </div>

                <div className="d-flex justify-content-center mt-4">
                  <Link to="/login" className="btn btn-primary">
                    <i className="bi bi-box-arrow-in-right me-2"></i> Espace administrateur
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}