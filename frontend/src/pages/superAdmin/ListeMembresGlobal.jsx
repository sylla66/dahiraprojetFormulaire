import { useState, useEffect } from "react";
import { superAdmin } from "../../services/api";

export default function ListeMembresGlobal() {
  const [membres, setMembres] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    superAdmin.getMembresGlobal().then((res) => setMembres(res.data)).catch(() => {});
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleDelete = async (id, nom) => {
    if (!confirm(`Supprimer definitivement ${nom} et toutes ses donnees ?`)) return;
    await superAdmin.deleteMembreGlobal(id);
    load();
  };

  const filtered = membres.filter((m) =>
    !search || m.nom.toLowerCase().includes(search.toLowerCase()) ||
    m.prenom.toLowerCase().includes(search.toLowerCase()) ||
    (m.telephone && m.telephone.includes(search))
  );

  return (
    <div className="card shadow">
      <div className="card-header bg-danger text-white d-flex justify-content-between align-items-center">
        <h4 className="mb-0"><i className="bi bi-people-fill"></i> Tous les membres (Super Admin)</h4>
        <div className="d-flex gap-2">
          <a href="/api/super-admin/export/membres-pdf" className="btn btn-light btn-sm" target="_blank" rel="noopener noreferrer">
            <i className="bi bi-filetype-pdf"></i> PDF
          </a>
        </div>
      </div>
      <div className="card-body">
        <div className="mb-3">
          <input type="text" className="form-control" placeholder="Rechercher un membre..." value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <div className="table-responsive">
          <table className="table table-hover">
            <thead className="table-light">
              <tr><th>Nom</th><th>Prenom</th><th>Telephone</th><th>Email</th><th>Localite</th><th>Statut</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {filtered.map((m) => (
                <tr key={m.id}>
                  <td>{m.nom}</td>
                  <td>{m.prenom}</td>
                  <td>{m.telephone || "-"}</td>
                  <td><small>{m.email || "-"}</small></td>
                  <td>{m.localiteRef?.nom || "-"}</td>
                  <td><span className={`badge ${m.estActif ? "bg-success" : "bg-secondary"}`}>{m.estActif ? "Actif" : "Inactif"}</span></td>
                  <td>
                    <button className="btn btn-sm btn-danger" onClick={() => handleDelete(m.id, `${m.prenom} ${m.nom}`)}>
                      <i className="bi bi-trash"></i> Supprimer
                    </button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && <tr><td colSpan="7" className="text-center text-muted">Aucun membre</td></tr>}
            </tbody>
          </table>
        </div>
        <small className="text-muted">Total: {filtered.length} membres</small>
      </div>
    </div>
  );
}