import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { FileUpload } from '@/components/ui/file-upload';
import { Plus, Edit, Trash2, Play, Download, Calendar, Building2, ArrowLeft, AlertTriangle } from 'lucide-react';

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
  anime_id: number;
  episode_number: number;
  title: string;
  description: string;
  video_url: string;
  download_url: string;
  duration: number;
  subtitle_type: string;
  created_at: string;
}

export function EpisodeManagement() {
  const { token } = useAuth();
  const [anime, setAnime] = useState<Anime[]>([]);
  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [selectedAnime, setSelectedAnime] = useState<Anime | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingEpisode, setEditingEpisode] = useState<Episode | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string>('');
  const [formData, setFormData] = useState({
    episode_number: 1,
    title: '',
    description: '',
    video_url: '',
    download_url: '',
    duration: 0,
    subtitle_type: 'subbed'
  });
  const [videoFile, setVideoFile] = useState<string>('');

  useEffect(() => {
    fetchAnime();
  }, []);

  useEffect(() => {
    if (selectedAnime) {
      fetchEpisodes(selectedAnime.id);
    }
  }, [selectedAnime]);

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

  const fetchEpisodes = async (animeId: number) => {
    try {
      const response = await fetch(`/api/anime/${animeId}/episodes`);
      const data = await response.json();
      setEpisodes(data);
    } catch (error) {
      console.error('Error fetching episodes:', error);
    }
  };

  const handleVideoUpload = async (file: File, onProgress?: (progress: number) => void): Promise<{ url: string; filename: string }> => {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      const uploadFormData = new FormData();
      uploadFormData.append('video', file);

      // Handle upload progress
      if (onProgress) {
        xhr.upload.addEventListener('progress', (event) => {
          if (event.lengthComputable) {
            const progress = Math.round((event.loaded / event.total) * 100);
            onProgress(progress);
          }
        });
      }

      // Handle successful completion
      xhr.addEventListener('load', () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            const response = JSON.parse(xhr.responseText);
            setVideoFile(response.url);
            setFormData(prev => ({ 
              ...prev, 
              video_url: response.url,
              download_url: response.url
            }));
            resolve(response);
          } catch (error) {
            reject(new Error('Invalid response from server'));
          }
        } else {
          try {
            const errorResponse = JSON.parse(xhr.responseText);
            reject(new Error(errorResponse.message || `Upload failed with status ${xhr.status}`));
          } catch {
            reject(new Error(`Upload failed with status ${xhr.status}`));
          }
        }
      });

      // Handle errors
      xhr.addEventListener('error', () => {
        reject(new Error('Network error occurred during upload'));
      });

      xhr.addEventListener('timeout', () => {
        reject(new Error('Upload timed out. File may be too large.'));
      });

      xhr.addEventListener('abort', () => {
        reject(new Error('Upload was cancelled'));
      });

      // Configure request - IMPORTANT: Open first, then set headers, then send
      xhr.open('POST', '/api/upload/episode-video');
      
      // Set timeout AFTER opening
      xhr.timeout = 15 * 60 * 1000; // 15 minutes timeout for large video files
      
      // Get token and set authorization header AFTER opening
      const authToken = localStorage.getItem('token');
      if (authToken) {
        xhr.setRequestHeader('Authorization', `Bearer ${authToken}`);
      }

      // Start upload
      xhr.send(uploadFormData);
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!selectedAnime || isSaving) {
      return;
    }

    // Validate required fields
    if (!formData.title.trim()) {
      setSaveError('Episode title is required');
      return;
    }

    if (!formData.episode_number || formData.episode_number < 1) {
      setSaveError('Episode number must be a positive number');
      return;
    }
    
    setIsSaving(true);
    setSaveError('');
    
    try {
      const url = editingEpisode ? `/api/episodes/${editingEpisode.id}` : `/api/anime/${selectedAnime.id}/episodes`;
      const method = editingEpisode ? 'PUT' : 'POST';
      
      console.log('Submitting episode data:', formData);
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        console.log('Episode saved successfully');
        setIsDialogOpen(false);
        setEditingEpisode(null);
        resetForm();
        await fetchEpisodes(selectedAnime.id);
      } else {
        const error = await response.json();
        console.error('Error saving episode:', error);
        setSaveError(error.message || 'Failed to save episode');
      }
    } catch (error) {
      console.error('Error saving episode:', error);
      setSaveError(error instanceof Error ? error.message : 'Failed to save episode');
    } finally {
      setIsSaving(false);
    }
  };

  const resetForm = () => {
    setFormData({
      episode_number: 1,
      title: '',
      description: '',
      video_url: '',
      download_url: '',
      duration: 0,
      subtitle_type: 'subbed'
    });
    setVideoFile('');
    setSaveError('');
  };

  const handleEdit = (episode: Episode) => {
    setEditingEpisode(episode);
    setFormData({
      episode_number: episode.episode_number,
      title: episode.title,
      description: episode.description || '',
      video_url: episode.video_url || '',
      download_url: episode.download_url || '',
      duration: episode.duration || 0,
      subtitle_type: episode.subtitle_type
    });
    setVideoFile(episode.video_url || '');
    setSaveError('');
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this episode?')) return;
    
    try {
      const response = await fetch(`/api/episodes/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok && selectedAnime) {
        fetchEpisodes(selectedAnime.id);
      }
    } catch (error) {
      console.error('Error deleting episode:', error);
    }
  };

  const openNewEpisodeDialog = () => {
    setEditingEpisode(null);
    const nextEpisodeNumber = episodes.length > 0 ? Math.max(...episodes.map(ep => ep.episode_number)) + 1 : 1;
    setFormData({
      episode_number: nextEpisodeNumber,
      title: '',
      description: '',
      video_url: '',
      download_url: '',
      duration: 0,
      subtitle_type: 'subbed'
    });
    setVideoFile('');
    setSaveError('');
    setIsDialogOpen(true);
  };

  const handleAnimeSelect = (animeItem: Anime) => {
    setSelectedAnime(animeItem);
    setEpisodes([]);
  };

  const handleBackToLibrary = () => {
    setSelectedAnime(null);
    setEpisodes([]);
  };

  const handleDialogClose = (open: boolean) => {
    if (!open && !isSaving) {
      setIsDialogOpen(false);
      setEditingEpisode(null);
      resetForm();
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-white">Loading anime library...</div>
      </div>
    );
  }

  // Show anime library view
  if (!selectedAnime) {
    return (
      <div className="space-y-6">
        <div className="text-center space-y-4">
          <h2 className="text-2xl font-bold text-white">Episode Management</h2>
          <p className="text-gray-300">Select an anime to manage its episodes</p>
        </div>

        {anime.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-gray-400">No anime found. Add some anime first to manage episodes.</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {anime.map((item) => (
              <Card 
                key={item.id} 
                className="bg-black/40 border-purple-500/20 hover:border-purple-500/40 transition-all duration-300 group hover:scale-105 cursor-pointer"
                onClick={() => handleAnimeSelect(item)}
              >
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
                    <p className="text-sm text-gray-300 line-clamp-2">{item.description}</p>
                  )}
                  
                  <div className="pt-2">
                    <Button className="w-full bg-purple-600 hover:bg-purple-700 group-hover:bg-purple-500 transition-colors">
                      <Edit className="w-4 h-4 mr-2" />
                      Manage Episodes
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    );
  }

  // Show episodes management view for selected anime
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            variant="outline"
            onClick={handleBackToLibrary}
            className="border-purple-500/30 text-purple-300"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Library
          </Button>
          <div>
            <h2 className="text-2xl font-bold text-white">{selectedAnime.title}</h2>
            <p className="text-gray-400">Episode Management</p>
          </div>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={handleDialogClose}>
          <DialogTrigger asChild>
            <Button onClick={openNewEpisodeDialog} className="bg-purple-600 hover:bg-purple-700">
              <Plus className="w-4 h-4 mr-2" />
              Add Episode
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto bg-black/90 border-purple-500/30 text-white">
            <DialogHeader>
              <DialogTitle className="text-white">
                {editingEpisode ? 'Edit Episode' : 'Add New Episode'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              {saveError && (
                <div className="flex items-center space-x-2 text-red-400 bg-red-900/20 p-3 rounded border border-red-500/20">
                  <AlertTriangle className="w-4 h-4" />
                  <span className="text-sm">{saveError}</span>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="episode_number" className="text-gray-300">Episode Number</Label>
                  <Input
                    id="episode_number"
                    type="number"
                    min="1"
                    value={formData.episode_number}
                    onChange={(e) => setFormData(prev => ({ ...prev, episode_number: parseInt(e.target.value) || 1 }))}
                    required
                    className="bg-black/60 border-purple-500/30 text-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="subtitle_type" className="text-gray-300">Subtitle Type</Label>
                  <Select value={formData.subtitle_type} onValueChange={(value) => setFormData(prev => ({ ...prev, subtitle_type: value }))}>
                    <SelectTrigger className="bg-black/60 border-purple-500/30 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-black border-purple-500/30">
                      <SelectItem value="subbed" className="text-white">Subbed</SelectItem>
                      <SelectItem value="dubbed" className="text-white">Dubbed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="title" className="text-gray-300">Episode Title</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  required
                  placeholder="Enter episode title"
                  className="bg-black/60 border-purple-500/30 text-white"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description" className="text-gray-300">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  rows={3}
                  placeholder="Episode description (optional)"
                  className="bg-black/60 border-purple-500/30 text-white"
                />
              </div>

              <FileUpload
                label="Episode Video"
                onUpload={handleVideoUpload}
                onRemove={() => {
                  setVideoFile('');
                  setFormData(prev => ({ ...prev, video_url: '', download_url: '' }));
                }}
                currentUrl={videoFile}
                accept="video/*"
              />

              <div className="space-y-2">
                <Label htmlFor="duration" className="text-gray-300">Duration (minutes)</Label>
                <Input
                  id="duration"
                  type="number"
                  min="0"
                  value={formData.duration}
                  onChange={(e) => setFormData(prev => ({ ...prev, duration: parseInt(e.target.value) || 0 }))}
                  placeholder="Episode duration in minutes"
                  className="bg-black/60 border-purple-500/30 text-white"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-4">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => handleDialogClose(false)} 
                  className="border-purple-500 text-purple-300"
                  disabled={isSaving}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  className="bg-purple-600 hover:bg-purple-700"
                  disabled={isSaving || !formData.title.trim()}
                >
                  {isSaving ? 'Saving...' : (editingEpisode ? 'Update Episode' : 'Create Episode')}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Anime Info Card */}
      <Card className="bg-black/40 border-purple-500/20">
        <CardContent className="p-6">
          <div className="flex items-start space-x-4">
            <div className="flex-shrink-0">
              {selectedAnime.cover_image_url ? (
                <img 
                  src={selectedAnime.cover_image_url} 
                  alt={selectedAnime.title}
                  className="w-24 h-32 object-cover rounded"
                />
              ) : (
                <div className="w-24 h-32 bg-purple-600/20 rounded flex items-center justify-center">
                  <Play className="w-8 h-8 text-purple-400" />
                </div>
              )}
            </div>
            <div className="flex-1 space-y-2">
              <div className="flex items-center space-x-2">
                <Badge variant="secondary" className="bg-purple-600/20 text-purple-300">
                  {selectedAnime.status}
                </Badge>
                {selectedAnime.genre && (
                  <Badge variant="outline" className="border-purple-500/30 text-purple-300">
                    {selectedAnime.genre}
                  </Badge>
                )}
                {selectedAnime.release_year && (
                  <span className="text-sm text-gray-400">{selectedAnime.release_year}</span>
                )}
              </div>
              {selectedAnime.description && (
                <p className="text-gray-300 text-sm">{selectedAnime.description}</p>
              )}
              <div className="flex flex-wrap gap-2">
                {selectedAnime.studio && (
                  <span className="text-xs bg-blue-600/20 text-blue-300 px-2 py-1 rounded">
                    Studio: {selectedAnime.studio}
                  </span>
                )}
                {selectedAnime.tags && (
                  <span className="text-xs bg-green-600/20 text-green-300 px-2 py-1 rounded">
                    Tags: {selectedAnime.tags}
                  </span>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Episodes List */}
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
              <p className="text-gray-400">No episodes added yet. Click "Add Episode" to get started.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {episodes.map((episode) => (
                <Card key={episode.id} className="bg-black/20 border-purple-500/10">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-white">
                          Episode {episode.episode_number}: {episode.title}
                        </CardTitle>
                        <div className="flex items-center space-x-2 mt-2">
                          <Badge variant="secondary" className="bg-purple-600/20 text-purple-300">
                            {episode.subtitle_type}
                          </Badge>
                          {episode.duration && (
                            <span className="text-sm text-gray-400">{episode.duration} min</span>
                          )}
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(episode)}
                          className="border-purple-500/30 text-purple-300"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(episode.id)}
                          className="border-red-500/30 text-red-300"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {episode.description && (
                        <p className="text-gray-300 text-sm">{episode.description}</p>
                      )}
                      <div className="flex flex-wrap gap-2">
                        {episode.video_url && (
                          <span className="text-xs bg-green-600/20 text-green-300 px-2 py-1 rounded flex items-center">
                            <Play className="w-3 h-3 mr-1" />
                            Video Available
                          </span>
                        )}
                        {episode.download_url && (
                          <span className="text-xs bg-blue-600/20 text-blue-300 px-2 py-1 rounded flex items-center">
                            <Download className="w-3 h-3 mr-1" />
                            Download Available
                          </span>
                        )}
                      </div>
                      {episode.video_url && (
                        <div className="text-xs text-gray-500">
                          File: {episode.video_url.split('/').pop()}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
