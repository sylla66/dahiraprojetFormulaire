import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { cotisations, admin } from "../../services/api";

export default function PaiementsTypeCotisation() {
  const { id } = useParams();
  const [type, setType] = useState(null);
  const [paiements, setPaiements] = useState([]);
  const [total, setTotal] = useState(0);
  const [membres, setMembres] = useState([]);
  const [form, setForm] = useState({ membreId: "", montant: "", modePaiement: "especes", notes: "" });
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);

  const load = async () => {
    const [typesRes, paiementsRes, membresRes] = await Promise.all([
      cotisations.getTypes(),
      cotisations.getPaiements(id),
      admin.getMembres(),
    ]);
    setType(typesRes.data.find((t) => t.id === parseInt(id)));
    setPaiements(paiementsRes.data.paiements);
    setTotal(paiementsRes.data.total);
    setMembres(membresRes.data);
  };

  useEffect(() => { load(); }, [id]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await cotisations.createPaiement({ ...form, typeCotisationId: parseInt(id) });
      load();
      setForm({ membreId: "", montant: "", modePaiement: "especes", notes: "" });
      setShowForm(false);
      setError("");
    } catch (err) {
      setError(err.response?.data?.error || "Erreur");
    }
  };

  const handleDelete = async (pid) => {
    if (!confirm("Supprimer ce paiement ?")) return;
    await cotisations.deletePaiement(pid);
    load();
  };

  if (!type) return <div className="text-center mt-5"><div className="spinner-border" /></div>;

  return (
    <div>
      <div className="mb-3">
        <Link to="/admin/cotisations" className="btn btn-outline-secondary btn-sm">
          <i className="bi bi-arrow-left"></i> Retour aux types
        </Link>
      </div>
      <div className="card shadow mb-4">
        <div className="card-header bg-success text-white d-flex justify-content-between align-items-center">
          <h4 className="mb-0"><i className="bi bi-cash-coin"></i> {type.nom}</h4>
          <div className="d-flex gap-2">
            <a href={`/api/cotisations/export/${id}`} className="btn btn-light btn-sm" target="_blank" rel="noopener noreferrer">
              <i className="bi bi-filetype-pdf"></i> PDF
            </a>
            <button className="btn btn-light btn-sm" onClick={() => setShowForm(!showForm)}>
              <i className="bi bi-plus-circle"></i> Nouveau paiement
            </button>
          </div>
        </div>
        <div className="card-body">
          <div className="row mb-3">
            <div className="col-md-3">
              <div className="card bg-light">
                <div className="card-body text-center py-2">
                  <small className="text-muted">Periodicite</small>
                  <h6 className="mb-0">{type.periodicite}</h6>
                </div>
              </div>
            </div>
            <div className="col-md-3">
              <div className="card bg-light">
                <div className="card-body text-center py-2">
                  <small className="text-muted">Montant par defaut</small>
                  <h6 className="mb-0">{type.montant > 0 ? `${type.montant.toLocaleString()} F` : "Libre"}</h6>
                </div>
              </div>
            </div>
            <div className="col-md-3">
              <div className="card bg-success text-white">
                <div className="card-body text-center py-2">
                  <small>Total collecte</small>
                  <h5 className="mb-0">{total.toLocaleString()} F</h5>
                </div>
              </div>
            </div>
            <div className="col-md-3">
              <div className="card bg-info text-white">
                <div className="card-body text-center py-2">
                  <small>Paiements</small>
                  <h5 className="mb-0">{paiements.length}</h5>
                </div>
              </div>
            </div>
          </div>

          {error && <div className="alert alert-danger">{error}</div>}

          {showForm && (
            <form onSubmit={handleSubmit} className="mb-4 p-3 bg-light rounded">
              <h5>Enregistrer un paiement</h5>
              <div className="row">
                <div className="col-md-4 mb-3">
                  <label className="form-label">Membre <span className="text-danger">*</span></label>
                  <select className="form-select" name="membreId" value={form.membreId} onChange={handleChange} required>
                    <option value="">-- Selectionner --</option>
                    {membres.filter((m) => m.estActif).map((m) => (
                      <option key={m.id} value={m.id}>{m.prenom} {m.nom} - {m.telephone}</option>
                    ))}
                  </select>
                </div>
                <div className="col-md-2 mb-3">
                  <label className="form-label">Montant (F) <span className="text-danger">*</span></label>
                  <input type="number" className="form-control" name="montant" value={form.montant} onChange={handleChange} required />
                </div>
                <div className="col-md-2 mb-3">
                  <label className="form-label">Mode</label>
                  <select className="form-select" name="modePaiement" value={form.modePaiement} onChange={handleChange}>
                    <option value="especes">Especes</option>
                    <option value="wave">Wave</option>
                    <option value="orange_money">Orange Money</option>
                    <option value="free_money">Free Money</option>
                    <option value="virement">Virement</option>
                  </select>
                </div>
                <div className="col-md-4 mb-3">
                  <label className="form-label">Notes</label>
                  <input type="text" className="form-control" name="notes" value={form.notes} onChange={handleChange} />
                </div>
              </div>
              <button type="submit" className="btn btn-success"><i className="bi bi-check-circle"></i> Valider le paiement</button>
            </form>
          )}

          <div className="table-responsive">
            <table className="table table-hover">
              <thead className="table-light">
                <tr><th>Membre</th><th>Montant</th><th>Mois/Annee</th><th>Mode</th><th>Date</th><th>Actions</th></tr>
              </thead>
              <tbody>
                {paiements.map((p) => (
                  <tr key={p.id}>
                    <td><strong>{p.membreRef?.prenom} {p.membreRef?.nom}</strong><br /><small className="text-muted">{p.membreRef?.telephone}</small></td>
                    <td><strong>{p.montant.toLocaleString()} F</strong></td>
                    <td>{p.mois}/{p.annee}</td>
                    <td><span className="badge bg-secondary">{p.modePaiement}</span></td>
                    <td><small>{new Date(p.datePaiement).toLocaleDateString("fr-FR")}</small></td>
                    <td>
                      <button className="btn btn-sm btn-danger" onClick={() => handleDelete(p.id)}><i className="bi bi-x"></i></button>
                    </td>
                  </tr>
                ))}
                {paiements.length === 0 && <tr><td colSpan="6" className="text-center text-muted">Aucun paiement</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}