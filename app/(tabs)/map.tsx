import React, { useState, useMemo, useRef, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  FlatList,
  Platform,
  Dimensions,
} from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { useAppStore } from '../../lib/store';
import { mockComplexes, formatPrice, getComplexById, getCourtTypeLabel } from '../../lib/mock-data';
import { Colors, DEFAULT_REGION } from '../../constants/theme';
import { GlassCard } from '../../components/GlassCard';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Lazy-load MapView only on native platforms
let MapView: any = null;
let Marker: any = null;
if (Platform.OS !== 'web') {
  try {
    const maps = require('react-native-maps');
    MapView = maps.default;
    Marker = maps.Marker;
  } catch {}
}

// Generate map HTML with Leaflet.js — supports dark mode via isDark param
function generateMapHTML(complexes: any[], isDark: boolean) {
  // CartoDB Voyager for warm/light minimalist, Dark Matter for dark mode — Uber-like style
  const tileUrl = isDark
    ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
    : 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png';

  const popupBg = isDark ? '#1e1e1e' : '#FFF';
  const popupColor = isDark ? '#F5F5F5' : '#111';
  const popupSubColor = isDark ? '#aaa' : '#666';

  const pins = complexes.map((c, i) => `
    L.marker([${c.lat}, ${c.lng}], {
      icon: L.divIcon({
        className: 'custom-pin',
        html: '<div class="pin"><div class="pin-dot"></div></div><div class="pin-label">S/${c.minPrice}</div>',
        iconSize: [50, 56],
        iconAnchor: [25, 56],
      })
    }).addTo(map)
    .bindPopup('<div style="font-family:-apple-system,BlinkMacSystemFont,sans-serif;"><b style="font-size:14px;color:${popupColor}">${c.name.replace(/'/g, "\\'")}</b><br><span style="font-size:12px;color:${popupSubColor}">${c.district}</span></div>', { className: 'custom-popup' })
    .on('click', function() { window.parent.postMessage(${JSON.stringify(c.id)}, '*') });
  `).join('\n');

  return `<!DOCTYPE html>
<html>
<head>
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    html, body, #map { width: 100%; height: 100%; }
    .custom-pin { background: none !important; border: none !important; }
    .pin {
      width: 36px;
      height: 36px;
      background: #84CC16;
      border-radius: 50% 50% 50% 0;
      transform: rotate(-45deg);
      position: relative;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 3px 10px rgba(0,0,0,0.35);
      border: 2.5px solid #FFF;
    }
    .pin-dot {
      width: 12px;
      height: 12px;
      background: #FFF;
      border-radius: 50%;
      transform: rotate(45deg);
    }
    .pin-label {
      position: absolute;
      top: 40px;
      left: 50%;
      transform: translateX(-50%);
      background: ${isDark ? '#1a1a1a' : '#FFF'};
      color: ${isDark ? '#F5F5F5' : '#111'};
      font-size: 11px;
      font-weight: 700;
      padding: 2px 8px;
      border-radius: 8px;
      white-space: nowrap;
      box-shadow: 0 2px 6px rgba(0,0,0,0.15);
      border: 1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.06)'};
    }
    .custom-popup .leaflet-popup-content-wrapper {
      border-radius: 12px !important;
      box-shadow: 0 4px 16px rgba(0,0,0,0.2) !important;
      background: ${popupBg} !important;
    }
    .custom-popup .leaflet-popup-tip {
      background: ${popupBg} !important;
    }
    .custom-popup .leaflet-popup-content {
      margin: 10px 14px !important;
      font-family: -apple-system, BlinkMacSystemFont, sans-serif;
    }
    .leaflet-control-zoom { display: none !important; }
    .leaflet-control-attribution { font-size: 9px !important; opacity: 0.5; }
  </style>
</head>
<body>
  <div id="map"></div>
  <script>
    var map = L.map('map', { zoomControl: false }).setView([${DEFAULT_REGION.latitude}, ${DEFAULT_REGION.longitude}], ${DEFAULT_REGION.latitudeDelta > 0.05 ? 13 : 12});
    L.tileLayer('${tileUrl}', {
      attribution: '&copy; OpenStreetMap contributors &copy; CARTO',
      maxZoom: 19,
    }).addTo(map);
    ${pins}
  </script>
</body>
</html>`;
}

export default function MapScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { isDarkMode, favorites, toggleFavorite, selectComplex, searchQuery, setSearchQuery } = useAppStore();
  const isDark = isDarkMode;

  const [viewMode, setViewMode] = useState<'map' | 'list'>('map');
  const [selectedComplexId, setSelectedComplexId] = useState<string | null>(null);
  const [webViewReady, setWebViewReady] = useState(false);

  // Listen for postMessage from iframe (web pin clicks)
  useEffect(() => {
    if (Platform.OS !== 'web') return;
    const handler = (event: MessageEvent) => {
      if (event.data && typeof event.data === 'string') {
        setSelectedComplexId(event.data);
      }
    };
    window.addEventListener('message', handler);
    return () => window.removeEventListener('message', handler);
  }, []);

  const filteredComplexes = useMemo(() => {
    if (!searchQuery.trim()) return mockComplexes;
    const q = searchQuery.toLowerCase();
    return mockComplexes.filter(c =>
      c.name.toLowerCase().includes(q) || c.district.toLowerCase().includes(q)
    );
  }, [searchQuery]);

  const selectedComplex = selectedComplexId ? getComplexById(selectedComplexId) : null;

  const handleComplexPress = (id: string) => {
    selectComplex(id);
    router.push('/detail');
  };

  const handlePinClickWeb = useCallback((id: string) => {
    setSelectedComplexId(id);
  }, []);

  return (
    <View style={[styles.container, { backgroundColor: isDark ? Colors.backgroundDark : Colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top || 12 }]}>
        <Text style={[styles.headerTitle, { color: isDark ? Colors.textDark : Colors.text }]}>Canchas cerca de ti</Text>
        <View style={styles.viewToggle}>
          <TouchableOpacity
            style={[styles.toggleBtn, viewMode === 'map' && { backgroundColor: Colors.primary }]}
            onPress={() => setViewMode('map')}
            activeOpacity={0.7}
          >
            <Ionicons name="map-outline" size={16} color={viewMode === 'map' ? '#111' : (isDark ? Colors.textTertiaryDark : Colors.textTertiary)} />
            <Text style={[styles.toggleText, viewMode === 'map' && { color: '#111', fontWeight: '700' }]}>Mapa</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.toggleBtn, viewMode === 'list' && { backgroundColor: Colors.primary }]}
            onPress={() => setViewMode('list')}
            activeOpacity={0.7}
          >
            <Ionicons name="list-outline" size={16} color={viewMode === 'list' ? '#111' : (isDark ? Colors.textTertiaryDark : Colors.textTertiary)} />
            <Text style={[styles.toggleText, viewMode === 'list' && { color: '#111', fontWeight: '700' }]}>Lista</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Search */}
      <View style={styles.searchContainer}>
        <GlassCard style={styles.searchCard}>
          <View style={styles.searchRow}>
            <Ionicons name="search-outline" size={18} color={Colors.textTertiary} />
            <TextInput
              style={[styles.searchInput, { color: isDark ? Colors.textDark : Colors.text }]}
              placeholder="Buscar en el mapa..."
              placeholderTextColor={isDark ? Colors.textTertiaryDark : Colors.textTertiary}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <Ionicons name="close-circle" size={18} color={Colors.textTertiary} />
              </TouchableOpacity>
            )}
          </View>
        </GlassCard>
      </View>

      {viewMode === 'map' ? (
        <View style={styles.mapContainer}>
          {Platform.OS === 'web' ? (
            <>
              {/* CartoDB map via iframe + Leaflet */}
              <iframe
                srcDoc={generateMapHTML(filteredComplexes, isDark)}
                style={{
                  width: '100%',
                  height: '100%',
                  border: 'none',
                  borderRadius: 16,
                }}
                onLoad={() => setWebViewReady(true)}
              />

              {/* Selected complex bottom card */}
              {selectedComplex && (
                <Animated.View entering={FadeInDown.duration(300)} style={styles.bottomSheet}>
                  <View style={[styles.bottomSheetCard, { backgroundColor: isDark ? '#1a1a1a' : '#FFF', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.18, shadowRadius: 12, elevation: 8 }]}>
                    {/* Handle bar */}
                    <View style={styles.bottomSheetHandle} />
                    <View style={styles.bottomSheetRow}>
                      <Image source={{ uri: selectedComplex.image }} style={styles.bottomSheetImage} contentFit="cover" />
                      <View style={styles.bottomSheetInfo}>
                        <Text style={[styles.bottomSheetName, { color: isDark ? Colors.textDark : Colors.text }]} numberOfLines={1}>
                          {selectedComplex.name}
                        </Text>
                        <View style={styles.bottomSheetDistrictRow}>
                          <Ionicons name="location-outline" size={12} color={Colors.primary} />
                          <Text style={[styles.bottomSheetDistrict, { color: isDark ? Colors.textSecondaryDark : Colors.textSecondary }]}>
                            {selectedComplex.district}
                          </Text>
                        </View>
                        <View style={styles.bottomSheetMetaRow}>
                          <View style={styles.bottomSheetRating}>
                            <Ionicons name="star" size={12} color={Colors.star} />
                            <Text style={styles.bottomSheetRatingText}>{selectedComplex.rating}</Text>
                          </View>
                          <Text style={styles.bottomSheetPrice}>{formatPrice(selectedComplex.minPrice)}/h</Text>
                        </View>
                      </View>
                      <TouchableOpacity style={styles.bottomSheetButton} onPress={() => handleComplexPress(selectedComplex.id)} activeOpacity={0.8}>
                        <Text style={styles.bottomSheetButtonText}>Ver detalle</Text>
                      </TouchableOpacity>
                    </View>
                    <TouchableOpacity style={styles.bottomSheetClose} onPress={() => setSelectedComplexId(null)} activeOpacity={0.7}>
                      <Ionicons name="close" size={14} color={isDark ? '#888' : '#666'} />
                    </TouchableOpacity>
                  </View>
                </Animated.View>
              )}

              {/* Map legend — simplified */}
              <View style={[styles.mapLegend, { backgroundColor: isDark ? 'rgba(0,0,0,0.7)' : 'rgba(255,255,255,0.9)' }]}>
                <Ionicons name="location" size={14} color={Colors.primary} />
                <Text style={[styles.legendText, { color: isDark ? Colors.textDark : Colors.text }]}>
                  {filteredComplexes.length} canchas
                </Text>
              </View>
            </>
          ) : MapView ? (
            <>
              <MapView
                style={styles.map}
                initialRegion={DEFAULT_REGION}
                showsUserLocation
                showsMyLocationButton
                userInterfaceStyle={isDark ? 'dark' : 'light'}
              >
                {filteredComplexes.map((complex) => (
                  <Marker
                    key={complex.id}
                    coordinate={{ latitude: complex.lat, longitude: complex.lng }}
                    onPress={() => setSelectedComplexId(complex.id)}
                  >
                    <View style={styles.markerContainer}>
                      <View style={styles.markerPin}>
                        <View style={styles.markerPinDot} />
                      </View>
                    </View>
                  </Marker>
                ))}
              </MapView>
              <TouchableOpacity
                style={[styles.centerBtn, { backgroundColor: isDark ? Colors.glassBgDark : 'rgba(255,255,255,0.9)' }]}
                activeOpacity={0.7}
              >
                <Ionicons name="locate-outline" size={22} color={Colors.primary} />
              </TouchableOpacity>

              {/* Selected complex bottom card */}
              {selectedComplex && (
                <Animated.View entering={FadeInDown.duration(300)} style={styles.bottomSheet}>
                  <View style={[styles.bottomSheetCard, { backgroundColor: isDark ? '#1a1a1a' : '#FFF', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.18, shadowRadius: 12, elevation: 8 }]}>
                    <View style={styles.bottomSheetHandle} />
                    <View style={styles.bottomSheetRow}>
                      <Image source={{ uri: selectedComplex.image }} style={styles.bottomSheetImage} contentFit="cover" />
                      <View style={styles.bottomSheetInfo}>
                        <Text style={[styles.bottomSheetName, { color: isDark ? Colors.textDark : Colors.text }]} numberOfLines={1}>{selectedComplex.name}</Text>
                        <View style={styles.bottomSheetDistrictRow}>
                          <Ionicons name="location-outline" size={12} color={Colors.primary} />
                          <Text style={[styles.bottomSheetDistrict, { color: isDark ? Colors.textSecondaryDark : Colors.textSecondary }]}>{selectedComplex.district}</Text>
                        </View>
                        <View style={styles.bottomSheetMetaRow}>
                          <View style={styles.bottomSheetRating}>
                            <Ionicons name="star" size={12} color={Colors.star} />
                            <Text style={styles.bottomSheetRatingText}>{selectedComplex.rating}</Text>
                          </View>
                          <Text style={styles.bottomSheetPrice}>{formatPrice(selectedComplex.minPrice)}/h</Text>
                        </View>
                      </View>
                      <TouchableOpacity style={styles.bottomSheetButton} onPress={() => handleComplexPress(selectedComplex.id)} activeOpacity={0.8}>
                        <Text style={styles.bottomSheetButtonText}>Ver detalle</Text>
                      </TouchableOpacity>
                    </View>
                    <TouchableOpacity style={styles.bottomSheetClose} onPress={() => setSelectedComplexId(null)} activeOpacity={0.7}>
                      <Ionicons name="close" size={14} color={isDark ? '#888' : '#666'} />
                    </TouchableOpacity>
                  </View>
                </Animated.View>
              )}
            </>
          ) : (
            <View style={styles.mapUnavailable}>
              <Ionicons name="map-outline" size={40} color={Colors.textTertiary} />
              <Text style={[styles.mapUnavailableText, { color: isDark ? Colors.textSecondaryDark : Colors.textSecondary }]}>Mapa no disponible</Text>
            </View>
          )}
        </View>
      ) : (
        <FlatList
          data={filteredComplexes}
          keyExtractor={(item) => item.id}
          contentContainerStyle={[styles.listContent, { paddingTop: 8 }]}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={
            <Text style={[styles.listCount, { color: isDark ? Colors.textSecondaryDark : Colors.textSecondary }]}>
              {filteredComplexes.length} canchas encontradas
            </Text>
          }
          renderItem={({ item, index }) => {
            const courtTypes = [...new Set(item.courts.map(c => c.type))];
            return (
              <Animated.View entering={FadeInDown.duration(300).delay(index * 50)}>
                <GlassCard style={styles.listCard} padding={12}>
                  <TouchableOpacity onPress={() => handleComplexPress(item.id)} activeOpacity={0.9} style={styles.listCardRow}>
                    <Image source={{ uri: item.image }} style={styles.listImage} contentFit="cover" />
                    <View style={styles.listInfo}>
                      <Text style={[styles.listName, { color: isDark ? Colors.textDark : Colors.text }]} numberOfLines={1}>{item.name}</Text>
                      <View style={styles.listDistrictRow}>
                        <Ionicons name="location-outline" size={12} color={Colors.primary} />
                        <Text style={[styles.listDistrict, { color: isDark ? Colors.textSecondaryDark : Colors.textSecondary }]} numberOfLines={1}>{item.district}</Text>
                      </View>
                      <View style={styles.listBadgesRow}>
                        {courtTypes.slice(0, 2).map(type => (
                          <View key={type} style={styles.listBadge}>
                            <Text style={styles.listBadgeText}>{getCourtTypeLabel(type)}</Text>
                          </View>
                        ))}
                      </View>
                      <View style={styles.listMetaRow}>
                        <View style={styles.listRating}>
                          <Ionicons name="star" size={12} color={Colors.star} />
                          <Text style={styles.listRatingText}>{item.rating}</Text>
                        </View>
                        <Text style={styles.listPrice}>{formatPrice(item.minPrice)}/h</Text>
                      </View>
                    </View>
                    <TouchableOpacity onPress={() => toggleFavorite(item.id)} style={styles.listFavBtn} activeOpacity={0.7}>
                      <Ionicons
                        name={favorites.includes(item.id) ? 'heart' : 'heart-outline'}
                        size={22}
                        color={favorites.includes(item.id) ? Colors.heart : Colors.textTertiary}
                      />
                    </TouchableOpacity>
                  </TouchableOpacity>
                </GlassCard>
              </Animated.View>
            );
          }}
          ListEmptyComponent={
            <View style={styles.emptyList}>
              <Ionicons name="search-outline" size={40} color={Colors.textTertiary} />
              <Text style={[styles.emptyListText, { color: isDark ? Colors.textSecondaryDark : Colors.textSecondary }]}>No se encontraron canchas</Text>
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingBottom: 8 },
  headerTitle: { fontSize: 20, fontWeight: '800' },
  viewToggle: { flexDirection: 'row', backgroundColor: 'rgba(132,204,22,0.1)', borderRadius: 12, padding: 3 },
  toggleBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10 },
  toggleText: { fontSize: 13, fontWeight: '500', color: '#999' },
  searchContainer: { paddingHorizontal: 16, marginBottom: 8 },
  searchCard: {},
  searchRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  searchInput: { flex: 1, height: 26, fontSize: 13 },
  mapContainer: { flex: 1, position: 'relative', marginHorizontal: 8, marginBottom: 8, borderRadius: 16, overflow: 'hidden' },
  map: { flex: 1 },

  // Map legend — simplified
  mapLegend: {
    position: 'absolute',
    top: 12,
    right: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  legendText: { fontSize: 12, fontWeight: '700' },

  // Green teardrop pin marker (native)
  markerContainer: { alignItems: 'center', justifyContent: 'center' },
  markerPin: {
    width: 40,
    height: 40,
    backgroundColor: Colors.primary,
    borderRadius: 20,
    borderBottomLeftRadius: 0,
    transform: [{ rotate: '-45deg' }],
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: '#FFF',
    elevation: 6,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.4,
    shadowRadius: 6,
  },
  markerPinDot: {
    width: 12,
    height: 12,
    backgroundColor: '#FFF',
    borderRadius: 6,
    transform: [{ rotate: '45deg' }],
  },

  mapUnavailable: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 8 },
  mapUnavailableText: { fontSize: 14, fontWeight: '500' },

  // Bottom sheet for selected complex — Airbnb style
  bottomSheet: { position: 'absolute', bottom: 16, left: 8, right: 8, zIndex: 10 },
  bottomSheetCard: {
    position: 'relative',
    borderRadius: 16,
    padding: 14,
  },
  bottomSheetHandle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(0,0,0,0.1)',
    alignSelf: 'center',
    marginBottom: 10,
  },
  bottomSheetRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  bottomSheetImage: { width: 80, height: 80, borderRadius: 12 },
  bottomSheetInfo: { flex: 1, gap: 4 },
  bottomSheetName: { fontSize: 15, fontWeight: '700' },
  bottomSheetDistrictRow: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  bottomSheetDistrict: { fontSize: 12 },
  bottomSheetMetaRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  bottomSheetRating: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  bottomSheetRatingText: { fontSize: 12, fontWeight: '700', color: Colors.star },
  bottomSheetPrice: { fontSize: 16, fontWeight: '800', color: Colors.primary },
  bottomSheetButton: { backgroundColor: Colors.primary, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 10 },
  bottomSheetButtonText: { color: '#111', fontWeight: '700', fontSize: 12 },
  bottomSheetClose: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(0,0,0,0.05)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerBtn: { position: 'absolute', right: 16, bottom: 120, width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center', elevation: 4, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.15, shadowRadius: 4 },

  // List view
  listContent: { paddingHorizontal: 16, paddingBottom: 100 },
  listCount: { fontSize: 12, marginBottom: 10 },
  listCard: { marginBottom: 10, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 8, elevation: 3 },
  listCardRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  listImage: { width: 70, height: 70, borderRadius: 10 },
  listInfo: { flex: 1, gap: 3 },
  listName: { fontSize: 14, fontWeight: '700' },
  listDistrictRow: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  listDistrict: { fontSize: 12 },
  listBadgesRow: { flexDirection: 'row', gap: 4 },
  listBadge: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6, backgroundColor: 'rgba(132, 204, 22, 0.12)', borderWidth: 1, borderColor: 'rgba(132, 204, 22, 0.2)' },
  listBadgeText: { fontSize: 10, fontWeight: '600', color: '#4D7C0F' },
  listMetaRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 2 },
  listRating: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  listRatingText: { fontSize: 12, fontWeight: '700', color: Colors.star },
  listPrice: { fontSize: 14, fontWeight: '800', color: Colors.primary },
  listFavBtn: { padding: 8 },
  emptyList: { alignItems: 'center', paddingVertical: 40, gap: 8 },
  emptyListText: { fontSize: 14 },
});
