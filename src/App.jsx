import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { LandingPage } from './pages/LandingPage';
import { AdminPage } from './pages/AdminPage';

const routerFuture = {
  v7_startTransition: true,
  v7_relativeSplatPath: true,
};

export function App() {
  return (
    <BrowserRouter future={routerFuture}>
      <Routes>
        <Route path="/" element={<LandingPage source="business" />} />
        <Route path="/students" element={<LandingPage source="students" />} />
        <Route path="/freelancers" element={<LandingPage source="freelancers" />} />
        <Route path="/admin" element={<AdminPage />} />
      </Routes>
    </BrowserRouter>
  );
}
