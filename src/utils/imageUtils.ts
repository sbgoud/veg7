// Utility functions for handling images in the veg7 app

// Array of available vegetable images in assets/vegimages folder
const VEGETABLE_IMAGES = [
  require('../../assets/vegimages/download.jpeg'),
  require('../../assets/vegimages/download (1).jpeg'),
  require('../../assets/vegimages/download (2).jpeg'),
  require('../../assets/vegimages/download (3).jpeg'),
  require('../../assets/vegimages/download (4).jpeg'),
  require('../../assets/vegimages/download (5).jpeg'),
  require('../../assets/vegimages/download (6).jpeg'),
  require('../../assets/vegimages/download (7).jpeg'),
  require('../../assets/vegimages/download (8).jpeg'),
  require('../../assets/vegimages/download (9).jpeg'),
  require('../../assets/vegimages/download (10).jpeg'),
  require('../../assets/vegimages/images.jpeg'),
  require('../../assets/vegimages/images (1).jpeg'),
  require('../../assets/vegimages/images (2).jpeg'),
  require('../../assets/vegimages/images (3).jpeg'),
  require('../../assets/vegimages/images (4).jpeg'),
  require('../../assets/vegimages/images (5).jpeg'),
];

/**
 * Get a random vegetable image from the available local images
 * @returns A randomly selected vegetable image
 */
export const getRandomVegetableImage = (): any => {
  const randomIndex = Math.floor(Math.random() * VEGETABLE_IMAGES.length);
  return VEGETABLE_IMAGES[randomIndex];
};

/**
 * Get a different random vegetable image (ensures it's not the same as the current one)
 * @param currentImage The current image to avoid
 * @returns A randomly selected vegetable image different from the current one
 */
export const getRandomVegetableImageDifferent = (currentImage: any): any => {
  let newImage = getRandomVegetableImage();
  while (newImage === currentImage) {
    newImage = getRandomVegetableImage();
  }
  return newImage;
};