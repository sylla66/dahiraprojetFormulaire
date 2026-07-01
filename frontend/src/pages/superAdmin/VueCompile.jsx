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
    <div className="admin-page">
      <div className="page-hero mb-4 d-flex justify-content-between align-items-start flex-wrap gap-3">
        <div>
          <div className="hero-pill"><i className="bi bi-table"></i> Vue globale</div>
          <h3 className="mb-2">Vue compilée</h3>
          <p className="text-muted mb-0">Analysez les performances globales des événements et des collectes.</p>
        </div>
        <button className="btn btn-outline-primary" onClick={handleExport}>
          <i className="bi bi-download me-1"></i> Export global
        </button>
      </div>

      <div className="card shadow-sm dashboard-card mb-4">
        <div className="card-body p-4">
          <div className="row g-2 mb-3">
            <div className="col-md-6">
              <select className="form-select" value={filters.evenementId}
                onChange={(e) => setFilters({ ...filters, evenementId: e.target.value })}>
                <option value="">Tous les événements</option>
                {allEvenements.map((e) => (
                  <option key={e.id} value={e.id}>{e.titre}</option>
                ))}
              </select>
            </div>
            <div className="col-md-4">
              <select className="form-select" value={filters.localiteId}
                onChange={(e) => setFilters({ ...filters, localiteId: e.target.value })}>
                <option value="">Toutes les localités</option>
                {localites.map((l) => <option key={l.id} value={l.id}>{l.nom}</option>)}
              </select>
            </div>
            <div className="col-md-2">
              <button className="btn btn-primary w-100" onClick={load}><i className="bi bi-funnel me-1"></i> Filtrer</button>
            </div>
          </div>

          <div className="row mb-4">
            <div className="col-md-4 mb-2">
              <div className="card stat-card warning h-100">
                <div className="card-body text-center">
                  <div className="stat-label">Grand total collecte</div>
                  <div className="stat-value">{data.grandTotal.toLocaleString()} F</div>
                </div>
              </div>
            </div>
            <div className="col-md-4 mb-2">
              <div className="card stat-card info h-100">
                <div className="card-body text-center">
                  <div className="stat-label">Total inscrits</div>
                  <div className="stat-value">{data.totalInscrits}</div>
                </div>
              </div>
            </div>
            <div className="col-md-4 mb-2">
              <div className="card stat-card success h-100">
                <div className="card-body text-center">
                  <div className="stat-label">Total cotisants</div>
                  <div className="stat-value">{data.totalCotisants}</div>
                </div>
              </div>
            </div>
          </div>

          <div className="table-responsive">
            <table className="table align-middle mb-0">
              <thead>
                <tr><th>Événement</th><th>Date</th><th>Localité</th><th>Inscrits</th><th>Cotisants</th><th>Total</th><th>Taux</th></tr>
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
                {data.donnees.length === 0 && <tr><td colSpan="7" className="text-center text-muted">Aucune donnée</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
