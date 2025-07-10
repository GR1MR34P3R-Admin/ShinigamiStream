import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useSite } from '@/contexts/SiteContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { FileUpload } from '@/components/ui/file-upload';
import { Shield, Save, Palette } from 'lucide-react';

export function SiteSettingsPage() {
  const { user, token } = useAuth();
  const { settings, refreshSettings } = useSite();
  const [formData, setFormData] = useState({
    site_name: '',
    site_logo: '',
    site_announcement: '',
    hero_image: ''
  });
  const [logoFile, setLogoFile] = useState<string>('');
  const [heroFile, setHeroFile] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    setFormData({
      site_name: settings.site_name,
      site_logo: settings.site_logo,
      site_announcement: settings.site_announcement,
      hero_image: settings.hero_image
    });
  }, [settings]);

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

  const handleLogoUpload = async (file: File) => {
    const formData = new FormData();
    formData.append('logo', file);

    const response = await fetch('/api/upload/site-logo', {
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
    setFormData(prev => ({ ...prev, site_logo: result.url }));
    return result;
  };

  const handleHeroUpload = async (file: File) => {
    const formData = new FormData();
    formData.append('logo', file);

    const response = await fetch('/api/upload/site-logo', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: formData
    });

    if (!response.ok) {
      throw new Error('Failed to upload hero image');
    }

    const result = await response.json();
    setHeroFile(result.url);
    setFormData(prev => ({ ...prev, hero_image: result.url }));
    return result;
  };

  const handleLogoRemove = () => {
    setLogoFile('');
    setFormData(prev => ({ ...prev, site_logo: '' }));
  };

  const handleHeroRemove = () => {
    setHeroFile('');
    setFormData(prev => ({ ...prev, hero_image: '' }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage('');

    try {
      const response = await fetch('/api/settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        setMessage('Settings updated successfully!');
        await refreshSettings();
      } else {
        const error = await response.json();
        setMessage(error.message || 'Failed to update settings');
      }
    } catch (error) {
      console.error('Error updating settings:', error);
      setMessage('Failed to update settings');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold text-white">Site Settings</h1>
        <p className="text-gray-300">Customize your site appearance and announcements</p>
      </div>

      <div className="max-w-2xl mx-auto">
        <Card className="bg-black/40 border-purple-500/20">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <Palette className="w-5 h-5 mr-2 text-purple-400" />
              Site Customization
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {message && (
                <div className={`p-3 rounded ${
                  message.includes('successfully') 
                    ? 'bg-green-900/20 text-green-400 border border-green-500/20' 
                    : 'bg-red-900/20 text-red-400 border border-red-500/20'
                }`}>
                  {message}
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="site_name" className="text-gray-300">Site Name</Label>
                <Input
                  id="site_name"
                  value={formData.site_name}
                  onChange={(e) => setFormData(prev => ({ ...prev, site_name: e.target.value }))}
                  placeholder="Enter site name"
                  className="bg-black/60 border-purple-500/30 text-white placeholder-gray-500"
                />
                <p className="text-sm text-gray-400">This will appear in the header and page titles</p>
              </div>

              <FileUpload
                label="Site Logo"
                onUpload={handleLogoUpload}
                onRemove={handleLogoRemove}
                currentUrl={logoFile || formData.site_logo}
                accept="image/*"
              />

              <FileUpload
                label="Hero Image"
                onUpload={handleHeroUpload}
                onRemove={handleHeroRemove}
                currentUrl={heroFile || formData.hero_image}
                accept="image/*"
              />

              <div className="space-y-2">
                <Label htmlFor="site_announcement" className="text-gray-300">Site Announcement</Label>
                <Textarea
                  id="site_announcement"
                  value={formData.site_announcement}
                  onChange={(e) => setFormData(prev => ({ ...prev, site_announcement: e.target.value }))}
                  placeholder="Enter announcement banner text (leave empty to hide)"
                  rows={3}
                  className="bg-black/60 border-purple-500/30 text-white placeholder-gray-500"
                />
                <p className="text-sm text-gray-400">Will appear as a banner at the top of every page</p>
              </div>

              <div className="pt-4">
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-purple-600 hover:bg-purple-700"
                >
                  <Save className="w-4 h-4 mr-2" />
                  {isLoading ? 'Saving...' : 'Save Settings'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Preview Section */}
        <Card className="bg-black/40 border-purple-500/20 mt-6">
          <CardHeader>
            <CardTitle className="text-white">Preview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {formData.site_announcement && (
                <div className="bg-purple-600 text-white text-center py-2 px-4 text-sm rounded">
                  {formData.site_announcement}
                </div>
              )}
              <div className="bg-black/90 border border-purple-500/20 p-4 rounded">
                <div className="flex items-center space-x-2 mb-4">
                  {(logoFile || formData.site_logo) ? (
                    <img 
                      src={logoFile || formData.site_logo} 
                      alt="Site Logo" 
                      className="w-8 h-8 object-contain"
                    />
                  ) : (
                    <div className="text-2xl font-bold text-purple-400">死</div>
                  )}
                  <h1 className="text-2xl font-bold text-white">{formData.site_name}</h1>
                </div>
                {(heroFile || formData.hero_image) && (
                  <div className="text-center">
                    <img 
                      src={heroFile || formData.hero_image} 
                      alt="Hero Preview" 
                      className="max-w-48 max-h-24 object-contain rounded mx-auto"
                    />
                    <p className="text-xs text-gray-400 mt-2">Hero Image Preview</p>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
