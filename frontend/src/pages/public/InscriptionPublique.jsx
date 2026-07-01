import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import axios from "axios";

export default function InscriptionPublique() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [membreId, setMembreId] = useState("");
  const [search, setSearch] = useState("");

  const [captchaToken, setCaptchaToken] = useState("");
  const [captchaQuestion, setCaptchaQuestion] = useState("");
  const [captchaAnswer, setCaptchaAnswer] = useState("");

  const loadCaptcha = async () => {
    try {
      const res = await axios.get("/api/public/captcha");
      setCaptchaToken(res.data.token);
      setCaptchaQuestion(res.data.question);
      setCaptchaAnswer("");
    } catch {
      setError("Erreur de chargement du captcha");
    }
  };

  useEffect(() => {
    (async () => {
      try {
        const res = await axios.get(`/api/public/evenements/${id}`);
        setData(res.data);
        await loadCaptcha();
      } catch (err) {
        setError(err.response?.data?.error || "Evenement introuvable");
      }
      setLoading(false);
    })();
  }, [id]);

  const filteredMembres = data?.membres?.filter(
    (m) =>
      !m.dejaInscrit &&
      (m.nom.toLowerCase().includes(search.toLowerCase()) ||
        m.prenom.toLowerCase().includes(search.toLowerCase()) ||
        m.telephone.includes(search))
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!membreId || !captchaAnswer) return;
    setError("");
    try {
      const res = await axios.post("/api/public/inscrire", {
        evenementId: parseInt(id),
        membreId: parseInt(membreId),
        captchaToken,
        captchaAnswer: parseInt(captchaAnswer),
      });
      navigate(`/inscription-evenement/${id}/confirmation`);
    } catch (err) {
      setError(err.response?.data?.error || "Erreur lors de l'inscription");
      loadCaptcha();
    }
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: "100vh" }}>
        <div className="spinner-border text-primary" />
      </div>
    );
  }

  if (error && !data) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: "100vh" }}>
        <div className="card shadow" style={{ maxWidth: "500px" }}>
          <div className="card-body text-center p-5">
            <i className="bi bi-exclamation-triangle text-danger" style={{ fontSize: "3rem" }}></i>
            <h4 className="mt-3">Evenement indisponible</h4>
            <p className="text-muted">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="d-flex justify-content-center align-items-center" style={{ minHeight: "100vh" }}>
      <div className="card shadow" style={{ maxWidth: "600px", width: "100%" }}>
        <div className="card-header bg-primary text-white text-center">
          <h4 className="mb-0"><i className="bi bi-calendar-event"></i> Inscription - Dahira</h4>
        </div>
        <div className="card-body">
          <div className="text-center mb-4">
            <h3>{data.evenement.titre}</h3>
            {data.evenement.description && <p className="text-muted">{data.evenement.description}</p>}
            <p>
              <i className="bi bi-calendar"></i>{" "}
              {new Date(data.evenement.dateEvenement).toLocaleDateString("fr-FR", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
              {data.evenement.lieu && (
                <>
                  <br />
                  <i className="bi bi-geo-alt"></i> {data.evenement.lieu}
                </>
              )}
            </p>

            <div className="card bg-light border-0 mt-3">
              <div className="card-body py-3">
                <div className="d-flex justify-content-between align-items-baseline mb-2">
                  <span className="text-muted small">Objectif de collecte</span>
                  {data.evenement.montantObjectif > 0 && (
                    <span className="text-muted small">{data.evenement.progression || 0}%</span>
                  )}
                </div>
                {data.evenement.montantObjectif > 0 && (
                  <div className="progress mb-2" style={{ height: "12px" }}>
                    <div className="progress-bar bg-success"
                         role="progressbar"
                         style={{ width: `${data.evenement.progression || 0}%` }}
                         aria-valuenow={data.evenement.progression || 0}
                         aria-valuemin="0"
                         aria-valuemax="100">
                    </div>
                  </div>
                )}
                <h4 className="mb-0 fw-bold text-primary">
                  {data.evenement.montantObjectif > 0
                    ? `${Number(data.evenement.montantObjectif).toLocaleString()} FCFA`
                    : "Non defini"}
                </h4>
                <small className="text-muted">
                  Collecte: <strong>{(data.evenement.totalCotise || 0).toLocaleString()} F</strong>
                </small>
                {data.evenement.montantMinimum > 0 && (
                  <div className="mt-1">
                    <small className="text-muted">
                      Minimum par personne: <strong className="text-danger">{Number(data.evenement.montantMinimum).toLocaleString()} F</strong>
                    </small>
                  </div>
                )}
              </div>
            </div>
          </div>

          {error && <div className="alert alert-danger">{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="form-label"><strong>Recherchez votre nom</strong></label>
              <input
                type="text"
                className="form-control"
                placeholder="Tapez votre nom, prenom ou telephone..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                autoFocus
              />
            </div>

            <div className="mb-3">
              <label className="form-label"><strong>Selectionnez votre profil</strong></label>
              <select
                className="form-select"
                size={Math.min(filteredMembres?.length || 1, 6)}
                value={membreId}
                onChange={(e) => setMembreId(e.target.value)}
                required
              >
                <option value="">-- Choisissez votre nom --</option>
                {filteredMembres?.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.prenom} {m.nom} - {m.telephone}
                  </option>
                ))}
              </select>
              {filteredMembres?.length === 0 && search && (
                <div className="alert alert-warning mt-2 small">
                  Aucun membre trouve. Contactez un administrateur pour etre ajoute.
                </div>
              )}
            </div>

            <div className="mb-3">
              <label className="form-label"><strong>Captcha - {captchaQuestion}</strong></label>
              <div className="input-group">
                <input
                  type="number"
                  className="form-control"
                  placeholder="Saisissez votre reponse"
                  value={captchaAnswer}
                  onChange={(e) => setCaptchaAnswer(e.target.value)}
                  required
                />
                <button type="button" className="btn btn-outline-secondary" onClick={loadCaptcha} title="Nouveau calcul">
                  <i className="bi bi-arrow-clockwise"></i>
                </button>
              </div>
            </div>

            <button type="submit" className="btn btn-success w-100" disabled={!membreId || !captchaAnswer}>
              <i className="bi bi-check-circle"></i> Je m'inscris
            </button>
          </form>

          <hr />
          <p className="text-muted small text-center mb-0 mt-3">
            <i className="bi bi-shield-lock"></i> Seuls les administrateurs peuvent valider les cotisations.
          </p>
          <div className="text-center mt-3">
            <Link to="/inscription-membre" className="btn btn-outline-primary btn-sm">
              <i className="bi bi-person-plus"></i> Pas encore membre ? Inscrivez-vous ici
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
