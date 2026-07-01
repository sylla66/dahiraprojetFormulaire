import { Outlet, Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

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
                <Link className="nav-link" to="/">
                  <i className="bi bi-speedometer2"></i> Tableau de bord
                </Link>
              </li>
              {(user?.estAdmin() || user?.estSuperAdmin()) && (
                <>
                  <li className="nav-item dropdown">
                    <a className="nav-link dropdown-toggle" href="#" role="button" data-bs-toggle="dropdown">
                      <i className="bi bi-people"></i> Membres
                    </a>
                    <ul className="dropdown-menu">
                      <li><Link className="dropdown-item" to="/admin/membres">Gestion membres</Link></li>
                      <li><Link className="dropdown-item" to="/admin/membres/ajouter">Ajouter un membre</Link></li>
                    </ul>
                  </li>
                  <li className="nav-item dropdown">
                    <a className="nav-link dropdown-toggle" href="#" role="button" data-bs-toggle="dropdown">
                      <i className="bi bi-ui-checks"></i> Formulaires
                    </a>
                    <ul className="dropdown-menu">
                      <li><Link className="dropdown-item" to="/forms">Mes formulaires</Link></li>
                      <li><Link className="dropdown-item" to="/forms/creer">Creer un formulaire</Link></li>
                    </ul>
                  </li>
                  <li className="nav-item dropdown">
                    <a className="nav-link dropdown-toggle" href="#" role="button" data-bs-toggle="dropdown">
                      <i className="bi bi-calendar2-event"></i> Evenements
                    </a>
                    <ul className="dropdown-menu">
                      <li><Link className="dropdown-item" to="/admin/evenements">Tous les evenements</Link></li>
                      <li><Link className="dropdown-item" to="/admin/evenements/creer">Creer un evenement</Link></li>
                    </ul>
                  </li>
                  <li className="nav-item">
                    <Link className="nav-link" to="/admin/historique">
                      <i className="bi bi-clock-history"></i> Mon historique
                    </Link>
                  </li>
                </>
              )}
              {user?.estSuperAdmin() && (
                <li className="nav-item dropdown">
                  <a className="nav-link dropdown-toggle" href="#" role="button" data-bs-toggle="dropdown">
                    <i className="bi bi-shield-lock"></i> Super Admin
                  </a>
                  <ul className="dropdown-menu">
                    <li><Link className="dropdown-item" to="/super-admin">Dashboard global</Link></li>
                    <li><Link className="dropdown-item" to="/super-admin/utilisateurs">Gestion utilisateurs</Link></li>
                    <li><Link className="dropdown-item" to="/super-admin/compile">Vue compilee</Link></li>
                    <li><Link className="dropdown-item" to="/super-admin/localites">Gestion localites</Link></li>
                    <li><Link className="dropdown-item" to="/super-admin/activites">Toutes les activites</Link></li>
                    <li><hr className="dropdown-divider" /></li>
                    <li><Link className="dropdown-item" to="/auth/register">Creer un compte</Link></li>
                  </ul>
                </li>
              )}
            </ul>
            <ul className="navbar-nav">
              <li className="nav-item dropdown">
                <a className="nav-link dropdown-toggle" href="#" role="button" data-bs-toggle="dropdown">
                  <i className="bi bi-person-circle"></i> {user?.prenom} {user?.nom}
                  {user?.estSuperAdmin() ? (
                    <span className="badge bg-warning text-dark ms-1">Super Admin</span>
                  ) : (
                    <span className="badge bg-info ms-1">Admin</span>
                  )}
                </a>
                <ul className="dropdown-menu dropdown-menu-end">
                  <li><button className="dropdown-item" onClick={handleLogout}><i className="bi bi-box-arrow-right"></i> Deconnexion</button></li>
                </ul>
              </li>
            </ul>
          </div>
        </div>
      </nav>
      <div className="container-fluid mt-3">
        <Outlet />
      </div>
    </div>
  );
}
