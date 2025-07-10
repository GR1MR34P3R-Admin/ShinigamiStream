export interface DatabaseSchema {
  users: {
    id: number;
    username: string;
    email: string;
    password: string;
    role: 'admin' | 'staff' | 'user';
    created_at: string;
    updated_at: string;
  };
  anime: {
    id: number;
    title: string;
    description: string | null;
    genre: string | null;
    status: 'ongoing' | 'completed' | 'upcoming';
    release_year: number | null;
    logo_url: string | null;
    cover_image_url: string | null;
    studio: string | null;
    tags: string | null;
    created_by: number | null;
    created_at: string;
    updated_at: string;
  };
  episodes: {
    id: number;
    anime_id: number;
    episode_number: number;
    title: string;
    description: string | null;
    video_url: string | null;
    download_url: string | null;
    duration: number | null;
    subtitle_type: 'subbed' | 'dubbed';
    created_by: number | null;
    created_at: string;
    updated_at: string;
  };
  site_settings: {
    id: number;
    key: string;
    value: string | null;
    updated_by: number | null;
    created_at: string;
    updated_at: string;
  };
}
