import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { dashboard } from "../../services/api";
import { useAuth } from "../../contexts/AuthContext";

export default function DashboardHome() {
  const [data, setData] = useState(null);
  const { user } = useAuth();
  const isSuperAdmin = user?.estSuperAdmin?.();

  useEffect(() => {
    if (!isSuperAdmin) {
      dashboard.getStats().then((res) => setData(res.data));
    }
  }, [isSuperAdmin]);

  if (!data && !isSuperAdmin) {
    return <div className="text-center mt-5"><div className="spinner-border" /></div>;
  }

  if (isSuperAdmin) {
    return (
      <div className="dashboard-page">
        <div className="page-hero mb-4">
          <div>
            <div className="hero-pill"><i className="bi bi-stars"></i> Vue administration</div>
            <h3 className="mb-2">Tableau de bord</h3>
            <p className="text-muted mb-0">Les vues globales et la gestion avancée sont accessibles depuis la barre supérieure.</p>
          </div>
        </div>

        <div className="card shadow-sm dashboard-card">
          <div className="card-body p-4">
            <div className="d-flex align-items-center gap-3 mb-3">
              <div className="stat-card-icon primary">
                <i className="bi bi-shield-lock"></i>
              </div>
              <div>
                <h5 className="mb-1">Accès super administration</h5>
                <p className="text-muted mb-0">Vous pouvez gérer les utilisateurs, les localités et la vue globale depuis le menu.</p>
              </div>
            </div>
            <Link to="/super-admin" className="btn btn-primary">
              <i className="bi bi-arrow-right-circle me-2"></i> Ouvrir la vue globale
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-page">
      <div className="page-hero mb-4">
        <div>
          <div className="hero-pill"><i className="bi bi-speedometer2"></i> Tableau de bord</div>
          <h3 className="mb-2">Bonjour {user?.prenom || "Admin"} 👋</h3>
          <p className="text-muted mb-0">Voici un aperçu rapide de votre activité et des événements en cours.</p>
        </div>
      </div>

      <div className="row g-4 mb-4">
        <div className="col-md-4">
          <div className="card shadow-sm dashboard-card stat-card primary">
            <div className="card-body d-flex justify-content-between align-items-center">
              <div>
                <div className="stat-label">Membres</div>
                <h2 className="stat-value">{data.stats.totalMembres}</h2>
              </div>
              <div className="stat-card-icon primary">
                <i className="bi bi-people"></i>
              </div>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card shadow-sm dashboard-card stat-card success">
            <div className="card-body d-flex justify-content-between align-items-center">
              <div>
                <div className="stat-label">Événements</div>
                <h2 className="stat-value">{data.stats.totalEvenements}</h2>
              </div>
              <div className="stat-card-icon success">
                <i className="bi bi-calendar2-event"></i>
              </div>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card shadow-sm dashboard-card stat-card warning">
            <div className="card-body d-flex justify-content-between align-items-center">
              <div>
                <div className="stat-label">Total cotisé</div>
                <h2 className="stat-value">{data.stats.totalCotise.toLocaleString()} F</h2>
              </div>
              <div className="stat-card-icon warning">
                <i className="bi bi-cash-stack"></i>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="row g-4">
        <div className="col-lg-6">
          <div className="card shadow-sm dashboard-card h-100">
            <div className="card-header bg-transparent border-0 py-3">
              <h5 className="mb-0"><i className="bi bi-calendar2-event me-2"></i> Derniers événements</h5>
            </div>
            <div className="card-body pt-0">
              {data.evenements.length === 0 ? (
                <p className="text-muted mb-0">Aucun événement pour le moment.</p>
              ) : (
                <ul className="list-group list-group-flush">
                  {data.evenements.map((e) => (
                    <li key={e.id} className="list-group-item dashboard-list-item px-0">
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
        <div className="col-lg-6">
          <div className="card shadow-sm dashboard-card h-100">
            <div className="card-header bg-transparent border-0 py-3">
              <h5 className="mb-0"><i className="bi bi-people me-2"></i> Derniers membres</h5>
            </div>
            <div className="card-body pt-0">
              {data.membres.length === 0 ? (
                <p className="text-muted mb-0">Aucun membre enregistré.</p>
              ) : (
                <ul className="list-group list-group-flush">
                  {data.membres.map((m) => (
                    <li key={m.id} className="list-group-item dashboard-list-item px-0">
                      <div>
                        <strong>{m.prenom} {m.nom}</strong>
                        <br /><small className="text-muted">{m.telephone} - {m.localiteRef?.nom || "N/A"}</small>
                      </div>
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
