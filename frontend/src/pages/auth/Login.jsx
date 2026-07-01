import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const { login, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) navigate(user.estSuperAdmin() ? "/super-admin" : "/");
  }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await login(username, password);
    } catch (err) {
      setError(err.response?.data?.error || "Erreur de connexion");
    }
  };

  return (
    <div className="auth-page d-flex align-items-center justify-content-center py-5">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-lg-5 col-md-7">
            <div className="card shadow-sm auth-card border-0">
              <div className="card-body p-4 p-lg-5">
                <div className="text-center mb-4">
                  <div className="auth-icon mb-3">
                    <i className="bi bi-calendar-event"></i>
                  </div>
                  <h3 className="fw-bold mb-2">Dahira Gestion</h3>
                  <p className="text-muted mb-0">Connectez-vous à votre espace de gestion</p>
                </div>

                {error && <div className="alert alert-danger">{error}</div>}
                <form onSubmit={handleSubmit}>
                  <div className="mb-3">
                    <label className="form-label">Nom d'utilisateur</label>
                    <div className="input-group">
                      <span className="input-group-text"><i className="bi bi-person"></i></span>
                      <input type="text" className="form-control" value={username}
                        onChange={(e) => setUsername(e.target.value)} required autoFocus />
                    </div>
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Mot de passe</label>
                    <div className="input-group">
                      <span className="input-group-text"><i className="bi bi-lock"></i></span>
                      <input type="password" className="form-control" value={password}
                        onChange={(e) => setPassword(e.target.value)} required />
                    </div>
                  </div>
                  <button type="submit" className="btn btn-primary w-100 mt-2">
                    <i className="bi bi-box-arrow-in-right me-2"></i> Se connecter
                  </button>
                </form>
                <hr />
                <div className="text-center">
                  <Link to="/inscription-membre" className="btn btn-outline-success btn-sm w-100">
                    <i className="bi bi-person-plus me-2"></i> Devenir membre du Dahira
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
