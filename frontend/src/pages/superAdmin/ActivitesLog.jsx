import { useState, useEffect } from "react";
import { superAdmin } from "../../services/api";

export default function ActivitesLog() {
  const [activites, setActivites] = useState([]);
  const [admins, setAdmins] = useState([]);
  const [filterAdmin, setFilterAdmin] = useState("");

  const load = () => {
    const params = {};
    if (filterAdmin) params.adminId = filterAdmin;
    superAdmin.getActivites(params).then((res) => setActivites(res.data));
  };

  useEffect(() => {
    superAdmin.getUtilisateurs().then((res) => setAdmins(res.data.filter((u) => u.role !== "super_admin")));
    load();
  }, [filterAdmin]);

  return (
    <div className="admin-page">
      <div className="page-hero mb-4">
        <div className="hero-pill"><i className="bi bi-activity"></i> Journal</div>
        <h3 className="mb-2">Toutes les activités</h3>
        <p className="text-muted mb-0">Consultez l’historique des actions réalisées par les administrateurs.</p>
      </div>

      <div className="card shadow-sm dashboard-card">
        <div className="card-body p-4">
          <div className="row mb-3 g-2">
            <div className="col-md-4">
              <select className="form-select" value={filterAdmin} onChange={(e) => setFilterAdmin(e.target.value)}>
                <option value="">Tous les admins</option>
                {admins.map((a) => (
                  <option key={a.id} value={a.id}>{a.prenom} {a.nom} ({a.username})</option>
                ))}
              </select>
            </div>
            <div className="col-md-2">
              <button className="btn btn-primary w-100" onClick={load}><i className="bi bi-search"></i></button>
            </div>
          </div>
          <div className="table-responsive">
            <table className="table align-middle mb-0">
              <thead>
                <tr><th>Date</th><th>Utilisateur</th><th>Action</th><th>Détails</th><th>Type</th></tr>
              </thead>
              <tbody>
                {activites.map((a) => (
                  <tr key={a.id}>
                    <td>{new Date(a.createdAt).toLocaleString("fr-FR")}</td>
                    <td>{a.utilisateur?.prenom} {a.utilisateur?.nom}</td>
                    <td>{a.action}</td>
                    <td>{a.details}</td>
                    <td><span className="badge bg-secondary">{a.typeActivite}</span></td>
                  </tr>
                ))}
                {activites.length === 0 && <tr><td colSpan="5" className="text-center text-muted">Aucune activité</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
