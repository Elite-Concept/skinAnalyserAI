import React, { useState, useEffect } from 'react';
import { Edit2, MoreVertical, Check, X } from 'lucide-react';
import { collection, query, where, getDocs, updateDoc, doc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import LoadingSpinner from '../LoadingSpinner';

interface User {
  id: string;
  name: string;
  email: string;
  status: 'active' | 'inactive';
  plan: 'free' | 'basic' | 'premium';
  registeredAt: Date;
}

interface UserTableProps {
  searchTerm: string;
  statusFilter: string;
  planFilter: string;
}

export default function UserTable({ searchTerm, statusFilter, planFilter }: UserTableProps) {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingUser, setEditingUser] = useState<string | null>(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const usersRef = collection(db, 'users');
        let q = query(usersRef);

        if (statusFilter !== 'all') {
          q = query(q, where('status', '==', statusFilter));
        }
        if (planFilter !== 'all') {
          q = query(q, where('plan', '==', planFilter));
        }

        const querySnapshot = await getDocs(q);
        const fetchedUsers = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          registeredAt: doc.data().registeredAt?.toDate()
        })) as User[];

        // Apply search filter
        const filteredUsers = fetchedUsers.filter(user =>
          user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.email.toLowerCase().includes(searchTerm.toLowerCase())
        );

        setUsers(filteredUsers);
        setError(null);
      } catch (err) {
        console.error('Error fetching users:', err);
        setError('Failed to load users');
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [searchTerm, statusFilter, planFilter]);

  const handleStatusChange = async (userId: string, newStatus: 'active' | 'inactive') => {
    try {
      await updateDoc(doc(db, 'users', userId), {
        status: newStatus
      });
      setUsers(users.map(user =>
        user.id === userId ? { ...user, status: newStatus } : user
      ));
    } catch (err) {
      console.error('Error updating user status:', err);
      // Show error notification
    }
  };

  const handlePlanChange = async (userId: string, newPlan: 'free' | 'basic' | 'premium') => {
    try {
      await updateDoc(doc(db, 'users', userId), {
        plan: newPlan
      });
      setUsers(users.map(user =>
        user.id === userId ? { ...user, plan: newPlan } : user
      ));
    } catch (err) {
      console.error('Error updating user plan:', err);
      // Show error notification
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return (
      <div className="p-4 text-red-600 bg-red-50 rounded-lg">
        {error}
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              User
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Status
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Plan
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Registered
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {users.map((user) => (
            <tr key={user.id}>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center">
                  <div>
                    <div className="text-sm font-medium text-gray-900">{user.name}</div>
                    <div className="text-sm text-gray-500">{user.email}</div>
                  </div>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                {editingUser === user.id ? (
                  <select
                    value={user.status}
                    onChange={(e) => handleStatusChange(user.id, e.target.value as 'active' | 'inactive')}
                    className="border border-gray-300 rounded-md text-sm"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                ) : (
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    user.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {user.status}
                  </span>
                )}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                {editingUser === user.id ? (
                  <select
                    value={user.plan}
                    onChange={(e) => handlePlanChange(user.id, e.target.value as 'free' | 'basic' | 'premium')}
                    className="border border-gray-300 rounded-md text-sm"
                  >
                    <option value="free">Free</option>
                    <option value="basic">Basic</option>
                    <option value="premium">Premium</option>
                  </select>
                ) : (
                  <span className="text-sm text-gray-900">{user.plan}</span>
                )}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {user.registeredAt.toLocaleDateString()}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {editingUser === user.id ? (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setEditingUser(null)}
                      className="text-green-600 hover:text-green-900"
                    >
                      <Check className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => setEditingUser(null)}
                      className="text-red-600 hover:text-red-900"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setEditingUser(user.id)}
                    className="text-gray-600 hover:text-gray-900"
                  >
                    <Edit2 className="w-5 h-5" />
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}