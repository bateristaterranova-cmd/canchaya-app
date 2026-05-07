import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  FlatList,
} from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import MapView, { Marker } from 'react-native-maps';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { useAppStore } from '../../lib/store';
import { mockComplexes, formatPrice, getComplexById, getCourtTypeLabel } from '../../lib/mock-data';
import { Colors, DEFAULT_REGION } from '../../constants/theme';
import { GlassCard } from '../../components/GlassCard';

export default function MapScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { isDarkMode, favorites, toggleFavorite, selectComplex, searchQuery, setSearchQuery } = useAppStore();
  const isDark = isDarkMode;

  const [viewMode, setViewMode] = useState<'map' | 'list'>('map');
  const [selectedComplexId, setSelectedComplexId] = useState<string | null>(null);

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
                  <View style={[styles.marker, { backgroundColor: Colors.primary }]}>
                    <Ionicons name="football" size={14} color="#111" />
                  </View>
                  <View style={styles.markerArrow} />
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

          {/* Bottom sheet for selected complex */}
          {selectedComplex && (
            <Animated.View entering={FadeInDown.duration(300)} style={styles.bottomSheet}>
              <GlassCard style={styles.bottomSheetCard} padding={12}>
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
                    <Text style={styles.bottomSheetButtonText}>Ver</Text>
                  </TouchableOpacity>
                </View>
                <TouchableOpacity style={styles.bottomSheetClose} onPress={() => setSelectedComplexId(null)} activeOpacity={0.7}>
                  <Ionicons name="close" size={16} color={Colors.textTertiary} />
                </TouchableOpacity>
              </GlassCard>
            </Animated.View>
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
  searchInput: { flex: 1, height: 40, fontSize: 14 },
  mapContainer: { flex: 1, position: 'relative' },
  map: { flex: 1 },
  markerContainer: { alignItems: 'center' },
  marker: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: '#FFF', elevation: 4 },
  markerArrow: { width: 0, height: 0, backgroundColor: 'transparent', borderStyle: 'solid', borderLeftWidth: 6, borderRightWidth: 6, borderTopWidth: 8, borderLeftColor: 'transparent', borderRightColor: 'transparent', borderTopColor: Colors.primary, marginTop: -1 },
  centerBtn: { position: 'absolute', right: 16, bottom: 120, width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center', elevation: 4, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.15, shadowRadius: 4 },
  bottomSheet: { position: 'absolute', bottom: 90, left: 16, right: 16 },
  bottomSheetCard: { position: 'relative' },
  bottomSheetRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  bottomSheetImage: { width: 60, height: 60, borderRadius: 10 },
  bottomSheetInfo: { flex: 1, gap: 3 },
  bottomSheetName: { fontSize: 14, fontWeight: '700' },
  bottomSheetDistrictRow: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  bottomSheetDistrict: { fontSize: 12 },
  bottomSheetMetaRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  bottomSheetRating: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  bottomSheetRatingText: { fontSize: 12, fontWeight: '700', color: Colors.star },
  bottomSheetPrice: { fontSize: 14, fontWeight: '800', color: Colors.primary },
  bottomSheetButton: { backgroundColor: Colors.primary, paddingHorizontal: 16, paddingVertical: 8, borderRadius: 10 },
  bottomSheetButtonText: { color: '#111', fontWeight: '700', fontSize: 13 },
  bottomSheetClose: { position: 'absolute', top: 4, right: 4, width: 24, height: 24, alignItems: 'center', justifyContent: 'center' },
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
