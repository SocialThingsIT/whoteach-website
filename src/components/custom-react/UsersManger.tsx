import { useState, useEffect } from 'react';
import { collection, getDocs, doc, updateDoc } from 'firebase/firestore';
import { auth, db } from '~/firebase-config';
import { DASHBOARD_ROLES, type DashboardRole } from '~/config/roles';
import toast, { Toaster } from 'react-hot-toast';

type User = {
  id: string;
  email: string;
  role: DashboardRole;
};

export default function UsersManager() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUsers();
  }, []);

  async function loadUsers() {
    setLoading(true);
    const snap = await getDocs(collection(db, 'users'));
    const data = snap.docs.map((d) => ({ id: d.id, ...d.data() }) as User);
    setUsers(data);
    setLoading(false);
  }

  async function changeRole(userId: string, newRole: DashboardRole) {
    setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u)));

    try {
      await updateDoc(doc(db, 'users', userId), { role: newRole });

      toast.success('Ruolo aggiornato con successo');

      if (auth.currentUser?.uid === userId) {
        setTimeout(() => {
          toast.loading('Il tuo ruolo è stato modificato. Ricaricamento...', { duration: 1500 });
          window.location.reload();
        }, 1500);
      }
    } catch (error) {
      toast.error(`Errore durante l'aggiornamento: ${(error as Error).message}`);
    }
  }

  if (loading) return <p className="py-10 text-center">Caricamento utenti...</p>;

  return (
    <div className="overflow-x-auto">
      <Toaster position="top-right" />

      <table className="w-full text-sm">
        <thead>
          <tr className="border-b text-left">
            <th className="py-2">Email</th>
            <th className="py-2 text-right">Azioni</th>
          </tr>
        </thead>
        <tbody>
          {users.map((u) => (
            <tr key={u.id} className="border-b">
              <td className="py-2">{u.email}</td>
              <td className="py-2 text-right">
                <select
                  value={u.role}
                  onChange={(e) => changeRole(u.id, e.target.value as DashboardRole)}
                  className="rounded border px-2 py-1 text-xs dark:bg-slate-800"
                >
                  {DASHBOARD_ROLES.map((role) => (
                    <option key={role} value={role}>
                      {role}
                    </option>
                  ))}
                </select>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
