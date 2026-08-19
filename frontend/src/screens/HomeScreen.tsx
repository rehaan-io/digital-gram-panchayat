import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  ImageBackground,
  RefreshControl,
  Animated,
  Dimensions,
  Easing,
  Modal,
  TextInput,
  Alert,
  Image,
  Platform
} from 'react-native';
import { useAuth, API_BASE_URL } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { COLORS } from '../styles/theme';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

interface HomepageSection {
  key: string;
  title: string;
  content: string;
}

const SECTION_META: Record<string, { icon: any; color: string; lightColor: string }> = {
  about:            { icon: 'information-circle', color: '#820263', lightColor: '#F3EBF0' },
  water_supply:     { icon: 'water',             color: '#2E294E', lightColor: '#EAEAEA' },
  street_lights:    { icon: 'sunny',             color: '#FFD400', lightColor: '#FFFDF0' },
  tax_revenue:      { icon: 'wallet',            color: '#D90368', lightColor: '#FDF2F7' },
  health:           { icon: 'medical',           color: '#2E294E', lightColor: '#EAEAEA' },
  education:        { icon: 'book',              color: '#820263', lightColor: '#F3EBF0' },
  emergency_contacts: { icon: 'call',            color: '#D90368', lightColor: '#FDF2F7' },
  pensions:         { icon: 'cash',              color: '#820263', lightColor: '#F3EBF0' },
  pension_records:  { icon: 'card',              color: '#D90368', lightColor: '#FDF2F7' },
  anganwadi:        { icon: 'rose',              color: '#D90368', lightColor: '#FDF2F7' },
  mgnregs:          { icon: 'hammer',            color: '#FFD400', lightColor: '#FFFDF0' },
  horticulture:     { icon: 'flower',            color: '#2E294E', lightColor: '#EAEAEA' },
  animal_husbandry: { icon: 'paw',               color: '#820263', lightColor: '#F3EBF0' },
  shg_vo:           { icon: 'people-circle',     color: '#2E294E', lightColor: '#EAEAEA' },
  community_assets: { icon: 'home',              color: '#D90368', lightColor: '#FDF2F7' },
};

const officialImages: Record<string, any> = {
  'Guruswamy.jpg': require('../../assets/Guruswamy.jpg'),
  'G_Sai_Charan.jpg': require('../../assets/G_Sai_Charan.jpg'),
  'Sai_Sanjay.jpg': require('../../assets/Sai_Sanjay.jpg'),
  'Y_Samatha.jpg': require('../../assets/Y_Samatha.jpg'),
  'B_Haseena_Begum.png': require('../../assets/B_Haseena_Begum.png'),
  'B_Sudhakar.png': require('../../assets/B_Sudhakar.png'),
  'Kamala_Bai.jpg': require('../../assets/Kamala_Bai.jpg'),
  'savitha.jpg': require('../../assets/savitha.jpg'),
};

const HONOUR_OFFICIALS = [
  {
    id: 'h1',
    name: 'Sri N. Chandrababu Naidu',
    nameTe: 'శ్రీ ఎన్. చంద్రబాబు నాయుడు',
    designation: 'Chief Minister',
    designationTe: 'ముఖ్యమంత్రి',
    location: 'Amaravati, AP',
    locationTe: 'అమరావతి, ఏ.పి.',
    image: require('../../assets/chandrababu_naidu.jpg'),
  },
  {
    id: 'h2',
    name: 'Sri K. Pawan Kalyan',
    nameTe: 'శ్రీ కె. పవన్ కళ్యాణ్',
    designation: 'Deputy Chief Minister',
    designationTe: 'ఉప ముఖ్యమంత్రి',
    location: 'Amaravati, AP',
    locationTe: 'అమరావతి, ఏ.పి.',
    image: require('../../assets/pawan_kalyan.jpg'),
  },
  {
    id: 'h4',
    name: 'Srimati S. Savitha',
    nameTe: 'శ్రీమతి ఎస్. సవిత',
    designation: 'Minister BC & EWS Welfare, Handlooms & Textiles',
    designationTe: 'బి.సి., ఈ.డబ్ల్యూ.ఎస్. సంక్షేమ, చేనేత & జౌళి శాఖ మంత్రి',
    location: 'Amaravati, AP',
    locationTe: 'అమరావతి, ఏ.పి.',
    image: require('../../assets/savitha.jpg'),
  },
  {
    id: 'h6',
    name: 'Sri BK Paartha Saaradi',
    nameTe: 'శ్రీ బి.కె. పార్థ సారథి',
    designation: 'Member of Parliament, Hindupuram',
    designationTe: 'హిందూపురం పార్లమెంట్ సభ్యులు',
    location: 'Hindupuram, AP',
    locationTe: 'హిందూపురం, ఏ.పి.',
    image: require('../../assets/BK_Paartha_Saaradi.jpg'),
  },
  {
    id: 'h3',
    name: 'Sri Krishna Teja, IAS',
    nameTe: 'శ్రీ కృష్ణ తేజ, ఐ.ఏ.ఎస్.',
    designation: 'PR & Rural Dev Commissioner',
    designationTe: 'పంచాయితీ రాజ్ & గ్రామీణాభివృద్ధి కమిషనర్',
    location: 'Amaravati, AP',
    locationTe: 'అమరావతి, ఏ.పి.',
    image: require('../../assets/krishna_teja.jpg'),
  },
  {
    id: 'h5',
    name: 'Sri A. Shyam Prasad, IAS',
    nameTe: 'శ్రీ ఎ. శ్యామ్ ప్రసాద్, ఐ.ఏ.ఎస్.',
    designation: 'District Collector, Sri Sathya Sai District',
    designationTe: 'జిల్లా కలెక్టర్, శ్రీ సత్యసాయి జిల్లా',
    location: 'Sri Sathya Sai, AP',
    locationTe: 'శ్రీ సత్యసాయి, ఏ.పి.',
    image: require('../../assets/A_Shyam_Prasad.jpg'),
  }
];

const MAP_DATA = [
  {
    id: 'm1',
    title: 'Gorantla Mandal Map',
    titleTe: 'గోరంట్ల మండల పటం',
    image: require('../../assets/village_map.png')
  },
  {
    id: 'm2',
    title: 'Gorantla Village Map',
    titleTe: 'గోరంట్ల గ్రామ పటం',
    image: require('../../assets/gorantla_village_map.jpg')
  }
];

// Custom Staggered Scaling Pressable Card
const AnimatedCategoryCard: React.FC<{
  item: HomepageSection;
  index: number;
  onPress: () => void;
  userRole?: string;
  getSummary: (text: string) => string;
}> = ({ item, index, onPress, userRole, getSummary }) => {
  const { language, t } = useLanguage();
  const scale = useRef(new Animated.Value(1)).current;
  const slideY = useRef(new Animated.Value(40)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 400,
        delay: Math.min(index * 80, 800),
        useNativeDriver: true,
      }),
      Animated.spring(slideY, {
        toValue: 0,
        friction: 7,
        tension: 35,
        delay: Math.min(index * 80, 800),
        useNativeDriver: true,
      }),
    ]).start();
  }, [item.key]);

  const handlePressIn = () => {
    Animated.spring(scale, {
      toValue: 0.96,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scale, {
      toValue: 1,
      friction: 4,
      tension: 45,
      useNativeDriver: true,
    }).start();
  };

  const getLocalSectionTitle = (key: string, defaultTitle: string) => {
    switch (key) {
      case 'about': return t('aboutPanchayat');
      case 'water_supply': return t('waterSupply');
      case 'street_lights': return t('streetLights');
      case 'health': return t('healthSanitation');
      case 'education': return t('educationLiteracy');
      case 'agriculture': return t('agricultureLivestock');
      case 'pensions': return t('pensionSchemes');
      case 'pension_records': return language === 'te' ? 'పెన్షన్ లబ్ధిదారుల జాబితా' : 'Pension Beneficiaries';
      case 'tax_revenue': return t('taxRevenue');
      case 'anganwadi': return t('anganwadiServices');
      case 'mgnregs': return t('mgnregsWorks');
      case 'horticulture': return t('horticultureSector');
      case 'animal_husbandry': return t('animalHusbandry');
      case 'shg_vo': return t('shgVoGroups');
      case 'community_assets': return t('communityAssets');
      default: return defaultTitle;
    }
  };

  const getLocalSectionContent = (key: string, defaultContent: string) => {
    if (language === 'en') return defaultContent;
    switch (key) {
      case 'about': return 'గ్రామ పంచాయతీ పోర్టల్‌కు స్వాగతం. గ్రామ అభివృద్ధి మరియు పారదర్శక సేవలే మా లక్ష్యం.';
      case 'water_supply': return 'గ్రామంలోని ఇళ్లకు రక్షిత మంచినీటి సరఫరా మరియు నీటి నాణ్యత తనిఖీల వివరాలు.';
      case 'street_lights': return 'వీధి దీపాల నిర్వహణ మరియు కొత్త ఎల్‌ఈడీ బల్బుల ఏర్పాటు వివరాలు.';
      case 'health': return 'ప్రాథమిక ఆరోగ్య కేంద్రం సేవలు, ఉచిత వైద్య శిబిరాలు మరియు ఆరోగ్య సిబ్బంది వివరాలు.';
      case 'education': return 'గ్రామ పాఠశాలలు, కంప్యూటర్ ల్యాబ్‌లు మరియు మధ్యాహ్న భోజన పథకం వివరాలు.';
      case 'agriculture': return 'రైతు భరోసా, సాయిల్ కార్డ్ విశ్లేషణలు మరియు విత్తనాల పంపిణీ వివరాలు.';
      case 'pensions': return 'వృద్ధాప్య, వితంతు మరియు వికలాంగుల పింఛన్ల పంపిణీ వివరాలు.';
      case 'pension_records': return 'గోరంట్ల గ్రామ పంచాయతీకి సంబంధించిన పెన్షన్ లబ్ధిదారుల పూర్తి జాబితా, పథకాలు మరియు మొత్తాలు.';
      case 'tax_revenue': return 'గ్రామ పన్ను వసూళ్లు మరియు ప్రభుత్వ నిధుల కేటాయింపుల వివరాలు.';
      case 'anganwadi': return 'చిన్నారులకు పౌష్టికాహారం మరియు అంగన్‌వాడీ కేంద్రాల పర్యవేక్షణ వివరాలు.';
      case 'mgnregs': return 'ఉపాధి హామీ పథకం పనులు మరియు గ్రామ ఉపాధి కార్డుల వివరాలు.';
      case 'horticulture': return 'పండ్ల తోటలు, పూల సాగు మరియు ప్రభుత్వ రాయితీల వివరాలు.';
      case 'animal_husbandry': return 'పశువుల ఉచిత టీకాలు, భీమా మరియు గోకులం ప్రాజెక్ట్ వివరాలు.';
      case 'shg_vo': return 'స్వయం సహాయక సంఘాలు (SHG) మరియు మహిళా పొదుపు సంఘాల వివరాలు.';
      case 'community_assets': return 'గ్రంధాలయం, కమ్యూనిటీ హాళ్లు మరియు కమ్యూనిటీ ఆస్తుల వివరాలు.';
      default: return defaultContent;
    }
  };

  const meta = SECTION_META[item.key] || { icon: 'cube', color: '#820263', lightColor: '#F3EBF0' };

  return (
    <Animated.View style={{ opacity, transform: [{ translateY: slideY }, { scale }], width: '100%' }}>
      <TouchableOpacity
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={0.9}
        style={[styles.cardOuter, { borderLeftColor: meta.color }]}
      >
        <ImageBackground
          source={require('../../assets/prism_pattern.png')}
          style={styles.cardBgPattern}
          imageStyle={{ opacity: 0.05, resizeMode: 'cover' }}
        >
          <View style={styles.cardInner}>
            <View style={[styles.wideCardIcon, { backgroundColor: meta.lightColor }]}>
              <Ionicons name={meta.icon} size={24} color={meta.color} />
            </View>

            <View style={styles.wideCardText}>
              <View style={styles.wideCardTitleRow}>
                <Text style={styles.wideCardTitle}>{getLocalSectionTitle(item.key, item.title)}</Text>
                {userRole === 'ADMIN' && (
                  <View style={styles.editBadge}>
                    <Text style={styles.editBadgeText}>Manage</Text>
                  </View>
                )}
              </View>
              <Text style={styles.wideCardDesc}>{getSummary(getLocalSectionContent(item.key, item.content))}</Text>
            </View>

            <Ionicons name="chevron-forward" size={18} color="#D2C4C0" style={{ alignSelf: 'center' }} />
          </View>
        </ImageBackground>
      </TouchableOpacity>
    </Animated.View>
  );
};

// --- Marquee Animation Component ---
const MarqueeBanner = React.memo(({ language, newsEn, newsTe }: { language: string, newsEn?: string, newsTe?: string }) => {
  const scrollX = useRef(new Animated.Value(width)).current;
  
  // No complex padding needed, the fixed width creates the gap naturally
  const defaultEn = "🚨 All citizens are kindly requested to pay their electricity, water, and all other applicable bills and taxes on time. Thank you for your cooperation.";
  const defaultTe = "🚨 పౌరులందరూ తమ విద్యుత్, నీరు మరియు ఇతర అన్ని రకాల పన్నులు మరియు బిల్లులను సకాలంలో చెల్లించవలసిందిగా కోరుచున్నాము. మీ సహకారానికి ధన్యవాదాలు.";
  const enText = newsEn || defaultEn;
  const teText = newsTe || defaultTe;
  const displayStr = language === 'te' ? teText : enText;

  useEffect(() => {
    // Reset position instantly
    scrollX.setValue(width);
    
    // Hardcode a safe maximum width that fits both strings (provides a nice gap at the end)
    const fixedTextWidth = 1600; 
    const distance = width + fixedTextWidth;
    const duration = (distance / 60) * 1000; // ~60 pixels per second

    const anim = Animated.loop(
      Animated.timing(scrollX, {
        toValue: -fixedTextWidth, // Scroll exactly until the end
        duration: duration,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    );
    anim.start();
    
    return () => anim.stop();
  }, [language, width]); // Automatically restarts cleanly on language toggle

  return (
    <View style={styles.marqueeContainer}>
      <Animated.View style={{ 
        position: 'absolute', 
        left: 0, 
        width: 1600, // Lock the width, preventing any layout clipping
        height: '100%', 
        justifyContent: 'center',
        transform: [{ translateX: scrollX }] 
      }}>
        <Text style={styles.marqueeText}>
          {displayStr}
        </Text>
      </Animated.View>

      {/* Top Left Corner */}
      <View style={{ position: 'absolute', top: 2, left: 2, width: 20, height: 20, borderTopWidth: 2, borderLeftWidth: 2, borderColor: '#FFD400', borderTopLeftRadius: 5 }} />
      {/* Bottom Left Corner */}
      <View style={{ position: 'absolute', bottom: 2, left: 2, width: 20, height: 20, borderBottomWidth: 2, borderLeftWidth: 2, borderColor: '#FFD400', borderBottomLeftRadius: 5 }} />
      {/* Top Right Corner */}
      <View style={{ position: 'absolute', top: 2, right: 2, width: 20, height: 20, borderTopWidth: 2, borderRightWidth: 2, borderColor: '#FFD400', borderTopRightRadius: 5 }} />
      {/* Bottom Right Corner */}
      <View style={{ position: 'absolute', bottom: 2, right: 2, width: 20, height: 20, borderBottomWidth: 2, borderRightWidth: 2, borderColor: '#FFD400', borderBottomRightRadius: 5 }} />
    </View>
  );
});

// --- Curved Animated Logo Component ---
const CurvedLogo = React.memo(({ language }: { language: string }) => {
  const sweepAnim = useRef(new Animated.Value(-180)).current;

  useEffect(() => {
    setTimeout(() => {
      Animated.timing(sweepAnim, {
        toValue: 180,
        duration: 2500,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }).start();
    }, 400);
  }, []);

  const enText = 'GORANTLA GRAMA PANCHAYATI '.split(''); // Space at end is the gap
  const teText = ['గో', 'రం', 'ట్ల', ' ', 'గ్రా', 'మ', ' ', 'పం', 'చా', 'య', 'తీ', ' '];
  
  const chars = language === 'te' ? teText : enText;
  const radius = 105; 
  const containerSize = radius * 2 + 30; 
  
  const stepAngle = 360 / chars.length;
  // Calculate start angle so the final padded space is exactly at 180 degrees (bottom center).
  // This perfectly centers the text string over the top of the circle.
  const startAngle = 180 - (chars.length - 1) * stepAngle; 

  return (
    <View style={{ alignItems: 'center', justifyContent: 'center', marginTop: 10, marginBottom: 10, height: containerSize, width: '100%' }}>
      
      {/* Background Glowing Halo */}
      <View style={{
        position: 'absolute',
        width: 140,
        height: 140,
        borderRadius: 70,
        backgroundColor: 'rgba(255, 212, 0, 0.15)',
        shadowColor: '#FFD400',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.5,
        shadowRadius: 20,
      }} />

      {/* Central Logo Image */}
      <Animated.Image 
        source={require('../../assets/community_logo.png')} 
        style={{ 
          width: 95, 
          height: 95, 
          resizeMode: 'contain', 
          position: 'absolute',
          shadowColor: '#820263',
          shadowOffset: { width: 0, height: 6 },
          shadowOpacity: 0.3,
          shadowRadius: 10,
          opacity: sweepAnim.interpolate({ inputRange: [-90, 90], outputRange: [0, 1], extrapolate: 'clamp' }),
          transform: [{
            scale: sweepAnim.interpolate({ inputRange: [-90, 90], outputRange: [0.7, 1], extrapolate: 'clamp' })
          }]
        }} 
      />

      {/* Sweeping Arc Text Container */}
      <View style={{ width: radius * 2, height: radius * 2, position: 'absolute' }}>
        
        {/* Full 360 Constellation Track */}
        <View style={{
          position: 'absolute',
          width: '100%',
          height: '100%',
          borderRadius: radius,
          borderWidth: 1.5,
          borderColor: 'rgba(130, 2, 99, 0.15)',
          borderStyle: 'dashed',
        }} />

        {chars.map((char, index) => {
          const rot = startAngle + index * stepAngle;
          
          const opacity = sweepAnim.interpolate({
            inputRange: [rot - 40, rot],
            outputRange: [0, 1],
            extrapolate: 'clamp'
          });
          const scale = sweepAnim.interpolate({
            inputRange: [rot - 40, rot, rot + 40],
            outputRange: [0.3, 1.3, 1],
            extrapolate: 'clamp'
          });

          return (
            <View key={index} style={{
              position: 'absolute',
              width: '100%',
              height: '100%',
              alignItems: 'center',
              transform: [{ rotate: `${rot}deg` }]
            }}>
              <Animated.Text style={{ 
                fontSize: language === 'te' ? 26 : 20, 
                fontWeight: '900', 
                color: '#820263', 
                opacity,
                transform: [{ scale }],
                textShadowColor: 'rgba(255, 212, 0, 0.6)',
                textShadowOffset: { width: 0, height: 2 },
                textShadowRadius: 4,
              }}>
                {char}
              </Animated.Text>
            </View>
          );
        })}

        {/* The 360 Shooting Star/Swoosh */}
        <Animated.View style={{
          position: 'absolute',
          width: '100%',
          height: '100%',
          alignItems: 'center',
          transform: [{ 
            rotate: sweepAnim.interpolate({
              inputRange: [-180, 180],
              outputRange: ['-180deg', '180deg']
            })
          }]
        }}>
          <Animated.View style={{
            width: 10,
            height: 10,
            backgroundColor: '#FFD400',
            borderRadius: 5,
            top: -5,
            shadowColor: '#FFD400',
            shadowOpacity: 1,
            shadowRadius: 10,
            elevation: 5,
            opacity: sweepAnim.interpolate({
              inputRange: [-180, -160, 160, 180],
              outputRange: [0, 1, 1, 0],
              extrapolate: 'clamp'
            })
          }} />
        </Animated.View>
      </View>
    </View>
  );
});

const HomeScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { user, token } = useAuth();
  const { t, language } = useLanguage();
  const [sections, setSections] = useState<HomepageSection[]>([]);
  const [officials, setOfficials] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeSlide, setActiveSlide] = useState(0);
  const [activeOfficialSlide, setActiveOfficialSlide] = useState(0);
  const [activeHonourSlide, setActiveHonourSlide] = useState(0);
  const [activeMapSlide, setActiveMapSlide] = useState(0);
  const officialScrollViewRef = useRef<ScrollView>(null);
  const honourScrollViewRef = useRef<ScrollView>(null);
  const mapScrollViewRef = useRef<ScrollView>(null);
  const [isMapExpanded, setIsMapExpanded] = useState(false);

  // Card creation states
  const [showAddCardModal, setShowAddCardModal] = useState(false);
  const [newCardTitle, setNewCardTitle] = useState('');
  const [newCardKey, setNewCardKey] = useState('');
  const [newCardDesc, setNewCardDesc] = useState('');
  const [isAddingCard, setIsAddingCard] = useState(false);

  // Broadcast News states
  const [latestAnnouncement, setLatestAnnouncement] = useState<{ content: string; contentTe: string } | null>(null);
  const [showAddNewsModal, setShowAddNewsModal] = useState(false);
  const [newNewsTitleEn, setNewNewsTitleEn] = useState('');
  const [newNewsContentEn, setNewNewsContentEn] = useState('');
  const [newNewsTitleTe, setNewNewsTitleTe] = useState('');
  const [newNewsContentTe, setNewNewsContentTe] = useState('');
  const [isAddingNews, setIsAddingNews] = useState(false);

  // Hero banner animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(24)).current;

  const fetchAnnouncements = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/homepage/announcements/list`);
      if (response.ok) {
        const data = await response.json();
        if (data.length > 0) {
          setLatestAnnouncement(data[0]);
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 600, easing: Easing.out(Easing.quad), useNativeDriver: true }),
    ]).start();
    fetchSections();
    fetchOfficials();
    fetchAnnouncements();
  }, []);

  const sortOrder = ['Srimati Y.Samatha', 'Srimati Kamala Bai', 'U. Guruswamy', 'Sai Sanjay', 'Srimati B.Haseena Begum', 'G. Sai Charan', 'B.Sudhakar'];
  const getSortIndex = (name: string) => {
    const normalized = name.replace(/\s+/g, '').toLowerCase();
    const idx = sortOrder.findIndex(item => item.replace(/\s+/g, '').toLowerCase() === normalized);
    return idx === -1 ? 999 : idx;
  };
  const photoOfficials = officials.filter((o) => !!o.photo).sort((a, b) => getSortIndex(a.name) - getSortIndex(b.name));

  useEffect(() => {
    if (photoOfficials.length > 0) {
      const interval = setInterval(() => {
        const nextSlide = (activeOfficialSlide + 1) % photoOfficials.length;
        officialScrollViewRef.current?.scrollTo({ x: nextSlide * (width - 32), animated: true });
      }, 6000);
      return () => clearInterval(interval);
    }
  }, [photoOfficials.length, activeOfficialSlide]);

  useEffect(() => {
    const interval = setInterval(() => {
      const nextSlide = (activeHonourSlide + 1) % HONOUR_OFFICIALS.length;
      honourScrollViewRef.current?.scrollTo({ x: nextSlide * (width - 32), animated: true });
    }, 3500);
    return () => clearInterval(interval);
  }, [activeHonourSlide]);

  useEffect(() => {
    const interval = setInterval(() => {
      const nextSlide = (activeMapSlide + 1) % MAP_DATA.length;
      mapScrollViewRef.current?.scrollTo({ x: nextSlide * (width - 64), animated: true });
    }, 4500);
    return () => clearInterval(interval);
  }, [activeMapSlide]);

  const fetchSections = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/homepage`);
      if (!response.ok) throw new Error('Failed to load homepage sections.');
      const data = await response.json();
      setSections(Array.isArray(data) ? data : []);
    } catch (error: any) {
      console.error(error);
      setSections([]);
      Alert.alert('Load Error', 'Could not fetch latest homepage information.');
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  const fetchOfficials = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/modules/officials`);
      if (response.ok) {
        const data = await response.json();
        setOfficials(data);
      }
    } catch (error) {
      console.log('Failed to fetch officials:', error);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchSections();
    fetchOfficials();
  };

  const handleAddCard = async () => {
    if (!newCardTitle.trim() || !newCardKey.trim() || !newCardDesc.trim()) {
      Alert.alert('Validation Error', 'All fields are required.');
      return;
    }
    setIsAddingCard(true);
    try {
      const response = await fetch(`${API_BASE_URL}/modules/cards`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          key: newCardKey,
          title: newCardTitle,
          content: newCardDesc
        })
      });
      const data = await response.json();
      if (response.ok) {
        Alert.alert('Success', 'New info category card created!');
        setShowAddCardModal(false);
        setNewCardTitle('');
        setNewCardKey('');
        setNewCardDesc('');
        fetchSections();
      } else {
        throw new Error(data.message || 'Failed to create card.');
      }
    } catch (error: any) {
      Alert.alert('Error', error.message);
    } finally {
      setIsAddingCard(false);
    }
  };

  const handleAddNews = async () => {
    if (!newNewsTitleEn.trim() || !newNewsContentEn.trim()) {
      Alert.alert('Validation Error', 'English title and content are required.');
      return;
    }
    setIsAddingNews(true);
    try {
      const response = await fetch(`${API_BASE_URL}/homepage/announcements`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          title: newNewsTitleEn,
          content: newNewsContentEn,
          titleTe: newNewsTitleTe,
          contentTe: newNewsContentTe
        })
      });
      if (response.ok) {
        Alert.alert('Success', 'Broadcast News published!');
        setShowAddNewsModal(false);
        setNewNewsTitleEn('');
        setNewNewsContentEn('');
        setNewNewsTitleTe('');
        setNewNewsContentTe('');
        fetchAnnouncements();
      } else {
        const data = await response.json();
        throw new Error(data.message || 'Failed to publish news.');
      }
    } catch (error: any) {
      Alert.alert('Error', error.message);
    } finally {
      setIsAddingNews(false);
    }
  };

  const getSummary = (text: string) =>
    text.length > 110 ? text.substring(0, 107) + '...' : text;

  const handleScroll = (event: any) => {
    const slideSize = event.nativeEvent.layoutMeasurement.width;
    const index = Math.round(event.nativeEvent.contentOffset.x / slideSize);
    setActiveSlide(index);
  };

  return (
    <View style={styles.container}>
      <MarqueeBanner 
        language={language} 
        newsEn={latestAnnouncement?.content}
        newsTe={latestAnnouncement?.contentTe}
      />
      {/* Role-based quick-access strip */}
      {(user?.role === 'ADMIN' || user?.role === 'EMPLOYEE') && (
        <View style={styles.roleBannerStrip}>
          <Text style={styles.roleBannerText}>
            {user?.role === 'ADMIN' ? '⚙️  Admin Dashboard Mode' : '👷 Staff Dashboard Mode'}
          </Text>
          <View style={{ flexDirection: 'row', gap: 8 }}>
            {user?.role === 'ADMIN' && (
              <TouchableOpacity
                onPress={() => setShowAddNewsModal(true)}
                style={[styles.roleBannerBtn, { backgroundColor: '#4A90E2' }]}
              >
                <Text style={styles.roleBannerBtnText}>Broadcast News</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity
              onPress={() =>
                navigation.navigate(user?.role === 'ADMIN' ? 'AdminTabs' : 'EmployeeTabs')
              }
              style={styles.roleBannerBtn}
            >
              <Text style={styles.roleBannerBtnText}>Open Panel</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} colors={[COLORS.primary]} />}
          showsVerticalScrollIndicator={false}
        >
          {/* Animated Curved Text & Static Logo */}
          <CurvedLogo language={language} />

          {/* STATE HONOUR CAROUSEL */}
          <View style={styles.honourHeaderContainer}>
            <View style={styles.honourTabBadge}>
              <Text style={styles.honourSectionHeader}>{language === 'te' ? 'గౌరవనీయులైన' : 'HONOURING'}</Text>
            </View>
          </View>
          <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }], marginBottom: 16 }}>
            <ScrollView
              ref={honourScrollViewRef}
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              style={styles.honourCarousel}
              onScroll={(e) => {
                const slideSize = e.nativeEvent.layoutMeasurement.width;
                const index = Math.round(e.nativeEvent.contentOffset.x / slideSize);
                setActiveHonourSlide(index);
              }}
              scrollEventThrottle={16}
            >
              {HONOUR_OFFICIALS.map((official) => (
                <View key={official.id} style={styles.honourSlide}>
                  <View style={styles.honourCardOuter}>
                    <Image source={official.image} style={styles.honourImage} resizeMode="cover" />
                    <View style={styles.honourInfo}>
                      <Text style={styles.honourName}>{language === 'te' ? official.nameTe : official.name}</Text>
                      <View style={styles.honourDesignationBadge}>
                        <Text style={styles.honourDesignationText}>{language === 'te' ? official.designationTe : official.designation}</Text>
                      </View>
                      
                      <View style={styles.honourLocationRow}>
                        <Ionicons name="location" size={14} color="#4A90E2" />
                        <Text style={styles.honourLocationText}>{language === 'te' ? official.locationTe : official.location}</Text>
                      </View>
                    </View>
                  </View>
                </View>
              ))}
            </ScrollView>
          </Animated.View>

          {/* HORIZONTAL SWIPING CAROUSEL (Citizen Only) */}
          {user?.role === 'CITIZEN' && (
            <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }], marginBottom: 20 }}>
              <ScrollView
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                onScroll={handleScroll}
                scrollEventThrottle={16}
                style={styles.carouselContainer}
              >
                {/* Slide 1: General GP Intro */}
                <ImageBackground
                  source={require('../../assets/prism_banner.png')}
                  style={styles.carouselSlide}
                  imageStyle={{ borderRadius: 20 }}
                >
                  <View style={styles.slideOverlay}>
                    <View style={styles.slideHeader}>
                       <Ionicons name="apps" size={20} color="#FFD400" />
                       <Text style={styles.slideLabel}>{t('welcomeHome')}</Text>
                    </View>
                    <Text style={styles.slideTitle}>{t('hubTitle')}</Text>
                    <Text style={styles.slideSubtitle}>
                      {t('hubSub')}
                    </Text>
                    <TouchableOpacity
                      style={styles.slideBtn}
                      onPress={() => navigation.navigate('FileComplaint')}
                      activeOpacity={0.8}
                    >
                      <Ionicons name="add-circle" size={16} color="#2E294E" />
                      <Text style={styles.slideBtnText}>{t('raiseTicketTitle')}</Text>
                    </TouchableOpacity>
                  </View>
                </ImageBackground>

                {/* Slide 2: Demographics Visualization */}
                <View style={[styles.carouselSlide, styles.statsSlide]}>
                  <View style={styles.slideOverlayDark}>
                    <View style={styles.slideHeader}>
                      <Ionicons name="analytics" size={20} color="#FFD400" />
                      <Text style={styles.slideLabel}>{language === 'te' ? 'గ్రామ గణాంకాలు' : 'VILLAGE STATISTICS'}</Text>
                    </View>
                    <Text style={styles.slideTitle}>{language === 'te' ? 'గోరంట్ల జనాభా వివరాలు' : 'Gorantla Demographics'}</Text>
                    
                    {/* Visual bar graph representation */}
                    <View style={styles.visualGraphContainer}>
                      <View style={styles.graphRow}>
                        <Text style={styles.graphLabel}>{language === 'te' ? 'పురుషులు' : 'Male'} (12.3k)</Text>
                        <View style={styles.graphTrack}>
                          <View style={[styles.graphBar, { width: '51%', backgroundColor: '#FFD400' }]} />
                        </View>
                      </View>
                      <View style={styles.graphRow}>
                        <Text style={styles.graphLabel}>{language === 'te' ? 'స్త్రీలు' : 'Female'} (12.2k)</Text>
                        <View style={styles.graphTrack}>
                          <View style={[styles.graphBar, { width: '49%', backgroundColor: '#820263' }]} />
                        </View>
                      </View>
                    </View>
                    <Text style={styles.graphFooterText}>{language === 'te' ? 'మొత్తం జనాభా: 24,586 నివాసితులు' : 'Total Assessed Population: 24,586 residents'}</Text>
                  </View>
                </View>

                {/* Slide 3: Live Announcements */}
                <View style={[styles.carouselSlide, styles.announcementSlide]}>
                  <View style={styles.slideOverlayDark}>
                    <View style={styles.slideHeader}>
                      <Ionicons name="megaphone" size={20} color="#FFD400" />
                      <Text style={styles.slideLabel}>{language === 'te' ? 'పంచాయతీ నోటీస్ బోర్డు' : 'GP BOARD ALERTS'}</Text>
                    </View>
                    <Text style={styles.slideTitle}>{language === 'te' ? 'గ్రామ సభ సమావేశం' : 'Gram Sabha Meeting'}</Text>
                    <Text style={styles.slideSubtitle}>
                      {language === 'te' ? 'జులై 10, 2026 న గ్రామ సభ నిర్వహించబడును. అందరూ పాల్గొనవలసిందిగా కోరుతున్నాము.' : 'Scheduled for July 10, 2026. Agenda covers budget approvals and water pipeline extensions.'}
                    </Text>
                    <View style={styles.badgeRow}>
                      <View style={styles.alertBadge}><Text style={styles.alertBadgeText}>{language === 'te' ? 'అత్యవసరం' : 'Urgent'}</Text></View>
                      <Text style={styles.alertDate}>{language === 'te' ? '2 రోజుల క్రితం' : 'Posted: 2 days ago'}</Text>
                    </View>
                  </View>
                </View>
              </ScrollView>

              {/* Paging Dots */}
              <View style={styles.paginationDots}>
                {[0, 1, 2].map((i) => (
                  <View
                    key={i}
                    style={[
                      styles.dot,
                      activeSlide === i ? styles.activeDot : null
                    ]}
                  />
                ))}
              </View>
            </Animated.View>
          )}

          {/* Village Map Section */}
          <View style={styles.mapContainer}>
            <View style={styles.mapHeaderRow}>
              <Ionicons name="map" size={20} color="#2E294E" />
              <Text style={styles.mapHeaderTitle}>{language === 'te' ? MAP_DATA[activeMapSlide].titleTe : MAP_DATA[activeMapSlide].title}</Text>
            </View>
            <View>
              <ScrollView
                ref={mapScrollViewRef}
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                onScroll={(e) => {
                  const slideSize = e.nativeEvent.layoutMeasurement.width;
                  const index = Math.round(e.nativeEvent.contentOffset.x / slideSize);
                  setActiveMapSlide(index);
                }}
                scrollEventThrottle={16}
              >
                {MAP_DATA.map((mapItem) => (
                  <View key={mapItem.id} style={{ width: width - 64 }}>
                    <TouchableOpacity onPress={() => setIsMapExpanded(true)} style={styles.mapImageWrapper} activeOpacity={0.8}>
                      <Image 
                        source={mapItem.image}
                        style={styles.mapImage}
                        resizeMode="contain"
                      />
                      <View style={styles.expandIconOverlay}>
                        <Ionicons name="expand" size={18} color="#FFFFFF" />
                      </View>
                    </TouchableOpacity>
                  </View>
                ))}
              </ScrollView>
              <View style={[styles.paginationDots, { marginTop: 12, marginBottom: 0 }]}>
                {MAP_DATA.map((_, i) => (
                  <View
                    key={i}
                    style={[
                      styles.dot,
                      activeMapSlide === i ? styles.activeDot : null
                    ]}
                  />
                ))}
              </View>
            </View>
          </View>

          {/* Official Directory Section */}
          <View style={styles.officialSection}>
            <View style={styles.officialHeaderRow}>
              <Text style={styles.sectionHeader}>{language === 'te' ? 'అధికారుల డైరెక్టరీ' : 'Official Directory'}</Text>
              {user?.role === 'ADMIN' && (
                <TouchableOpacity onPress={() => navigation.navigate('ManageOfficials')} style={styles.editBadge}>
                  <Text style={styles.editBadgeText}>Manage</Text>
                </TouchableOpacity>
              )}
            </View>
            <ScrollView 
              ref={officialScrollViewRef}
              horizontal 
              pagingEnabled
              showsHorizontalScrollIndicator={false} 
              onScroll={(e) => {
                const slideSize = e.nativeEvent.layoutMeasurement.width;
                const index = Math.round(e.nativeEvent.contentOffset.x / slideSize);
                setActiveOfficialSlide(index);
              }}
              scrollEventThrottle={16}
              style={styles.carouselContainer}
            >
              {photoOfficials.map((official, idx) => {
                let imageSource;
                if (official.photo && officialImages[official.photo]) {
                  imageSource = officialImages[official.photo];
                } else if (official.photo) {
                  imageSource = { 
                    uri: official.photo.startsWith('http') || official.photo.startsWith('file') 
                      ? official.photo 
                      : `${API_BASE_URL}${official.photo}`
                  };
                }

                return (
                <View key={official.id || idx} style={styles.officialCarouselSlide}>
                  <ImageBackground
                    source={require('../../assets/prism_pattern.png')}
                    style={{ flex: 1, width: '100%' }}
                    imageStyle={{ opacity: 0.1, resizeMode: 'cover' }}
                  >
                    <View style={styles.officialSlideInner}>
                      <View style={styles.officialAvatarContainerSlide}>
                        {imageSource ? (
                          <Image source={imageSource} style={styles.officialAvatar} resizeMode="cover" />
                        ) : (
                          <View style={styles.officialAvatarPlaceholder}>
                            <Text style={styles.officialAvatarText}>{official.name.charAt(0).toUpperCase()}</Text>
                          </View>
                        )}
                      </View>
                      <View style={styles.officialInfoSlide}>
                        <View style={styles.officialNameRow}>
                          <Text style={styles.officialNameSlide}>{language === 'te' && official.nameTe ? official.nameTe : official.name}</Text>
                          <Ionicons name="checkmark-circle" size={18} color="#00C2A8" style={{marginLeft: 4}} />
                        </View>
                        <View style={styles.highlightBadge}>
                          <Text style={styles.highlightBadgeText} numberOfLines={1}>{language === 'te' && official.designationTe ? official.designationTe : official.designation}</Text>
                        </View>
                        <View style={styles.officialPhoneRowSlide}>
                          <Ionicons name="call" size={14} color="#2E294E" />
                          <Text style={styles.officialPhoneSlide}>{official.phoneNumber}</Text>
                        </View>
                      </View>
                    </View>
                  </ImageBackground>
                </View>
                );
              })}
              {photoOfficials.length === 0 && (
                <Text style={styles.officialEmptyText}>No officials listed.</Text>
              )}
            </ScrollView>

            <View style={styles.paginationDots}>
              {photoOfficials.map((_, i) => (
                <View
                  key={i}
                  style={[
                    styles.dot,
                    activeOfficialSlide === i ? styles.activeDot : null
                  ]}
                />
              ))}
            </View>
          </View>

          {/* Section Header */}
          <View style={styles.sectionHeaderRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.sectionHeader}>{t('panchayatServices')}</Text>
              <Text style={styles.sectionSub}>
                {language === 'te' ? 'గణాంకాలు మరియు సమాచారం చూడటానికి ఒక విభాగాన్ని ఎంచుకోండి.' : 'Select a registry to view statistics, directories, and assets.'}
              </Text>
            </View>
            {user?.role === 'ADMIN' && (
              <TouchableOpacity
                style={styles.addCardBtn}
                onPress={() => setShowAddCardModal(true)}
              >
                <Ionicons name="add-circle" size={18} color="#FFFFFF" />
                <Text style={styles.addCardBtnText}>{t('addCard')}</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Staggered Entrance Service Cards */}
          <View style={styles.cardsGrid}>
            {(Array.isArray(sections) ? sections : []).map((item, index) => (
              <AnimatedCategoryCard
                key={item.key}
                item={item}
                index={index}
                userRole={user?.role}
                getSummary={getSummary}
                onPress={() => {
                  if (item.key === 'pension_records') {
                    navigation.navigate('PensionRecords');
                  } else {
                    navigation.navigate('SectionDetail', { sectionKey: item.key });
                  }
                }}
              />
            ))}
          </View>
        </ScrollView>
      )}

      {/* Modal for Adding Custom Section Card */}
      <Modal visible={showAddCardModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={styles.modalTitle}>Create Custom Info Card</Text>
              <View style={styles.divider} />

              <Text style={styles.inputLabel}>Card Title</Text>
              <TextInput
                style={styles.modalInput}
                value={newCardTitle}
                onChangeText={setNewCardTitle}
                placeholder="e.g. Village Tourism"
              />

              <Text style={styles.inputLabel}>Unique Key (alphanumeric, no spaces)</Text>
              <TextInput
                style={styles.modalInput}
                value={newCardKey}
                onChangeText={setNewCardKey}
                placeholder="e.g. tourism_info"
                autoCapitalize="none"
              />

              <Text style={styles.inputLabel}>Card Content / Overview</Text>
              <TextInput
                style={[styles.modalInput, styles.modalTextArea]}
                value={newCardDesc}
                onChangeText={setNewCardDesc}
                placeholder="Overview details here..."
                multiline
              />

              <View style={styles.modalActions}>
                <TouchableOpacity
                  style={[styles.modalActionBtn, styles.cancelBtn]}
                  onPress={() => setShowAddCardModal(false)}
                >
                  <Text style={styles.cancelText}>Cancel</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.modalActionBtn, styles.saveBtn]}
                  onPress={handleAddCard}
                  disabled={isAddingCard}
                >
                  {isAddingCard ? (
                    <ActivityIndicator color="#FFFFFF" size="small" />
                  ) : (
                    <Text style={styles.saveText}>Create Card</Text>
                  )}
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Map Expanded Modal */}
      <Modal visible={isMapExpanded} transparent animationType="fade" onRequestClose={() => setIsMapExpanded(false)}>
        <View style={styles.mapModalOverlay}>
          <TouchableOpacity style={styles.closeMapBtn} onPress={() => setIsMapExpanded(false)}>
            <Ionicons name="close-circle" size={40} color="#FFFFFF" />
          </TouchableOpacity>
          <Image 
            source={MAP_DATA[activeMapSlide].image}
            style={styles.fullScreenMap}
            resizeMode="contain"
          />
        </View>
      </Modal>

      {/* ADMIN Add News Modal */}
      <Modal visible={showAddNewsModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Broadcast News</Text>
            
            <TextInput
              style={styles.modalInput}
              placeholder="Title (English)"
              value={newNewsTitleEn}
              onChangeText={setNewNewsTitleEn}
            />
            <TextInput
              style={[styles.modalInput, styles.modalTextArea]}
              placeholder="Content (English)"
              value={newNewsContentEn}
              onChangeText={setNewNewsContentEn}
              multiline
            />

            <TextInput
              style={styles.modalInput}
              placeholder="Title (Telugu)"
              value={newNewsTitleTe}
              onChangeText={setNewNewsTitleTe}
            />
            <TextInput
              style={[styles.modalInput, styles.modalTextArea]}
              placeholder="Content (Telugu)"
              value={newNewsContentTe}
              onChangeText={setNewNewsContentTe}
              multiline
            />
            
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalActionBtn, styles.cancelBtn]}
                onPress={() => setShowAddNewsModal(false)}
                disabled={isAddingNews}
              >
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalActionBtn, styles.saveBtn]}
                onPress={handleAddNews}
                disabled={isAddingNews}
              >
                {isAddingNews ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.saveText}>Broadcast</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

    </View>
  );
};

export default HomeScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA', // Off-white/Ice
  },
  marqueeContainer: {
    height: 38,
    backgroundColor: '#820263', // Premium Royal Plum
    justifyContent: 'center',
    overflow: 'hidden',
    width: '100%',
    borderBottomWidth: 2,
    borderBottomColor: '#FFD400', // Gold highlight
  },
  marqueeText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  roleBannerStrip: {
    backgroundColor: '#2E294E', // Space Indigo
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#820263', // Plum divider border
  },
  roleBannerText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFD400', // Gold
    letterSpacing: 0.5,
  },
  roleBannerBtn: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  roleBannerBtnText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 11,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
  },
  
  // ── Swipe Carousel ──
  honourHeaderContainer: {
    marginBottom: -4, // Overlap the padding of the slides to attach to the card
    marginLeft: 20, // Align with the left edge of the carousel
    alignSelf: 'flex-start',
    zIndex: 10,
  },
  honourTabBadge: {
    backgroundColor: '#1C1C1E',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
    alignSelf: 'flex-start',
    borderWidth: 2,
    borderColor: '#FFD400', // Yellow highlighting
    borderBottomWidth: 0, // Open bottom to seamlessly attach to cards
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  honourSectionHeader: {
    fontSize: 12,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 1.5,
  },
  honourCarousel: {
    width: width - 32,
    borderRadius: 20,
  },
  honourSlide: {
    width: width - 32,
    height: 200,
    padding: 4, 
  },
  honourCardOuter: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#1C1C1E', // Dark mode background
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 5,
    overflow: 'hidden', 
    borderWidth: 1,
    borderColor: '#333333',
  },
  honourImage: {
    width: 140,
    height: '100%',
    backgroundColor: '#EAEAEA',
  },
  honourInfo: {
    flex: 1,
    padding: 16,
    justifyContent: 'center',
  },
  honourName: {
    fontSize: 18,
    fontWeight: '900',
    color: '#FFFFFF', // White text for dark mode
    marginBottom: 6,
  },
  honourDesignationBadge: {
    backgroundColor: '#FFD400', // Solid Gold Highlight
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    alignSelf: 'flex-start',
    marginBottom: 12,
  },
  honourDesignationText: {
    fontSize: 11,
    color: '#1C1C1E', // Very dark for high contrast
    fontWeight: '900',
  },
  honourLocationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  honourLocationText: {
    fontSize: 11,
    color: '#A0A0A0', 
    marginLeft: 4,
    fontWeight: '700',
    letterSpacing: 0.5,
  },

  carouselContainer: {
    width: width - 32,
    height: 180,
    borderRadius: 20,
    overflow: 'hidden',
  },
  carouselSlide: {
    width: width - 32,
    height: 180,
    borderRadius: 20,
    overflow: 'hidden',
  },
  slideOverlay: {
    flex: 1,
    padding: 20,
    backgroundColor: 'rgba(46, 41, 78, 0.82)', // Translucent Space Indigo
    justifyContent: 'center',
  },
  slideOverlayDark: {
    flex: 1,
    padding: 20,
    backgroundColor: '#2E294E', // Solid Space Indigo
    justifyContent: 'center',
  },
  statsSlide: {
    borderWidth: 1.5,
    borderColor: '#820263',
    borderRadius: 20,
  },
  announcementSlide: {
    borderWidth: 1.5,
    borderColor: '#D90368', // Berry Lipstick outline
    borderRadius: 20,
  },
  slideHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10,
  },
  slideLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: '#FFD400', // Gold
    letterSpacing: 1.5,
  },
  slideTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: '#FFFFFF',
    marginBottom: 6,
  },
  slideSubtitle: {
    fontSize: 12,
    color: '#EADEDA', // Dust Grey
    lineHeight: 18,
    marginBottom: 14,
  },
  slideBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FFD400', // Gold CTA
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  slideBtnText: {
    color: '#2E294E', // Space Indigo text on Gold
    fontWeight: '800',
    fontSize: 12,
  },
  paginationDots: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    marginTop: 10,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#D2C4C0',
  },
  activeDot: {
    width: 24,
    backgroundColor: '#820263', // Royal Plum active indicator
  },

  // ── Demographics Slide Graph ──
  visualGraphContainer: {
    marginTop: 6,
    gap: 8,
  },
  graphRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  graphLabel: {
    width: 90,
    fontSize: 11,
    color: '#EADEDA',
    fontWeight: '700',
  },
  graphTrack: {
    flex: 1,
    height: 10,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 5,
    overflow: 'hidden',
  },
  graphBar: {
    height: '100%',
    borderRadius: 5,
  },
  graphFooterText: {
    fontSize: 10,
    color: '#D2C4C0',
    fontWeight: '600',
    marginTop: 10,
    fontStyle: 'italic',
  },

  // ── Announcements Badge ──
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 6,
  },
  alertBadge: {
    backgroundColor: '#D90368', // Berry Lipstick
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  alertBadgeText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  alertDate: {
    color: '#D2C4C0',
    fontSize: 11,
    fontWeight: '600',
  },

  // ── Village Map ──
  mapContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginTop: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#2E294E',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  mapHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  mapHeaderTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: '#2E294E',
  },
  mapImageWrapper: {
    width: '100%',
    height: 260,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#F3EBF0',
    position: 'relative',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  mapImage: {
    width: '100%',
    height: '100%',
  },
  expandIconOverlay: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    backgroundColor: 'rgba(0,0,0,0.6)',
    padding: 6,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  mapCaption: {
    fontSize: 11,
    color: '#595959',
    marginTop: 8,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  mapModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.95)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeMapBtn: {
    position: 'absolute',
    top: 50,
    right: 20,
    zIndex: 10,
    padding: 10,
  },
  fullScreenMap: {
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height * 0.8,
  },

  // ── Official Directory ──
  officialSection: {
    marginTop: 10,
    marginBottom: 20,
  },
  officialHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  officialScroll: {
    gap: 12,
    paddingBottom: 8,
  },
  officialCarouselSlide: {
    width: width - 32,
    height: 180,
    backgroundColor: '#1C1C1E', // Very dark gray, almost black
    borderRadius: 20,
    overflow: 'hidden',
  },
  officialSlideInner: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    backgroundColor: 'rgba(28, 28, 30, 0.8)',
  },
  officialAvatarContainerSlide: {
    width: 95,
    height: 125,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.05)',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    marginRight: 20,
  },
  officialAvatar: {
    width: '100%',
    height: '100%',
  },
  officialAvatarPlaceholder: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  officialAvatarText: {
    fontSize: 24,
    fontWeight: '900',
    color: '#2E294E',
  },
  officialInfoSlide: {
    flex: 1,
    justifyContent: 'center',
  },
  officialNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  officialNameSlide: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '900',
    flexShrink: 1,
  },
  highlightBadge: {
    backgroundColor: '#820263', // Royal Plum
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    alignSelf: 'flex-start',
    marginTop: 6,
    marginBottom: 12,
  },
  highlightBadgeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  officialPhoneRowSlide: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFD400',
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
    gap: 6,
  },
  officialPhoneSlide: {
    color: '#2E294E',
    fontSize: 13,
    fontWeight: '800',
  },
  officialEmptyText: {
    color: '#595959',
    fontStyle: 'italic',
  },

  // ── Service Cards Grid ──
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 14,
    marginBottom: 8,
  },
  sectionHeader: {
    fontSize: 18,
    fontWeight: '900',
    color: '#2E294E', // Space Indigo
  },
  sectionSub: {
    fontSize: 13,
    color: '#595959', // Slate Gray
    marginTop: 2,
    lineHeight: 18,
  },
  addCardBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#820263', // Royal Plum
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  addCardBtnText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 12,
  },
  cardsGrid: {
    gap: 12,
    marginTop: 8,
  },
  cardOuter: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    overflow: 'hidden',
    borderLeftWidth: 6,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#2E294E',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.04,
    shadowRadius: 14,
    elevation: 3,
  },
  cardBgPattern: {
    width: '100%',
  },
  cardInner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  wideCardIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
    flexShrink: 0,
  },
  wideCardText: {
    flex: 1,
  },
  wideCardTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  wideCardTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#2E294E', // Space Indigo
    flex: 1,
  },
  wideCardDesc: {
    fontSize: 12,
    color: '#595959', // Slate Gray
    lineHeight: 16,
  },
  editBadge: {
    backgroundColor: '#F3EBF0',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#D2C4C0',
  },
  editBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#820263', // Royal Plum
  },

  // ── Modal Styles ──
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingBottom: 30,
    paddingTop: 16,
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2E294E',
    textAlign: 'center',
  },
  divider: {
    height: 1,
    backgroundColor: '#E2E8F0',
    marginVertical: 12,
  },
  inputLabel: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#595959',
    marginTop: 10,
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  modalInput: {
    borderWidth: 1,
    borderColor: '#D2C4C0',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: '#2E294E',
    backgroundColor: '#FDFDF6',
    marginBottom: 8,
  },
  modalTextArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  modalActionBtn: {
    flex: 0.48,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelBtn: {
    borderWidth: 1,
    borderColor: '#D2C4C0',
    backgroundColor: '#FDFDF6',
  },
  saveBtn: {
    backgroundColor: '#FFD400', // Gold
  },
  cancelText: {
    color: '#595959',
    fontWeight: 'bold',
  },
  saveText: {
    color: '#2E294E', // Space Indigo text on Gold
    fontWeight: 'bold',
  },
});
