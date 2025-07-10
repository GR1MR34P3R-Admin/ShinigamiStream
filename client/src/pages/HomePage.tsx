import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useSite } from '@/contexts/SiteContext';
import { Play, Download, Users, Shield } from 'lucide-react';

export function HomePage() {
  const { settings } = useSite();

  return (
    <div className="space-y-16">
      {/* Hero Section */}
      <section className="text-center space-y-8 py-16">
        <div className="space-y-4">
          {settings.hero_image ? (
            <div className="flex justify-center mb-8">
              <img 
                src={settings.hero_image} 
                alt="Hero"
                className="max-w-md max-h-64 object-contain rounded-lg shadow-2xl"
              />
            </div>
          ) : (
            <div className="flex items-center justify-center space-x-4">
              <div className="text-6xl font-bold text-purple-400">{settings.site_logo}</div>
              <h1 className="text-5xl md:text-7xl font-bold text-white">
                {settings.site_name}
              </h1>
            </div>
          )}
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Your ultimate destination for streaming and downloading anime. 
            Join the realm of the death gods and immerse yourself in endless entertainment.
          </p>
        </div>
        
        <div className="flex flex-col md:flex-row items-center justify-center space-y-4 md:space-y-0 md:space-x-4">
          <Link to="/anime">
            <Button size="lg" className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-3">
              <Play className="w-5 h-5 mr-2" />
              Explore Anime
            </Button>
          </Link>
          <Link to="/register">
            <Button size="lg" variant="outline" className="border-purple-500 text-purple-300 hover:bg-purple-900/20 px-8 py-3">
              Join Now
            </Button>
          </Link>
        </div>
      </section>

      {/* Features Section */}
      <section className="grid md:grid-cols-3 gap-8">
        <Card className="bg-black/40 border-purple-500/20 hover:border-purple-500/40 transition-colors">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <Play className="w-5 h-5 mr-2 text-purple-400" />
              Stream Anime
            </CardTitle>
            <CardDescription className="text-gray-300">
              Watch your favorite anime series with high-quality streaming
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-gray-400">
              Access thousands of anime episodes with crystal clear quality and smooth playback.
            </p>
          </CardContent>
        </Card>

        <Card className="bg-black/40 border-purple-500/20 hover:border-purple-500/40 transition-colors">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <Download className="w-5 h-5 mr-2 text-purple-400" />
              Download Episodes
            </CardTitle>
            <CardDescription className="text-gray-300">
              Download episodes for offline viewing anytime, anywhere
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-gray-400">
              Download your favorite episodes and watch them offline without any interruptions.
            </p>
          </CardContent>
        </Card>

        <Card className="bg-black/40 border-purple-500/20 hover:border-purple-500/40 transition-colors">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <Users className="w-5 h-5 mr-2 text-purple-400" />
              Community
            </CardTitle>
            <CardDescription className="text-gray-300">
              Join a community of anime enthusiasts and otakus
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-gray-400">
              Connect with fellow anime fans and discover new series together.
            </p>
          </CardContent>
        </Card>
      </section>

      {/* User Roles Section */}
      <section className="bg-black/20 rounded-lg p-8 space-y-6">
        <h2 className="text-3xl font-bold text-white text-center">User Roles</h2>
        
        <div className="grid md:grid-cols-3 gap-6">
          <div className="text-center space-y-2">
            <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mx-auto">
              <Users className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl font-semibold text-white">User</h3>
            <p className="text-gray-300 text-sm">
              Stream and download anime episodes
            </p>
          </div>
          
          <div className="text-center space-y-2">
            <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto">
              <Shield className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl font-semibold text-white">Staff</h3>
            <p className="text-gray-300 text-sm">
              Upload and manage anime content
            </p>
          </div>
          
          <div className="text-center space-y-2">
            <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center mx-auto">
              <Shield className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl font-semibold text-white">Admin</h3>
            <p className="text-gray-300 text-sm">
              Full system control and user management
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
