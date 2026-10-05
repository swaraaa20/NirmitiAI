import React, { useMemo, useState } from 'react';

import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
} from 'react-native';

import { useLanguage } from '../context/LanguageContext';

type BusinessType =
  | 'Food'
  | 'Clothing'
  | 'Crochet'
  | 'Art'
  | 'Jewellery'
  | 'Home Decor'
  | 'Traditional Craft'
  | 'Other';

type FundingRange =
  | 'Under ₹50,000'
  | '₹50,000 – ₹5 lakh'
  | '₹5 – ₹10 lakh'
  | '₹10 – ₹20 lakh'
  | 'Above ₹20 lakh';

type BusinessStage =
  | 'Just starting'
  | 'Already selling'
  | 'Expanding';

type Scheme = {
  id: string;
  name: string;
  shortDescription: string;
  support: string;
  suitableFor: string;
  badge?: string;
  url: string;
};

const schemes: Scheme[] = [
  {
    id: 'mudra',
    name: 'PM MUDRA Yojana',
    shortDescription:
      'Collateral-free credit support for eligible micro enterprises.',
    support:
      'Shishu, Kishore, Tarun and eligible Tarun Plus loan categories.',
    suitableFor:
      'Small businesses, home-based businesses and micro enterprises.',
    badge: 'Micro Business Loan',
    url: 'https://financialservices.gov.in/pradhan-mantri-mudra-yojana-pmmy',
  },
  {
    id: 'pmegp',
    name: 'PMEGP',
    shortDescription:
      'Credit-linked subsidy support for setting up eligible new micro enterprises.',
    support:
      'For new enterprises, with different subsidy rates depending on category and location.',
    suitableFor:
      'People starting a new non-farm micro enterprise.',
    badge: 'Subsidy + Loan',
    url: 'https://www.msme.gov.in/offerings/schemes-and-services/details/prime-minister-employment-generation-programme-and-other-credit-support-schemes-1-MDMzETMtQWa',
  },
  {
    id: 'pmfme',
    name: 'PMFME',
    shortDescription:
      'Financial and training support for eligible micro food-processing units.',
    support:
      'Credit-linked capital subsidy of 35% of eligible project cost, subject to the scheme ceiling.',
    suitableFor:
      'Eligible homemade food and food-processing businesses.',
    badge: 'Food Businesses',
    url: 'https://www.mofpi.gov.in/pmfme/shgs-fpos-co-operatives-individual-micro-food-enterprise',
  },
  {
    id: 'vishwakarma',
    name: 'PM Vishwakarma',
    shortDescription:
      'Central support for eligible traditional artisans and craftspeople.',
    support:
      'Credit support, skill training, toolkit incentive, digital transaction incentives and marketing support.',
    suitableFor:
      'Eligible artisans working in one of the 18 covered traditional trades.',
    badge: 'Traditional Crafts',
    url: 'https://pmvishwakarma.gov.in/',
  },
];

const businessTypes: BusinessType[] = [
  'Food',
  'Clothing',
  'Crochet',
  'Art',
  'Jewellery',
  'Home Decor',
  'Traditional Craft',
  'Other',
];

const fundingRanges: FundingRange[] = [
  'Under ₹50,000',
  '₹50,000 – ₹5 lakh',
  '₹5 – ₹10 lakh',
  '₹10 – ₹20 lakh',
  'Above ₹20 lakh',
];

const businessStages: BusinessStage[] = [
  'Just starting',
  'Already selling',
  'Expanding',
];

export default function LoansSchemes() {
  const { t } = useLanguage();

  const [businessType, setBusinessType] =
    useState<BusinessType | null>(null);

  const [fundingRange, setFundingRange] =
    useState<FundingRange | null>(null);

  const [businessStage, setBusinessStage] =
    useState<BusinessStage | null>(null);

  const [showResults, setShowResults] =
    useState(false);

  const recommendedSchemes = useMemo(() => {
    if (
      !businessType ||
      !fundingRange ||
      !businessStage
    ) {
      return [];
    }

    const result: Scheme[] = [];

    if (businessType === 'Food') {
      result.push(
        schemes.find(
          scheme => scheme.id === 'pmfme'
        )!
      );
    }

    if (
      businessType === 'Crochet' ||
      businessType === 'Traditional Craft'
    ) {
      result.push(
        schemes.find(
          scheme =>
            scheme.id === 'vishwakarma'
        )!
      );
    }

    if (
      businessStage === 'Just starting' ||
      businessStage === 'Expanding'
    ) {
      result.push(
        schemes.find(
          scheme => scheme.id === 'pmegp'
        )!
      );
    }

    result.push(
      schemes.find(
        scheme => scheme.id === 'mudra'
      )!
    );

    if (
      fundingRange === '₹10 – ₹20 lakh' ||
      fundingRange === 'Above ₹20 lakh'
    ) {
      const pmegp = schemes.find(
        scheme => scheme.id === 'pmegp'
      )!;

      if (
        !result.some(
          scheme => scheme.id === pmegp.id
        )
      ) {
        result.push(pmegp);
      }
    }

    return result.filter(
      (scheme, index, self) =>
        index ===
        self.findIndex(
          item => item.id === scheme.id
        )
    );
  }, [
    businessType,
    fundingRange,
    businessStage,
  ]);

  const getBusinessTypeLabel = (
    type: BusinessType
  ) => {
    const labels: Record<
      BusinessType,
      string
    > = {
      Food: t.loansFood,
      Clothing: t.loansClothing,
      Crochet: t.loansCrochet,
      Art: t.loansArt,
      Jewellery: t.loansJewellery,
      'Home Decor': t.loansHomeDecor,
      'Traditional Craft':
        t.loansTraditionalCraft,
      Other: t.loansOther,
    };

    return labels[type];
  };

  const getFundingLabel = (
    range: FundingRange
  ) => {
    const labels: Record<
      FundingRange,
      string
    > = {
      'Under ₹50,000':
        t.loansUnder50k,

      '₹50,000 – ₹5 lakh':
        t.loans50k5lakh,

      '₹5 – ₹10 lakh':
        t.loans5to10,

      '₹10 – ₹20 lakh':
        t.loans10to20,

      'Above ₹20 lakh':
        t.loansAbove20,
    };

    return labels[range];
  };

  const getBusinessStageLabel = (
    stage: BusinessStage
  ) => {
    const labels: Record<
      BusinessStage,
      string
    > = {
      'Just starting':
        t.loansStarting,

      'Already selling':
        t.loansSelling,

      Expanding:
        t.loansExpanding,
    };

    return labels[stage];
  };

  const getSchemeBadge = (
    scheme: Scheme
  ) => {
    if (scheme.id === 'mudra') {
      return t.loansMicroLoan;
    }

    if (scheme.id === 'pmegp') {
      return t.loansSubsidyLoan;
    }

    if (scheme.id === 'pmfme') {
      return t.loansFoodBusiness;
    }

    if (scheme.id === 'vishwakarma') {
      return t.loansTraditionalCrafts;
    }

    return scheme.badge;
  };

  const openScheme = async (
    url: string
  ) => {
    try {
      await Linking.openURL(url);
    } catch (error) {
      console.log(
        'Unable to open scheme link:',
        error
      );
    }
  };

  const resetForm = () => {
    setBusinessType(null);
    setFundingRange(null);
    setBusinessStage(null);
    setShowResults(false);
  };

  const canFindSchemes =
    !!businessType &&
    !!fundingRange &&
    !!businessStage;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <Text style={styles.heading}>
        {t.loansTitle}
      </Text>

      <Text style={styles.subtitle}>
        {t.loansSubtitle}
      </Text>

      <View style={styles.infoCard}>
        <Text style={styles.infoIcon}>
          🇮🇳
        </Text>

        <View style={styles.infoContent}>
          <Text style={styles.infoTitle}>
            {t.loansNationalTitle}
          </Text>

          <Text style={styles.infoText}>
            {t.loansNationalText}
          </Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>
          {t.loansQuestion1}
        </Text>

        <View style={styles.optionGrid}>
          {businessTypes.map(type => (
            <TouchableOpacity
              key={type}
              style={[
                styles.option,
                businessType === type &&
                  styles.selectedOption,
              ]}
              onPress={() =>
                setBusinessType(type)
              }
            >
              <Text
                style={[
                  styles.optionText,
                  businessType === type &&
                    styles.selectedOptionText,
                ]}
              >
                {getBusinessTypeLabel(type)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>
          {t.loansQuestion2}
        </Text>

        <View style={styles.verticalOptions}>
          {fundingRanges.map(range => (
            <TouchableOpacity
              key={range}
              style={[
                styles.fullOption,
                fundingRange === range &&
                  styles.selectedOption,
              ]}
              onPress={() =>
                setFundingRange(range)
              }
            >
              <Text
                style={[
                  styles.optionText,
                  fundingRange === range &&
                    styles.selectedOptionText,
                ]}
              >
                {getFundingLabel(range)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>
          {t.loansQuestion3}
        </Text>

        <View style={styles.verticalOptions}>
          {businessStages.map(stage => (
            <TouchableOpacity
              key={stage}
              style={[
                styles.fullOption,
                businessStage === stage &&
                  styles.selectedOption,
              ]}
              onPress={() =>
                setBusinessStage(stage)
              }
            >
              <Text
                style={[
                  styles.optionText,
                  businessStage === stage &&
                    styles.selectedOptionText,
                ]}
              >
                {getBusinessStageLabel(stage)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <TouchableOpacity
        style={[
          styles.findButton,
          !canFindSchemes &&
            styles.disabledButton,
        ]}
        disabled={!canFindSchemes}
        onPress={() =>
          setShowResults(true)
        }
      >
        <Text style={styles.findButtonText}>
          {t.loansFind}
        </Text>
      </TouchableOpacity>

      {showResults && (
        <>
          <View style={styles.resultsHeader}>
            <View style={styles.resultsHeaderText}>
              <Text style={styles.resultsTitle}>
                {t.loansRelevant}
              </Text>

              <Text
                style={styles.resultsSubtitle}
              >
                {t.loansBasedOn}
              </Text>
            </View>

            <TouchableOpacity
              onPress={resetForm}
            >
              <Text style={styles.resetText}>
                {t.loansReset}
              </Text>
            </TouchableOpacity>
          </View>

          {recommendedSchemes.map(
            scheme => (
              <View
                key={scheme.id}
                style={styles.schemeCard}
              >
                {scheme.badge && (
                  <View
                    style={styles.badge}
                  >
                    <Text
                      style={styles.badgeText}
                    >
                      {getSchemeBadge(
                        scheme
                      )}
                    </Text>
                  </View>
                )}

                <Text
                  style={styles.schemeName}
                >
                  {scheme.name}
                </Text>

                <Text
                  style={
                    styles.schemeDescription
                  }
                >
                  {scheme.shortDescription}
                </Text>

                <View
                  style={styles.detailBlock}
                >
                  <Text
                    style={styles.detailLabel}
                  >
                    {t.loansSupport}
                  </Text>

                  <Text
                    style={styles.detailText}
                  >
                    {scheme.support}
                  </Text>
                </View>

                <View
                  style={styles.detailBlock}
                >
                  <Text
                    style={styles.detailLabel}
                  >
                    {t.loansSuitableFor}
                  </Text>

                  <Text
                    style={styles.detailText}
                  >
                    {scheme.suitableFor}
                  </Text>
                </View>

                <TouchableOpacity
                  style={
                    styles.viewButton
                  }
                  onPress={() =>
                    openScheme(
                      scheme.url
                    )
                  }
                >
                  <Text
                    style={
                      styles.viewButtonText
                    }
                  >
                    {t.loansOfficial}
                  </Text>
                </TouchableOpacity>
              </View>
            )
          )}

          <View
            style={styles.disclaimer}
          >
            <Text
              style={
                styles.disclaimerTitle
              }
            >
              {t.loansImportant}
            </Text>

            <Text
              style={
                styles.disclaimerText
              }
            >
              {t.loansDisclaimer}
            </Text>
          </View>

          <View style={styles.womenCard}>
            <View
              style={
                styles.womenIconContainer
              }
            >
              <Text
                style={styles.womenIcon}
              >
                👩‍💼
              </Text>
            </View>

            <View
              style={styles.womenContent}
            >
              <Text
                style={styles.womenTitle}
              >
                {t.loansWomenTitle}
              </Text>

              <Text
                style={styles.womenText}
              >
                {t.loansWomenText}
              </Text>

              <TouchableOpacity
                onPress={() =>
                  openScheme(
                    'https://www.msme.gov.in/offerings/schemes-and-services/details/prime-minister-employment-generation-programme-and-other-credit-support-schemes-1-MDMzETMtQWa'
                  )
                }
              >
                <Text
                  style={styles.womenLink}
                >
                  {t.loansWomenLink}
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          <View
            style={styles.janSamarthCard}
          >
            <Text
              style={
                styles.janSamarthTitle
              }
            >
              {t.loansMoreTitle}
            </Text>

            <Text
              style={
                styles.janSamarthText
              }
            >
              {t.loansMoreText}
            </Text>

            <TouchableOpacity
              onPress={() =>
                openScheme(
                  'https://www.jansamarth.in/'
                )
              }
            >
              <Text
                style={
                  styles.janSamarthLink
                }
              >
                {t.loansMoreLink}
              </Text>
            </TouchableOpacity>
          </View>
        </>
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

  heading: {
    fontSize: 28,
    fontWeight: '800',
    color: '#292329',
    marginTop: 15,
    marginBottom: 6,
  },

  subtitle: {
    fontSize: 14,
    lineHeight: 21,
    color: '#766B70',
    marginBottom: 18,
  },

  infoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F4EEFF',
    borderRadius: 18,
    padding: 15,
    marginBottom: 25,
  },

  infoIcon: {
    fontSize: 27,
    marginRight: 12,
  },

  infoContent: {
    flex: 1,
  },

  infoTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#292329',
    marginBottom: 3,
  },

  infoText: {
    fontSize: 12,
    lineHeight: 18,
    color: '#6F626A',
  },

  section: {
    marginBottom: 25,
  },

  sectionTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#292329',
    marginBottom: 12,
  },

  optionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 9,
  },

  option: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E8DDD7',
    borderRadius: 13,
    paddingVertical: 11,
    paddingHorizontal: 14,
  },

  selectedOption: {
    backgroundColor: '#8B5E83',
    borderColor: '#8B5E83',
  },

  optionText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#5F555A',
  },

  selectedOptionText: {
    color: '#FFFFFF',
  },

  verticalOptions: {
    gap: 9,
  },

  fullOption: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E8DDD7',
    borderRadius: 13,
    paddingVertical: 14,
    paddingHorizontal: 15,
  },

  findButton: {
    backgroundColor: '#8B5E83',
    borderRadius: 15,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 30,
  },

  disabledButton: {
    backgroundColor: '#CFC5CC',
  },

  findButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
  },

  resultsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 15,
  },

  resultsHeaderText: {
    flex: 1,
    marginRight: 12,
  },

  resultsTitle: {
    fontSize: 21,
    fontWeight: '800',
    color: '#292329',
  },

  resultsSubtitle: {
    fontSize: 12,
    color: '#766B70',
    marginTop: 3,
  },

  resetText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#8B5E83',
  },

  schemeCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 18,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#EADDD3',
  },

  badge: {
    alignSelf: 'flex-start',
    backgroundColor: '#F4EEFF',
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 5,
    marginBottom: 10,
  },

  badgeText: {
    color: '#8B5E83',
    fontSize: 10,
    fontWeight: '800',
  },

  schemeName: {
    fontSize: 19,
    fontWeight: '800',
    color: '#292329',
    marginBottom: 6,
  },

  schemeDescription: {
    fontSize: 13,
    lineHeight: 19,
    color: '#655A60',
    marginBottom: 15,
  },

  detailBlock: {
    marginBottom: 12,
  },

  detailLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: '#8B5E83',
    textTransform: 'uppercase',
    marginBottom: 3,
  },

  detailText: {
    fontSize: 12,
    lineHeight: 18,
    color: '#5F555A',
  },

  viewButton: {
    backgroundColor: '#FFF1E8',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 5,
  },

  viewButtonText: {
    color: '#8B5E83',
    fontSize: 13,
    fontWeight: '800',
  },

  disclaimer: {
    backgroundColor: '#FFF7E8',
    borderRadius: 16,
    padding: 15,
    marginTop: 5,
    marginBottom: 15,
  },

  disclaimerTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#8A632E',
    marginBottom: 5,
  },

  disclaimerText: {
    fontSize: 11,
    lineHeight: 17,
    color: '#75613F',
  },

  womenCard: {
    flexDirection: 'row',
    backgroundColor: '#FCEFF4',
    borderRadius: 18,
    padding: 16,
    marginBottom: 15,
  },

  womenIconContainer: {
    width: 45,
    height: 45,
    borderRadius: 23,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },

  womenIcon: {
    fontSize: 23,
  },

  womenContent: {
    flex: 1,
  },

  womenTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#292329',
    marginBottom: 6,
  },

  womenText: {
    fontSize: 12,
    lineHeight: 18,
    color: '#66585F',
  },

  womenLink: {
    fontSize: 12,
    fontWeight: '800',
    color: '#8B5E83',
    marginTop: 9,
  },

  janSamarthCard: {
    backgroundColor: '#EEF7EE',
    borderRadius: 18,
    padding: 16,
  },

  janSamarthTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#292329',
    marginBottom: 6,
  },

  janSamarthText: {
    fontSize: 12,
    lineHeight: 18,
    color: '#5E685E',
  },

  janSamarthLink: {
    fontSize: 12,
    fontWeight: '800',
    color: '#587553',
    marginTop: 9,
  },
});