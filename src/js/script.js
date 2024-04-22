'use strict';

// ---------- IMPORTS

import { BASE_URL, options } from './pixabay-api';
import axios from 'axios';
import { Notify } from 'notiflix/build/notiflix-aio.js';
import simpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';
import AOS from 'aos';
import 'aos/dist/aos.css';

// ---------- DECLARATIONS

const galleryEl = document.querySelector('.gallery');
const searchInputEl = document.querySelector('input[name="searchQuery"]');
const searchFormEl = document.getElementById('search-form');

let reachEnd = options.params.reachEnd;
let totalHits = 0;

const lightbox = new simpleLightbox('.lightbox', {
  captionsData: 'alt',
  captionDelay: 250,
});

AOS.init();

// ---------- FUNCTIONS

function renderGallery(hits) {
  let markup = hits
    .map(
      ({
        webformatURL,
        largeImageURL,
        tags,
        likes,
        views,
        comments,
        downloads,
      }) => {
        return `
        <a href="${largeImageURL}" class='lightbox' >
          <div class="photo-card" data-aos="flip-up">
            <div class="flip-card">
              <div class="flip-card-inner">
                <div class="flip-card-front">
                  <img src="${webformatURL}" alt="${tags}" loading="lazy" />
                </div>
                <div class="flip-card-back">
                  <img class="flip-photo" src="${webformatURL}" alt="${tags}" loading="lazy" />
                </div>
              </div>
            </div>
            <div class="info">
            <p class="info-item">
                <b>Likes</b>
                ${likes}
            </p>
            <p class="info-item">
                <b>Views</b>
                ${views}
            </p>
            <p class="info-item">
                <b>Comments</b>
                ${comments}
            </p>
            <p class="info-item">
                <b>Downloads</b>
                ${downloads}
            </p>
            </div>
          </div>
        </a>
        `;
      }
    )
    .join('');

  galleryEl.insertAdjacentHTML('beforeend', markup);
  //--If the user has reached the end of the collection
  if (options.params.fetchedPhotoNumber >= options.params.totalPhotoNumber) {
    let reachEnd = true;
    options.params.reachEnd = true;
    if (!reachEnd) {
      Notify.info(
        "We are sorry but you've reached the end of the search result"
      );
    }
  }

  //--Show Simple Lightbox Gallery
  lightbox.refresh();
  //--Re-Initialize AOS
  AOS.refresh();
}

async function handleSubmit(e) {
  e.preventDefault();

  options.params.q = searchInputEl.value.trim();
  if (options.params.q === '') {
    return;
  } else if (options.params.q !== undefined) {
    initializeParam();
  }

  galleryEl.innerHTML = '';

  try {
    const res = await axios.get(BASE_URL, options);
    totalHits = res.data.totalHits;

    const { hits } = res.data;

    if (hits.length === 0) {
      Notify.failure('Sorry, there are no image matching your search query');
    } else {
      Notify.success(`Hooray! We found ${totalHits} images`);

      options.params.fetchedPhotoNumber += hits.length;
      options.params.totalPhotoNumber = totalHits;
      renderGallery(hits);
    }

    searchInputEl.value = '';
  } catch (e) {
    Notify.failure(e);
  }
}

async function loadMore() {
  if (reachEnd != true) {
    options.params.page += 1;

    try {
      const res = await axios.get(BASE_URL, options);
      totalHits = res.data.totalHits;

      const { hits } = res.data;
      options.params.fetchedPhotoNumber += hits.length;
      options.params.totalPhotoNumber = totalHits;
      Notify.success(`Displaying ${options.params.fetchedPhotoNumber} images`);

      renderGallery(hits);
    } catch (e) {
      Notify.failure(e);
    }
  }
}

function handleScroll() {
  const { scrollTop, scrollHeight, clientHeight } = document.documentElement;
  if (scrollTop + clientHeight >= scrollHeight-1) {
    reachEnd = options.params.reachEnd;
    if (reachEnd != true) {
      loadMore();
    }
  }
  if (scrollTop + clientHeight >= scrollHeight && reachEnd == true) {
    Notify.info("We are sorry but you've reached the end of the search result");
  }
}

function initializeParam() {
  options.params.fetchedPhotoNumber = 0;
  options.params.totalPhotoNumber = 0;
  options.params.page = 1;
  options.params.reachEnd = false;
}

// ---------- EVENT LISTENERS

searchFormEl.addEventListener('submit', handleSubmit);
window.addEventListener('scroll', handleScroll);
