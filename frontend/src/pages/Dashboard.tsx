import React, { useEffect, useState } from 'react';
import { DashboardStats, DocumentEntry } from '../types';
import { getDashboardStats, getDocuments } from '../services/api';

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [documents, setDocuments] = useState<DocumentEntry[]>([]);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const [statsRes, docsRes] = await Promise.all([
          getDashboardStats(),
          getDocuments(),
        ]);

        setStats(statsRes);
        setDocuments(docsRes);
      } catch (err) {
        console.error('Failed to fetch dashboard data', err);
      }
    };

    fetchDashboard();
  }, []);

  return (
    <div className="max-w-7xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-4">System Dashboard</h2>

      {stats && (
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow p-4">
            <h3 className="text-lg font-medium">Total Documents</h3>
            <p className="text-2xl font-bold text-blue-600">{stats.total_documents}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <h3 className="text-lg font-medium">Completed</h3>
            <p className="text-2xl font-bold text-green-600">{stats.completed}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <h3 className="text-lg font-medium">Errors</h3>
            <p className="text-2xl font-bold text-red-600">{stats.errors}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <h3 className="text-lg font-medium">Avg. Processing Time</h3>
            <p className="text-2xl font-bold">{stats.average_processing_time}s</p>
          </div>
        </div>
      )}

      <h3 className="text-xl font-bold mb-2">Recent Documents</h3>
      <div className="bg-white shadow rounded-lg">
        <table className="w-full table-auto text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="text-left p-2">ID</th>
              <th className="text-left p-2">File</th>
              <th className="text-left p-2">Status</th>
              <th className="text-left p-2">Completed</th>
            </tr>
          </thead>
          <tbody>
            {documents.map((doc) => (
              <tr key={doc.document_id} className="border-t">
                <td className="p-2 text-xs text-gray-500">{doc.document_id.slice(0, 8)}...</td>
                <td className="p-2">{doc.filename ?? '—'}</td>
                <td className="p-2 capitalize">{doc.status}</td>
                <td className="p-2">{doc.completed_at ? new Date(doc.completed_at).toLocaleString() : '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Dashboard;
