import "../pages/index.css";
import Api from "../utils/Api.js";
import { enableValidation, config as validationConfig, resetValidation, disableButton } from "../scripts/validation.js";

// ========== IMAGE IMPORTS ==========
import logoSrc from "../images/spots-images/Logo.svg";
import avatarSrc from "../images/spots-images/avatar.jpg";
import pencilIconSrc from "../images/spots-images/pencil-light.svg";
import penIconSrc from "../images/spots-images/pen-icon.svg";
import plusIconSrc from "../images/spots-images/plus-icon.svg";

// ========== API INITIALIZATION ==========
const api = new Api({
  baseUrl: "https://around-api.en.tripleten-services.com/v1",
  headers: {
    authorization: "1948f53a-f1c5-4712-8302-5f7aa65616ae",
    "Content-Type": "application/json"
  }
});

// ========== CONSTANTS ==========
const isLikedClass = "card__like-button_active";

// ========== STATE VARIABLES ==========
let currentUser = null;

// ========== DOM SELECTORS ==========
// Profile
const profileNameEl = document.querySelector(".profile__name");
const profileDescriptionEl = document.querySelector(".profile__description");
const profileAvatarEl = document.querySelector(".profile__avatar");
const editProfileBtn = document.querySelector(".profile__edit-button");
const avatarEditBtn = document.querySelector(".profile__avatar-btn");
const newPostBtn = document.querySelector(".profile__add-button");

// Cards
const cardTemplate = document.querySelector("#card-template").content.querySelector(".card");
const cardsList = document.querySelector(".cards__list");

// Modals
const editProfileModal = document.querySelector("#edit-profile-modal");
const editProfileForm = document.querySelector("#edit-profile-form");
const editProfileCloseBtn = editProfileModal.querySelector(".modal__close-btn");
const editProfileNameInput = editProfileModal.querySelector("#profile-name-input");
const editProfileDescriptionInput = editProfileModal.querySelector("#profile-description-input");

const avatarEditModal = document.querySelector("#edit-avatar-modal");
const avatarForm = document.querySelector("#edit-avatar-form");
const avatarEditCloseBtn = avatarEditModal.querySelector(".modal__close-btn");
const avatarInput = avatarEditModal.querySelector("#profile-avatar-input");

const newPostModal = document.querySelector("#new-post-modal");
const addCardFormElement = newPostModal.querySelector("#card-form");
const newPostCloseBtn = newPostModal.querySelector(".modal__close-btn");
const cardSubmitBtn = newPostModal.querySelector(".modal__submit-btn");
const captionInput = newPostModal.querySelector("#card-caption-input");
const imageUrlInput = newPostModal.querySelector("#card-image-input");

const deleteModal = document.querySelector("#delete-modal");
const deleteForm = document.querySelector("#delete-form");
const deleteModalCloseBtn = deleteModal.querySelector(".modal__close-btn");
const deleteConfirmBtn = deleteForm.querySelector(".modal__delete-btn");
const deleteCancelBtn = deleteForm.querySelector(".modal__cancel-btn");

const previewModal = document.querySelector("#preview-modal");
const previewModalCloseBtn = previewModal.querySelector(".modal__close-btn");
const previewImageEl = previewModal.querySelector(".modal__image");
const previewCaptionEl = previewModal.querySelector(".modal__caption");

// State Variables
let selectedCard;
let selectedCardId;

// ========== MODAL FUNCTIONS ==========
function handleEscapeKey(evt) {
  if (evt.key === "Escape") {
    const openedModalEl = document.querySelector(".modal_is-opened");
    if (openedModalEl) closeModal(openedModalEl);
  }
}

function openModal(modal) {
  modal.classList.add("modal_is-opened");
  document.addEventListener("keydown", handleEscapeKey);
}

function closeModal(modal) {
  modal.classList.remove("modal_is-opened");
  document.removeEventListener("keydown", handleEscapeKey);
}

// ========== UTILITY FUNCTIONS ==========
function renderLoading(button, isLoading, loadingText = "Saving...") {
  if (isLoading) {
    button.dataset.originalText = button.textContent;
    button.textContent = loadingText;
  } else {
    button.textContent = button.dataset.originalText;
  }
}

// ========== CARD FUNCTIONS ==========
function handleLikeButtonClick(cardId, cardLikeBtnEl) {
  const isLiked = cardLikeBtnEl.classList.contains(isLikedClass);
  const likeAction = isLiked ? api.removeLike(cardId) : api.addLike(cardId);

  likeAction
    .then((updatedCard) => {
      const isCardLiked = updatedCard.likes.some(user => user._id === currentUser._id);
      if (isCardLiked) {
        cardLikeBtnEl.classList.add(isLikedClass);
      } else {
        cardLikeBtnEl.classList.remove(isLikedClass);
      }
    })
    .catch(console.error);
}

function handleImageClick(data) {
  previewImageEl.src = data.link;
  previewImageEl.alt = data.name;
  previewCaptionEl.textContent = data.name;
  openModal(previewModal);
}

function getCardElement(data) {
  const cardElement = cardTemplate.cloneNode(true);
  const cardTitleEl = cardElement.querySelector(".card__title");
  const cardImageEl = cardElement.querySelector(".card__image");
  const cardLikeBtnEl = cardElement.querySelector(".card__like-button");
  const cardDeleteBtnEl = cardElement.querySelector(".card__delete-button");

  cardImageEl.src = data.link;
  cardImageEl.alt = data.name;
  cardTitleEl.textContent = data.name;

  // Set initial like state
  const isLiked = data.likes.some(user => user._id === currentUser._id);
  if (isLiked) {
    cardLikeBtnEl.classList.add(isLikedClass);
  }

  // Show delete button only for cards owned by current user
  if (data.owner._id !== currentUser._id) {
    cardDeleteBtnEl.style.display = "none";
  }

  cardLikeBtnEl.addEventListener("click", () => handleLikeButtonClick(data._id, cardLikeBtnEl));
  cardDeleteBtnEl.addEventListener("click", () => handleDeleteCard(cardElement, data._id));
  cardImageEl.addEventListener("click", () => handleImageClick(data));

  return cardElement;
}

function handleDeleteCard(cardElement, cardId) {
  selectedCard = cardElement;
  selectedCardId = cardId;
  openModal(deleteModal);
}

function handleDeleteSubmit(evt) {
  evt.preventDefault();
  renderLoading(deleteConfirmBtn, true, "Deleting...");

  api
    .deleteCard(selectedCardId)
    .then(() => {
      selectedCard.remove();
      closeModal(deleteModal);
      selectedCard = null;
      selectedCardId = null;
    })
    .catch(console.error)
    .finally(() => {
      renderLoading(deleteConfirmBtn, false);
    });
}

function handleCardSubmit(evt) {
  evt.preventDefault();
  renderLoading(cardSubmitBtn, true);

  const inputValues = {
    name: captionInput.value,
    link: imageUrlInput.value,
  };

  api.addCard(inputValues)
    .then((cardData) => {
      const cardElement = getCardElement(cardData);
      cardsList.prepend(cardElement);
      addCardFormElement.reset();
      closeModal(newPostModal);
      disableButton(cardSubmitBtn, validationConfig);
    })
    .catch(console.error)
    .finally(() => {
      renderLoading(cardSubmitBtn, false);
    });
}

// ========== FORM SUBMIT HANDLERS ==========
function handleEditProfileSubmit(evt) {
  evt.preventDefault();
  const submitButton = editProfileForm.querySelector(".modal__submit-btn");
  renderLoading(submitButton, true);

  api.editUserInfo({
    name: editProfileNameInput.value,
    about: editProfileDescriptionInput.value
  })
    .then((data) => {
      profileNameEl.textContent = data.name;
      profileDescriptionEl.textContent = data.about;
      closeModal(editProfileModal);
    })
    .catch(console.error)
    .finally(() => {
      renderLoading(submitButton, false);
    });
}

function handleAvatarSubmit(evt) {
  evt.preventDefault();
  const submitButton = avatarForm.querySelector(".modal__submit-btn");
  renderLoading(submitButton, true);

  api.editAvatarInfo(avatarInput.value)
    .then((data) => {
      profileAvatarEl.src = data.avatar;
      closeModal(avatarEditModal);
    })
    .catch(console.error)
    .finally(() => {
      renderLoading(submitButton, false);
    });
}

// ========== EVENT LISTENERS ==========
// Modal Overlay Clicks
const modals = document.querySelectorAll(".modal");
modals.forEach((modal) => {
  modal.addEventListener("mousedown", (evt) => {
    if (evt.target.classList.contains("modal")) {
      closeModal(modal);
    }
  });
});

// Edit Profile Modal
editProfileBtn.addEventListener("click", () => {
  editProfileNameInput.value = profileNameEl.textContent;
  editProfileDescriptionInput.value = profileDescriptionEl.textContent;
  resetValidation(editProfileForm, [editProfileNameInput, editProfileDescriptionInput]);
  openModal(editProfileModal);
});
editProfileCloseBtn.addEventListener("click", () => closeModal(editProfileModal));
editProfileForm.addEventListener("submit", handleEditProfileSubmit);

// Avatar Edit Modal
avatarEditBtn.addEventListener("click", () => {
  avatarInput.value = profileAvatarEl.src;
  resetValidation(avatarForm, [avatarInput]);
  openModal(avatarEditModal);
});
avatarEditCloseBtn.addEventListener("click", () => closeModal(avatarEditModal));
avatarForm.addEventListener("submit", handleAvatarSubmit);

// New Post Modal
newPostBtn.addEventListener("click", () => openModal(newPostModal));
newPostCloseBtn.addEventListener("click", () => closeModal(newPostModal));
addCardFormElement.addEventListener("submit", handleCardSubmit);

// Delete Modal
deleteModalCloseBtn.addEventListener("click", () => closeModal(deleteModal));
deleteCancelBtn.addEventListener("click", () => closeModal(deleteModal));
deleteForm.addEventListener("submit", handleDeleteSubmit);

// Preview Modal
previewModalCloseBtn.addEventListener("click", () => closeModal(previewModal));

// ========== INITIALIZATION ==========
// Set static images
document.querySelector(".header__logo").src = logoSrc;
document.querySelector(".profile__avatar").src = avatarSrc;
document.querySelector(".profile__pencil-icon").src = pencilIconSrc;
document.querySelector(".profile__edit-button img").src = penIconSrc;
document.querySelector(".profile__add-button img").src = plusIconSrc;

enableValidation(validationConfig);

api.getAppInfo()
  .then(([cards, userInfo]) => {
    // Store current user info
    currentUser = userInfo;

    // Update profile information
    profileNameEl.textContent = userInfo.name;
    profileDescriptionEl.textContent = userInfo.about;
    profileAvatarEl.src = userInfo.avatar;

    // Render initial cards
    cards.forEach((card) => {
      const cardElement = getCardElement(card);
      cardsList.append(cardElement);
    });
  })
  .catch(console.error);

