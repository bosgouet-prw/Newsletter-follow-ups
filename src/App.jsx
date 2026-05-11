import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, Link } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Dashboard from './pages/Dashboard';
import SubscriberDetail from './pages/SubscriberDetail';
import SubscribersList from './pages/SubscribersList';
import TemplatesManager from './pages/TemplatesManager';
import ImportManager from './pages/ImportManager';

const Login = () => <div className="p-8"><h2>Login Screen</h2><p>Please connect Supabase to login.</p></div>;

const ProtectedRoute = ({ children }) => {
  const { user } = useAuth();
  const isPlaceholder = import.meta.env.VITE_SUPABASE_URL === undefined;
  
  if (!user && !isPlaceholder) {
    return <Navigate to="/login" />;
  }
  return children;
};

const Layout = ({ children }) => {
  const { user, signOut } = useAuth();
  return (
    <div className="app-layout">
      <aside className="sidebar">
        <h2 className="sidebar-title">
          Retreat Manager
        </h2>
        <nav className="sidebar-nav">
          <Link to="/">Dashboard</Link>
          <Link to="/subscribers">Subscribers</Link>
          <Link to="/templates">Templates</Link>
          <Link to="/import">Database & Import</Link>
        </nav>
        {user && (
          <button onClick={signOut} className="sidebar-footer">
            Sign Out
          </button>
        )}
      </aside>
      <main className="main-content">
        {children}
      </main>
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/*" element={
            <ProtectedRoute>
              <Layout>
                <Routes>
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/subscribers" element={<SubscribersList />} />
                  <Route path="/subscribers/:id" element={<SubscriberDetail />} />
                  <Route path="/templates" element={<TemplatesManager />} />
                  <Route path="/import" element={<ImportManager />} />
                </Routes>
              </Layout>
            </ProtectedRoute>
          } />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
