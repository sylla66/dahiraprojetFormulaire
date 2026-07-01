import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { superAdmin } from "../../services/api";

export default function SuperDashboard() {
  const [data, setData] = useState(null);

  useEffect(() => {
    superAdmin.getDashboard().then((res) => setData(res.data));
  }, []);

  if (!data) return <div className="text-center mt-5"><div className="spinner-border" /></div>;

  return (
    <div>
      <h3 className="mb-4"><i className="bi bi-shield-lock"></i> Super Admin - Dashboard Global</h3>

      <div className="row mb-4">
        <div className="col-md-3 mb-3">
          <div className="card bg-primary text-white shadow text-center">
            <div className="card-body">
              <h1 className="display-5">{data.stats.totalMembres}</h1>
              <h5>Membres</h5>
            </div>
          </div>
        </div>
        <div className="col-md-3 mb-3">
          <div className="card bg-info text-white shadow text-center">
            <div className="card-body">
              <h1 className="display-5">{data.stats.totalEvenements}</h1>
              <h5>Evenements</h5>
            </div>
          </div>
        </div>
        <div className="col-md-3 mb-3">
          <div className="card bg-success text-white shadow text-center">
            <div className="card-body">
              <h1 className="display-5">{data.stats.totalAdmins}</h1>
              <h5>Admins actifs</h5>
            </div>
          </div>
        </div>
        <div className="col-md-3 mb-3">
          <div className="card bg-warning text-white shadow text-center">
            <div className="card-body">
              <h1 className="display-5">{data.stats.totalCotise.toLocaleString()} F</h1>
              <h5>Total collecte</h5>
            </div>
          </div>
        </div>
      </div>

      <div className="row mb-4">
        <div className="col-md-6 mb-3">
          <div className="card bg-secondary text-white shadow text-center">
            <div className="card-body">
              <h2>{data.stats.totalInscriptions}</h2>
              <h5>Total inscriptions</h5>
            </div>
          </div>
        </div>
        <div className="col-md-6 mb-3">
          <div className="card bg-dark text-white shadow text-center">
            <div className="card-body">
              <h2>{data.stats.totalCotisations}</h2>
              <h5>Total cotisations validees</h5>
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
              <ul className="list-group">
                {data.evenements.map((e) => (
                  <li key={e.id} className="list-group-item d-flex justify-content-between align-items-center">
                    <div>
                      <strong>{e.titre}</strong>
                      <br /><small className="text-muted">{new Date(e.dateEvenement).toLocaleDateString("fr-FR")} - {e.organisateur?.prenom} {e.organisateur?.nom}</small>
                    </div>
                    <Link to={`/dashboard/evenement/${e.id}`} className="btn btn-sm btn-outline-primary">
                      <i className="bi bi-eye"></i>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
        <div className="col-md-6 mb-4">
          <div className="card shadow">
            <div className="card-header bg-secondary text-white">
              <h5 className="mb-0"><i className="bi bi-people"></i> Administrateurs</h5>
            </div>
            <div className="card-body">
              <ul className="list-group">
                {data.admins.map((a) => (
                  <li key={a.id} className="list-group-item">
                    <i className="bi bi-person"></i> {a.prenom} {a.nom} ({a.username})
                    <br /><small className="text-muted">{a.localite || "N/A"} - {a.isActive ? <span className="badge bg-success">Actif</span> : <span className="badge bg-secondary">Inactif</span>}</small>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
