import { HashRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import Layout from './components/layout/Layout';
import Home from './pages/Home';
import Explore from './pages/Explore';
import Article from './pages/Article';
import Write from './pages/Write';
import Profile from './pages/Profile';
import Community from './pages/Community';
import Bookmarks from './pages/Bookmarks';
import Settings from './pages/Settings';
import Auth from './pages/Auth';
import Admin from './pages/Admin';
import About from './pages/About';
import Guidelines from './pages/Guidelines';
import NotFound from './pages/NotFound';

export default function App() {
  return (
    <HashRouter>
      <AuthProvider>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<Home />} />
            <Route path="/explore" element={<Explore />} />
            <Route path="/article/:slug" element={<Article />} />
            <Route path="/write" element={<Write />} />
            <Route path="/profile/:username" element={<Profile />} />
            <Route path="/community" element={<Community />} />
            <Route path="/bookmarks" element={<Bookmarks />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/auth/callback" element={<Auth />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="/about" element={<About />} />
            <Route path="/guidelines" element={<Guidelines />} />
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      </AuthProvider>
    </HashRouter>
  );
}
