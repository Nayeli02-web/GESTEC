import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { createBrowserRouter } from "react-router-dom";
import { Home } from "./components/Home/Home";
import { RouterProvider } from "react-router";
import HeaderAlt from "./components/Layout/HeaderAlt";
import FooterAlt from "./components/Layout/FooterAlt";
import HomeTec from "./components/Home/HomeTec";

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
          path: '/home-tecnico',
          element: (
            <>
              <HeaderAlt />
              <HomeTec />
              <FooterAlt />
            </>
          )
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
