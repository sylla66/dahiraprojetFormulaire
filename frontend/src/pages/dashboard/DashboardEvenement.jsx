import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { dashboard as dashApi } from "../../services/api";

export default function DashboardEvenement() {
  const { id } = useParams();
  const [data, setData] = useState(null);

  useEffect(() => {
    dashApi.getEvenement(id).then((res) => setData(res.data));
  }, [id]);

  const handleExport = async (type) => {
    try {
      const res = await dashApi.exportData(id, type);
      const blob = new Blob([JSON.stringify(res.data, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `export_${type}.json`;
      a.click();
    } catch (err) {
      alert("Erreur d'export");
    }
  };

  if (!data) return <div className="text-center mt-5"><div className="spinner-border" /></div>;

  return (
    <div className="dashboard-page">
      <div className="mb-3">
        <Link to="/" className="btn btn-outline-secondary btn-sm">
          <i className="bi bi-arrow-left me-2"></i> Retour
        </Link>
      </div>

      <div className="page-hero mb-4">
        <div>
          <div className="hero-pill"><i className="bi bi-calendar-event"></i> Aperçu événement</div>
          <h3 className="mb-2">{data.evenement.titre}</h3>
          <p className="text-muted mb-0">{data.evenement.description || "Suivi complet des inscriptions et des cotisations."}</p>
        </div>
      </div>

      <div className="card shadow-sm dashboard-card mb-4">
        <div className="card-body p-4">
          <div className="row g-3">
            <div className="col-md-6">
              <div className="event-meta-item">
                <div className="stat-card-icon primary">
                  <i className="bi bi-calendar3"></i>
                </div>
                <div>
                  <small className="text-muted">Date</small>
                  <div className="fw-semibold">{new Date(data.evenement.dateEvenement).toLocaleDateString("fr-FR")}</div>
                </div>
              </div>
            </div>
            <div className="col-md-6">
              <div className="event-meta-item">
                <div className="stat-card-icon success">
                  <i className="bi bi-geo-alt"></i>
                </div>
                <div>
                  <small className="text-muted">Lieu</small>
                  <div className="fw-semibold">{data.evenement.lieu || "Non précisé"}</div>
                </div>
              </div>
            </div>
          </div>
          <div className="mt-3">
            <span className={`badge ${data.evenement.estCloture ? "bg-secondary" : "bg-success"}`}>
              {data.evenement.estCloture ? "Clos" : "Actif"}
            </span>
          </div>
        </div>
      </div>

      <div className="row g-4 mb-4">
        <div className="col-md-3">
          <div className="card shadow-sm dashboard-card stat-card primary">
            <div className="card-body d-flex justify-content-between align-items-center">
              <div>
                <div className="stat-label">Inscrits</div>
                <h2 className="stat-value">{data.nbInscrits}</h2>
              </div>
              <div className="stat-card-icon primary"><i className="bi bi-people"></i></div>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card shadow-sm dashboard-card stat-card success">
            <div className="card-body d-flex justify-content-between align-items-center">
              <div>
                <div className="stat-label">Cotisants</div>
                <h2 className="stat-value">{data.nbCotisants}</h2>
              </div>
              <div className="stat-card-icon success"><i className="bi bi-person-check"></i></div>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card shadow-sm dashboard-card stat-card warning">
            <div className="card-body d-flex justify-content-between align-items-center">
              <div>
                <div className="stat-label">Total cotisé</div>
                <h2 className="stat-value">{data.totalCotise.toLocaleString()} F</h2>
              </div>
              <div className="stat-card-icon warning"><i className="bi bi-cash-stack"></i></div>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card shadow-sm dashboard-card stat-card info">
            <div className="card-body d-flex justify-content-between align-items-center">
              <div>
                <div className="stat-label">Taux</div>
                <h2 className="stat-value">{data.tauxCotisation.toFixed(1)}%</h2>
              </div>
              <div className="stat-card-icon info"><i className="bi bi-percent"></i></div>
            </div>
          </div>
        </div>
      </div>

      <div className="card shadow-sm dashboard-card mb-4">
        <div className="card-header bg-transparent border-0 py-3 d-flex justify-content-between align-items-center">
          <h5 className="mb-0"><i className="bi bi-people me-2"></i> Liste des inscrits</h5>
          <div>
            <button className="btn btn-sm btn-outline-success me-2" onClick={() => handleExport("inscrits")}>
              <i className="bi bi-download me-1"></i> Inscrits
            </button>
            <button className="btn btn-sm btn-outline-warning me-2" onClick={() => handleExport("cotisants")}>
              <i className="bi bi-download me-1"></i> Cotisants
            </button>
            <button className="btn btn-sm btn-outline-primary" onClick={() => handleExport("complet")}>
              <i className="bi bi-download me-1"></i> Complet
            </button>
          </div>
        </div>
        <div className="card-body pt-0">
          <div className="table-responsive">
            <table className="table align-middle dashboard-table">
              <thead>
                <tr>
                  <th>Nom</th>
                  <th>Prénom</th>
                  <th>Téléphone</th>
                  <th>À cotisé</th>
                  <th>Montant</th>
                </tr>
              </thead>
              <tbody>
                {data.inscriptions.map((ins) => {
                  const cot = data.cotisations.find((c) => c.membreId === ins.membreId);
                  return (
                    <tr key={ins.id}>
                      <td>{ins.membreRef?.nom}</td>
                      <td>{ins.membreRef?.prenom}</td>
                      <td>{ins.membreRef?.telephone}</td>
                      <td>{cot ? <span className="badge bg-success">Oui</span> : <span className="badge bg-secondary">Non</span>}</td>
                      <td>{cot ? `${cot.montant.toLocaleString()} F` : "-"}</td>
                    </tr>
                  );
                })}
                {data.inscriptions.length === 0 && (
                  <tr><td colSpan="5" className="text-center text-muted">Aucune inscription</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className="card shadow-sm dashboard-card">
        <div className="card-header bg-transparent border-0 py-3">
          <h5 className="mb-0"><i className="bi bi-cash-coin me-2"></i> Liste des cotisations</h5>
        </div>
        <div className="card-body pt-0">
          <div className="table-responsive">
            <table className="table align-middle dashboard-table">
              <thead>
                <tr>
                  <th>Membre</th>
                  <th>Montant</th>
                  <th>Date</th>
                  <th>Mode</th>
                </tr>
              </thead>
              <tbody>
                {data.cotisations.map((c) => (
                  <tr key={c.id}>
                    <td>{c.membreRef?.prenom} {c.membreRef?.nom}</td>
                    <td><strong>{c.montant.toLocaleString()} F</strong></td>
                    <td>{new Date(c.createdAt).toLocaleDateString("fr-FR")}</td>
                    <td>{c.modePaiement}</td>
                  </tr>
                ))}
                {data.cotisations.length === 0 && (
                  <tr><td colSpan="4" className="text-center text-muted">Aucune cotisation</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
