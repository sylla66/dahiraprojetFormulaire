import { useState, useEffect } from "react";
import { admin } from "../../services/api";

export default function Historique() {
  const [activites, setActivites] = useState([]);

  useEffect(() => {
    admin.getHistorique().then((res) => setActivites(res.data));
  }, []);

  return (
    <div className="card shadow">
      <div className="card-header bg-info text-white">
        <h4 className="mb-0"><i className="bi bi-clock-history"></i> Mon historique d'activites</h4>
      </div>
      <div className="card-body">
        <div className="table-responsive">
          <table className="table table-hover">
            <thead className="table-light">
              <tr><th>Date</th><th>Action</th><th>Details</th></tr>
            </thead>
            <tbody>
              {activites.map((a) => (
                <tr key={a.id}>
                  <td>{new Date(a.createdAt).toLocaleString("fr-FR")}</td>
                  <td>{a.action}</td>
                  <td>{a.details}</td>
                </tr>
              ))}
              {activites.length === 0 && <tr><td colSpan="3" className="text-center text-muted">Aucune activite</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
