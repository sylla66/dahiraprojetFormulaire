import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { admin, auth, forms } from "../../services/api";

export default function ModifierEvenement() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState(null);
  const [formulaires, setFormulaires] = useState([]);
  const [localites, setLocalites] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    forms.getAll().then((res) => setFormulaires(res.data));
    auth.getLocalites().then((res) => setLocalites(res.data));
    admin.getEvenement(id).then((res) => {
      const e = res.data.evenement;
      setForm({
        titre: e.titre || "",
        description: e.description || "",
        dateEvenement: e.dateEvenement ? new Date(e.dateEvenement).toISOString().slice(0, 16) : "",
        dateFin: e.dateFin ? new Date(e.dateFin).toISOString().slice(0, 16) : "",
        dateDebutInscription: e.dateDebutInscription ? new Date(e.dateDebutInscription).toISOString().slice(0, 16) : "",
        dateFinInscription: e.dateFinInscription ? new Date(e.dateFinInscription).toISOString().slice(0, 16) : "",
        lieu: e.lieu || "",
        formulaireId: e.formulaireId || "",
        localiteId: e.localiteId || "",
        montantObjectif: e.montantObjectif || "",
        montantMinimum: e.montantMinimum || "",
      });
    });
  }, [id]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await admin.updateEvenement(id, form);
      navigate("/admin/evenements");
    } catch (err) {
      setError(err.response?.data?.error || "Erreur");
    }
  };

  if (!form) return <div className="text-center mt-5"><div className="spinner-border" /></div>;

  return (
    <div className="row justify-content-center">
      <div className="col-md-8">
        <div className="card shadow">
          <div className="card-header bg-warning text-white">
            <h4 className="mb-0"><i className="bi bi-pencil"></i> Modifier l'evenement</h4>
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
                <div className="col-md-2 mb-3">
                  <label className="form-label">Objectif (FCFA)</label>
                  <input type="number" className="form-control" name="montantObjectif" value={form.montantObjectif} onChange={handleChange} />
                </div>
                <div className="col-md-2 mb-3">
                  <label className="form-label">Min/pers (FCFA)</label>
                  <input type="number" className="form-control" name="montantMinimum" value={form.montantMinimum} onChange={handleChange} />
                </div>
              </div>
              <div className="row">
                <div className="col-md-6 mb-3">
                  <label className="form-label">Debut inscriptions</label>
                  <input type="datetime-local" className="form-control" name="dateDebutInscription" value={form.dateDebutInscription} onChange={handleChange} />
                </div>
                <div className="col-md-6 mb-3">
                  <label className="form-label">Fin inscriptions</label>
                  <input type="datetime-local" className="form-control" name="dateFinInscription" value={form.dateFinInscription} onChange={handleChange} />
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
              <div className="d-flex gap-2">
                <button type="submit" className="btn btn-warning flex-fill">
                  <i className="bi bi-save"></i> Enregistrer les modifications
                </button>
                <button type="button" className="btn btn-secondary" onClick={() => navigate("/admin/evenements")}>
                  <i className="bi bi-x"></i> Annuler
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
