import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { forms, auth } from "../../services/api";

export default function ListeFormulaires() {
  const [formulaires, setFormulaires] = useState([]);

  useEffect(() => {
    forms.getAll().then((res) => setFormulaires(res.data));
  }, []);

  const handleDelete = async (id) => {
    if (!confirm("Supprimer ce formulaire ?")) return;
    await forms.delete(id);
    setFormulaires(formulaires.filter((f) => f.id !== id));
  };

  return (
    <div className="admin-page">
      <div className="page-hero mb-4">
        <div>
          <div className="hero-pill"><i className="bi bi-ui-checks"></i> Formulaires</div>
          <h3 className="mb-2">Mes formulaires</h3>
          <p className="text-muted mb-0">Gérez vos formulaires, consultez leurs champs et gardez une vue claire de leur état.</p>
        </div>
      </div>

      <div className="card shadow-sm dashboard-card">
        <div className="card-body p-4">
          <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-3">
            <h5 className="mb-0">Liste des formulaires</h5>
            <Link to="/forms/creer" className="btn btn-primary btn-sm">
              <i className="bi bi-plus-circle me-1"></i> Créer
            </Link>
          </div>

          <div className="table-responsive">
            <table className="table align-middle dashboard-table">
              <thead>
                <tr><th>Titre</th><th>Type</th><th>Créé par</th><th>Champs</th><th>Statut</th><th>Date</th><th>Actions</th></tr>
              </thead>
              <tbody>
                {formulaires.map((f) => {
                  const champs = JSON.parse(f.champsJson || "[]");
                  return (
                    <tr key={f.id}>
                      <td>{f.titre}</td>
                      <td><span className="badge bg-info">{f.typeEvenement}</span></td>
                      <td>{f.createur?.prenom} {f.createur?.nom}</td>
                      <td>{champs.length} champ(s)</td>
                      <td>{f.estActif ? <span className="badge bg-success">Actif</span> : <span className="badge bg-secondary">Inactif</span>}</td>
                      <td>{new Date(f.createdAt).toLocaleDateString("fr-FR")}</td>
                      <td>
                        <Link to={`/forms/${f.id}/modifier`} className="btn btn-sm btn-warning me-1">
                          <i className="bi bi-pencil"></i>
                        </Link>
                        <button className="btn btn-sm btn-danger" onClick={() => handleDelete(f.id)}>
                          <i className="bi bi-trash"></i>
                        </button>
                      </td>
                    </tr>
                  );
                })}
                {formulaires.length === 0 && <tr><td colSpan="7" className="text-center text-muted">Aucun formulaire</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
