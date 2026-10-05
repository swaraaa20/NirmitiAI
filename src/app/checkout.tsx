import { router } from 'expo-router';

import {
  View,
  Text,
  Pressable,
  ScrollView,
  StyleSheet,
  Image,
  Alert,
} from 'react-native';

import { useCart } from '../context/CartContext';
import { supabase } from '../services/supabase';
export default function CheckoutScreen() {
  const {
    cart,
    cartTotal,
    cartCount,
    clearCart,
  } = useCart();

 const handlePlaceOrder = async () => {
  if (cart.length === 0) {
    Alert.alert(
      'Your Bag is Empty',
      'Please add a product before placing an order.'
    );
    return;
  }

  try {
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      Alert.alert(
        'Login Required',
        'Please login before placing an order.'
      );
      return;
    }


    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        buyer_id: user.id,
        total_amount: cartTotal,
        status: 'placed',
      })
      .select()
      .single();

    if (orderError || !order) {
      console.log('ORDER ERROR:', orderError);
      Alert.alert(
        'Order Failed',
        orderError?.message || 'Could not create your order.'
      );
      return;
    }

    const productIds = cart.map((item) => item.id);

    const {
      data: products,
      error: productsError,
    } = await supabase
      .from('products')
      .select('id, artisan_id')
      .in('id', productIds);

    if (productsError) {
      console.log('PRODUCT ERROR:', productsError);

      await supabase
        .from('orders')
        .delete()
        .eq('id', order.id);

      Alert.alert(
        'Order Failed',
        productsError.message
      );
      return;
    }

    const orderItems = cart.map((item) => {
      const product = products?.find(
        (p) => p.id === item.id
      );

      return {
        order_id: order.id,
        product_id: item.id,
        seller_id: product?.artisan_id,
        quantity: item.quantity,
        price: item.selling_price,
      };
    });

    if (orderItems.some((item) => !item.seller_id)) {
      await supabase
        .from('orders')
        .delete()
        .eq('id', order.id);

      Alert.alert(
        'Order Failed',
        'Could not identify the seller for one of the products.'
      );
      return;
    }

    const { error: itemsError } = await supabase
      .from('order_items')
      .insert(orderItems);

    if (itemsError) {
      console.log('ORDER ITEMS ERROR:', itemsError);

      await supabase
        .from('orders')
        .delete()
        .eq('id', order.id);

      Alert.alert(
        'Order Failed',
        itemsError.message
      );
      return;
    }

    Alert.alert(
      'Order Placed 🎉',
      `Your order of ₹${cartTotal.toLocaleString(
        'en-IN'
      )} has been successfully placed!`,
      [
        {
          text: 'Continue Shopping',
          onPress: () => {
            clearCart();
            router.replace('/buyer');
          },
        },
      ]
    );
  } catch (error) {
    console.log('CHECKOUT ERROR:', error);

    Alert.alert(
      'Error',
      'Something went wrong while placing your order.'
    );
  }
};

  /* EMPTY CART */

  if (cart.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <View style={styles.emptyIconCircle}>
          <Text style={styles.emptyEmoji}>🛍️</Text>
        </View>

        <Text style={styles.emptyTitle}>
          Your Bag is Empty
        </Text>

        <Text style={styles.emptyText}>
          Add some beautiful Indian crafts before
          checkout.
        </Text>

        <Pressable
          style={styles.shopButton}
          onPress={() =>
            router.replace('/buyer')
          }
        >
          <Text style={styles.shopButtonText}>
            Continue Shopping
          </Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.container}>

      {/* HEADER */}

      <View style={styles.header}>
        <Pressable
          onPress={() => router.back()}
          style={styles.backButtonContainer}
        >
          <Text style={styles.backButton}>
            ‹
          </Text>
        </Pressable>

        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>
            Checkout
          </Text>

          <Text style={styles.headerSubtitle}>
            Complete your order
          </Text>
        </View>

        <View style={styles.headerRight}>
          <Text style={styles.lockIcon}>
            🔒
          </Text>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >

        {/* STEP INDICATOR */}

        <View style={styles.stepsContainer}>
          <View style={styles.stepActive}>
            <Text style={styles.stepNumber}>
              ✓
            </Text>
          </View>

          <View style={styles.stepLine} />

          <View style={styles.stepActive}>
            <Text style={styles.stepNumber}>
              2
            </Text>
          </View>

          <View style={styles.stepLine} />

          <View style={styles.stepInactive}>
            <Text style={styles.stepInactiveNumber}>
              3
            </Text>
          </View>
        </View>

        <View style={styles.stepLabels}>
          <Text style={styles.stepLabelActive}>
            Bag
          </Text>

          <Text style={styles.stepLabelActive}>
            Checkout
          </Text>

          <Text style={styles.stepLabel}>
            Confirmation
          </Text>
        </View>

        {/* ORDER SUMMARY */}

        <View style={styles.sectionHeader}>
          <View>
            <Text style={styles.sectionTitle}>
              Order Summary
            </Text>

            <Text style={styles.sectionSubtitle}>
              Review your selected crafts
            </Text>
          </View>

          <View style={styles.itemBadge}>
            <Text style={styles.itemBadgeText}>
              {cartCount}{' '}
              {cartCount === 1
                ? 'item'
                : 'items'}
            </Text>
          </View>
        </View>

        {/* PRODUCTS */}

        <View style={styles.productsContainer}>
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
                <Text
                  style={styles.productName}
                  numberOfLines={2}
                >
                  {item.product_name}
                </Text>

                <View style={styles.artisanRow}>
                  <Text style={styles.artisanDot}>
                    ●
                  </Text>

                  <Text style={styles.artisan}>
                    Indian Artisan
                  </Text>
                </View>

                <View style={styles.productBottom}>
                  <View style={styles.quantityBadge}>
                    <Text
                      style={
                        styles.quantityBadgeText
                      }
                    >
                      Qty {item.quantity}
                    </Text>
                  </View>

                  <Text style={styles.productPrice}>
                    ₹
                    {(
                      item.selling_price *
                      item.quantity
                    ).toLocaleString('en-IN')}
                  </Text>
                </View>
              </View>
            </View>
          ))}
        </View>

        {/* DELIVERY ADDRESS */}

        <View style={styles.sectionBlock}>
          <View style={styles.sectionTitleRow}>
            <Text style={styles.sectionIcon}>
              📍
            </Text>

            <View>
              <Text style={styles.sectionTitle}>
                Delivery Address
              </Text>

              <Text
                style={styles.sectionSubtitle}
              >
                Where should we deliver?
              </Text>
            </View>
          </View>

          <View style={styles.addressCard}>
            <View style={styles.addressIconBox}>
              <Text style={styles.addressIcon}>
                🏠
              </Text>
            </View>

            <View style={styles.addressContent}>
              <Text style={styles.addressTitle}>
                Demo Delivery Address
              </Text>

              <Text
                style={styles.addressDescription}
              >
                Pune, Maharashtra, India
              </Text>

              <View style={styles.demoBadge}>
                <Text style={styles.demoBadgeText}>
                  Demo address
                </Text>
              </View>
            </View>

            <Text style={styles.chevron}>
              ›
            </Text>
          </View>
        </View>

        {/* PAYMENT */}

        <View style={styles.sectionBlock}>
          <View style={styles.sectionTitleRow}>
            <Text style={styles.sectionIcon}>
              💳
            </Text>

            <View>
              <Text style={styles.sectionTitle}>
                Payment Method
              </Text>

              <Text
                style={styles.sectionSubtitle}
              >
                Choose how you want to pay
              </Text>
            </View>
          </View>

          <View style={styles.paymentCard}>
            <View style={styles.paymentIconBox}>
              <Text style={styles.paymentIcon}>
                💳
              </Text>
            </View>

            <View style={styles.paymentContent}>
              <Text style={styles.paymentTitle}>
                UPI / Cash on Delivery
              </Text>

              <Text
                style={styles.paymentDescription}
              >
                Payment integration coming soon
              </Text>
            </View>

            <View style={styles.selectedCircle}>
              <Text
                style={styles.selectedCheck}
              >
                ✓
              </Text>
            </View>
          </View>
        </View>

        {/* PRICE DETAILS */}

        <View style={styles.priceCard}>
          <Text style={styles.priceCardTitle}>
            Price Details
          </Text>

          <View style={styles.priceRow}>
            <Text style={styles.priceLabel}>
              Products
            </Text>

            <Text style={styles.priceValue}>
              ₹{cartTotal.toLocaleString('en-IN')}
            </Text>
          </View>

          <View style={styles.priceRow}>
            <Text style={styles.priceLabel}>
              Delivery
            </Text>

            <Text style={styles.freeText}>
              FREE
            </Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>
              Total Amount
            </Text>

            <Text style={styles.totalPrice}>
              ₹{cartTotal.toLocaleString('en-IN')}
            </Text>
          </View>
        </View>

        {/* TRUST MESSAGE */}

        <View style={styles.trustCard}>
          <Text style={styles.trustIcon}>
            🛡️
          </Text>

          <View style={styles.trustContent}>
            <Text style={styles.trustTitle}>
              Supporting Indian Artisans
            </Text>

            <Text style={styles.trustText}>
              Your purchase directly supports
              traditional artisans and their
              communities.
            </Text>
          </View>
        </View>

        <View style={styles.bottomSpace} />

      </ScrollView>

      {/* BOTTOM ORDER BAR */}

      <View style={styles.bottomBar}>
        <View style={styles.bottomTotal}>
          <Text style={styles.bottomTotalLabel}>
            Total
          </Text>

          <Text style={styles.bottomTotalPrice}>
            ₹{cartTotal.toLocaleString('en-IN')}
          </Text>
        </View>

        <Pressable
          style={styles.orderButton}
          onPress={handlePlaceOrder}
        >
          <Text style={styles.orderButtonText}>
            Place Order
          </Text>

          <Text style={styles.orderArrow}>
            →
          </Text>
        </Pressable>
      </View>

    </View>
  );
}

const styles = StyleSheet.create({

  /* MAIN */

  container: {
    flex: 1,
    backgroundColor: '#FBF5ED',
  },

  /* HEADER */

  header: {
    height: 112,
    paddingTop: 48,
    paddingHorizontal: 18,
    backgroundColor: '#7A3E22',
    flexDirection: 'row',
    alignItems: 'center',
  },

  backButtonContainer: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor:
      'rgba(255,255,255,0.13)',
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

  headerTitle: {
    color: '#FFFFFF',
    fontSize: 21,
    fontWeight: '800',
  },

  headerSubtitle: {
    color: '#EBD7C9',
    fontSize: 11,
    marginTop: 3,
  },

  headerRight: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor:
      'rgba(255,255,255,0.13)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  lockIcon: {
    fontSize: 17,
  },

  /* CONTENT */

  content: {
    paddingHorizontal: 18,
    paddingTop: 22,
    paddingBottom: 150,
  },

  /* STEPS */

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
    backgroundColor: '#8B4A2B',
    justifyContent: 'center',
    alignItems: 'center',
  },

  stepInactive: {
    width: 29,
    height: 29,
    borderRadius: 15,
    backgroundColor: '#E7D8CC',
    justifyContent: 'center',
    alignItems: 'center',
  },

  stepNumber: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
  },

  stepInactiveNumber: {
    color: '#8C8179',
    fontSize: 12,
    fontWeight: '700',
  },

  stepLine: {
    height: 2,
    width: 58,
    backgroundColor: '#CDAE98',
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
    color: '#7A3E22',
    fontWeight: '700',
  },

  stepLabel: {
    fontSize: 10,
    color: '#9C9189',
  },

  /* SECTION */

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
    color: '#3B2B25',
  },

  sectionSubtitle: {
    fontSize: 11,
    color: '#96877E',
    marginTop: 3,
  },

  itemBadge: {
    backgroundColor: '#F0E2D6',
    paddingHorizontal: 11,
    paddingVertical: 6,
    borderRadius: 14,
  },

  itemBadgeText: {
    color: '#7A3E22',
    fontSize: 11,
    fontWeight: '700',
  },

  /* PRODUCTS */

  productsContainer: {
    marginBottom: 5,
  },

  productCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 11,
    flexDirection: 'row',
    marginBottom: 11,
    borderWidth: 1,
    borderColor: '#EDE2D9',
  },

  productImage: {
    width: 92,
    height: 92,
    borderRadius: 14,
    backgroundColor: '#F0E6DD',
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
    color: '#3B2B25',
  },

  artisanRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
  },

  artisanDot: {
    color: '#B86D42',
    fontSize: 8,
    marginRight: 5,
  },

  artisan: {
    fontSize: 11,
    color: '#94877F',
  },

  productBottom: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 10,
  },

  quantityBadge: {
    backgroundColor: '#F7EFE8',
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 8,
  },

  quantityBadgeText: {
    color: '#79675D',
    fontSize: 10,
    fontWeight: '700',
  },

  productPrice: {
    color: '#7A3E22',
    fontSize: 16,
    fontWeight: '800',
  },

  /* SECTION BLOCK */

  sectionBlock: {
    marginTop: 23,
  },

  /* ADDRESS */

  addressCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 17,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#EDE2D9',
  },

  addressIconBox: {
    width: 46,
    height: 46,
    borderRadius: 14,
    backgroundColor: '#F7E9DE',
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
    color: '#3B2B25',
  },

  addressDescription: {
    fontSize: 12,
    color: '#796D65',
    marginTop: 4,
  },

  demoBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#F4E6DA',
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 6,
    marginTop: 6,
  },

  demoBadgeText: {
    color: '#9A6244',
    fontSize: 9,
    fontWeight: '700',
  },

  chevron: {
    fontSize: 25,
    color: '#A48D80',
    marginLeft: 8,
  },

  /* PAYMENT */

  paymentCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 17,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5D1C2',
  },

  paymentIconBox: {
    width: 46,
    height: 46,
    borderRadius: 14,
    backgroundColor: '#F7E9DE',
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
    color: '#3B2B25',
  },

  paymentDescription: {
    fontSize: 11,
    color: '#8C7E75',
    marginTop: 4,
  },

  selectedCircle: {
    width: 23,
    height: 23,
    borderRadius: 12,
    backgroundColor: '#7A3E22',
    justifyContent: 'center',
    alignItems: 'center',
  },

  selectedCheck: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
  },

  /* PRICE */

  priceCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 17,
    marginTop: 24,
    borderWidth: 1,
    borderColor: '#EDE2D9',
  },

  priceCardTitle: {
    color: '#3B2B25',
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
    color: '#4B3B33',
    fontSize: 13,
    fontWeight: '600',
  },

  freeText: {
    color: '#4D8A60',
    fontSize: 12,
    fontWeight: '800',
  },

  divider: {
    height: 1,
    backgroundColor: '#EEE4DC',
    marginVertical: 5,
  },

  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },

  totalLabel: {
    color: '#3B2B25',
    fontSize: 16,
    fontWeight: '800',
  },

  totalPrice: {
    color: '#7A3E22',
    fontSize: 21,
    fontWeight: '900',
  },

  /* TRUST */

  trustCard: {
    flexDirection: 'row',
    backgroundColor: '#F3E7DA',
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
    color: '#68402C',
    fontSize: 12,
    fontWeight: '800',
  },

  trustText: {
    color: '#8A6E5D',
    fontSize: 10,
    lineHeight: 15,
    marginTop: 3,
  },

  bottomSpace: {
    height: 30,
  },

  /* BOTTOM BAR */

  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E8DCD3',
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
    color: '#8D8179',
    fontSize: 11,
  },

  bottomTotalPrice: {
    color: '#3B2B25',
    fontSize: 21,
    fontWeight: '900',
    marginTop: 2,
  },

  orderButton: {
    height: 52,
    paddingHorizontal: 21,
    borderRadius: 15,
    backgroundColor: '#7A3E22',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 155,
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

  /* EMPTY */

  emptyContainer: {
    flex: 1,
    backgroundColor: '#FBF5ED',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 30,
  },

  emptyIconCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#F0E1D5',
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
    color: '#3B2B25',
  },

  emptyText: {
    fontSize: 14,
    color: '#8C7E75',
    textAlign: 'center',
    lineHeight: 21,
    marginTop: 9,
    marginBottom: 25,
  },

  shopButton: {
    backgroundColor: '#7A3E22',
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