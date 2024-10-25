import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Image,
  ScrollView,
  Modal,
  TouchableWithoutFeedback,
  Button,
  Alert,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';

const ProfileScreen = () => {
  // State til at håndtere profilbillede, navn og modalens synlighed
  const [profileImage, setProfileImage] = useState(null);
  const [name, setName] = useState('');
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    // Hent profildata fra AsyncStorage ved komponentens mount
    const loadProfile = async () => {
      try {
        const profileData = await AsyncStorage.getItem('profile');
        if (profileData !== null) {
          const { profileImage, name } = JSON.parse(profileData);
          setProfileImage(profileImage);
          setName(name);
        }
      } catch (error) {
        console.error('Fejl ved indlæsning af profildata:', error);
      }
    };

    loadProfile();
  }, []);

  // Åbn modal til valg af billede
  const openModal = () => {
    setModalVisible(true);
  };

  // Luk modal
  const closeModal = () => {
    setModalVisible(false);
  };

  // Vælg billede fra biblioteket
  const pickImageFromLibrary = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (status !== 'granted') {
      Alert.alert('Tilladelse krævet', 'Tilladelse til at få adgang til billeder er påkrævet!');
      return;
    }

    const pickerResult = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!pickerResult.canceled) {
      const selectedAsset = pickerResult.assets[0];
      setProfileImage(selectedAsset.uri);
      closeModal();
    }
  };

  // Tag foto med kameraet
  const takePhotoWithCamera = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();

    if (status !== 'granted') {
      Alert.alert('Tilladelse krævet', 'Tilladelse til at bruge kameraet er påkrævet!');
      return;
    }

    const cameraResult = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!cameraResult.canceled) {
      const capturedAsset = cameraResult.assets[0];
      setProfileImage(capturedAsset.uri);
      closeModal();
    }
  };

  // Gem profildata i AsyncStorage
  const saveProfile = async () => {
    const profileData = { profileImage, name };
    try {
      await AsyncStorage.setItem('profile', JSON.stringify(profileData));
      Alert.alert('Success', 'Profil gemt!');
    } catch (error) {
      console.error('Fejl ved lagring af profildata:', error);
      Alert.alert('Fejl', 'Kunne ikke gemme profildata. Prøv igen.');
    }
  };

  // Log profilbillede URI ved ændringer
  useEffect(() => {
    console.log('Profile Image URI:', profileImage);
  }, [profileImage]);

  return (
    // Gør det muligt at trykke uden for inputfelter for at skjule tastaturet
    <ScrollView contentContainerStyle={styles.container}>
      {/* Profilbillede eller placeholder */}
      <TouchableOpacity onPress={openModal}>
        {profileImage ? (
          <Image
            source={{ uri: profileImage }}
            style={styles.profileImage}
            resizeMode="cover"
          />
        ) : (
          <View style={styles.placeholderImage}>
            <Ionicons name="person-circle-outline" size={100} color="#ccc" />
          </View>
        )}
      </TouchableOpacity>

      {/* Modal til valg mellem kamera og galleri */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={closeModal}
      >
        <TouchableWithoutFeedback onPress={closeModal}>
          <View style={styles.modalOverlay} />
        </TouchableWithoutFeedback>
        <View style={styles.modalContainer}>
          <Text style={styles.modalTitle}>Vælg billede</Text>
          <TouchableOpacity style={styles.modalButton} onPress={takePhotoWithCamera}>
            <Ionicons name="camera-outline" size={24} color="#1e90ff" />
            <Text style={styles.modalButtonText}>Tag et foto</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.modalButton} onPress={pickImageFromLibrary}>
            <Ionicons name="image-outline" size={24} color="#1e90ff" />
            <Text style={styles.modalButtonText}>Vælg fra galleri</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.cancelButton} onPress={closeModal}>
            <Text style={styles.cancelButtonText}>Annuller</Text>
          </TouchableOpacity>
        </View>
      </Modal>

      {/* Inputfelt til navn */}
      <TextInput
        style={styles.input}
        placeholder="Navn"
        value={name}
        onChangeText={setName}
      />

      {/* Gem profilknap */}
      <TouchableOpacity style={styles.saveButton} onPress={saveProfile}>
        <Text style={styles.saveButtonText}>Gem Profil</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

// Stylesheet til komponenten
const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#f0f8ff',
    alignItems: 'center',
    padding: 20,
  },
  profileImage: {
    width: 150,
    height: 150,
    borderRadius: 75,
  },
  placeholderImage: {
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: '#eee',
    justifyContent: 'center',
    alignItems: 'center',
  },
  input: {
    width: '90%',
    height: 50,
    paddingHorizontal: 15,
    marginVertical: 20,
    backgroundColor: '#fff',
    borderRadius: 10,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#ccc',
  },
  saveButton: {
    backgroundColor: '#1e90ff',
    paddingVertical: 15,
    paddingHorizontal: 50,
    borderRadius: 10,
    marginTop: 20,
  },
  saveButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContainer: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    backgroundColor: '#fff',
    padding: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#1e90ff',
    textAlign: 'center',
  },
  modalButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
  },
  modalButtonText: {
    fontSize: 16,
    color: '#1e90ff',
    marginLeft: 10,
  },
  cancelButton: {
    marginTop: 10,
    paddingVertical: 15,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    color: '#ff6347',
    fontWeight: 'bold',
  },
});

export default ProfileScreen;
// Eksporterer ProfileScreen-komponenten
