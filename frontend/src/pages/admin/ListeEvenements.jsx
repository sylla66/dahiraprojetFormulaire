import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { admin } from "../../services/api";

export default function ListeEvenements() {
  const [evenements, setEvenements] = useState([]);

  useEffect(() => {
    admin.getEvenements().then((res) => setEvenements(res.data));
  }, []);

  return (
    <div className="card shadow">
      <div className="card-header bg-primary text-white d-flex justify-content-between align-items-center">
        <h4 className="mb-0"><i className="bi bi-calendar2-event"></i> Tous les evenements</h4>
        <Link to="/admin/evenements/creer" className="btn btn-light">
          <i className="bi bi-plus-circle"></i> Creer
        </Link>
      </div>
      <div className="card-body">
        <div className="table-responsive">
          <table className="table table-hover">
            <thead className="table-light">
              <tr><th>Titre</th><th>Date</th><th>Lieu</th><th>Inscrits</th><th>Statut</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {evenements.map((e) => (
                <tr key={e.id}>
                  <td>{e.titre}</td>
                  <td>{new Date(e.dateEvenement).toLocaleDateString("fr-FR")}</td>
                  <td>{e.lieu || "-"}</td>
                  <td>
                    <span className="badge bg-info">{e.inscriptionCount || 0}</span>
                    <small className="text-muted ms-1">/{e.cotisationCount || 0} cot.</small>
                  </td>
                  <td>{e.estCloture ? <span className="badge bg-secondary">Clos</span> : <span className="badge bg-success">Actif</span>}</td>
                  <td>
                    <Link to={`/dashboard/evenement/${e.id}`} className="btn btn-sm btn-info me-1" title="Dashboard">
                      <i className="bi bi-eye"></i>
                    </Link>
                    <Link to={`/admin/evenements/${e.id}/gerer`} className="btn btn-sm btn-primary me-1" title="Gerer">
                      <i className="bi bi-gear"></i>
                    </Link>
                    <Link to={`/admin/evenements/${e.id}/modifier`} className="btn btn-sm btn-warning me-1" title="Modifier">
                      <i className="bi bi-pencil"></i>
                    </Link>
                  </td>
                </tr>
              ))}
              {evenements.length === 0 && <tr><td colSpan="6" className="text-center text-muted">Aucun evenement</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
