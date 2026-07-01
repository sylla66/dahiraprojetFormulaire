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
    <div className="row justify-content-center">
      <div className="col-md-6">
        <div className="card shadow">
          <div className="card-header bg-warning">
            <h4 className="mb-0"><i className="bi bi-pencil"></i> Modifier: {form.prenom} {form.nom}</h4>
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
                <label className="form-label">Telephone</label>
                <input type="text" className="form-control" name="telephone" value={form.telephone} onChange={handleChange} required />
              </div>
              <div className="mb-3">
                <label className="form-label">Email</label>
                <input type="email" className="form-control" name="email" value={form.email || ""} onChange={handleChange} />
              </div>
              <div className="mb-3">
                <label className="form-label">Localite</label>
                <select className="form-select" name="localiteId" value={form.localiteId || ""} onChange={handleChange}>
                  <option value="">-- Selectionner --</option>
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
              <button type="submit" className="btn btn-warning w-100">
                <i className="bi bi-save"></i> Modifier
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
