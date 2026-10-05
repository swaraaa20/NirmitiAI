import React, { useEffect, useState } from 'react';

import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
  ActivityIndicator,
} from 'react-native';

import { router } from 'expo-router';

import { supabase } from '../services/supabase';

import { useLanguage } from '../context/LanguageContext';

type Seller = {
  id: string;
  business_name: string | null;
  business_category: string | null;
  business_description: string | null;
  city: string | null;
  pincode: string | null;
  phone: string | null;
};

export default function Collaborate() {
  const { t } = useLanguage();

  const [sellers, setSellers] = useState<Seller[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSellers();
  }, []);

  const fetchSellers = async () => {
    try {
      setLoading(true);

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        return;
      }

      const { data, error } = await supabase
        .from('profiles')
        .select(
          `
          id,
          business_name,
          business_category,
          business_description,
          city,
          pincode,
          phone
          `
        )
        .eq('role', 'artisan')
        .eq('collaboration_enabled', true)
        .neq('id', user.id);

      if (error) {
        console.log(
          'COLLABORATION ERROR:',
          error
        );
        return;
      }

      setSellers(data || []);
    } catch (error) {
      console.log(
        'COLLABORATION ERROR:',
        error
      );
    } finally {
      setLoading(false);
    }
  };

  const callSeller = async (
    phone: string | null
  ) => {
    if (!phone) {
      return;
    }

    try {
      await Linking.openURL(`tel:${phone}`);
    } catch (error) {
      console.log(
        'CALL ERROR:',
        error
      );
    }
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={
        styles.content
      }
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => {
            // @ts-ignore
            router.back();
          }}
        >
          <Text
            style={styles.backButton}
          >
            ‹
          </Text>
        </TouchableOpacity>

        <View style={styles.headerText}>
          <Text
            style={styles.title}
          >
            {t.collabTitle}
          </Text>

          <Text
            style={styles.subtitle}
          >
            {t.collabSubtitle}
          </Text>
        </View>
      </View>

      <View style={styles.infoCard}>
        <Text style={styles.infoIcon}>
          🤝
        </Text>

        <View style={styles.infoContent}>
          <Text
            style={styles.infoTitle}
          >
            {t.collabGrowTitle}
          </Text>

          <Text
            style={styles.infoText}
          >
            {t.collabGrowText}
          </Text>
        </View>
      </View>

      <Text
        style={styles.sectionTitle}
      >
        {t.collabSellersNear}
      </Text>

      {loading ? (
        <View
          style={
            styles.loadingContainer
          }
        >
          <ActivityIndicator
            size="large"
            color="#8B5E83"
          />

          <Text
            style={styles.loadingText}
          >
            {t.collabFinding}
          </Text>
        </View>
      ) : sellers.length === 0 ? (
        <View
          style={styles.emptyCard}
        >
          <Text
            style={styles.emptyIcon}
          >
            🌱
          </Text>

          <Text
            style={styles.emptyTitle}
          >
            {t.collabNoSellers}
          </Text>

          <Text
            style={styles.emptyText}
          >
            {t.collabNoSellersText}
          </Text>
        </View>
      ) : (
        sellers.map((seller) => (
          <View
            key={seller.id}
            style={styles.sellerCard}
          >
            <View
              style={styles.sellerTop}
            >
              <View
                style={styles.sellerIcon}
              >
                <Text
                  style={
                    styles.sellerIconText
                  }
                >
                  🏠
                </Text>
              </View>

              <View
                style={styles.sellerInfo}
              >
                <Text
                  style={
                    styles.businessName
                  }
                >
                  {seller.business_name ||
                    t.collabHomeBusiness}
                </Text>

                <Text
                  style={styles.category}
                >
                  {seller.business_category ||
                    t.collabHomeBased}
                </Text>
              </View>
            </View>

            {seller.business_description ? (
              <Text
                style={
                  styles.description
                }
              >
                {seller.business_description}
              </Text>
            ) : null}

            {(seller.city ||
              seller.pincode) && (
              <View
                style={
                  styles.locationRow
                }
              >
                <Text
                  style={
                    styles.locationIcon
                  }
                >
                  📍
                </Text>

                <Text
                  style={
                    styles.locationText
                  }
                >
                  {seller.city || ''}
                  {seller.city &&
                  seller.pincode
                    ? ' • '
                    : ''}
                  {seller.pincode || ''}
                </Text>
              </View>
            )}

            <View
              style={styles.divider}
            />

            <View
              style={styles.actionRow}
            >
              <View>
                <Text
                  style={
                    styles.collabLabel
                  }
                >
                  {t.collabOpen}
                </Text>

                <Text
                  style={
                    styles.collabText
                  }
                >
                  {t.collabTogether}
                </Text>
              </View>

              {seller.phone ? (
                <TouchableOpacity
                  style={
                    styles.callButton
                  }
                  onPress={() =>
                    callSeller(
                      seller.phone
                    )
                  }
                >
                  <Text
                    style={
                      styles.callIcon
                    }
                  >
                    📞
                  </Text>

                  <Text
                    style={
                      styles.callText
                    }
                  >
                    {t.collabCall}
                  </Text>
                </TouchableOpacity>
              ) : null}
            </View>
          </View>
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF9F5',
  },

  content: {
    padding: 20,
    paddingBottom: 40,
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 22,
  },

  backButton: {
    fontSize: 38,
    color: '#44352D',
    lineHeight: 38,
    marginRight: 10,
  },

  headerText: {
    flex: 1,
  },

  title: {
    fontSize: 24,
    fontWeight: '900',
    color: '#44352D',
  },

  subtitle: {
    fontSize: 12,
    color: '#8A7B71',
    marginTop: 3,
  },

  infoCard: {
    flexDirection: 'row',
    backgroundColor: '#FCEFF4',
    borderRadius: 20,
    padding: 17,
    marginBottom: 25,
  },

  infoIcon: {
    fontSize: 28,
    marginRight: 13,
  },

  infoContent: {
    flex: 1,
  },

  infoTitle: {
    fontSize: 15,
    fontWeight: '900',
    color: '#44352D',
    marginBottom: 5,
  },

  infoText: {
    fontSize: 12,
    lineHeight: 18,
    color: '#75665D',
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: '#44352D',
    marginBottom: 13,
  },

  loadingContainer: {
    alignItems: 'center',
    paddingVertical: 45,
  },

  loadingText: {
    marginTop: 10,
    fontSize: 13,
    color: '#8A7B71',
  },

  emptyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 30,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#EADDD3',
  },

  emptyIcon: {
    fontSize: 35,
    marginBottom: 12,
  },

  emptyTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: '#44352D',
    marginBottom: 7,
  },

  emptyText: {
    fontSize: 12,
    color: '#8A7B71',
    textAlign: 'center',
    lineHeight: 18,
  },

  sellerCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 17,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#EADDD3',
    shadowColor: '#7A3E22',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.06,
    shadowRadius: 7,
    elevation: 2,
  },

  sellerTop: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  sellerIcon: {
    width: 48,
    height: 48,
    borderRadius: 15,
    backgroundColor: '#F4EEFF',
    justifyContent: 'center',
    alignItems: 'center',
  },

  sellerIconText: {
    fontSize: 22,
  },

  sellerInfo: {
    flex: 1,
    marginLeft: 12,
  },

  businessName: {
    fontSize: 16,
    fontWeight: '900',
    color: '#44352D',
    marginBottom: 3,
  },

  category: {
    fontSize: 11,
    color: '#8B5E83',
    fontWeight: '700',
  },

  description: {
    fontSize: 12,
    color: '#75665D',
    lineHeight: 18,
    marginTop: 13,
  },

  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 11,
  },

  locationIcon: {
    fontSize: 14,
    marginRight: 5,
  },

  locationText: {
    fontSize: 11,
    color: '#8A7B71',
  },

  divider: {
    height: 1,
    backgroundColor: '#F0E6DF',
    marginVertical: 14,
  },

  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  collabLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: '#44352D',
  },

  collabText: {
    fontSize: 10,
    color: '#9A8C83',
    marginTop: 3,
  },

  callButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#8B5E83',
    paddingHorizontal: 15,
    paddingVertical: 9,
    borderRadius: 12,
  },

  callIcon: {
    fontSize: 13,
    marginRight: 5,
  },

  callText: {
    fontSize: 12,
    fontWeight: '900',
    color: '#FFFFFF',
  },
});