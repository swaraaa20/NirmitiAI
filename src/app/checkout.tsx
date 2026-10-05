import { router } from 'expo-router';

import {
  View,
  Text,
  Pressable,
  ScrollView,
  StyleSheet,
  Image,
  Alert,
  ActivityIndicator,
} from 'react-native';

import { useEffect, useState } from 'react';

import { useCart } from '../context/CartContext';
import { supabase } from '../services/supabase';

type ProductDetails = {
  id: string;
  product_name: string;
  image_url: string | null;
  selling_price: number;
  artisan_id: string;
  category: string | null;
};

export default function CheckoutScreen() {
  const {
    cart,
    cartCount,
    clearCart,
  } = useCart();

  const [products, setProducts] = useState<
    Record<string, ProductDetails>
  >({});

  const [loadingProducts, setLoadingProducts] =
    useState(true);

  const [placingOrder, setPlacingOrder] =
    useState(false);

  const [fetchError, setFetchError] =
    useState('');

  useEffect(() => {
    fetchProducts();
  }, [cart]);

  const fetchProducts = async () => {
    if (cart.length === 0) {
      setProducts({});
      setLoadingProducts(false);
      return;
    }

    try {
      setLoadingProducts(true);
      setFetchError('');

      const productIds = cart.map(
        item => item.id
      );

      const {
        data,
        error,
      } = await supabase
        .from('products')
        .select(`
          id,
          product_name,
          image_url,
          selling_price,
          artisan_id,
          category
        `)
        .in('id', productIds);

      if (error) {
        console.log(
          'CHECKOUT PRODUCT FETCH ERROR:',
          error
        );

        setFetchError(
          error.message ||
            'Could not fetch product details.'
        );

        return;
      }

      if (!data || data.length === 0) {
        setFetchError(
          'No products were found in your bag.'
        );
        return;
      }

      const productMap: Record<
        string,
        ProductDetails
      > = {};

      data.forEach(product => {
        productMap[product.id] = {
          id: product.id,
          product_name:
            product.product_name,
          image_url:
            product.image_url,
          selling_price:
            Number(product.selling_price),
          artisan_id:
            product.artisan_id,
          category:
            product.category,
        };
      });

      setProducts(productMap);
    } catch (error) {
      console.log(
        'CHECKOUT FETCH ERROR:',
        error
      );

      setFetchError(
        'Something went wrong while fetching your products.'
      );
    } finally {
      setLoadingProducts(false);
    }
  };

  const getProductTotal = (
    item: any
  ) => {
    const product =
      products[item.id];

    if (!product) {
      return 0;
    }

    return (
      product.selling_price *
      item.quantity
    );
  };

  const checkoutTotal = cart.reduce(
    (total, item) =>
      total +
      getProductTotal(item),
    0
  );

  const handlePlaceOrder = async () => {
    if (cart.length === 0) {
      Alert.alert(
        'Your Bag is Empty',
        'Please add a product before placing an order.'
      );
      return;
    }

    if (loadingProducts) {
      Alert.alert(
        'Please wait',
        'We are loading your product details.'
      );
      return;
    }

    if (fetchError) {
      Alert.alert(
        'Could not load products',
        'Please try again before placing your order.'
      );

      await fetchProducts();
      return;
    }

    const missingProduct = cart.some(
      item => !products[item.id]
    );

    if (missingProduct) {
      Alert.alert(
        'Product Unavailable',
        'One of the products in your bag could not be found.'
      );
      return;
    }

    if (checkoutTotal <= 0) {
      Alert.alert(
        'Invalid Total',
        'The order total could not be calculated.'
      );
      return;
    }

    try {
      setPlacingOrder(true);

      const {
        data: {
          user,
        },
        error: userError,
      } =
        await supabase.auth.getUser();

      if (
        userError ||
        !user
      ) {
        Alert.alert(
          'Login Required',
          'Please login before placing an order.'
        );
        return;
      }

      const {
        data: order,
        error: orderError,
      } =
        await supabase
          .from('orders')
          .insert({
            buyer_id:
              user.id,
            total_amount:
              checkoutTotal,
            status:
              'placed',
          })
          .select()
          .single();

      if (
        orderError ||
        !order
      ) {
        console.log(
          'ORDER ERROR:',
          orderError
        );

        Alert.alert(
          'Order Failed',
          orderError?.message ||
            'Could not create your order.'
        );

        return;
      }

      const orderItems =
        cart.map(item => {
          const product =
            products[item.id];

          return {
            order_id:
              order.id,

            product_id:
              item.id,

            seller_id:
              product.artisan_id,

            quantity:
              item.quantity,

            price:
              product.selling_price,
          };
        });

      const {
        error: itemsError,
      } =
        await supabase
          .from('order_items')
          .insert(
            orderItems
          );

      if (itemsError) {
        console.log(
          'ORDER ITEMS ERROR:',
          itemsError
        );

        await supabase
          .from('orders')
          .delete()
          .eq(
            'id',
            order.id
          );

        Alert.alert(
          'Order Failed',
          itemsError.message
        );

        return;
      }

      Alert.alert(
        'Order Placed 🎉',
        `Your order of ₹${checkoutTotal.toLocaleString(
          'en-IN'
        )} has been successfully placed!`,
        [
          {
            text:
              'Continue Shopping',
            onPress: () => {
              clearCart();
              router.replace(
                '/buyer'
              );
            },
          },
        ]
      );
    } catch (error) {
      console.log(
        'CHECKOUT ERROR:',
        error
      );

      Alert.alert(
        'Checkout Error',
        'Something went wrong while placing your order. Please try again.'
      );
    } finally {
      setPlacingOrder(false);
    }
  };

  if (cart.length === 0) {
    return (
      <View
        style={
          styles.emptyContainer
        }
      >
        <View
          style={
            styles.emptyIconCircle
          }
        >
          <Text
            style={
              styles.emptyEmoji
            }
          >
            🛍️
          </Text>
        </View>

        <Text
          style={
            styles.emptyTitle
          }
        >
          Your Bag is Empty
        </Text>

        <Text
          style={
            styles.emptyText
          }
        >
          Add something you love
          from निर्मितिAI before
          checkout.
        </Text>

        <Pressable
          style={
            styles.shopButton
          }
          onPress={() =>
            router.replace(
              '/buyer'
            )
          }
        >
          <Text
            style={
              styles.shopButtonText
            }
          >
            Continue Shopping
          </Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View
      style={styles.container}
    >
      {/* HEADER */}

      <View
        style={styles.header}
      >
        <Pressable
          onPress={() =>
            router.back()
          }
          style={
            styles.backButtonContainer
          }
        >
          <Text
            style={
              styles.backButton
            }
          >
            ‹
          </Text>
        </Pressable>

        <View
          style={
            styles.headerCenter
          }
        >
          <Text
            style={
              styles.brandName
            }
          >
            निर्मितिAI
          </Text>

          <Text
            style={
              styles.headerTitle
            }
          >
            Checkout
          </Text>

          <Text
            style={
              styles.headerSubtitle
            }
          >
            Complete your order
          </Text>
        </View>

        <View
          style={
            styles.headerRight
          }
        >
          <Text
            style={
              styles.lockIcon
            }
          >
            🔒
          </Text>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={
          false
        }
        contentContainerStyle={
          styles.content
        }
      >
        {/* STEPS */}

        <View
          style={
            styles.stepsContainer
          }
        >
          <View
            style={
              styles.stepActive
            }
          >
            <Text
              style={
                styles.stepNumber
              }
            >
              ✓
            </Text>
          </View>

          <View
            style={
              styles.stepLine
            }
          />

          <View
            style={
              styles.stepActive
            }
          >
            <Text
              style={
                styles.stepNumber
              }
            >
              2
            </Text>
          </View>

          <View
            style={
              styles.stepLine
            }
          />

          <View
            style={
              styles.stepInactive
            }
          >
            <Text
              style={
                styles.stepInactiveNumber
              }
            >
              3
            </Text>
          </View>
        </View>

        <View
          style={
            styles.stepLabels
          }
        >
          <Text
            style={
              styles.stepLabelActive
            }
          >
            Bag
          </Text>

          <Text
            style={
              styles.stepLabelActive
            }
          >
            Checkout
          </Text>

          <Text
            style={
              styles.stepLabel
            }
          >
            Confirmation
          </Text>
        </View>

        {/* ORDER SUMMARY */}

        <View
          style={
            styles.sectionHeader
          }
        >
          <View>
            <Text
              style={
                styles.sectionTitle
              }
            >
              Your Order
            </Text>

            <Text
              style={
                styles.sectionSubtitle
              }
            >
              Review your selected products
            </Text>
          </View>

          <View
            style={
              styles.itemBadge
            }
          >
            <Text
              style={
                styles.itemBadgeText
              }
            >
              {cartCount}{' '}
              {cartCount === 1
                ? 'item'
                : 'items'}
            </Text>
          </View>
        </View>

        {/* FETCH ERROR */}

        {fetchError ? (
          <View
            style={
              styles.errorCard
            }
          >
            <Text
              style={
                styles.errorIcon
              }
            >
              ⚠️
            </Text>

            <View
              style={
                styles.errorContent
              }
            >
              <Text
                style={
                  styles.errorTitle
                }
              >
                Could not load products
              </Text>

              <Text
                style={
                  styles.errorText
                }
              >
                {fetchError}
              </Text>

              <Pressable
                style={
                  styles.retryButton
                }
                onPress={
                  fetchProducts
                }
              >
                <Text
                  style={
                    styles.retryButtonText
                  }
                >
                  Try Again
                </Text>
              </Pressable>
            </View>
          </View>
        ) : null}

        {/* PRODUCTS */}

        {loadingProducts ? (
          <View
            style={
              styles.loadingCard
            }
          >
            <ActivityIndicator
              size="small"
              color="#456B42"
            />

            <Text
              style={
                styles.loadingText
              }
            >
              Loading your products...
            </Text>
          </View>
        ) : (
          <View
            style={
              styles.productsContainer
            }
          >
            {cart.map(item => {
              const product =
                products[item.id];

              if (!product) {
                return null;
              }

              const itemTotal =
                product.selling_price *
                item.quantity;

              return (
                <View
                  key={item.id}
                  style={
                    styles.productCard
                  }
                >
                  <Image
                    source={{
                      uri:
                        product.image_url ||
                        undefined,
                    }}
                    style={
                      styles.productImage
                    }
                  />

                  <View
                    style={
                      styles.productInfo
                    }
                  >
                    <Text
                      style={
                        styles.productName
                      }
                      numberOfLines={2}
                    >
                      {
                        product.product_name
                      }
                    </Text>

                    <Text
                      style={
                        styles.categoryText
                      }
                    >
                      {product.category ||
                        'Home-made product'}
                    </Text>

                    <View
                      style={
                        styles.priceQuantityRow
                      }
                    >
                      <View>
                        <Text
                          style={
                            styles.unitLabel
                          }
                        >
                          Price
                        </Text>

                        <Text
                          style={
                            styles.unitPrice
                          }
                        >
                          ₹
                          {product.selling_price.toLocaleString(
                            'en-IN'
                          )}
                        </Text>
                      </View>

                      <View
                        style={
                          styles.quantityBadge
                        }
                      >
                        <Text
                          style={
                            styles.quantityBadgeText
                          }
                        >
                          Qty {item.quantity}
                        </Text>
                      </View>

                      <View
                        style={
                          styles.itemTotalBox
                        }
                      >
                        <Text
                          style={
                            styles.unitLabel
                          }
                        >
                          Total
                        </Text>

                        <Text
                          style={
                            styles.productPrice
                          }
                        >
                          ₹
                          {itemTotal.toLocaleString(
                            'en-IN'
                          )}
                        </Text>
                      </View>
                    </View>
                  </View>
                </View>
              );
            })}
          </View>
        )}

        {/* DELIVERY */}

        <View
          style={styles.sectionBlock}
        >
          <View
            style={
              styles.sectionTitleRow
            }
          >
            <Text
              style={
                styles.sectionIcon
              }
            >
              📍
            </Text>

            <View>
              <Text
                style={
                  styles.sectionTitle
                }
              >
                Delivery Address
              </Text>

              <Text
                style={
                  styles.sectionSubtitle
                }
              >
                Where should we deliver?
              </Text>
            </View>
          </View>

          <View
            style={
              styles.addressCard
            }
          >
            <View
              style={
                styles.addressIconBox
              }
            >
              <Text
                style={
                  styles.addressIcon
                }
              >
                🏠
              </Text>
            </View>

            <View
              style={
                styles.addressContent
              }
            >
              <Text
                style={
                  styles.addressTitle
                }
              >
                Demo Delivery Address
              </Text>

              <Text
                style={
                  styles.addressDescription
                }
              >
                Pune, Maharashtra, India
              </Text>

              <View
                style={
                  styles.demoBadge
                }
              >
                <Text
                  style={
                    styles.demoBadgeText
                  }
                >
                  Demo address
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* PAYMENT */}

        <View
          style={styles.sectionBlock}
        >
          <View
            style={
              styles.sectionTitleRow
            }
          >
            <Text
              style={
                styles.sectionIcon
              }
            >
              💳
            </Text>

            <View>
              <Text
                style={
                  styles.sectionTitle
                }
              >
                Payment Method
              </Text>

              <Text
                style={
                  styles.sectionSubtitle
                }
              >
                Payment option for your order
              </Text>
            </View>
          </View>

          <View
            style={
              styles.paymentCard
            }
          >
            <View
              style={
                styles.paymentIconBox
              }
            >
              <Text
                style={
                  styles.paymentIcon
                }
              >
                💳
              </Text>
            </View>

            <View
              style={
                styles.paymentContent
              }
            >
              <Text
                style={
                  styles.paymentTitle
                }
              >
                UPI / Cash on Delivery
              </Text>

              <Text
                style={
                  styles.paymentDescription
                }
              >
                Payment integration coming soon
              </Text>
            </View>

            <View
              style={
                styles.selectedCircle
              }
            >
              <Text
                style={
                  styles.selectedCheck
                }
              >
                ✓
              </Text>
            </View>
          </View>
        </View>

        {/* PRICE DETAILS */}

        <View
          style={
            styles.priceCard
          }
        >
          <Text
            style={
              styles.priceCardTitle
            }
          >
            Price Details
          </Text>

          <View
            style={styles.priceRow}
          >
            <Text
              style={
                styles.priceLabel
              }
            >
              Products
            </Text>

            <Text
              style={
                styles.priceValue
              }
            >
              ₹
              {checkoutTotal.toLocaleString(
                'en-IN'
              )}
            </Text>
          </View>

          <View
            style={styles.priceRow}
          >
            <Text
              style={
                styles.priceLabel
              }
            >
              Delivery
            </Text>

            <Text
              style={
                styles.freeText
              }
            >
              FREE
            </Text>
          </View>

          <View
            style={styles.divider}
          />

          <View
            style={styles.totalRow}
          >
            <Text
              style={
                styles.totalLabel
              }
            >
              Total Amount
            </Text>

            <Text
              style={
                styles.totalPrice
              }
            >
              ₹
              {checkoutTotal.toLocaleString(
                'en-IN'
              )}
            </Text>
          </View>
        </View>

        {/* TRUST */}

        <View
          style={styles.trustCard}
        >
          <Text
            style={styles.trustIcon}
          >
            🏡
          </Text>

          <View
            style={styles.trustContent}
          >
            <Text
              style={styles.trustTitle}
            >
              Supporting Home Businesses
            </Text>

            <Text
              style={styles.trustText}
            >
              Every purchase helps a homemaker
              turn their skills and creativity
              into a small business.
            </Text>
          </View>
        </View>

        <View
          style={styles.bottomSpace}
        />
      </ScrollView>

      {/* BOTTOM BAR */}

      <View
        style={styles.bottomBar}
      >
        <View
          style={styles.bottomTotal}
        >
          <Text
            style={
              styles.bottomTotalLabel
            }
          >
            Total
          </Text>

          <Text
            style={
              styles.bottomTotalPrice
            }
          >
            ₹
            {checkoutTotal.toLocaleString(
              'en-IN'
            )}
          </Text>
        </View>

        <Pressable
          style={[
            styles.orderButton,
            (placingOrder ||
              loadingProducts ||
              !!fetchError) &&
              styles.orderButtonDisabled,
          ]}
          onPress={
            handlePlaceOrder
          }
          disabled={
            placingOrder ||
            loadingProducts
          }
        >
          {placingOrder ? (
            <ActivityIndicator
              color="#FFFFFF"
            />
          ) : (
            <>
              <Text
                style={
                  styles.orderButtonText
                }
              >
                Place Order
              </Text>

              <Text
                style={
                  styles.orderArrow
                }
              >
                →
              </Text>
            </>
          )}
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F7EA',
  },

  header: {
    minHeight: 126,
    paddingTop: 45,
    paddingHorizontal: 18,
    backgroundColor: '#456B42',
    flexDirection: 'row',
    alignItems: 'center',
  },

  backButtonContainer: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor:
      'rgba(255,255,255,0.14)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  backButton: {
    color: '#FFFFFF',
    fontSize: 34,
    lineHeight: 35,
    marginTop: -3,
  },

  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },

  brandName: {
    color: '#F7EBC1',
    fontSize: 13,
    fontWeight: '800',
    marginBottom: 2,
  },

  headerTitle: {
    color: '#FFFFFF',
    fontSize: 21,
    fontWeight: '800',
  },

  headerSubtitle: {
    color: '#DDE7D7',
    fontSize: 11,
    marginTop: 3,
  },

  headerRight: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor:
      'rgba(255,255,255,0.14)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  lockIcon: {
    fontSize: 17,
  },

  content: {
    paddingHorizontal: 18,
    paddingTop: 22,
    paddingBottom: 150,
  },

  stepsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },

  stepActive: {
    width: 29,
    height: 29,
    borderRadius: 15,
    backgroundColor: '#456B42',
    justifyContent: 'center',
    alignItems: 'center',
  },

  stepInactive: {
    width: 29,
    height: 29,
    borderRadius: 15,
    backgroundColor: '#DDE4D5',
    justifyContent: 'center',
    alignItems: 'center',
  },

  stepNumber: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
  },

  stepInactiveNumber: {
    color: '#788171',
    fontSize: 12,
    fontWeight: '700',
  },

  stepLine: {
    height: 2,
    width: 58,
    backgroundColor: '#B9C8AE',
    marginHorizontal: 6,
  },

  stepLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 29,
    marginTop: 7,
    marginBottom: 24,
  },

  stepLabelActive: {
    fontSize: 10,
    color: '#456B42',
    fontWeight: '700',
  },

  stepLabel: {
    fontSize: 10,
    color: '#8B9385',
  },

  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 13,
  },

  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 13,
  },

  sectionIcon: {
    fontSize: 21,
    marginRight: 9,
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#403630',
  },

  sectionSubtitle: {
    fontSize: 11,
    color: '#81756D',
    marginTop: 3,
  },

  itemBadge: {
    backgroundColor: '#E3EAD9',
    paddingHorizontal: 11,
    paddingVertical: 6,
    borderRadius: 14,
  },

  itemBadgeText: {
    color: '#456B42',
    fontSize: 11,
    fontWeight: '700',
  },

  productsContainer: {
    marginBottom: 5,
  },

  productCard: {
    backgroundColor: '#FFFDF4',
    borderRadius: 18,
    padding: 11,
    flexDirection: 'row',
    marginBottom: 11,
    borderWidth: 1,
    borderColor: '#D8DDCE',
  },

  productImage: {
    width: 92,
    height: 92,
    borderRadius: 14,
    backgroundColor: '#E6EBD9',
  },

  productInfo: {
    flex: 1,
    marginLeft: 13,
    justifyContent: 'center',
  },

  productName: {
    fontSize: 15,
    lineHeight: 20,
    fontWeight: '800',
    color: '#403630',
  },

  categoryText: {
    fontSize: 10,
    color: '#81756D',
    marginTop: 4,
  },

  priceQuantityRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginTop: 10,
  },

  unitLabel: {
    fontSize: 9,
    color: '#8A8178',
    marginBottom: 2,
  },

  unitPrice: {
    fontSize: 13,
    fontWeight: '800',
    color: '#456B42',
  },

  quantityBadge: {
    backgroundColor: '#EEF2E8',
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 8,
    marginLeft: 10,
  },

  quantityBadgeText: {
    color: '#5F6C58',
    fontSize: 10,
    fontWeight: '700',
  },

  itemTotalBox: {
    marginLeft: 'auto',
    alignItems: 'flex-end',
  },

  productPrice: {
    color: '#456B42',
    fontSize: 15,
    fontWeight: '900',
  },

  sectionBlock: {
    marginTop: 23,
  },

  addressCard: {
    backgroundColor: '#FFFDF4',
    borderRadius: 17,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#D8DDCE',
  },

  addressIconBox: {
    width: 46,
    height: 46,
    borderRadius: 14,
    backgroundColor: '#E3EAD9',
    justifyContent: 'center',
    alignItems: 'center',
  },

  addressIcon: {
    fontSize: 20,
  },

  addressContent: {
    flex: 1,
    marginLeft: 12,
  },

  addressTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#403630',
  },

  addressDescription: {
    fontSize: 12,
    color: '#70685F',
    marginTop: 4,
  },

  demoBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#F3E8C7',
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 6,
    marginTop: 6,
  },

  demoBadgeText: {
    color: '#806B32',
    fontSize: 9,
    fontWeight: '700',
  },

  paymentCard: {
    backgroundColor: '#FFFDF4',
    borderRadius: 17,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#D8DDCE',
  },

  paymentIconBox: {
    width: 46,
    height: 46,
    borderRadius: 14,
    backgroundColor: '#E3EAD9',
    justifyContent: 'center',
    alignItems: 'center',
  },

  paymentIcon: {
    fontSize: 20,
  },

  paymentContent: {
    flex: 1,
    marginLeft: 12,
  },

  paymentTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#403630',
  },

  paymentDescription: {
    fontSize: 11,
    color: '#81756D',
    marginTop: 4,
  },

  selectedCircle: {
    width: 23,
    height: 23,
    borderRadius: 12,
    backgroundColor: '#456B42',
    justifyContent: 'center',
    alignItems: 'center',
  },

  selectedCheck: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
  },

  priceCard: {
    backgroundColor: '#FFFDF4',
    borderRadius: 18,
    padding: 17,
    marginTop: 24,
    borderWidth: 1,
    borderColor: '#D8DDCE',
  },

  priceCardTitle: {
    color: '#403630',
    fontSize: 15,
    fontWeight: '800',
    marginBottom: 15,
  },

  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 11,
  },

  priceLabel: {
    color: '#81756D',
    fontSize: 13,
  },

  priceValue: {
    color: '#403630',
    fontSize: 13,
    fontWeight: '700',
  },

  freeText: {
    color: '#4F7048',
    fontSize: 12,
    fontWeight: '800',
  },

  divider: {
    height: 1,
    backgroundColor: '#D8DDCE',
    marginVertical: 5,
  },

  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },

  totalLabel: {
    color: '#403630',
    fontSize: 16,
    fontWeight: '800',
  },

  totalPrice: {
    color: '#456B42',
    fontSize: 21,
    fontWeight: '900',
  },

  trustCard: {
    flexDirection: 'row',
    backgroundColor: '#E6EBD9',
    borderRadius: 17,
    padding: 14,
    marginTop: 15,
    alignItems: 'center',
  },

  trustIcon: {
    fontSize: 25,
    marginRight: 11,
  },

  trustContent: {
    flex: 1,
  },

  trustTitle: {
    color: '#456B42',
    fontSize: 12,
    fontWeight: '800',
  },

  trustText: {
    color: '#687361',
    fontSize: 10,
    lineHeight: 15,
    marginTop: 3,
  },

  bottomSpace: {
    height: 30,
  },

  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFDF4',
    borderTopWidth: 1,
    borderTopColor: '#D8DDCE',
    paddingHorizontal: 18,
    paddingTop: 12,
    paddingBottom: 25,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  bottomTotal: {
    flex: 1,
  },

  bottomTotalLabel: {
    color: '#81756D',
    fontSize: 11,
  },

  bottomTotalPrice: {
    color: '#403630',
    fontSize: 21,
    fontWeight: '900',
    marginTop: 2,
  },

  orderButton: {
    height: 52,
    paddingHorizontal: 21,
    borderRadius: 15,
    backgroundColor: '#456B42',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 155,
  },

  orderButtonDisabled: {
    opacity: 0.55,
  },

  orderButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
  },

  orderArrow: {
    color: '#FFFFFF',
    fontSize: 19,
    marginLeft: 9,
    marginTop: -1,
  },

  loadingCard: {
    backgroundColor: '#FFFDF4',
    borderRadius: 17,
    padding: 22,
    borderWidth: 1,
    borderColor: '#D8DDCE',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },

  loadingText: {
    marginLeft: 10,
    color: '#687361',
    fontSize: 12,
    fontWeight: '600',
  },

  errorCard: {
    backgroundColor: '#F8E9E4',
    borderRadius: 17,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E5C8BD',
    flexDirection: 'row',
    marginBottom: 12,
  },

  errorIcon: {
    fontSize: 23,
    marginRight: 10,
  },

  errorContent: {
    flex: 1,
  },

  errorTitle: {
    color: '#744436',
    fontSize: 13,
    fontWeight: '800',
  },

  errorText: {
    color: '#80645B',
    fontSize: 11,
    lineHeight: 16,
    marginTop: 3,
  },

  retryButton: {
    alignSelf: 'flex-start',
    backgroundColor: '#456B42',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 8,
    marginTop: 9,
  },

  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800',
  },

  emptyContainer: {
    flex: 1,
    backgroundColor: '#F8F7EA',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 30,
  },

  emptyIconCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#E3EAD9',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },

  emptyEmoji: {
    fontSize: 48,
  },

  emptyTitle: {
    fontSize: 25,
    fontWeight: '900',
    color: '#403630',
  },

  emptyText: {
    fontSize: 14,
    color: '#81756D',
    textAlign: 'center',
    lineHeight: 21,
    marginTop: 9,
    marginBottom: 25,
  },

  shopButton: {
    backgroundColor: '#456B42',
    paddingHorizontal: 26,
    paddingVertical: 15,
    borderRadius: 14,
  },

  shopButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
});