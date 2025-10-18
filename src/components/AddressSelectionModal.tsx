import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Modal,
  SafeAreaView,
} from 'react-native';
import { useAuth } from '../services/auth/AuthContext';
import { supabase } from '../services/api/supabase';

interface Address {
  id: string;
  type: string;
  street_address: string;
  landmark?: string;
  city: string;
  state: string;
  pincode: string;
  latitude?: number;
  longitude?: number;
  is_default: boolean;
}

interface Props {
  visible: boolean;
  onClose: () => void;
  onAddressSelect: (address: Address) => void;
  currentAddress?: Address | null;
}

const AddressSelectionModal: React.FC<Props> = ({
  visible,
  onClose,
  onAddressSelect,
  currentAddress,
}) => {
  const { user, isAuthenticated } = useAuth();
  const [addresses, setAddresses] = React.useState<Address[]>([]);
  const [loading, setLoading] = React.useState(true);

  const loadAddresses = async () => {
    if (!isAuthenticated || !user) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('addresses')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error loading addresses:', error);
      } else {
        setAddresses(data || []);
      }
    } catch (error) {
      console.error('Error loading addresses:', error);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    if (visible && isAuthenticated) {
      loadAddresses();
    }
  }, [visible, isAuthenticated]);

  const renderAddressItem = ({ item }: { item: Address }) => (
    <TouchableOpacity
      style={[
        styles.addressItem,
        currentAddress?.id === item.id && styles.selectedAddressItem,
      ]}
      onPress={() => {
        onAddressSelect(item);
        onClose();
      }}
    >
      <View style={styles.addressHeader}>
        <Text style={styles.addressType}>{item.type.toUpperCase()}</Text>
        {item.is_default && (
          <Text style={styles.defaultBadge}>Default</Text>
        )}
        {currentAddress?.id === item.id && (
          <Text style={styles.selectedBadge}>Selected</Text>
        )}
      </View>
      
      <Text style={styles.addressText}>
        {item.street_address}
        {item.landmark && `, ${item.landmark}`}
      </Text>
      <Text style={styles.addressText}>
        {item.city}, {item.state} - {item.pincode}
      </Text>
    </TouchableOpacity>
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.modalContainer}>
        <View style={styles.modalContent}>
          {/* Header */}
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Select Delivery Address</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Text style={styles.closeIcon}>×</Text>
            </TouchableOpacity>
          </View>

          {/* Address List */}
          {loading ? (
            <View style={styles.loadingContainer}>
              <Text>Loading addresses...</Text>
            </View>
          ) : addresses.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyIcon}>📍</Text>
              <Text style={styles.emptyTitle}>No Addresses Saved</Text>
              <Text style={styles.emptySubtitle}>
                Add your first delivery address to get started
              </Text>
            </View>
          ) : (
            <FlatList
              data={addresses}
              renderItem={renderAddressItem}
              keyExtractor={(item) => item.id}
              contentContainerStyle={styles.listContainer}
              showsVerticalScrollIndicator={false}
            />
          )}

          {/* Add New Address Button */}
          <TouchableOpacity
            style={styles.addNewButton}
            onPress={() => {
              onClose();
              // This would navigate to address screen in actual implementation
              // For now, we'll just close and let parent handle navigation
            }}
          >
            <Text style={styles.addNewIcon}>+</Text>
            <Text style={styles.addNewText}>Add New Address</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
    paddingBottom: 15,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e293b',
  },
  closeButton: {
    padding: 5,
  },
  closeIcon: {
    fontSize: 24,
    color: '#64748b',
    fontWeight: 'bold',
  },
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 20,
  },
  listContainer: {
    paddingBottom: 20,
  },
  addressItem: {
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  selectedAddressItem: {
    backgroundColor: '#f0fdf4',
    borderColor: '#16a34a',
    borderWidth: 2,
  },
  addressHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  addressType: {
    fontSize: 12,
    fontWeight: '600',
    color: '#16a34a',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  defaultBadge: {
    fontSize: 10,
    fontWeight: '600',
    color: '#ffffff',
    backgroundColor: '#16a34a',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  selectedBadge: {
    fontSize: 10,
    fontWeight: '600',
    color: '#ffffff',
    backgroundColor: '#2563eb',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  addressText: {
    fontSize: 14,
    color: '#475569',
    marginBottom: 4,
    lineHeight: 20,
  },
  addNewButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#16a34a',
    padding: 16,
    borderRadius: 12,
    marginTop: 10,
  },
  addNewIcon: {
    fontSize: 18,
    color: '#ffffff',
    fontWeight: 'bold',
    marginRight: 8,
  },
  addNewText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default AddressSelectionModal;