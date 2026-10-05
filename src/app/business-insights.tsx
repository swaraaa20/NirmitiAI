import React, { useEffect, useState } from 'react';

import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';

import { supabase } from '../services/supabase';
import { useLanguage } from '../context/LanguageContext';

type Period = '30 Days' | '3 Months' | '1 Year';

type TopProduct = {
  product_id: string;
  product_name: string;
  quantity: number;
  revenue: number;
  image_url: string | null;
};

type CategoryData = {
  name: string;
  revenue: number;
  percentage: number;
};

type ChartData = {
  label: string;
  value: number;
};

function StatCard({
  title,
  value,
  change,
}: {
  title: string;
  value: string;
  change: string;
}) {
  return (
    <View style={styles.statCard}>
      <Text style={styles.statTitle}>
        {title}
      </Text>

      <Text style={styles.statValue}>
        {value}
      </Text>

      <Text style={styles.statChange}>
        {change}
      </Text>
    </View>
  );
}

export default function BusinessInsights() {
  const { t } = useLanguage();

  const [selectedPeriod, setSelectedPeriod] =
    useState<Period>('30 Days');

  const [totalSales, setTotalSales] =
    useState(0);

  const [totalOrders, setTotalOrders] =
    useState(0);

  const [productsSold, setProductsSold] =
    useState(0);

  const [averageOrder, setAverageOrder] =
    useState(0);

  const [topProducts, setTopProducts] =
    useState<TopProduct[]>([]);

  const [categoryData, setCategoryData] =
    useState<CategoryData[]>([]);

  const [chartData, setChartData] =
    useState<ChartData[]>([]);

  const [loading, setLoading] =
    useState(false);

  useEffect(() => {
    fetchAnalytics();
  }, [selectedPeriod]);

  const getStartDate = () => {
    const date = new Date();

    if (selectedPeriod === '30 Days') {
      date.setDate(date.getDate() - 30);
    }

    if (selectedPeriod === '3 Months') {
      date.setMonth(date.getMonth() - 3);
    }

    if (selectedPeriod === '1 Year') {
      date.setFullYear(date.getFullYear() - 1);
    }

    return date;
  };

  const fetchAnalytics = async () => {
    try {
      setLoading(true);

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        return;
      }

      const startDate = getStartDate();

      const {
        data: orderItems,
        error: orderItemsError,
      } = await supabase
        .from('order_items')
        .select(`
          id,
          order_id,
          product_id,
          quantity,
          price,
          created_at
        `)
        .eq('seller_id', user.id)
        .gte(
          'created_at',
          startDate.toISOString()
        )
        .order('created_at', {
          ascending: true,
        });

      if (orderItemsError) {
        console.log(
          'ANALYTICS ERROR:',
          orderItemsError
        );
        return;
      }

      const items = orderItems || [];

      calculateStats(items);
      await calculateTopProducts(items);
      await calculateCategories(items);
      calculateChart(items);
    } catch (error) {
      console.log(
        'ANALYTICS ERROR:',
        error
      );
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (
    items: any[]
  ) => {
    const sales = items.reduce(
      (sum, item) =>
        sum +
        Number(item.price) *
          Number(item.quantity),
      0
    );

    const orders = new Set(
      items.map(item => item.order_id)
    ).size;

    const sold = items.reduce(
      (sum, item) =>
        sum + Number(item.quantity),
      0
    );

    const avgOrder =
      orders > 0
        ? sales / orders
        : 0;

    setTotalSales(sales);
    setTotalOrders(orders);
    setProductsSold(sold);
    setAverageOrder(avgOrder);
  };

  const calculateTopProducts = async (
    items: any[]
  ) => {
    if (items.length === 0) {
      setTopProducts([]);
      return;
    }

    const productIds = [
      ...new Set(
        items.map(
          item => item.product_id
        )
      ),
    ];

    const {
      data: productData,
      error: productError,
    } = await supabase
      .from('products')
      .select(
        'id, product_name, image_url'
      )
      .in('id', productIds);

    if (productError) {
      console.log(
        'TOP PRODUCTS ERROR:',
        productError
      );
      return;
    }

    const productMap = new Map(
      (productData || []).map(
        product => [
          product.id,
          product,
        ]
      )
    );

    const groupedProducts =
      new Map();

    items.forEach(item => {
      const existing =
        groupedProducts.get(
          item.product_id
        );

      const quantity =
        Number(item.quantity);

      const revenue =
        Number(item.price) *
        quantity;

      if (existing) {
        existing.quantity += quantity;
        existing.revenue += revenue;
      } else {
        groupedProducts.set(
          item.product_id,
          {
            product_id:
              item.product_id,
            quantity,
            revenue,
          }
        );
      }
    });

    const result =
      Array.from(
        groupedProducts.values()
      )
        .map(product => {
          const details =
            productMap.get(
              product.product_id
            );

          return {
            product_id:
              product.product_id,

            product_name:
              details?.product_name ||
              'Unknown Product',

            quantity:
              product.quantity,

            revenue:
              product.revenue,

            image_url:
              details?.image_url ||
              null,
          };
        })
        .sort(
          (a, b) =>
            b.revenue - a.revenue
        )
        .slice(0, 4);

    setTopProducts(result);
  };

  const calculateCategories = async (
    items: any[]
  ) => {
    if (items.length === 0) {
      setCategoryData([]);
      return;
    }

    const productIds = [
      ...new Set(
        items.map(
          item => item.product_id
        )
      ),
    ];

    const {
      data: productData,
      error: productError,
    } = await supabase
      .from('products')
      .select('id, category')
      .in('id', productIds);

    if (productError) {
      console.log(
        'CATEGORY ERROR:',
        productError
      );
      return;
    }

    const productMap = new Map(
      (productData || []).map(
        product => [
          product.id,
          product.category ||
            'Other',
        ]
      )
    );

    const categoryRevenue =
      new Map<string, number>();

    items.forEach(item => {
      const category =
        productMap.get(
          item.product_id
        ) || 'Other';

      const revenue =
        Number(item.price) *
        Number(item.quantity);

      categoryRevenue.set(
        category,
        (categoryRevenue.get(
          category
        ) || 0) + revenue
      );
    });

    const totalRevenue =
      Array.from(
        categoryRevenue.values()
      ).reduce(
        (sum, value) =>
          sum + value,
        0
      );

    const result =
      Array.from(
        categoryRevenue.entries()
      )
        .map(
          ([name, revenue]) => ({
            name,
            revenue,
            percentage:
              totalRevenue > 0
                ? Math.round(
                    (revenue /
                      totalRevenue) *
                      100
                  )
                : 0,
          })
        )
        .sort(
          (a, b) =>
            b.revenue - a.revenue
        );

    setCategoryData(result);
  };

  const calculateChart = (
    items: any[]
  ) => {
    if (items.length === 0) {
      setChartData([]);
      return;
    }

    const grouped =
      new Map<string, number>();

    items.forEach(item => {
      const date = new Date(
        item.created_at
      );

      let key = '';

      if (
        selectedPeriod ===
        '30 Days'
      ) {
        key = date
          .toISOString()
          .split('T')[0];
      }

      if (
        selectedPeriod ===
        '3 Months'
      ) {
        const weekStart =
          new Date(date);

        const day =
          weekStart.getDay();

        weekStart.setDate(
          weekStart.getDate() -
            day
        );

        key = weekStart
          .toISOString()
          .split('T')[0];
      }

      if (
        selectedPeriod ===
        '1 Year'
      ) {
        key = `${date.getFullYear()}-${String(
          date.getMonth() + 1
        ).padStart(2, '0')}`;
      }

      const revenue =
        Number(item.price) *
        Number(item.quantity);

      grouped.set(
        key,
        (grouped.get(key) || 0) +
          revenue
      );
    });

    let result: ChartData[] =
      Array.from(
        grouped.entries()
      ).map(
        ([key, value]) => ({
          label:
            formatChartLabel(
              key,
              selectedPeriod
            ),
          value,
        })
      );

    if (
      selectedPeriod ===
      '30 Days'
    ) {
      result = result.slice(-7);
    }

    if (
      selectedPeriod ===
      '3 Months'
    ) {
      result = result.slice(-12);
    }

    if (
      selectedPeriod ===
      '1 Year'
    ) {
      result = result.slice(-12);
    }

    setChartData(result);
  };

  const formatChartLabel = (
    key: string,
    period: Period
  ) => {
    if (period === '1 Year') {
      const [
        year,
        month,
      ] = key.split('-');

      const date = new Date(
        Number(year),
        Number(month) - 1,
        1
      );

      return date.toLocaleString(
        'en-IN',
        {
          month: 'short',
        }
      );
    }

    const date = new Date(
      `${key}T00:00:00`
    );

    if (
      period === '3 Months'
    ) {
      return date.toLocaleDateString(
        'en-IN',
        {
          day: 'numeric',
          month: 'short',
        }
      );
    }

    return date.toLocaleDateString(
      'en-IN',
      {
        weekday: 'short',
      }
    );
  };

  const maxChartValue =
    chartData.length > 0
      ? Math.max(
          ...chartData.map(
            item => item.value
          )
        )
      : 0;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={
        styles.contentContainer
      }
      showsVerticalScrollIndicator={
        false
      }
    >
      <View style={styles.header}>
        <Text style={styles.headerSmall}>
          {t.businessYourBusiness}
        </Text>

        <Text style={styles.headerTitle}>
          {t.businessInsights}
        </Text>

        <Text
          style={styles.headerSubtitle}
        >
          {t.businessInsightsSubtitle}
        </Text>
      </View>

      <View
        style={styles.periodContainer}
      >
        {(
          [
            '30 Days',
            '3 Months',
            '1 Year',
          ] as Period[]
        ).map(period => (
          <TouchableOpacity
            key={period}
            style={[
              styles.periodButton,
              selectedPeriod ===
                period &&
                styles.activePeriod,
            ]}
            onPress={() =>
              setSelectedPeriod(
                period
              )
            }
          >
            <Text
              style={[
                styles.periodText,
                selectedPeriod ===
                  period &&
                  styles.activePeriodText,
              ]}
            >
              {period === '30 Days'
                ? t.business30Days
                : period ===
                  '3 Months'
                ? t.business3Months
                : t.business1Year}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {loading && (
        <Text
          style={styles.loadingText}
        >
          {t.businessUpdating}
        </Text>
      )}

      <View style={styles.statsGrid}>
        <StatCard
          title={t.businessTotalSales}
          value={`₹${Math.round(
            totalSales
          ).toLocaleString(
            'en-IN'
          )}`}
          change={t.businessLive}
        />

        <StatCard
          title={t.businessOrders}
          value={totalOrders.toString()}
          change={t.businessLive}
        />

        <StatCard
          title={t.businessProductsSold}
          value={productsSold.toString()}
          change={t.businessLive}
        />

        <StatCard
          title={t.businessAvgOrder}
          value={`₹${Math.round(
            averageOrder
          ).toLocaleString(
            'en-IN'
          )}`}
          change={t.businessLive}
        />
      </View>

      <View style={styles.section}>
        <Text
          style={styles.sectionTitle}
        >
          {t.businessSalesOverview}
        </Text>

        <View style={styles.salesCard}>
          <View
            style={styles.salesHeader}
          >
            <View>
              <Text
                style={styles.salesAmount}
              >
                ₹
                {Math.round(
                  totalSales
                ).toLocaleString(
                  'en-IN'
                )}
              </Text>

              <Text
                style={styles.salesLabel}
              >
                {t.businessSalesIn}{' '}
                {selectedPeriod ===
                '30 Days'
                  ? t.business30Days
                  : selectedPeriod ===
                    '3 Months'
                  ? t.business3Months
                  : t.business1Year}
              </Text>
            </View>

            <View
              style={styles.liveBadge}
            >
              <Text
                style={
                  styles.liveBadgeText
                }
              >
                {t.businessLive}
              </Text>
            </View>
          </View>

          {chartData.length === 0 ? (
            <View
              style={
                styles.emptyChart
              }
            >
              <Text
                style={
                  styles.emptyText
                }
              >
                {t.businessNoSales}
              </Text>
            </View>
          ) : (
            <View style={styles.chart}>
              {chartData.map(
                (item, index) => {
                  const height =
                    maxChartValue >
                    0
                      ? (item.value /
                          maxChartValue) *
                        145
                      : 5;

                  return (
                    <View
                      key={`${item.label}-${index}`}
                      style={
                        styles.chartColumn
                      }
                    >
                      <View
                        style={[
                          styles.chartBar,
                          {
                            height:
                              Math.max(
                                height,
                                5
                              ),
                          },
                        ]}
                      />

                      <Text
                        style={
                          styles.chartLabel
                        }
                        numberOfLines={1}
                      >
                        {item.label}
                      </Text>
                    </View>
                  );
                }
              )}
            </View>
          )}
        </View>
      </View>

      <View style={styles.section}>
        <Text
          style={styles.sectionTitle}
        >
          {t.businessTopProducts}
        </Text>

        <View
          style={styles.productsCard}
        >
          {topProducts.length ===
          0 ? (
            <Text
              style={styles.emptyText}
            >
              {t.businessNoSales}
            </Text>
          ) : (
            topProducts.map(
              (product, index) => (
                <View
                  key={
                    product.product_id
                  }
                  style={
                    styles.productRow
                  }
                >
                  <View
                    style={
                      styles.productRank
                    }
                  >
                    <Text
                      style={
                        styles.productRankText
                      }
                    >
                      {index + 1}
                    </Text>
                  </View>

                  <View
                    style={
                      styles.productInfo
                    }
                  >
                    <Text
                      style={
                        styles.productName
                      }
                      numberOfLines={1}
                    >
                      {
                        product.product_name
                      }
                    </Text>

                    <Text
                      style={
                        styles.productOrders
                      }
                    >
                      {
                        product.quantity
                      }{' '}
                      {t.businessSold}
                    </Text>
                  </View>

                  <Text
                    style={
                      styles.productRevenue
                    }
                  >
                    ₹
                    {Math.round(
                      product.revenue
                    ).toLocaleString(
                      'en-IN'
                    )}
                  </Text>
                </View>
              )
            )
          )}
        </View>
      </View>

      <View style={styles.section}>
        <Text
          style={styles.sectionTitle}
        >
          {t.businessAIInsights}
        </Text>

        <View style={styles.aiCard}>
          <View style={styles.aiIcon}>
            <Text
              style={styles.aiIconText}
            >
              ✨
            </Text>
          </View>

          <View
            style={styles.aiContent}
          >
            <Text
              style={styles.aiTitle}
            >
              {t.businessActivity}
            </Text>

            <Text
              style={styles.aiText}
            >
              {t.businessReceived}{' '}
              {totalOrders}{' '}
              {totalOrders !== 1
                ? t.businessOrdersPlural
                : t.businessOrder}{' '}
              {t.businessAndSold}{' '}
              {productsSold}{' '}
              {productsSold !== 1
                ? t.businessItems
                : t.businessItem}{' '}
              {t.businessDuring}
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <Text
          style={styles.sectionTitle}
        >
          {t.businessPerformance}
        </Text>

        <View
          style={
            styles.performanceCard
          }
        >
          {topProducts.length ===
          0 ? (
            <Text
              style={styles.emptyText}
            >
              {
                t.businessPerformanceEmpty
              }
            </Text>
          ) : (
            topProducts.map(
              product => (
                <View
                  key={
                    product.product_id
                  }
                  style={
                    styles.performanceRow
                  }
                >
                  <View
                    style={
                      styles.performanceInfo
                    }
                  >
                    <Text
                      style={
                        styles.performanceName
                      }
                      numberOfLines={1}
                    >
                      {
                        product.product_name
                      }
                    </Text>

                    <Text
                      style={
                        styles.performanceSold
                      }
                    >
                      {
                        product.quantity
                      }{' '}
                      {t.businessSold}
                    </Text>
                  </View>

                  <Text
                    style={
                      styles.performanceRevenue
                    }
                  >
                    ₹
                    {Math.round(
                      product.revenue
                    ).toLocaleString(
                      'en-IN'
                    )}
                  </Text>
                </View>
              )
            )
          )}
        </View>
      </View>

      <View style={styles.section}>
        <Text
          style={styles.sectionTitle}
        >
          {t.businessCustomers}
        </Text>

        <View
          style={styles.customerGrid}
        >
          <View
            style={styles.customerCard}
          >
            <Text
              style={
                styles.customerNumber
              }
            >
              {totalOrders}
            </Text>

            <Text
              style={
                styles.customerLabel
              }
            >
              {t.businessOrders}
            </Text>
          </View>

          <View
            style={styles.customerCard}
          >
            <Text
              style={
                styles.customerNumber
              }
            >
              {productsSold}
            </Text>

            <Text
              style={
                styles.customerLabel
              }
            >
              {t.businessItemsSold}
            </Text>
          </View>

          <View
            style={styles.customerCard}
          >
            <Text
              style={
                styles.customerNumber
              }
            >
              ₹
              {Math.round(
                averageOrder
              ).toLocaleString(
                'en-IN'
              )}
            </Text>

            <Text
              style={
                styles.customerLabel
              }
            >
              {t.businessAvgOrder}
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <Text
          style={styles.sectionTitle}
        >
          {t.businessSalesByCategory}
        </Text>

        <View
          style={styles.categoryCard}
        >
          {categoryData.length ===
          0 ? (
            <Text
              style={styles.emptyText}
            >
              {
                t.businessNoCategorySales
              }
            </Text>
          ) : (
            categoryData.map(
              category => (
                <View
                  key={category.name}
                  style={
                    styles.categoryRow
                  }
                >
                  <View
                    style={
                      styles.categoryLeft
                    }
                  >
                    <View
                      style={
                        styles.categoryDot
                      }
                    />

                    <Text
                      style={
                        styles.categoryName
                      }
                    >
                      {category.name}
                    </Text>
                  </View>

                  <View
                    style={
                      styles.categoryRight
                    }
                  >
                    <Text
                      style={
                        styles.categoryRevenue
                      }
                    >
                      ₹
                      {Math.round(
                        category.revenue
                      ).toLocaleString(
                        'en-IN'
                      )}
                    </Text>

                    <Text
                      style={
                        styles.categoryPercentage
                      }
                    >
                      {
                        category.percentage
                      }
                      %
                    </Text>
                  </View>
                </View>
              )
            )
          )}
        </View>
      </View>

      <View style={styles.focusCard}>
        <View style={styles.focusIcon}>
          <Text
            style={styles.focusIconText}
          >
            💡
          </Text>
        </View>

        <View
          style={styles.focusContent}
        >
          <Text
            style={styles.focusTitle}
          >
            {t.businessFocus}
          </Text>

          <Text
            style={styles.focusText}
          >
            {t.businessFocusText}
          </Text>
        </View>
      </View>

      <View
        style={styles.bottomSpace}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF9F5',
  },

  contentContainer: {
    padding: 20,
  },

  header: {
    marginBottom: 22,
  },

  headerSmall: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1.5,
    color: '#8B5E83',
    marginBottom: 5,
  },

  headerTitle: {
    fontSize: 30,
    fontWeight: '800',
    color: '#292329',
    marginBottom: 6,
  },

  headerSubtitle: {
    fontSize: 14,
    lineHeight: 21,
    color: '#766A72',
  },

  periodContainer: {
    flexDirection: 'row',
    backgroundColor: '#F4EEEB',
    borderRadius: 14,
    padding: 4,
    marginBottom: 12,
  },

  periodButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 11,
  },

  activePeriod: {
    backgroundColor: '#8B5E83',
  },

  periodText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#766A72',
  },

  activePeriodText: {
    color: '#FFFFFF',
  },

  loadingText: {
    fontSize: 12,
    color: '#8B5E83',
    textAlign: 'center',
    marginBottom: 12,
  },

  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 25,
  },

  statCard: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#EADDD3',
  },

  statTitle: {
    fontSize: 12,
    color: '#8A7A72',
    marginBottom: 7,
  },

  statValue: {
    fontSize: 22,
    fontWeight: '800',
    color: '#292329',
    marginBottom: 5,
  },

  statChange: {
    fontSize: 11,
    fontWeight: '700',
    color: '#6E9B65',
  },

  section: {
    marginBottom: 25,
  },

  sectionTitle: {
    fontSize: 19,
    fontWeight: '800',
    color: '#292329',
    marginBottom: 12,
  },

  salesCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: '#EADDD3',
  },

  salesHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },

  salesAmount: {
    fontSize: 25,
    fontWeight: '800',
    color: '#292329',
  },

  salesLabel: {
    fontSize: 12,
    color: '#8A7A72',
    marginTop: 3,
  },

  liveBadge: {
    backgroundColor: '#EEF6EB',
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 10,
  },

  liveBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#6E9B65',
  },

  chart: {
    height: 190,
    marginTop: 20,
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
  },

  chartColumn: {
    flex: 1,
    height: '100%',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginHorizontal: 2,
  },

  chartBar: {
    width: 18,
    maxHeight: 145,
    backgroundColor: '#8B5E83',
    borderRadius: 8,
    marginBottom: 8,
  },

  chartLabel: {
    fontSize: 9,
    color: '#8A7A72',
    maxWidth: 48,
    textAlign: 'center',
  },

  emptyChart: {
    height: 170,
    justifyContent: 'center',
    alignItems: 'center',
  },

  productsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: '#EADDD3',
  },

  productRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 13,
    borderBottomWidth: 1,
    borderBottomColor: '#F2EAE5',
  },

  productRank: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F4EEFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },

  productRankText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#8B5E83',
  },

  productInfo: {
    flex: 1,
    marginRight: 10,
  },

  productName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#292329',
    marginBottom: 3,
  },

  productOrders: {
    fontSize: 11,
    color: '#8A7A72',
  },

  productRevenue: {
    fontSize: 14,
    fontWeight: '800',
    color: '#292329',
  },

  emptyText: {
    fontSize: 14,
    color: '#8A7A72',
    lineHeight: 21,
    paddingVertical: 15,
  },

  aiCard: {
    backgroundColor: '#F4EEFF',
    borderRadius: 20,
    padding: 18,
    flexDirection: 'row',
  },

  aiIcon: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 13,
  },

  aiIconText: {
    fontSize: 21,
  },

  aiContent: {
    flex: 1,
  },

  aiTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#292329',
    marginBottom: 5,
  },

  aiText: {
    fontSize: 13,
    lineHeight: 20,
    color: '#6F626B',
  },

  performanceCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: '#EADDD3',
  },

  performanceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 13,
    borderBottomWidth: 1,
    borderBottomColor: '#F2EAE5',
  },

  performanceInfo: {
    flex: 1,
  },

  performanceName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#292329',
    marginBottom: 3,
  },

  performanceSold: {
    fontSize: 11,
    color: '#8A7A72',
  },

  performanceRevenue: {
    fontSize: 14,
    fontWeight: '800',
    color: '#292329',
  },

  customerGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },

  customerCard: {
    width: '31.5%',
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 15,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#EADDD3',
  },

  customerNumber: {
    fontSize: 18,
    fontWeight: '800',
    color: '#292329',
    marginBottom: 5,
  },

  customerLabel: {
    fontSize: 10,
    color: '#8A7A72',
    textAlign: 'center',
  },

  categoryCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 17,
    borderWidth: 1,
    borderColor: '#EADDD3',
  },

  categoryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 11,
  },

  categoryLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },

  categoryDot: {
    width: 9,
    height: 9,
    borderRadius: 5,
    backgroundColor: '#8B5E83',
    marginRight: 9,
  },

  categoryName: {
    fontSize: 13,
    fontWeight: '600',
    color: '#292329',
  },

  categoryRight: {
    alignItems: 'flex-end',
  },

  categoryRevenue: {
    fontSize: 12,
    fontWeight: '700',
    color: '#292329',
    marginBottom: 2,
  },

  categoryPercentage: {
    fontSize: 12,
    fontWeight: '700',
    color: '#8B5E83',
  },

  focusCard: {
    backgroundColor: '#FFF4DF',
    borderRadius: 20,
    padding: 18,
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: '#F2DEC0',
  },

  focusIcon: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 13,
  },

  focusIconText: {
    fontSize: 21,
  },

  focusContent: {
    flex: 1,
  },

  focusTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#292329',
    marginBottom: 5,
  },

  focusText: {
    fontSize: 13,
    lineHeight: 20,
    color: '#6F626B',
  },

  bottomSpace: {
    height: 30,
  },
});