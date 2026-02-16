import React, { useState, useEffect, useRef } from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Dimensions,
  Platform,
  ActivityIndicator,
} from "react-native";
import { Camera } from "expo-camera";
import {
  X,
  Zap,
  ZapOff,
  Camera as CameraIcon,
  RefreshCw,
  Box,
} from "lucide-react-native";
import { Theme } from "../styles/DesignSystem";
import { useApi } from "../services/api";

const { width, height } = Dimensions.get("window");

export default function ScannerScreen({ navigation }) {
  const [hasPermission, setHasPermission] = useState(null);
  const [type, setType] = useState(Camera.Constants.Type.back);
  const [flash, setFlash] = useState(Camera.Constants.FlashMode.off);
  const [scanned, setScanned] = useState(false);
  const [loading, setLoading] = useState(false);
  const cameraRef = useRef(null);
  const api = useApi();

  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === "granted");
    })();
  }, []);

  const handleBarCodeScanned = async ({ type, data }) => {
    if (scanned) return;
    setScanned(true);
    setLoading(true);

    try {
      const result = await api.get(`/items/barcode-lookup?code=${data}`);
      navigation.navigate("AddItem", {
        barcode: data,
        suggestedName: result?.name || "",
        scanned: true,
      });
    } catch (error) {
      console.error("Barcode lookup failed:", error);
      navigation.navigate("AddItem", {
        barcode: data,
        suggestedName: "",
        scanned: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const takePicture = async () => {
    if (cameraRef.current) {
      const photo = await cameraRef.current.takePictureAsync({ quality: 0.5 });
      setLoading(true);
      try {
        const formData = new FormData();
        formData.append("image", {
          uri: photo.uri,
          type: "image/jpeg",
          name: "capture.jpg",
        });
        const result = await api.post("/items/vision-identify", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        navigation.navigate("AddItem", {
          photoUri: photo.uri,
          suggestedName: result?.name || "",
          scanned: true,
        });
      } catch (error) {
        console.error("Vision identify failed:", error);
        navigation.navigate("AddItem", {
          photoUri: photo.uri,
          suggestedName: "",
          scanned: true,
        });
      } finally {
        setLoading(false);
      }
    }
  };

  if (hasPermission === null) {
    return (
      <View style={styles.container}>
        <ActivityIndicator color={Theme.colors.primary} />
      </View>
    );
  }
  if (hasPermission === false) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>NO CAMERA ACCESS</Text>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.linkText}>RETURN TO OPS HUB</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Camera
        ref={cameraRef}
        style={styles.camera}
        type={type}
        flashMode={flash}
        onBarCodeScanned={scanned ? undefined : handleBarCodeScanned}
      >
        {/* Overlay Overlay */}
        <View style={styles.overlay}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              style={styles.roundButton}
            >
              <X color="#FFF" size={24} />
            </TouchableOpacity>
            <View>
              <Text style={styles.headerTitle}>SCANNER LINK</Text>
              <Text style={styles.headerStatus}>READY FOR CAPTURE</Text>
            </View>
            <TouchableOpacity
              onPress={() =>
                setFlash(
                  flash === Camera.Constants.FlashMode.off
                    ? Camera.Constants.FlashMode.torch
                    : Camera.Constants.FlashMode.off,
                )
              }
              style={styles.roundButton}
            >
              {flash === Camera.Constants.FlashMode.off ? (
                <ZapOff color="#FFF" size={20} />
              ) : (
                <Zap color={Theme.colors.primary} size={20} />
              )}
            </TouchableOpacity>
          </View>

          {/* Scanner Framing */}
          <View style={styles.frameContainer}>
            <View style={styles.frame}>
              <View style={[styles.corner, styles.topLeft]} />
              <View style={[styles.corner, styles.topRight]} />
              <View style={[styles.corner, styles.bottomLeft]} />
              <View style={[styles.corner, styles.bottomRight]} />

              {scanned && (
                <View style={styles.scannedOverlay}>
                  <ActivityIndicator
                    color={Theme.colors.primary}
                    size="large"
                  />
                  <Text style={styles.scanningText}>DECODING ASSET...</Text>
                </View>
              )}
            </View>
            <Text style={styles.hint}>ALIGN BARCODE OR PRODUCT IN FRAME</Text>
          </View>

          {/* Controls */}
          <View style={styles.footer}>
            <TouchableOpacity
              style={styles.flipButton}
              onPress={() =>
                setType(
                  type === Camera.Constants.Type.back
                    ? Camera.Constants.Type.front
                    : Camera.Constants.Type.back,
                )
              }
            >
              <RefreshCw color="#FFF" size={24} />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.captureButton}
              onPress={takePicture}
            >
              <View style={styles.captureInner}>
                <CameraIcon color={Theme.colors.background} size={32} />
              </View>
            </TouchableOpacity>

            <TouchableOpacity style={styles.galleryButton}>
              <Box color="#FFF" size={24} />
            </TouchableOpacity>
          </View>
        </View>
      </Camera>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  camera: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.3)",
    justifyContent: "space-between",
    paddingVertical: Platform.OS === "ios" ? 60 : 40,
    paddingHorizontal: 25,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerTitle: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "900",
    letterSpacing: 2,
    textAlign: "center",
  },
  headerStatus: {
    color: Theme.colors.primary,
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 2,
    textAlign: "center",
    opacity: 0.8,
  },
  roundButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
  },
  frameContainer: {
    alignItems: "center",
    justifyContent: "center",
  },
  frame: {
    width: width * 0.7,
    height: width * 0.7,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
    position: "relative",
    justifyContent: "center",
    alignItems: "center",
  },
  corner: {
    position: "absolute",
    width: 30,
    height: 30,
    borderColor: Theme.colors.primary,
  },
  topLeft: {
    top: -2,
    left: -2,
    borderTopWidth: 4,
    borderLeftWidth: 4,
  },
  topRight: {
    top: -2,
    right: -2,
    borderTopWidth: 4,
    borderRightWidth: 4,
  },
  bottomLeft: {
    bottom: -2,
    left: -2,
    borderBottomWidth: 4,
    borderLeftWidth: 4,
  },
  bottomRight: {
    bottom: -2,
    right: -2,
    borderBottomWidth: 4,
    borderRightWidth: 4,
  },
  hint: {
    color: "#FFF",
    fontSize: 10,
    fontWeight: "900",
    marginTop: 30,
    letterSpacing: 1,
    opacity: 0.6,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 10,
  },
  captureButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    padding: 6,
  },
  captureInner: {
    flex: 1,
    borderRadius: 34,
    backgroundColor: Theme.colors.primary,
    justifyContent: "center",
    alignItems: "center",
  },
  flipButton: {
    width: 44,
    height: 44,
    justifyContent: "center",
    alignItems: "center",
  },
  galleryButton: {
    width: 44,
    height: 44,
    justifyContent: "center",
    alignItems: "center",
  },
  scannedOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.8)",
    justifyContent: "center",
    alignItems: "center",
    gap: 16,
  },
  scanningText: {
    color: Theme.colors.primary,
    fontSize: 12,
    fontWeight: "900",
    letterSpacing: 2,
  },
  errorText: {
    color: Theme.colors.error,
    fontSize: 14,
    fontWeight: "900",
    marginBottom: 20,
  },
  linkText: {
    color: Theme.colors.primary,
    fontWeight: "900",
    textDecorationLine: "underline",
  },
});
