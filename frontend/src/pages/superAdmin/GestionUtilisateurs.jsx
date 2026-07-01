import { useState, useEffect } from "react";
import { superAdmin } from "../../services/api";

const emptyForm = { username: "", email: "", password: "", nom: "", prenom: "", telephone: "", localite: "", role: "admin" };

export default function GestionUtilisateurs() {
  const [users, setUsers] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ ...emptyForm });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [roleUser, setRoleUser] = useState(null);

  useEffect(() => { superAdmin.getUtilisateurs().then((res) => setUsers(res.data)); }, []);

  const handleToggle = async (id) => {
    const res = await superAdmin.toggleUser(id).catch(() => {});
    if (res) setUsers(users.map((u) => (u.id === id ? res.data : u)));
  };

  const handleDelete = async (id, nom) => {
    if (!confirm(`Supprimer ${nom} ?`)) return;
    await superAdmin.deleteUser(id).catch(() => {});
    setUsers(users.filter((u) => u.id !== id));
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setError("");
    if (form.password.length < 8) return setError("Mot de passe: minimum 8 caracteres");
    setSubmitting(true);
    try {
      const res = await superAdmin.createUser(form);
      setUsers([...users, res.data]);
      setShowModal(false);
      setForm({ ...emptyForm });
    } catch (err) {
      setError(err.response?.data?.error || err.message);
    }
    setSubmitting(false);
  };

  const handleRoleChange = async (id, role) => {
    const res = await superAdmin.updateUserRole(id, role).catch((err) => {
      alert(err.response?.data?.error || err.message);
    });
    if (res) setUsers(users.map((u) => (u.id === id ? res.data : u)));
    setRoleUser(null);
  };

  return (
    <div className="card shadow">
      <div className="card-header bg-primary text-white d-flex justify-content-between align-items-center flex-wrap gap-2">
        <h4 className="mb-0"><i className="bi bi-people"></i> Gestion des utilisateurs</h4>
        <button className="btn btn-light" onClick={() => { setForm({ ...emptyForm }); setError(""); setShowModal(true); }}>
          <i className="bi bi-person-plus"></i> Nouvel utilisateur
        </button>
      </div>
      <div className="card-body">
        <div className="table-responsive">
          <table className="table table-hover align-middle">
            <thead className="table-light">
              <tr>
                <th>Nom</th><th>Prenom</th><th>Username</th><th>Email</th><th>Role</th>
                <th>Localite</th><th>Statut</th><th>Derniere connexion</th><th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id}>
                  <td>{u.nom}</td>
                  <td>{u.prenom}</td>
                  <td>{u.username}</td>
                  <td>{u.email}</td>
                  <td>
                    {roleUser === u.id ? (
                      <div className="d-flex gap-1">
                        <select className="form-select form-select-sm" defaultValue={u.role} style={{ width: 120 }}>
                          <option value="admin">Admin</option>
                          <option value="super_admin">Super admin</option>
                        </select>
                        <button className="btn btn-sm btn-success" onClick={(e) => handleRoleChange(u.id, e.target.parentElement.querySelector("select").value)}>
                          <i className="bi bi-check"></i>
                        </button>
                        <button className="btn btn-sm btn-secondary" onClick={() => setRoleUser(null)}>
                          <i className="bi bi-x"></i>
                        </button>
                      </div>
                    ) : (
                      <span className="d-flex align-items-center gap-2">
                        {u.role === "super_admin" ? (
                          <span className="badge bg-warning text-dark">Super Admin</span>
                        ) : (
                          <span className="badge bg-info">Admin</span>
                        )}
                        <button className="btn btn-sm btn-outline-secondary" onClick={() => setRoleUser(u.id)} title="Changer role">
                          <i className="bi bi-pencil"></i>
                        </button>
                      </span>
                    )}
                  </td>
                  <td>{u.localite || "-"}</td>
                  <td>
                    {u.isActive ? (
                      <span className="badge bg-success">Actif</span>
                    ) : (
                      <span className="badge bg-secondary">Inactif</span>
                    )}
                  </td>
                  <td>{u.lastLogin ? new Date(u.lastLogin).toLocaleDateString("fr-FR") : "-"}</td>
                  <td>
                    <button className={`btn btn-sm ${u.isActive ? "btn-warning" : "btn-success"} me-1`}
                      onClick={() => handleToggle(u.id)} title={u.isActive ? "Desactiver" : "Activer"}>
                      <i className={`bi ${u.isActive ? "bi-pause-circle" : "bi-play-circle"}`}></i>
                    </button>
                    <button className="btn btn-sm btn-danger" onClick={() => handleDelete(u.id, `${u.prenom} ${u.nom}`)} title="Supprimer">
                      <i className="bi bi-trash"></i>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="modal d-block" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header bg-primary text-white">
                <h5 className="modal-title"><i className="bi bi-person-plus"></i> Nouvel utilisateur</h5>
                <button type="button" className="btn-close btn-close-white" onClick={() => setShowModal(false)} />
              </div>
              <form onSubmit={handleCreate}>
                <div className="modal-body">
                  {error && <div className="alert alert-danger py-2">{error}</div>}
                  <div className="row g-2">
                    <div className="col-md-6">
                      <label className="form-label">Nom <span className="text-danger">*</span></label>
                      <input className="form-control" required value={form.nom} onChange={(e) => setForm({ ...form, nom: e.target.value })} />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Prenom <span className="text-danger">*</span></label>
                      <input className="form-control" required value={form.prenom} onChange={(e) => setForm({ ...form, prenom: e.target.value })} />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Username <span className="text-danger">*</span></label>
                      <input className="form-control" required value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Email <span className="text-danger">*</span></label>
                      <input type="email" className="form-control" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Mot de passe <span className="text-danger">*</span></label>
                      <input type="password" className="form-control" required minLength={8} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
                      <small className="text-muted">Minimum 8 caracteres, 1 maj, 1 min, 1 chiffre</small>
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Telephone</label>
                      <input className="form-control" value={form.telephone} onChange={(e) => setForm({ ...form, telephone: e.target.value })} />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Localite</label>
                      <input className="form-control" value={form.localite} onChange={(e) => setForm({ ...form, localite: e.target.value })} />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Role</label>
                      <select className="form-select" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
                        <option value="admin">Admin</option>
                        <option value="super_admin">Super admin</option>
                      </select>
                    </div>
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={() => { setShowModal(false); setError(""); }}>Annuler</button>
                  <button type="submit" className="btn btn-primary" disabled={submitting}>
                    {submitting ? <span className="spinner-border spinner-border-sm" /> : "Creer"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
