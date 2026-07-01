import { useState, useEffect } from "react";
import { superAdmin } from "../../services/api";

export default function VueCompile() {
  const [data, setData] = useState(null);
  const [filters, setFilters] = useState({ evenementId: "", localiteId: "" });
  const [allEvenements, setAllEvenements] = useState([]);
  const [localites, setLocalites] = useState([]);

  const load = () => {
    const params = {};
    if (filters.evenementId) params.evenementId = filters.evenementId;
    if (filters.localiteId) params.localiteId = filters.localiteId;
    superAdmin.getCompile(params).then((res) => setData(res.data));
  };

  useEffect(() => {
    Promise.all([
      superAdmin.getCompile({}),
      superAdmin.getLocalites(),
    ]).then(([dRes, lRes]) => {
      setData(dRes.data);
      setAllEvenements(dRes.data.donnees);
      setLocalites(lRes.data);
    });
  }, []);

  const handleExport = async () => {
    try {
      const res = await superAdmin.exportGlobal();
      const blob = new Blob([JSON.stringify(res.data, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "rapport_global.json";
      a.click();
    } catch (err) { alert("Erreur d'export"); }
  };

  if (!data) return <div className="text-center mt-5"><div className="spinner-border" /></div>;

  return (
    <div>
      <div className="card shadow mb-4">
        <div className="card-header bg-primary text-white d-flex justify-content-between">
          <h4 className="mb-0"><i className="bi bi-table"></i> Vue compilee</h4>
          <button className="btn btn-light" onClick={handleExport}>
            <i className="bi bi-download"></i> Export global
          </button>
        </div>
        <div className="card-body">
          <div className="row g-2 mb-3">
            <div className="col-md-6">
              <select className="form-select" value={filters.evenementId}
                onChange={(e) => setFilters({ ...filters, evenementId: e.target.value })}>
                <option value="">Tous les evenements</option>
                {allEvenements.map((e) => (
                  <option key={e.id} value={e.id}>{e.titre}</option>
                ))}
              </select>
            </div>
            <div className="col-md-4">
              <select className="form-select" value={filters.localiteId}
                onChange={(e) => setFilters({ ...filters, localiteId: e.target.value })}>
                <option value="">Toutes les localites</option>
                {localites.map((l) => <option key={l.id} value={l.id}>{l.nom}</option>)}
              </select>
            </div>
            <div className="col-md-2">
              <button className="btn btn-primary w-100" onClick={load}><i className="bi bi-funnel"></i> Filtrer</button>
            </div>
          </div>

          <div className="row mb-4">
            <div className="col-md-4 mb-2">
              <div className="card bg-warning text-white shadow text-center">
                <div className="card-body"><h3>{data.grandTotal.toLocaleString()} F</h3><h6>Grand total collecte</h6></div>
              </div>
            </div>
            <div className="col-md-4 mb-2">
              <div className="card bg-info text-white shadow text-center">
                <div className="card-body"><h3>{data.totalInscrits}</h3><h6>Total inscrits</h6></div>
              </div>
            </div>
            <div className="col-md-4 mb-2">
              <div className="card bg-success text-white shadow text-center">
                <div className="card-body"><h3>{data.totalCotisants}</h3><h6>Total cotisants</h6></div>
              </div>
            </div>
          </div>

          <div className="table-responsive">
            <table className="table table-hover">
              <thead className="table-light">
                <tr><th>Evenement</th><th>Date</th><th>Localite</th><th>Inscrits</th><th>Cotisants</th><th>Total</th><th>Taux</th></tr>
              </thead>
              <tbody>
                {data.donnees.map((d) => (
                  <tr key={d.id}>
                    <td>{d.titre}</td>
                    <td>{new Date(d.date).toLocaleDateString("fr-FR")}</td>
                    <td>{d.localite || "-"}</td>
                    <td>{d.nbInscrits}</td>
                    <td>{d.nbCotisants}</td>
                    <td><strong>{d.totalCotise.toLocaleString()} F</strong></td>
                    <td>
                      <div className="progress" style={{ height: "20px" }}>
                        <div className="progress-bar bg-success" style={{ width: `${d.taux}%` }}>
                          {d.taux.toFixed(1)}%
                        </div>
                      </div>
                    </td>
                  </tr>
                ))}
                {data.donnees.length === 0 && <tr><td colSpan="7" className="text-center text-muted">Aucune donnee</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
