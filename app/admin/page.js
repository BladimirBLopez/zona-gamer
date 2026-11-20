import { redirect } from 'next/navigation';
import { hasAdminSession } from '../../lib/admin-auth';
import AdminPanel from '../../components/admin/AdminPanel';

export const dynamic = 'force-dynamic';

export default async function AdminPage() {
  const authenticated = await hasAdminSession();

  if (!authenticated) {
    redirect('/admin/login');
  }

  return <AdminPanel />;
}
