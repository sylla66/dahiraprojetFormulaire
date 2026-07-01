import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { auth } from "../../services/api";

export default function Register() {
  const [form, setForm] = useState({ username: "", email: "", password: "", nom: "", prenom: "", telephone: "", localite: "", role: "admin" });
  const [localites, setLocalites] = useState([]);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    auth.getLocalites().then((res) => setLocalites(res.data));
  }, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await auth.register(form);
      navigate("/super-admin/utilisateurs");
    } catch (err) {
      setError(err.response?.data?.error || "Erreur");
    }
  };

  return (
    <div className="auth-page d-flex align-items-center justify-content-center py-5">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-lg-7 col-md-9">
            <div className="card shadow-sm auth-card border-0">
              <div className="card-body p-4 p-lg-5">
                <div className="text-center mb-4">
                  <div className="auth-icon mb-3">
                    <i className="bi bi-person-plus"></i>
                  </div>
                  <h3 className="fw-bold mb-2">Créer un compte</h3>
                  <p className="text-muted mb-0">Ajoutez un administrateur ou un super administrateur</p>
                </div>

                {error && <div className="alert alert-danger">{error}</div>}
                <form onSubmit={handleSubmit}>
                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Nom</label>
                      <input type="text" className="form-control" name="nom" value={form.nom} onChange={handleChange} required />
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Prénom</label>
                      <input type="text" className="form-control" name="prenom" value={form.prenom} onChange={handleChange} required />
                    </div>
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Nom d'utilisateur</label>
                    <input type="text" className="form-control" name="username" value={form.username} onChange={handleChange} required />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Email</label>
                    <input type="email" className="form-control" name="email" value={form.email} onChange={handleChange} required />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Mot de passe</label>
                    <input type="password" className="form-control" name="password" value={form.password} onChange={handleChange} required />
                  </div>
                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Téléphone</label>
                      <input type="text" className="form-control" name="telephone" value={form.telephone} onChange={handleChange} />
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Localité</label>
                      <select className="form-select" name="localite" value={form.localite} onChange={handleChange}>
                        <option value="">-- Sélectionner --</option>
                        {localites.map((l) => <option key={l.id} value={l.nom}>{l.nom}</option>)}
                      </select>
                    </div>
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Rôle</label>
                    <select className="form-select" name="role" value={form.role} onChange={handleChange}>
                      <option value="admin">Administrateur</option>
                      <option value="super_admin">Super Administrateur</option>
                    </select>
                  </div>
                  <button type="submit" className="btn btn-primary w-100 mt-2">
                    <i className="bi bi-person-plus me-2"></i> Créer le compte
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
