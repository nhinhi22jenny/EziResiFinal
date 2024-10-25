// import { useState } from "react";

import { BrowserRouter } from "react-router-dom";
import { ThemeProvider } from "./ThemeContext";
import AppRoutes from "./AppRoutes";
import axios from "axios";
import { Toaster } from "@/components/ui/toaster";

function App() {

  // Replace the base URL with your own
  axios.defaults.baseURL = "http://127.0.0.1:5000";
  return (
    <>
      <BrowserRouter>
        <ThemeProvider>
          <AppRoutes />
          <Toaster />
        </ThemeProvider>
      </BrowserRouter>
    </>
  );
}

export default App;
