import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { admin, auth, forms } from "../../services/api";

export default function CreerEvenement() {
  const [form, setForm] = useState({
    titre: "", description: "", dateEvenement: "", dateFin: "",
    dateDebutInscription: "", dateFinInscription: "",
    lieu: "", formulaireId: "", localiteId: "", montantObjectif: "", montantMinimum: "",
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
    <div className="admin-page">
      <div className="page-hero mb-4">
        <div>
          <div className="hero-pill"><i className="bi bi-plus-circle"></i> Nouvel événement</div>
          <h3 className="mb-2">Créer un événement</h3>
          <p className="text-muted mb-0">Définissez les informations clés de l’événement et ses paramètres d’inscription.</p>
        </div>
      </div>

      <div className="row justify-content-center">
        <div className="col-lg-10">
          <div className="card shadow-sm dashboard-card">
            <div className="card-body p-4 p-lg-5">
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
                    <label className="form-label">Date événement</label>
                    <input type="datetime-local" className="form-control" name="dateEvenement" value={form.dateEvenement} onChange={handleChange} required />
                  </div>
                  <div className="col-md-4 mb-3">
                    <label className="form-label">Date fin</label>
                    <input type="datetime-local" className="form-control" name="dateFin" value={form.dateFin} onChange={handleChange} />
                  </div>
                  <div className="col-md-4 mb-3">
                    <label className="form-label">Objectif total (FCFA)</label>
                    <input type="number" className="form-control" name="montantObjectif" value={form.montantObjectif} onChange={handleChange} />
                  </div>
                  <div className="col-md-4 mb-3">
                    <label className="form-label">Minimum/personne (FCFA)</label>
                    <input type="number" className="form-control" name="montantMinimum" value={form.montantMinimum} onChange={handleChange} />
                  </div>
                </div>
                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label className="form-label">Début inscriptions</label>
                    <input type="datetime-local" className="form-control" name="dateDebutInscription" value={form.dateDebutInscription} onChange={handleChange} />
                  </div>
                  <div className="col-md-6 mb-3">
                    <label className="form-label">Fin inscriptions</label>
                    <input type="datetime-local" className="form-control" name="dateFinInscription" value={form.dateFinInscription} onChange={handleChange} />
                  </div>
                </div>
                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label className="form-label">Formulaire associé</label>
                    <select className="form-select" name="formulaireId" value={form.formulaireId} onChange={handleChange} required>
                      <option value="">-- Sélectionner --</option>
                      {formulaires.filter((f) => f.estActif).map((f) => (
                        <option key={f.id} value={f.id}>{f.titre} ({f.typeEvenement})</option>
                      ))}
                    </select>
                  </div>
                  <div className="col-md-6 mb-3">
                    <label className="form-label">Localité</label>
                    <select className="form-select" name="localiteId" value={form.localiteId} onChange={handleChange}>
                      <option value="">-- Sélectionner --</option>
                      {localites.map((l) => <option key={l.id} value={l.id}>{l.nom}</option>)}
                    </select>
                  </div>
                </div>
                <button type="submit" className="btn btn-primary w-100 mt-2">
                  <i className="bi bi-calendar-plus me-2"></i> Créer l'événement
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
