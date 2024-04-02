export const BASE_URL = 'https://pixabay.com/api/';
const API_KEY = '43080436-86185ca2978a6bea9a8d210cd';

export const options = {
  params: {
    key: API_KEY,
    q: '',
    image_type: 'photo',
    orientation: 'horizontal',
    safesearch: true,
    page: 1,
    per_page: 40,
    fetchedPhotoNumber: 0,
    totalPhotoNumber: 0,
    reachEnd: false,
  },
};
