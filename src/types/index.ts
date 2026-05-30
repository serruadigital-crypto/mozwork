export type UserRole = 'client' | 'professional' | 'admin'

export interface Profile {
  id: string
  user_id: string
  full_name: string
  username: string
  avatar_url: string | null
  bio: string | null
  role: UserRole
  phone: string | null
  location: string | null
  skills: string[]
  hourly_rate: number | null
  is_verified: boolean
  rating: number
  total_reviews: number
  created_at: string
  updated_at: string
}

export interface Category {
  id: string
  name: string
  slug: string
  icon: string
  description: string | null
}

export interface Gig {
  id: string
  professional_id: string
  title: string
  description: string
  category_id: string
  price: number
  delivery_days: number
  status: 'active' | 'paused' | 'deleted'
  cover_image: string | null
  images: string[]
  tags: string[]
  revisions: number
  views: number
  created_at: string
  updated_at: string
  profile?: Profile
  category?: Category
}

export interface Order {
  id: string
  gig_id: string
  client_id: string
  professional_id: string
  status: 'pending' | 'in_progress' | 'delivered' | 'completed' | 'cancelled' | 'disputed'
  amount: number
  platform_fee: number
  professional_earnings: number
  requirements: string | null
  delivery_deadline: string
  created_at: string
  updated_at: string
  gig?: Gig
  client?: Profile
  professional?: Profile
}

export interface Review {
  id: string
  order_id: string
  reviewer_id: string
  reviewee_id: string
  rating: number
  comment: string
  created_at: string
  reviewer?: Profile
}

export interface Message {
  id: string
  conversation_id: string
  sender_id: string
  content: string
  created_at: string
  sender?: Profile
}
