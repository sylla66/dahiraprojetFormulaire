import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { dashboard } from "../../services/api";
import { useAuth } from "../../contexts/AuthContext";

export default function DashboardHome() {
  const [data, setData] = useState(null);
  const { user } = useAuth();

  useEffect(() => {
    if (!user?.estSuperAdmin()) {
      dashboard.getStats().then((res) => setData(res.data));
    }
  }, [user]);

  if (!data) return <div className="text-center mt-5"><div className="spinner-border" /></div>;

  return (
    <div>
      <h3 className="mb-4"><i className="bi bi-speedometer2"></i> Tableau de bord</h3>
      <div className="row mb-4">
        <div className="col-md-4 mb-3">
          <div className="card bg-primary text-white shadow">
            <div className="card-body text-center">
              <h1 className="display-4">{data.stats.totalMembres}</h1>
              <h5>Membres</h5>
            </div>
          </div>
        </div>
        <div className="col-md-4 mb-3">
          <div className="card bg-success text-white shadow">
            <div className="card-body text-center">
              <h1 className="display-4">{data.stats.totalEvenements}</h1>
              <h5>Evenements</h5>
            </div>
          </div>
        </div>
        <div className="col-md-4 mb-3">
          <div className="card bg-warning text-white shadow">
            <div className="card-body text-center">
              <h1 className="display-4">{data.stats.totalCotise.toLocaleString()} F</h1>
              <h5>Total cotise</h5>
            </div>
          </div>
        </div>
      </div>

      <div className="row">
        <div className="col-md-6 mb-4">
          <div className="card shadow">
            <div className="card-header bg-info text-white">
              <h5 className="mb-0"><i className="bi bi-calendar2-event"></i> Derniers evenements</h5>
            </div>
            <div className="card-body">
              {data.evenements.length === 0 ? (
                <p className="text-muted">Aucun evenement</p>
              ) : (
                <ul className="list-group">
                  {data.evenements.map((e) => (
                    <li key={e.id} className="list-group-item d-flex justify-content-between align-items-center">
                      <div>
                        <strong>{e.titre}</strong>
                        <br /><small className="text-muted">{new Date(e.dateEvenement).toLocaleDateString("fr-FR")}</small>
                      </div>
                      <Link to={`/dashboard/evenement/${e.id}`} className="btn btn-sm btn-outline-primary">
                        <i className="bi bi-eye"></i>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
        <div className="col-md-6 mb-4">
          <div className="card shadow">
            <div className="card-header bg-secondary text-white">
              <h5 className="mb-0"><i className="bi bi-people"></i> Derniers membres</h5>
            </div>
            <div className="card-body">
              {data.membres.length === 0 ? (
                <p className="text-muted">Aucun membre</p>
              ) : (
                <ul className="list-group">
                  {data.membres.map((m) => (
                    <li key={m.id} className="list-group-item">
                      <i className="bi bi-person"></i> {m.prenom} {m.nom}
                      <br /><small className="text-muted">{m.telephone} - {m.localiteRef?.nom || "N/A"}</small>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
