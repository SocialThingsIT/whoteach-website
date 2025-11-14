import { useEffect, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '~/firebase-config';
import type { DashboardRole } from '~/config/roles';
import { hasRoleAccess } from '~/config/roles';

type Props = {
  children: React.ReactNode;
  requiredRole?: DashboardRole;
  redirectTo?: string;
};

export default function ProtectedRoute({ children, requiredRole = 'viewer', redirectTo }: Props) {
  const [authorized, setAuthorized] = useState<boolean | null>(null);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        setAuthorized(false);
        if (redirectTo) window.location.replace(redirectTo);
        return;
      }

      // Controlla il ruolo dell'utente
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      const userData = userDoc.data();
      const userRole = (userData?.role || 'viewer') as DashboardRole;

      const hasAccess = hasRoleAccess(userRole, requiredRole);

      setAuthorized(hasAccess);

      if (!hasAccess && redirectTo) {
        window.location.replace(redirectTo);
      }
    });

    return unsub;
  }, [requiredRole, redirectTo]);

  // if (authorized === null) {
  //   return <p className="py-10 text-center">Verifica permessi...</p>;
  // }

  // if (!authorized) {
  //   return <p className="py-10 text-center text-red-600">Accesso negato. Ruolo richiesto: {requiredRole}</p>;
  // }

  if (!authorized) return null;

  return <>{children}</>;
}
