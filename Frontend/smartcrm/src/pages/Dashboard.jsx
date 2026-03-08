import AdminDashboard from '../Dashboards/AdminDashboard';
import ManagerDashboard from '../Dashboards/ManagerDashboard';
import SalesDashboard from '../Dashboards/SalesDashboard';

export default function Dashboard() {
  const user = JSON.parse(localStorage.getItem('user'));

  if (user?.role === 'admin') return <AdminDashboard />;
  if (user?.role === 'manager') return <ManagerDashboard />;
  return <SalesDashboard />;
}