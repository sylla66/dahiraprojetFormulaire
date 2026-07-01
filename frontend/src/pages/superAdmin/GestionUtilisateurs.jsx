import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { superAdmin } from "../../services/api";

export default function GestionUtilisateurs() {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    superAdmin.getUtilisateurs().then((res) => setUsers(res.data));
  }, []);

  const handleToggle = async (id) => {
    const res = await superAdmin.toggleUser(id);
    setUsers(users.map((u) => (u.id === id ? res.data : u)));
  };

  const handleDelete = async (id, nom) => {
    if (!confirm(`Supprimer ${nom} ?`)) return;
    await superAdmin.deleteUser(id);
    setUsers(users.filter((u) => u.id !== id));
  };

  return (
    <div className="card shadow">
      <div className="card-header bg-primary text-white d-flex justify-content-between align-items-center">
        <h4 className="mb-0"><i className="bi bi-people"></i> Gestion des utilisateurs</h4>
        <Link to="/auth/register" className="btn btn-light">
          <i className="bi bi-person-plus"></i> Creer un compte
        </Link>
      </div>
      <div className="card-body">
        <div className="table-responsive">
          <table className="table table-hover">
            <thead className="table-light">
              <tr><th>Nom</th><th>Prenom</th><th>Username</th><th>Email</th><th>Role</th><th>Localite</th><th>Statut</th><th>Derniere connexion</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id}>
                  <td>{u.nom}</td>
                  <td>{u.prenom}</td>
                  <td>{u.username}</td>
                  <td>{u.email}</td>
                  <td>{u.role === "super_admin" ? <span className="badge bg-warning text-dark">Super Admin</span> : <span className="badge bg-info">Admin</span>}</td>
                  <td>{u.localite || "-"}</td>
                  <td>{u.isActive ? <span className="badge bg-success">Actif</span> : <span className="badge bg-secondary">Inactif</span>}</td>
                  <td>{u.lastLogin ? new Date(u.lastLogin).toLocaleDateString("fr-FR") : "-"}</td>
                  <td>
                    <button className={`btn btn-sm ${u.isActive ? "btn-warning" : "btn-success"} me-1`}
                      onClick={() => handleToggle(u.id)}>
                      <i className={`bi ${u.isActive ? "bi-pause-circle" : "bi-play-circle"}`}></i>
                    </button>
                    <button className="btn btn-sm btn-danger" onClick={() => handleDelete(u.id, `${u.prenom} ${u.nom}`)}>
                      <i className="bi bi-trash"></i>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
