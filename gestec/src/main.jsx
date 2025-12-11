import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import "./i18n"; 
import App from "./App.jsx";
import { createBrowserRouter, Navigate } from "react-router-dom";
import { Home } from "./components/Home/Home";
import { RouterProvider } from "react-router";
import ListTecnicos from "./components/Home/ListTecnicos";
import DetailTecnico from "./components/Home/DetailTecnico";
import CreateTecnico from "./components/Home/CreateTecnico";
import EditTecnico from "./components/Home/EditTecnico";
import ListCategorias from "./components/Categoria/ListCategorias";
import CreateCategoria from "./components/Categoria/CreateCategoria";
import EditCategoria from "./components/Categoria/EditCategoria";
import DetailCategoria from "./components/Categoria/DetailCategoria";
import ListTickets from "./components/Ticket/ListTickets";
import CreateTicket from "./components/Ticket/CreateTicket";
import DetailTicket from "./components/Ticket/DetailTicket";
import AsignacionesTecnico from "./components/Asignaciones/AsignacionesTecnico";
import Notificaciones from "./components/Notificaciones/Notificaciones";
import Login from "./components/Auth/Login";
import Register from "./components/Auth/Register";
import Logout from "./components/Auth/Logout";
import { AuthProvider } from "./components/Auth/AuthContext";
import { ProtectedRoute } from "./components/Auth/ProtectedRoute";
import ListUsuarios from "./components/Usuario/ListUsuarios";
import CreateUsuario from "./components/Usuario/CreateUsuario";
import EditUsuario from "./components/Usuario/EditUsuario";
import ChangePassword from "./components/Usuario/ChangePassword";
import Dashboard from "./components/Home/Dashboard";

const rutas=createBrowserRouter(
  [
    {
      element: <App />,
      children:[
        {
          path:'/',
          element: <ProtectedRoute><Home /></ProtectedRoute>
        },
        {
          path: '/tecnicos',
          element: <ProtectedRoute><ListTecnicos /></ProtectedRoute>
        },
        {
          path: '/tecnico/crear',
          element: <ProtectedRoute><CreateTecnico /></ProtectedRoute>
        },
        {
          path: '/tecnico/:id/editar',
          element: <ProtectedRoute><EditTecnico /></ProtectedRoute>
        },
        {
          path: '/tecnico/:id',
          element: <ProtectedRoute><DetailTecnico /></ProtectedRoute>
        },
        {
          path: '/categorias',
          element: <ProtectedRoute><ListCategorias /></ProtectedRoute>
        },
        {
          path: '/categoria/crear',
          element: <ProtectedRoute><CreateCategoria /></ProtectedRoute>
        },
        {
          path: '/categoria/:id/editar',
          element: <ProtectedRoute><EditCategoria /></ProtectedRoute>
        },
        {
          path: '/categoria/:id',
          element: <ProtectedRoute><DetailCategoria /></ProtectedRoute>
        },
        {
          path: '/tickets',
          element: <ProtectedRoute><ListTickets /></ProtectedRoute>
        },
        {
          path: '/ticket/crear',
          element: <ProtectedRoute><CreateTicket /></ProtectedRoute>
        },
        {
          path: '/ticket/:id',
          element: <ProtectedRoute><DetailTicket /></ProtectedRoute>
        },
        {
          path: '/asignaciones',
          element: <ProtectedRoute><AsignacionesTecnico /></ProtectedRoute>
        },
        {
          path: '/notificaciones',
          element: <ProtectedRoute><Notificaciones /></ProtectedRoute>
        },
        {
          path: '/dashboard',
          element: <ProtectedRoute><Dashboard /></ProtectedRoute>
        },
        {
          path: '/usuarios',
          element: <ProtectedRoute><ListUsuarios /></ProtectedRoute>
        },
        {
          path: '/usuarios/crear',
          element: <ProtectedRoute><CreateUsuario /></ProtectedRoute>
        },
        {
          path: '/usuarios/editar/:id',
          element: <ProtectedRoute><EditUsuario /></ProtectedRoute>
        },
        {
          path: '/usuarios/cambiar-password/:id',
          element: <ProtectedRoute><ChangePassword /></ProtectedRoute>
        },
        {
          path: '/login',
          element: <Login />
        },
        {
          path: '/register',
          element: <Register />
        },
        {
          path: '/logout',
          element: <ProtectedRoute><Logout /></ProtectedRoute>
        }
      ]
    }
  ]
)

createRoot(document.getElementById("root")).render(
  <StrictMode> 
    <AuthProvider>
      <RouterProvider router={rutas} /> 
    </AuthProvider>
  </StrictMode>, 
);
