import AppRoutes from "./app/routes";
import { Toaster } from "react-hot-toast";

export default function App() {
  return (
    <>
      <AppRoutes />
      <Toaster />
    </>
  );
}
