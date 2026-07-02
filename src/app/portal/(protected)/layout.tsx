import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import PortalClientShell from './PortalClientShell'

export default async function PortalProtectedLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions)
  const userType = (session?.user as { userType?: string })?.userType

  if (!session || userType !== 'portal') redirect('/portal/login')

  return <PortalClientShell>{children}</PortalClientShell>
}
