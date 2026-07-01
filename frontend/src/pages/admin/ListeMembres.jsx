import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { admin } from "../../services/api";

export default function ListeMembres() {
  const [membres, setMembres] = useState([]);
  const [localites, setLocalites] = useState([]);
  const [filters, setFilters] = useState({ localite: "", search: "" });

  const load = () => {
    const params = {};
    if (filters.localite) params.localite = filters.localite;
    if (filters.search) params.search = filters.search;
    admin.getMembres(params).then((res) => setMembres(res.data));
  };

  useEffect(() => {
    load();
    admin.getMembres().then((res) => {
      const locs = [...new Set(res.data.filter((m) => m.localiteRef).map((m) => m.localiteRef))];
      setLocalites(locs);
    });
  }, [filters]);

  const handleDelete = async (id, nom) => {
    if (!confirm(`Supprimer ${nom} ?`)) return;
    await admin.deleteMembre(id);
    load();
  };

  return (
    <div className="admin-page">
      <div className="page-hero mb-4">
        <div>
          <div className="hero-pill"><i className="bi bi-people"></i> Gestion des membres</div>
          <h3 className="mb-2">Liste des membres</h3>
          <p className="text-muted mb-0">Consultez, filtrez et gérez facilement l’ensemble des membres enregistrés.</p>
        </div>
      </div>

      <div className="card shadow-sm dashboard-card">
        <div className="card-body p-4">
          <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-3">
            <h5 className="mb-0">Membres enregistrés</h5>
            <div className="d-flex gap-2">
              <a className="btn btn-outline-primary btn-sm" href="/api/export/membres" target="_blank" rel="noopener noreferrer">
                <i className="bi bi-filetype-pdf me-1"></i> PDF
              </a>
              <Link to="/admin/membres/ajouter" className="btn btn-primary btn-sm">
                <i className="bi bi-person-plus me-1"></i> Ajouter
              </Link>
            </div>
          </div>

          <div className="row g-2 mb-3">
            <div className="col-md-4">
              <select className="form-select" value={filters.localite} onChange={(e) => setFilters({ ...filters, localite: e.target.value })}>
                <option value="">Toutes les localites</option>
                {localites.map((l, i) => <option key={i} value={l.id}>{l.nom}</option>)}
              </select>
            </div>
            <div className="col-md-6">
              <input type="text" className="form-control" placeholder="Rechercher..." value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })} />
            </div>
            <div className="col-md-2">
              <button className="btn btn-primary w-100" onClick={load}><i className="bi bi-search"></i></button>
            </div>
          </div>

          <div className="table-responsive">
            <table className="table align-middle dashboard-table">
              <thead>
                <tr>
                  <th>Nom</th>
                  <th>Prénom</th>
                  <th>Téléphone</th>
                  <th>Email</th>
                  <th>Localité</th>
                  <th>Profession</th>
                  <th>Statut</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {membres.map((m) => (
                  <tr key={m.id}>
                    <td>{m.nom}</td>
                    <td>{m.prenom}</td>
                    <td>{m.telephone}</td>
                    <td>{m.email || "-"}</td>
                    <td>{m.localiteRef?.nom || "-"}</td>
                    <td>{m.profession || "-"}</td>
                    <td>{m.estActif ? <span className="badge bg-success">Actif</span> : <span className="badge bg-secondary">Inactif</span>}</td>
                    <td>
                      <Link to={`/admin/membres/${m.id}/modifier`} className="btn btn-sm btn-warning me-1">
                        <i className="bi bi-pencil"></i>
                      </Link>
                      <button className="btn btn-sm btn-danger" onClick={() => handleDelete(m.id, `${m.prenom} ${m.nom}`)}>
                        <i className="bi bi-trash"></i>
                      </button>
                    </td>
                  </tr>
                ))}
                {membres.length === 0 && <tr><td colSpan="8" className="text-center text-muted">Aucun membre</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
