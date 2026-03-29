import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

export default async function SessionIndexPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/auth/signin?callbackUrl=/booking');
  }

  const role = session.user.role;
  if (role === 'CLIENT') redirect('/client-dashboard');
  if (role === 'TRAINEE') redirect('/trainee-dashboard');
  if (role === 'SUPERVISOR') redirect('/supervisor-dashboard');
  if (role === 'ADMIN') redirect('/admin/sessions');

  redirect('/booking');
}
