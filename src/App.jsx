import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, Link } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Dashboard from './pages/Dashboard';
import SubscriberDetail from './pages/SubscriberDetail';
import SubscribersList from './pages/SubscribersList';
import TemplatesManager from './pages/TemplatesManager';

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
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <aside style={{ width: '250px', backgroundColor: 'var(--color-bg-card)', borderRight: '1px solid var(--color-border)', padding: '2rem', display: 'flex', flexDirection: 'column' }}>
        <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.25rem', marginBottom: '2rem' }}>
          Retreat Manager
        </h2>
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <Link to="/">Dashboard</Link>
          <Link to="/subscribers">Subscribers</Link>
          <Link to="/templates">Templates</Link>
        </nav>
        {user && (
          <button onClick={signOut} style={{ marginTop: 'auto', paddingTop: '2rem', color: 'var(--color-text-muted)', textAlign: 'left' }}>
            Sign Out
          </button>
        )}
      </aside>
      <main style={{ flex: 1, padding: '2rem', maxWidth: '1200px' }}>
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
