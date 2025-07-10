import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Play, Calendar, Search, Filter, Building2 } from 'lucide-react';

interface Anime {
  id: number;
  title: string;
  description: string;
  genre: string;
  status: string;
  release_year: number;
  cover_image_url: string;
  studio: string;
  tags: string;
  created_at: string;
}

export function AnimeLibraryPage() {
  const [anime, setAnime] = useState<Anime[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [genreFilter, setGenreFilter] = useState('all');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchAnime();
  }, []);

  const fetchAnime = async () => {
    try {
      const response = await fetch('/api/anime');
      const data = await response.json();
      setAnime(data);
    } catch (error) {
      console.error('Error fetching anime:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredAnime = anime.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.genre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.studio?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.tags?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || item.status === statusFilter;
    const matchesGenre = genreFilter === 'all' || item.genre?.toLowerCase().includes(genreFilter.toLowerCase());
    
    return matchesSearch && matchesStatus && matchesGenre;
  });

  const uniqueGenres = [...new Set(anime.map(item => item.genre).filter(Boolean))];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="text-white">Loading anime library...</div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold text-white">Anime Library</h1>
        <p className="text-gray-300">Discover and watch your favorite anime series</p>
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Search anime, genre, studio, or tags..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-black/60 border-purple-500/30 text-white placeholder-gray-500"
          />
        </div>
        
        <div className="flex items-center space-x-2">
          <Filter className="w-4 h-4 text-gray-400" />
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-40 bg-black/60 border-purple-500/30 text-white">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent className="bg-black border-purple-500/30">
              <SelectItem value="all" className="text-white">All Status</SelectItem>
              <SelectItem value="ongoing" className="text-white">Ongoing</SelectItem>
              <SelectItem value="completed" className="text-white">Completed</SelectItem>
              <SelectItem value="upcoming" className="text-white">Upcoming</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={genreFilter} onValueChange={setGenreFilter}>
            <SelectTrigger className="w-40 bg-black/60 border-purple-500/30 text-white">
              <SelectValue placeholder="Genre" />
            </SelectTrigger>
            <SelectContent className="bg-black border-purple-500/30">
              <SelectItem value="all" className="text-white">All Genres</SelectItem>
              {uniqueGenres.map((genre) => (
                <SelectItem key={genre} value={genre} className="text-white">
                  {genre}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {filteredAnime.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-gray-400">No anime found matching your criteria.</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredAnime.map((item) => (
            <Card key={item.id} className="bg-black/40 border-purple-500/20 hover:border-purple-500/40 transition-all duration-300 group hover:scale-105">
              <CardHeader className="pb-3">
                <div className="aspect-[3/4] bg-gradient-to-br from-purple-900 to-black rounded-lg flex items-center justify-center mb-3 overflow-hidden">
                  {item.cover_image_url ? (
                    <img 
                      src={item.cover_image_url} 
                      alt={item.title}
                      className="w-full h-full object-cover rounded-lg transition-transform duration-300 group-hover:scale-110"
                    />
                  ) : (
                    <Play className="w-12 h-12 text-purple-400" />
                  )}
                </div>
                <CardTitle className="text-white text-lg line-clamp-2">{item.title}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <Badge variant="secondary" className="bg-purple-600/20 text-purple-300">
                    {item.status}
                  </Badge>
                  {item.release_year && (
                    <div className="flex items-center text-gray-400 text-sm">
                      <Calendar className="w-3 h-3 mr-1" />
                      {item.release_year}
                    </div>
                  )}
                </div>
                
                {item.genre && (
                  <div className="flex items-center text-gray-400 text-sm">
                    <span className="bg-gray-700/50 px-2 py-1 rounded text-xs">{item.genre}</span>
                  </div>
                )}
                
                {item.studio && (
                  <div className="flex items-center text-gray-400 text-sm">
                    <Building2 className="w-3 h-3 mr-1" />
                    <span className="truncate">{item.studio}</span>
                  </div>
                )}
                
                {item.description && (
                  <p className="text-sm text-gray-300 line-clamp-3">{item.description}</p>
                )}
                
                {item.tags && (
                  <div className="flex flex-wrap gap-1">
                    {item.tags.split(',').slice(0, 3).map((tag, index) => (
                      <span key={index} className="text-xs bg-purple-600/20 text-purple-300 px-2 py-1 rounded">
                        {tag.trim()}
                      </span>
                    ))}
                  </div>
                )}
                
                <Link to={`/anime/${item.id}`}>
                  <Button className="w-full bg-purple-600 hover:bg-purple-700 group-hover:bg-purple-500 transition-colors">
                    <Play className="w-4 h-4 mr-2" />
                    View Details
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
