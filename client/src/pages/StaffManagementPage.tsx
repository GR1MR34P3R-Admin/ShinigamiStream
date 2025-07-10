import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Shield, Users, Edit } from 'lucide-react';

interface User {
  id: number;
  username: string;
  email: string;
  role: 'admin' | 'staff' | 'user';
  created_at: string;
}

export function StaffManagementPage() {
  const { user, token } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingUser, setEditingUser] = useState<number | null>(null);

  useEffect(() => {
    if (user?.role === 'admin') {
      fetchUsers();
    }
  }, [user]);

  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/users', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setUsers(data);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateUserRole = async (userId: number, newRole: string) => {
    try {
      const response = await fetch(`/api/users/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ role: newRole })
      });

      if (response.ok) {
        setUsers(prev => prev.map(u => 
          u.id === userId ? { ...u, role: newRole as 'admin' | 'staff' | 'user' } : u
        ));
        setEditingUser(null);
      }
    } catch (error) {
      console.error('Error updating user role:', error);
    }
  };

  if (!user || user.role !== 'admin') {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="text-center space-y-4">
          <Shield className="w-16 h-16 text-red-400 mx-auto" />
          <h2 className="text-2xl font-bold text-white">Access Denied</h2>
          <p className="text-gray-300">You don't have permission to access this page.</p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="text-white">Loading users...</div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold text-white">Staff Management</h1>
        <p className="text-gray-300">Manage user roles and permissions</p>
      </div>

      <div className="grid gap-4">
        {users.map((userItem) => (
          <Card key={userItem.id} className="bg-black/40 border-purple-500/20">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-white">{userItem.username}</CardTitle>
                  <p className="text-gray-400 text-sm">{userItem.email}</p>
                  <p className="text-gray-500 text-xs">
                    Joined: {new Date(userItem.created_at).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  {editingUser === userItem.id ? (
                    <div className="flex items-center space-x-2">
                      <Select
                        value={userItem.role}
                        onValueChange={(value) => updateUserRole(userItem.id, value)}
                      >
                        <SelectTrigger className="w-32 bg-black/60 border-purple-500/30 text-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-black border-purple-500/30">
                          <SelectItem value="user" className="text-white">User</SelectItem>
                          <SelectItem value="staff" className="text-white">Staff</SelectItem>
                          <SelectItem value="admin" className="text-white">Admin</SelectItem>
                        </SelectContent>
                      </Select>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setEditingUser(null)}
                        className="border-purple-500/30 text-purple-300"
                      >
                        Cancel
                      </Button>
                    </div>
                  ) : (
                    <>
                      <Badge variant="secondary" className={`${
                        userItem.role === 'admin' ? 'bg-red-600/20 text-red-300' :
                        userItem.role === 'staff' ? 'bg-blue-600/20 text-blue-300' :
                        'bg-green-600/20 text-green-300'
                      }`}>
                        {userItem.role}
                      </Badge>
                      {userItem.id !== user.id && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setEditingUser(userItem.id)}
                          className="border-purple-500/30 text-purple-300"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                      )}
                    </>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center space-x-2 text-sm text-gray-400">
                  <Users className="w-4 h-4" />
                  <span>
                    {userItem.role === 'admin' ? 'Full system access' :
                     userItem.role === 'staff' ? 'Can manage anime and episodes' :
                     'Can stream and download anime'}
                  </span>
                </div>
                {userItem.id === user.id && (
                  <p className="text-yellow-400 text-sm">This is your account</p>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {users.length === 0 && (
        <div className="text-center py-16">
          <p className="text-gray-400">No users found.</p>
        </div>
      )}
    </div>
  );
}
