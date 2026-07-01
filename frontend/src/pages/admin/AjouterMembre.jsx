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
    <div className="row justify-content-center">
      <div className="col-md-6">
        <div className="card shadow">
          <div className="card-header bg-primary text-white">
            <h4 className="mb-0"><i className="bi bi-person-plus"></i> Ajouter un membre</h4>
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
                <input type="email" className="form-control" name="email" value={form.email} onChange={handleChange} />
              </div>
              <div className="mb-3">
                <label className="form-label">Localite</label>
                <select className="form-select" name="localiteId" value={form.localiteId} onChange={handleChange}>
                  <option value="">-- Selectionner --</option>
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
              <button type="submit" className="btn btn-primary w-100">
                <i className="bi bi-save"></i> Enregistrer
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
