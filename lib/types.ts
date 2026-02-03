export type Tag = {
  id: number;
  tag: string;
  tag_display_name: string;
};

export type GalleryCard = {
  id: number;
  media_url: string;
  created_at: string;
  profile_name: string;
  profile_picture: string | null;
  total_photo_uploaded: number | null;
  tags: string[];
};

export type GalleryDetail = {
  id: number;
  media_url: string;
  created_at: string;
  profile_name: string;
  profile_picture: string | null;
  total_photo_uploaded: number | null;
  tags: Tag[];
};


