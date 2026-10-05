import {
  useLocalSearchParams,
  router,
} from 'expo-router';

import {
  View,
  Text,
  Pressable,
  ScrollView,
  StyleSheet,
  Image,
  ActivityIndicator,
  Alert,
  Linking,
} from 'react-native';

import { useEffect, useState } from 'react';

import { useCart } from '../../context/CartContext';

import { supabase } from '../../services/supabase';

export default function ProductDetails() {
  const { id } = useLocalSearchParams();

  const { addToCart } = useCart();

  const [product, setProduct] =
    useState<any>(null);

  const [artisan, setArtisan] =
    useState<any>(null);

  const [loading, setLoading] =
    useState(true);

  const [liked, setLiked] =
    useState(false);

  const makerName =
    artisan?.full_name &&
    artisan.full_name !== 'Test Artisan'
      ? artisan.full_name
      : 'A Homegrown Maker';

  useEffect(() => {
    fetchProduct();
  }, [id]);

  const fetchProduct = async () => {
    try {
      setLoading(true);

      const { data, error } =
        await supabase
          .from('products')
          .select('*')
          .eq('id', id)
          .single();

      if (error) {
        console.log(
          'PRODUCT DETAILS ERROR:',
          error
        );

        setProduct(null);
        return;
      }

      setProduct(data);

      const {
        data: artisanData,
        error: artisanError,
      } = await supabase.rpc(
        'get_artisan_contact',
        {
          artisan_uuid:
            data.artisan_id,
        }
      );

      if (artisanError) {
        console.log(
          'ARTISAN CONTACT ERROR:',
          artisanError
        );
      } else if (
        artisanData &&
        artisanData.length > 0
      ) {
        setArtisan(
          artisanData[0]
        );
      }
    } catch (error) {
      console.log(
        'ERROR:',
        error
      );

      setProduct(null);
    } finally {
      setLoading(false);
    }
  };

 const handleAddToBag = async () => {
  await addToCart(product);

  Alert.alert(
    'Added to Bag 🛍️',
    `${product.product_name} has been added to your bag.`,
    [
      {
        text: 'Continue Shopping',
        style: 'cancel',
      },
      {
        text: 'View Bag',
        onPress: () =>
          router.push('/bag'),
      },
    ]
  );
};

 const handleBuyNow = async () => {
  await addToCart(product);

  router.push('/checkout');
};
  const handleWhatsApp = async () => {
    if (!artisan?.phone) {
      Alert.alert(
        'Contact unavailable',
        'The maker has not added a WhatsApp number yet.'
      );

      return;
    }

    const phoneNumber =
      `91${artisan.phone}`;

    const whatsappName =
      artisan?.full_name &&
      artisan.full_name !== 'Test Artisan'
        ? artisan.full_name
        : 'there';

    const message =
      `Hi ${whatsappName}! I'm interested in your product "${product.product_name}" listed on निर्मितिAI.`;

    const url =
      `https://wa.me/${phoneNumber}?text=${encodeURIComponent(
        message
      )}`;

    const supported =
      await Linking.canOpenURL(
        url
      );

    if (supported) {
      await Linking.openURL(
        url
      );
    } else {
      Alert.alert(
        'WhatsApp Not Available',
        'Please install WhatsApp to contact the maker.'
      );
    }
  };

  if (loading) {
    return (
      <View
        style={
          styles.loadingContainer
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
          Finding this creation...
        </Text>
      </View>
    );
  }

  if (!product) {
    return (
      <View
        style={
          styles.errorContainer
        }
      >
        <View
          style={
            styles.errorIcon
          }
        >
          <Text
            style={
              styles.errorEmoji
            }
          >
            🔎
          </Text>
        </View>

        <Text
          style={
            styles.errorText
          }
        >
          Creation not found
        </Text>

        <Pressable
          style={
            styles.errorBackButton
          }
          onPress={() =>
            router.back()
          }
        >
          <Text
            style={
              styles.errorBackButtonText
            }
          >
            Go Back
          </Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View
      style={styles.container}
    >
      {/* TOP BAR */}

      <View
        style={styles.topBar}
      >
        <Pressable
          onPress={() =>
            router.back()
          }
          style={
            styles.circleButton
          }
        >
          <Text
            style={
              styles.backIcon
            }
          >
            ‹
          </Text>
        </Pressable>

        <Text
          style={
            styles.topBarTitle
          }
        >
          Creation
        </Text>

        <View
          style={
            styles.topBarRight
          }
        >
          <Pressable
            onPress={() =>
              setLiked(!liked)
            }
            style={
              styles.circleButton
            }
          >
            <Text
              style={
                styles.heartIcon
              }
            >
              {liked
                ? '♥'
                : '♡'}
            </Text>
          </Pressable>

          <Pressable
            onPress={() =>
              router.push('/bag')
            }
            style={
              styles.circleButton
            }
          >
            <Text
              style={
                styles.bagIcon
              }
            >
              🛍
            </Text>
          </Pressable>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={
          false
        }
        contentContainerStyle={
          styles.scrollContent
        }
      >
        {/* PRODUCT IMAGE */}

        <View
          style={
            styles.imageWrapper
          }
        >
          <Image
            source={{
              uri: product.image_url,
            }}
            style={
              styles.productImage
            }
          />

          <View
            style={
              styles.madeBadge
            }
          >
            <Text
              style={
                styles.madeBadgeText
              }
            >
              ✨ Made at home
            </Text>
          </View>
        </View>

        {/* MAIN CONTENT */}

        <View
          style={styles.content}
        >
          {/* CATEGORY */}

          {product.category && (
            <View
              style={
                styles.categoryPill
              }
            >
              <Text
                style={
                  styles.categoryPillText
                }
              >
                {product.category}
              </Text>
            </View>
          )}

          {/* TITLE */}

          <Text
            style={
              styles.productName
            }
          >
            {product.product_name}
          </Text>

          {/* MAKER */}

          <Pressable
            style={
              styles.makerMiniRow
            }
          >
            <View
              style={
                styles.makerMiniAvatar
              }
            >
              <Text
                style={
                  styles.makerMiniEmoji
                }
              >
                👩🏻
              </Text>
            </View>

            <View
              style={
                styles.makerMiniInfo
              }
            >
              <Text
                style={
                  styles.makerMiniLabel
                }
              >
                MADE BY
              </Text>

              <Text
                style={
                  styles.makerMiniName
                }
              >
                {makerName}
              </Text>
            </View>

            <Text
              style={
                styles.makerMiniArrow
              }
            >
              ›
            </Text>
          </Pressable>

          {/* PRICE */}

          <View
            style={
              styles.priceRow
            }
          >
            <Text
              style={
                styles.price
              }
            >
              ₹
              {Number(
                product.selling_price
              ).toLocaleString(
                'en-IN'
              )}
            </Text>

            <View
              style={
                styles.trustPill
              }
            >
              <Text
                style={
                  styles.trustPillText
                }
              >
                ✓ Direct from maker
              </Text>
            </View>
          </View>

          <View
            style={styles.divider}
          />

          {/* ABOUT */}

          <Text
            style={
              styles.sectionTitle
            }
          >
            About this creation
          </Text>

          <Text
            style={
              styles.description
            }
          >
            {product.description_en ||
              'A thoughtfully made creation from a home-based maker.'}
          </Text>

          {/* PRODUCT DETAILS */}

          {(product.material ||
            product.category) && (
            <>
              <Text
                style={
                  styles.sectionTitle
                }
              >
                Details
              </Text>

              <View
                style={
                  styles.detailsGrid
                }
              >
                {product.material && (
                  <View
                    style={
                      styles.detailCard
                    }
                  >
                    <View
                      style={
                        styles.detailIcon
                      }
                    >
                      <Text>
                        🧵
                      </Text>
                    </View>

                    <Text
                      style={
                        styles.detailLabel
                      }
                    >
                      Material
                    </Text>

                    <Text
                      style={
                        styles.detailValue
                      }
                    >
                      {
                        product.material
                      }
                    </Text>
                  </View>
                )}

                {product.category && (
                  <View
                    style={
                      styles.detailCard
                    }
                  >
                    <View
                      style={
                        styles.detailIcon
                      }
                    >
                      <Text>
                        ✨
                      </Text>
                    </View>

                    <Text
                      style={
                        styles.detailLabel
                      }
                    >
                      Category
                    </Text>

                    <Text
                      style={
                        styles.detailValue
                      }
                    >
                      {
                        product.category
                      }
                    </Text>
                  </View>
                )}
              </View>
            </>
          )}

          {/* WHY YOU'LL LOVE IT */}

          <Text
            style={
              styles.sectionTitle
            }
          >
            Why you'll love it
          </Text>

          <View
            style={
              styles.loveGrid
            }
          >
            <View
              style={
                styles.loveCard
              }
            >
              <Text
                style={
                  styles.loveEmoji
                }
              >
                🏠
              </Text>

              <Text
                style={
                  styles.loveTitle
                }
              >
                Made at home
              </Text>

              <Text
                style={
                  styles.loveText
                }
              >
                Created in a small home business.
              </Text>
            </View>

            <View
              style={
                styles.loveCard
              }
            >
              <Text
                style={
                  styles.loveEmoji
                }
              >
                ❤️
              </Text>

              <Text
                style={
                  styles.loveTitle
                }
              >
                Made with care
              </Text>

              <Text
                style={
                  styles.loveText
                }
              >
                Every creation gets personal attention.
              </Text>
            </View>

            <View
              style={
                styles.loveCard
              }
            >
              <Text
                style={
                  styles.loveEmoji
                }
              >
                🤝
              </Text>

              <Text
                style={
                  styles.loveTitle
                }
              >
                Support a maker
              </Text>

              <Text
                style={
                  styles.loveText
                }
              >
                Your purchase supports a home business.
              </Text>
            </View>

            <View
              style={
                styles.loveCard
              }
            >
              <Text
                style={
                  styles.loveEmoji
                }
              >
                📦
              </Text>

              <Text
                style={
                  styles.loveTitle
                }
              >
                Direct purchase
              </Text>

              <Text
                style={
                  styles.loveText
                }
              >
                Shop directly from the person who made it.
              </Text>
            </View>
          </View>

          {/* MEET THE MAKER */}

          <Text
            style={
              styles.sectionTitle
            }
          >
            Meet the maker
          </Text>

          <View
            style={
              styles.makerCard
            }
          >
            <View
              style={
                styles.makerAvatar
              }
            >
              <Text
                style={
                  styles.makerAvatarEmoji
                }
              >
                👩🏻
              </Text>
            </View>

            <View
              style={
                styles.makerInfo
              }
            >
              <Text
                style={
                  styles.makerLabel
                }
              >
                HOME BUSINESS
              </Text>

              <Text
                style={
                  styles.makerName
                }
              >
                {makerName}
              </Text>

              <Text
                style={
                  styles.makerLocation
                }
              >
                📍 Home-based business
              </Text>
            </View>

            <Pressable
              onPress={
                handleWhatsApp
              }
              style={
                styles.contactButton
              }
            >
              <Text
                style={
                  styles.contactButtonText
                }
              >
                Chat
              </Text>
            </Pressable>
          </View>

          {/* MESSAGE */}

          <View
            style={
              styles.messageCard
            }
          >
            <View
              style={
                styles.messageIcon
              }
            >
              <Text>
                🌷
              </Text>
            </View>

            <View
              style={
                styles.messageContent
              }
            >
              <Text
                style={
                  styles.messageTitle
                }
              >
                Every purchase matters
              </Text>

              <Text
                style={
                  styles.messageText
                }
              >
                When you buy from GharSe,
                you're supporting someone's
                passion, skills and small
                home business.
              </Text>
            </View>
          </View>

          <View
            style={
              styles.bottomSpace
            }
          />
        </View>
      </ScrollView>

      {/* BOTTOM ACTION BAR */}

      <View
        style={
          styles.bottomBar
        }
      >
        <View
          style={
            styles.bottomPriceBox
          }
        >
          <Text
            style={
              styles.bottomPriceLabel
            }
          >
            TOTAL
          </Text>

          <Text
            style={
              styles.bottomPrice
            }
          >
            ₹
            {Number(
              product.selling_price
            ).toLocaleString(
              'en-IN'
            )}
          </Text>
        </View>

        <Pressable
          style={
            styles.addButton
          }
          onPress={
            handleAddToBag
          }
        >
          <Text
            style={
              styles.addButtonText
            }
          >
            Add to Bag
          </Text>
        </Pressable>

        <Pressable
          style={
            styles.buyButton
          }
          onPress={
            handleBuyNow
          }
        >
          <Text
            style={
              styles.buyButtonText
            }
          >
            Buy Now
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF8F0',
  },

  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFF8F0',
  },

  loadingText: {
    marginTop: 14,
    fontSize: 15,
    color: '#54245F',
    fontWeight: '600',
  },

  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 30,
    backgroundColor: '#FFF8F0',
  },

  errorIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#F4EEFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 18,
  },

  errorEmoji: {
    fontSize: 34,
  },

  errorText: {
    fontSize: 20,
    fontWeight: '800',
    color: '#29232D',
    marginBottom: 20,
  },

  errorBackButton: {
    backgroundColor: '#54245F',
    paddingHorizontal: 28,
    paddingVertical: 13,
    borderRadius: 14,
  },

  errorBackButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },

  topBar: {
    height: 62,
    paddingHorizontal: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFF8F0',
  },

  topBarTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#29232D',
  },

  topBarRight: {
    flexDirection: 'row',
    gap: 8,
  },

  circleButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#F0E5DC',
  },

  backIcon: {
    fontSize: 31,
    lineHeight: 32,
    color: '#54245F',
    marginTop: -3,
  },

  heartIcon: {
    fontSize: 22,
    color: '#F47C6C',
  },

  bagIcon: {
    fontSize: 19,
  },

  scrollContent: {
    paddingBottom: 10,
  },

  imageWrapper: {
    height: 360,
    marginHorizontal: 16,
    borderRadius: 28,
    overflow: 'hidden',
    backgroundColor: '#F4EEFF',
    position: 'relative',
  },

  productImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },

  madeBadge: {
    position: 'absolute',
    left: 16,
    bottom: 16,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 20,
  },

  madeBadgeText: {
    color: '#54245F',
    fontSize: 12,
    fontWeight: '800',
  },

  content: {
    paddingHorizontal: 20,
    paddingTop: 22,
  },

  categoryPill: {
    alignSelf: 'flex-start',
    backgroundColor: '#F4EEFF',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 16,
    marginBottom: 10,
  },

  categoryPillText: {
    color: '#54245F',
    fontSize: 12,
    fontWeight: '800',
  },

  productName: {
    fontSize: 29,
    lineHeight: 35,
    fontWeight: '900',
    color: '#29232D',
    marginBottom: 18,
  },

  makerMiniRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 12,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#F0E5DC',
  },

  makerMiniAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFE2D9',
    alignItems: 'center',
    justifyContent: 'center',
  },

  makerMiniEmoji: {
    fontSize: 22,
  },

  makerMiniInfo: {
    flex: 1,
    marginLeft: 11,
  },

  makerMiniLabel: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 1.2,
    color: '#9B8D99',
    marginBottom: 2,
  },

  makerMiniName: {
    fontSize: 15,
    fontWeight: '800',
    color: '#29232D',
  },

  makerMiniArrow: {
    fontSize: 25,
    color: '#54245F',
    marginRight: 4,
  },

  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 20,
  },

  price: {
    fontSize: 27,
    fontWeight: '900',
    color: '#54245F',
  },

  trustPill: {
    marginLeft: 12,
    backgroundColor: '#E9F7F0',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 15,
  },

  trustPillText: {
    color: '#317A59',
    fontSize: 10,
    fontWeight: '800',
  },

  divider: {
    height: 1,
    backgroundColor: '#EDE1D7',
    marginVertical: 24,
  },

  sectionTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: '#29232D',
    marginBottom: 12,
    marginTop: 8,
  },

  description: {
    fontSize: 15,
    lineHeight: 24,
    color: '#665B66',
  },

  detailsGrid: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 18,
  },

  detailCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    padding: 14,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#F0E5DC',
  },

  detailIcon: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#FFF1E8',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },

  detailLabel: {
    fontSize: 10,
    color: '#9B8D99',
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },

  detailValue: {
    marginTop: 4,
    fontSize: 14,
    color: '#29232D',
    fontWeight: '700',
  },

  loveGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 18,
  },

  loveCard: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 15,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#F0E5DC',
  },

  loveEmoji: {
    fontSize: 24,
    marginBottom: 9,
  },

  loveTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#29232D',
    marginBottom: 5,
  },

  loveText: {
    fontSize: 11,
    lineHeight: 17,
    color: '#766B76',
  },

  makerCard: {
    backgroundColor: '#54245F',
    borderRadius: 22,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },

  makerAvatar: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: '#FFE2D9',
    alignItems: 'center',
    justifyContent: 'center',
  },

  makerAvatarEmoji: {
    fontSize: 27,
  },

  makerInfo: {
    flex: 1,
    marginLeft: 12,
  },

  makerLabel: {
    color: '#DCCBE2',
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 1.1,
    marginBottom: 3,
  },

  makerName: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '900',
    marginBottom: 4,
  },

  makerLocation: {
    color: '#E7DDEA',
    fontSize: 11,
  },

  contactButton: {
    backgroundColor: '#F47C6C',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 14,
  },

  contactButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '900',
  },

  messageCard: {
    flexDirection: 'row',
    backgroundColor: '#FFF0EA',
    borderRadius: 20,
    padding: 16,
    marginTop: 8,
  },

  messageIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },

  messageContent: {
    flex: 1,
    marginLeft: 12,
  },

  messageTitle: {
    fontSize: 14,
    fontWeight: '900',
    color: '#54245F',
    marginBottom: 5,
  },

  messageText: {
    fontSize: 12,
    lineHeight: 18,
    color: '#6E5968',
  },

  bottomSpace: {
    height: 25,
  },

  bottomBar: {
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#EDE1D7',
    paddingHorizontal: 14,
    paddingTop: 10,
    paddingBottom: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },

  bottomPriceBox: {
    paddingHorizontal: 5,
    minWidth: 65,
  },

  bottomPriceLabel: {
    fontSize: 8,
    fontWeight: '800',
    color: '#9B8D99',
    letterSpacing: 1,
  },

  bottomPrice: {
    fontSize: 16,
    fontWeight: '900',
    color: '#29232D',
    marginTop: 2,
  },

  addButton: {
    flex: 1,
    height: 48,
    borderRadius: 15,
    borderWidth: 1.5,
    borderColor: '#54245F',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },

  addButtonText: {
    color: '#54245F',
    fontSize: 13,
    fontWeight: '900',
  },

  buyButton: {
    flex: 1,
    height: 48,
    borderRadius: 15,
    backgroundColor: '#54245F',
    alignItems: 'center',
    justifyContent: 'center',
  },

  buyButtonText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '900',
  },
});