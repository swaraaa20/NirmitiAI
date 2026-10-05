import React from 'react';

import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
} from 'react-native';

import { router } from 'expo-router';

import { useLanguage } from '../context/LanguageContext';

const COLORS = {
  background: '#F8F7EA',
  cream: '#FFFDF4',
  peach: '#F4D4B3',
  peachLight: '#FCE9D7',
  terracotta: '#C96F52',
  terracottaLight: '#F3D4C7',
  brown: '#684536',
  brownDark: '#4B3026',
  green: '#456B42',
  greenLight: '#E3EAD9',
  sage: '#AAB79B',
  plum: '#76506B',
  plumLight: '#E9DCE5',
  yellow: '#EED58D',
  yellowLight: '#F7EBC1',
  text: '#403630',
  muted: '#81756D',
  border: '#E6DDCF',
  white: '#FFFFFF',
};

const categories = [
  {
    name: 'Food',
    emoji: '🍪',
    color: COLORS.peachLight,
  },
  {
    name: 'Crochet',
    emoji: '🧶',
    color: COLORS.plumLight,
  },
  {
    name: 'Art',
    emoji: '🎨',
    color: COLORS.yellowLight,
  },
  {
    name: 'Jewellery',
    emoji: '💍',
    color: COLORS.greenLight,
  },
];

export default function HomeScreen() {
  const { language, setLanguage, t } = useLanguage();

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {/* HEADER */}

      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.brand}>
            निर्मितिAI
          </Text>

          <Text style={styles.smallGreeting}>
            {t.homeGreeting}
          </Text>

          <Text style={styles.greeting}>
            {t.homeHello}
          </Text>
        </View>

        <View style={styles.headerRight}>
          <View style={styles.languageToggle}>
            <Pressable
              style={[
                styles.languageButton,
                language === 'en' &&
                  styles.languageButtonActive,
              ]}
              onPress={() => setLanguage('en')}
            >
              <Text
                style={[
                  styles.languageText,
                  language === 'en' &&
                    styles.languageTextActive,
                ]}
              >
                EN
              </Text>
            </Pressable>

            <Pressable
              style={[
                styles.languageButton,
                language === 'hi' &&
                  styles.languageButtonActive,
              ]}
              onPress={() => setLanguage('hi')}
            >
              <Text
                style={[
                  styles.languageText,
                  language === 'hi' &&
                    styles.languageTextActive,
                ]}
              >
                हिंदी
              </Text>
            </Pressable>
          </View>

          <Pressable
            style={styles.profileButton}
            onPress={() => router.push('/profile')}
          >
            <Text style={styles.profileEmoji}>
              👩🏻
            </Text>
          </Pressable>
        </View>
      </View>

      {/* HERO */}

      <View style={styles.heroCard}>
        <View style={styles.heroLeafOne} />
        <View style={styles.heroLeafTwo} />

        <View style={styles.heroContent}>
          <View style={styles.heroBadge}>
            <Text style={styles.heroBadgeText}>
              {t.homeBusinessLabel}
            </Text>
          </View>

          <Text style={styles.heroTitle}>
            {t.homeHeroTitle}
          </Text>

          <Text style={styles.heroDescription}>
            {t.homeHeroDescription}
          </Text>

          <Pressable
            style={styles.createButton}
            onPress={() =>
              router.push('/add-product')
            }
          >
            <View style={styles.createIcon}>
              <Text style={styles.createIconText}>
                +
              </Text>
            </View>

            <Text style={styles.createButtonText}>
              {t.homeCreateListing}
            </Text>
          </Pressable>
        </View>

        <View style={styles.heroMaker}>
          <View style={styles.makerCircle}>
            <Text style={styles.makerEmoji}>
              👩🏻‍🍳
            </Text>
          </View>

          <View style={styles.makerTag}>
            <Text style={styles.makerTagSmall}>
              made
            </Text>

            <Text style={styles.makerTagLarge}>
              with love
            </Text>
          </View>
        </View>
      </View>

      {/* BUSINESS */}

      <View style={styles.sectionHeader}>
        <View>
          <Text style={styles.sectionTitle}>
            {language === 'hi'
              ? 'आपका व्यवसाय'
              : 'Your business'}
          </Text>

          <View style={styles.titleUnderline} />
        </View>

        <Text style={styles.sectionAccent}>
          {language === 'hi'
            ? 'इस महीने'
            : 'This month'}
        </Text>
      </View>

      <View style={styles.statsRow}>
        <View
          style={[
            styles.statCard,
            {
              backgroundColor:
                COLORS.yellowLight,
            },
          ]}
        >
          <View style={styles.statIconCircle}>
            <Text style={styles.statEmoji}>
              💰
            </Text>
          </View>

          <Text style={styles.statValue}>
            ₹4,850
          </Text>

          <Text style={styles.statLabel}>
            {t.homeEarnings}
          </Text>
        </View>

        <View
          style={[
            styles.statCard,
            {
              backgroundColor:
                COLORS.greenLight,
            },
          ]}
        >
          <View style={styles.statIconCircle}>
            <Text style={styles.statEmoji}>
              📦
            </Text>
          </View>

          <Text style={styles.statValue}>
            12
          </Text>

          <Text style={styles.statLabel}>
            {t.homeOrders}
          </Text>
        </View>

        <View
          style={[
            styles.statCard,
            {
              backgroundColor:
                COLORS.peachLight,
            },
          ]}
        >
          <View style={styles.statIconCircle}>
            <Text style={styles.statEmoji}>
              ❤️
            </Text>
          </View>

          <Text style={styles.statValue}>
            28
          </Text>

          <Text style={styles.statLabel}>
            {t.homeCustomers}
          </Text>
        </View>
      </View>

      {/* CATEGORIES */}

      <View style={styles.sectionHeader}>
        <View>
          <Text style={styles.sectionTitle}>
            {t.homeCategories}
          </Text>

          <View style={styles.titleUnderline} />
        </View>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={
          styles.categoryScroll
        }
      >
        {categories.map(category => (
          <Pressable
            key={category.name}
            style={styles.categoryCard}
            onPress={() =>
              router.push('/add-product')
            }
          >
            <View
              style={[
                styles.categoryIcon,
                {
                  backgroundColor:
                    category.color,
                },
              ]}
            >
              <Text style={styles.categoryEmoji}>
                {category.emoji}
              </Text>
            </View>

            <Text style={styles.categoryName}>
              {language === 'hi'
                ? category.name === 'Food'
                  ? 'खाना'
                  : category.name ===
                    'Crochet'
                  ? 'क्रोशिया'
                  : category.name === 'Art'
                  ? 'कला'
                  : 'आभूषण'
                : category.name}
            </Text>
          </Pressable>
        ))}

        <Pressable
          style={styles.categoryCard}
          onPress={() =>
            router.push('/add-product')
          }
        >
          <View style={styles.moreCategoryIcon}>
            <Text style={styles.moreCategoryText}>
              +
            </Text>
          </View>

          <Text style={styles.categoryName}>
            {t.homeMore}
          </Text>
        </Pressable>
      </ScrollView>

      {/* PRODUCTS */}

      <View style={styles.sectionHeader}>
        <View>
          <Text style={styles.sectionTitle}>
            {t.homeMadeByYou} ✨
          </Text>

          <View style={styles.titleUnderline} />
        </View>

        <Pressable
          onPress={() =>
            router.push('/add-product')
          }
        >
          <Text style={styles.viewAll}>
            {language === 'hi'
              ? 'सभी देखें'
              : 'See all'}
          </Text>
        </Pressable>
      </View>

      <View style={styles.emptyProducts}>
        <View style={styles.emptyProductDecor}>
          <Text style={styles.emptyProductEmoji}>
            🛍️
          </Text>
        </View>

        <Text style={styles.emptyProductTitle}>
          {language === 'hi'
            ? 'आपकी बनाई चीज़ें यहाँ होंगी'
            : 'Your creations belong here'}
        </Text>

        <Text style={styles.emptyProductText}>
          {language === 'hi'
            ? 'अपना पहला उत्पाद जोड़ें और अपनी छोटी दुकान बनाना शुरू करें।'
            : 'Add your first product and start building your little shop.'}
        </Text>

        <Pressable
          style={styles.emptyProductButton}
          onPress={() =>
            router.push('/add-product')
          }
        >
          <Text
            style={
              styles.emptyProductButtonText
            }
          >
            {t.homeFirstCreation}
          </Text>
        </Pressable>
      </View>

      {/* HELP */}

      <View style={styles.sectionHeader}>
        <View>
          <Text style={styles.sectionTitle}>
            {language === 'hi'
              ? 'थोड़ी मदद चाहिए?'
              : 'Need a little help?'}
          </Text>

          <View style={styles.titleUnderline} />
        </View>
      </View>

      <View style={styles.helpGrid}>
        {/* BUSINESS INSIGHTS */}

        <Pressable
          style={[
            styles.helpCard,
            {
              backgroundColor:
                COLORS.plumLight,
            },
          ]}
          onPress={() =>
            router.push('/business-insights')
          }
        >
          <View style={styles.helpIcon}>
            <Text style={styles.helpEmoji}>
              📈
            </Text>
          </View>

          <Text style={styles.helpTitle}>
            {t.homeBusinessInsights}
          </Text>

          <Text style={styles.helpText}>
            {t.homeBusinessInsightsDesc}
          </Text>

          <Text style={styles.helpArrow}>
            →
          </Text>
        </Pressable>

        {/* COLLABORATE */}

        <Pressable
          style={[
            styles.helpCard,
            {
              backgroundColor:
                COLORS.peachLight,
            },
          ]}
          onPress={() =>
            router.push('/collaborate')
          }
        >
          <View style={styles.helpIcon}>
            <Text style={styles.helpEmoji}>
              🤝
            </Text>
          </View>

          <Text style={styles.helpTitle}>
            {t.homeMeetMakers}
          </Text>

          <Text style={styles.helpText}>
            {t.homeMeetMakersDesc}
          </Text>

          <Text style={styles.helpArrow}>
            →
          </Text>
        </Pressable>

        {/* SUPPORT */}

        <Pressable
          style={[
            styles.helpCard,
            {
              backgroundColor:
                COLORS.greenLight,
            },
          ]}
          onPress={() =>
            router.push('/loans-schemes')
          }
        >
          <View style={styles.helpIcon}>
            <Text style={styles.helpEmoji}>
              💛
            </Text>
          </View>

          <Text style={styles.helpTitle}>
            {t.homeSupport}
          </Text>

          <Text style={styles.helpText}>
            {t.homeSupportDesc}
          </Text>

          <Text style={styles.helpArrow}>
            →
          </Text>
        </Pressable>

        {/* PROFILE */}

        <Pressable
          style={[
            styles.helpCard,
            {
              backgroundColor:
                COLORS.yellowLight,
            },
          ]}
          onPress={() =>
            router.push('/profile')
          }
        >
          <View style={styles.helpIcon}>
            <Text style={styles.helpEmoji}>
              🏠
            </Text>
          </View>

          <Text style={styles.helpTitle}>
            {t.homeLittleShop}
          </Text>

          <Text style={styles.helpText}>
            {t.homeLittleShopDesc}
          </Text>

          <Text style={styles.helpArrow}>
            →
          </Text>
        </Pressable>
      </View>

      {/* BRAND MESSAGE */}

      <View style={styles.bottomMessage}>
        <View style={styles.flowerRow}>
          <Text>🌿</Text>
          <Text>🌼</Text>
          <Text>🌿</Text>
        </View>

        <Text style={styles.bottomTitle}>
          निर्मितिAI
        </Text>

        <Text style={styles.bottomText}>
          {t.homeFooterDescription}
        </Text>
      </View>

      <View style={styles.bottomSpace} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  content: {
    padding: 20,
    paddingTop: 18,
    paddingBottom: 40,
  },

  /* HEADER */

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 22,
  },

  headerLeft: {
    flex: 1,
  },

  brand: {
    fontSize: 19,
    fontWeight: '900',
    color: COLORS.green,
    marginBottom: 8,
    letterSpacing: 0.2,
  },

  smallGreeting: {
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 1.2,
    color: COLORS.terracotta,
    marginBottom: 3,
  },

  greeting: {
    fontSize: 25,
    fontWeight: '900',
    color: COLORS.brownDark,
  },

  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  languageToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.cream,
    borderRadius: 14,
    padding: 3,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginRight: 8,
  },

  languageButton: {
    paddingHorizontal: 9,
    paddingVertical: 7,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },

  languageButtonActive: {
    backgroundColor: COLORS.green,
  },

  languageText: {
    fontSize: 11,
    fontWeight: '800',
    color: COLORS.green,
  },

  languageTextActive: {
    color: COLORS.white,
  },

  profileButton: {
    width: 48,
    height: 48,
    borderRadius: 17,
    backgroundColor: COLORS.peach,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.cream,
  },

  profileEmoji: {
    fontSize: 24,
  },

  /* HERO */

  heroCard: {
    backgroundColor: COLORS.green,
    borderRadius: 28,
    padding: 23,
    minHeight: 300,
    marginBottom: 28,
    overflow: 'hidden',
    position: 'relative',
  },

  heroContent: {
    width: '67%',
    zIndex: 2,
  },

  heroBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#5E8059',
    paddingHorizontal: 11,
    paddingVertical: 6,
    borderRadius: 20,
    marginBottom: 14,
  },

  heroBadgeText: {
    color: COLORS.yellow,
    fontSize: 8,
    fontWeight: '900',
    letterSpacing: 0.7,
  },

  heroTitle: {
    fontSize: 28,
    lineHeight: 33,
    fontWeight: '900',
    color: COLORS.cream,
    letterSpacing: -0.5,
  },

  heroDescription: {
    fontSize: 11,
    lineHeight: 17,
    color: '#E7EBD9',
    marginTop: 12,
    marginBottom: 18,
  },

  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: COLORS.terracotta,
    paddingHorizontal: 13,
    paddingVertical: 11,
    borderRadius: 14,
  },

  createIcon: {
    width: 22,
    height: 22,
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.18)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 7,
  },

  createIconText: {
    color: COLORS.white,
    fontSize: 18,
    fontWeight: '700',
    lineHeight: 19,
  },

  createButtonText: {
    color: COLORS.white,
    fontSize: 11,
    fontWeight: '900',
  },

  heroMaker: {
    position: 'absolute',
    right: 8,
    bottom: 18,
    width: 135,
    alignItems: 'center',
    transform: [
      {
        rotate: '5deg',
      },
    ],
  },

  makerCircle: {
    width: 122,
    height: 122,
    borderRadius: 61,
    backgroundColor: COLORS.peach,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 8,
    borderColor: '#5E8059',
  },

  makerEmoji: {
    fontSize: 57,
  },

  makerTag: {
    alignItems: 'center',
    marginTop: 4,
  },

  makerTagSmall: {
    color: COLORS.yellow,
    fontSize: 13,
    fontWeight: '700',
    fontStyle: 'italic',
  },

  makerTagLarge: {
    color: COLORS.cream,
    fontSize: 16,
    fontWeight: '900',
  },

  heroLeafOne: {
    position: 'absolute',
    width: 105,
    height: 105,
    borderRadius: 55,
    backgroundColor: '#5E8059',
    right: -48,
    top: -40,
  },

  heroLeafTwo: {
    position: 'absolute',
    width: 62,
    height: 62,
    borderRadius: 32,
    backgroundColor: COLORS.terracotta,
    right: 20,
    top: -29,
  },

  /* SECTIONS */

  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 13,
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: COLORS.brownDark,
  },

  titleUnderline: {
    width: 32,
    height: 3,
    borderRadius: 3,
    backgroundColor: COLORS.terracotta,
    marginTop: 5,
  },

  sectionAccent: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.muted,
    marginTop: 2,
  },

  /* STATS */

  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 29,
  },

  statCard: {
    width: '31.5%',
    borderRadius: 20,
    padding: 13,
    minHeight: 112,
    borderWidth: 1,
    borderColor: 'rgba(104,69,54,0.05)',
  },

  statIconCircle: {
    width: 34,
    height: 34,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },

  statEmoji: {
    fontSize: 17,
  },

  statValue: {
    fontSize: 18,
    fontWeight: '900',
    color: COLORS.brownDark,
  },

  statLabel: {
    fontSize: 10,
    color: COLORS.text,
    marginTop: 2,
    fontWeight: '600',
  },

  /* CATEGORIES */

  categoryScroll: {
    paddingRight: 15,
    marginBottom: 28,
  },

  categoryCard: {
    width: 82,
    marginRight: 12,
    alignItems: 'center',
  },

  categoryIcon: {
    width: 70,
    height: 70,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    borderWidth: 1,
    borderColor: 'rgba(104,69,54,0.04)',
  },

  categoryEmoji: {
    fontSize: 30,
  },

  categoryName: {
    fontSize: 10,
    fontWeight: '800',
    color: COLORS.text,
  },

  moreCategoryIcon: {
    width: 70,
    height: 70,
    borderRadius: 25,
    backgroundColor: COLORS.cream,
    borderWidth: 1,
    borderColor: COLORS.border,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },

  moreCategoryText: {
    fontSize: 28,
    color: COLORS.green,
  },

  /* PRODUCTS */

  viewAll: {
    fontSize: 11,
    color: COLORS.terracotta,
    fontWeight: '900',
  },

  emptyProducts: {
    backgroundColor: COLORS.cream,
    borderRadius: 25,
    padding: 25,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 28,
  },

  emptyProductDecor: {
    width: 68,
    height: 68,
    borderRadius: 24,
    backgroundColor: COLORS.yellowLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },

  emptyProductEmoji: {
    fontSize: 30,
  },

  emptyProductTitle: {
    fontSize: 15,
    fontWeight: '900',
    color: COLORS.brownDark,
    marginBottom: 5,
  },

  emptyProductText: {
    fontSize: 11,
    color: COLORS.muted,
    textAlign: 'center',
    lineHeight: 17,
    maxWidth: 270,
    marginBottom: 15,
  },

  emptyProductButton: {
    backgroundColor: COLORS.green,
    paddingHorizontal: 19,
    paddingVertical: 11,
    borderRadius: 14,
  },

  emptyProductButtonText: {
    color: COLORS.white,
    fontSize: 11,
    fontWeight: '900',
  },

  /* HELP */

  helpGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 28,
  },

  helpCard: {
    width: '48%',
    minHeight: 150,
    borderRadius: 21,
    padding: 15,
    marginBottom: 11,
    borderWidth: 1,
    borderColor: 'rgba(104,69,54,0.05)',
    position: 'relative',
  },

  helpIcon: {
    width: 39,
    height: 39,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },

  helpEmoji: {
    fontSize: 21,
  },

  helpTitle: {
    fontSize: 13,
    fontWeight: '900',
    color: COLORS.brownDark,
    marginBottom: 5,
    paddingRight: 10,
  },

  helpText: {
    fontSize: 10,
    lineHeight: 15,
    color: COLORS.text,
    paddingRight: 5,
  },

  helpArrow: {
    position: 'absolute',
    right: 15,
    bottom: 13,
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.brown,
  },

  /* FOOTER */

  bottomMessage: {
    alignItems: 'center',
    paddingTop: 4,
    paddingBottom: 12,
  },

  flowerRow: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 7,
  },

  bottomTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: COLORS.green,
    marginBottom: 5,
  },

  bottomText: {
    fontSize: 10,
    color: COLORS.muted,
    textAlign: 'center',
    maxWidth: 280,
  },

  bottomSpace: {
    height: 20,
  },
});