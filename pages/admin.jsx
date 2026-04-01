import AdminPanel from '../src/components/AdminPanel';

export default function AdminPage() {
  return <AdminPanel onClose={() => window.location.href = '/'} />;
}
