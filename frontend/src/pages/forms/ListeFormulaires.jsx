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
    <div className="card shadow">
      <div className="card-header bg-primary text-white d-flex justify-content-between align-items-center">
        <h4 className="mb-0"><i className="bi bi-ui-checks"></i> Mes formulaires</h4>
        <Link to="/forms/creer" className="btn btn-light">
          <i className="bi bi-plus-circle"></i> Creer
        </Link>
      </div>
      <div className="card-body">
        <div className="table-responsive">
          <table className="table table-hover">
            <thead className="table-light">
              <tr><th>Titre</th><th>Type</th><th>Cree par</th><th>Champs</th><th>Statut</th><th>Date</th><th>Actions</th></tr>
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
  );
}
