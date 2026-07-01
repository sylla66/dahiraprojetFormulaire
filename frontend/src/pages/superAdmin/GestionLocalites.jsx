import { useState, useEffect } from "react";
import { superAdmin } from "../../services/api";

export default function GestionLocalites() {
  const [localites, setLocalites] = useState([]);
  const [nom, setNom] = useState("");
  const [pays, setPays] = useState("Senegal");

  const load = () => superAdmin.getLocalites().then((res) => setLocalites(res.data));

  useEffect(() => { load(); }, []);

  const handleAdd = async (e) => {
    e.preventDefault();
    try {
      await superAdmin.createLocalite({ nom, pays });
      setNom("");
      load();
    } catch (err) { alert(err.response?.data?.error || "Erreur"); }
  };

  const handleDelete = async (id) => {
    if (!confirm("Supprimer cette localite ?")) return;
    await superAdmin.deleteLocalite(id);
    load();
  };

  return (
    <div className="row">
      <div className="col-md-5 mb-4">
        <div className="card shadow">
          <div className="card-header bg-primary text-white">
            <h5 className="mb-0"><i className="bi bi-plus-circle"></i> Ajouter une localite</h5>
          </div>
          <div className="card-body">
            <form onSubmit={handleAdd}>
              <div className="mb-3">
                <label className="form-label">Nom de la localite</label>
                <input type="text" className="form-control" value={nom} onChange={(e) => setNom(e.target.value)} required
                  placeholder="ex: Dakar, Paris..." />
              </div>
              <div className="mb-3">
                <label className="form-label">Pays</label>
                <select className="form-select" value={pays} onChange={(e) => setPays(e.target.value)}>
                  <option value="Senegal">Senegal</option>
                  <option value="France">France</option>
                  <option value="USA">USA</option>
                  <option value="Italie">Italie</option>
                  <option value="Espagne">Espagne</option>
                  <option value="Autre">Autre</option>
                </select>
              </div>
              <button type="submit" className="btn btn-primary w-100">
                <i className="bi bi-plus"></i> Ajouter
              </button>
            </form>
          </div>
        </div>
      </div>
      <div className="col-md-7 mb-4">
        <div className="card shadow">
          <div className="card-header bg-secondary text-white">
            <h5 className="mb-0"><i className="bi bi-geo-alt"></i> Localites ({localites.length})</h5>
          </div>
          <div className="card-body">
            <div className="table-responsive">
              <table className="table table-hover">
                <thead className="table-light">
                  <tr><th>Nom</th><th>Pays</th><th>Actions</th></tr>
                </thead>
                <tbody>
                  {localites.map((l) => (
                    <tr key={l.id}>
                      <td><i className="bi bi-geo-alt"></i> {l.nom}</td>
                      <td>{l.pays}</td>
                      <td>
                        <button className="btn btn-sm btn-danger" onClick={() => handleDelete(l.id)}>
                          <i className="bi bi-trash"></i>
                        </button>
                      </td>
                    </tr>
                  ))}
                  {localites.length === 0 && <tr><td colSpan="3" className="text-center text-muted">Aucune localite</td></tr>}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
