
  import { createRoot } from "react-dom/client";
  import App from "./App.tsx";
  import "./index.css";

  // Recuperar redirecionamento salvo
const redirect = sessionStorage.getItem('redirect');
if (redirect) {
  // Limpa para não causar loops ou reuso indesejado
  sessionStorage.removeItem('redirect');
  // Substitui a URL atual pela rota que o usuário queria originalmente
  window.history.replaceState(null, '', redirect);
}

  createRoot(document.getElementById("root")!).render(<App />);
  