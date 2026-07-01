import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { forms, auth } from "../../services/api";

export default function CreerFormulaire() {
  const [form, setForm] = useState({ titre: "", description: "", typeEvenement: "cotisation", localiteId: "" });
  const [localites, setLocalites] = useState([]);
  const [champs, setChamps] = useState([]);
  const [showPreview, setShowPreview] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    auth.getLocalites().then((res) => setLocalites(res.data));
  }, []);

  const addChamp = () => {
    setChamps([...champs, { nom: "", type: "text", label: "", requis: false }]);
  };

  const removeChamp = (i) => setChamps(champs.filter((_, idx) => idx !== i));

  const updateChamp = (i, field, value) => {
    const updated = [...champs];
    updated[i][field] = value;
    setChamps(updated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await forms.create({ ...form, champs: champs.filter((c) => c.nom && c.label) });
      navigate("/forms");
    } catch (err) {
      alert(err.response?.data?.error || "Erreur");
    }
  };

  return (
    <div className="row justify-content-center">
      <div className="col-md-8">
        <div className="card shadow">
          <div className="card-header bg-primary text-white">
            <h4 className="mb-0"><i className="bi bi-ui-checks"></i> Creer un formulaire</h4>
          </div>
          <div className="card-body">
            <form onSubmit={handleSubmit}>
              <div className="row">
                <div className="col-md-6 mb-3">
                  <label className="form-label">Titre</label>
                  <input type="text" className="form-control" value={form.titre}
                    onChange={(e) => setForm({ ...form, titre: e.target.value })} required />
                </div>
                <div className="col-md-3 mb-3">
                  <label className="form-label">Type d'evenement</label>
                  <select className="form-select" value={form.typeEvenement}
                    onChange={(e) => setForm({ ...form, typeEvenement: e.target.value })}>
                    <option value="cotisation">Cotisation</option>
                    <option value="recensement">Recensement</option>
                    <option value="collecte">Collecte</option>
                    <option value="evenement">Evenement</option>
                    <option value="autre">Autre</option>
                  </select>
                </div>
                <div className="col-md-3 mb-3">
                  <label className="form-label">Localite</label>
                  <select className="form-select" value={form.localiteId}
                    onChange={(e) => setForm({ ...form, localiteId: e.target.value })}>
                    <option value="">Toutes</option>
                    {localites.map((l) => <option key={l.id} value={l.id}>{l.nom}</option>)}
                  </select>
                </div>
              </div>
              <div className="mb-3">
                <label className="form-label">Description</label>
                <textarea className="form-control" value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })} rows="2"></textarea>
              </div>

              <hr />
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h5 className="mb-0"><i className="bi bi-list-task"></i> Champs du formulaire</h5>
                <button type="button" className="btn btn-outline-primary btn-sm" onClick={addChamp}>
                  <i className="bi bi-plus"></i> Ajouter un champ
                </button>
              </div>

              {champs.map((c, i) => (
                <div key={i} className="card mb-2 bg-light">
                  <div className="card-body py-2">
                    <div className="row align-items-end">
                      <div className="col-md-3 mb-2">
                        <label className="form-label small">Nom technique</label>
                        <input type="text" className="form-control form-control-sm" placeholder="ex: montant"
                          value={c.nom} onChange={(e) => updateChamp(i, "nom", e.target.value)} required />
                      </div>
                      <div className="col-md-3 mb-2">
                        <label className="form-label small">Label</label>
                        <input type="text" className="form-control form-control-sm" placeholder="ex: Montant"
                          value={c.label} onChange={(e) => updateChamp(i, "label", e.target.value)} required />
                      </div>
                      <div className="col-md-2 mb-2">
                        <label className="form-label small">Type</label>
                        <select className="form-select form-select-sm" value={c.type}
                          onChange={(e) => updateChamp(i, "type", e.target.value)}>
                          <option value="text">Texte</option>
                          <option value="number">Nombre</option>
                          <option value="email">Email</option>
                          <option value="tel">Telephone</option>
                          <option value="textarea">Zone texte</option>
                          <option value="date">Date</option>
                          <option value="select">Liste</option>
                        </select>
                      </div>
                      <div className="col-md-2 mb-2">
                        <div className="form-check">
                          <input type="checkbox" className="form-check-input" id={`req_${i}`}
                            checked={c.requis} onChange={(e) => updateChamp(i, "requis", e.target.checked)} />
                          <label className="form-check-label small" htmlFor={`req_${i}`}>Requis</label>
                        </div>
                      </div>
                      <div className="col-md-2 mb-2">
                        <button type="button" className="btn btn-danger btn-sm w-100" onClick={() => removeChamp(i)}>
                          <i className="bi bi-x"></i>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              <div className="d-flex gap-2 mt-3">
                <button type="button" className="btn btn-outline-info flex-fill" onClick={() => setShowPreview(true)} disabled={champs.filter((c) => c.nom && c.label).length === 0}>
                  <i className="bi bi-eye"></i> Apercu
                </button>
                <button type="submit" className="btn btn-primary flex-fill">
                  <i className="bi bi-save"></i> Creer le formulaire
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {showPreview && (
        <div className="modal d-block" tabIndex="-1" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header bg-light">
                <h5 className="modal-title"><i className="bi bi-eye"></i> Apercu du formulaire</h5>
                <button type="button" className="btn-close" onClick={() => setShowPreview(false)}></button>
              </div>
              <div className="modal-body">
                <div className="card border-primary">
                  <div className="card-header bg-primary text-white">
                    <h5 className="mb-0">{form.titre || "Titre du formulaire"}</h5>
                  </div>
                  <div className="card-body">
                    {form.description && <p className="text-muted small">{form.description}</p>}
                    {champs.filter((c) => c.nom && c.label).map((c, i) => (
                      <div className="mb-3" key={i}>
                        <label className="form-label">
                          {c.label} {c.requis && <span className="text-danger">*</span>}
                        </label>
                        {c.type === "textarea" ? (
                          <textarea className="form-control" rows="3" disabled placeholder={c.label} />
                        ) : c.type === "select" ? (
                          <select className="form-select" disabled>
                            <option value="">-- {c.label} --</option>
                          </select>
                        ) : c.type === "date" ? (
                          <input type="date" className="form-control" disabled />
                        ) : (
                          <input type={c.type} className="form-control" disabled placeholder={c.label} />
                        )}
                        <small className="text-muted">Type: {c.type}</small>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button className="btn btn-secondary" onClick={() => setShowPreview(false)}>Fermer</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
