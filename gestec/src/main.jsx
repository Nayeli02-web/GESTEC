import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { createBrowserRouter } from "react-router-dom";
import { Home } from "./components/Home/Home";
import { RouterProvider } from "react-router";
import ListTecnicos from "./components/Home/ListTecnicos";
import DetailTecnico from "./components/Home/DetailTecnico";
import ListCategorias from "./components/Categoria/ListCategorias";
import DetailCategoria from "./components/Categoria/DetailCategoria";
import ListTickets from "./components/Ticket/ListTickets";
import DetailTicket from "./components/Ticket/DetailTicket";
import AsignacionesTecnico from "./components/Asignaciones/AsignacionesTecnico";

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
          path: '/tecnico/:id',
          element: <DetailTecnico />
        },
        {
          path: '/categorias',
          element: <ListCategorias />
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
          path: '/ticket/:id',
          element: <DetailTicket />
        },
        {
          path: '/asignaciones',
          element: <AsignacionesTecnico />
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
