import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  Modal,
  TextInput,
  ScrollView,
  ActivityIndicator
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const HouseholdManagerScreen = ({ navigation, route }) => {
  const { user } = route.params;
  const [households, setHouseholds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [joinModalVisible, setJoinModalVisible] = useState(false);
  const [newHouseholdName, setNewHouseholdName] = useState('');
  const [joinCode, setJoinCode] = useState('');
  const [selectedHousehold, setSelectedHousehold] = useState(null);

  useEffect(() => {
    loadHouseholds();
  }, []);

  const loadHouseholds = async () => {
    try {
      setLoading(true);
      // API call to get user's households
      const response = await fetch(`/api/users/${user.id}/households`);
      const data = await response.json();
      setHouseholds(data);
    } catch (error) {
      Alert.alert('Error', 'Failed to load households');
    } finally {
      setLoading(false);
    }
  };

  const createHousehold = async () => {
    if (!newHouseholdName.trim()) {
      Alert.alert('Error', 'Please enter a household name');
      return;
    }

    try {
      const response = await fetch('/api/households', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: newHouseholdName,
          timezone: 'UTC',
          currency: 'USD'
        })
      });

      if (response.ok) {
        setModalVisible(false);
        setNewHouseholdName('');
        loadHouseholds();
        Alert.alert('Success', 'Household created successfully');
      } else {
        Alert.alert('Error', 'Failed to create household');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to create household');
    }
  };

  const joinHousehold = async () => {
    if (!joinCode.trim()) {
      Alert.alert('Error', 'Please enter a join code');
      return;
    }

    try {
      const response = await fetch('/api/households/join', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          joinCode: joinCode.trim()
        })
      });

      if (response.ok) {
        setJoinModalVisible(false);
        setJoinCode('');
        loadHouseholds();
        Alert.alert('Success', 'Joined household successfully');
      } else {
        Alert.alert('Error', 'Invalid join code');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to join household');
    }
  };

  const leaveHousehold = async (householdId) => {
    Alert.alert(
      'Leave Household',
      'Are you sure you want to leave this household?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Leave',
          style: 'destructive',
          onPress: async () => {
            try {
              const response = await fetch(`/api/households/${householdId}/leave`, {
                method: 'POST'
              });

              if (response.ok) {
                loadHouseholds();
                Alert.alert('Success', 'Left household successfully');
              } else {
                Alert.alert('Error', 'Failed to leave household');
              }
            } catch (error) {
              Alert.alert('Error', 'Failed to leave household');
            }
          }
        }
      ]
    );
  };

  const selectHousehold = (household) => {
    setSelectedHousehold(household);
    navigation.navigate('Dashboard', { household, user });
  };

  const renderHouseholdItem = ({ item }) => (
    <TouchableOpacity
      style={styles.householdItem}
      onPress={() => selectHousehold(item)}
    >
      <View style={styles.householdInfo}>
        <Text style={styles.householdName}>{item.name}</Text>
        <Text style={styles.householdRole}>Role: {item.UserHousehold?.role?.name}</Text>
        <Text style={styles.householdMembers}>
          {item.userCount || 0} members • {item.subscriptionTier || 'free'} tier
        </Text>
      </View>
      <View style={styles.householdActions}>
        <TouchableOpacity
          style={styles.selectButton}
          onPress={() => selectHousehold(item)}
        >
          <Ionicons name="chevron-forward" size={20} color="#007AFF" />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.leaveButton}
          onPress={() => leaveHousehold(item.id)}
        >
          <Ionicons name="exit-outline" size={20} color="#FF3B30" />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Loading households...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>My Households</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => setJoinModalVisible(true)}
          >
            <Ionicons name="person-add-outline" size={24} color="#007AFF" />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => setModalVisible(true)}
          >
            <Ionicons name="add-circle-outline" size={24} color="#007AFF" />
          </TouchableOpacity>
        </View>
      </View>

      <FlatList
        data={households}
        renderItem={renderHouseholdItem}
        keyExtractor={(item) => item.id}
        style={styles.list}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="home-outline" size={48} color="#C7C7CC" />
            <Text style={styles.emptyText}>No households yet</Text>
            <Text style={styles.emptySubtext}>
              Create a new household or join an existing one
            </Text>
          </View>
        }
      />

      {/* Create Household Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Create New Household</Text>
            <TextInput
              style={styles.input}
              placeholder="Household name"
              value={newHouseholdName}
              onChangeText={setNewHouseholdName}
              autoFocus
            />
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.button, styles.cancelButton]}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.button, styles.createButton]}
                onPress={createHousehold}
              >
                <Text style={styles.createButtonText}>Create</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Join Household Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={joinModalVisible}
        onRequestClose={() => setJoinModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Join Household</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter join code"
              value={joinCode}
              onChangeText={setJoinCode}
              autoFocus
            />
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.button, styles.cancelButton]}
                onPress={() => setJoinModalVisible(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.button, styles.createButton]}
                onPress={joinHousehold}
              >
                <Text style={styles.createButtonText}>Join</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#8E8E93',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000000',
  },
  headerActions: {
    flexDirection: 'row',
  },
  actionButton: {
    marginLeft: 16,
    padding: 8,
  },
  list: {
    flex: 1,
  },
  householdItem: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginVertical: 8,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  householdInfo: {
    flex: 1,
  },
  householdName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 4,
  },
  householdRole: {
    fontSize: 14,
    color: '#8E8E93',
    marginBottom: 2,
  },
  householdMembers: {
    fontSize: 12,
    color: '#8E8E93',
  },
  householdActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  selectButton: {
    padding: 8,
    marginRight: 8,
  },
  leaveButton: {
    padding: 8,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#8E8E93',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#C7C7CC',
    marginTop: 8,
    textAlign: 'center',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    margin: 20,
    padding: 24,
    borderRadius: 12,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: '#E5E5EA',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 20,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    marginLeft: 12,
  },
  cancelButton: {
    backgroundColor: '#F2F2F7',
  },
  cancelButtonText: {
    color: '#007AFF',
    fontSize: 16,
    fontWeight: '600',
  },
  createButton: {
    backgroundColor: '#007AFF',
  },
  createButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default HouseholdManagerScreen;
