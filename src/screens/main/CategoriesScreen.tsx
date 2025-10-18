import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  FlatList,
  TouchableOpacity,
  Image,
  StatusBar,
  Platform,
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { supabase } from '../../services/api/supabase';
import { RootStackParamList } from '../../navigation/AppNavigator';
import { getRandomVegetableImage } from '../../utils/imageUtils';

type CategoriesScreenNavigationProp = any;

interface Category {
  id: string;
  name: string;
  description: string;
  image_url: string;
}

interface Props {
  navigation: CategoriesScreenNavigationProp;
}

const CategoriesScreen: React.FC<Props> = ({ navigation }) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('is_active', true)
        .order('sort_order');

      if (error) {
        console.error('Error loading categories:', error);
      } else {
        setCategories(data || []);
      }
    } catch (error) {
      console.error('Error loading categories:', error);
    } finally {
      setIsLoading(false);
    }
  };


  const renderCategory = ({ item }: { item: Category }) => (
    <TouchableOpacity
      style={styles.categoryCard}
      onPress={() => navigation.navigate('Products', { categoryId: item.id })}
    >
      <Image
        source={getRandomVegetableImage()}
        style={styles.categoryImage}
        resizeMode="cover"
      />
      <View style={styles.categoryInfo}>
        <Text style={styles.categoryName}>{item.name}</Text>
        <Text style={styles.categoryDescription} numberOfLines={2}>
          {item.description}
        </Text>
      </View>
    </TouchableOpacity>
  );

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text>Loading categories...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <>
      <StatusBar
        backgroundColor="transparent"
        barStyle="dark-content"
        translucent={true}
      />
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Categories</Text>
          <Text style={styles.subtitle}>Choose your favorite vegetable category</Text>
        </View>

      <FlatList
        data={categories}
        renderItem={renderCategory}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
      />
     </SafeAreaView>
   </>
 );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    paddingTop: Platform.OS === 'ios' ? 50 : 44,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  listContainer: {
    padding: 20,
  },
  categoryCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 15,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  categoryImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: 15,
  },
  categoryInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  categoryName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  categoryDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  placeholderImage: {
    backgroundColor: '#e8f5e8',
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    fontSize: 24,
  },
});

export default CategoriesScreen;