import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { admin, auth } from "../../services/api";

export default function ModifierMembre() {
  const { id } = useParams();
  const [form, setForm] = useState(null);
  const [localites, setLocalites] = useState([]);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    auth.getLocalites().then((res) => setLocalites(res.data));
    admin.getMembres({}).then((res) => {
      const membre = res.data.find((m) => m.id === parseInt(id));
      if (membre) setForm(membre);
    });
  }, [id]);

  const handleChange = (e) => {
    const val = e.target.type === "checkbox" ? e.target.checked : e.target.value;
    setForm({ ...form, [e.target.name]: val });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await admin.updateMembre(id, form);
      navigate("/admin/membres");
    } catch (err) {
      setError(err.response?.data?.error || "Erreur");
    }
  };

  if (!form) return <div className="text-center mt-5"><div className="spinner-border" /></div>;

  return (
    <div className="admin-page">
      <div className="page-hero mb-4">
        <div>
          <div className="hero-pill"><i className="bi bi-pencil"></i> Modification</div>
          <h3 className="mb-2">Modifier le membre</h3>
          <p className="text-muted mb-0">Mettez à jour les informations du membre et ajustez son statut si nécessaire.</p>
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
                  <input type="email" className="form-control" name="email" value={form.email || ""} onChange={handleChange} />
                </div>
                <div className="mb-3">
                  <label className="form-label">Localité</label>
                  <select className="form-select" name="localiteId" value={form.localiteId || ""} onChange={handleChange}>
                    <option value="">-- Sélectionner --</option>
                    {localites.map((l) => <option key={l.id} value={l.id}>{l.nom}</option>)}
                  </select>
                </div>
                <div className="mb-3">
                  <label className="form-label">Adresse</label>
                  <input type="text" className="form-control" name="adresse" value={form.adresse || ""} onChange={handleChange} />
                </div>
                <div className="mb-3">
                  <label className="form-label">Profession</label>
                  <input type="text" className="form-control" name="profession" value={form.profession || ""} onChange={handleChange} />
                </div>
                <div className="mb-3 form-check">
                  <input type="checkbox" className="form-check-input" id="estActif" name="estActif" checked={form.estActif} onChange={handleChange} />
                  <label className="form-check-label" htmlFor="estActif">Membre actif</label>
                </div>
                <button type="submit" className="btn btn-warning w-100 mt-2">
                  <i className="bi bi-save me-2"></i> Modifier
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
