import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { cotisations, admin } from "../../services/api";

export default function SuiviCotisations() {
  const [stats, setStats] = useState(null);
  const [recents, setRecents] = useState([]);

  useEffect(() => {
    cotisations.getStats().then((res) => setStats(res.data));
    cotisations.getRecents().then((res) => setRecents(res.data));
  }, []);

  if (!stats) return <div className="text-center mt-5"><div className="spinner-border" /></div>;

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h4 className="mb-0"><i className="bi bi-cash-stack"></i> Suivi des cotisations recurrentes</h4>
        <Link to="/admin/cotisations/types" className="btn btn-primary">
          <i className="bi bi-gear"></i> Gerer les types
        </Link>
      </div>

      <div className="row mb-4">
        <div className="col-md-4 mb-3">
          <div className="card bg-success text-white shadow">
            <div className="card-body text-center">
              <h2 className="display-6">{stats.grandTotal.toLocaleString()} F</h2>
              <h6>Total general collecte</h6>
            </div>
          </div>
        </div>
        <div className="col-md-4 mb-3">
          <div className="card bg-info text-white shadow">
            <div className="card-body text-center">
              <h2 className="display-6">{stats.stats.length}</h2>
              <h6>Types de cotisations</h6>
            </div>
          </div>
        </div>
        <div className="col-md-4 mb-3">
          <div className="card bg-warning text-white shadow">
            <div className="card-body text-center">
              <h2 className="display-6">{stats.stats.reduce((s, st) => s + st.nbPaiements, 0)}</h2>
              <h6>Total paiements</h6>
            </div>
          </div>
        </div>
      </div>

      <div className="row">
        <div className="col-md-6 mb-4">
          <div className="card shadow">
            <div className="card-header bg-primary text-white">
              <h5 className="mb-0"><i className="bi bi-bar-chart"></i> Collecte par type</h5>
            </div>
            <div className="card-body">
              <div className="list-group">
                {stats.stats.map((s) => (
                  <Link key={s.id} to={`/admin/cotisations/${s.id}/paiements`} className="list-group-item list-group-item-action d-flex justify-content-between align-items-center">
                    <div>
                      <strong>{s.nom}</strong>
                      <br /><small className="text-muted">{s.nbPaiements} paiements</small>
                    </div>
                    <span className="badge bg-success rounded-pill fs-6">{s.total.toLocaleString()} F</span>
                  </Link>
                ))}
                {stats.stats.length === 0 && <div className="list-group-item text-muted">Aucune donnee</div>}
              </div>
            </div>
          </div>
        </div>

        <div className="col-md-6 mb-4">
          <div className="card shadow">
            <div className="card-header bg-info text-white">
              <h5 className="mb-0"><i className="bi bi-clock-history"></i> Derniers paiements</h5>
            </div>
            <div className="card-body p-0">
              <ul className="list-group list-group-flush">
                {recents.map((p) => (
                  <li key={p.id} className="list-group-item d-flex justify-content-between align-items-center">
                    <div>
                      <strong>{p.membreRef?.prenom} {p.membreRef?.nom}</strong>
                      <br /><small className="text-muted">{p.typeRef?.nom} - {p.mois}/{p.annee}</small>
                    </div>
                    <span className="badge bg-success">{p.montant.toLocaleString()} F</span>
                  </li>
                ))}
                {recents.length === 0 && <li className="list-group-item text-muted">Aucun paiement recent</li>}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}