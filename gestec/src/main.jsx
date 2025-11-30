import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import "./i18n"; 
import App from "./App.jsx";
import { createBrowserRouter } from "react-router-dom";
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
import AutoTriage from "./components/AutoTriage/AutoTriage";
import AsignacionManual from "./components/AutoTriage/AsignacionManual";
import Notificaciones from "./components/Notificaciones/Notificaciones";

const rutas=createBrowserRouter(
  [
    {
      element: <App />,
      children:[
        {
          path:'/',
          element: <Home />
        },
        {
          path: '/tecnicos',
          element: <ListTecnicos />
        },
        {
          path: '/tecnico/crear',
          element: <CreateTecnico />
        },
        {
          path: '/tecnico/:id/editar',
          element: <EditTecnico />
        },
        {
          path: '/tecnico/:id',
          element: <DetailTecnico />
        },
        {
          path: '/categorias',
          element: <ListCategorias />
        },
        {
          path: '/categoria/crear',
          element: <CreateCategoria />
        },
        {
          path: '/categoria/:id/editar',
          element: <EditCategoria />
        },
        {
          path: '/categoria/:id',
          element: <DetailCategoria />
        },
        {
          path: '/tickets',
          element: <ListTickets />
        },
        {
          path: '/ticket/crear',
          element: <CreateTicket />
        },
        {
          path: '/ticket/:id',
          element: <DetailTicket />
        },
        {
          path: '/asignaciones',
          element: <AsignacionesTecnico />
        },
        {
          path: '/autotriage',
          element: <AutoTriage />
        },
        {
          path: '/asignacion-manual',
          element: <AsignacionManual />
        },
        {
          path: '/notificaciones',
          element: <Notificaciones />
        }
      ]
    }
  ]
)

createRoot(document.getElementById("root")).render(
  <StrictMode> 
  <RouterProvider router={rutas} /> 
</StrictMode>, 
);
