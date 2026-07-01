import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import Layout from "./components/Layout";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import DashboardHome from "./pages/dashboard/DashboardHome";
import DashboardEvenement from "./pages/dashboard/DashboardEvenement";
import ListeMembres from "./pages/admin/ListeMembres";
import AjouterMembre from "./pages/admin/AjouterMembre";
import ModifierMembre from "./pages/admin/ModifierMembre";
import ListeEvenements from "./pages/admin/ListeEvenements";
import CreerEvenement from "./pages/admin/CreerEvenement";
import GererEvenement from "./pages/admin/GererEvenement";
import ModifierEvenement from "./pages/admin/ModifierEvenement";
import ListeFormulaires from "./pages/forms/ListeFormulaires";
import CreerFormulaire from "./pages/forms/CreerFormulaire";
import ModifierFormulaire from "./pages/forms/ModifierFormulaire";
import SuperDashboard from "./pages/superAdmin/SuperDashboard";
import GestionUtilisateurs from "./pages/superAdmin/GestionUtilisateurs";
import VueCompile from "./pages/superAdmin/VueCompile";
import GestionLocalites from "./pages/superAdmin/GestionLocalites";
import ActivitesLog from "./pages/superAdmin/ActivitesLog";
import Historique from "./pages/admin/Historique";
import ParametresInscription from "./pages/admin/ParametresInscription";
import GererTypesCotisation from "./pages/admin/GererTypesCotisation";
import PaiementsTypeCotisation from "./pages/admin/PaiementsTypeCotisation";
import SuiviCotisations from "./pages/admin/SuiviCotisations";
import ListeMembresGlobal from "./pages/superAdmin/ListeMembresGlobal";
import InscriptionPublique from "./pages/public/InscriptionPublique";
import ConfirmationInscription from "./pages/public/ConfirmationInscription";
import InscriptionMembre from "./pages/public/InscriptionMembre";
import ConfirmationMembre from "./pages/public/ConfirmationMembre";

function PrivateRoute({ children, adminOnly, superAdminOnly }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="text-center mt-5"><div className="spinner-border" /></div>;
  if (!user) return <Navigate to="/login" />;
  if (superAdminOnly && !user.estSuperAdmin()) return <Navigate to="/" />;
  if (adminOnly && !user.estAdmin() && !user.estSuperAdmin()) return <Navigate to="/" />;
  return children;
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/inscription-evenement/:id" element={<InscriptionPublique />} />
          <Route path="/inscription-evenement/:id/confirmation" element={<ConfirmationInscription />} />
          <Route path="/inscription-membre" element={<InscriptionMembre />} />
          <Route path="/inscription-membre/confirmation" element={<ConfirmationMembre />} />
          <Route path="/" element={<PrivateRoute><Layout /></PrivateRoute>}>
            <Route index element={<DashboardHome />} />
            <Route path="dashboard/evenement/:id" element={<DashboardEvenement />} />
            <Route path="admin/membres" element={<PrivateRoute adminOnly><ListeMembres /></PrivateRoute>} />
            <Route path="admin/membres/ajouter" element={<PrivateRoute adminOnly><AjouterMembre /></PrivateRoute>} />
            <Route path="admin/membres/:id/modifier" element={<PrivateRoute adminOnly><ModifierMembre /></PrivateRoute>} />
            <Route path="admin/evenements" element={<PrivateRoute adminOnly><ListeEvenements /></PrivateRoute>} />
            <Route path="admin/evenements/creer" element={<PrivateRoute adminOnly><CreerEvenement /></PrivateRoute>} />
            <Route path="admin/evenements/:id/gerer" element={<PrivateRoute adminOnly><GererEvenement /></PrivateRoute>} />
            <Route path="admin/evenements/:id/modifier" element={<PrivateRoute adminOnly><ModifierEvenement /></PrivateRoute>} />
            <Route path="admin/historique" element={<PrivateRoute adminOnly><Historique /></PrivateRoute>} />
            <Route path="admin/parametres-inscription" element={<PrivateRoute adminOnly><ParametresInscription /></PrivateRoute>} />
            <Route path="admin/cotisations" element={<PrivateRoute adminOnly><SuiviCotisations /></PrivateRoute>} />
            <Route path="admin/cotisations/types" element={<PrivateRoute adminOnly><GererTypesCotisation /></PrivateRoute>} />
            <Route path="admin/cotisations/:id/paiements" element={<PrivateRoute adminOnly><PaiementsTypeCotisation /></PrivateRoute>} />
            <Route path="forms" element={<PrivateRoute adminOnly><ListeFormulaires /></PrivateRoute>} />
            <Route path="forms/creer" element={<PrivateRoute adminOnly><CreerFormulaire /></PrivateRoute>} />
            <Route path="forms/:id/modifier" element={<PrivateRoute adminOnly><ModifierFormulaire /></PrivateRoute>} />
            <Route path="super-admin" element={<PrivateRoute superAdminOnly><SuperDashboard /></PrivateRoute>} />
            <Route path="super-admin/utilisateurs" element={<PrivateRoute superAdminOnly><GestionUtilisateurs /></PrivateRoute>} />
            <Route path="super-admin/compile" element={<PrivateRoute superAdminOnly><VueCompile /></PrivateRoute>} />
            <Route path="super-admin/localites" element={<PrivateRoute superAdminOnly><GestionLocalites /></PrivateRoute>} />
            <Route path="super-admin/activites" element={<PrivateRoute superAdminOnly><ActivitesLog /></PrivateRoute>} />
            <Route path="super-admin/membres" element={<PrivateRoute superAdminOnly><ListeMembresGlobal /></PrivateRoute>} />
            <Route path="auth/register" element={<PrivateRoute superAdminOnly><Register /></PrivateRoute>} />
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
