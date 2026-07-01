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
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: "100vh", background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)" }}>
        <div className="card shadow-lg border-0 text-center" style={{ maxWidth: "500px", width: "100%", borderRadius: "15px" }}>
          <div className="card-body p-5">
            <i className={`bi ${config.statut === "pas_encore" ? "bi-clock" : "bi-calendar-x"} text-warning`} style={{ fontSize: "4rem" }}></i>
            <h4 className="mt-3">{config.statut === "pas_encore" ? "Inscriptions pas encore ouvertes" : "Inscriptions terminees"}</h4>
            <p className="text-muted">{config.message}</p>
            <hr />
            <Link to="/login" className="btn btn-primary">
              <i className="bi bi-box-arrow-in-right"></i> Espace administrateur
            </Link>
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
    <div className="d-flex justify-content-center align-items-center" style={{ minHeight: "100vh", background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)" }}>
      <div className="card shadow-lg border-0" style={{ maxWidth: "560px", width: "100%", borderRadius: "15px" }}>
        <div className="card-header bg-primary text-white text-center py-3" style={{ borderRadius: "15px 15px 0 0" }}>
          <h4 className="mb-0"><i className="bi bi-person-plus-fill"></i> Adhesion au Dahira</h4>
          <small>Rejoignez notre communaute</small>
        </div>
        <div className="card-body p-4">
          {error && <div className="alert alert-danger">{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="row">
              <div className="col-md-6 mb-3">
                <label className="form-label">Nom <span className="text-danger">*</span></label>
                <input type="text" className="form-control" name="nom" value={form.nom} onChange={handleChange} required placeholder="Votre nom" />
              </div>
              <div className="col-md-6 mb-3">
                <label className="form-label">Prenom <span className="text-danger">*</span></label>
                <input type="text" className="form-control" name="prenom" value={form.prenom} onChange={handleChange} required placeholder="Votre prenom" />
              </div>
            </div>

            <div className="row">
              <div className="col-md-6 mb-3">
                <label className="form-label">Telephone <span className="text-danger">*</span></label>
                <input type="tel" className="form-control" name="telephone" value={form.telephone} onChange={handleChange} required placeholder="+221 77 XXX XX XX" />
              </div>
              <div className="col-md-6 mb-3">
                <label className="form-label">Email</label>
                <input type="email" className="form-control" name="email" value={form.email} onChange={handleChange} placeholder="email@exemple.com" />
              </div>
            </div>

            <div className="mb-3">
              <label className="form-label">Localite</label>
              <select className="form-select" name="localiteId" value={form.localiteId} onChange={handleChange}>
                <option value="">-- Selectionnez votre localite --</option>
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
                <input type="number" className="form-control" placeholder="Saisissez votre reponse" value={captchaAnswer} onChange={(e) => setCaptchaAnswer(e.target.value)} required />
                <button type="button" className="btn btn-outline-secondary" onClick={loadCaptcha} title="Nouveau calcul">
                  <i className="bi bi-arrow-clockwise"></i>
                </button>
              </div>
            </div>

            <button type="submit" className="btn btn-success w-100 py-2" disabled={loading || !captchaAnswer}>
              <i className="bi bi-check-circle"></i> {loading ? "Inscription en cours..." : "Je rejoins le Dahira"}
            </button>
          </form>

          <hr />
          <p className="text-muted small text-center mb-0">
            <i className="bi bi-shield-lock"></i> Vos donnees sont confidentielles.
            Deja membre ? <Link to="/login">Connectez-vous</Link>
          </p>
        </div>
      </div>
    </div>
  );
}