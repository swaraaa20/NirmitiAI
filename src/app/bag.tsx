import { router } from 'expo-router';

import {
  View,
  Text,
  Pressable,
  ScrollView,
  StyleSheet,
  Image,
} from 'react-native';

import { useCart } from '../context/CartContext';

export default function BagScreen() {
  const {
    cart,
    increaseQuantity,
    decreaseQuantity,
    removeFromCart,
    cartCount,
    cartTotal,
  } = useCart();

  return (
    <View style={styles.container}>

      <View style={styles.header}>
        <Pressable
          style={styles.backButtonContainer}
          onPress={() => router.back()}
        >
          <Text style={styles.backButton}>‹</Text>
        </Pressable>

        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>
            My Bag
          </Text>

          {cartCount > 0 && (
            <View style={styles.countBadge}>
              <Text style={styles.countText}>
                {cartCount}
              </Text>
            </View>
          )}
        </View>

        <View style={{ width: 42 }} />
      </View>

      {cart.length === 0 ? (

        <View style={styles.emptyContainer}>

          <View style={styles.emptyIconCircle}>
            <Text style={styles.emptyEmoji}>
              🛍️
            </Text>
          </View>

          <Text style={styles.emptyTitle}>
            Your bag is empty
          </Text>

          <Text style={styles.emptyText}>
            Discover beautiful products made by
            talented homemakers from home.
          </Text>

          <Pressable
            style={styles.exploreButton}
            onPress={() => router.replace('/buyer')}
          >
            <Text style={styles.exploreButtonText}>
              Explore Products
            </Text>
          </Pressable>

        </View>

      ) : (

        <>

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.content}
          >

            <View style={styles.introRow}>

              <View>
                <Text style={styles.pageHeading}>
                  Your selected products
                </Text>

                <Text style={styles.itemCount}>
                  {cartCount}{' '}
                  {cartCount === 1 ? 'item' : 'items'}{' '}
                  in your bag
                </Text>
              </View>

              <View style={styles.handmadeIcon}>
                <Text style={styles.handmadeIconText}>
                  ✦
                </Text>
              </View>

            </View>

            {cart.map((item) => (

              <View
                key={item.id}
                style={styles.productCard}
              >

                <Image
                  source={{
                    uri: item.image_url,
                  }}
                  style={styles.productImage}
                />

                <View style={styles.productInfo}>

                  <View style={styles.nameRow}>

                    <Text
                      style={styles.productName}
                      numberOfLines={2}
                    >
                      {item.product_name}
                    </Text>

                    <Pressable
                      style={styles.deleteButton}
                      onPress={() =>
                        removeFromCart(item.id)
                      }
                    >
                      <Text style={styles.deleteIcon}>
                        ×
                      </Text>
                    </Pressable>

                  </View>

                  <Text style={styles.artisan}>
                    Made by a homemaker
                  </Text>

                  <Text style={styles.price}>
                    ₹{item.selling_price}
                  </Text>

                  <View style={styles.bottomRow}>

                    <View style={styles.quantityBox}>

                      <Pressable
                        style={styles.quantityButton}
                        onPress={() =>
                          decreaseQuantity(item.id)
                        }
                      >
                        <Text style={styles.quantityButtonText}>
                          −
                        </Text>
                      </Pressable>

                      <Text style={styles.quantity}>
                        {item.quantity}
                      </Text>

                      <Pressable
                        style={styles.quantityButton}
                        onPress={() =>
                          increaseQuantity(item.id)
                        }
                      >
                        <Text style={styles.quantityButtonText}>
                          +
                        </Text>
                      </Pressable>

                    </View>

                    <Text style={styles.itemTotal}>
                      ₹{item.selling_price * item.quantity}
                    </Text>

                  </View>

                </View>

              </View>

            ))}

            <View style={styles.deliveryCard}>

              <View style={styles.deliveryIcon}>
                <Text style={styles.deliveryIconText}>
                  🚚
                </Text>
              </View>

              <View style={styles.deliveryContent}>

                <Text style={styles.deliveryTitle}>
                  Free delivery
                </Text>

                <Text style={styles.deliveryText}>
                  Your order qualifies for free delivery.
                </Text>

              </View>

              <Text style={styles.check}>
                ✓
              </Text>

            </View>

            <View style={styles.summary}>

              <Text style={styles.summaryTitle}>
                Order Summary
              </Text>

              <View style={styles.summaryRow}>

                <Text style={styles.summaryLabel}>
                  Item total
                </Text>

                <Text style={styles.summaryValue}>
                  ₹{cartTotal}
                </Text>

              </View>

              <View style={styles.summaryRow}>

                <Text style={styles.summaryLabel}>
                  Delivery
                </Text>

                <Text style={styles.free}>
                  FREE
                </Text>

              </View>

              <View style={styles.divider} />

              <View style={styles.summaryRow}>

                <Text style={styles.totalLabel}>
                  Total
                </Text>

                <Text style={styles.totalValue}>
                  ₹{cartTotal}
                </Text>

              </View>

            </View>

            <View style={{ height: 135 }} />

          </ScrollView>

          <View style={styles.bottomBar}>

            <View>
              <Text style={styles.totalSmall}>
                Total
              </Text>

              <Text style={styles.bottomPrice}>
                ₹{cartTotal}
              </Text>
            </View>

            <Pressable
              style={styles.checkoutButton}
              onPress={() =>
                router.push('/checkout')
              }
            >
              <Text style={styles.checkoutText}>
                Proceed to Checkout
              </Text>

              <Text style={styles.checkoutArrow}>
                →
              </Text>
            </Pressable>

          </View>

        </>

      )}

    </View>
  );
}

const styles = StyleSheet.create({

  container: {
    flex: 1,
    backgroundColor: '#F8F7EA',
  },

  header: {
    height: 105,
    paddingTop: 48,
    paddingHorizontal: 20,
    backgroundColor: '#456B42',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  backButtonContainer: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  backButton: {
    color: '#FFFFFF',
    fontSize: 32,
    lineHeight: 34,
    marginTop: -3,
  },

  headerCenter: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  headerTitle: {
    color: '#FFFFFF',
    fontSize: 21,
    fontWeight: '800',
  },

  countBadge: {
    minWidth: 23,
    height: 23,
    borderRadius: 12,
    backgroundColor: '#EED58D',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
    paddingHorizontal: 6,
  },

  countText: {
    color: '#456B42',
    fontSize: 11,
    fontWeight: '900',
  },

  content: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 30,
  },

  introRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 18,
  },

  pageHeading: {
    fontSize: 20,
    fontWeight: '800',
    color: '#403630',
  },

  itemCount: {
    fontSize: 13,
    color: '#81756D',
    marginTop: 4,
  },

  handmadeIcon: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#E3EAD9',
    justifyContent: 'center',
    alignItems: 'center',
  },

  handmadeIconText: {
    fontSize: 22,
    color: '#456B42',
  },

  productCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFDF4',
    borderRadius: 20,
    padding: 12,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#E6DDCF',
    shadowColor: '#456B42',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },

  productImage: {
    width: 112,
    height: 122,
    borderRadius: 16,
    backgroundColor: '#E3EAD9',
  },

  productInfo: {
    flex: 1,
    marginLeft: 14,
  },

  nameRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },

  productName: {
    flex: 1,
    fontSize: 16,
    fontWeight: '800',
    color: '#403630',
    lineHeight: 21,
  },

  deleteButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#EEF2E8',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 6,
  },

  deleteIcon: {
    fontSize: 22,
    color: '#66805F',
    lineHeight: 23,
  },

  artisan: {
    fontSize: 11,
    color: '#81756D',
    marginTop: 5,
    lineHeight: 16,
  },

  price: {
    fontSize: 18,
    fontWeight: '800',
    color: '#456B42',
    marginTop: 7,
  },

  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 10,
  },

  quantityBox: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#C9D4BE',
    borderRadius: 10,
    overflow: 'hidden',
  },

  quantityButton: {
    width: 29,
    height: 29,
    backgroundColor: '#EAF0E3',
    justifyContent: 'center',
    alignItems: 'center',
  },

  quantityButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#456B42',
  },

  quantity: {
    minWidth: 32,
    textAlign: 'center',
    fontSize: 13,
    fontWeight: '800',
    color: '#403630',
  },

  itemTotal: {
    fontSize: 14,
    fontWeight: '800',
    color: '#403630',
  },

  deliveryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E3EAD9',
    borderRadius: 18,
    padding: 14,
    marginTop: 5,
    marginBottom: 18,
  },

  deliveryIcon: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: '#FFFDF4',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },

  deliveryIconText: {
    fontSize: 20,
  },

  deliveryContent: {
    flex: 1,
  },

  deliveryTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#456B42',
  },

  deliveryText: {
    fontSize: 11,
    color: '#687360',
    marginTop: 3,
  },

  check: {
    fontSize: 18,
    fontWeight: '800',
    color: '#456B42',
  },

  summary: {
    backgroundColor: '#FFFDF4',
    borderRadius: 20,
    padding: 19,
    borderWidth: 1,
    borderColor: '#E6DDCF',
  },

  summaryTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#403630',
    marginBottom: 18,
  },

  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 13,
  },

  summaryLabel: {
    fontSize: 13,
    color: '#81756D',
  },

  summaryValue: {
    fontSize: 14,
    fontWeight: '700',
    color: '#403630',
  },

  free: {
    fontSize: 13,
    fontWeight: '800',
    color: '#456B42',
  },

  divider: {
    height: 1,
    backgroundColor: '#E6DDCF',
    marginVertical: 7,
  },

  totalLabel: {
    fontSize: 17,
    fontWeight: '800',
    color: '#403630',
  },

  totalValue: {
    fontSize: 20,
    fontWeight: '900',
    color: '#456B42',
  },

  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
    paddingTop: 13,
    paddingBottom: 24,
    backgroundColor: '#FFFDF4',
    borderTopWidth: 1,
    borderTopColor: '#E6DDCF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  totalSmall: {
    fontSize: 11,
    color: '#81756D',
  },

  bottomPrice: {
    fontSize: 20,
    fontWeight: '900',
    color: '#456B42',
    marginTop: 2,
  },

  checkoutButton: {
    height: 52,
    paddingHorizontal: 18,
    borderRadius: 15,
    backgroundColor: '#456B42',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#456B42',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.2,
    shadowRadius: 7,
    elevation: 4,
  },

  checkoutText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },

  checkoutArrow: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '500',
    marginLeft: 8,
  },

  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },

  emptyIconCircle: {
    width: 105,
    height: 105,
    borderRadius: 52,
    backgroundColor: '#E3EAD9',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },

  emptyEmoji: {
    fontSize: 50,
  },

  emptyTitle: {
    fontSize: 23,
    fontWeight: '900',
    color: '#403630',
  },

  emptyText: {
    fontSize: 14,
    lineHeight: 21,
    color: '#81756D',
    textAlign: 'center',
    marginTop: 10,
    marginBottom: 26,
  },

  exploreButton: {
    backgroundColor: '#456B42',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 15,
  },

  exploreButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
  },

});