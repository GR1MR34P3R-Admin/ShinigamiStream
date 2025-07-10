import { useAuth } from '@/contexts/AuthContext';
import { AnimeManagement } from '@/components/admin/AnimeManagement';
import { EpisodeManagement } from '@/components/admin/EpisodeManagement';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Link } from 'react-router-dom';
import { Shield, Play, Users, Settings, Upload } from 'lucide-react';

export function AdminDashboardPage() {
  const { user } = useAuth();

  if (!user || (user.role !== 'admin' && user.role !== 'staff')) {
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

  return (
    <div className="space-y-8">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold text-white">Admin Dashboard</h1>
        <p className="text-gray-300">Manage anime content and episodes</p>
      </div>

      {/* Quick Actions for Admin */}
      {user.role === 'admin' && (
        <div className="grid md:grid-cols-2 gap-4 mb-8">
          <Card className="bg-black/40 border-purple-500/20">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <Settings className="w-5 h-5 mr-2 text-purple-400" />
                Site Management
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Link to="/admin/settings">
                <Button className="w-full bg-purple-600 hover:bg-purple-700">
                  <Settings className="w-4 h-4 mr-2" />
                  Site Settings
                </Button>
              </Link>
              <Link to="/admin/staff">
                <Button variant="outline" className="w-full border-purple-500 text-purple-300">
                  <Users className="w-4 h-4 mr-2" />
                  Manage Staff
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="bg-black/40 border-purple-500/20">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <Upload className="w-5 h-5 mr-2 text-purple-400" />
                Content Management
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-300 text-sm">
                Use the tabs below to manage anime series and episodes. You can add, edit, and delete content.
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      <Tabs defaultValue="anime" className="w-full">
        <TabsList className="grid w-full grid-cols-2 bg-black/40 border-purple-500/20">
          <TabsTrigger value="anime" className="data-[state=active]:bg-purple-600 data-[state=active]:text-white">
            <Play className="w-4 h-4 mr-2" />
            Anime Management
          </TabsTrigger>
          <TabsTrigger value="episodes" className="data-[state=active]:bg-purple-600 data-[state=active]:text-white">
            <Settings className="w-4 h-4 mr-2" />
            Episode Management
          </TabsTrigger>
        </TabsList>

        <TabsContent value="anime" className="space-y-6">
          <AnimeManagement />
        </TabsContent>

        <TabsContent value="episodes" className="space-y-6">
          <EpisodeManagement />
        </TabsContent>
      </Tabs>
    </div>
  );
}
