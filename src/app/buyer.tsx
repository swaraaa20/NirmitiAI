import React, {
  useEffect,
  useMemo,
  useState,
} from 'react';

import {
  Alert,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { router } from 'expo-router';

import { supabase } from '../services/supabase';
import { useCart } from '../context/CartContext';

type Product = {
  id: string;
  product_name: string;
  description_en?: string | null;
  description_hi?: string | null;
  description_mr?: string | null;
  category?: string | null;
  material?: string | null;
  image_url?: string | null;
  selling_price?: number | null;
  artisan_id?: string | null;
  seller_name?: string | null;
  city?: string | null;
  occasion?: string[];
  isFake?: boolean;
};

type Category = {
  name: string;
  icon: string;
  color: string;
};

const categories: Category[] = [
  {
    name: 'Food',
    icon: '🍪',
    color: '#FFE8D9',
  },
  {
    name: 'Candles',
    icon: '🕯️',
    color: '#FFF0B8',
  },
  {
    name: 'Crochet',
    icon: '🧶',
    color: '#E8DDF2',
  },
  {
    name: 'Jewellery',
    icon: '💍',
    color: '#F8DCE4',
  },
  {
    name: 'Art',
    icon: '🎨',
    color: '#DDEDE7',
  },
  {
    name: 'Clothing',
    icon: '👗',
    color: '#E8E0F4',
  },
  {
    name: 'Gifts',
    icon: '🎁',
    color: '#FFE2D7',
  },
  {
    name: 'Home Decor',
    icon: '🏡',
    color: '#E2EFEA',
  },
];

const occasions = [
  {
    title: 'Birthdays',
    icon: '🎂',
    color: '#FFE2D9',
  },
  {
    title: 'Anniversaries',
    icon: '💐',
    color: '#F8DCE4',
  },
  {
    title: 'Festive',
    icon: '✨',
    color: '#FFF0B8',
  },
  {
    title: 'Housewarming',
    icon: '🏡',
    color: '#DDEDE7',
  },
  {
    title: 'Return Gifts',
    icon: '🎁',
    color: '#E8DDF2',
  },
  {
    title: 'Just Because',
    icon: '💌',
    color: '#FFE3DC',
  },
];

const fakeProducts: Product[] = [
  {
    id: 'fake-food-1',
    product_name: 'Chocolate Walnut Brownies',
    description_en:
      'Rich homemade brownies packed with walnuts.',
    category: 'Food',
    selling_price: 380,
    seller_name: 'Meera’s Kitchen',
    city: 'Pune',
    image_url:
      'https://images.unsplash.com/photo-1564355808539-22fda35bed7e?w=800',
    occasion: [
      'Birthdays',
      'Just Because',
    ],
    isFake: true,
  },
  {
    id: 'fake-food-2',
    product_name: 'Homestyle Masala Chakli',
    description_en:
      'Crispy traditional chakli made in small batches.',
    category: 'Food',
    selling_price: 280,
    seller_name: 'Aai’s Pantry',
    city: 'Mumbai',
    image_url:
      'https://th.bing.com/th/id/OIP.WZ7zCPuYatSAp_w3XgKckAHaLH?w=202&h=303&c=7&r=0&o=7&dpr=1.5&pid=1.7&rm=3',
    occasion: [
      'Festive',
      'Return Gifts',
    ],
    isFake: true,
  },
  {
    id: 'fake-food-3',
    product_name: 'Mango Ginger Pickle',
    description_en:
      'Homemade seasonal pickle with a traditional recipe.',
    category: 'Food',
    selling_price: 220,
    seller_name: 'Ghar Ka Swaad',
    city: 'Nashik',
    image_url:
      'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=800',
    occasion: [
      'Festive',
      'Just Because',
    ],
    isFake: true,
  },

  {
    id: 'fake-candle-1',
    product_name: 'Vanilla Bean Candle',
    description_en:
      'Warm vanilla scented hand-poured candle.',
    category: 'Candles',
    selling_price: 399,
    seller_name: 'Glow by Riya',
    city: 'Pune',
    image_url:
      'https://images.unsplash.com/photo-1603006905003-be475563bc59?w=800',
    occasion: [
      'Birthdays',
      'Just Because',
    ],
    isFake: true,
  },
  {
    id: 'fake-candle-2',
    product_name: 'Rose Petal Candle',
    description_en:
      'Delicate floral candle made with rose fragrance.',
    category: 'Candles',
    selling_price: 449,
    seller_name: 'The Little Wick',
    city: 'Pune',
    image_url:
      'https://images.unsplash.com/photo-1777107857801-ece87fefbfbe?q=80&w=1974&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    occasion: [
      'Anniversaries',
      'Just Because',
    ],
    isFake: true,
  },
  {
    id: 'fake-candle-3',
    product_name: 'Festive Diya Candle Set',
    description_en:
      'Set of six decorative candles for festive evenings.',
    category: 'Candles',
    selling_price: 520,
    seller_name: 'Glow & Grace',
    city: 'Kolhapur',
    image_url:
      'https://images.unsplash.com/photo-1602523961358-f9f03dd557db?w=800',
    occasion: [
      'Festive',
      'Housewarming',
    ],
    isFake: true,
  },

  {
    id: 'fake-crochet-1',
    product_name: 'Pastel Crochet Tote',
    description_en:
      'Hand-crocheted everyday tote in soft pastel colours.',
    category: 'Crochet',
    selling_price: 850,
    seller_name: 'Asha’s Knots',
    city: 'Pune',
    image_url:
      'https://images.unsplash.com/photo-1594223274512-ad4803739b7c?w=800',
    occasion: [
      'Birthdays',
      'Just Because',
    ],
    isFake: true,
  },
  {
    id: 'fake-crochet-2',
    product_name: 'Crochet Flower Bouquet',
    description_en:
      'A forever bouquet of handmade crochet flowers.',
    category: 'Crochet',
    selling_price: 950,
    seller_name: 'Loop & Love',
    city: 'Mumbai',
    image_url:
      'https://images.unsplash.com/photo-1523438885200-e635ba2c371e?w=800',
    occasion: [
      'Anniversaries',
      'Birthdays',
    ],
    isFake: true,
  },
  {
    id: 'fake-crochet-3',
    product_name: 'Baby Crochet Booties',
    description_en:
      'Soft handmade crochet booties for little ones.',
    category: 'Crochet',
    selling_price: 420,
    seller_name: 'Cozy Loops',
    city: 'Satara',
    image_url:
      'https://images.unsplash.com/photo-1522771930-78848d9293e8?w=800',
    occasion: [
      'Birthdays',
      'Just Because',
    ],
    isFake: true,
  },

  {
    id: 'fake-jewellery-1',
    product_name: 'Pearl Drop Earrings',
    description_en:
      'Elegant handmade pearl-inspired earrings.',
    category: 'Jewellery',
    selling_price: 620,
    seller_name: 'Nisha Jewels',
    city: 'Pune',
    image_url:
      'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=800',
    occasion: [
      'Anniversaries',
      'Birthdays',
    ],
    isFake: true,
  },
  {
    id: 'fake-jewellery-2',
    product_name: 'Oxidised Floral Necklace',
    description_en:
      'Statement necklace inspired by Indian floral motifs.',
    category: 'Jewellery',
    selling_price: 780,
    seller_name: 'Mitti & Metal',
    city: 'Jaipur',
    image_url:
      'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=800',
    occasion: [
      'Festive',
      'Birthdays',
    ],
    isFake: true,
  },
  {
    id: 'fake-jewellery-3',
    product_name: 'Pastel Charm Bracelet',
    description_en:
      'Colourful handmade bracelet with delicate charms.',
    category: 'Jewellery',
    selling_price: 450,
    seller_name: 'Little Charms',
    city: 'Pune',
    image_url:
      'https://images.unsplash.com/photo-1611652022419-a9419f74343d?w=800',
    occasion: [
      'Birthdays',
      'Just Because',
    ],
    isFake: true,
  },

  {
    id: 'fake-art-1',
    product_name: 'Floral Watercolour Art',
    description_en:
      'Soft floral watercolour artwork for your home.',
    category: 'Art',
    selling_price: 900,
    seller_name: 'Riya Creates',
    city: 'Pune',
    image_url:
      'https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=800',
    occasion: [
      'Housewarming',
      'Birthdays',
    ],
    isFake: true,
  },
  {
    id: 'fake-art-2',
    product_name: 'Madhubani Inspired Artwork',
    description_en:
      'Colourful Indian folk-inspired artwork.',
    category: 'Art',
    selling_price: 1450,
    seller_name: 'Colors by Kavya',
    city: 'Nagpur',
    image_url:
      'https://images.unsplash.com/photo-1577083552431-6e5fd01aa342?w=800',
    occasion: [
      'Festive',
      'Housewarming',
    ],
    isFake: true,
  },
  {
    id: 'fake-art-3',
    product_name: 'Custom Couple Portrait',
    description_en:
      'Personalised hand-painted portrait for special memories.',
    category: 'Art',
    selling_price: 1800,
    seller_name: 'Brush & Bloom',
    city: 'Mumbai',
    image_url:
      'https://images.unsplash.com/photo-1577083552431-6e5fd01aa342?w=800',
    occasion: [
      'Anniversaries',
      'Birthdays',
    ],
    isFake: true,
  },

  {
    id: 'fake-clothing-1',
    product_name: 'Hand-Painted Dupatta',
    description_en:
      'Lightweight dupatta with delicate hand-painted details.',
    category: 'Clothing',
    selling_price: 1150,
    seller_name: 'Threads by Anu',
    city: 'Pune',
    image_url:
      'https://images.unsplash.com/photo-1759840279499-f9de9764b2cf?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NXx8aGFuZCUyMHBhaW50ZWQlMjBkdXBhdHRhfGVufDB8fDB8fHww',
    occasion: [
      'Festive',
      'Birthdays',
    ],
    isFake: true,
  },
  {
    id: 'fake-clothing-2',
    product_name: 'Embroidered Cotton Kurti',
    description_en:
      'Comfortable cotton kurti with handmade embroidery.',
    category: 'Clothing',
    selling_price: 1350,
    seller_name: 'Sui Dhaaga Studio',
    city: 'Nashik',
    image_url:
      'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=800',
    occasion: [
      'Festive',
      'Just Because',
    ],
    isFake: true,
  },
  {
    id: 'fake-clothing-3',
    product_name: 'Crochet Summer Shrug',
    description_en:
      'Lightweight handmade shrug for everyday outfits.',
    category: 'Clothing',
    selling_price: 990,
    seller_name: 'The Cozy Thread',
    city: 'Pune',
    image_url:
      'https://images.unsplash.com/photo-1529139574466-a303027c1d8b?w=800',
    occasion: [
      'Birthdays',
      'Just Because',
    ],
    isFake: true,
  },

  {
    id: 'fake-gift-1',
    product_name: 'Birthday Sweet Hamper',
    description_en:
      'A cheerful hamper filled with homemade treats.',
    category: 'Gifts',
    selling_price: 799,
    seller_name: 'Happy Hampers',
    city: 'Pune',
    image_url:
      'https://images.unsplash.com/photo-1720798198034-6f7468e99460?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    occasion: [
      'Birthdays',
      'Return Gifts',
    ],
    isFake: true,
  },
  {
    id: 'fake-gift-2',
    product_name: 'Self-Care Gift Box',
    description_en:
      'A thoughtful box with candles, soaps and little treats.',
    category: 'Gifts',
    selling_price: 1099,
    seller_name: 'Little Joy Co.',
    city: 'Mumbai',
    image_url:
      'https://images.unsplash.com/photo-1544816155-12df9643f363?w=800',
    occasion: [
      'Anniversaries',
      'Just Because',
    ],
    isFake: true,
  },
  {
    id: 'fake-gift-3',
    product_name: 'Festive Family Hamper',
    description_en:
      'A festive collection of homemade goodies.',
    category: 'Gifts',
    selling_price: 1299,
    seller_name: 'GharSe Gifts',
    city: 'Pune',
    image_url:
      'https://plus.unsplash.com/premium_photo-1671815629160-40598a2f00a7?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    occasion: [
      'Festive',
      'Return Gifts',
    ],
    isFake: true,
  },

  {
    id: 'fake-home-1',
    product_name: 'Macramé Wall Hanging',
    description_en:
      'Hand-knotted macramé piece for cosy spaces.',
    category: 'Home Decor',
    selling_price: 850,
    seller_name: 'Home by Neha',
    city: 'Pune',
    image_url:
      'https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=800',
    occasion: [
      'Housewarming',
      'Just Because',
    ],
    isFake: true,
  },
  {
    id: 'fake-home-2',
    product_name: 'Hand-Painted Vase',
    description_en:
      'Decorative ceramic vase with floral artwork.',
    category: 'Home Decor',
    selling_price: 720,
    seller_name: 'Little Home Studio',
    city: 'Pune',
    image_url:
      'https://images.unsplash.com/photo-1610701596007-11502861dcfa?w=800',
    occasion: [
      'Housewarming',
      'Festive',
    ],
    isFake: true,
  },
  {
    id: 'fake-home-3',
    product_name: 'Floral Resin Tray',
    description_en:
      'Elegant resin tray with preserved floral details.',
    category: 'Home Decor',
    selling_price: 950,
    seller_name: 'Petals & Resin',
    city: 'Mumbai',
    image_url:
      'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=800',
    occasion: [
      'Housewarming',
      'Anniversaries',
    ],
    isFake: true,
  },
];

const makerStories = [
  {
    name: 'Meera',
    business: 'Meera’s Kitchen',
    category: 'Homemade Food',
    image:
      'data:image/webp;base64,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',
    story:
      'What started with baking for neighbours slowly became a little kitchen business filled with family recipes.',
  },
  {
    name: 'Asha',
    business: 'Asha’s Knots',
    category: 'Crochet',
    image:
      'https://tse3.mm.bing.net/th/id/OIP.GtL1g5dOEjQz-LEWZCpiiAAAAA?r=0&w=339&h=509&rs=1&pid=ImgDetMain&o=7&rm=3',
    story:
      'Asha picked up crochet during quiet evenings at home. Today, every piece is still made one loop at a time.',
  },
  {
    name: 'Riya',
    business: 'Riya Creates',
    category: 'Art',
    image:
      'https://live.staticflickr.com/637/23267312632_9a93f69e34_b.jpg',
    story:
      'Riya started painting personalised gifts for friends. Soon, people began asking her to paint their own memories.',
  },
  {
    name: 'Neha',
    business: 'Home by Neha',
    category: 'Home Decor',
    image:
      'https://i.pinimg.com/736x/28/bd/4f/28bd4fe25579ed9825e22a28ed58be62.jpg',
    story:
      'Neha loves turning ordinary corners into warm spaces with handmade décor created from her home studio.',
  },
  {
    name: 'Kavya',
    business: 'Colors by Kavya',
    category: 'Art & Gifts',
    image:
      'https://th.bing.com/th/id/OIP.uW8IXUWKHX4qADeLbOWo9wHaE-?w=247&h=180&c=7&r=0&o=7&dpr=1.5&pid=1.7&rm=3',
    story:
      'Kavya believes handmade gifts feel different because someone has spent time making them just for you.',
  },
  {
    name: 'Nisha',
    business: 'Nisha Jewels',
    category: 'Jewellery',
    image:
      'https://th.bing.com/th/id/OIP.4HRLRXM53PWgHnfCN4dRXwHaE8?w=282&h=188&c=7&r=0&o=7&dpr=1.5&pid=1.7&rm=3',
    story:
      'Nisha began making jewellery for family celebrations and discovered a love for creating pieces for others too.',
  },
];

export default function BuyerScreen() {
  const { addToCart } = useCart();

  const [products, setProducts] =
    useState<Product[]>([]);

  const [searchText, setSearchText] =
    useState('');

  const [activeCategory, setActiveCategory] =
    useState('All');

  const [activeOccasion, setActiveOccasion] =
    useState<string | null>(null);

  const [wishlist, setWishlist] =
    useState<string[]>([]);

  const [loading, setLoading] =
    useState(true);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);

      const {
        data,
        error,
      } = await supabase
        .from('products')
        .select(`
          id,
          product_name,
          description_en,
          description_hi,
          description_mr,
          category,
          material,
          image_url,
          selling_price,
          artisan_id
        `)
        .order('created_at', {
          ascending: false,
        });

      if (error) {
        console.log(
          'Product fetch error:',
          error
        );
      }

      const databaseProducts =
        data || [];

      setProducts([
        ...databaseProducts,
        ...fakeProducts,
      ]);
    } catch (error) {
      console.log(error);

      setProducts(
        fakeProducts
      );
    } finally {
      setLoading(false);
    }
  };

  const filteredProducts =
    useMemo(() => {
      return products.filter(
        product => {
          const search =
            searchText
              .toLowerCase()
              .trim();

          const matchesSearch =
            !search ||
            product.product_name
              .toLowerCase()
              .includes(search) ||
            product.category
              ?.toLowerCase()
              .includes(search) ||
            product.seller_name
              ?.toLowerCase()
              .includes(search);

          const matchesCategory =
            activeCategory ===
              'All' ||
            product.category
              ?.toLowerCase()
              .includes(
                activeCategory.toLowerCase()
              );

          const matchesOccasion =
            !activeOccasion ||
            product.occasion?.includes(
              activeOccasion
            );

          return (
            matchesSearch &&
            matchesCategory &&
            matchesOccasion
          );
        }
      );
    }, [
      products,
      searchText,
      activeCategory,
      activeOccasion,
    ]);

  const toggleWishlist = (
    id: string
  ) => {
    setWishlist(prev =>
      prev.includes(id)
        ? prev.filter(
            item => item !== id
          )
        : [...prev, id]
    );
  };

  const handleCategory = (
    category: string
  ) => {
    setActiveCategory(category);
    setActiveOccasion(null);
  };

  const handleOccasion = (
    occasion: string
  ) => {
    setActiveOccasion(
      occasion
    );
    setActiveCategory('All');
  };

  const handleProductPress = (
    product: Product
  ) => {
    if (product.isFake) {
      Alert.alert(
        product.product_name,
        `${product.description_en || 'Beautiful handmade creation.'}\n\nMade by ${product.seller_name || 'a local homemaker'} in ${product.city || 'your city'}.`,
        [
          {
            text: 'Add to Bag',
            onPress: () =>
              handleAddToBag(
                product
              ),
          },
          {
            text: 'Close',
            style: 'cancel',
          },
        ]
      );

      return;
    }

    router.push(
      `/product/${product.id}`
    );
  };

  const handleAddToBag = (
    product: Product
  ) => {
    if (
      product.isFake
    ) {
      Alert.alert(
        'Demo product',
        'This is a sample product for your marketplace demo.'
      );

      return;
    }

    addToCart({
      id: product.id,
      product_name:
        product.product_name,
      price:
        Number(
          product.selling_price ||
            0
        ),
      image_url:
        product.image_url ||
        '',
      quantity: 1,
    });

    Alert.alert(
      'Added to bag',
      `${product.product_name} has been added to your bag.`
    );
  };

  const renderProductCard = (
    product: Product
  ) => {
    const isWishlisted =
      wishlist.includes(
        product.id
      );

    return (
      <Pressable
        key={product.id}
        style={styles.productCard}
        onPress={() =>
          handleProductPress(
            product
          )
        }
      >
        <View
          style={
            styles.productImageWrapper
          }
        >
          {product.image_url ? (
            <Image
              source={{
                uri: product.image_url,
              }}
              style={
                styles.productImage
              }
            />
          ) : (
            <View
              style={
                styles.productPlaceholder
              }
            >
              <Text
                style={
                  styles.placeholderEmoji
                }
              >
                ✨
              </Text>
            </View>
          )}

          <Pressable
            style={
              styles.wishlistButton
            }
            onPress={event => {
              event.stopPropagation();

              toggleWishlist(
                product.id
              );
            }}
          >
            <Text
              style={[
                styles.wishlistText,
                isWishlisted &&
                  styles.wishlistActive,
              ]}
            >
              {isWishlisted
                ? '♥'
                : '♡'}
            </Text>
          </Pressable>

          {product.isFake && (
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
                FEATURED
              </Text>
            </View>
          )}
        </View>

        <View
          style={
            styles.productInfo
          }
        >
          <Text
            style={
              styles.productCategory
            }
          >
            {product.category ||
              'Handmade'}
          </Text>

          <Text
            style={
              styles.productName
            }
            numberOfLines={1}
          >
            {product.product_name}
          </Text>

          <Text
            style={
              styles.productMaker
            }
            numberOfLines={1}
          >
            {product.seller_name ||
              'Made by a homemaker'}
          </Text>

          <View
            style={
              styles.productBottom
            }
          >
            <Text
              style={
                styles.productPrice
              }
            >
              ₹
              {Number(
                product.selling_price ||
                  0
              ).toLocaleString(
                'en-IN'
              )}
            </Text>

            <Pressable
              style={
                styles.addButton
              }
              onPress={event => {
                event.stopPropagation();

                handleAddToBag(
                  product
                );
              }}
            >
              <Text
                style={
                  styles.addButtonText
                }
              >
                +
              </Text>
            </Pressable>
          </View>
        </View>
      </Pressable>
    );
  };

  return (
    <View
      style={styles.container}
    >
      <ScrollView
        showsVerticalScrollIndicator={
          false
        }
        contentContainerStyle={
          styles.scrollContent
        }
      >
        {/* HEADER */}

        <View
          style={styles.header}
        >
          <View>
            <Text
              style={
                styles.headerGreeting
              }
            >
              GOOD MORNING 🌷
            </Text>

            <Text
              style={
                styles.headerTitle
              }
            >
              Discover something
            </Text>

            <Text
              style={
                styles.headerAccent
              }
            >
              made with love.
            </Text>
          </View>

          <Pressable
            style={
              styles.profileButton
            }
            onPress={() =>
              router.push(
                '/profile'
              )
            }
          >
            <Text
              style={
                styles.profileEmoji
              }
            >
              👤
            </Text>
          </Pressable>
        </View>

        {/* SEARCH */}

        <View
          style={styles.searchBox}
        >
          <Text
            style={
              styles.searchIcon
            }
          >
            ⌕
          </Text>

          <TextInput
            value={searchText}
            onChangeText={text => {
              setSearchText(text);
              setActiveOccasion(
                null
              );
            }}
            placeholder="Search food, gifts, art..."
            placeholderTextColor="#9C8D9F"
            style={
              styles.searchInput
            }
          />
        </View>

        {/* HERO */}

        <View
          style={styles.hero}
        >
          <View
            style={
              styles.heroDecorOne
            }
          />

          <View
            style={
              styles.heroDecorTwo
            }
          />

          <View
            style={
              styles.heroContent
            }
          >
            <View
              style={styles.heroTag}
            >
              <Text
                style={
                  styles.heroTagText
                }
              >
                ✦ FROM LOCAL MAKERS
              </Text>
            </View>

            <Text
              style={
                styles.heroTitle
              }
            >
              Made at home.
            </Text>

            <Text
              style={
                styles.heroTitleAccent
              }
            >
              Loved everywhere.
            </Text>

            <Text
              style={
                styles.heroDescription
              }
            >
              Discover beautiful food,
              gifts, art and more —
              made by talented
              homemakers.
            </Text>

            <Pressable
              style={
                styles.heroButton
              }
              onPress={() => {
                setActiveCategory(
                  'All'
                );

                setActiveOccasion(
                  null
                );

                setSearchText('');
              }}
            >
              <Text
                style={
                  styles.heroButtonText
                }
              >
                Start exploring
              </Text>

              <Text
                style={
                  styles.heroArrow
                }
              >
                →
              </Text>
            </Pressable>
          </View>

          <View
            style={styles.heroVisual}
          >
            <View
              style={
                styles.heroCircle
              }
            >
              <Text
                style={
                  styles.heroVisualEmoji
                }
              >
                🎁
              </Text>

              <View
                style={
                  styles.heroMiniBadge
                }
              >
                <Text
                  style={
                    styles.heroMiniBadgeText
                  }
                >
                  ✨
                </Text>
              </View>
            </View>

            <View
              style={
                styles.floatingCard
              }
            >
              <Text
                style={
                  styles.floatingHeart
                }
              >
                ♡
              </Text>

              <View>
                <Text
                  style={
                    styles.floatingSmall
                  }
                >
                  MADE WITH
                </Text>

                <Text
                  style={
                    styles.floatingTitle
                  }
                >
                  LOVE
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* CATEGORY */}

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
              Shop by category
            </Text>

            <Text
              style={
                styles.sectionSubtitle
              }
            >
              Find something made just for you
            </Text>
          </View>

          <Pressable
            onPress={() => {
              setActiveCategory(
                'All'
              );
              setActiveOccasion(
                null
              );
            }}
          >
            <Text
              style={
                styles.seeAll
              }
            >
              See all
            </Text>
          </Pressable>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={
            false
          }
          contentContainerStyle={
            styles.categoryScroll
          }
        >
          {categories.map(
            category => (
              <Pressable
                key={
                  category.name
                }
                style={
                  styles.categoryItem
                }
                onPress={() =>
                  handleCategory(
                    category.name
                  )
                }
              >
                <View
                  style={[
                    styles.categoryIcon,
                    {
                      backgroundColor:
                        category.color,
                    },
                    activeCategory ===
                      category.name &&
                      styles.categorySelected,
                  ]}
                >
                  <Text
                    style={
                      styles.categoryEmoji
                    }
                  >
                    {
                      category.icon
                    }
                  </Text>
                </View>

                <Text
                  style={
                    styles.categoryName
                  }
                >
                  {
                    category.name
                  }
                </Text>
              </Pressable>
            )
          )}
        </ScrollView>

        {/* FILTER INDICATOR */}

        {(activeCategory !==
          'All' ||
          activeOccasion) && (
          <View
            style={
              styles.activeFilter
            }
          >
            <Text
              style={
                styles.activeFilterText
              }
            >
              Showing:{' '}
              {activeOccasion ||
                activeCategory}
            </Text>

            <Pressable
              onPress={() => {
                setActiveCategory(
                  'All'
                );
                setActiveOccasion(
                  null
                );
              }}
            >
              <Text
                style={
                  styles.clearFilter
                }
              >
                Clear
              </Text>
            </Pressable>
          </View>
        )}

        {/* PRODUCTS */}

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
              {activeOccasion
                ? `For ${activeOccasion}`
                : activeCategory !==
                    'All'
                  ? `${activeCategory} picks`
                  : 'Made by homemakers ✨'}
            </Text>

            <Text
              style={
                styles.sectionSubtitle
              }
            >
              {activeCategory !==
                  'All' ||
                activeOccasion
                ? 'Beautiful things made by local creators'
                : 'Small businesses, big heart'}
            </Text>
          </View>

          <Text
            style={
              styles.productCount
            }
          >
            {filteredProducts.length}{' '}
            items
          </Text>
        </View>

        {loading ? (
          <View
            style={
              styles.loadingBox
            }
          >
            <Text
              style={
                styles.loadingText
              }
            >
              Discovering beautiful creations...
            </Text>
          </View>
        ) : filteredProducts.length >
          0 ? (
          <View
            style={
              styles.productGrid
            }
          >
            {filteredProducts.map(
              renderProductCard
            )}
          </View>
        ) : (
          <View
            style={
              styles.emptyBox
            }
          >
            <Text
              style={
                styles.emptyEmoji
              }
            >
              🔎
            </Text>

            <Text
              style={
                styles.emptyTitle
              }
            >
              Nothing found yet
            </Text>

            <Text
              style={
                styles.emptyText
              }
            >
              Try another search or explore
              another category.
            </Text>

            <Pressable
              style={
                styles.emptyButton
              }
              onPress={() => {
                setSearchText('');
                setActiveCategory(
                  'All'
                );
                setActiveOccasion(
                  null
                );
              }}
            >
              <Text
                style={
                  styles.emptyButtonText
                }
              >
                Browse everything
              </Text>
            </Pressable>
          </View>
        )}

        {/* MADE NEAR YOU */}

        <View
          style={
            styles.nearbyBanner
          }
        >
          <View
            style={
              styles.nearbyIcon
            }
          >
            <Text
              style={
                styles.nearbyEmoji
              }
            >
              📍
            </Text>
          </View>

          <View
            style={
              styles.nearbyContent
            }
          >
            <Text
              style={
                styles.nearbySmall
              }
            >
              MADE NEAR YOU
            </Text>

            <Text
              style={
                styles.nearbyTitle
              }
            >
              Discover local makers
            </Text>

            <Text
              style={
                styles.nearbyDescription
              }
            >
              Support small home businesses
              around your city.
            </Text>
          </View>

          <Text
            style={
              styles.nearbyArrow
            }
          >
            →
          </Text>
        </View>

        {/* SHOP BY OCCASION */}

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
              Shop by occasion 🎁
            </Text>

            <Text
              style={
                styles.sectionSubtitle
              }
            >
              Find something special for every moment
            </Text>
          </View>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={
            false
          }
          contentContainerStyle={
            styles.occasionScroll
          }
        >
          {occasions.map(
            occasion => (
              <Pressable
                key={
                  occasion.title
                }
                style={[
                  styles.occasionCard,
                  {
                    backgroundColor:
                      occasion.color,
                  },
                  activeOccasion ===
                    occasion.title &&
                    styles.occasionSelected,
                ]}
                onPress={() =>
                  handleOccasion(
                    occasion.title
                  )
                }
              >
                <Text
                  style={
                    styles.occasionEmoji
                  }
                >
                  {
                    occasion.icon
                  }
                </Text>

                <Text
                  style={
                    styles.occasionTitle
                  }
                >
                  {
                    occasion.title
                  }
                </Text>

                <Text
                  style={
                    styles.occasionArrow
                  }
                >
                  →
                </Text>
              </Pressable>
            )
          )}
        </ScrollView>

        {/* MAKER STORIES */}

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
              Every creation has a story
            </Text>

            <Text
              style={
                styles.sectionSubtitle
              }
            >
              Meet the women behind the creations
            </Text>
          </View>

          <Text
            style={
              styles.seeAll
            }
          >
            Stories
          </Text>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={
            false
          }
          contentContainerStyle={
            styles.storyScroll
          }
        >
          {makerStories.map(
            story => (
              <Pressable
                key={
                  story.business
                }
                style={
                  styles.storyCard
                }
              >
                <View
                  style={
                    styles.storyImage
                  }
                >
                  <Image
                    source={{
                      uri: story.image,
                    }}
                    style={
                      styles.storyPhoto
                    }
                  />

                  <View
                    style={
                      styles.storyHeart
                    }
                  >
                    <Text>
                      ♡
                    </Text>
                  </View>
                </View>

                <View
                  style={
                    styles.storyContent
                  }
                >
                  <Text
                    style={
                      styles.storySmall
                    }
                  >
                    {story.category}
                  </Text>

                  <Text
                    style={
                      styles.storyBusiness
                    }
                  >
                    {story.business}
                  </Text>

                  <Text
                    style={
                      styles.storyText
                    }
                    numberOfLines={4}
                  >
                    {story.story}
                  </Text>

                  <View
                    style={
                      styles.readStory
                    }
                  >
                    <Text
                      style={
                        styles.readStoryText
                      }
                    >
                      Read her story
                    </Text>

                    <Text
                      style={
                        styles.readStoryArrow
                      }
                    >
                      →
                    </Text>
                  </View>
                </View>
              </Pressable>
            )
          )}
        </ScrollView>

        {/* WHY SHOP HERE */}

        <View
          style={
            styles.whySection
          }
        >
          <Text
            style={
              styles.whyEyebrow
            }
          >
            WHY SHOP HERE
          </Text>

          <Text
            style={
              styles.whyTitle
            }
          >
            Your purchase means more.
          </Text>

          <Text
            style={
              styles.whyDescription
            }
          >
            Every order supports someone building
            something of their own from home.
          </Text>

          <View
            style={
              styles.whyGrid
            }
          >
            <View
              style={
                styles.whyCard
              }
            >
              <View
                style={
                  styles.whyIcon
                }
              >
                <Text>
                  🏡
                </Text>
              </View>

              <Text
                style={
                  styles.whyCardTitle
                }
              >
                Home businesses
              </Text>

              <Text
                style={
                  styles.whyCardText
                }
              >
                Discover products made
                by real home creators.
              </Text>
            </View>

            <View
              style={
                styles.whyCard
              }
            >
              <View
                style={
                  styles.whyIcon
                }
              >
                <Text>
                  💛
                </Text>
              </View>

              <Text
                style={
                  styles.whyCardTitle
                }
              >
                Made with care
              </Text>

              <Text
                style={
                  styles.whyCardText
                }
              >
                Unique products made
                with personal attention.
              </Text>
            </View>

            <View
              style={
                styles.whyCard
              }
            >
              <View
                style={
                  styles.whyIcon
                }
              >
                <Text>
                  🤝
                </Text>
              </View>

              <Text
                style={
                  styles.whyCardTitle
                }
              >
                Direct connection
              </Text>

              <Text
                style={
                  styles.whyCardText
                }
              >
                Shop directly from
                independent sellers.
              </Text>
            </View>

            <View
              style={
                styles.whyCard
              }
            >
              <View
                style={
                  styles.whyIcon
                }
              >
                <Text>
                  ✨
                </Text>
              </View>

              <Text
                style={
                  styles.whyCardTitle
                }
              >
                Something different
              </Text>

              <Text
                style={
                  styles.whyCardText
                }
              >
                Find things you won't
                see everywhere.
              </Text>
            </View>
          </View>
        </View>

        {/* FINAL FOOTER */}

        <View
          style={
            styles.footer
          }
        >
          <Text
            style={
              styles.footerEmoji
            }
          >
            ✨
          </Text>

          <Text
            style={
              styles.footerTitle
            }
          >
            Made at home.
          </Text>

          <Text
            style={
              styles.footerAccent
            }
          >
            Made with heart.
          </Text>

          <Text
            style={
              styles.footerText
            }
          >
            Discover, support and celebrate
            small home businesses.
          </Text>
        </View>
      </ScrollView>

      {/* BOTTOM NAVIGATION */}

      <View
        style={
          styles.bottomNav
        }
      >
        <Pressable
          style={
            styles.navItem
          }
          onPress={() =>
            router.push('/buyer')
          }
        >
          <Text
            style={
              styles.navIconActive
            }
          >
            ⌂
          </Text>

          <Text
            style={
              styles.navTextActive
            }
          >
            Home
          </Text>
        </Pressable>

        <Pressable
          style={
            styles.navItem
          }
          onPress={() => {
            setActiveCategory(
              'All'
            );

            setActiveOccasion(
              null
            );

            setSearchText('');
          }}
        >
          <Text
            style={
              styles.navIcon
            }
          >
            ◉
          </Text>

          <Text
            style={
              styles.navText
            }
          >
            Explore
          </Text>
        </Pressable>

        <Pressable
          style={
            styles.navItem
          }
          onPress={() =>
            Alert.alert(
              'Wishlist',
              wishlist.length
                ? `${wishlist.length} item${
                    wishlist.length >
                    1
                      ? 's'
                      : ''
                  } saved`
                : 'Your wishlist is empty.'
            )
          }
        >
          <Text
            style={
              styles.navIcon
            }
          >
            ♡
          </Text>

          <Text
            style={
              styles.navText
            }
          >
            Wishlist
          </Text>
        </Pressable>

        <Pressable
          style={
            styles.navItem
          }
          onPress={() =>
            router.push('/bag')
          }
        >
          <Text
            style={
              styles.navIcon
            }
          >
            🛍
          </Text>

          <Text
            style={
              styles.navText
            }
          >
            Bag
          </Text>
        </Pressable>

        <Pressable
          style={
            styles.navItem
          }
          onPress={() =>
            router.push(
              '/profile'
            )
          }
        >
          <Text
            style={
              styles.navIcon
            }
          >
            ○
          </Text>

          <Text
            style={
              styles.navText
            }
          >
            Account
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

  scrollContent: {
    paddingBottom: 110,
  },

  header: {
    paddingHorizontal: 20,
    paddingTop: 22,
    paddingBottom: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },

  headerGreeting: {
    color: '#A85E9D',
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 1.3,
    marginBottom: 7,
  },

  headerTitle: {
    color: '#54245F',
    fontSize: 25,
    fontWeight: '700',
    lineHeight: 29,
  },

  headerAccent: {
    color: '#F47C6C',
    fontSize: 25,
    fontWeight: '900',
    lineHeight: 29,
  },

  profileButton: {
    width: 43,
    height: 43,
    borderRadius: 22,
    backgroundColor: '#F4EEFF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E5D7EA',
  },

  profileEmoji: {
    fontSize: 20,
  },

  searchBox: {
    marginHorizontal: 18,
    height: 48,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    borderWidth: 1,
    borderColor: '#F0E6E9',
    marginBottom: 18,
  },

  searchIcon: {
    color: '#54245F',
    fontSize: 25,
    marginRight: 9,
  },

  searchInput: {
    flex: 1,
    color: '#29232D',
    fontSize: 13,
  },

  hero: {
    marginHorizontal: 18,
    marginTop: 2,
    minHeight: 245,
    borderRadius: 26,
    backgroundColor: '#F8EDE7',
    overflow: 'hidden',
    position: 'relative',
    flexDirection: 'row',
  },

  heroDecorOne: {
    position: 'absolute',
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: '#FFD76A',
    right: -55,
    top: -55,
    opacity: 0.65,
  },

  heroDecorTwo: {
    position: 'absolute',
    width: 95,
    height: 95,
    borderRadius: 48,
    backgroundColor: '#F47C6C',
    right: -28,
    bottom: -35,
    opacity: 0.35,
  },

  heroContent: {
    flex: 1,
    paddingHorizontal: 20,
    paddingVertical: 21,
    zIndex: 3,
  },

  heroTag: {
    alignSelf: 'flex-start',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 20,
    marginBottom: 12,
  },

  heroTagText: {
    color: '#A85E9D',
    fontSize: 7,
    fontWeight: '900',
    letterSpacing: 1,
  },

  heroTitle: {
    color: '#54245F',
    fontSize: 26,
    lineHeight: 30,
    fontWeight: '700',
  },

  heroTitleAccent: {
    color: '#F47C6C',
    fontSize: 26,
    lineHeight: 30,
    fontWeight: '900',
    marginBottom: 9,
  },

  heroDescription: {
    color: '#66566A',
    fontSize: 10,
    lineHeight: 16,
    maxWidth: 190,
    marginBottom: 15,
  },

  heroButton: {
    alignSelf: 'flex-start',
    backgroundColor: '#54245F',
    borderRadius: 13,
    paddingHorizontal: 13,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },

  heroButtonText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800',
  },

  heroArrow: {
    color: '#FFD76A',
    fontSize: 15,
    marginLeft: 7,
    fontWeight: '800',
  },

  heroVisual: {
    width: 105,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    zIndex: 2,
  },

  heroCircle: {
    width: 105,
    height: 105,
    borderRadius: 53,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 5,
    borderColor: '#FFD76A',
    position: 'relative',
  },

  heroVisualEmoji: {
    fontSize: 54,
  },

  heroMiniBadge: {
    position: 'absolute',
    right: -3,
    top: 3,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#F47C6C',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: '#FFFFFF',
  },

  heroMiniBadgeText: {
    fontSize: 13,
  },

  floatingCard: {
    position: 'absolute',
    bottom: 24,
    right: 3,
    backgroundColor: '#54245F',
    borderRadius: 13,
    paddingHorizontal: 9,
    paddingVertical: 7,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    transform: [
      {
        rotate: '4deg',
      },
    ],
  },

  floatingHeart: {
    color: '#FFD76A',
    fontSize: 18,
  },

  floatingSmall: {
    color: '#DCC9DF',
    fontSize: 6,
    fontWeight: '800',
    letterSpacing: 0.8,
  },

  floatingTitle: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1,
  },

  sectionHeader: {
    marginTop: 28,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    marginBottom: 15,
  },

  sectionTitle: {
    color: '#29232D',
    fontSize: 19,
    fontWeight: '800',
  },

  sectionSubtitle: {
    color: '#8B7A8E',
    fontSize: 10,
    marginTop: 4,
  },

  seeAll: {
    color: '#A85E9D',
    fontSize: 10,
    fontWeight: '800',
  },

  productCount: {
    color: '#A85E9D',
    fontSize: 9,
    fontWeight: '800',
  },

  categoryScroll: {
    paddingHorizontal: 18,
    gap: 13,
  },

  categoryItem: {
    width: 72,
    alignItems: 'center',
  },

  categoryIcon: {
    width: 62,
    height: 62,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 7,
  },

  categorySelected: {
    borderWidth: 2,
    borderColor: '#54245F',
  },

  categoryEmoji: {
    fontSize: 28,
  },

  categoryName: {
    color: '#4B404E',
    fontSize: 10,
    fontWeight: '700',
    textAlign: 'center',
  },

  activeFilter: {
    marginHorizontal: 18,
    marginTop: 17,
    paddingHorizontal: 13,
    paddingVertical: 9,
    borderRadius: 12,
    backgroundColor: '#F4EEFF',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  activeFilterText: {
    color: '#54245F',
    fontSize: 10,
    fontWeight: '700',
  },

  clearFilter: {
    color: '#F47C6C',
    fontSize: 9,
    fontWeight: '900',
  },

  productGrid: {
    paddingHorizontal: 18,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: 17,
  },

  productCard: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    borderRadius: 19,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#F0E5E8',
  },

  productImageWrapper: {
    height: 150,
    backgroundColor: '#F4EEFF',
    position: 'relative',
  },

  productImage: {
    width: '100%',
    height: '100%',
  },

  productPlaceholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },

  placeholderEmoji: {
    fontSize: 45,
  },

  wishlistButton: {
    position: 'absolute',
    right: 9,
    top: 9,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },

  wishlistText: {
    color: '#8F7B91',
    fontSize: 20,
  },

  wishlistActive: {
    color: '#F47C6C',
  },

  demoBadge: {
    position: 'absolute',
    left: 8,
    bottom: 8,
    paddingHorizontal: 7,
    paddingVertical: 4,
    borderRadius: 8,
    backgroundColor: '#54245F',
  },

  demoBadgeText: {
    color: '#FFFFFF',
    fontSize: 6,
    fontWeight: '900',
    letterSpacing: 0.5,
  },

  productInfo: {
    padding: 12,
  },

  productCategory: {
    color: '#A85E9D',
    fontSize: 8,
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: 0.7,
    marginBottom: 4,
  },

  productName: {
    color: '#29232D',
    fontSize: 13,
    fontWeight: '800',
    marginBottom: 4,
  },

  productMaker: {
    color: '#9A8D9C',
    fontSize: 9,
    marginBottom: 10,
  },

  productBottom: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  productPrice: {
    color: '#54245F',
    fontSize: 15,
    fontWeight: '900',
  },

  addButton: {
    width: 29,
    height: 29,
    borderRadius: 10,
    backgroundColor: '#54245F',
    alignItems: 'center',
    justifyContent: 'center',
  },

  addButtonText: {
    color: '#FFFFFF',
    fontSize: 20,
    lineHeight: 21,
    fontWeight: '500',
  },

  loadingBox: {
    marginHorizontal: 18,
    paddingVertical: 35,
    alignItems: 'center',
  },

  loadingText: {
    color: '#8B7A8E',
    fontSize: 11,
  },

  emptyBox: {
    marginHorizontal: 18,
    padding: 28,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#F0E5E8',
  },

  emptyEmoji: {
    fontSize: 32,
    marginBottom: 10,
  },

  emptyTitle: {
    color: '#54245F',
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 5,
  },

  emptyText: {
    color: '#8B7A8E',
    fontSize: 10,
    textAlign: 'center',
    marginBottom: 15,
  },

  emptyButton: {
    backgroundColor: '#54245F',
    paddingHorizontal: 15,
    paddingVertical: 9,
    borderRadius: 12,
  },

  emptyButtonText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800',
  },

  nearbyBanner: {
    marginHorizontal: 18,
    marginTop: 26,
    padding: 16,
    borderRadius: 20,
    backgroundColor: '#E9F3EF',
    flexDirection: 'row',
    alignItems: 'center',
  },

  nearbyIcon: {
    width: 48,
    height: 48,
    borderRadius: 17,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 13,
  },

  nearbyEmoji: {
    fontSize: 23,
  },

  nearbyContent: {
    flex: 1,
  },

  nearbySmall: {
    color: '#5D8C7C',
    fontSize: 7,
    fontWeight: '900',
    letterSpacing: 1,
    marginBottom: 3,
  },

  nearbyTitle: {
    color: '#29232D',
    fontSize: 14,
    fontWeight: '800',
  },

  nearbyDescription: {
    color: '#746B73',
    fontSize: 9,
    marginTop: 3,
  },

  nearbyArrow: {
    color: '#54245F',
    fontSize: 21,
    fontWeight: '800',
  },

  occasionScroll: {
    paddingHorizontal: 18,
    gap: 12,
  },

  occasionCard: {
    width: 145,
    height: 125,
    borderRadius: 20,
    padding: 16,
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: 'transparent',
  },

  occasionSelected: {
    borderColor: '#54245F',
    borderWidth: 2,
  },

  occasionEmoji: {
    fontSize: 28,
  },

  occasionTitle: {
    color: '#29232D',
    fontSize: 13,
    fontWeight: '800',
  },

  occasionArrow: {
    color: '#54245F',
    fontSize: 16,
    fontWeight: '900',
    position: 'absolute',
    right: 14,
    bottom: 13,
  },

  /* STORIES */

  storyScroll: {
    paddingHorizontal: 18,
    gap: 14,
  },

  storyCard: {
    width: 255,
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#F0E5E8',
  },

  storyImage: {
    height: 145,
    position: 'relative',
    overflow: 'hidden',
  },

  storyPhoto: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },

  storyHeart: {
    position: 'absolute',
    right: 12,
    top: 12,
    width: 31,
    height: 31,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },

  storyContent: {
    padding: 14,
  },

  storySmall: {
    color: '#A85E9D',
    fontSize: 7,
    fontWeight: '900',
    letterSpacing: 0.8,
    marginBottom: 5,
  },

  storyBusiness: {
    color: '#54245F',
    fontSize: 15,
    fontWeight: '800',
    marginBottom: 6,
  },

  storyText: {
    color: '#776978',
    fontSize: 9,
    lineHeight: 14,
    minHeight: 50,
  },

  readStory: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
  },

  readStoryText: {
    color: '#F47C6C',
    fontSize: 9,
    fontWeight: '900',
  },

  readStoryArrow: {
    color: '#F47C6C',
    fontSize: 13,
    marginLeft: 5,
    fontWeight: '900',
  },

  whySection: {
    marginHorizontal: 18,
    marginTop: 30,
    padding: 20,
    borderRadius: 25,
    backgroundColor: '#54245F',
  },

  whyEyebrow: {
    color: '#FFD76A',
    fontSize: 8,
    fontWeight: '900',
    letterSpacing: 1.3,
    marginBottom: 7,
  },

  whyTitle: {
    color: '#FFFFFF',
    fontSize: 21,
    fontWeight: '800',
    marginBottom: 7,
  },

  whyDescription: {
    color: '#E2D4E5',
    fontSize: 10,
    lineHeight: 15,
    marginBottom: 17,
  },

  whyGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: 10,
  },

  whyCard: {
    width: '48%',
    backgroundColor: '#684173',
    borderRadius: 15,
    padding: 12,
  },

  whyIcon: {
    width: 32,
    height: 32,
    borderRadius: 11,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 9,
  },

  whyCardTitle: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
    marginBottom: 4,
  },

  whyCardText: {
    color: '#DCC9DF',
    fontSize: 8,
    lineHeight: 12,
  },

  footer: {
    marginTop: 35,
    paddingHorizontal: 25,
    alignItems: 'center',
    paddingBottom: 15,
  },

  footerEmoji: {
    fontSize: 30,
    marginBottom: 8,
  },

  footerTitle: {
    color: '#54245F',
    fontSize: 20,
    fontWeight: '700',
  },

  footerAccent: {
    color: '#F47C6C',
    fontSize: 20,
    fontWeight: '900',
    marginBottom: 7,
  },

  footerText: {
    color: '#8B7A8E',
    fontSize: 10,
    textAlign: 'center',
  },

  bottomNav: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 76,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#F0E6E9',
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingBottom: 7,
  },

  navItem: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 65,
  },

  navIcon: {
    fontSize: 19,
    color: '#9A8D9C',
    marginBottom: 4,
  },

  navIconActive: {
    fontSize: 19,
    color: '#54245F',
    marginBottom: 4,
  },

  navText: {
    color: '#9A8D9C',
    fontSize: 8,
    fontWeight: '600',
  },

  navTextActive: {
    color: '#54245F',
    fontSize: 8,
    fontWeight: '900',
  },
});