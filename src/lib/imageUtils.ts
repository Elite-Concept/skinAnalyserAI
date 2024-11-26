const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 second

async function delay(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function retryWithBackoff<T>(
  operation: () => Promise<T>,
  retries: number = MAX_RETRIES
): Promise<T> {
  try {
    return await operation();
  } catch (error) {
    if (retries > 0) {
      await delay(RETRY_DELAY * (MAX_RETRIES - retries + 1));
      return retryWithBackoff(operation, retries - 1);
    }
    throw error;
  }
}

export async function convertImageToBase64(imageUrl: string): Promise<string> {
  try {
    const fetchImage = async () => {
      const response = await fetch(imageUrl);
      if (!response.ok) {
        throw new Error(`Failed to load image: ${response.status}`);
      }
      return response;
    };

    const response = await retryWithBackoff(fetchImage);
    const blob = await response.blob();

    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        const base64 = result.split(',')[1];
        resolve(base64);
      };
      reader.onerror = () => reject(new Error('Failed to process image'));
      reader.readAsDataURL(blob);
    });
  } catch (error) {
    console.error('Error converting image:', error);
    throw new Error('Unable to process the image. Please try again with a different photo.');
  }
}