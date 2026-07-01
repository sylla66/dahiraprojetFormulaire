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
    <div className="admin-page">
      <div className="page-hero mb-4 d-flex flex-wrap justify-content-between align-items-start gap-3">
        <div>
          <div className="hero-pill"><i className="bi bi-shield-lock"></i> Super Admin</div>
          <h3 className="mb-2">Dashboard global</h3>
          <p className="text-muted mb-0">Vue d’ensemble des membres, événements, utilisateurs et suivi des cotisations.</p>
        </div>
        <div className="d-flex gap-2 flex-wrap">
          {backupInfo && (
            <span className="text-muted small align-self-center">
              Backup: {backupInfo.size || "?"} Mo
            </span>
          )}
          <a className="btn btn-outline-dark" href="/api/export/membres" target="_blank" rel="noopener noreferrer">
            <i className="bi bi-filetype-pdf me-1"></i> PDF membres
          </a>
          <a className="btn btn-outline-danger" href="/api/backup/database" target="_blank" rel="noopener noreferrer">
            <i className="bi bi-download me-1"></i> Backup BDD
          </a>
          <button className="btn btn-outline-success" onClick={() => handleSeed(false)} disabled={seeding}>
            <i className="bi bi-database-add me-1"></i> {seeding ? "..." : "Seed demo"}
          </button>
          <button className="btn btn-outline-warning" onClick={() => handleSeed(true)} disabled={seeding}>
            <i className="bi bi-arrow-counterclockwise me-1"></i> Reset + seed
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
          <Link to="/super-admin/membres" className="card stat-card primary text-decoration-none h-100">
            <div className="card-body">
              <div className="stat-label">Membres</div>
              <div className="stat-value">{data.stats.totalMembres}</div>
            </div>
          </Link>
        </div>
        <div className="col-md-3 mb-3">
          <div className="card stat-card info h-100">
            <div className="card-body">
              <div className="stat-label">Événements</div>
              <div className="stat-value">{data.stats.totalEvenements}</div>
            </div>
          </div>
        </div>
        <div className="col-md-3 mb-3">
          <div className="card stat-card success h-100">
            <div className="card-body">
              <div className="stat-label">Admins actifs</div>
              <div className="stat-value">{data.stats.totalAdmins}</div>
            </div>
          </div>
        </div>
        <div className="col-md-3 mb-3">
          <div className="card stat-card warning h-100">
            <div className="card-body">
              <div className="stat-label">Collecte événements</div>
              <div className="stat-value">{data.stats.totalCotise.toLocaleString()} F</div>
            </div>
          </div>
        </div>
      </div>

      <div className="row mb-4">
        <div className="col-md-3 mb-3">
          <div className="card dashboard-card h-100">
            <div className="card-body text-center">
              <h2 className="mb-1">{data.stats.totalInscriptions}</h2>
              <h6 className="text-muted mb-0">Inscriptions événements</h6>
            </div>
          </div>
        </div>
        <div className="col-md-3 mb-3">
          <div className="card dashboard-card h-100">
            <div className="card-body text-center">
              <h2 className="mb-1">{data.stats.totalCotisations}</h2>
              <h6 className="text-muted mb-0">Cotisations validées</h6>
            </div>
          </div>
        </div>
        <div className="col-md-3 mb-3">
          <Link to="/admin/cotisations" className="card dashboard-card h-100 text-decoration-none">
            <div className="card-body text-center">
              <h2 className="mb-1">{data.stats.nbPaiementsRecurrents}</h2>
              <h6 className="text-muted mb-0">Paiements récurrents</h6>
            </div>
          </Link>
        </div>
        <div className="col-md-3 mb-3">
          <Link to="/admin/cotisations/types" className="card dashboard-card h-100 text-decoration-none">
            <div className="card-body text-center">
              <h2 className="mb-1">{data.stats.totalTypesCotisation}</h2>
              <h6 className="text-muted mb-0">Types cotisation</h6>
            </div>
          </Link>
        </div>
      </div>

      {(cotisationStats || recents.length > 0) && (
        <div className="row mb-4">
          {cotisationStats && cotisationStats.stats && cotisationStats.stats.length > 0 && (
            <div className="col-md-6 mb-4">
              <div className="card dashboard-card h-100">
                <div className="card-header bg-success text-white d-flex justify-content-between align-items-center">
                  <h5 className="mb-0"><i className="bi bi-pie-chart me-2"></i> Cotisations récurrentes</h5>
                  <span className="badge bg-light text-dark">{cotisationStats.grandTotal.toLocaleString()} F</span>
                </div>
                <div className="card-body p-0">
                  <table className="table table-sm align-middle mb-0">
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
              <div className="card dashboard-card h-100">
                <div className="card-header bg-info text-white">
                  <h5 className="mb-0"><i className="bi bi-clock-history me-2"></i> Derniers paiements récurrents</h5>
                </div>
                <div className="card-body p-0">
                  <table className="table table-sm align-middle mb-0">
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
          <div className="card dashboard-card h-100">
            <div className="card-header bg-info text-white d-flex justify-content-between align-items-center">
              <h5 className="mb-0"><i className="bi bi-calendar2-event me-2"></i> Derniers événements</h5>
              <Link to="/super-admin/compile" className="btn btn-sm btn-light">Vue compilée</Link>
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
          <div className="card dashboard-card h-100">
            <div className="card-header bg-secondary text-white d-flex justify-content-between align-items-center">
              <h5 className="mb-0"><i className="bi bi-people me-2"></i> Administrateurs</h5>
              <Link to="/super-admin/utilisateurs" className="btn btn-sm btn-light">Gérer</Link>
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
          <div className="card dashboard-card">
            <div className="card-header bg-dark text-white d-flex justify-content-between align-items-center">
              <h5 className="mb-0"><i className="bi bi-boxes me-2"></i> Accès rapide</h5>
            </div>
            <div className="card-body">
              <div className="row g-2">
                <div className="col-md-3 col-6">
                  <Link to="/super-admin" className="btn btn-outline-primary w-100"><i className="bi bi-speedometer2 me-1"></i> Dashboard</Link>
                </div>
                <div className="col-md-3 col-6">
                  <Link to="/super-admin/membres" className="btn btn-outline-primary w-100"><i className="bi bi-people me-1"></i> Membres</Link>
                </div>
                <div className="col-md-3 col-6">
                  <Link to="/super-admin/utilisateurs" className="btn btn-outline-primary w-100"><i className="bi bi-person-gear me-1"></i> Utilisateurs</Link>
                </div>
                <div className="col-md-3 col-6">
                  <Link to="/super-admin/compile" className="btn btn-outline-primary w-100"><i className="bi bi-table me-1"></i> Compile</Link>
                </div>
                <div className="col-md-3 col-6">
                  <Link to="/super-admin/localites" className="btn btn-outline-primary w-100"><i className="bi bi-geo-alt me-1"></i> Localités</Link>
                </div>
                <div className="col-md-3 col-6">
                  <Link to="/super-admin/activites" className="btn btn-outline-primary w-100"><i className="bi bi-activity me-1"></i> Activités</Link>
                </div>
                <div className="col-md-3 col-6">
                  <Link to="/admin/cotisations" className="btn btn-outline-success w-100"><i className="bi bi-cash-stack me-1"></i> Cotisations</Link>
                </div>
                <div className="col-md-3 col-6">
                  <Link to="/admin/cotisations/types" className="btn btn-outline-success w-100"><i className="bi bi-tags me-1"></i> Types cotisation</Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
