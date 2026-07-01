import { useParams, Link } from "react-router-dom";

export default function ConfirmationInscription() {
  const { id } = useParams();

  return (
    <div className="d-flex justify-content-center align-items-center" style={{ minHeight: "100vh" }}>
      <div className="card shadow" style={{ maxWidth: "500px", width: "100%" }}>
        <div className="card-body text-center p-5">
          <div className="mb-4">
            <i className="bi bi-check-circle text-success" style={{ fontSize: "4rem" }}></i>
          </div>
          <h3 className="text-success mb-3">Inscription confirmee !</h3>
          <p className="mb-4">
            Votre inscription a bien ete prise en compte.
            Un administrateur validera votre cotisation ulterieurement.
          </p>
          <div className="alert alert-info text-start">
            <h6><i className="bi bi-info-circle"></i> Prochaines etapes</h6>
            <ol className="mb-0 small">
              <li>Presentez-vous le jour de l'evenement</li>
              <li>Un administrateur enregistrera votre cotisation sur place</li>
              <li>Vous recevrez un recu apres paiement</li>
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
