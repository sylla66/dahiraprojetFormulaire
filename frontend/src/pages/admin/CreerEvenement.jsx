import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { admin, auth, forms } from "../../services/api";

export default function CreerEvenement() {
  const [form, setForm] = useState({
    titre: "", description: "", dateEvenement: "", dateFin: "",
    lieu: "", formulaireId: "", localiteId: "", montantObjectif: "",
  });
  const [formulaires, setFormulaires] = useState([]);
  const [localites, setLocalites] = useState([]);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    forms.getAll().then((res) => setFormulaires(res.data));
    auth.getLocalites().then((res) => setLocalites(res.data));
  }, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await admin.createEvenement(form);
      navigate("/admin/evenements");
    } catch (err) {
      setError(err.response?.data?.error || "Erreur");
    }
  };

  return (
    <div className="row justify-content-center">
      <div className="col-md-8">
        <div className="card shadow">
          <div className="card-header bg-primary text-white">
            <h4 className="mb-0"><i className="bi bi-plus-circle"></i> Creer un evenement</h4>
          </div>
          <div className="card-body">
            {error && <div className="alert alert-danger">{error}</div>}
            <form onSubmit={handleSubmit}>
              <div className="row">
                <div className="col-md-6 mb-3">
                  <label className="form-label">Titre</label>
                  <input type="text" className="form-control" name="titre" value={form.titre} onChange={handleChange} required />
                </div>
                <div className="col-md-6 mb-3">
                  <label className="form-label">Lieu</label>
                  <input type="text" className="form-control" name="lieu" value={form.lieu} onChange={handleChange} />
                </div>
              </div>
              <div className="mb-3">
                <label className="form-label">Description</label>
                <textarea className="form-control" name="description" value={form.description} onChange={handleChange} rows="3"></textarea>
              </div>
              <div className="row">
                <div className="col-md-4 mb-3">
                  <label className="form-label">Date evenement</label>
                  <input type="datetime-local" className="form-control" name="dateEvenement" value={form.dateEvenement} onChange={handleChange} required />
                </div>
                <div className="col-md-4 mb-3">
                  <label className="form-label">Date fin</label>
                  <input type="datetime-local" className="form-control" name="dateFin" value={form.dateFin} onChange={handleChange} />
                </div>
                <div className="col-md-4 mb-3">
                  <label className="form-label">Montant objectif (FCFA)</label>
                  <input type="number" className="form-control" name="montantObjectif" value={form.montantObjectif} onChange={handleChange} />
                </div>
              </div>
              <div className="row">
                <div className="col-md-6 mb-3">
                  <label className="form-label">Formulaire associe</label>
                  <select className="form-select" name="formulaireId" value={form.formulaireId} onChange={handleChange} required>
                    <option value="">-- Selectionner --</option>
                    {formulaires.filter((f) => f.estActif).map((f) => (
                      <option key={f.id} value={f.id}>{f.titre} ({f.typeEvenement})</option>
                    ))}
                  </select>
                </div>
                <div className="col-md-6 mb-3">
                  <label className="form-label">Localite</label>
                  <select className="form-select" name="localiteId" value={form.localiteId} onChange={handleChange}>
                    <option value="">-- Selectionner --</option>
                    {localites.map((l) => <option key={l.id} value={l.id}>{l.nom}</option>)}
                  </select>
                </div>
              </div>
              <button type="submit" className="btn btn-primary w-100">
                <i className="bi bi-calendar-plus"></i> Creer l'evenement
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
