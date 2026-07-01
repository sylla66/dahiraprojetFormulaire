import { useState, useEffect, useCallback } from "react";
import { Outlet, Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { notifs } from "../services/api";

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [nbNonLues, setNbNonLues] = useState(0);
  const [notifList, setNotifList] = useState([]);
  const [showNotifs, setShowNotifs] = useState(false);

  const loadNonLues = useCallback(async () => {
    try {
      const res = await notifs.nonLues();
      setNbNonLues(res.data.count);
    } catch {}
  }, []);

  const toggleNotifs = async () => {
    if (!showNotifs) {
      try {
        const res = await notifs.getAll({ limit: 10 });
        setNotifList(res.data.notifications);
      } catch {}
    }
    setShowNotifs(!showNotifs);
  };

  const handleLire = async (id) => {
    try {
      await notifs.lire(id);
      loadNonLues();
      setNotifList((prev) => prev.map((n) => (n.id === id ? { ...n, estLue: true } : n)));
    } catch {}
  };

  const handleLireToutes = async () => {
    try {
      await notifs.lireToutes();
      setNbNonLues(0);
      setNotifList((prev) => prev.map((n) => ({ ...n, estLue: true })));
    } catch {}
  };

  useEffect(() => {
    loadNonLues();
    const interval = setInterval(loadNonLues, 15000);
    return () => clearInterval(interval);
  }, [loadNonLues]);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div>
      <nav className="navbar navbar-expand-lg navbar-dark bg-primary">
        <div className="container-fluid">
          <Link className="navbar-brand" to="/">
            <i className="bi bi-calendar-event"></i> Dahira Gestion
          </Link>
          <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
            <span className="navbar-toggler-icon"></span>
          </button>
          <div className="collapse navbar-collapse" id="navbarNav">
            <ul className="navbar-nav me-auto">
              <li className="nav-item">
                <Link className="nav-link" to={user?.estSuperAdmin() ? "/super-admin" : "/"}>
                  <i className="bi bi-speedometer2"></i> Tableau de bord
                </Link>
              </li>
              {(user?.estAdmin() || user?.estSuperAdmin()) && (
                <>
                  <li className="nav-item dropdown">
                    <a className="nav-link dropdown-toggle" href="#" role="button" data-bs-toggle="dropdown">
                      <i className="bi bi-people"></i> Gestion
                    </a>
                    <ul className="dropdown-menu dropdown-menu-start">
                      <li className="dropdown-header"><i className="bi bi-people"></i> Membres</li>
                      {user?.estSuperAdmin() && <li><Link className="dropdown-item ps-4" to="/super-admin/membres"><i className="bi bi-globe"></i> Tous les membres</Link></li>}
                      <li><Link className="dropdown-item ps-4" to="/admin/membres"><i className="bi bi-list"></i> Gestion membres</Link></li>
                      <li><Link className="dropdown-item ps-4" to="/admin/membres/ajouter"><i className="bi bi-person-plus"></i> Ajouter un membre</Link></li>
                      <li><hr className="dropdown-divider" /></li>
                      <li className="dropdown-header"><i className="bi bi-calendar2-event"></i> Evenements</li>
                      <li><Link className="dropdown-item ps-4" to="/admin/evenements"><i className="bi bi-list"></i> Tous les evenements</Link></li>
                      <li><Link className="dropdown-item ps-4" to="/admin/evenements/creer"><i className="bi bi-plus-circle"></i> Creer un evenement</Link></li>
                    </ul>
                  </li>
                  <li className="nav-item dropdown">
                    <a className="nav-link dropdown-toggle" href="#" role="button" data-bs-toggle="dropdown">
                      <i className="bi bi-cash-stack"></i> Finance
                    </a>
                    <ul className="dropdown-menu dropdown-menu-start">
                      <li><Link className="dropdown-item" to="/admin/cotisations"><i className="bi bi-graph-up"></i> Suivi collecte</Link></li>
                      <li><Link className="dropdown-item" to="/admin/cotisations/types"><i className="bi bi-tags"></i> Gerer les types</Link></li>
                    </ul>
                  </li>
                  <li className="nav-item dropdown">
                    <a className="nav-link dropdown-toggle" href="#" role="button" data-bs-toggle="dropdown">
                      <i className="bi bi-tools"></i> Outils
                    </a>
                    <ul className="dropdown-menu dropdown-menu-start">
                      <li className="dropdown-header"><i className="bi bi-ui-checks"></i> Formulaires</li>
                      <li><Link className="dropdown-item ps-4" to="/forms"><i className="bi bi-list"></i> Mes formulaires</Link></li>
                      <li><Link className="dropdown-item ps-4" to="/forms/creer"><i className="bi bi-plus-circle"></i> Creer un formulaire</Link></li>
                      <li><hr className="dropdown-divider" /></li>
                      <li><Link className="dropdown-item" to="/admin/parametres-inscription"><i className="bi bi-calendar-range"></i> Inscriptions</Link></li>
                      <li><Link className="dropdown-item" to="/admin/historique"><i className="bi bi-clock-history"></i> Historique</Link></li>
                    </ul>
                  </li>
                  {user?.estSuperAdmin() && (
                    <li className="nav-item dropdown">
                      <a className="nav-link dropdown-toggle" href="#" role="button" data-bs-toggle="dropdown">
                        <i className="bi bi-shield-lock"></i> Administration
                      </a>
                      <ul className="dropdown-menu dropdown-menu-start">
                        <li className="dropdown-header"><i className="bi bi-speedometer2"></i> Super Admin</li>
                        <li><Link className="dropdown-item ps-4" to="/super-admin"><i className="bi bi-speedometer2"></i> Dashboard global</Link></li>
                        <li><Link className="dropdown-item ps-4" to="/super-admin/utilisateurs"><i className="bi bi-person-gear"></i> Gestion utilisateurs</Link></li>
                        <li><hr className="dropdown-divider" /></li>
                        <li className="dropdown-header"><i className="bi bi-geo"></i> Configuration</li>
                        <li><Link className="dropdown-item ps-4" to="/super-admin/localites"><i className="bi bi-geo-alt"></i> Gestion localites</Link></li>
                        <li><Link className="dropdown-item ps-4" to="/super-admin/compile"><i className="bi bi-table"></i> Vue compilee</Link></li>
                        <li><Link className="dropdown-item ps-4" to="/super-admin/activites"><i className="bi bi-activity"></i> Toutes les activites</Link></li>
                        <li><hr className="dropdown-divider" /></li>
                        <li><Link className="dropdown-item" to="/auth/register"><i className="bi bi-person-plus"></i> Creer un compte</Link></li>
                      </ul>
                    </li>
                  )}
                </>
              )}
            </ul>
            <ul className="navbar-nav">
              <li className="nav-item">
                <a className="nav-link position-relative" href="#" role="button" onClick={toggleNotifs}>
                  <i className="bi bi-bell" style={{ fontSize: "1.2rem" }}></i>
                  {nbNonLues > 0 && (
                    <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger" style={{ fontSize: "0.6rem" }}>
                      {nbNonLues > 99 ? "99+" : nbNonLues}
                    </span>
                  )}
                </a>
              </li>
              <li className="nav-item dropdown">
                <a className="nav-link dropdown-toggle" href="#" role="button" data-bs-toggle="dropdown">
                  <i className="bi bi-person-circle"></i> {user?.prenom} {user?.nom}
                </a>
                <ul className="dropdown-menu dropdown-menu-end">
                  <li className="dropdown-header text-muted">
                    {user?.estSuperAdmin() ? (
                      <span className="badge bg-warning text-dark"><i className="bi bi-shield-lock"></i> Super Admin</span>
                    ) : (
                      <span className="badge bg-info"><i className="bi bi-person"></i> Admin</span>
                    )}
                  </li>
                  <li><hr className="dropdown-divider" /></li>
                  <li><button className="dropdown-item" onClick={handleLogout}><i className="bi bi-box-arrow-right"></i> Deconnexion</button></li>
                </ul>
              </li>
            </ul>
          </div>
        </div>
      </nav>

      {showNotifs && (
        <div className="container-fluid" style={{ maxWidth: "500px", marginLeft: "auto", marginRight: "0" }}>
          <div className="card shadow-sm border-primary mt-1" style={{ position: "absolute", zIndex: 1050, right: 20, maxWidth: "420px" }}>
            <div className="card-header bg-light d-flex justify-content-between align-items-center py-2">
              <span><strong>Notifications</strong></span>
              <div>
                {nbNonLues > 0 && (
                  <button className="btn btn-sm btn-outline-primary me-1" onClick={handleLireToutes}>
                    Tout marquer lu
                  </button>
                )}
                <button className="btn btn-sm btn-outline-secondary" onClick={() => setShowNotifs(false)}>
                  <i className="bi bi-x"></i>
                </button>
              </div>
            </div>
            <div className="card-body p-0" style={{ maxHeight: "350px", overflowY: "auto" }}>
              {notifList.length === 0 ? (
                <p className="text-muted text-center py-3 mb-0">Aucune notification</p>
              ) : (
                <ul className="list-group list-group-flush">
                  {notifList.map((n) => (
                    <li key={n.id} className={`list-group-item list-group-item-action py-2 ${!n.estLue ? "bg-light" : ""}`}
                        style={{ cursor: n.lien ? "pointer" : "default" }}
                        onClick={() => {
                          if (!n.estLue) handleLire(n.id);
                          if (n.lien) navigate(n.lien);
                          setShowNotifs(false);
                        }}>
                      <div className="d-flex justify-content-between">
                        <small className={!n.estLue ? "fw-bold" : ""}>{n.message}</small>
                        {!n.estLue && <span className="badge bg-primary rounded-pill" style={{ width: 8, height: 8, padding: 0 }}></span>}
                      </div>
                      <small className="text-muted">{new Date(n.createdAt).toLocaleString("fr-FR")}</small>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="container-fluid mt-3">
        <Outlet />
      </div>
    </div>
  );
}
