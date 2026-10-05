import React, {
  useEffect,
  useState,
} from 'react';

import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Switch,
  Alert,
  ActivityIndicator,
} from 'react-native';

import { router } from 'expo-router';

import { supabase } from '../services/supabase';

import { useLanguage } from '../context/LanguageContext';

const categories = [
  'Food',
  'Crochet',
  'Art',
  'Home Decor',
  'Jewellery',
  'Clothing',
  'Gifts',
  'Other',
];

export default function Profile() {
  const { t } = useLanguage();

  const [role, setRole] = useState<
    'artisan' | 'buyer' | null
  >(null);

  const [name, setName] =
    useState('');

  const [phone, setPhone] =
    useState('');

  const [businessName, setBusinessName] =
    useState('');

  const [
    businessCategory,
    setBusinessCategory,
  ] = useState('');

  const [
    businessDescription,
    setBusinessDescription,
  ] = useState('');

  const [city, setCity] =
    useState('');

  const [pincode, setPincode] =
    useState('');

  const [
    collaborationEnabled,
    setCollaborationEnabled,
  ] = useState(false);

  const [email, setEmail] =
    useState('');

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        Alert.alert(
          t.profileLoginRequired,
          t.profileLoginAgain
        );
        return;
      }

      setEmail(user.email || '');

      const {
        data,
        error,
      } = await supabase
        .from('profiles')
        .select(`
          role,
          business_name,
          business_category,
          business_description,
          city,
          pincode,
          phone,
          collaboration_enabled
        `)
        .eq('id', user.id)
        .single();

      if (error) {
        console.log(
          'PROFILE LOAD ERROR:',
          error
        );
        return;
      }

      if (data) {
        setRole(data.role);

        setName(
          user.user_metadata?.full_name ||
            user.user_metadata?.name ||
            ''
        );

        setPhone(
          data.phone || ''
        );

        if (
          data.role === 'artisan'
        ) {
          setBusinessName(
            data.business_name || ''
          );

          setBusinessCategory(
            data.business_category || ''
          );

          setBusinessDescription(
            data.business_description || ''
          );

          setCity(
            data.city || ''
          );

          setPincode(
            data.pincode || ''
          );

          setCollaborationEnabled(
            data.collaboration_enabled ||
              false
          );
        }
      }
    } catch (error) {
      console.log(
        'PROFILE LOAD ERROR:',
        error
      );
    } finally {
      setLoading(false);
    }
  };

  const saveBuyerProfile =
    async () => {
      try {
        setSaving(true);

        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser();

        if (
          userError ||
          !user
        ) {
          Alert.alert(
            t.profileLoginRequired,
            t.profileLoginAgain
          );
          return;
        }

        const { error } =
          await supabase
            .from('profiles')
            .update({
              phone:
                phone.trim(),
            })
            .eq(
              'id',
              user.id
            );

        if (error) {
          console.log(
            'BUYER PROFILE SAVE ERROR:',
            error
          );

          Alert.alert(
            t.profileCouldNotSave,
            error.message
          );

          return;
        }

        Alert.alert(
          t.profileSaved,
          t.profileBuyerUpdated
        );
      } catch (error) {
        console.log(
          'BUYER PROFILE SAVE ERROR:',
          error
        );

        Alert.alert(
          t.profileSomethingWrong,
          t.profileTryAgain
        );
      } finally {
        setSaving(false);
      }
    };

  const saveSellerProfile =
    async () => {
      try {
        setSaving(true);

        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser();

        if (
          userError ||
          !user
        ) {
          Alert.alert(
            t.profileLoginRequired,
            t.profileLoginAgain
          );
          return;
        }

        if (
          !businessName.trim()
        ) {
          Alert.alert(
            t.profileBusinessNameRequired,
            t.profileEnterBusinessName
          );
          return;
        }

        if (!businessCategory) {
          Alert.alert(
            t.profileCategoryRequired,
            t.profileSelectCategory
          );
          return;
        }

        if (!city.trim()) {
          Alert.alert(
            t.profileCityRequired,
            t.profileEnterCity
          );
          return;
        }

        if (!phone.trim()) {
          Alert.alert(
            t.profilePhoneRequired,
            t.profileEnterPhone
          );
          return;
        }

        const { error } =
          await supabase
            .from('profiles')
            .update({
              business_name:
                businessName.trim(),

              business_category:
                businessCategory,

              business_description:
                businessDescription.trim(),

              city:
                city.trim(),

              pincode:
                pincode.trim(),

              phone:
                phone.trim(),

              collaboration_enabled:
                collaborationEnabled,
            })
            .eq(
              'id',
              user.id
            );

        if (error) {
          console.log(
            'SELLER PROFILE SAVE ERROR:',
            error
          );

          Alert.alert(
            t.profileCouldNotSave,
            error.message
          );

          return;
        }

        Alert.alert(
          t.profileSaved,
          t.profileBusinessUpdated
        );
      } catch (error) {
        console.log(
          'SELLER PROFILE SAVE ERROR:',
          error
        );

        Alert.alert(
          t.profileSomethingWrong,
          t.profileTryAgain
        );
      } finally {
        setSaving(false);
      }
    };

  if (loading) {
    return (
      <View
        style={
          styles.loadingScreen
        }
      >
        <ActivityIndicator
          size="large"
          color="#54245F"
        />

        <Text
          style={
            styles.loadingText
          }
        >
          {t.profileLoading}
        </Text>
      </View>
    );
  }

  const isSeller =
    role === 'artisan';

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={
        styles.content
      }
      showsVerticalScrollIndicator={
        false
      }
    >
      {/* HEADER */}

      <View
        style={styles.header}
      >
        <TouchableOpacity
          onPress={() =>
            router.back()
          }
        >
          <Text
            style={
              styles.backButton
            }
          >
            ‹
          </Text>
        </TouchableOpacity>

        <View>
          <Text
            style={
              styles.title
            }
          >
            {t.profileTitle}
          </Text>

          <Text
            style={
              styles.subtitle
            }
          >
            {isSeller
              ? t.profileSellerSubtitle
              : t.profileBuyerSubtitle}
          </Text>
        </View>
      </View>

      {/* PROFILE ICON */}

      <View
        style={
          styles.profileIcon
        }
      >
        <Text
          style={
            styles.profileIconText
          }
        >
          {isSeller
            ? '🏠'
            : '👤'}
        </Text>
      </View>

      {/* ======================= */}
      {/* BUYER */}
      {/* ======================= */}

      {!isSeller && (
        <>
          <Text
            style={
              styles.sectionTitle
            }
          >
            {t.profilePersonal}
          </Text>

          <View
            style={styles.card}
          >
            <Text
              style={styles.label}
            >
              {t.profileName}
            </Text>

            <TextInput
              style={
                styles.input
              }
              value={name}
              onChangeText={
                setName
              }
              placeholder={
                t.profileYourName
              }
              placeholderTextColor="#A99AAE"
            />

            <Text
              style={styles.label}
            >
              {t.profileEmail}
            </Text>

            <View
              style={
                styles.disabledInput
              }
            >
              <Text
                style={
                  styles.disabledInputText
                }
              >
                {email ||
                  t.profileYourEmail}
              </Text>
            </View>

            <Text
              style={styles.label}
            >
              {t.profilePhone}
            </Text>

            <TextInput
              style={
                styles.input
              }
              value={phone}
              onChangeText={
                setPhone
              }
              placeholder={
                t.profileContact
              }
              placeholderTextColor="#A99AAE"
              keyboardType="phone-pad"
            />
          </View>

          <Text
            style={
              styles.sectionTitle
            }
          >
            {t.profileShopping}
          </Text>

          <View
            style={
              styles.menuCard
            }
          >
            <TouchableOpacity
              style={
                styles.menuItem
              }
              onPress={() =>
                router.push(
                  '/bag'
                )
              }
            >
              <View
                style={
                  styles.menuIcon
                }
              >
                <Text>
                  🛍️
                </Text>
              </View>

              <View
                style={
                  styles.menuContent
                }
              >
                <Text
                  style={
                    styles.menuTitle
                  }
                >
                  {t.profileBag}
                </Text>

                <Text
                  style={
                    styles.menuDescription
                  }
                >
                  {
                    t.profileBagDesc
                  }
                </Text>
              </View>

              <Text
                style={
                  styles.menuArrow
                }
              >
                →
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={
                styles.menuItem
              }
              onPress={() =>
                Alert.alert(
                  t.profileWishlistAlert,
                  t.profileWishlistAlertText
                )
              }
            >
              <View
                style={
                  styles.menuIcon
                }
              >
                <Text>
                  ♡
                </Text>
              </View>

              <View
                style={
                  styles.menuContent
                }
              >
                <Text
                  style={
                    styles.menuTitle
                  }
                >
                  {
                    t.profileWishlist
                  }
                </Text>

                <Text
                  style={
                    styles.menuDescription
                  }
                >
                  {
                    t.profileWishlistDesc
                  }
                </Text>
              </View>

              <Text
                style={
                  styles.menuArrow
                }
              >
                →
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={
                styles.menuItem
              }
              onPress={() =>
                Alert.alert(
                  t.profileOrdersAlert,
                  t.profileOrdersAlertText
                )
              }
            >
              <View
                style={
                  styles.menuIcon
                }
              >
                <Text>
                  📦
                </Text>
              </View>

              <View
                style={
                  styles.menuContent
                }
              >
                <Text
                  style={
                    styles.menuTitle
                  }
                >
                  {
                    t.profileOrders
                  }
                </Text>

                <Text
                  style={
                    styles.menuDescription
                  }
                >
                  {
                    t.profileOrdersDesc
                  }
                </Text>
              </View>

              <Text
                style={
                  styles.menuArrow
                }
              >
                →
              </Text>
            </TouchableOpacity>
          </View>

          <Text
            style={
              styles.sectionTitle
            }
          >
            {
              t.profilePreferences
            }
          </Text>

          <View
            style={
              styles.menuCard
            }
          >
            <TouchableOpacity
              style={
                styles.menuItem
              }
            >
              <View
                style={
                  styles.menuIcon
                }
              >
                <Text>
                  🌐
                </Text>
              </View>

              <View
                style={
                  styles.menuContent
                }
              >
                <Text
                  style={
                    styles.menuTitle
                  }
                >
                  {
                    t.profileLanguage
                  }
                </Text>

                <Text
                  style={
                    styles.menuDescription
                  }
                >
                  {
                    t.profileEnglishHindi
                  }
                </Text>
              </View>

              <Text
                style={
                  styles.menuArrow
                }
              >
                →
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={
                styles.menuItem
              }
              onPress={() =>
                Alert.alert(
                  t.profileNotificationsAlert,
                  t.profileNotificationsAlertText
                )
              }
            >
              <View
                style={
                  styles.menuIcon
                }
              >
                <Text>
                  🔔
                </Text>
              </View>

              <View
                style={
                  styles.menuContent
                }
              >
                <Text
                  style={
                    styles.menuTitle
                  }
                >
                  {
                    t.profileNotifications
                  }
                </Text>

                <Text
                  style={
                    styles.menuDescription
                  }
                >
                  {
                    t.profileNotificationsDesc
                  }
                </Text>
              </View>

              <Text
                style={
                  styles.menuArrow
                }
              >
                →
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={
                styles.menuItem
              }
              onPress={() =>
                Alert.alert(
                  t.profileHelpAlert,
                  t.profileHelpAlertText
                )
              }
            >
              <View
                style={
                  styles.menuIcon
                }
              >
                <Text>
                  💬
                </Text>
              </View>

              <View
                style={
                  styles.menuContent
                }
              >
                <Text
                  style={
                    styles.menuTitle
                  }
                >
                  {
                    t.profileHelp
                  }
                </Text>

                <Text
                  style={
                    styles.menuDescription
                  }
                >
                  {
                    t.profileHelpDesc
                  }
                </Text>
              </View>

              <Text
                style={
                  styles.menuArrow
                }
              >
                →
              </Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={[
              styles.saveButton,
              saving &&
                styles.saveButtonDisabled,
            ]}
            onPress={
              saveBuyerProfile
            }
            disabled={saving}
          >
            {saving ? (
              <ActivityIndicator
                color="#FFFFFF"
              />
            ) : (
              <Text
                style={
                  styles.saveButtonText
                }
              >
                {t.profileSave}
              </Text>
            )}
          </TouchableOpacity>

          <Text
            style={
              styles.privacyText
            }
          >
            {
              t.profilePrivacyBuyer
            }
          </Text>
        </>
      )}

      {/* ======================= */}
      {/* SELLER / MY LITTLE SHOP */}
      {/* ======================= */}

      {isSeller && (
        <>
          <Text
            style={
              styles.sectionTitle
            }
          >
            {t.profileBusiness}
          </Text>

          <View
            style={styles.card}
          >
            <Text
              style={styles.label}
            >
              {
                t.profileBusinessName
              }
            </Text>

            <TextInput
              style={
                styles.input
              }
              value={
                businessName
              }
              onChangeText={
                setBusinessName
              }
              placeholder={
                t.profileBusinessNamePlaceholder
              }
              placeholderTextColor="#B3A69E"
            />

            <Text
              style={styles.label}
            >
              {
                t.profileBusinessCategory
              }
            </Text>

            <View
              style={
                styles.categoryGrid
              }
            >
              {categories.map(
                category => (
                  <TouchableOpacity
                    key={
                      category
                    }
                    style={[
                      styles.categoryButton,
                      businessCategory ===
                        category &&
                        styles.categoryButtonSelected,
                    ]}
                    onPress={() =>
                      setBusinessCategory(
                        category
                      )
                    }
                  >
                    <Text
                      style={[
                        styles.categoryText,
                        businessCategory ===
                          category &&
                          styles.categoryTextSelected,
                      ]}
                    >
                      {category}
                    </Text>
                  </TouchableOpacity>
                )
              )}
            </View>

            <Text
              style={styles.label}
            >
              {
                t.profileAboutBusiness
              }
            </Text>

            <TextInput
              style={[
                styles.input,
                styles.textArea,
              ]}
              value={
                businessDescription
              }
              onChangeText={
                setBusinessDescription
              }
              placeholder={
                t.profileAboutPlaceholder
              }
              placeholderTextColor="#B3A69E"
              multiline
              textAlignVertical="top"
            />
          </View>

          <Text
            style={
              styles.sectionTitle
            }
          >
            {t.profileLocation}
          </Text>

          <View
            style={styles.card}
          >
            <Text
              style={styles.label}
            >
              {t.profileCity}
            </Text>

            <TextInput
              style={
                styles.input
              }
              value={city}
              onChangeText={
                setCity
              }
              placeholder={
                t.profileCityPlaceholder
              }
              placeholderTextColor="#B3A69E"
            />

            <Text
              style={styles.label}
            >
              {t.profilePincode}
            </Text>

            <TextInput
              style={
                styles.input
              }
              value={pincode}
              onChangeText={
                setPincode
              }
              placeholder={
                t.profilePincodePlaceholder
              }
              placeholderTextColor="#B3A69E"
              keyboardType="number-pad"
              maxLength={6}
            />

            <Text
              style={styles.label}
            >
              {t.profilePhone}
            </Text>

            <TextInput
              style={
                styles.input
              }
              value={phone}
              onChangeText={
                setPhone
              }
              placeholder={
                t.profileContact
              }
              placeholderTextColor="#B3A69E"
              keyboardType="phone-pad"
            />
          </View>

          <Text
            style={
              styles.sectionTitle
            }
          >
            {
              t.profileCollaboration
            }
          </Text>

          <View
            style={
              styles.collaborationCard
            }
          >
            <View
              style={
                styles.collaborationIcon
              }
            >
              <Text
                style={
                  styles.collaborationIconText
                }
              >
                🤝
              </Text>
            </View>

            <View
              style={
                styles.collaborationContent
              }
            >
              <Text
                style={
                  styles.collaborationTitle
                }
              >
                {
                  t.profileAllowContact
                }
              </Text>

              <Text
                style={
                  styles.collaborationDescription
                }
              >
                {
                  t.profileCollaborationDesc
                }
              </Text>
            </View>

            <Switch
              value={
                collaborationEnabled
              }
              onValueChange={
                setCollaborationEnabled
              }
              trackColor={{
                false:
                  '#D9CEC6',
                true:
                  '#D9B5D2',
              }}
              thumbColor={
                collaborationEnabled
                  ? '#8B5E83'
                  : '#FFFFFF'
              }
            />
          </View>

          <TouchableOpacity
            style={[
              styles.saveButton,
              saving &&
                styles.saveButtonDisabled,
            ]}
            onPress={
              saveSellerProfile
            }
            disabled={saving}
          >
            {saving ? (
              <ActivityIndicator
                color="#FFFFFF"
              />
            ) : (
              <Text
                style={
                  styles.saveButtonText
                }
              >
                {t.profileSave}
              </Text>
            )}
          </TouchableOpacity>

          <Text
            style={
              styles.privacyText
            }
          >
            {
              t.profilePrivacySeller
            }
          </Text>
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF8F0',
  },

  content: {
    padding: 20,
    paddingBottom: 45,
  },

  loadingScreen: {
    flex: 1,
    backgroundColor: '#FFF8F0',
    justifyContent: 'center',
    alignItems: 'center',
  },

  loadingText: {
    marginTop: 12,
    color: '#8A7B71',
    fontSize: 13,
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },

  backButton: {
    fontSize: 38,
    color: '#44352D',
    lineHeight: 38,
    marginRight: 10,
  },

  title: {
    fontSize: 24,
    fontWeight: '900',
    color: '#54245F',
  },

  subtitle: {
    fontSize: 12,
    color: '#8A7B71',
    marginTop: 3,
  },

  profileIcon: {
    width: 76,
    height: 76,
    borderRadius: 25,
    backgroundColor: '#F4EEFF',
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    marginBottom: 25,
  },

  profileIconText: {
    fontSize: 34,
  },

  sectionTitle: {
    fontSize: 17,
    fontWeight: '900',
    color: '#44352D',
    marginBottom: 11,
    marginTop: 5,
  },

  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 17,
    borderWidth: 1,
    borderColor: '#EADDD3',
    marginBottom: 22,
  },

  label: {
    fontSize: 12,
    fontWeight: '800',
    color: '#44352D',
    marginBottom: 7,
    marginTop: 5,
  },

  input: {
    backgroundColor: '#FFF9F5',
    borderWidth: 1,
    borderColor: '#EADDD3',
    borderRadius: 13,
    paddingHorizontal: 13,
    paddingVertical: 12,
    fontSize: 13,
    color: '#44352D',
    marginBottom: 14,
  },

  disabledInput: {
    backgroundColor: '#F5F1F4',
    borderWidth: 1,
    borderColor: '#E7DFE7',
    borderRadius: 13,
    paddingHorizontal: 13,
    paddingVertical: 12,
    marginBottom: 14,
  },

  disabledInputText: {
    fontSize: 13,
    color: '#8A7A91',
  },

  textArea: {
    height: 90,
    paddingTop: 12,
  },

  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 10,
  },

  categoryButton: {
    paddingHorizontal: 13,
    paddingVertical: 9,
    borderRadius: 12,
    backgroundColor: '#F8F3EF',
    borderWidth: 1,
    borderColor: '#EADDD3',
  },

  categoryButtonSelected: {
    backgroundColor: '#8B5E83',
    borderColor: '#8B5E83',
  },

  categoryText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#75665D',
  },

  categoryTextSelected: {
    color: '#FFFFFF',
  },

  menuCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#EADDD3',
    marginBottom: 22,
    overflow: 'hidden',
  },

  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#F1E9E5',
  },

  menuIcon: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: '#F4EEFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },

  menuContent: {
    flex: 1,
  },

  menuTitle: {
    color: '#44352D',
    fontSize: 13,
    fontWeight: '900',
    marginBottom: 3,
  },

  menuDescription: {
    color: '#8A7B71',
    fontSize: 10,
  },

  menuArrow: {
    color: '#8B5E83',
    fontSize: 19,
    fontWeight: '800',
  },

  collaborationCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FCEFF4',
    borderRadius: 20,
    padding: 16,
    marginBottom: 20,
  },

  collaborationIcon: {
    width: 45,
    height: 45,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },

  collaborationIconText: {
    fontSize: 22,
  },

  collaborationContent: {
    flex: 1,
    marginRight: 8,
  },

  collaborationTitle: {
    fontSize: 13,
    fontWeight: '900',
    color: '#44352D',
    marginBottom: 5,
  },

  collaborationDescription: {
    fontSize: 10,
    lineHeight: 15,
    color: '#75665D',
  },

  saveButton: {
    backgroundColor: '#54245F',
    borderRadius: 15,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },

  saveButtonDisabled: {
    opacity: 0.7,
  },

  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '900',
  },

  privacyText: {
    textAlign: 'center',
    fontSize: 10,
    color: '#9A8C83',
    lineHeight: 15,
    marginTop: 12,
    paddingHorizontal: 15,
  },
});