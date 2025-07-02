import { useEffect, useState } from 'react';
import axios from 'axios';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

export default function AdminDashboard() {
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState({ users: 0, transactions: 0, loans: 0 });
  const [loading, setLoading] = useState(true);
  const [chartData, setChartData] = useState([]);

  const token = localStorage.getItem('token');

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await axios.get('http://localhost:2000/api/v1/admin/stats', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setStats(res.data.stats);
        setChartData(res.data.chartData);
        setUser(res.data.user);
      } catch (err) {
        alert('Unauthorized or failed to fetch stats.');
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [token]);

  if (loading) return <div className="p-4 text-center">Loading...</div>;

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-4">Welcome, {user?.firstname || 'Admin'} 👋</h1>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <p className="text-gray-500">Total Users</p>
            <h2 className="text-xl font-bold">{stats.users}</h2>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <p className="text-gray-500">Transactions</p>
            <h2 className="text-xl font-bold">{stats.transactions}</h2>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <p className="text-gray-500">Loans Disbursed</p>
            <h2 className="text-xl font-bold">{stats.loans}</h2>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="p-4">
          <h3 className="text-lg font-semibold mb-2">Monthly Transactions</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <XAxis dataKey="month" stroke="#8884d8" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#6366f1" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
