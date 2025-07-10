import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { Plus, Users, Play, Shield, Settings } from 'lucide-react';

export function DashboardPage() {
  const { user } = useAuth();

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="text-white">Please log in to access the dashboard.</div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold text-white">Dashboard</h1>
        <p className="text-gray-300">Welcome back, {user.username}!</p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* User Role Card */}
        <Card className="bg-black/40 border-purple-500/20">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <Shield className="w-5 h-5 mr-2 text-purple-400" />
              Your Role
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center space-y-2">
              <div className={`inline-block px-4 py-2 rounded-full text-sm font-medium ${
                user.role === 'admin' ? 'bg-red-600 text-white' :
                user.role === 'staff' ? 'bg-blue-600 text-white' :
                'bg-green-600 text-white'
              }`}>
                {user.role.toUpperCase()}
              </div>
              <p className="text-gray-400 text-sm">
                {user.role === 'admin' ? 'Full system access' :
                 user.role === 'staff' ? 'Content management' :
                 'Stream and download anime'}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Admin/Staff Features */}
        {(user.role === 'admin' || user.role === 'staff') && (
          <Card className="bg-black/40 border-purple-500/20">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <Plus className="w-5 h-5 mr-2 text-purple-400" />
                Content Management
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Link to="/admin">
                <Button className="w-full bg-purple-600 hover:bg-purple-700">
                  <Settings className="w-4 h-4 mr-2" />
                  Admin Dashboard
                </Button>
              </Link>
              <p className="text-gray-400 text-sm">
                Manage anime content, upload episodes, and more
              </p>
            </CardContent>
          </Card>
        )}

        {/* Admin Only Features */}
        {user.role === 'admin' && (
          <Card className="bg-black/40 border-purple-500/20">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <Users className="w-5 h-5 mr-2 text-purple-400" />
                User Management
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button className="w-full bg-red-600 hover:bg-red-700">
                <Users className="w-4 h-4 mr-2" />
                Manage Users
              </Button>
              <Button variant="outline" className="w-full border-red-500 text-red-300">
                System Settings
              </Button>
            </CardContent>
          </Card>
        )}

        {/* General Features */}
        <Card className="bg-black/40 border-purple-500/20">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <Play className="w-5 h-5 mr-2 text-purple-400" />
              Quick Actions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Link to="/anime">
              <Button className="w-full bg-purple-600 hover:bg-purple-700">
                <Play className="w-4 h-4 mr-2" />
                Browse Anime
              </Button>
            </Link>
            <Button variant="outline" className="w-full border-purple-500 text-purple-300">
              My Watchlist
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card className="bg-black/40 border-purple-500/20">
        <CardHeader>
          <CardTitle className="text-white">Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-gray-400">No recent activity to display.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
