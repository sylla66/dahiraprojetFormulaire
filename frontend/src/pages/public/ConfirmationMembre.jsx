import { Link } from "react-router-dom";

export default function ConfirmationMembre() {
  return (
    <div className="d-flex justify-content-center align-items-center" style={{ minHeight: "100vh", background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)" }}>
      <div className="card shadow-lg border-0" style={{ maxWidth: "500px", width: "100%", borderRadius: "15px" }}>
        <div className="card-body text-center p-5">
          <div className="mb-4">
            <i className="bi bi-check-circle-fill text-success" style={{ fontSize: "4rem" }}></i>
          </div>
          <h3 className="text-success mb-3">Adhesion confirmee !</h3>
          <p className="mb-4">
            Votre inscription a bien ete prise en compte. Bienvenue dans le Dahira !
          </p>
          <div className="alert alert-info text-start">
            <h6><i className="bi bi-info-circle"></i> Prochaines etapes</h6>
            <ol className="mb-0 small">
              <li>Un administrateur validera votre profil</li>
              <li>Vous serez informe des prochains evenements</li>
              <li>Vous pouvez des a present vous inscrire aux evenements</li>
            </ol>
          </div>
          <hr />
          <Link to="/login" className="btn btn-primary">
            <i className="bi bi-box-arrow-in-right"></i> Espace administrateur
          </Link>
        </div>
      </div>
    </div>
  );
}