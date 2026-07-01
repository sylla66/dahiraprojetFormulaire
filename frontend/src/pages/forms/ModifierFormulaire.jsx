import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { forms, auth } from "../../services/api";

export default function ModifierFormulaire() {
  const { id } = useParams();
  const [form, setForm] = useState(null);
  const [champs, setChamps] = useState([]);
  const [localites, setLocalites] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    Promise.all([forms.getOne(id), auth.getLocalites()]).then(([fRes, lRes]) => {
      setForm(fRes.data);
      setChamps(fRes.data.champs || []);
      setLocalites(lRes.data);
    });
  }, [id]);

  const updateChamp = (i, field, value) => {
    const updated = [...champs];
    updated[i][field] = value;
    setChamps(updated);
  };

  const addChamp = () => setChamps([...champs, { nom: "", type: "text", label: "", requis: false }]);
  const removeChamp = (i) => setChamps(champs.filter((_, idx) => idx !== i));

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await forms.update(id, { ...form, champs: champs.filter((c) => c.nom && c.label) });
      navigate("/forms");
    } catch (err) {
      alert(err.response?.data?.error || "Erreur");
    }
  };

  if (!form) return <div className="text-center mt-5"><div className="spinner-border" /></div>;

  return (
    <div className="row justify-content-center">
      <div className="col-md-8">
        <div className="card shadow">
          <div className="card-header bg-warning">
            <h4 className="mb-0"><i className="bi bi-pencil"></i> Modifier: {form.titre}</h4>
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
                  <label className="form-label">Type</label>
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
                  <label className="form-label">Statut</label>
                  <select className="form-select" value={form.estActif}
                    onChange={(e) => setForm({ ...form, estActif: e.target.value === "true" })}>
                    <option value="true">Actif</option>
                    <option value="false">Inactif</option>
                  </select>
                </div>
              </div>
              <div className="mb-3">
                <label className="form-label">Description</label>
                <textarea className="form-control" value={form.description || ""}
                  onChange={(e) => setForm({ ...form, description: e.target.value })} rows="2"></textarea>
              </div>

              <hr />
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h5 className="mb-0"><i className="bi bi-list-task"></i> Champs ({champs.length})</h5>
                <button type="button" className="btn btn-outline-primary btn-sm" onClick={addChamp}>
                  <i className="bi bi-plus"></i> Ajouter
                </button>
              </div>

              {champs.map((c, i) => (
                <div key={i} className="card mb-2 bg-light">
                  <div className="card-body py-2">
                    <div className="row align-items-end">
                      <div className="col-md-3 mb-2">
                        <label className="form-label small">Nom technique</label>
                        <input type="text" className="form-control form-control-sm" value={c.nom}
                          onChange={(e) => updateChamp(i, "nom", e.target.value)} required />
                      </div>
                      <div className="col-md-3 mb-2">
                        <label className="form-label small">Label</label>
                        <input type="text" className="form-control form-control-sm" value={c.label}
                          onChange={(e) => updateChamp(i, "label", e.target.value)} required />
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

              <button type="submit" className="btn btn-warning w-100 mt-3">
                <i className="bi bi-save"></i> Enregistrer les modifications
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
