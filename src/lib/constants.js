// Service Categories
export const SERVICE_CATEGORIES = [
  {
    id: 'plumbing',
    name: 'Plumbing',
    icon: 'Wrench',
    description: 'Pipe repairs, installations, and maintenance',
    color: '#3B82F6',
  },
  {
    id: 'electrical',
    name: 'Electrical',
    icon: 'Zap',
    description: 'Wiring, repairs, and electrical installations',
    color: '#F59E0B',
  },
  {
    id: 'carpentry',
    name: 'Carpentry',
    icon: 'Hammer',
    description: 'Furniture, woodwork, and repairs',
    color: '#8B5CF6',
  },
  {
    id: 'painting',
    name: 'Painting',
    icon: 'Paintbrush',
    description: 'Interior and exterior painting services',
    color: '#EC4899',
  },
  {
    id: 'cleaning',
    name: 'Cleaning',
    icon: 'Sparkles',
    description: 'Home and office cleaning services',
    color: '#10B981',
  },
  {
    id: 'hairdressing',
    name: 'Hair & Beauty',
    icon: 'Scissors',
    description: 'Haircuts, styling, and beauty services',
    color: '#F43F5E',
  },
  {
    id: 'driving',
    name: 'Driving',
    icon: 'Car',
    description: 'Personal drivers and transportation',
    color: '#6366F1',
  },
  {
    id: 'ac_repair',
    name: 'AC Repair',
    icon: 'Wind',
    description: 'Air conditioning installation and repairs',
    color: '#0EA5E9',
  },
  {
    id: 'gardening',
    name: 'Gardening',
    icon: 'TreeDeciduous',
    description: 'Lawn care and gardening services',
    color: '#22C55E',
  },
  {
    id: 'moving',
    name: 'Moving',
    icon: 'Truck',
    description: 'Packing, moving, and relocation',
    color: '#A855F7',
  },
  {
    id: 'appliance_repair',
    name: 'Appliance Repair',
    icon: 'Settings',
    description: 'Home appliance repairs and maintenance',
    color: '#64748B',
  },
  {
    id: 'photography',
    name: 'Photography',
    icon: 'Camera',
    description: 'Event and portrait photography',
    color: '#EF4444',
  },
];

// Booking Status
export const BOOKING_STATUS = {
  PENDING: 'pending',
  ACCEPTED: 'accepted',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
  DISPUTED: 'disputed',
};

// KYC Status
export const KYC_STATUS = {
  NOT_STARTED: 'not_started',
  PENDING: 'pending',
  UNDER_REVIEW: 'under_review',
  VERIFIED: 'verified',
  REJECTED: 'rejected',
};

// Referral Commission Rates
export const REFERRAL_RATES = {
  LEVEL_1: 2.5, // 2.5% for direct referrals
  LEVEL_2: 1.5, // 1.5% for second level
  LEVEL_3: 1.0, // 1.0% for third level
  TOTAL: 5.0,   // Total 5% of fees
};

// Platform Fee
export const PLATFORM_FEE_PERCENT = 15; // 15% platform fee

// Minimum withdrawal amount
export const MIN_WITHDRAWAL = 5000; // NGN 5,000

// Nigerian States
export const NIGERIAN_STATES = [
  'Abia', 'Adamawa', 'Akwa Ibom', 'Anambra', 'Bauchi', 'Bayelsa', 'Benue',
  'Borno', 'Cross River', 'Delta', 'Ebonyi', 'Edo', 'Ekiti', 'Enugu', 'FCT',
  'Gombe', 'Imo', 'Jigawa', 'Kaduna', 'Kano', 'Katsina', 'Kebbi', 'Kogi',
  'Kwara', 'Lagos', 'Nasarawa', 'Niger', 'Ogun', 'Ondo', 'Osun', 'Oyo',
  'Plateau', 'Rivers', 'Sokoto', 'Taraba', 'Yobe', 'Zamfara',
];

// Document Types for KYC
export const KYC_DOCUMENT_TYPES = [
  { id: 'nin', name: 'National ID (NIN)', description: 'National Identification Number' },
  { id: 'voters_card', name: "Voter's Card", description: 'Permanent Voter Card (PVC)' },
  { id: 'drivers_license', name: "Driver's License", description: 'Valid Nigerian Driver\'s License' },
  { id: 'passport', name: 'International Passport', description: 'Valid Nigerian Passport' },
];

// Format currency in Naira
export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

// Format date
export const formatDate = (date) => {
  return new Intl.DateTimeFormat('en-NG', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(new Date(date));
};

// Format time
export const formatTime = (date) => {
  return new Intl.DateTimeFormat('en-NG', {
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date));
};

// Format date and time
export const formatDateTime = (date) => {
  return new Intl.DateTimeFormat('en-NG', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date));
};

// Calculate distance (mock function - would use actual geolocation)
export const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
};

// Generate star rating display
export const generateStarRating = (rating) => {
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.5;
  const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
  return { fullStars, hasHalfStar, emptyStars };
};
