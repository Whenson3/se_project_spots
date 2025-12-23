import "../pages/index.css";
import Api from "../utils/Api.js";
import { enableValidation, config as validationConfig, resetValidation, disableButton } from "../scripts/validation.js";

// ========== IMAGE IMPORTS ==========
import logoImage from "../images/spots-images/Logo.svg";
import avatarImage from "../images/spots-images/avatar.jpg";
import pencilIcon from "../images/spots-images/pencil-light.svg";
import penIcon from "../images/spots-images/pen-icon.svg";
import plusIcon from "../images/spots-images/plus-icon.svg";

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

  // Toggle button state optimistically for better UX
  if (isLiked) {
    cardLikeBtnEl.classList.remove(isLikedClass);
  } else {
    cardLikeBtnEl.classList.add(isLikedClass);
  }

  likeAction
    .then((updatedCard) => {
      // Defensive check: ensure updatedCard and required properties exist
      if (!updatedCard || !updatedCard.likes || !Array.isArray(updatedCard.likes)) {
        console.error("Invalid card data received from API");
        // Revert the optimistic update on error
        if (isLiked) {
          cardLikeBtnEl.classList.add(isLikedClass);
        } else {
          cardLikeBtnEl.classList.remove(isLikedClass);
        }
        return;
      }
      if (!currentUser || !currentUser._id) {
        console.error("Current user data is missing");
        // Revert the optimistic update on error
        if (isLiked) {
          cardLikeBtnEl.classList.add(isLikedClass);
        } else {
          cardLikeBtnEl.classList.remove(isLikedClass);
        }
        return;
      }

      // Verify the final state matches the API response
      const isCardLiked = updatedCard.likes.some(user => user && user._id === currentUser._id);
      if (isCardLiked) {
        cardLikeBtnEl.classList.add(isLikedClass);
      } else {
        cardLikeBtnEl.classList.remove(isLikedClass);
      }
    })
    .catch((error) => {
      console.error(error);
      // Revert the optimistic update on error
      if (isLiked) {
        cardLikeBtnEl.classList.add(isLikedClass);
      } else {
        cardLikeBtnEl.classList.remove(isLikedClass);
      }
    });
}

function handleImageClick(data) {
  // Defensive check: ensure data exists
  if (!data) {
    console.error("Card data is missing for preview");
    return;
  }

  previewImageEl.src = data.link || "";
  previewImageEl.alt = data.name || "Preview image";
  previewCaptionEl.textContent = data.name || "";
  openModal(previewModal);
}

function getCardElement(data) {
  // Defensive check: ensure data object exists
  if (!data) {
    console.error("Card data is null or undefined");
    return null;
  }

  const cardElement = cardTemplate.cloneNode(true);
  const cardTitleEl = cardElement.querySelector(".card__title");
  const cardImageEl = cardElement.querySelector(".card__image");
  const cardLikeBtnEl = cardElement.querySelector(".card__like-button");
  const cardDeleteBtnEl = cardElement.querySelector(".card__delete-button");

  // Safely set image and title with fallbacks
  cardImageEl.src = data.link || "";
  cardImageEl.alt = data.name || "Card image";
  cardTitleEl.textContent = data.name || "Untitled";

  // Set initial like state with null checks
  if (data.likes && Array.isArray(data.likes) && currentUser && currentUser._id) {
    const isLiked = data.likes.some(user => user && user._id === currentUser._id);
    if (isLiked) {
      cardLikeBtnEl.classList.add(isLikedClass);
    }
  }

  // Show delete button only for cards owned by current user
  if (data.owner && data.owner._id && currentUser && currentUser._id && data.owner._id !== currentUser._id) {
    cardDeleteBtnEl.style.display = "none";
  } else if (!data.owner || !currentUser) {
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
      // Defensive check for card data
      if (!cardData) {
        console.error("No card data returned from API");
        return;
      }

      const cardElement = getCardElement(cardData);
      if (cardElement) {
        cardsList.prepend(cardElement);
      }
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
      // Defensive check for response data
      if (!data) {
        console.error("No data returned from editUserInfo API");
        return;
      }

      profileNameEl.textContent = data.name || "Unknown User";
      profileDescriptionEl.textContent = data.about || "";
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
      // Defensive check for response data
      if (!data || !data.avatar) {
        console.error("No avatar data returned from API");
        return;
      }

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
enableValidation(validationConfig);

// Set images on page load
window.addEventListener('DOMContentLoaded', () => {
  const headerLogo = document.querySelector('.header__logo');
  const profileAvatar = document.querySelector('.profile__avatar');
  const pencilIconEl = document.querySelector('.profile__pencil-icon');
  const penIconEl = editProfileBtn.querySelector('img');
  const plusIconEl = newPostBtn.querySelector('img');

  if (headerLogo) headerLogo.src = logoImage;
  if (profileAvatar) profileAvatar.src = avatarImage;
  if (pencilIconEl) pencilIconEl.src = pencilIcon;
  if (penIconEl) penIconEl.src = penIcon;
  if (plusIconEl) plusIconEl.src = plusIcon;
});

api.getAppInfo()
  .then(([cards, userInfo]) => {
    // Defensive check: ensure userInfo exists
    if (!userInfo) {
      console.error("User info is missing from API response");
      return;
    }

    // Store current user info
    currentUser = userInfo;

    // Update profile information with fallbacks
    profileNameEl.textContent = userInfo.name || "Unknown User";
    profileDescriptionEl.textContent = userInfo.about || "";
    if (userInfo.avatar) {
      profileAvatarEl.src = userInfo.avatar;
    }

    // Render initial cards with defensive checks
    if (cards && Array.isArray(cards)) {
      cards.forEach((card) => {
        const cardElement = getCardElement(card);
        if (cardElement) {
          cardsList.append(cardElement);
        }
      });
    } else {
      console.error("Cards data is not an array or is missing");
    }
  })
  .catch(console.error);

