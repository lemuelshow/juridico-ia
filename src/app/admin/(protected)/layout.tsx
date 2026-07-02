import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import AdminClientShell from './AdminClientShell'

export default async function ProtectedAdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions)
  const userType = (session?.user as { userType?: string })?.userType
  if (!session || userType !== 'admin') redirect('/admin/login')

  return <AdminClientShell>{children}</AdminClientShell>
}
