/**
 * Author: Domonick Mack
 * Date: 2026-11-05
 * Description: Camera and photo-library capture service returning compressed base64 data URIs.
 */

import * as ImagePicker from 'expo-image-picker';

export type PhotoSource = 'camera' | 'library';

export interface PhotoResult {
  dataUri: string | null;
  error: string | null;
}

const PICKER_OPTIONS: ImagePicker.ImagePickerOptions = {
  mediaTypes: ['images'],
  allowsEditing: true,
  aspect: [4, 3],
  // Compress aggressively so photos stay well under the API body limit
  quality: 0.5,
  base64: true,
};

/** Requests the relevant permission, returning a user-facing error when denied. */
async function ensurePermission(source: PhotoSource): Promise<string | null> {
  const result =
    source === 'camera'
      ? await ImagePicker.requestCameraPermissionsAsync()
      : await ImagePicker.requestMediaLibraryPermissionsAsync();

  if (result.granted) return null;
  return source === 'camera'
    ? 'Camera access is off. Enable it in Settings to photograph your pairs.'
    : 'Photo library access is off. Enable it in Settings to attach photos.';
}

/**
 * Captures or selects a sneaker photo.
 * Returns `{ dataUri: null, error: null }` when the user cancels.
 */
export async function pickSneakerPhoto(source: PhotoSource): Promise<PhotoResult> {
  try {
    const permissionError = await ensurePermission(source);
    if (permissionError) return { dataUri: null, error: permissionError };

    const result =
      source === 'camera'
        ? await ImagePicker.launchCameraAsync(PICKER_OPTIONS)
        : await ImagePicker.launchImageLibraryAsync(PICKER_OPTIONS);

    if (result.canceled || !result.assets?.length) return { dataUri: null, error: null };

    const asset = result.assets[0];
    if (!asset.base64) return { dataUri: null, error: 'Could not read the selected image.' };

    const mime = asset.mimeType ?? 'image/jpeg';
    return { dataUri: `data:${mime};base64,${asset.base64}`, error: null };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unable to open the camera.';
    // The iOS Simulator has no camera hardware; surface a clear message
    return {
      dataUri: null,
      error: source === 'camera' ? `${message} (Use "Library" on the Simulator.)` : message,
    };
  }
}
