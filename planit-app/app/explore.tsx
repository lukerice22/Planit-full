import React, { useRef, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Dimensions,
  Animated,
  TouchableOpacity,
  Modal,
  SafeAreaView,
  Image,
  ActivityIndicator,
  Share,
  Alert,
  TextInput,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

type Location = {
  id: string;
  title: string;
  description: string;
  fullContent: string;
  images: any[];
  tags: string[];
  readTime: string;
  location: string;
  bestTime: string;
  difficulty: string;
};

const LOCATIONS: Location[] = [
  {
    id: 'big-sur',
    title: 'Big Sur, CA',
    description: `Nestled along California's central coast, Big Sur offers dramatic cliffs & sea stacks at Garrapata State Park, towering ancient redwoods in Pfeiffer Big Sur State Park, and golden sand with purple-hued rocks at Pfeiffer Beach.`,
    fullContent: `The Majesty of Big Sur: California's Crown Jewel

Big Sur represents one of California's most spectacular stretches of coastline, where the Santa Lucia Mountains rise dramatically from the Pacific Ocean. This 90-mile stretch of rugged coast between Carmel and San Simeon offers some of the most breathtaking scenery in North America.

Natural Wonders

McWay Falls
Perhaps Big Sur's most photographed landmark, McWay Falls cascades 80 feet directly onto the beach at Julia Pfeiffer Burns State Park. This year-round waterfall is best viewed from the overlook trail, especially during golden hour when the light creates magical reflections on the water.

Bixby Creek Bridge
This iconic concrete arch bridge spans 714 feet and rises 280 feet above Bixby Creek. Built in 1932, it's one of the most photographed bridges in California and offers stunning views of the coastline in both directions.

Pfeiffer Beach
Famous for its purple sand (created by manganese garnet deposits), Pfeiffer Beach features dramatic rock formations and the famous keyhole rock formation that creates perfect sunset photography opportunities.

Activities & Adventures

Hiking Trails
- McWay Falls Trail: Easy 0.6-mile walk to the waterfall overlook
- Julia Pfeiffer Burns State Park: Multiple trails through redwood groves
- Partington Cove: Hidden gem accessible via a moderate 1-mile hike
- Ewoldsen Trail: 4.5-mile loop with creek crossings and canyon views

Scenic Drives
Highway 1 through Big Sur is considered one of the world's most beautiful drives. Take your time, pull over at vista points, and expect the journey to take much longer than anticipated – but that's part of the magic.

Wellness Retreats
Big Sur is home to world-renowned wellness retreats like Esalen Institute, where you can experience natural hot springs perched on cliffs overlooking the ocean. Post Ranch Inn and Ventana Big Sur offer luxury accommodations with spa services.

Best Time to Visit
Spring (March-May): Wildflowers bloom, waterfalls are at their peak, and weather is mild.
Summer (June-August): Warmest weather but can be crowded and foggy along the coast.
Fall (September-November): Clear skies, warm temperatures, and fewer crowds.
Winter (December-February): Storm watching, dramatic seas, but some roads may be closed.

Practical Tips
- Book accommodations well in advance, especially for weekends
- Fill up your gas tank before entering Big Sur – gas stations are limited
- Bring layers – coastal fog can roll in quickly
- Check road conditions, especially during winter months
- Cell service is extremely limited – embrace the digital detox
- Pack snacks and water for hikes
- Respect the environment – pack out all trash

Big Sur isn't just a destination – it's a spiritual experience that reconnects you with nature's raw power and beauty.`,
    tags: ['Nature', 'Coast', 'Adventure'],
    readTime: '8 min read',
    location: 'California Central Coast',
    bestTime: 'Spring & Fall',
    difficulty: 'Easy to Moderate',
    images: [
      require('../assets/images/discover/bigsur1.jpg'),
      require('../assets/images/discover/bigsur2.jpg'),
      require('../assets/images/discover/bigsur3.jpg'),
    ],
  },
  {
    id: 'monument-valley',
    title: 'Monument Valley, AZ/UT',
    description: `Experience the iconic American West with the Valley Drive, a 17-mile dirt loop passing The Mittens, Merrick Butte, and Elephant Butte. Join Navajo-guided tours to explore hidden canyons and learn tribal stories.`,
    fullContent: `Monument Valley: Sacred Land of the Navajo

Monument Valley Navajo Tribal Park straddles the Arizona-Utah border and represents one of America's most iconic landscapes. This sacred land of the Navajo Nation has been featured in countless Western films and continues to capture imaginations with its towering sandstone buttes and mesas.

The Landscape

Geological Marvel
Monument Valley's distinctive formations were created over millions of years. Ancient seas deposited layers of sediment that hardened into rock. Subsequent erosion carved away softer materials, leaving the resistant sandstone monuments we see today – some reaching heights of over 1,000 feet.

Iconic Formations
- The Mittens: East and West Mitten Buttes are the park's most recognizable formations
- Merrick Butte: Named after a silver prospector, offers classic Monument Valley views
- Three Sisters: A cluster of spires that demonstrate the area's geological diversity
- Totem Pole: A 300-foot tall spire that challenges even experienced rock climbers
- Elephant Butte: Resembles a giant elephant when viewed from certain angles

Cultural Significance

Navajo Heritage
Monument Valley isn't just a geological wonder – it's sacred land to the Diné (Navajo) people who have lived here for generations. Many formations have spiritual significance and are woven into traditional stories passed down through oral tradition.

Traditional Activities
- Traditional weaving demonstrations
- Sand painting ceremonies
- Storytelling sessions around evening campfires
- Native jewelry and craft workshops
- Traditional Navajo cuisine experiences

Valley Drive Experience

The 17-mile Valley Drive is a self-guided dirt road tour that takes 2-4 hours depending on stops. The road is suitable for most vehicles, though high-clearance vehicles are recommended, especially after rain.

Key Stops Along the Drive
1. The View: Starting point with visitor center and stunning vistas
2. Elephant Butte: First major photo opportunity
3. The Three Sisters: Dramatic spire formations
4. John Ford's Point: Named after the famous Western film director
5. Artist's Point: Offers unique perspective of The Mittens
6. North Window: Frames distant formations perfectly

Guided Tours

Navajo-Led Experiences
Only Navajo-guided tours can access restricted areas of the park, including:
- Mystery Valley: Hidden arches and ancient ruins
- Hunt's Mesa: Spectacular sunrise/sunset viewpoint
- Tear Drop Arch: Secluded natural arch formation
- Ancient ruins: Ancestral Puebloan archaeological sites

Tour Options
- Standard Tours: 2.5-3 hours covering main highlights
- Sunset Tours: 1.5 hours timed for golden hour photography
- Overnight Tours: Multi-day experiences with traditional camping
- Photography Tours: Specialized tours for serious photographers
- Horseback Tours: Experience the valley as the Navajo traditionally have

Monument Valley offers more than just stunning scenery – it's an opportunity to connect with Native American culture and experience one of the American West's most spiritual landscapes.`,
    tags: ['Desert', 'Culture', 'Photography'],
    readTime: '10 min read',
    location: 'Arizona/Utah Border',
    bestTime: 'Spring & Fall',
    difficulty: 'Easy',
    images: [
      require('../assets/images/discover/monval1.jpg'),
      require('../assets/images/discover/monval2.jpg'),
      require('../assets/images/discover/monval3.jpg'),
    ],
  },
  {
    id: 'antelope-canyon',
    title: 'Antelope Canyon, AZ',
    description: `Delve into the sculpted sandstone corridors of Upper Canyon, famous for midday light beams illuminating swirling walls, or explore Lower Canyon with its secret staircases and narrow passages.`,
    fullContent: `Antelope Canyon: Nature's Cathedral of Light

Antelope Canyon, located on Navajo Nation land near Page, Arizona, is arguably the most photographed slot canyon in the world. This narrow passageway, carved by flash floods over thousands of years, creates a mesmerizing display of light, shadow, and color that photographers and visitors flock to experience.

The Two Canyons

Upper Antelope Canyon ("The Crack")
Upper Antelope Canyon is the more popular and accessible of the two canyons. At ground level, it's easier to enter and navigate, making it suitable for visitors of all ages and fitness levels.

Key Features:
- Light Beams: Famous columns of light that penetrate the canyon from above
- Smooth Walls: Wave-like sandstone formations create an otherworldly atmosphere  
- Wide Passages: More spacious than Lower Canyon, allowing larger groups
- Ground-Level Entry: No climbing required, wheelchair accessible sections

Best Photography Times:
- Summer (April-September): Light beams are most visible between 10 AM and 1 PM
- Peak Season (June-August): Most dramatic light displays but also most crowded
- Spring/Fall: Good light with fewer crowds

Lower Antelope Canyon ("The Corkscrew")
Lower Antelope Canyon offers a more adventurous experience with ladder descents and narrower passageways. While more challenging to navigate, many photographers prefer its intricate formations and varied compositions.

Key Features:
- Ladder Access: Multiple metal ladders required to enter and exit
- Narrow Passages: More intimate spaces create unique photo opportunities
- Spiral Formations: Distinctive corkscrew rock patterns
- Less Crowded: Generally fewer visitors than Upper Canyon
- Longer Tour: More time spent exploring due to challenging terrain

Geological Wonder

Formation Process
Antelope Canyon was formed by the erosive forces of flash floods flowing through sandstone over millions of years. The Navajo Sandstone, deposited during the Jurassic period, has been sculpted into flowing, organic shapes that seem almost too perfect to be natural.

The Science Behind the Beauty
- Differential Erosion: Softer rock layers eroded faster, creating the undulating walls
- Flash Flood Carving: Sudden torrents of water carved the narrow channels
- Wind Polishing: Constant air flow smoothed the surfaces to their current silky texture
- Iron Oxide Staining: Creates the warm red, orange, and purple hues

Photography Guide

Equipment Essentials
- Wide-Angle Lens: 14-24mm captures the canyon's expansive feel
- Tripod: Essential for sharp images in low light
- Camera Strap: Secure attachment prevents drops in narrow spaces
- Lens Cloth: Desert sand gets everywhere
- Extra Batteries: Cold and sand drain power quickly

Techniques for Success
1. HDR Photography: Extreme contrast requires multiple exposures
2. Focus Stacking: Ensures sharp detail from foreground to background
3. Long Exposures: Smooth out harsh shadows and highlights
4. Composition: Look for leading lines and natural frames
5. Abstract Approaches: Focus on patterns, textures, and colors

Antelope Canyon offers one of nature's most spectacular light shows – a reminder that some of the world's most beautiful places require patience, respect, and careful stewardship to preserve their magic.`,
    tags: ['Photography', 'Adventure', 'Unique'],
    readTime: '12 min read',
    location: 'Page, Arizona',
    bestTime: 'Summer (for light beams)',
    difficulty: 'Easy to Moderate',
    images: [
      require('../assets/images/discover/antcan1.jpg'),
      require('../assets/images/discover/antcan2.jpg'),
      require('../assets/images/discover/antcan3.jpg'),
    ],
  },
];

const { width, height } = Dimensions.get('window');

export default function ExploreScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const fadeIns = useRef(LOCATIONS.map(() => new Animated.Value(0))).current;
  const [viewerImages, setViewerImages] = useState<any[]>([]);
  const [viewerIndex, setViewerIndex] = useState(0);
  const [showViewer, setShowViewer] = useState(false);
  const [imageLoadingStates, setImageLoadingStates] = useState<Record<string, boolean>>({});
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
  const [showFullArticle, setShowFullArticle] = useState(false);
  const [savedLocations, setSavedLocations] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [filteredLocations, setFilteredLocations] = useState<Location[]>(LOCATIONS);
  const scrollY = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Stagger animations for smooth entrance
    const animations = fadeIns.map((av, i) =>
      Animated.timing(av, {
        toValue: 1,
        duration: 600,
        delay: i * 150,
        useNativeDriver: true,
      })
    );
    Animated.stagger(100, animations).start();
  }, []);

  useEffect(() => {
    // Filter locations based on search query
    if (searchQuery.trim() === '') {
      setFilteredLocations(LOCATIONS);
    } else {
      const filtered = LOCATIONS.filter(location =>
        location.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        location.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        location.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase())) ||
        location.fullContent.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredLocations(filtered);
    }
  }, [searchQuery]);

  const openViewer = (images: any[], index: number) => {
    setViewerImages(images);
    setViewerIndex(index);
    setShowViewer(true);
  };

  const closeViewer = () => setShowViewer(false);
  
  const showNext = () => {
    if (viewerIndex < viewerImages.length - 1) {
      setViewerIndex(viewerIndex + 1);
    }
  };
  
  const showPrev = () => {
    if (viewerIndex > 0) {
      setViewerIndex(viewerIndex - 1);
    }
  };

  const handleImageLoad = (imageKey: string) => {
    setImageLoadingStates(prev => ({
      ...prev,
      [imageKey]: true
    }));
  };

  const handleShare = async (location: Location) => {
    try {
      const message = `Check out this amazing destination I found in Planit!: ${location.title}\n\n${location.description}\n\nBest time to visit: ${location.bestTime}\nDifficulty: ${location.difficulty}\n\nDownload Planit now to read! `;
      
      await Share.share({
        message,
        title: location.title,
      });
    } catch (error) {
      Alert.alert('Error', 'Unable to share at this time');
    }
  };

  const toggleSave = (locationId: string) => {
    setSavedLocations(prev => {
      const newSet = new Set(prev);
      if (newSet.has(locationId)) {
        newSet.delete(locationId);
      } else {
        newSet.add(locationId);
      }
      return newSet;
    });
  };

  const openFullArticle = (location: Location) => {
    setSelectedLocation(location);
    setShowFullArticle(true);
  };

  const closeFullArticle = () => {
    setShowFullArticle(false);
    setSelectedLocation(null);
  };

  const headerOpacity = scrollY.interpolate({
    inputRange: [0, 50],
    outputRange: [1, 0.9],
    extrapolate: 'clamp',
  });

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Enhanced Header with Parallax Effect */}
      <Animated.View style={[styles.stickyHeader, { paddingTop: insets.top, opacity: headerOpacity }]}>
        <TouchableOpacity style={styles.globalClose} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <View style={styles.headerTextWrap}>
          <Text style={styles.header}>Explore</Text>
          <Text style={styles.headerSubtitle}>Discover amazing destinations</Text>
        </View>
        <TouchableOpacity 
          style={[styles.searchButton, showSearch && styles.searchButtonActive]} 
          onPress={() => setShowSearch(!showSearch)}
        >
          <Ionicons name="search" size={20} color={showSearch ? "#007AFF" : "#666"} />
        </TouchableOpacity>
      </Animated.View>

      {/* Search Bar */}
      {showSearch && (
        <View style={[styles.searchContainer, { top: insets.top + 80 }]}>
          <View style={styles.searchInputContainer}>
            <Ionicons name="search" size={18} color="#666" />
            <TextInput
              style={styles.searchInput}
              placeholder="Search destinations, activities, or tags..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              autoFocus={true}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <Ionicons name="close-circle" size={18} color="#666" />
              </TouchableOpacity>
            )}
          </View>
        </View>
      )}

      <Animated.ScrollView
        contentContainerStyle={[styles.scroll, showSearch && { paddingTop: 180 }]}
        showsVerticalScrollIndicator={false}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false }
        )}
        scrollEventThrottle={16}
      >
        {/* Hero Section */}
        <View style={styles.heroSection}>
          <Text style={styles.heroTitle}>Featured Destinations</Text>
          <Text style={styles.heroSubtitle}>
            {filteredLocations.length === LOCATIONS.length 
              ? 'Handpicked locations for your next adventure'
              : `Found ${filteredLocations.length} destination${filteredLocations.length !== 1 ? 's' : ''}`}
          </Text>
        </View>

        {/* Location Cards */}
        {filteredLocations.map((location, idx) => {
          const opacity = fadeIns[idx] ?? new Animated.Value(1);
          const translateY = opacity.interpolate({ 
            inputRange: [0, 1], 
            outputRange: [30, 0] 
          });
          const isSaved = savedLocations.has(location.id);

          return (
            <Animated.View
              key={location.id}
              style={[
                styles.card,
                { 
                  opacity, 
                  transform: [{ translateY }] 
                }
              ]}
            >
              {/* Card Header */}
              <View style={styles.cardHeader}>
                <View style={styles.cardTitleContainer}>
                  <TouchableOpacity onPress={() => openFullArticle(location)}>
                    <Text style={styles.cardTitle}>{location.title}</Text>
                    <Text style={styles.readTime}>{location.readTime}</Text>
                    <View style={styles.locationInfo}>
                      <Ionicons name="location-outline" size={14} color="#666" />
                      <Text style={styles.locationText}>{location.location}</Text>
                    </View>
                  </TouchableOpacity>
                </View>
                <TouchableOpacity 
                  style={styles.bookmarkButton}
                  onPress={() => toggleSave(location.id)}
                >
                  <Ionicons 
                    name={isSaved ? "bookmark" : "bookmark-outline"} 
                    size={20} 
                    color={isSaved ? "#007AFF" : "#666"} 
                  />
                </TouchableOpacity>
              </View>

              {/* Tags */}
              <View style={styles.tagsContainer}>
                {location.tags.map((tag, tagIdx) => (
                  <View key={tagIdx} style={styles.tag}>
                    <Text style={styles.tagText}>{tag}</Text>
                  </View>
                ))}
                <View style={styles.difficultyTag}>
                  <Text style={styles.difficultyText}>{location.difficulty}</Text>
                </View>
              </View>

              {/* Hero Image with Loading State */}
              <TouchableOpacity 
                style={styles.heroImageContainer}
                onPress={() => openViewer(location.images, 0)}
                activeOpacity={0.9}
              >
                {!imageLoadingStates[`${location.id}-0`] && (
                  <View style={styles.imageLoader}>
                    <ActivityIndicator size="large" color="#007AFF" />
                  </View>
                )}
                <Image
                  source={location.images[0]}
                  style={[
                    styles.heroImage,
                    { opacity: imageLoadingStates[`${location.id}-0`] ? 1 : 0 }
                  ]}
                  onLoad={() => handleImageLoad(`${location.id}-0`)}
                  resizeMode="cover"
                />
                <View style={styles.imageOverlay}>
                  <View style={styles.imageCounter}>
                    <Ionicons name="images" size={16} color="#fff" />
                    <Text style={styles.imageCountText}>
                      1/{location.images.length}
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>

              {/* Description */}
              <TouchableOpacity style={styles.cardContent} onPress={() => openFullArticle(location)}>
                <Text style={styles.description}>{location.description}</Text>
                <Text style={styles.readMore}>Tap to read full article →</Text>
              </TouchableOpacity>

              {/* Thumbnail Strip */}
              <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false}
                style={styles.thumbnailStrip}
                contentContainerStyle={styles.thumbnailContainer}
              >
                {location.images.slice(1).map((image, imgIdx) => {
                  const imageKey = `${location.id}-${imgIdx + 1}`;
                  return (
                    <TouchableOpacity
                      key={imgIdx}
                      onPress={() => openViewer(location.images, imgIdx + 1)}
                      style={styles.thumbnailWrapper}
                    >
                      {!imageLoadingStates[imageKey] && (
                        <View style={styles.thumbnailLoader}>
                          <ActivityIndicator size="small" color="#007AFF" />
                        </View>
                      )}
                      <Image
                        source={image}
                        style={[
                          styles.thumbnail,
                          { opacity: imageLoadingStates[imageKey] ? 1 : 0 }
                        ]}
                        onLoad={() => handleImageLoad(imageKey)}
                        resizeMode="cover"
                      />
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>

              {/* Action Buttons */}
              <View style={styles.actionButtons}>
                <TouchableOpacity 
                  style={[styles.primaryButton, isSaved && styles.primaryButtonSaved]}
                  onPress={() => toggleSave(location.id)}
                >
                  <Ionicons 
                    name={isSaved ? "checkmark" : "location"} 
                    size={18} 
                    color="#fff" 
                  />
                  <Text style={styles.primaryButtonText}>
                    {isSaved ? 'Saved!' : 'Save Location'}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={styles.secondaryButton}
                  onPress={() => handleShare(location)}
                >
                  <Ionicons name="share-outline" size={18} color="#007AFF" />
                  <Text style={styles.secondaryButtonText}>Share</Text>
                </TouchableOpacity>
              </View>
            </Animated.View>
          );
        })}

        {/* No Results */}
        {filteredLocations.length === 0 && (
          <View style={styles.noResults}>
            <Ionicons name="search-outline" size={48} color="#ccc" />
            <Text style={styles.noResultsTitle}>No destinations found</Text>
            <Text style={styles.noResultsText}>
              Try searching for different keywords or clear your search
            </Text>
          </View>
        )}

        {/* Bottom Spacer */}
        <View style={styles.bottomSpacer} />
      </Animated.ScrollView>

      {/* Full Article Modal */}
      <Modal visible={showFullArticle} animationType="slide" onRequestClose={closeFullArticle}>
        <SafeAreaView style={styles.articleContainer}>
          {/* Article Header */}
          <View style={styles.articleHeader}>
            <TouchableOpacity style={styles.articleBack} onPress={closeFullArticle}>
              <Ionicons name="arrow-back" size={24} color="#333" />
            </TouchableOpacity>
            <View style={styles.articleHeaderInfo}>
              <Text style={styles.articleHeaderTitle}>Full Article</Text>
            </View>
            <TouchableOpacity 
              style={styles.articleSave}
              onPress={() => selectedLocation && handleShare(selectedLocation)}
            >
              <Ionicons name="share-outline" size={24} color="#333" />
            </TouchableOpacity>
          </View>

          {/* Article Content */}
          <ScrollView 
            style={styles.articleScrollView}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.articleContent}
          >
            {selectedLocation && (
              <>
                {/* Hero Section */}
                <View style={styles.articleHero}>
                  <Text style={styles.articleTitle}>{selectedLocation.title}</Text>
                  <View style={styles.articleMeta}>
                    <View style={styles.articleMetaItem}>
                      <Ionicons name="time-outline" size={16} color="#666" />
                      <Text style={styles.articleMetaText}>{selectedLocation.readTime}</Text>
                    </View>
                    <View style={styles.articleMetaItem}>
                      <Ionicons name="location-outline" size={16} color="#666" />
                      <Text style={styles.articleMetaText}>{selectedLocation.location}</Text>
                    </View>
                  </View>
                  <View style={styles.articleInfoRow}>
                    <View style={styles.articleInfoItem}>
                      <Text style={styles.articleInfoLabel}>Best Time</Text>
                      <Text style={styles.articleInfoValue}>{selectedLocation.bestTime}</Text>
                    </View>
                    <View style={styles.articleInfoItem}>
                      <Text style={styles.articleInfoLabel}>Difficulty</Text>
                      <Text style={styles.articleInfoValue}>{selectedLocation.difficulty}</Text>
                    </View>
                  </View>
                </View>

                {/* Article Body */}
                <View style={styles.articleBody}>
                  <Text style={styles.articleText}>{selectedLocation.fullContent}</Text>
                </View>

                {/* Article Footer */}
                <View style={styles.articleFooter}>
                  <TouchableOpacity 
                    style={[
                      styles.articleSaveButton, 
                      savedLocations.has(selectedLocation.id) && styles.articleSaveButtonSaved
                    ]}
                    onPress={() => toggleSave(selectedLocation.id)}
                  >
                    <Ionicons 
                      name={savedLocations.has(selectedLocation.id) ? "checkmark" : "bookmark-outline"} 
                      size={20} 
                      color="#fff" 
                    />
                    <Text style={styles.articleSaveButtonText}>
                      {savedLocations.has(selectedLocation.id) ? 'Saved!' : 'Save for Later'}
                    </Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </ScrollView>
        </SafeAreaView>
      </Modal>

      {/* Enhanced Image Viewer Modal */}
      <Modal visible={showViewer} transparent onRequestClose={closeViewer}>
        <View style={styles.viewerOverlay}>
          <SafeAreaView style={styles.viewerSafeArea}>
            {/* Viewer Header */}
            <View style={styles.viewerHeader}>
              <Text style={styles.viewerCounter}>
                {viewerIndex + 1} / {viewerImages.length}
              </Text>
              <TouchableOpacity style={styles.viewerClose} onPress={closeViewer}>
                <Ionicons name="close" size={24} color="#fff" />
              </TouchableOpacity>
            </View>

            {/* Main Image */}
            <View style={styles.viewerImageContainer}>
              <Image
                source={viewerImages[viewerIndex]}
                style={styles.viewerImage}
                resizeMode="contain"
              />
            </View>

            {/* Navigation Controls */}
            {viewerImages.length > 1 && (
              <View style={styles.viewerControls}>
                <TouchableOpacity
                  style={[styles.navButton, viewerIndex === 0 && styles.navButtonDisabled]}
                  onPress={showPrev}
                  disabled={viewerIndex === 0}
                >
                  <Ionicons 
                    name="chevron-back" 
                    size={24} 
                    color={viewerIndex === 0 ? "#666" : "#fff"} 
                  />
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={[styles.navButton, viewerIndex === viewerImages.length - 1 && styles.navButtonDisabled]}
                  onPress={showNext}
                  disabled={viewerIndex === viewerImages.length - 1}
                >
                  <Ionicons 
                    name="chevron-forward" 
                    size={24} 
                    color={viewerIndex === viewerImages.length - 1 ? "#666" : "#fff"} 
                  />
                </TouchableOpacity>
              </View>
            )}
          </SafeAreaView>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { 
    flex: 1, 
    backgroundColor: '#f8f9fa' 
  },
  stickyHeader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(255,255,255,0.95)',
    backdropFilter: 'blur(10px)',
    zIndex: 10,
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)',
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 16,
  },
  headerTextWrap: { 
    flex: 1 
  },
  header: { 
    fontSize: 28, 
    fontWeight: '800', 
    color: '#1a1a1a',
    letterSpacing: -0.5,
  },
  headerSubtitle: { 
    fontSize: 15, 
    color: '#666', 
    marginTop: 2,
    fontWeight: '500',
  },
  globalClose: { 
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.05)',
  },
  searchButton: {
    padding: 10,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.05)',
  },
  searchButtonActive: {
    backgroundColor: 'rgba(0,122,255,0.1)',
  },
  searchContainer: {
    position: 'absolute',
    left: 20,
    right: 20,
    zIndex: 9,
    backgroundColor: '#fff',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  scroll: { 
    paddingTop: 120, 
    paddingBottom: 40, 
    paddingHorizontal: 20 
  },
  heroSection: {
    marginBottom: 32,
    alignItems: 'center',
  },
  heroTitle: {
    fontSize: 32,
    fontWeight: '900',
    color: '#1a1a1a',
    textAlign: 'center',
    marginBottom: 8,
    letterSpacing: -1,
  },
  heroSubtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    fontWeight: '500',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 24,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 24,
    elevation: 8,
    overflow: 'hidden',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: 20,
    paddingBottom: 16,
  },
  cardTitleContainer: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#1a1a1a',
    marginBottom: 4,
    letterSpacing: -0.5,
  },
  readTime: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  locationInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    gap: 4,
  },
  locationText: {
    fontSize: 13,
    color: '#666',
    fontWeight: '500',
  },
  bookmarkButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: '#f5f5f5',
  },
  tagsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 16,
    flexWrap: 'wrap',
    gap: 8,
  },
  tag: {
    backgroundColor: '#e3f2fd',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  tagText: {
    fontSize: 12,
    color: '#1976d2',
    fontWeight: '600',
  },
  difficultyTag: {
    backgroundColor: '#e8f5e8',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  difficultyText: {
    fontSize: 12,
    color: '#2e7d32',
    fontWeight: '600',
  },
  heroImageContainer: {
    position: 'relative',
    height: 240,
    marginHorizontal: 20,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#f5f5f5',
  },
  imageLoader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    zIndex: 1,
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  imageOverlay: {
    position: 'absolute',
    top: 12,
    right: 12,
  },
  imageCounter: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 4,
  },
  imageCountText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  cardContent: {
    padding: 20,
    paddingTop: 16,
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    color: '#444',
    fontWeight: '400',
  },
  readMore: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '600',
    marginTop: 8,
  },
  thumbnailStrip: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  thumbnailContainer: {
    gap: 12,
  },
  thumbnailWrapper: {
    width: 80,
    height: 80,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#f5f5f5',
    position: 'relative',
  },
  thumbnailLoader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  thumbnail: {
    width: '100%',
    height: '100%',
  },
  actionButtons: {
    flexDirection: 'row',
    padding: 20,
    paddingTop: 0,
    gap: 12,
  },
  primaryButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#007AFF',
    paddingVertical: 14,
    borderRadius: 16,
    gap: 6,
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  primaryButtonSaved: {
    backgroundColor: '#34c759',
  },
  secondaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: '#007AFF',
    gap: 6,
  },
  secondaryButtonText: {
    color: '#007AFF',
    fontSize: 16,
    fontWeight: '600',
  },
  bottomSpacer: {
    height: 40,
  },
  noResults: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  noResultsTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    marginTop: 16,
    marginBottom: 8,
  },
  noResultsText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    paddingHorizontal: 40,
  },
  // Article Modal Styles
  articleContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  articleHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    gap: 16,
  },
  articleBack: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.05)',
  },
  articleHeaderInfo: {
    flex: 1,
  },
  articleHeaderTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  articleSave: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.05)',
  },
  articleScrollView: {
    flex: 1,
  },
  articleContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  articleHero: {
    paddingVertical: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    marginBottom: 24,
  },
  articleTitle: {
    fontSize: 32,
    fontWeight: '900',
    color: '#1a1a1a',
    marginBottom: 16,
    lineHeight: 40,
    letterSpacing: -1,
  },
  articleMeta: {
    flexDirection: 'row',
    gap: 20,
    marginBottom: 16,
  },
  articleMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  articleMetaText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  articleInfoRow: {
    flexDirection: 'row',
    gap: 32,
  },
  articleInfoItem: {
    flex: 1,
  },
  articleInfoLabel: {
    fontSize: 12,
    color: '#666',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 4,
  },
  articleInfoValue: {
    fontSize: 16,
    color: '#333',
    fontWeight: '600',
  },
  articleBody: {
    marginBottom: 32,
  },
  articleText: {
    fontSize: 17,
    lineHeight: 28,
    color: '#333',
    fontWeight: '400',
  },
  articleFooter: {
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingTop: 24,
  },
  articleSaveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#007AFF',
    paddingVertical: 16,
    borderRadius: 16,
    gap: 8,
  },
  articleSaveButtonSaved: {
    backgroundColor: '#34c759',
  },
  articleSaveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  // Viewer Styles
  viewerOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.95)',
  },
  viewerSafeArea: {
    flex: 1,
  },
  viewerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  viewerCounter: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  viewerClose: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  viewerImageContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  viewerImage: {
    width: width,
    height: height * 0.7,
  },
  viewerControls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  navButton: {
    padding: 12,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  navButtonDisabled: {
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
});