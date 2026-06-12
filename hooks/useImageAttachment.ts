import { useCallback, useState } from 'react';
import { Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';

/**
 * Single-image attachment for the search boxes.
 *
 * Opens the gallery filtered to images only (.png / .jpg / .jpeg / .webp / .heic …),
 * allows at most ONE file, and exposes the picked local URI. The URI is handed to the
 * search service (searchByImage / searchMultimodal → POST /api/public/search, img_emb).
 *
 * Used by app/(tabs)/browse.tsx and app/search.tsx.
 */
export function useImageAttachment() {
  const [uri, setUri] = useState<string | null>(null);
  const [picking, setPicking] = useState(false);

  /** Open the gallery and return the chosen URI (or null if cancelled / denied). */
  const pick = useCallback(async (): Promise<string | null> => {
    if (picking) return null;
    setPicking(true);
    try {
      const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!perm.granted) {
        Alert.alert(
          'Photos permission needed',
          'Enable photo access in Settings to attach an image to your search.',
        );
        return null;
      }
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],          // images only — every image-compatible file
        allowsMultipleSelection: false,  // max 1 file
        quality: 0.7,                    // smaller upload → faster embedding
        allowsEditing: true,             // let the user crop to the product
      });
      if (!result.canceled && result.assets[0]?.uri) {
        const picked = result.assets[0].uri;
        setUri(picked);
        return picked;
      }
      return null;
    } catch {
      Alert.alert('Couldn’t open your gallery', 'Please try again.');
      return null;
    } finally {
      setPicking(false);
    }
  }, [picking]);

  const clear = useCallback(() => setUri(null), []);

  return { uri, picking, pick, clear };
}
