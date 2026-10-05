import {
  StyleSheet,
  Text,
  View,
  Pressable,
  Image,
  Alert,
  ScrollView,
  TextInput,
} from 'react-native';

import { File } from 'expo-file-system';
import { useState } from 'react';
import * as ImagePicker from 'expo-image-picker';

import {
  useAudioRecorder,
  AudioModule,
  RecordingPresets,
} from 'expo-audio';

import API from '../services/api';
import { supabase } from '../services/supabase';
import { useLanguage } from '../context/LanguageContext';

export default function AddProductScreen() {
  const { language, setLanguage, t } = useLanguage();

  const [image, setImage] =
    useState<string | null>(null);

  const [originalImage, setOriginalImage] =
    useState<string | null>(null);

  const [isRecording, setIsRecording] =
    useState(false);

  const [audioUri, setAudioUri] =
    useState<string | null>(null);

  const [loadingMessage, setLoadingMessage] =
    useState('');

  const [catalog, setCatalog] =
    useState<any>(null);

  const [showCatalog, setShowCatalog] =
    useState(false);

  const [materialCost, setMaterialCost] =
    useState('');

  const [priceData, setPriceData] =
    useState<any>(null);

  const [sellingPrice, setSellingPrice] =
    useState('');

  const [publishing, setPublishing] =
    useState(false);

  const [descriptionLanguage, setDescriptionLanguage] =
    useState<'en' | 'hi'>('en');

  const audioRecorder = useAudioRecorder(
    RecordingPresets.HIGH_QUALITY
  );

  // ==================================================
  // IMAGE: GALLERY
  // ==================================================

  const pickImage = async () => {
    const result =
      await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        quality: 1,
      });

    if (!result.canceled) {
      const selectedImage =
        result.assets[0].uri;

      setOriginalImage(selectedImage);
      setImage(selectedImage);
      setPriceData(null);
      setSellingPrice('');
    }
  };

  // ==================================================
  // IMAGE: CAMERA
  // ==================================================

  const takePhoto = async () => {
    const permission =
      await ImagePicker.requestCameraPermissionsAsync();

    if (!permission.granted) {
      alert(
        'Camera permission is required.'
      );

      return;
    }

    const result =
      await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        quality: 1,
      });

    if (!result.canceled) {
      const selectedImage =
        result.assets[0].uri;

      setOriginalImage(selectedImage);
      setImage(selectedImage);
      setPriceData(null);
      setSellingPrice('');
    }
  };

  // ==================================================
  // IMAGE: AI ENHANCEMENT
  // ==================================================

  const enhanceImage = async () => {
    console.log(
      '🔥 ENHANCE BUTTON PRESSED'
    );

    if (!image) {
      Alert.alert(
        'No image',
        'Please select or take a product photo first.'
      );

      return;
    }

    try {
      setLoadingMessage(
        'Enhancing image...'
      );

      console.log(
        'IMAGE URI:',
        image
      );

      const file =
        new File(image);

      const base64Image =
        await file.base64();

      console.log(
        'BASE64 CREATED:',
        base64Image.length
      );

      const response =
        await fetch(
          'http://192.168.0.182:8001/enhance-image',
          {
            method: 'POST',

            headers: {
              'Content-Type':
                'application/json',
            },

            body: JSON.stringify({
              image: base64Image,
            }),
          }
        );

      console.log(
        'SERVER STATUS:',
        response.status
      );

      const responseText =
        await response.text();

      console.log(
        'SERVER RESPONSE:',
        responseText.substring(0, 200)
      );

      if (!response.ok) {
        throw new Error(
          `Server error ${response.status}: ${responseText}`
        );
      }

      const data =
        JSON.parse(responseText);

      if (data.error) {
        throw new Error(
          data.error
        );
      }

      if (!data.image) {
        throw new Error(
          'Server did not return an enhanced image.'
        );
      }

      setImage(
        `data:image/jpeg;base64,${data.image}`
      );

      setLoadingMessage('');

      Alert.alert(
        'Success',
        'AI background removed successfully!'
      );

    } catch (error: any) {
      console.log(
        'IMAGE ENHANCEMENT ERROR:',
        error
      );

      setLoadingMessage('');

      Alert.alert(
        'Image Error',
        error?.message ||
        'Could not process image.'
      );
    }
  };

  // ==================================================
  // VOICE: START
  // ==================================================

  const startRecording = async () => {
    const permission =
      await AudioModule.requestRecordingPermissionsAsync();

    if (!permission.granted) {
      alert(
        'Microphone permission is required.'
      );

      return;
    }

    try {
      await audioRecorder.prepareToRecordAsync();

      audioRecorder.record();

      setIsRecording(true);

      console.log(
        'Recording started'
      );

    } catch (error) {
      console.log(
        'Recording error:',
        error
      );

      alert(
        'Could not start recording.'
      );
    }
  };

  // ==================================================
  // VOICE: STOP
  // ==================================================

  const stopRecording = async () => {
    if (!isRecording) {
      return;
    }

    try {
      await audioRecorder.stop();

      setIsRecording(false);

      const uri =
        audioRecorder.uri;

      if (uri) {
        setAudioUri(uri);

        console.log(
          'Audio saved at:',
          uri
        );
      }

      alert(
        'Recording saved!'
      );

    } catch (error) {
      console.log(
        'Stop recording error:',
        error
      );

      setIsRecording(false);
    }
  };

  // ==================================================
  // AI PRICING
  // ==================================================

  const getSuggestedPrice = async (
    catalogData: any
  ) => {
    console.log(
      '🔥 PRICE FUNCTION CALLED'
    );

    if (!originalImage) {
      throw new Error(
        'Product image is missing.'
      );
    }

    if (!materialCost) {
      throw new Error(
        'Please enter the material cost.'
      );
    }

    try {
      const formData =
        new FormData();

      formData.append(
        'description',
        catalogData.description || ''
      );

      formData.append(
        'materialCost',
        materialCost
      );

      formData.append(
        'category',
        catalogData.category || ''
      );

      formData.append(
        'material',
        catalogData.material || ''
      );

      const imageFile =
        new File(originalImage);

      formData.append(
        'image',
        imageFile as any
      );

      const response =
        await fetch(
          'http://192.168.0.182:3000/suggest-price',
          {
            method: 'POST',
            body: formData,
          }
        );

      const responseText =
        await response.text();

      if (!response.ok) {
        throw new Error(
          `Pricing server error ${response.status}: ${responseText}`
        );
      }

      const data =
        JSON.parse(responseText);

      setPriceData(data);

      return data;

    } catch (error: any) {
      console.log(
        'PRICE GENERATION ERROR:',
        error
      );

      throw error;
    }
  };

  // ==================================================
  // TRANSCRIBE + GENERATE CATALOG
  // ==================================================

  const transcribeAudio = async () => {
    if (!image) {
      Alert.alert(
        'No image',
        'Please add a product image first.'
      );

      return;
    }

    if (!audioUri) {
      Alert.alert(
        'No recording',
        'Please record your product description first.'
      );

      return;
    }

    if (!materialCost) {
      Alert.alert(
        'Material Cost Required',
        'Please enter the material cost.'
      );

      return;
    }

    try {
      setLoadingMessage(
        'Generating catalog...'
      );

      const formData =
        new FormData();

      formData.append(
        'file',
        {
          uri: audioUri,
          name: 'product-description.m4a',
          type: 'audio/m4a',
        } as any
      );

      const transcriptionResponse =
        await API.post(
          '/transcribe',
          formData,
          {
            headers: {
              'Content-Type':
                'multipart/form-data',
            },
          }
        );

      if (
        transcriptionResponse.data.error
      ) {
        throw new Error(
          transcriptionResponse.data.error
        );
      }

      const transcribedText =
        transcriptionResponse.data.text;

      const catalogResponse =
        await API.post(
          '/generate-catalog',
          {
            text: transcribedText,
          }
        );

      if (
        catalogResponse.data.error
      ) {
        throw new Error(
          catalogResponse.data.error
        );
      }

      let catalogData =
        catalogResponse.data.catalog;

      catalogData =
        catalogData
          .replace(/```json/g, '')
          .replace(/```/g, '')
          .trim();

      const parsedCatalog =
        JSON.parse(catalogData);

      setCatalog(parsedCatalog);
      setShowCatalog(true);

      setDescriptionLanguage('en');

      const generatedPrice =
        await getSuggestedPrice(
          parsedCatalog
        );

      console.log(
        'Generated price:',
        generatedPrice
      );

      setLoadingMessage('');

    } catch (error: any) {
      console.log(
        'CATALOG / PRICE GENERATION ERROR:',
        error
      );

      setLoadingMessage('');

      Alert.alert(
        'Generation Error',
        error?.response?.data?.error ||
        error?.message ||
        'Something went wrong.'
      );
    }
  };

  // ==================================================
  // DESCRIPTION LANGUAGE
  // ==================================================

  const switchDescriptionLanguage = () => {
    if (!catalog) {
      Alert.alert(
        'Generate your listing first',
        'Please generate your AI catalog before switching the description language.'
      );

      return;
    }

    if (
      descriptionLanguage === 'en' &&
      !catalog.hindi_description
    ) {
      Alert.alert(
        'Hindi description unavailable',
        'The AI catalog did not generate a Hindi description.'
      );

      return;
    }

    setDescriptionLanguage(
      descriptionLanguage === 'en'
        ? 'hi'
        : 'en'
    );
  };

  const selectDescriptionLanguage = (
    selectedLanguage: 'en' | 'hi'
  ) => {
    if (
      selectedLanguage === 'hi' &&
      !catalog?.hindi_description
    ) {
      Alert.alert(
        'Hindi unavailable',
        'The AI catalog did not generate a Hindi description.'
      );

      return;
    }

    setDescriptionLanguage(
      selectedLanguage
    );
  };

  // ==================================================
  // PUBLISH PRODUCT
  // ==================================================

  const publishProduct = async () => {
    if (!catalog) {
      Alert.alert(
        'Missing catalog',
        'Please generate the product catalog first.'
      );

      return;
    }

    if (!sellingPrice) {
      Alert.alert(
        'Selling price required',
        'Please enter the final selling price.'
      );

      return;
    }

    const finalPrice =
      Number(sellingPrice);

    if (
      isNaN(finalPrice) ||
      finalPrice <= 0
    ) {
      Alert.alert(
        'Invalid price',
        'Please enter a valid selling price.'
      );

      return;
    }

    if (!originalImage) {
      Alert.alert(
        'Missing image',
        'Please add a product image first.'
      );

      return;
    }

    try {
      setPublishing(true);

      const {
        data: {
          user
        },
        error: userError,
      } =
        await supabase.auth.getUser();

      if (
        userError ||
        !user
      ) {
        Alert.alert(
          'Login required',
          'Please log in again before publishing.'
        );

        return;
      }

      let aiMinPrice = null;
      let aiMaxPrice = null;

      if (
        priceData &&
        typeof priceData === 'object'
      ) {
        aiMinPrice =
          priceData.minPrice ??
          priceData.min_price ??
          priceData.minimumPrice ??
          null;

        aiMaxPrice =
          priceData.maxPrice ??
          priceData.max_price ??
          priceData.maximumPrice ??
          null;
      }

      const {
        error
      } =
        await supabase
          .from('products')
          .insert({
            artisan_id:
              user.id,

            product_name:
              catalog.product_name,

            description_en:
              catalog.description,

            description_hi:
              catalog.hindi_description,

            description_mr:
              null,

            category:
              catalog.category,

            material:
              catalog.material,

            image_url:
              image,

            ai_min_price:
              aiMinPrice,

            ai_max_price:
              aiMaxPrice,

            selling_price:
              finalPrice,
          });

      if (error) {
        Alert.alert(
          'Publish failed',
          error.message
        );

        return;
      }

      Alert.alert(
        '🎉 Product Published!',
        'Your product is now available in the marketplace.'
      );

    } catch (error: any) {
      Alert.alert(
        'Error',
        error?.message ||
        'Could not publish the product.'
      );

    } finally {
      setPublishing(false);
    }
  };

  // ==================================================
  // UI
  // ==================================================

  return (
    <View style={styles.container}>

      {/* LANGUAGE SWITCH */}

      <View style={styles.languageSwitch}>

        <Text style={styles.languageSwitchLabel}>
          Language
        </Text>

        <Pressable
          onPress={() => setLanguage('en')}
          style={[
            styles.languageButton,
            language === 'en' &&
              styles.selectedLanguage,
          ]}
        >
          <Text
            style={[
              styles.languageText,
              language === 'en' &&
                styles.selectedLanguageText,
            ]}
          >
            🇬🇧 English
          </Text>
        </Pressable>

        <Pressable
          onPress={() => setLanguage('hi')}
          style={[
            styles.languageButton,
            language === 'hi' &&
              styles.selectedLanguage,
          ]}
        >
          <Text
            style={[
              styles.languageText,
              language === 'hi' &&
                styles.selectedLanguageText,
            ]}
          >
            🇮🇳 हिंदी
          </Text>
        </Pressable>

      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={
          styles.scrollContent
        }
      >

        {/* HEADER */}

        <View style={styles.header}>

          <View style={styles.headerIcon}>
            <Text style={styles.headerIconText}>
              ✨
            </Text>
          </View>

          <Text style={styles.title}>
            {t.addYourProduct}
          </Text>

          <Text style={styles.subtitle}>
            {t.createProfessionalListing}
          </Text>

        </View>

        {/* STEP INDICATOR */}

        <View style={styles.progressCard}>

          <View style={styles.progressStepActive}>
            <Text style={styles.progressNumber}>
              1
            </Text>
          </View>

          <View style={styles.progressLine} />

          <View
            style={[
              styles.progressStep,
              showCatalog &&
                styles.progressStepActive,
            ]}
          >
            <Text
              style={[
                styles.progressNumber,
                !showCatalog &&
                  styles.progressNumberInactive,
              ]}
            >
              2
            </Text>
          </View>

          <View style={styles.progressLine} />

          <View
            style={[
              styles.progressStep,
              showCatalog &&
                styles.progressStepActive,
            ]}
          >
            <Text
              style={[
                styles.progressNumber,
                !showCatalog &&
                  styles.progressNumberInactive,
              ]}
            >
              3
            </Text>
          </View>

          <View style={styles.progressLabels}>

            <Text style={styles.progressLabel}>
              Photo
            </Text>

            <Text style={styles.progressLabel}>
              AI Catalog
            </Text>

            <Text style={styles.progressLabel}>
              Publish
            </Text>

          </View>

        </View>

        {/* PHOTO STUDIO */}

        <View style={styles.sectionHeader}>

          <View>
            <Text style={styles.sectionTitle}>
              📸 Product Photo
            </Text>

            <Text style={styles.sectionSubtitle}>
              Create a clean, professional product image
            </Text>
          </View>

          <View style={styles.requiredBadge}>
            <Text style={styles.requiredText}>
              Required
            </Text>
          </View>

        </View>

        <View style={styles.photoStudio}>

          {image ? (

            <View style={styles.imagePreviewWrapper}>

              <Image
                source={{ uri: image }}
                style={styles.productImage}
              />

              <View style={styles.enhancedBadge}>
                <Text style={styles.enhancedBadgeText}>
                  ✨ AI Studio Ready
                </Text>
              </View>

            </View>

          ) : (

            <View style={styles.emptyPhotoArea}>

              <View style={styles.cameraCircle}>
                <Text style={styles.cameraIcon}>
                  📷
                </Text>
              </View>

              <Text style={styles.imageTitle}>
                {t.addProductPhoto}
              </Text>

              <Text style={styles.imageSubtitle}>
                {t.photoInstruction}
              </Text>

            </View>

          )}

          <View style={styles.photoActions}>

            <Pressable
              style={styles.primaryPhotoButton}
              onPress={takePhoto}
            >

              <Text style={styles.primaryPhotoIcon}>
                📷
              </Text>

              <Text style={styles.primaryPhotoText}>
                {t.takePhoto}
              </Text>

            </Pressable>

            <Pressable
              style={styles.secondaryPhotoButton}
              onPress={pickImage}
            >

              <Text style={styles.secondaryPhotoIcon}>
                🖼️
              </Text>

              <Text style={styles.secondaryPhotoText}>
                {t.chooseFromGallery}
              </Text>

            </Pressable>

          </View>

          {image && (

            <Pressable
              style={[
                styles.enhanceButton,
                loadingMessage !== '' &&
                  styles.disabledButton,
              ]}
              onPress={enhanceImage}
              disabled={loadingMessage !== ''}
            >

              <Text style={styles.enhanceIcon}>
                ✨
              </Text>

              <View style={styles.enhanceTextContainer}>

                <Text style={styles.enhanceTitle}>
                  {t.createStudioPhoto}
                </Text>

                <Text style={styles.enhanceSubtitle}>
                  Remove background & improve presentation
                </Text>

              </View>

              <Text style={styles.arrow}>
                →
              </Text>

            </Pressable>

          )}

        </View>

        {/* VOICE LISTING */}

        <View style={styles.sectionHeader}>

          <View>
            <Text style={styles.sectionTitle}>
              🎙️ Tell Us About Your Craft
            </Text>

            <Text style={styles.sectionSubtitle}>
              Speak naturally — AI will create the listing
            </Text>
          </View>

        </View>

        <View style={styles.voiceCard}>

          <View style={styles.voiceTop}>

            <View style={styles.voiceIconCircle}>
              <Text style={styles.voiceIcon}>
                🎤
              </Text>
            </View>

            <View style={styles.voiceText}>

              <Text style={styles.voiceTitle}>
                {t.tellAboutProduct}
              </Text>

              <Text style={styles.voiceSubtitle}>
                {t.speakRegionalLanguage}
              </Text>

            </View>

          </View>

          <View style={styles.voiceDivider} />

          <View style={styles.voiceBottom}>

            <View>

              <Text style={styles.voiceHintTitle}>
                {isRecording
                  ? '🔴 Recording in progress'
                  : audioUri
                  ? '✓ Recording saved'
                  : 'Tap the microphone to start'}
              </Text>

              <Text style={styles.voiceHint}>
                You can describe the material,
                design, story and making process.
              </Text>

            </View>

            <Pressable
              style={[
                styles.bigMicButton,
                isRecording &&
                  styles.bigMicRecording,
              ]}
              onPress={
                isRecording
                  ? stopRecording
                  : startRecording
              }
            >

              <Text style={styles.bigMicText}>
                {isRecording
                  ? '⏹'
                  : '🎙️'}
              </Text>

            </Pressable>

          </View>

        </View>

        {/* MATERIAL COST */}

        <View style={styles.sectionHeader}>

          <View>
            <Text style={styles.sectionTitle}>
              💰 Material Cost
            </Text>

            <Text style={styles.sectionSubtitle}>
              Helps AI suggest a fair selling price
            </Text>
          </View>

        </View>

        <View style={styles.costCard}>

          <Text style={styles.inputLabel}>
            {t.materialCostLabel}
          </Text>

          <Text style={styles.costSubtitle}>
            {t.materialCostInstruction}
          </Text>

          <View style={styles.costInputWrapper}>

            <Text style={styles.costRupee}>
              ₹
            </Text>

            <TextInput
              style={styles.costInput}
              placeholder={
                t.materialCostPlaceholder
              }
              placeholderTextColor="#A89484"
              keyboardType="numeric"
              value={materialCost}
              onChangeText={
                setMaterialCost
              }
            />

          </View>

        </View>

        {/* AI GENERATED CATALOG */}

        {showCatalog && catalog && (

          <View>

            <View style={styles.sectionHeader}>

              <View>
                <Text style={styles.sectionTitle}>
                  ✨ AI Generated Catalog
                </Text>

                <Text style={styles.sectionSubtitle}>
                  Review everything before publishing
                </Text>
              </View>

              <View style={styles.aiBadge}>
                <Text style={styles.aiBadgeText}>
                  AI
                </Text>
              </View>

            </View>

            <View style={styles.catalogCard}>

              <View style={styles.catalogTop}>

                <View style={styles.catalogIcon}>
                  <Text>
                    ✨
                  </Text>
                </View>

                <View style={{ flex: 1 }}>

                  <Text style={styles.catalogHeading}>
                    {t.aiCatalog}
                  </Text>

                  <Text style={styles.editHint}>
                    {t.reviewEdit}
                  </Text>

                </View>

              </View>

              {/* PRODUCT NAME */}

              <Text style={styles.label}>
                {t.productNameLabel}
              </Text>

              <TextInput
                style={styles.editInput}
                value={catalog.product_name || ''}
                onChangeText={(text) =>
                  setCatalog({
                    ...catalog,
                    product_name: text,
                  })
                }
                placeholder="Product name"
                placeholderTextColor="#A89484"
              />

              {/* CATEGORY */}

              <Text style={styles.label}>
                {t.categoryLabel}
              </Text>

              <TextInput
                style={styles.editInput}
                value={catalog.category || ''}
                onChangeText={(text) =>
                  setCatalog({
                    ...catalog,
                    category: text,
                  })
                }
                placeholder="Category"
                placeholderTextColor="#A89484"
              />

              {/* MATERIAL */}

              <Text style={styles.label}>
                {t.materialLabel}
              </Text>

              <TextInput
                style={styles.editInput}
                value={catalog.material || ''}
                onChangeText={(text) =>
                  setCatalog({
                    ...catalog,
                    material: text,
                  })
                }
                placeholder="Material"
                placeholderTextColor="#A89484"
              />

              {/* DESCRIPTION LANGUAGE */}

              <View style={styles.descriptionHeaderRow}>

                <View style={{ flex: 1 }}>

                  <Text style={styles.label}>
                    Product Description
                  </Text>

                  <Text style={styles.descriptionHelper}>
                    Make your listing understandable to more buyers
                  </Text>

                </View>

                <Pressable
                  style={styles.translateButton}
                  onPress={switchDescriptionLanguage}
                >

                  <Text style={styles.translateButtonText}>
                    {descriptionLanguage === 'en'
                      ? '🇮🇳 Translate to Hindi'
                      : '🇬🇧 Show English'}
                  </Text>

                </Pressable>

              </View>

              {/* LANGUAGE TABS */}

              <View style={styles.descriptionLanguageTabs}>

                <Pressable
                  onPress={() =>
                    selectDescriptionLanguage('en')
                  }
                  style={[
                    styles.descriptionLanguageTab,
                    descriptionLanguage === 'en' &&
                      styles.descriptionLanguageTabActive,
                  ]}
                >

                  <Text
                    style={[
                      styles.descriptionLanguageText,
                      descriptionLanguage === 'en' &&
                        styles.descriptionLanguageTextActive,
                    ]}
                  >
                    🇬🇧 English
                  </Text>

                </Pressable>

                <Pressable
                  onPress={() =>
                    selectDescriptionLanguage('hi')
                  }
                  style={[
                    styles.descriptionLanguageTab,
                    descriptionLanguage === 'hi' &&
                      styles.descriptionLanguageTabActive,
                  ]}
                >

                  <Text
                    style={[
                      styles.descriptionLanguageText,
                      descriptionLanguage === 'hi' &&
                        styles.descriptionLanguageTextActive,
                    ]}
                  >
                    🇮🇳 हिंदी
                  </Text>

                </Pressable>

              </View>

              {/* DESCRIPTION */}

              <TextInput
                style={[
                  styles.editInput,
                  styles.descriptionInput,
                ]}
                value={
                  descriptionLanguage === 'en'
                    ? catalog.description || ''
                    : catalog.hindi_description || ''
                }
                onChangeText={(text) => {

                  if (
                    descriptionLanguage === 'en'
                  ) {

                    setCatalog({
                      ...catalog,
                      description: text,
                    });

                  } else {

                    setCatalog({
                      ...catalog,
                      hindi_description: text,
                    });

                  }

                }}
                placeholder={
                  descriptionLanguage === 'en'
                    ? 'Write your product description...'
                    : 'हिंदी में अपने उत्पाद का विवरण लिखें...'
                }
                placeholderTextColor="#A89484"
                multiline
                textAlignVertical="top"
              />

              {/* TAGS */}

              <Text style={styles.label}>
                {t.tagsLabel}
              </Text>

              <View style={styles.tagsContainer}>

                {catalog.tags?.map(
                  (
                    tag: string,
                    index: number
                  ) => (

                    <View
                      key={index}
                      style={styles.tag}
                    >

                      <Text style={styles.tagText}>
                        #{tag}
                      </Text>

                    </View>

                  )
                )}

              </View>

              {/* AI PRICE */}

              {priceData && (

                <View style={styles.priceCard}>

                  <View style={styles.priceHeaderRow}>

                    <View style={styles.priceIconCircle}>
                      <Text>
                        ₹
                      </Text>
                    </View>

                    <View>

                      <Text style={styles.priceHeading}>
                        AI Suggested Price
                      </Text>

                      <Text style={styles.priceSmallText}>
                        Based on your product details
                      </Text>

                    </View>

                  </View>

                  <Text style={styles.priceResult}>
                    {typeof priceData === 'object'
                      ? JSON.stringify(
                          priceData,
                          null,
                          2
                        )
                      : priceData}
                  </Text>

                </View>

              )}

              {/* FINAL PRICE */}

              <View style={styles.finalPriceBox}>

                <Text style={styles.finalPriceHeading}>
                  🏷️ Your Selling Price
                </Text>

                <Text style={styles.finalPriceSubtitle}>
                  AI suggests. You decide the final price.
                </Text>

                <View style={styles.priceInputContainer}>

                  <Text style={styles.rupee}>
                    ₹
                  </Text>

                  <TextInput
                    style={styles.priceInput}
                    placeholder="Enter final price"
                    placeholderTextColor="#A89484"
                    keyboardType="numeric"
                    value={sellingPrice}
                    onChangeText={
                      setSellingPrice
                    }
                  />

                </View>

              </View>

              {/* PUBLISH */}

              <Pressable
                style={[
                  styles.publishButton,
                  publishing &&
                    styles.publishButtonDisabled,
                ]}
                onPress={publishProduct}
                disabled={publishing}
              >

                <Text style={styles.publishButtonText}>

                  {publishing
                    ? 'Publishing...'
                    : '🚀 Publish Product'}

                </Text>

              </Pressable>

            </View>

          </View>

        )}

      </ScrollView>

      {/* BOTTOM ACTION */}

      {!showCatalog && (

        <View style={styles.bottomBar}>

          <Pressable
            style={[
              styles.continueButton,
              loadingMessage !== '' &&
                styles.disabledButton,
            ]}
            onPress={transcribeAudio}
            disabled={loadingMessage !== ''}
          >

            <View>

              <Text style={styles.continueSmallText}>
                Next step
              </Text>

              <Text style={styles.continueText}>
                {t.generateCatalogPrice}
              </Text>

            </View>

            <Text style={styles.continueArrow}>
              →
            </Text>

          </Pressable>

        </View>

      )}

      {showCatalog && (

        <View style={styles.bottomBar}>

          <Pressable
            style={[
              styles.regenerateButton,
              loadingMessage !== '' &&
                styles.disabledButton,
            ]}
            onPress={transcribeAudio}
            disabled={loadingMessage !== ''}
          >

            <Text style={styles.regenerateText}>
              ✨ {t.regenerateCatalogPrice}
            </Text>

          </Pressable>

        </View>

      )}

      {/* LOADING POPUP */}

      {loadingMessage !== '' && (

        <View style={styles.loadingOverlay}>

          <View style={styles.loadingCard}>

            <View style={styles.loadingCircle}>

              <Text style={styles.loadingEmoji}>
                {loadingMessage ===
                'Enhancing image...'
                  ? '✨'
                  : '🤖'}
              </Text>

            </View>

            <Text style={styles.loadingTitle}>
              {loadingMessage}
            </Text>

            <Text style={styles.loadingSubtitle}>
              AI is working on your product...
            </Text>

            <View style={styles.loadingDots}>
              <View style={styles.dot} />
              <View style={styles.dot} />
              <View style={styles.dot} />
            </View>

          </View>

        </View>

      )}

    </View>
  );
}

// ==================================================
// STYLES
// ==================================================

const styles = StyleSheet.create({

  container: {
    flex: 1,
    backgroundColor: '#F8F3E8',
  },

  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 78,
    paddingBottom: 145,
  },

  // ==================================================
  // HEADER
  // ==================================================

  header: {
    marginBottom: 22,
  },

  headerIcon: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: '#DCE7D5',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },

  headerIconText: {
    fontSize: 24,
  },

  title: {
    fontSize: 30,
    fontWeight: '800',
    color: '#3F5F3A',
    letterSpacing: -0.5,
  },

  subtitle: {
    fontSize: 14,
    color: '#756B62',
    marginTop: 7,
    lineHeight: 21,
  },

  // ==================================================
  // LANGUAGE
  // ==================================================

  languageSwitch: {
    position: 'absolute',
    top: 18,
    right: 20,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EEF2E8',
    borderRadius: 24,
    padding: 4,
    zIndex: 10,
    borderWidth: 1,
    borderColor: '#D8DDCE',
  },

  languageSwitchLabel: {
    fontSize: 9,
    color: '#4F7048',
    fontWeight: '700',
    marginHorizontal: 7,
  },

  languageButton: {
    paddingVertical: 7,
    paddingHorizontal: 10,
    borderRadius: 19,
  },

  selectedLanguage: {
    backgroundColor: '#3F5F3A',
  },

  languageText: {
    fontSize: 10,
    color: '#4F7048',
    fontWeight: '700',
  },

  selectedLanguageText: {
    color: '#FFFFFF',
  },

  // ==================================================
  // PROGRESS
  // ==================================================

  progressCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 17,
    marginBottom: 28,
    borderWidth: 1,
    borderColor: '#D8DDCE',
    flexDirection: 'row',
    alignItems: 'center',
    position: 'relative',
  },

  progressStep: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#EFE7E0',
    alignItems: 'center',
    justifyContent: 'center',
  },

  progressStepActive: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#3F5F3A',
    alignItems: 'center',
    justifyContent: 'center',
  },

  progressNumber: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
  },

  progressNumberInactive: {
    color: '#9D8C80',
  },

  progressLine: {
    flex: 1,
    height: 2,
    backgroundColor: '#E6DAD0',
    marginHorizontal: 8,
  },

  progressLabels: {
    position: 'absolute',
    left: 10,
    right: 10,
    bottom: -20,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },

  progressLabel: {
    fontSize: 9,
    color: '#8B7668',
    fontWeight: '600',
  },

  // ==================================================
  // SECTION HEADERS
  // ==================================================

  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 11,
    marginTop: 7,
  },

  sectionTitle: {
    fontSize: 19,
    fontWeight: '800',
    color: '#3F5F3A',
  },

  sectionSubtitle: {
    fontSize: 11,
    color: '#8A7668',
    marginTop: 3,
    maxWidth: 285,
  },

  requiredBadge: {
    backgroundColor: '#FFF0D0',
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 12,
  },

  requiredText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#9A6910',
  },

  aiBadge: {
    backgroundColor: '#3F5F3A',
    paddingHorizontal: 11,
    paddingVertical: 6,
    borderRadius: 12,
  },

  aiBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800',
  },

  // ==================================================
  // PHOTO STUDIO
  // ==================================================

  photoStudio: {
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    padding: 14,
    marginBottom: 27,
    borderWidth: 1,
    borderColor: '#D8DDCE',
    shadowColor: '#3F5F3A',
    shadowOpacity: 0.06,
    shadowRadius: 10,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    elevation: 2,
  },

  emptyPhotoArea: {
    height: 225,
    borderRadius: 17,
    backgroundColor: '#F3F5EC',
    borderWidth: 1.5,
    borderColor: '#C9D4C2',
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 13,
  },

  cameraCircle: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: '#DCE7D5',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },

  cameraIcon: {
    fontSize: 31,
  },

  imageTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#3F5F3A',
  },

  imageSubtitle: {
    fontSize: 11,
    color: '#917D70',
    textAlign: 'center',
    marginTop: 6,
    maxWidth: 230,
    lineHeight: 17,
  },

  imagePreviewWrapper: {
    position: 'relative',
    marginBottom: 13,
  },

  productImage: {
    width: '100%',
    height: 245,
    borderRadius: 17,
    resizeMode: 'cover',
    backgroundColor: '#F1F3EA',
  },

  enhancedBadge: {
    position: 'absolute',
    top: 12,
    left: 12,
    backgroundColor: 'rgba(84,36,95,0.9)',
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 14,
  },

  enhancedBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
  },

  // ==================================================
  // PHOTO ACTIONS
  // ==================================================

  photoActions: {
    flexDirection: 'row',
    gap: 10,
  },

  primaryPhotoButton: {
    flex: 1,
    height: 52,
    borderRadius: 14,
    backgroundColor: '#3F5F3A',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },

  primaryPhotoIcon: {
    fontSize: 17,
    marginRight: 8,
  },

  primaryPhotoText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },

  secondaryPhotoButton: {
    flex: 1,
    height: 52,
    borderRadius: 14,
    backgroundColor: '#F3F5EC',
    borderWidth: 1,
    borderColor: '#C9D4C2',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },

  secondaryPhotoIcon: {
    fontSize: 16,
    marginRight: 7,
  },

  secondaryPhotoText: {
    color: '#3F5F3A',
    fontSize: 12,
    fontWeight: '800',
  },

  // ==================================================
  // ENHANCE
  // ==================================================

  enhanceButton: {
    marginTop: 11,
    backgroundColor: '#EEF2E8',
    borderRadius: 15,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
  },

  enhanceIcon: {
    fontSize: 23,
    marginRight: 12,
  },

  enhanceTextContainer: {
    flex: 1,
  },

  enhanceTitle: {
    color: '#3F5F3A',
    fontSize: 13,
    fontWeight: '800',
  },

  enhanceSubtitle: {
    color: '#756B62',
    fontSize: 10,
    marginTop: 3,
  },

  arrow: {
    fontSize: 21,
    color: '#3F5F3A',
    fontWeight: '700',
  },

  // ==================================================
  // VOICE
  // ==================================================

  voiceCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 21,
    padding: 17,
    marginBottom: 27,
    borderWidth: 1,
    borderColor: '#D8DDCE',
  },

  voiceTop: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  voiceIconCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#DCE7D5',
    alignItems: 'center',
    justifyContent: 'center',
  },

  voiceIcon: {
    fontSize: 24,
  },

  voiceText: {
    flex: 1,
    marginLeft: 13,
  },

  voiceTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#3F5F3A',
  },

  voiceSubtitle: {
    fontSize: 11,
    color: '#8B7769',
    marginTop: 4,
    lineHeight: 16,
  },

  voiceDivider: {
    height: 1,
    backgroundColor: '#E1E6DB',
    marginVertical: 16,
  },

  voiceBottom: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  voiceHintTitle: {
    fontSize: 12,
    color: '#3F5F3A',
    fontWeight: '700',
  },

  voiceHint: {
    fontSize: 10,
    color: '#958175',
    lineHeight: 15,
    maxWidth: 230,
    marginTop: 4,
  },

  bigMicButton: {
    width: 57,
    height: 57,
    borderRadius: 29,
    backgroundColor: '#3F5F3A',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 'auto',
  },

  bigMicRecording: {
    backgroundColor: '#C94F48',
  },

  bigMicText: {
    color: '#FFFFFF',
    fontSize: 22,
  },

  // ==================================================
  // COST
  // ==================================================

  costCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 21,
    padding: 18,
    marginBottom: 27,
    borderWidth: 1,
    borderColor: '#D8DDCE',
  },

  inputLabel: {
    fontSize: 14,
    fontWeight: '800',
    color: '#3F5F3A',
    marginBottom: 5,
  },

  costSubtitle: {
    fontSize: 11,
    color: '#8D786B',
    lineHeight: 17,
    marginBottom: 13,
  },

  costInputWrapper: {
    height: 52,
    borderRadius: 14,
    backgroundColor: '#F8FAF4',
    borderWidth: 1,
    borderColor: '#C9D4C2',
    flexDirection: 'row',
    alignItems: 'center',
  },

  costRupee: {
    fontSize: 18,
    fontWeight: '800',
    color: '#3F5F3A',
    marginLeft: 15,
  },

  costInput: {
    flex: 1,
    paddingHorizontal: 10,
    fontSize: 15,
    color: '#422719',
  },

  // ==================================================
  // CATALOG
  // ==================================================

  catalogCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    padding: 18,
    marginBottom: 27,
    borderWidth: 1,
    borderColor: '#D8DDCE',
  },

  catalogTop: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },

  catalogIcon: {
    width: 43,
    height: 43,
    borderRadius: 14,
    backgroundColor: '#DCE7D5',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 11,
  },

  catalogHeading: {
    fontSize: 18,
    fontWeight: '800',
    color: '#3F5F3A',
  },

  editHint: {
    fontSize: 10,
    color: '#907B6D',
    marginTop: 3,
    lineHeight: 15,
  },

  label: {
    fontSize: 10,
    fontWeight: '800',
    color: '#3F5F3A',
    marginTop: 15,
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },

  editInput: {
    borderWidth: 1,
    borderColor: '#C9D4C2',
    borderRadius: 13,
    paddingHorizontal: 13,
    paddingVertical: 12,
    fontSize: 14,
    color: '#3F302B',
    backgroundColor: '#F8FAF4',
  },

  descriptionInput: {
    minHeight: 120,
    lineHeight: 21,
  },

  descriptionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    marginTop: 15,
    marginBottom: 8,
  },

  descriptionHelper: {
    fontSize: 10,
    color: '#756B62',
    marginTop: 3,
    maxWidth: 210,
  },

  translateButton: {
    backgroundColor: '#3F5F3A',
    paddingHorizontal: 11,
    paddingVertical: 8,
    borderRadius: 12,
    marginLeft: 8,
  },

  translateButtonText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800',
  },

  descriptionLanguageTabs: {
    flexDirection: 'row',
    backgroundColor: '#EEF2E8',
    borderRadius: 13,
    padding: 4,
    marginBottom: 9,
  },

  descriptionLanguageTab: {
    flex: 1,
    paddingVertical: 9,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },

  descriptionLanguageTabActive: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#3F5F3A',
    shadowOpacity: 0.08,
    shadowRadius: 5,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    elevation: 2,
  },

  descriptionLanguageText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#6F8068',
  },

  descriptionLanguageTextActive: {
    color: '#3F5F3A',
  },

  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 3,
  },

  tag: {
    backgroundColor: '#EEF2E8',
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 20,
    marginRight: 7,
    marginBottom: 7,
  },

  tagText: {
    color: '#3F5F3A',
    fontSize: 11,
    fontWeight: '700',
  },

  // ==================================================
  // PRICE
  // ==================================================

  priceCard: {
    backgroundColor: '#F3F5EC',
    borderRadius: 17,
    padding: 16,
    marginTop: 22,
    borderWidth: 1,
    borderColor: '#C9D4C2',
  },

  priceHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  priceIconCircle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#DCE7D5',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 11,
  },

  priceHeading: {
    fontSize: 15,
    fontWeight: '800',
    color: '#3F5F3A',
  },

  priceSmallText: {
    fontSize: 9,
    color: '#756B62',
    marginTop: 3,
  },

  priceResult: {
    fontSize: 13,
    color: '#3F302B',
    lineHeight: 20,
    marginTop: 13,
  },

  // ==================================================
  // FINAL PRICE
  // ==================================================

  finalPriceBox: {
    backgroundColor: '#F8FAF4',
    borderRadius: 17,
    padding: 16,
    marginTop: 18,
    borderWidth: 1,
    borderColor: '#C9D4C2',
  },

  finalPriceHeading: {
    fontSize: 15,
    fontWeight: '800',
    color: '#3F5F3A',
  },

  finalPriceSubtitle: {
    fontSize: 10,
    color: '#756B62',
    marginTop: 5,
    marginBottom: 12,
  },

  priceInputContainer: {
    height: 54,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#C9D4C2',
    borderRadius: 13,
  },

  rupee: {
    fontSize: 19,
    fontWeight: '800',
    color: '#3F5F3A',
    marginLeft: 15,
  },

  priceInput: {
    flex: 1,
    paddingHorizontal: 10,
    fontSize: 16,
    color: '#3F302B',
    fontWeight: '600',
  },

  // ==================================================
  // PUBLISH
  // ==================================================

  publishButton: {
    backgroundColor: '#3F5F3A',
    paddingVertical: 17,
    borderRadius: 15,
    alignItems: 'center',
    marginTop: 19,
  },

  publishButtonDisabled: {
    opacity: 0.6,
  },

  publishButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
  },

  // ==================================================
  // BOTTOM BAR
  // ==================================================

  bottomBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#F8F3E8',
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 22,
    borderTopWidth: 1,
    borderTopColor: '#D8DDCE',
  },

  continueButton: {
    backgroundColor: '#3F5F3A',
    minHeight: 62,
    borderRadius: 17,
    paddingHorizontal: 19,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  continueSmallText: {
    color: '#DCE7D5',
    fontSize: 10,
    fontWeight: '700',
    marginBottom: 2,
  },

  continueText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
  },

  continueArrow: {
    color: '#FFFFFF',
    fontSize: 27,
  },

  regenerateButton: {
    backgroundColor: '#3F5F3A',
    paddingVertical: 17,
    borderRadius: 16,
    alignItems: 'center',
  },

  regenerateText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },

  // ==================================================
  // LOADING
  // ==================================================

  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(43, 58, 40, 0.52)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 999,
  },

  loadingCard: {
    width: '78%',
    backgroundColor: '#FFF9F3',
    borderRadius: 25,
    padding: 28,
    alignItems: 'center',
    elevation: 10,
  },

  loadingCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#DCE7D5',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 15,
  },

  loadingEmoji: {
    fontSize: 34,
  },

  loadingTitle: {
    fontSize: 19,
    fontWeight: '800',
    color: '#3F5F3A',
    textAlign: 'center',
  },

  loadingSubtitle: {
    fontSize: 12,
    color: '#756B62',
    textAlign: 'center',
    marginTop: 7,
  },

  loadingDots: {
    flexDirection: 'row',
    marginTop: 17,
  },

  dot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: '#3F5F3A',
    marginHorizontal: 3,
  },

  disabledButton: {
    opacity: 0.55,
  },

});