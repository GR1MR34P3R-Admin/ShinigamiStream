import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Play, Download, Calendar, Building2, Tag, ArrowLeft } from 'lucide-react';

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
}

interface Episode {
  id: number;
  episode_number: number;
  title: string;
  description: string;
  video_url: string;
  download_url: string;
  duration: number;
  subtitle_type: string;
}

export function AnimeDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [anime, setAnime] = useState<Anime | null>(null);
  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetchAnime(parseInt(id));
      fetchEpisodes(parseInt(id));
    }
  }, [id]);

  const fetchAnime = async (animeId: number) => {
    try {
      const response = await fetch(`/api/anime/${animeId}`);
      const data = await response.json();
      setAnime(data);
    } catch (error) {
      console.error('Error fetching anime:', error);
    }
  };

  const fetchEpisodes = async (animeId: number) => {
    try {
      const response = await fetch(`/api/anime/${animeId}/episodes`);
      const data = await response.json();
      setEpisodes(data);
    } catch (error) {
      console.error('Error fetching episodes:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleWatch = (videoUrl: string) => {
    window.open(videoUrl, '_blank');
  };

  const handleDownload = (downloadUrl: string, episodeTitle: string) => {
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = `${anime?.title} - ${episodeTitle}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="text-white">Loading anime details...</div>
      </div>
    );
  }

  if (!anime) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="text-center space-y-4">
          <h2 className="text-2xl font-bold text-white">Anime Not Found</h2>
          <p className="text-gray-300">The anime you're looking for doesn't exist.</p>
          <Link to="/anime">
            <Button className="bg-purple-600 hover:bg-purple-700">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Library
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center space-x-4">
        <Link to="/anime">
          <Button variant="outline" className="border-purple-500/30 text-purple-300">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Library
          </Button>
        </Link>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1">
          <Card className="bg-black/40 border-purple-500/20">
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="aspect-[3/4] bg-gradient-to-br from-purple-900 to-black rounded-lg flex items-center justify-center">
                  {anime.cover_image_url ? (
                    <img 
                      src={anime.cover_image_url} 
                      alt={anime.title}
                      className="w-full h-full object-cover rounded-lg"
                    />
                  ) : (
                    <Play className="w-16 h-16 text-purple-400" />
                  )}
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Badge variant="secondary" className="bg-purple-600/20 text-purple-300">
                      {anime.status}
                    </Badge>
                    {anime.genre && (
                      <Badge variant="outline" className="border-purple-500/30 text-purple-300">
                        {anime.genre}
                      </Badge>
                    )}
                  </div>
                  
                  {anime.release_year && (
                    <div className="flex items-center text-gray-400 text-sm">
                      <Calendar className="w-4 h-4 mr-2" />
                      {anime.release_year}
                    </div>
                  )}
                  
                  {anime.studio && (
                    <div className="flex items-center text-gray-400 text-sm">
                      <Building2 className="w-4 h-4 mr-2" />
                      {anime.studio}
                    </div>
                  )}
                  
                  {anime.tags && (
                    <div className="flex items-start text-gray-400 text-sm">
                      <Tag className="w-4 h-4 mr-2 mt-0.5" />
                      <span>{anime.tags}</span>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-2 space-y-6">
          <Card className="bg-black/40 border-purple-500/20">
            <CardHeader>
              <CardTitle className="text-white text-3xl">{anime.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-300 leading-relaxed">
                {anime.description || 'No description available.'}
              </p>
            </CardContent>
          </Card>

          <Card className="bg-black/40 border-purple-500/20">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <Play className="w-5 h-5 mr-2" />
                Episodes ({episodes.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {episodes.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-400">No episodes available yet.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {episodes.map((episode) => (
                    <Card key={episode.id} className="bg-black/20 border-purple-500/10 hover:border-purple-500/30 transition-colors">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-2">
                              <h3 className="text-white font-medium">
                                Episode {episode.episode_number}: {episode.title}
                              </h3>
                              <Badge variant="secondary" className="bg-purple-600/20 text-purple-300 text-xs">
                                {episode.subtitle_type}
                              </Badge>
                            </div>
                            {episode.description && (
                              <p className="text-gray-400 text-sm mb-2">{episode.description}</p>
                            )}
                            {episode.duration && (
                              <p className="text-gray-500 text-xs">{episode.duration} minutes</p>
                            )}
                          </div>
                          <div className="flex items-center space-x-2">
                            {episode.video_url && (
                              <Button 
                                size="sm" 
                                className="bg-purple-600 hover:bg-purple-700"
                                onClick={() => handleWatch(episode.video_url)}
                              >
                                <Play className="w-4 h-4 mr-1" />
                                Watch
                              </Button>
                            )}
                            {episode.download_url && (
                              <Button 
                                size="sm" 
                                variant="outline" 
                                className="border-purple-500/30 text-purple-300"
                                onClick={() => handleDownload(episode.download_url, episode.title)}
                              >
                                <Download className="w-4 h-4 mr-1" />
                                Download
                              </Button>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
