import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { List, Heart } from 'lucide-react';

export function MyListPage() {
  const { user } = useAuth();

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="text-white">Please log in to view your list.</div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold text-white">My List</h1>
        <p className="text-gray-300">Your favorite and watchlisted anime</p>
      </div>

      <Card className="bg-black/40 border-purple-500/20">
        <CardHeader>
          <CardTitle className="text-white flex items-center">
            <Heart className="w-5 h-5 mr-2 text-purple-400" />
            Coming Soon
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-16">
            <List className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-400 text-lg">Watchlist feature coming soon!</p>
            <p className="text-gray-500 text-sm mt-2">
              Soon you'll be able to save your favorite anime and track your watching progress.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
