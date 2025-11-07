import { useState, useEffect } from 'react';
import { collection, getDocs, doc, updateDoc } from 'firebase/firestore';
import { db } from '~/firebase-config';

type User = {
  id: string;
  email: string;
  role: string;
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

  async function changeRole(userId: string, newRole: string) {
    await updateDoc(doc(db, 'users', userId), { role: newRole });
    loadUsers(); // ricarica lista
  }

  if (loading) return <p>Loading...</p>;

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b text-left">
            <th className="py-2">Email</th>
            <th>Ruolo</th>
            <th>Azioni</th>
          </tr>
        </thead>
        <tbody>
          {users.map((u) => (
            <tr key={u.id} className="border-b">
              <td className="py-2">{u.email}</td>
              <td>{u.role}</td>
              <td>
                <select
                  value={u.role}
                  onChange={(e) => changeRole(u.id, e.target.value)}
                  className="rounded border px-2 py-1 text-xs dark:bg-slate-800"
                >
                  <option value="viewer">Viewer</option>
                  <option value="editor">Editor</option>
                  <option value="manager">Manager</option>
                  <option value="admin">Admin</option>
                </select>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
