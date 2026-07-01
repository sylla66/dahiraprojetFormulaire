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
    <div className="card shadow">
      <div className="card-header bg-info text-white">
        <h4 className="mb-0"><i className="bi bi-activity"></i> Toutes les activites</h4>
      </div>
      <div className="card-body">
        <div className="row mb-3">
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
          <table className="table table-hover">
            <thead className="table-light">
              <tr><th>Date</th><th>Utilisateur</th><th>Action</th><th>Details</th><th>Type</th></tr>
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
              {activites.length === 0 && <tr><td colSpan="5" className="text-center text-muted">Aucune activite</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
