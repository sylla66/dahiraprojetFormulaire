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
    <div>
      <div className="mb-3">
        <Link to="/" className="btn btn-outline-secondary btn-sm">
          <i className="bi bi-arrow-left"></i> Retour
        </Link>
      </div>

      <div className="card shadow mb-4">
        <div className="card-header bg-primary text-white">
          <h4 className="mb-0"><i className="bi bi-calendar-event"></i> {data.evenement.titre}</h4>
        </div>
        <div className="card-body">
          <p>{data.evenement.description}</p>
          <p><strong>Date:</strong> {new Date(data.evenement.dateEvenement).toLocaleDateString("fr-FR")}</p>
          <p><strong>Lieu:</strong> {data.evenement.lieu || "N/A"}</p>
          <p><strong>Statut:</strong> {data.evenement.estCloture ? <span className="badge bg-secondary">Clos</span> : <span className="badge bg-success">Actif</span>}</p>
        </div>
      </div>

      <div className="row mb-4">
        <div className="col-md-3 mb-3">
          <div className="card bg-info text-white shadow text-center">
            <div className="card-body">
              <h2>{data.nbInscrits}</h2>
              <h6>Inscrits</h6>
            </div>
          </div>
        </div>
        <div className="col-md-3 mb-3">
          <div className="card bg-success text-white shadow text-center">
            <div className="card-body">
              <h2>{data.nbCotisants}</h2>
              <h6>Cotisants</h6>
            </div>
          </div>
        </div>
        <div className="col-md-3 mb-3">
          <div className="card bg-warning text-white shadow text-center">
            <div className="card-body">
              <h2>{data.totalCotise.toLocaleString()} F</h2>
              <h6>Total cotise</h6>
            </div>
          </div>
        </div>
        <div className="col-md-3 mb-3">
          <div className="card bg-primary text-white shadow text-center">
            <div className="card-body">
              <h2>{data.tauxCotisation.toFixed(1)}%</h2>
              <h6>Taux cotisation</h6>
            </div>
          </div>
        </div>
      </div>

      <div className="card shadow mb-4">
        <div className="card-header d-flex justify-content-between align-items-center">
          <h5 className="mb-0"><i className="bi bi-people"></i> Listes des inscrits</h5>
          <div>
            <button className="btn btn-sm btn-outline-success me-2" onClick={() => handleExport("inscrits")}>
              <i className="bi bi-download"></i> Inscrits
            </button>
            <button className="btn btn-sm btn-outline-warning me-2" onClick={() => handleExport("cotisants")}>
              <i className="bi bi-download"></i> Cotisants
            </button>
            <button className="btn btn-sm btn-outline-primary" onClick={() => handleExport("complet")}>
              <i className="bi bi-download"></i> Complet
            </button>
          </div>
        </div>
        <div className="card-body">
          <div className="table-responsive">
            <table className="table table-hover">
              <thead className="table-light">
                <tr>
                  <th>Nom</th>
                  <th>Prenom</th>
                  <th>Telephone</th>
                  <th>A cotise</th>
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

      <div className="card shadow">
        <div className="card-header bg-success text-white">
          <h5 className="mb-0"><i className="bi bi-cash-coin"></i> Liste des cotisations</h5>
        </div>
        <div className="card-body">
          <div className="table-responsive">
            <table className="table table-hover">
              <thead className="table-light">
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
