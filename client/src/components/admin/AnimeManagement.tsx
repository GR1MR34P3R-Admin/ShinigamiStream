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
import { Plus, Edit, Trash2, Building2 } from 'lucide-react';

interface Anime {
  id: number;
  title: string;
  description: string;
  genre: string;
  status: string;
  release_year: number;
  logo_url: string;
  cover_image_url: string;
  studio: string;
  tags: string;
  created_at: string;
}

export function AnimeManagement() {
  const { token } = useAuth();
  const [anime, setAnime] = useState<Anime[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingAnime, setEditingAnime] = useState<Anime | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    genre: '',
    status: 'ongoing',
    release_year: new Date().getFullYear(),
    logo_url: '',
    cover_image_url: '',
    studio: '',
    tags: ''
  });
  const [logoFile, setLogoFile] = useState<string>('');
  const [coverFile, setCoverFile] = useState<string>('');

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

  const handleLogoUpload = async (file: File) => {
    const formData = new FormData();
    formData.append('cover', file);

    const response = await fetch('/api/upload/anime-cover', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: formData
    });

    if (!response.ok) {
      throw new Error('Failed to upload logo');
    }

    const result = await response.json();
    setLogoFile(result.url);
    setFormData(prev => ({ ...prev, logo_url: result.url }));
    return result;
  };

  const handleCoverUpload = async (file: File) => {
    const formData = new FormData();
    formData.append('cover', file);

    const response = await fetch('/api/upload/anime-cover', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: formData
    });

    if (!response.ok) {
      throw new Error('Failed to upload cover');
    }

    const result = await response.json();
    setCoverFile(result.url);
    setFormData(prev => ({ ...prev, cover_image_url: result.url }));
    return result;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const url = editingAnime ? `/api/anime/${editingAnime.id}` : '/api/anime';
      const method = editingAnime ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        setIsDialogOpen(false);
        setEditingAnime(null);
        resetForm();
        fetchAnime();
      }
    } catch (error) {
      console.error('Error saving anime:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      genre: '',
      status: 'ongoing',
      release_year: new Date().getFullYear(),
      logo_url: '',
      cover_image_url: '',
      studio: '',
      tags: ''
    });
    setLogoFile('');
    setCoverFile('');
  };

  const handleEdit = (animeItem: Anime) => {
    setEditingAnime(animeItem);
    setFormData({
      title: animeItem.title,
      description: animeItem.description || '',
      genre: animeItem.genre || '',
      status: animeItem.status,
      release_year: animeItem.release_year || new Date().getFullYear(),
      logo_url: animeItem.logo_url || '',
      cover_image_url: animeItem.cover_image_url || '',
      studio: animeItem.studio || '',
      tags: animeItem.tags || ''
    });
    setLogoFile(animeItem.logo_url || '');
    setCoverFile(animeItem.cover_image_url || '');
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this anime?')) return;
    
    try {
      const response = await fetch(`/api/anime/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        fetchAnime();
      }
    } catch (error) {
      console.error('Error deleting anime:', error);
    }
  };

  const openNewAnimeDialog = () => {
    setEditingAnime(null);
    resetForm();
    setIsDialogOpen(true);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-white">Loading anime...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-white">Anime Management</h2>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={openNewAnimeDialog} className="bg-purple-600 hover:bg-purple-700">
              <Plus className="w-4 h-4 mr-2" />
              Add Anime
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-black/90 border-purple-500/30 text-white">
            <DialogHeader>
              <DialogTitle className="text-white">
                {editingAnime ? 'Edit Anime' : 'Add New Anime'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="title" className="text-gray-300">Title</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    required
                    className="bg-black/60 border-purple-500/30 text-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="genre" className="text-gray-300">Genre</Label>
                  <Input
                    id="genre"
                    value={formData.genre}
                    onChange={(e) => setFormData(prev => ({ ...prev, genre: e.target.value }))}
                    className="bg-black/60 border-purple-500/30 text-white"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description" className="text-gray-300">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  rows={3}
                  className="bg-black/60 border-purple-500/30 text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="status" className="text-gray-300">Status</Label>
                  <Select value={formData.status} onValueChange={(value) => setFormData(prev => ({ ...prev, status: value }))}>
                    <SelectTrigger className="bg-black/60 border-purple-500/30 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-black border-purple-500/30">
                      <SelectItem value="ongoing" className="text-white">Ongoing</SelectItem>
                      <SelectItem value="completed" className="text-white">Completed</SelectItem>
                      <SelectItem value="upcoming" className="text-white">Upcoming</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="release_year" className="text-gray-300">Release Year</Label>
                  <Input
                    id="release_year"
                    type="number"
                    value={formData.release_year}
                    onChange={(e) => setFormData(prev => ({ ...prev, release_year: parseInt(e.target.value) }))}
                    className="bg-black/60 border-purple-500/30 text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="studio" className="text-gray-300">Studio</Label>
                  <Input
                    id="studio"
                    value={formData.studio}
                    onChange={(e) => setFormData(prev => ({ ...prev, studio: e.target.value }))}
                    className="bg-black/60 border-purple-500/30 text-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="tags" className="text-gray-300">Tags (comma-separated)</Label>
                  <Input
                    id="tags"
                    value={formData.tags}
                    onChange={(e) => setFormData(prev => ({ ...prev, tags: e.target.value }))}
                    placeholder="action, adventure, supernatural"
                    className="bg-black/60 border-purple-500/30 text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FileUpload
                  label="Logo Image"
                  onUpload={handleLogoUpload}
                  onRemove={() => {
                    setLogoFile('');
                    setFormData(prev => ({ ...prev, logo_url: '' }));
                  }}
                  currentUrl={logoFile}
                  accept="image/*"
                />
                
                <FileUpload
                  label="Cover Image"
                  onUpload={handleCoverUpload}
                  onRemove={() => {
                    setCoverFile('');
                    setFormData(prev => ({ ...prev, cover_image_url: '' }));
                  }}
                  currentUrl={coverFile}
                  accept="image/*"
                />
              </div>

              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)} className="border-purple-500 text-purple-300">
                  Cancel
                </Button>
                <Button type="submit" className="bg-purple-600 hover:bg-purple-700">
                  {editingAnime ? 'Update' : 'Create'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {anime.map((item) => (
          <Card key={item.id} className="bg-black/40 border-purple-500/20">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    {item.cover_image_url ? (
                      <img 
                        src={item.cover_image_url} 
                        alt={item.title}
                        className="w-16 h-20 object-cover rounded"
                      />
                    ) : (
                      <div className="w-16 h-20 bg-purple-600/20 rounded flex items-center justify-center">
                        <Building2 className="w-8 h-8 text-purple-400" />
                      </div>
                    )}
                  </div>
                  <div>
                    <CardTitle className="text-white">{item.title}</CardTitle>
                    <div className="flex items-center space-x-2 mt-2">
                      <Badge variant="secondary" className="bg-purple-600/20 text-purple-300">
                        {item.status}
                      </Badge>
                      {item.genre && (
                        <Badge variant="outline" className="border-purple-500/30 text-purple-300">
                          {item.genre}
                        </Badge>
                      )}
                      {item.release_year && (
                        <span className="text-sm text-gray-400">{item.release_year}</span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(item)}
                    className="border-purple-500/30 text-purple-300"
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(item.id)}
                    className="border-red-500/30 text-red-300"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {item.description && (
                  <p className="text-gray-300 text-sm">{item.description}</p>
                )}
                <div className="flex flex-wrap gap-2">
                  {item.studio && (
                    <span className="text-xs bg-blue-600/20 text-blue-300 px-2 py-1 rounded">
                      Studio: {item.studio}
                    </span>
                  )}
                  {item.tags && (
                    <span className="text-xs bg-green-600/20 text-green-300 px-2 py-1 rounded">
                      Tags: {item.tags}
                    </span>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
