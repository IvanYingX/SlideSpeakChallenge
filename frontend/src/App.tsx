import React from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import UploadView from './pages/UploadView';

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8 flex flex-row space-x-6">
            <Link to="/">
                <h1 className="text-lg font-semibold text-gray-900 hover:text-gray-700">
                  AI Presentation Analyzer
                </h1>
            </Link>
            <Link to="/dashboard">
              <h1 className="text-lg font-semibold text-gray-500 hover:text-gray-600">
                Dashboard
              </h1>
            </Link>
          </div>
        </header>

        <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <Routes>
            <Route path="/" element={<UploadView />} />
            <Route path="/dashboard" element={<Dashboard />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
};

export default App;
