import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { superAdmin, cotisations } from "../../services/api";
import axios from "axios";

export default function SuperDashboard() {
  const [data, setData] = useState(null);
  const [cotisationStats, setCotisationStats] = useState(null);
  const [recents, setRecents] = useState([]);
  const [seeding, setSeeding] = useState(false);
  const [seedMsg, setSeedMsg] = useState(null);

  useEffect(() => {
    superAdmin.getDashboard().then((res) => setData(res.data));
    superAdmin.getStatsCotisations().then((res) => setCotisationStats(res.data)).catch(() => {});
    cotisations.getRecents().then((res) => setRecents(res.data)).catch(() => {});
  }, []);

  const [backupInfo, setBackupInfo] = useState(null);
  useEffect(() => {
    axios.get("/api/backup/info").then((res) => setBackupInfo(res.data)).catch(() => {});
  }, []);

  const handleSeed = async (force) => {
    if (force && !confirm("Toutes les donnees seront effacees. Continuer ?")) return;
    setSeeding(true);
    setSeedMsg(null);
    try {
      const res = await superAdmin.seed(force);
      setSeedMsg({ type: "success", text: `Donnees inserees: ${JSON.stringify(res.data.stats)}` });
      const [d, cs, r] = await Promise.all([
        superAdmin.getDashboard(), superAdmin.getStatsCotisations(), cotisations.getRecents(),
      ]);
      setData(d.data); setCotisationStats(cs.data); setRecents(r.data);
    } catch (err) {
      setSeedMsg({ type: "danger", text: err.response?.data?.error || err.message });
    }
    setSeeding(false);
  };

  if (!data) return <div className="text-center mt-5"><div className="spinner-border" /></div>;

  return (
    <div>
      <div className="d-flex flex-wrap justify-content-between align-items-center mb-4">
        <h3 className="mb-2 mb-md-0"><i className="bi bi-shield-lock"></i> Super Admin - Dashboard Global</h3>
        <div className="d-flex gap-2 flex-wrap">
          {backupInfo && (
            <span className="text-muted small align-self-center">
              Backup: {backupInfo.size || "?"} Mo
            </span>
          )}
          <a className="btn btn-outline-dark" href="/api/export/membres" target="_blank" rel="noopener noreferrer">
            <i className="bi bi-filetype-pdf"></i> PDF membres
          </a>
          <a className="btn btn-outline-danger" href="/api/backup/database" target="_blank" rel="noopener noreferrer">
            <i className="bi bi-download"></i> Backup BDD
          </a>
          <button className="btn btn-outline-success" onClick={() => handleSeed(false)} disabled={seeding}>
            <i className="bi bi-database-add"></i> {seeding ? "..." : "Seed demo"}
          </button>
          <button className="btn btn-outline-warning" onClick={() => handleSeed(true)} disabled={seeding}>
            <i className="bi bi-arrow-counterclockwise"></i> Reset + seed
          </button>
        </div>
      </div>

      {seedMsg && (
        <div className={`alert alert-${seedMsg.type} alert-dismissible fade show`}>
          {seedMsg.text}
          <button type="button" className="btn-close" onClick={() => setSeedMsg(null)} />
        </div>
      )}

      <div className="row mb-4">
        <div className="col-md-3 mb-3">
          <Link to="/super-admin/membres" className="card bg-primary text-white shadow text-center text-decoration-none">
            <div className="card-body">
              <h1 className="display-5">{data.stats.totalMembres}</h1>
              <h5>Membres</h5>
            </div>
          </Link>
        </div>
        <div className="col-md-3 mb-3">
          <div className="card bg-info text-white shadow text-center">
            <div className="card-body">
              <h1 className="display-5">{data.stats.totalEvenements}</h1>
              <h5>Evenements</h5>
            </div>
          </div>
        </div>
        <div className="col-md-3 mb-3">
          <div className="card bg-success text-white shadow text-center">
            <div className="card-body">
              <h1 className="display-5">{data.stats.totalAdmins}</h1>
              <h5>Admins actifs</h5>
            </div>
          </div>
        </div>
        <div className="col-md-3 mb-3">
          <div className="card bg-warning text-white shadow text-center">
            <div className="card-body">
              <h1 className="display-5">{data.stats.totalCotise.toLocaleString()} F</h1>
              <h5>Collecte evenements</h5>
            </div>
          </div>
        </div>
      </div>

      <div className="row mb-4">
        <div className="col-md-3 mb-3">
          <div className="card bg-secondary text-white shadow text-center">
            <div className="card-body">
              <h2>{data.stats.totalInscriptions}</h2>
              <h5>Inscriptions evenements</h5>
            </div>
          </div>
        </div>
        <div className="col-md-3 mb-3">
          <div className="card bg-dark text-white shadow text-center">
            <div className="card-body">
              <h2>{data.stats.totalCotisations}</h2>
              <h5>Cotisations validees</h5>
            </div>
          </div>
        </div>
        <div className="col-md-3 mb-3">
          <Link to="/admin/cotisations" className="card bg-success text-white shadow text-center text-decoration-none">
            <div className="card-body">
              <h2>{data.stats.nbPaiementsRecurrents}</h2>
              <h5>Paiements recurrents</h5>
            </div>
          </Link>
        </div>
        <div className="col-md-3 mb-3">
          <Link to="/admin/cotisations/types" className="card bg-primary text-white shadow text-center text-decoration-none">
            <div className="card-body">
              <h2>{data.stats.totalTypesCotisation}</h2>
              <h5>Types cotisation</h5>
            </div>
          </Link>
        </div>
      </div>

      {(cotisationStats || recents.length > 0) && (
        <div className="row mb-4">
          {cotisationStats && cotisationStats.stats && cotisationStats.stats.length > 0 && (
            <div className="col-md-6 mb-4">
              <div className="card shadow">
                <div className="card-header bg-success text-white d-flex justify-content-between align-items-center">
                  <h5 className="mb-0"><i className="bi bi-pie-chart"></i> Cotisations recurrentes - Detail par type</h5>
                  <span className="badge bg-light text-dark">{cotisationStats.grandTotal.toLocaleString()} F</span>
                </div>
                <div className="card-body p-0">
                  <table className="table table-sm table-striped mb-0">
                    <thead>
                      <tr>
                        <th>Type</th>
                        <th>Paiements</th>
                        <th className="text-end">Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {cotisationStats.stats.map((s) => (
                        <tr key={s.id}>
                          <td>{s.nom} <small className="text-muted">({s.createur})</small></td>
                          <td>{s.nbPaiements}</td>
                          <td className="text-end">{s.total.toLocaleString()} F</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
          {recents.length > 0 && (
            <div className="col-md-6 mb-4">
              <div className="card shadow">
                <div className="card-header bg-info text-white">
                  <h5 className="mb-0"><i className="bi bi-clock-history"></i> Derniers paiements recurrents</h5>
                </div>
                <div className="card-body p-0">
                  <table className="table table-sm table-striped mb-0">
                    <thead>
                      <tr>
                        <th>Membre</th>
                        <th>Type</th>
                        <th className="text-end">Montant</th>
                        <th>Mode</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recents.slice(0, 8).map((p) => (
                        <tr key={p.id}>
                          <td>{p.membreRef?.prenom} {p.membreRef?.nom}</td>
                          <td>{p.typeRef?.nom}</td>
                          <td className="text-end">{p.montant.toLocaleString()} F</td>
                          <td><span className="badge bg-secondary">{p.modePaiement}</span></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      <div className="row">
        <div className="col-md-6 mb-4">
          <div className="card shadow">
            <div className="card-header bg-info text-white d-flex justify-content-between align-items-center">
              <h5 className="mb-0"><i className="bi bi-calendar2-event"></i> Derniers evenements</h5>
              <Link to="/super-admin/compile" className="btn btn-sm btn-light">Vue compilee</Link>
            </div>
            <div className="card-body">
              <ul className="list-group">
                {data.evenements.map((e) => (
                  <li key={e.id} className="list-group-item d-flex justify-content-between align-items-center">
                    <div>
                      <strong>{e.titre}</strong>
                      <br /><small className="text-muted">{new Date(e.dateEvenement).toLocaleDateString("fr-FR")} - {e.organisateur?.prenom} {e.organisateur?.nom}</small>
                    </div>
                    <Link to={`/dashboard/evenement/${e.id}`} className="btn btn-sm btn-outline-primary">
                      <i className="bi bi-eye"></i>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
        <div className="col-md-6 mb-4">
          <div className="card shadow">
            <div className="card-header bg-secondary text-white d-flex justify-content-between align-items-center">
              <h5 className="mb-0"><i className="bi bi-people"></i> Administrateurs</h5>
              <Link to="/super-admin/utilisateurs" className="btn btn-sm btn-light">Gerer</Link>
            </div>
            <div className="card-body">
              <ul className="list-group">
                {data.admins.map((a) => (
                  <li key={a.id} className="list-group-item d-flex justify-content-between align-items-center">
                    <div>
                      <i className="bi bi-person"></i> {a.prenom} {a.nom} ({a.username})
                      <br /><small className="text-muted">{a.localite || "N/A"} - {a.isActive ? <span className="badge bg-success">Actif</span> : <span className="badge bg-secondary">Inactif</span>}</small>
                    </div>
                    <span className="badge bg-info">{a.role}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>

      <div className="row">
        <div className="col-12 mb-4">
          <div className="card shadow">
            <div className="card-header bg-dark text-white d-flex justify-content-between align-items-center">
              <h5 className="mb-0"><i className="bi bi-boxes"></i> Acces rapide</h5>
            </div>
            <div className="card-body">
              <div className="row g-2">
                <div className="col-md-3 col-6">
                  <Link to="/super-admin" className="btn btn-outline-primary w-100"><i className="bi bi-speedometer2"></i> Dashboard</Link>
                </div>
                <div className="col-md-3 col-6">
                  <Link to="/super-admin/membres" className="btn btn-outline-primary w-100"><i className="bi bi-people"></i> Membres</Link>
                </div>
                <div className="col-md-3 col-6">
                  <Link to="/super-admin/utilisateurs" className="btn btn-outline-primary w-100"><i className="bi bi-person-gear"></i> Utilisateurs</Link>
                </div>
                <div className="col-md-3 col-6">
                  <Link to="/super-admin/compile" className="btn btn-outline-primary w-100"><i className="bi bi-table"></i> Compile</Link>
                </div>
                <div className="col-md-3 col-6">
                  <Link to="/super-admin/localites" className="btn btn-outline-primary w-100"><i className="bi bi-geo-alt"></i> Localites</Link>
                </div>
                <div className="col-md-3 col-6">
                  <Link to="/super-admin/activites" className="btn btn-outline-primary w-100"><i className="bi bi-activity"></i> Activites</Link>
                </div>
                <div className="col-md-3 col-6">
                  <Link to="/admin/cotisations" className="btn btn-outline-success w-100"><i className="bi bi-cash-stack"></i> Cotisations</Link>
                </div>
                <div className="col-md-3 col-6">
                  <Link to="/admin/cotisations/types" className="btn btn-outline-success w-100"><i className="bi bi-tags"></i> Types cotisation</Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
