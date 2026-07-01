import { useState, useEffect } from "react";
import { admin } from "../../services/api";

export default function ParametresInscription() {
  const [config, setConfig] = useState({
    dateDebutInscriptionMembre: "",
    dateFinInscriptionMembre: "",
  });
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const publicUrl = `${window.location.origin}/inscription-membre`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(publicUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  useEffect(() => {
    admin.getConfig().then((res) => {
      setConfig({
        dateDebutInscriptionMembre: res.data.dateDebutInscriptionMembre || "",
        dateFinInscriptionMembre: res.data.dateFinInscriptionMembre || "",
      });
    }).catch(() => setError("Erreur de chargement"));
  }, []);

  const handleChange = (e) => setConfig({ ...config, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");
    try {
      const body = {};
      if (config.dateDebutInscriptionMembre) body.dateDebutInscriptionMembre = config.dateDebutInscriptionMembre;
      if (config.dateFinInscriptionMembre) body.dateFinInscriptionMembre = config.dateFinInscriptionMembre;
      await admin.updateConfig(body);
      setMessage("Configuration mise a jour");
    } catch (err) {
      setError(err.response?.data?.error || "Erreur");
    }
  };

  const handleClearDates = async () => {
    setConfig({ dateDebutInscriptionMembre: "", dateFinInscriptionMembre: "" });
    setError("");
    setMessage("");
    try {
      await admin.updateConfig({ dateDebutInscriptionMembre: "", dateFinInscriptionMembre: "" });
      setMessage("Dates effacees. Inscriptions sans restriction.");
    } catch (err) {
      setError(err.response?.data?.error || "Erreur");
    }
  };

  const now = new Date();
  const debut = config.dateDebutInscriptionMembre ? new Date(config.dateDebutInscriptionMembre) : null;
  const fin = config.dateFinInscriptionMembre ? new Date(config.dateFinInscriptionMembre) : null;
  let statut = "Aucune restriction";
  if (debut && fin) {
    if (now < debut) statut = "Pas encore ouvertes";
    else if (now > fin) statut = "Terminees";
    else statut = "Ouvertes";
  } else if (debut && !fin) {
    statut = now < debut ? "Pas encore ouvertes" : "Ouvertes (sans date de fin)";
  } else if (!debut && fin) {
    statut = now > fin ? "Terminees" : "Ouvertes (sans date de debut)";
  }

  return (
    <div className="admin-page">
      <div className="page-hero mb-4">
        <div>
          <div className="hero-pill"><i className="bi bi-calendar-range"></i> Inscriptions</div>
          <h3 className="mb-2">Paramètres d'inscription des membres</h3>
          <p className="text-muted mb-0">Contrôlez la période d’ouverture des inscriptions et partagez facilement le lien public.</p>
        </div>
      </div>

      <div className="row justify-content-center">
        <div className="col-lg-9">
          <div className="card shadow-sm dashboard-card">
            <div className="card-body p-4 p-lg-5">
              {message && <div className="alert alert-success">{message}</div>}
              {error && <div className="alert alert-danger">{error}</div>}

              <div className="card bg-light border-0 mb-4">
                <div className="card-body py-3">
                  <div className="d-flex align-items-center justify-content-between flex-wrap gap-2">
                    <div>
                      <small className="text-muted">Lien public à partager</small>
                      <div className="input-group mt-1">
                        <input type="text" className="form-control form-control-sm bg-white" value={publicUrl} readOnly onClick={(e) => e.target.select()} />
                        <button className="btn btn-sm btn-success" onClick={handleCopyLink}>
                          <i className={`bi ${copied ? "bi-check-lg" : "bi-clipboard"}`}></i> {copied ? "Copié !" : "Copier"}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="alert alert-info d-flex align-items-center gap-2">
                <i className="bi bi-info-circle fs-4"></i>
                <div>
                  <strong>Statut actuel :</strong>{" "}
                  <span className={`badge ${statut === "Ouvertes" ? "bg-success" : statut === "Terminees" ? "bg-danger" : statut === "Pas encore ouvertes" ? "bg-warning" : "bg-secondary"}`}>
                    {statut}
                  </span>
                </div>
              </div>

              <form onSubmit={handleSubmit}>
                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label className="form-label">Date début d'inscription</label>
                    <input type="datetime-local" className="form-control" name="dateDebutInscriptionMembre"
                      value={config.dateDebutInscriptionMembre} onChange={handleChange} />
                    <small className="text-muted">Laissez vide pour aucune restriction</small>
                  </div>
                  <div className="col-md-6 mb-3">
                    <label className="form-label">Date fin d'inscription</label>
                    <input type="datetime-local" className="form-control" name="dateFinInscriptionMembre"
                      value={config.dateFinInscriptionMembre} onChange={handleChange} />
                    <small className="text-muted">Laissez vide pour aucune restriction</small>
                  </div>
                </div>

                <div className="d-flex gap-2 flex-wrap">
                  <button type="submit" className="btn btn-primary flex-fill">
                    <i className="bi bi-save me-2"></i> Enregistrer
                  </button>
                  <button type="button" className="btn btn-outline-danger" onClick={handleClearDates}>
                    <i className="bi bi-x-circle me-2"></i> Effacer les dates
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}