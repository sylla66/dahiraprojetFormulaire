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
    <div className="row justify-content-center">
      <div className="col-md-6">
        <div className="card shadow">
          <div className="card-header bg-primary text-white">
            <h4 className="mb-0"><i className="bi bi-person-plus"></i> Creer un compte administrateur</h4>
          </div>
          <div className="card-body">
            {error && <div className="alert alert-danger">{error}</div>}
            <form onSubmit={handleSubmit}>
              <div className="row">
                <div className="col-md-6 mb-3">
                  <label className="form-label">Nom</label>
                  <input type="text" className="form-control" name="nom" value={form.nom} onChange={handleChange} required />
                </div>
                <div className="col-md-6 mb-3">
                  <label className="form-label">Prenom</label>
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
                  <label className="form-label">Telephone</label>
                  <input type="text" className="form-control" name="telephone" value={form.telephone} onChange={handleChange} />
                </div>
                <div className="col-md-6 mb-3">
                  <label className="form-label">Localite</label>
                  <select className="form-select" name="localite" value={form.localite} onChange={handleChange}>
                    <option value="">-- Selectionner --</option>
                    {localites.map((l) => <option key={l.id} value={l.nom}>{l.nom}</option>)}
                  </select>
                </div>
              </div>
              <div className="mb-3">
                <label className="form-label">Role</label>
                <select className="form-select" name="role" value={form.role} onChange={handleChange}>
                  <option value="admin">Administrateur</option>
                  <option value="super_admin">Super Administrateur</option>
                </select>
              </div>
              <button type="submit" className="btn btn-primary w-100">
                <i className="bi bi-person-plus"></i> Creer le compte
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
