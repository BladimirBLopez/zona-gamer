import { redirect } from 'next/navigation';
import { hasAdminSession } from '../../lib/admin-auth';
import AdminPanel from '../../components/admin/AdminPanel';
import AdminLogoutButton from '../../components/admin/AdminLogoutButton';

export const dynamic = 'force-dynamic';

export default async function AdminPage() {
  const authenticated = await hasAdminSession();

  if (!authenticated) {
    redirect('/admin/login');
  }

  return (
    <>
      <div className="bg-bg border-b border-white/10 px-4 py-3 text-gray-100">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3">
          <span className="text-xs text-gray-400">
            Zona Gamer · Administrador
          </span>
          <AdminLogoutButton />
        </div>
      </div>
      <AdminPanel />
    </>
  );
}
