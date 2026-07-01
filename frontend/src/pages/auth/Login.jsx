import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const { login, user } = useAuth();
  const navigate = useNavigate();

  if (user) {
    navigate(user.estSuperAdmin() ? "/super-admin" : "/");
    return null;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await login(username, password);
    } catch (err) {
      setError(err.response?.data?.error || "Erreur de connexion");
    }
  };

  return (
    <div className="container">
      <div className="row justify-content-center mt-5">
        <div className="col-md-5">
          <div className="card shadow">
            <div className="card-header bg-primary text-white text-center">
              <h4><i className="bi bi-calendar-event"></i> Dahira Gestion Evenements</h4>
              <p className="mb-0">Connectez-vous pour acceder a votre espace</p>
            </div>
            <div className="card-body">
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
                <button type="submit" className="btn btn-primary w-100">
                  <i className="bi bi-box-arrow-in-right"></i> Se connecter
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
