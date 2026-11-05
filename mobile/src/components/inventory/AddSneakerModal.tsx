/**
 * Author: Domonick Mack
 * Date: 2026-11-05
 * Description: Modal sheet for creating or editing a sneaker entry with camera/library photo capture and live QR tag preview.
 */

import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import {
  SNEAKER_CONDITIONS,
  SNEAKER_STATUSES,
  STATUS_LABELS,
  BOX_CONDITIONS,
  type Sneaker,
  type SneakerInput,
  type SneakerCondition,
  type SneakerStatus,
  type BoxCondition,
} from '@/types/sneaker';
import { pickSneakerPhoto } from '@/services/photoService';
import { SneakerQRTag } from './SneakerQRTag';

export interface AddSneakerModalProps {
  visible: boolean;
  editingSneaker?: Sneaker | null;
  onClose: () => void;
  onSave: (payload: SneakerInput, existingId?: string) => Promise<void>;
}

export function AddSneakerModal({
  visible,
  editingSneaker,
  onClose,
  onSave,
}: AddSneakerModalProps) {
  const [brand, setBrand] = useState('Nike');
  const [model, setModel] = useState('');
  const [colorway, setColorway] = useState('');
  const [sku, setSku] = useState('');
  const [size, setSize] = useState('10.5');
  const [condition, setCondition] = useState<SneakerCondition>('DS');
  const [status, setStatus] = useState<SneakerStatus>('in_stock');
  const [purchasePrice, setPurchasePrice] = useState('');
  const [marketValue, setMarketValue] = useState('');
  const [purchaseDate, setPurchaseDate] = useState('');
  const [boxCondition, setBoxCondition] = useState<BoxCondition>('OG All');
  const [storageLocation, setStorageLocation] = useState('');
  const [notes, setNotes] = useState('');
  const [imageData, setImageData] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (editingSneaker) {
      setBrand(editingSneaker.brand);
      setModel(editingSneaker.model);
      setColorway(editingSneaker.colorway);
      setSku(editingSneaker.sku);
      setSize(editingSneaker.size);
      setCondition(editingSneaker.condition);
      setStatus(editingSneaker.status);
      setPurchasePrice(String(editingSneaker.purchasePrice));
      setMarketValue(String(editingSneaker.marketValue));
      setPurchaseDate(editingSneaker.purchaseDate ?? '');
      setBoxCondition(editingSneaker.boxCondition);
      setStorageLocation(editingSneaker.storageLocation);
      setNotes(editingSneaker.notes);
      setImageData(editingSneaker.imageData);
    } else if (visible) {
      setBrand('Nike');
      setModel('');
      setColorway('');
      setSku('');
      setSize('10.5');
      setCondition('DS');
      setStatus('in_stock');
      setPurchasePrice('');
      setMarketValue('');
      setPurchaseDate(new Date().toISOString().slice(0, 10));
      setBoxCondition('OG All');
      setStorageLocation('Vault Shelf A1');
      setNotes('');
      setImageData(null);
    }
  }, [editingSneaker, visible]);

  const handlePhotoPick = async (source: 'camera' | 'library') => {
    const result = await pickSneakerPhoto(source);
    if (result.error) {
      Alert.alert('Photo Notice', result.error);
      return;
    }
    if (result.dataUri) {
      setImageData(result.dataUri);
    }
  };

  const handleSubmit = async () => {
    const trimmedBrand = brand.trim();
    const trimmedModel = model.trim();
    const trimmedSku = sku.trim().toUpperCase();
    const trimmedSize = size.trim();

    if (!trimmedBrand || !trimmedModel || !trimmedSku || !trimmedSize) {
      Alert.alert(
        'Missing Fields',
        'Please enter Brand, Model, SKU / Style Code, and US Size.'
      );
      return;
    }

    const parsedPurchase = Number(purchasePrice) || 0;
    const parsedMarket = Number(marketValue) || parsedPurchase;

    setSubmitting(true);
    try {
      await onSave(
        {
          brand: trimmedBrand,
          model: trimmedModel,
          colorway: colorway.trim(),
          sku: trimmedSku,
          size: trimmedSize,
          condition,
          status,
          purchasePrice: parsedPurchase,
          marketValue: parsedMarket,
          purchaseDate: purchaseDate.trim() || null,
          boxCondition,
          storageLocation: storageLocation.trim(),
          notes: notes.trim(),
          imageData,
        },
        editingSneaker?.id
      );
      onClose();
    } catch (error) {
      Alert.alert(
        'Save Failed',
        error instanceof Error ? error.message : 'Could not save sneaker.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  const previewQrPayload = `apexvault://sneaker/${editingSneaker?.id ?? 'preview'}?sku=${encodeURIComponent(
    sku.trim() || 'SKU-000'
  )}&size=${encodeURIComponent(size.trim() || '10.5')}`;

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <KeyboardAvoidingView
        style={styles.root}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {/* Top Bar */}
        <View style={styles.topBar}>
          <TouchableOpacity onPress={onClose} style={styles.iconBtn}>
            <Ionicons name="close" size={20} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.topTitle}>
            {editingSneaker ? 'Edit Sneaker' : 'Add Sneaker to Vault'}
          </Text>
          <TouchableOpacity
            onPress={handleSubmit}
            disabled={submitting}
            style={[styles.saveChip, submitting && { opacity: 0.5 }]}
          >
            {submitting ? (
              <ActivityIndicator size="small" color="#000000" />
            ) : (
              <Text style={styles.saveChipText}>Save</Text>
            )}
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
          {/* Photo Capture Section */}
          <Text style={styles.sectionLabel}>SNEAKER PHOTO</Text>
          {imageData ? (
            <View style={styles.photoPreviewBox}>
              <Image source={{ uri: imageData }} style={styles.photoPreview} resizeMode="cover" />
              <View style={styles.photoOverlayActions}>
                <TouchableOpacity
                  onPress={() => handlePhotoPick('camera')}
                  style={styles.photoMiniBtn}
                >
                  <Ionicons name="camera" size={16} color="#FFFFFF" />
                  <Text style={styles.photoMiniBtnText}>Retake</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => handlePhotoPick('library')}
                  style={styles.photoMiniBtn}
                >
                  <Ionicons name="images" size={16} color="#FFFFFF" />
                  <Text style={styles.photoMiniBtnText}>Library</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => setImageData(null)}
                  style={[styles.photoMiniBtn, { backgroundColor: 'rgba(255,69,58,0.8)' }]}
                >
                  <Ionicons name="trash" size={16} color="#FFFFFF" />
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <View style={styles.photoPickerRow}>
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => handlePhotoPick('camera')}
                style={styles.photoPickerCard}
              >
                <View style={styles.photoIconCircle}>
                  <Ionicons name="camera-outline" size={24} color="#000000" />
                </View>
                <Text style={styles.photoPickerTitle}>Take Photo</Text>
                <Text style={styles.photoPickerSub}>Use iOS Camera</Text>
              </TouchableOpacity>

              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => handlePhotoPick('library')}
                style={styles.photoPickerCard}
              >
                <View style={[styles.photoIconCircle, { backgroundColor: '#D6CEEB' }]}>
                  <Ionicons name="images-outline" size={24} color="#000000" />
                </View>
                <Text style={styles.photoPickerTitle}>Photo Library</Text>
                <Text style={styles.photoPickerSub}>Choose existing shot</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Core Sneaker Identity */}
          <Text style={styles.sectionLabel}>IDENTITY & SPECS</Text>
          <View style={styles.row2}>
            <View style={styles.col}>
              <Text style={styles.fieldLabel}>Brand *</Text>
              <TextInput
                value={brand}
                onChangeText={setBrand}
                placeholder="Nike, Jordan, New Balance"
                placeholderTextColor="#636366"
                style={styles.input}
              />
            </View>
            <View style={styles.col}>
              <Text style={styles.fieldLabel}>US Size *</Text>
              <TextInput
                value={size}
                onChangeText={setSize}
                placeholder="10.5"
                placeholderTextColor="#636366"
                style={styles.input}
              />
            </View>
          </View>

          <Text style={styles.fieldLabel}>Model / Silhouette *</Text>
          <TextInput
            value={model}
            onChangeText={setModel}
            placeholder="e.g. Air Jordan 1 Retro High OG"
            placeholderTextColor="#636366"
            style={styles.input}
          />

          <View style={styles.row2}>
            <View style={styles.col}>
              <Text style={styles.fieldLabel}>Colorway</Text>
              <TextInput
                value={colorway}
                onChangeText={setColorway}
                placeholder="Tiger Iridescent"
                placeholderTextColor="#636366"
                style={styles.input}
              />
            </View>
            <View style={styles.col}>
              <Text style={styles.fieldLabel}>SKU / Style Code *</Text>
              <TextInput
                value={sku}
                onChangeText={setSku}
                autoCapitalize="characters"
                placeholder="FZ8029-900"
                placeholderTextColor="#636366"
                style={styles.input}
              />
            </View>
          </View>

          {/* Condition Selector */}
          <Text style={styles.fieldLabel}>Condition</Text>
          <View style={styles.chipRow}>
            {SNEAKER_CONDITIONS.map((item) => {
              const active = condition === item;
              return (
                <TouchableOpacity
                  key={item}
                  onPress={() => setCondition(item)}
                  style={[styles.chip, active && styles.chipActive]}
                >
                  <Text style={[styles.chipText, active && styles.chipTextActive]}>{item}</Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Vault Status Selector */}
          <Text style={styles.fieldLabel}>Vault Status</Text>
          <View style={styles.chipRow}>
            {SNEAKER_STATUSES.map((item) => {
              const active = status === item;
              return (
                <TouchableOpacity
                  key={item}
                  onPress={() => setStatus(item)}
                  style={[styles.chip, active && styles.chipActive]}
                >
                  <Text style={[styles.chipText, active && styles.chipTextActive]}>
                    {STATUS_LABELS[item]}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Valuation & Storage */}
          <Text style={styles.sectionLabel}>VALUATION & STORAGE</Text>
          <View style={styles.row2}>
            <View style={styles.col}>
              <Text style={styles.fieldLabel}>Purchase Price ($)</Text>
              <TextInput
                value={purchasePrice}
                onChangeText={setPurchasePrice}
                keyboardType="decimal-pad"
                placeholder="220"
                placeholderTextColor="#636366"
                style={styles.input}
              />
            </View>
            <View style={styles.col}>
              <Text style={styles.fieldLabel}>Market Value ($)</Text>
              <TextInput
                value={marketValue}
                onChangeText={setMarketValue}
                keyboardType="decimal-pad"
                placeholder="485"
                placeholderTextColor="#636366"
                style={styles.input}
              />
            </View>
          </View>

          <View style={styles.row2}>
            <View style={styles.col}>
              <Text style={styles.fieldLabel}>Storage Location</Text>
              <TextInput
                value={storageLocation}
                onChangeText={setStorageLocation}
                placeholder="Vault Shelf A1"
                placeholderTextColor="#636366"
                style={styles.input}
              />
            </View>
            <View style={styles.col}>
              <Text style={styles.fieldLabel}>Purchase Date</Text>
              <TextInput
                value={purchaseDate}
                onChangeText={setPurchaseDate}
                placeholder="YYYY-MM-DD"
                placeholderTextColor="#636366"
                style={styles.input}
              />
            </View>
          </View>

          {/* Box Condition */}
          <Text style={styles.fieldLabel}>Box Condition</Text>
          <View style={styles.chipRowWrap}>
            {BOX_CONDITIONS.map((item) => {
              const active = boxCondition === item;
              return (
                <TouchableOpacity
                  key={item}
                  onPress={() => setBoxCondition(item)}
                  style={[styles.chip, active && styles.chipActive]}
                >
                  <Text style={[styles.chipText, active && styles.chipTextActive]}>{item}</Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <Text style={styles.fieldLabel}>Collector Notes</Text>
          <TextInput
            value={notes}
            onChangeText={setNotes}
            placeholder="Lace swaps, receipt details, provenance..."
            placeholderTextColor="#636366"
            multiline
            style={[styles.input, { minHeight: 72, textAlignVertical: 'top' }]}
          />

          {/* Live Auto-Generated QR Box Tag Preview */}
          <Text style={styles.sectionLabel}>LIVE QR SHOE-BOX TAG PREVIEW</Text>
          <SneakerQRTag
            sneaker={{
              brand: brand.trim() || 'BRAND',
              model: model.trim() || 'Sneaker Model',
              colorway: colorway.trim() || 'Colorway',
              sku: sku.trim().toUpperCase() || 'SKU-000',
              size: size.trim() || '10.5',
              storageLocation: storageLocation.trim() || 'Vault',
              qrCodeData: previewQrPayload,
            }}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#0B0B0D' },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(255,255,255,0.12)',
  },
  iconBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  topTitle: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
  saveChip: {
    backgroundColor: '#C8DCD4',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 18,
    minWidth: 68,
    alignItems: 'center',
  },
  saveChipText: { color: '#000000', fontWeight: '800', fontSize: 13 },
  scrollContent: { padding: 18, paddingBottom: 56 },
  sectionLabel: {
    color: 'rgba(255,255,255,0.45)',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.4,
    marginTop: 14,
    marginBottom: 10,
  },
  photoPickerRow: { flexDirection: 'row', gap: 12 },
  photoPickerCard: {
    flex: 1,
    backgroundColor: '#16161A',
    borderRadius: 18,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  photoIconCircle: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: '#C8DCD4',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  photoPickerTitle: { color: '#FFFFFF', fontSize: 14, fontWeight: '700' },
  photoPickerSub: { color: 'rgba(255,255,255,0.5)', fontSize: 11, marginTop: 2 },
  photoPreviewBox: {
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: '#16161A',
  },
  photoPreview: { width: '100%', height: 210 },
  photoOverlayActions: {
    position: 'absolute',
    bottom: 10,
    right: 10,
    flexDirection: 'row',
    gap: 8,
  },
  photoMiniBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(0,0,0,0.72)',
    paddingHorizontal: 11,
    paddingVertical: 7,
    borderRadius: 14,
  },
  photoMiniBtnText: { color: '#FFFFFF', fontSize: 12, fontWeight: '700' },
  fieldLabel: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 6,
    marginTop: 10,
  },
  input: {
    backgroundColor: '#16161A',
    borderRadius: 12,
    paddingHorizontal: 13,
    paddingVertical: 11,
    color: '#FFFFFF',
    fontSize: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  row2: { flexDirection: 'row', gap: 10 },
  col: { flex: 1 },
  chipRow: { flexDirection: 'row', gap: 8, marginTop: 2 },
  chipRowWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 2 },
  chip: {
    paddingHorizontal: 13,
    paddingVertical: 8,
    borderRadius: 12,
    backgroundColor: '#16161A',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  chipActive: {
    backgroundColor: '#FFFFFF',
    borderColor: '#FFFFFF',
  },
  chipText: { color: 'rgba(255,255,255,0.75)', fontSize: 12, fontWeight: '700' },
  chipTextActive: { color: '#000000' },
});
