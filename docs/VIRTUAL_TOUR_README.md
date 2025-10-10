# Virtual Tour Feature Implementation

## Overview

This implementation adds immersive 360° virtual tour capabilities to your property marketplace webapp. Users can now upload panoramic images and create interactive virtual tours that viewers can navigate through, similar to Google Street View.

## 🚀 Features Implemented

### ✅ Core Components
- **VirtualTourViewer** - 360° panoramic image viewer with navigation
- **VirtualTourUpload** - User-friendly upload interface for creating tours
- **ImageTourViewer** - Fallback gallery viewer for regular images

### ✅ User Experience
- **Drag & Drop Upload** - Easy image upload with validation
- **Interactive Navigation** - Click hotspots to move between rooms
- **Full-Screen Mode** - Immersive viewing experience  
- **Room Connections** - Define which rooms connect to each other
- **Mobile Responsive** - Works on all devices

### ✅ Technical Features
- **360° Image Support** - Optimized for panoramic/equirectangular images
- **Scene Management** - Organize multiple rooms/areas
- **Hotspot System** - Navigate between connected spaces
- **Image Optimization** - Automatic compression and formatting
- **Database Schema** - Complete data structure for tours

## 📁 File Structure

```
components/virtual-tour/
├── VirtualTourViewer.tsx     # Main 360° viewer component
└── VirtualTourUpload.tsx     # Upload and tour creation interface

lib/
└── virtual-tour.ts           # Utility functions and services

docs/
├── virtual-tour-schema.sql   # Database schema for Supabase
└── VIRTUAL_TOUR_README.md   # This documentation
```

## 🛠 Technical Implementation

### Frontend Stack
- **React 18** with TypeScript
- **Next.js 14** for SSR and routing  
- **Tailwind CSS** for styling
- **PhotoSphere Viewer** for 360° image rendering
- **Radix UI** components for consistent UX

### Backend Requirements
- **Supabase** database with PostgreSQL
- **File Storage** for image uploads (Supabase Storage)
- **Row Level Security** for data protection

## 🗄 Database Schema

The virtual tour feature adds these new tables integrated with marketplace listings:

- `virtual_tours` - Main tour information linked to marketplace_listings
- `virtual_tour_scenes` - Individual 360° images/rooms with scene ordering
- `virtual_tour_navigation` - Navigation connections between scenes
- Enhanced `marketplace_listings` table with `has_virtual_tour` flag

## 🎯 How It Works

### For Property Owners:
1. **Create Property** - Fill out the marketplace listing form
2. **Upload Virtual Tour Images** - Add 360° images in the "Virtual Tour Images" section
3. **Automatic Processing** - Images are optimized and tour is created automatically
4. **Tour Generated** - Virtual tour is saved and linked to the property

### For Property Viewers:
1. **View Property** - Browse marketplace listings as usual
2. **Virtual Tour Available** - Blue "Virtual Tour" tile appears if tour exists
3. **Start Tour** - Click the tile to launch immersive 360° experience
4. **Navigate Immersively** - Look around with mouse/touch, click hotspots to move between rooms
5. **Full Experience** - Fullscreen mode for maximum immersion

## 📱 User Interface

### Tour Viewer Controls
- **Mouse/Touch Drag** - Look around the 360° scene
- **Scroll/Pinch** - Zoom in and out
- **Room Navigator** - Quick access to all scenes
- **Reset View** - Return to default position
- **Fullscreen Toggle** - Immersive viewing mode

### Upload Interface
- **Drag & Drop Zone** - Easy file upload
- **Image Validation** - File type and size checking
- **Scene Preview** - Thumbnail view of uploaded images
- **Connection Manager** - Visual room relationship editor
- **Progress Tracking** - Upload and processing status

## 🔧 Configuration Options

### Tour Settings (Configurable)
```typescript
{
  auto_rotate: false,           // Auto-rotation enabled
  auto_rotate_speed: 2,         // Rotation speed (1-10)
  zoom_enabled: true,           // Allow zoom controls
  navigation_enabled: true,     // Show navigation UI
  controls_visible: true,       // Display control buttons
  transition_duration: 1000     // Scene transition time (ms)
}
```

### Image Requirements
- **Format**: JPEG, PNG, WebP
- **Size**: Maximum 15MB per image
- **Dimensions**: Optimally 4096x2048 (2:1 ratio)
- **Type**: 360° panoramic/equirectangular images work best

## 🚦 Getting Started

### 1. Database Setup
**Manual Setup (Recommended):**

1. Open your Supabase dashboard
2. Go to the SQL Editor
3. Copy and paste the contents of `docs/virtual-tour-schema.sql`
4. Click "Run" to execute the schema

This will create:
- `virtual_tours` table
- `virtual_tour_scenes` table
- `virtual_tour_hotspots` table
- All necessary indexes and RLS policies

**Alternative: Setup Script**
```bash
# Install dependencies if needed
npm install dotenv

# Ensure your .env.local file has the required variables:
# NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
# SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Run the setup script
node scripts/setup-virtual-tour-tables.js
```

### 2. Environment Setup
Ensure your environment has the required packages:
```bash
npm install photo-sphere-viewer --legacy-peer-deps
```

### 3. Component Integration
The virtual tour functionality is integrated directly into the marketplace property creation form:
- `app/marketplace/create/page.tsx` - Virtual tour images are uploaded as part of the main property form
- `app/marketplace/[id]/page.tsx` - Property pages display virtual tours when available

### 4. API Integration
You'll need to extend your API to handle virtual tour data:
- Upload and store tour images
- Save tour configuration to database
- Retrieve tour data for viewing

## 📊 Performance Considerations

### Image Optimization
- Automatic compression to 85% JPEG quality
- Resize large images to optimal dimensions
- Progressive loading for better UX

### Loading Strategy
- Lazy load tour data only when requested
- Progressive enhancement (fallback to regular images)
- Efficient caching of 360° image data

## 🎨 Customization

### Styling
The components use Tailwind CSS classes and can be customized by:
- Modifying the component styles
- Updating the color scheme variables
- Customizing the UI component themes

### Functionality
Extend the virtual tour with:
- **Background Music** - Ambient audio for scenes
- **Info Hotspots** - Display additional property details
- **Video Integration** - Embed video content in scenes
- **Analytics** - Track user interaction and engagement

## 🤝 Usage Examples

### Basic Virtual Tour
```tsx
import { VirtualTourViewer } from '@/components/virtual-tour/VirtualTourViewer'

const tourData = {
  id: 'tour-123',
  title: 'Beautiful House Tour',
  scenes: [
    {
      id: 'living-room',
      name: 'Living Room',
      image_url: 'https://example.com/living-360.jpg',
      hotspots: [
        {
          id: 'to-kitchen',
          target_scene_id: 'kitchen',
          position: { yaw: 1.57, pitch: 0 },
          title: 'Go to Kitchen'
        }
      ]
    }
    // ... more scenes
  ],
  default_scene_id: 'living-room'
}

<VirtualTourViewer
  tourData={tourData}
  isOpen={showTour}
  onClose={() => setShowTour(false)}
/>
```

### Upload Interface
```tsx
import { VirtualTourUpload } from '@/components/virtual-tour/VirtualTourUpload'

<VirtualTourUpload
  onTourDataChange={(data) => setTourData(data)}
  disabled={loading}
/>
```

## 🆘 Troubleshooting

### Common Issues

**Images not displaying:**
- Check image URLs are publicly accessible
- Ensure images are in supported formats (JPEG, PNG, WebP)
- Verify images aren't too large (>15MB)

**Navigation not working:**
- Confirm hotspot positions are in correct format (radians)
- Check that target scene IDs exist in the tour data
- Validate scene connections are properly defined

**Performance issues:**
- Optimize image sizes before upload
- Use appropriate image dimensions (4096x2048 recommended)
- Consider progressive loading for large tours

### Browser Compatibility
- Chrome/Edge: Full support
- Firefox: Full support  
- Safari: Full support with WebGL
- Mobile browsers: Touch navigation supported

## 🔮 Future Enhancements

### Planned Features
- **VR Mode** - WebXR support for VR headsets
- **Augmented Reality** - AR overlay capabilities
- **360° Video** - Support for panoramic video content
- **Floor Plans** - Interactive property layout integration
- **Social Sharing** - Share specific tour scenes
- **Analytics Dashboard** - Tour performance metrics

### Advanced Integrations
- **AI Scene Analysis** - Automatic hotspot suggestions
- **Voice Navigation** - Audio-guided tours
- **Multi-language** - Localized tour content
- **Live Tours** - Real-time guided experiences

## 📞 Support

For implementation questions or issues:
1. Check the troubleshooting section above
2. Review the component documentation
3. Test with the provided sample data
4. Verify database schema is properly applied

---

This virtual tour implementation provides a modern, professional property viewing experience that will significantly enhance user engagement and help properties stand out in the marketplace. The modular design makes it easy to extend and customize based on your specific needs.
