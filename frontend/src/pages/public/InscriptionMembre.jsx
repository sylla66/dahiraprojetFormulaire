import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";

export default function InscriptionMembre() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    nom: "", prenom: "", telephone: "", email: "",
    localiteId: "", adresse: "", profession: "",
  });
  const [localites, setLocalites] = useState([]);
  const [error, setError] = useState("");
  const [captchaToken, setCaptchaToken] = useState("");
  const [captchaQuestion, setCaptchaQuestion] = useState("");
  const [captchaAnswer, setCaptchaAnswer] = useState("");
  const [loading, setLoading] = useState(false);
  const [config, setConfig] = useState(null);

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
    axios.get("/api/public/config/membre").then((res) => setConfig(res.data)).catch(() => {});
    axios.get("/api/public/localites").then((res) => setLocalites(res.data)).catch(() => {});
    loadCaptcha();
  }, []);

  if (config && config.statut !== "ouvert") {
    return (
      <div className="public-page">
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-lg-7">
              <div className="card shadow-sm dashboard-card text-center">
                <div className="card-body p-4 p-lg-5">
                  <div className="hero-pill mb-3"><i className={`bi ${config.statut === "pas_encore" ? "bi-clock" : "bi-calendar-x"}`}></i> Adhésion</div>
                  <i className={`bi ${config.statut === "pas_encore" ? "bi-clock" : "bi-calendar-x"} text-warning mb-3`} style={{ fontSize: "3rem" }}></i>
                  <h4 className="mt-2">{config.statut === "pas_encore" ? "Inscriptions pas encore ouvertes" : "Inscriptions terminées"}</h4>
                  <p className="text-muted">{config.message}</p>
                  <Link to="/login" className="btn btn-primary mt-2">
                    <i className="bi bi-box-arrow-in-right me-2"></i> Espace administrateur
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!captchaAnswer) return;
    setError("");
    setLoading(true);
    try {
      await axios.post("/api/public/membres", { ...form, captchaToken, captchaAnswer: parseInt(captchaAnswer) });
      navigate("/inscription-membre/confirmation");
    } catch (err) {
      setError(err.response?.data?.error || "Erreur lors de l'inscription");
      loadCaptcha();
    }
    setLoading(false);
  };

  return (
    <div className="public-page">
      <div className="container">
        <div className="page-hero mb-4 text-center">
          <div className="hero-pill"><i className="bi bi-person-plus-fill"></i> Adhésion</div>
          <h3 className="mb-2">Rejoignez le Dahira</h3>
          <p className="text-muted mb-0">Créez votre profil membre et accédez rapidement aux inscriptions et événements.</p>
        </div>

        <div className="row justify-content-center">
          <div className="col-lg-8 col-xl-7">
            <div className="card shadow-sm dashboard-card">
              <div className="card-body p-4 p-lg-5">
                {error && <div className="alert alert-danger">{error}</div>}

                <form onSubmit={handleSubmit}>
                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Nom <span className="text-danger">*</span></label>
                      <input type="text" className="form-control" name="nom" value={form.nom} onChange={handleChange} required placeholder="Votre nom" />
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Prénom <span className="text-danger">*</span></label>
                      <input type="text" className="form-control" name="prenom" value={form.prenom} onChange={handleChange} required placeholder="Votre prénom" />
                    </div>
                  </div>

                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Téléphone <span className="text-danger">*</span></label>
                      <input type="tel" className="form-control" name="telephone" value={form.telephone} onChange={handleChange} required placeholder="+221 77 XXX XX XX" />
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Email</label>
                      <input type="email" className="form-control" name="email" value={form.email} onChange={handleChange} placeholder="email@exemple.com" />
                    </div>
                  </div>

                  <div className="mb-3">
                    <label className="form-label">Localité</label>
                    <select className="form-select" name="localiteId" value={form.localiteId} onChange={handleChange}>
                      <option value="">-- Sélectionnez votre localité --</option>
                      {localites.map((l) => <option key={l.id} value={l.id}>{l.nom} ({l.pays})</option>)}
                    </select>
                  </div>

                  <div className="mb-3">
                    <label className="form-label">Adresse</label>
                    <input type="text" className="form-control" name="adresse" value={form.adresse} onChange={handleChange} placeholder="Votre adresse" />
                  </div>

                  <div className="mb-3">
                    <label className="form-label">Profession</label>
                    <input type="text" className="form-control" name="profession" value={form.profession} onChange={handleChange} placeholder="Votre profession" />
                  </div>

                  <div className="mb-3">
                    <label className="form-label"><strong>Captcha - {captchaQuestion}</strong></label>
                    <div className="input-group">
                      <input type="number" className="form-control" placeholder="Saisissez votre réponse" value={captchaAnswer} onChange={(e) => setCaptchaAnswer(e.target.value)} required />
                      <button type="button" className="btn btn-outline-secondary" onClick={loadCaptcha} title="Nouveau calcul">
                        <i className="bi bi-arrow-clockwise"></i>
                      </button>
                    </div>
                  </div>

                  <button type="submit" className="btn btn-success w-100 py-2" disabled={loading || !captchaAnswer}>
                    <i className="bi bi-check-circle me-2"></i> {loading ? "Inscription en cours..." : "Je rejoins le Dahira"}
                  </button>
                </form>

                <hr />
                <p className="text-muted small text-center mb-0">
                  <i className="bi bi-shield-lock me-1"></i> Vos données sont confidentielles.
                  Déjà membre ? <Link to="/login">Connectez-vous</Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}