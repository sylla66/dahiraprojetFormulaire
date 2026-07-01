import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { admin } from "../../services/api";

export default function GererEvenement() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [inscrireId, setInscrireId] = useState("");
  const [cotisationForm, setCotisationForm] = useState({ membreId: "", montant: "", modePaiement: "especes" });

  const load = () => admin.getEvenement(id).then((res) => setData(res.data));

  useEffect(() => { load(); }, [id]);

  const handleInscrire = async (e) => {
    e.preventDefault();
    try {
      await admin.inscrire(id, { membreId: inscrireId, donnees: {} });
      load();
      setInscrireId("");
    } catch (err) { alert(err.response?.data?.error || "Erreur"); }
  };

  const handleCotisation = async (e) => {
    e.preventDefault();
    try {
      await admin.cotisation(id, cotisationForm);
      load();
      setCotisationForm({ membreId: "", montant: "", modePaiement: "especes" });
    } catch (err) { alert(err.response?.data?.error || "Erreur"); }
  };

  const handleCloturer = async () => {
    if (!confirm("Cloturer cet evenement ?")) return;
    await admin.cloturer(id);
    navigate("/admin/evenements");
  };

  const handleDeleteCot = async (cid) => {
    await admin.deleteCotisation(cid);
    load();
  };

  const handleDeleteIns = async (iid) => {
    await admin.deleteInscription(iid);
    load();
  };

  const [copied, setCopied] = useState(false);

  const handleShare = () => {
    const link = `${window.location.origin}/inscription-evenement/${id}`;
    navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!data) return <div className="text-center mt-5"><div className="spinner-border" /></div>;

  const inscritsIds = data.inscriptions.map((i) => i.membreId);
  const cotiseIds = data.cotisations.map((c) => c.membreId);
  const membresDispo = data.membres.filter((m) => !inscritsIds.includes(m.id));

  return (
    <div>
      <div className="card shadow mb-4">
        <div className="card-header bg-primary text-white d-flex flex-wrap justify-content-between align-items-center gap-2">
          <h4 className="mb-0"><i className="bi bi-gear"></i> Gestion: {data.evenement.titre}</h4>
          <div className="d-flex gap-2">
            <a className="btn btn-light" href={`/api/export/evenements/${id}/inscrits`} target="_blank" rel="noopener noreferrer">
              <i className="bi bi-filetype-pdf"></i> PDF inscrits
            </a>
            <button className="btn btn-light" onClick={handleShare}>
              <i className="bi bi-share"></i> {copied ? "Copie !" : "Lien inscription"}
            </button>
            {!data.evenement.estCloture && (
              <button className="btn btn-warning" onClick={handleCloturer}>
                <i className="bi bi-lock"></i> Cloturer
              </button>
            )}
          </div>
        </div>
        <div className="card-body py-2 bg-light">
          <div className="d-flex align-items-center justify-content-between flex-wrap gap-2">
            <div>
              <span className="text-muted small">Objectif de collecte</span>
              <h3 className="mb-0 fw-bold text-primary">
                {data.evenement.montantObjectif > 0 ? `${data.evenement.montantObjectif.toLocaleString()} FCFA` : "Non defini"}
              </h3>
            </div>
            <div className="text-end">
              <span className="text-muted small">Collecte</span>
              <h4 className="mb-0 text-success">{data.cotisations.reduce((s, c) => s + parseFloat(c.montant || 0), 0).toLocaleString()} F</h4>
            </div>
            {data.evenement.montantObjectif > 0 && (
              <div className="w-100 mt-1">
                <div className="progress" style={{ height: "8px" }}>
                  <div className="progress-bar bg-success" role="progressbar"
                       style={{ width: `${Math.min(Math.round((data.cotisations.reduce((s, c) => s + parseFloat(c.montant || 0), 0) / data.evenement.montantObjectif) * 100), 100)}%` }}>
                  </div>
                </div>
              </div>
            )}
            {data.evenement.montantMinimum > 0 && (
              <div className="w-100 mt-1">
                <small className="text-muted">
                  Minimum par personne: <strong className="text-danger">{Number(data.evenement.montantMinimum).toLocaleString()} F</strong>
                </small>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="row">
        <div className="col-md-6 mb-4">
          <div className="card shadow">
            <div className="card-header bg-success text-white">
              <h5 className="mb-0"><i className="bi bi-person-plus"></i> Inscrire un membre</h5>
            </div>
            <div className="card-body">
              <form onSubmit={handleInscrire}>
                <div className="mb-3">
                  <select className="form-select" value={inscrireId} onChange={(e) => setInscrireId(e.target.value)} required>
                    <option value="">-- Selectionner un membre --</option>
                    {membresDispo.map((m) => (
                      <option key={m.id} value={m.id}>{m.prenom} {m.nom} - {m.telephone}</option>
                    ))}
                  </select>
                </div>
                <button type="submit" className="btn btn-success w-100">
                  <i className="bi bi-person-check"></i> Inscrire
                </button>
              </form>
            </div>
          </div>

          <div className="card shadow mt-4">
            <div className="card-header bg-warning text-white">
              <h5 className="mb-0"><i className="bi bi-cash-coin"></i> Enregistrer une cotisation</h5>
            </div>
            <div className="card-body">
              <form onSubmit={handleCotisation}>
                <div className="mb-3">
                  <select className="form-select" value={cotisationForm.membreId}
                    onChange={(e) => setCotisationForm({ ...cotisationForm, membreId: e.target.value })} required>
                    <option value="">-- Selectionner un inscrit --</option>
                    {data.inscriptions.map((ins) => (
                      <option key={ins.id} value={ins.membreId} disabled={cotiseIds.includes(ins.membreId)}>
                        {ins.membreRef?.prenom} {ins.membreRef?.nom} {cotiseIds.includes(ins.membreId) ? "(deja cotise)" : ""}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label className="form-label">Montant (FCFA)</label>
                    <input type="number" className="form-control" value={cotisationForm.montant}
                      onChange={(e) => setCotisationForm({ ...cotisationForm, montant: e.target.value })} required />
                  </div>
                  <div className="col-md-6 mb-3">
                    <label className="form-label">Mode de paiement</label>
                    <select className="form-select" value={cotisationForm.modePaiement}
                      onChange={(e) => setCotisationForm({ ...cotisationForm, modePaiement: e.target.value })}>
                      <option value="especes">Especes</option>
                      <option value="wave">Wave</option>
                      <option value="orange_money">Orange Money</option>
                      <option value="free_money">Free Money</option>
                      <option value="virement">Virement</option>
                    </select>
                  </div>
                </div>
                <button type="submit" className="btn btn-warning w-100">
                  <i className="bi bi-check-circle"></i> Valider la cotisation
                </button>
              </form>
            </div>
          </div>
        </div>

        <div className="col-md-6 mb-4">
          <div className="card shadow mb-4">
            <div className="card-header bg-info text-white">
              <h5 className="mb-0"><i className="bi bi-people"></i> Inscrits ({data.inscriptions.length})</h5>
            </div>
            <div className="card-body">
              <ul className="list-group">
                {data.inscriptions.map((ins) => (
                  <li key={ins.id} className="list-group-item d-flex justify-content-between align-items-center">
                    {ins.membreRef?.prenom} {ins.membreRef?.nom}
                    <span>
                      {cotiseIds.includes(ins.membreId) ? <span className="badge bg-success me-2">Cotise</span> : <span className="badge bg-secondary me-2">En attente</span>}
                      <button className="btn btn-sm btn-danger" onClick={() => handleDeleteIns(ins.id)}>
                        <i className="bi bi-x"></i>
                      </button>
                    </span>
                  </li>
                ))}
                {data.inscriptions.length === 0 && <li className="list-group-item text-muted">Aucun inscrit</li>}
              </ul>
            </div>
          </div>

          <div className="card shadow">
            <div className="card-header bg-success text-white">
              <h5 className="mb-0"><i className="bi bi-cash-stack"></i> Cotisations ({data.cotisations.length})</h5>
            </div>
            <div className="card-body">
              <ul className="list-group">
                {data.cotisations.map((c) => (
                  <li key={c.id} className="list-group-item d-flex justify-content-between align-items-center">
                    {c.membreRef?.prenom} {c.membreRef?.nom}
                    <span>
                      <strong>{c.montant.toLocaleString()} F</strong>
                      <button className="btn btn-sm btn-danger ms-2" onClick={() => handleDeleteCot(c.id)}>
                        <i className="bi bi-x"></i>
                      </button>
                    </span>
                  </li>
                ))}
                {data.cotisations.length === 0 && <li className="list-group-item text-muted">Aucune cotisation</li>}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
