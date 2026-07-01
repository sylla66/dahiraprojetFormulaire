import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { cotisations } from "../../services/api";

export default function GererTypesCotisation() {
  const [types, setTypes] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ nom: "", description: "", periodicite: "mensuel", montant: "" });
  const [editing, setEditing] = useState(null);
  const [error, setError] = useState("");

  const load = () => cotisations.getTypes().then((res) => setTypes(res.data));
  useEffect(() => { load(); }, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const resetForm = () => {
    setForm({ nom: "", description: "", periodicite: "mensuel", montant: "" });
    setEditing(null);
    setShowForm(false);
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editing) {
        await cotisations.updateType(editing, form);
      } else {
        await cotisations.createType(form);
      }
      load();
      resetForm();
    } catch (err) {
      setError(err.response?.data?.error || "Erreur");
    }
  };

  const handleEdit = (t) => {
    setForm({ nom: t.nom, description: t.description || "", periodicite: t.periodicite, montant: t.montant || "" });
    setEditing(t.id);
    setShowForm(true);
  };

  const handleDelete = async (id, nom) => {
    if (!confirm(`Supprimer "${nom}" ?`)) return;
    await cotisations.deleteType(id);
    load();
  };

  const handleToggle = async (t) => {
    await cotisations.updateType(t.id, { ...t, estActif: !t.estActif });
    load();
  };

  return (
    <div className="card shadow">
      <div className="card-header bg-primary text-white d-flex justify-content-between align-items-center">
        <h4 className="mb-0"><i className="bi bi-cash-stack"></i> Types de cotisations recurrentes</h4>
        <button className="btn btn-light" onClick={() => { resetForm(); setShowForm(!showForm); }}>
          <i className="bi bi-plus-circle"></i> {showForm ? "Annuler" : "Nouveau type"}
        </button>
      </div>
      <div className="card-body">
        {error && <div className="alert alert-danger">{error}</div>}

        {showForm && (
          <form onSubmit={handleSubmit} className="mb-4 p-3 bg-light rounded">
            <h5>{editing ? "Modifier" : "Nouveau"} type de cotisation</h5>
            <div className="row">
              <div className="col-md-4 mb-3">
                <label className="form-label">Nom <span className="text-danger">*</span></label>
                <input type="text" className="form-control" name="nom" value={form.nom} onChange={handleChange} required placeholder="Ex: Caisse sociale" />
              </div>
              <div className="col-md-3 mb-3">
                <label className="form-label">Periodicite</label>
                <select className="form-select" name="periodicite" value={form.periodicite} onChange={handleChange}>
                  <option value="mensuel">Mensuel</option>
                  <option value="annuel">Annuel</option>
                  <option value="hebdomadaire">Hebdomadaire</option>
                  <option value="trimestriel">Trimestriel</option>
                  <option value="unique">Unique</option>
                </select>
              </div>
              <div className="col-md-2 mb-3">
                <label className="form-label">Montant (F)</label>
                <input type="number" className="form-control" name="montant" value={form.montant} onChange={handleChange} placeholder="0" />
              </div>
            </div>
            <div className="mb-3">
              <label className="form-label">Description</label>
              <textarea className="form-control" name="description" value={form.description} onChange={handleChange} rows="2"></textarea>
            </div>
            <button type="submit" className="btn btn-success">
              <i className="bi bi-check-lg"></i> {editing ? "Modifier" : "Creer"}
            </button>
          </form>
        )}

        <div className="table-responsive">
          <table className="table table-hover">
            <thead className="table-light">
              <tr><th>Nom</th><th>Periodicite</th><th>Montant</th><th>Statut</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {types.map((t) => (
                <tr key={t.id}>
                  <td><strong>{t.nom}</strong>{t.description && <br />}<small className="text-muted">{t.description}</small></td>
                  <td><span className="badge bg-info">{t.periodicite}</span></td>
                  <td>{t.montant > 0 ? `${t.montant.toLocaleString()} F` : "Libre"}</td>
                  <td>
                    <span className={`badge ${t.estActif ? "bg-success" : "bg-secondary"}`}>{t.estActif ? "Actif" : "Inactif"}</span>
                  </td>
                  <td>
                    <Link to={`/admin/cotisations/${t.id}/paiements`} className="btn btn-sm btn-success me-1" title="Voir paiements">
                      <i className="bi bi-cash"></i>
                    </Link>
                    <button className="btn btn-sm btn-warning me-1" onClick={() => handleEdit(t)}><i className="bi bi-pencil"></i></button>
                    <button className="btn btn-sm btn-info me-1" onClick={() => handleToggle(t)} title={t.estActif ? "Desactiver" : "Activer"}>
                      <i className={`bi ${t.estActif ? "bi-pause" : "bi-play"}`}></i>
                    </button>
                    <button className="btn btn-sm btn-danger" onClick={() => handleDelete(t.id, t.nom)}><i className="bi bi-trash"></i></button>
                  </td>
                </tr>
              ))}
              {types.length === 0 && <tr><td colSpan="5" className="text-center text-muted">Aucun type de cotisation</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}