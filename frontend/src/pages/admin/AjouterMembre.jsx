import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { admin, auth } from "../../services/api";

export default function AjouterMembre() {
  const [form, setForm] = useState({ nom: "", prenom: "", telephone: "", email: "", localiteId: "", adresse: "", profession: "" });
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
      await admin.createMembre(form);
      navigate("/admin/membres");
    } catch (err) {
      setError(err.response?.data?.error || "Erreur");
    }
  };

  return (
    <div className="admin-page">
      <div className="page-hero mb-4">
        <div>
          <div className="hero-pill"><i className="bi bi-person-plus"></i> Nouveau membre</div>
          <h3 className="mb-2">Ajouter un membre</h3>
          <p className="text-muted mb-0">Renseignez les informations du nouveau membre et associez-le à une localité si nécessaire.</p>
        </div>
      </div>

      <div className="row justify-content-center">
        <div className="col-lg-7">
          <div className="card shadow-sm dashboard-card">
            <div className="card-body p-4 p-lg-5">
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
                  <label className="form-label">Téléphone</label>
                  <input type="text" className="form-control" name="telephone" value={form.telephone} onChange={handleChange} required />
                </div>
                <div className="mb-3">
                  <label className="form-label">Email</label>
                  <input type="email" className="form-control" name="email" value={form.email} onChange={handleChange} />
                </div>
                <div className="mb-3">
                  <label className="form-label">Localité</label>
                  <select className="form-select" name="localiteId" value={form.localiteId} onChange={handleChange}>
                    <option value="">-- Sélectionner --</option>
                    {localites.map((l) => <option key={l.id} value={l.id}>{l.nom}</option>)}
                  </select>
                </div>
                <div className="mb-3">
                  <label className="form-label">Adresse</label>
                  <input type="text" className="form-control" name="adresse" value={form.adresse} onChange={handleChange} />
                </div>
                <div className="mb-3">
                  <label className="form-label">Profession</label>
                  <input type="text" className="form-control" name="profession" value={form.profession} onChange={handleChange} />
                </div>
                <button type="submit" className="btn btn-primary w-100 mt-2">
                  <i className="bi bi-save me-2"></i> Enregistrer
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
