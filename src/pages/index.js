import "../pages/index.css";
import Api from "../utils/Api.js";
import { enableValidation, config as validationConfig, resetValidation, disableButton } from "../scripts/validation.js";

// ========== API INITIALIZATION ==========
const api = new Api({
  baseUrl: "https://around-api.en.tripleten-services.com/v1",
  headers: {
    authorization: "1948f53a-f1c5-4712-8302-5f7aa65616ae",
    "Content-Type": "application/json"
  }
});

// ========== DOM SELECTORS ==========
// Profile Elements
const profileNameEl = document.querySelector(".profile__name");
const profileDescriptionEl = document.querySelector(".profile__description");
const profileAvatarEl = document.querySelector(".profile__avatar");

// Edit Profile Modal
const editProfileBtn = document.querySelector(".profile__edit-button");
const editProfileModal = document.querySelector("#edit-profile-modal");
const editProfileCloseBtn = editProfileModal.querySelector(".modal__close-btn");
const editProfileForm = document.querySelector("#edit-profile-form");
const editProfileNameInput = editProfileModal.querySelector("#profile-name-input");
const editProfileDescriptionInput = editProfileModal.querySelector("#profile-description-input");

// Avatar Edit Modal
const avatarEditBtn = document.querySelector(".profile__avatar-btn");
const avatarEditModal = document.querySelector("#edit-avatar-modal");
const avatarEditCloseBtn = avatarEditModal.querySelector(".modal__close-btn");
const avatarForm = document.querySelector("#edit-avatar-form");
const avatarInput = avatarEditModal.querySelector("#profile-avatar-input");

// New Post Modal
const newPostBtn = document.querySelector(".profile__add-button");
const newPostModal = document.querySelector("#new-post-modal");
const newPostCloseBtn = newPostModal.querySelector(".modal__close-btn");
const addCardFormElement = newPostModal.querySelector("#card-form");
const cardSubmitBtn = newPostModal.querySelector(".modal__submit-btn");
const captionInput = newPostModal.querySelector("#card-caption-input");
const imageUrlInput = newPostModal.querySelector("#card-image-input");

// Preview Modal
const previewModal = document.querySelector("#preview-modal");
const previewModalCloseBtn = previewModal.querySelector(".modal__close-btn");
const previewImageEl = previewModal.querySelector(".modal__image");
const previewCaptionEl = previewModal.querySelector(".modal__caption");

// Cards
const cardTemplate = document.querySelector("#card-template").content.querySelector(".card");
const cardsList = document.querySelector(".cards__list");

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

// ========== CARD FUNCTIONS ==========
function getCardElement(data) {
  const cardElement = cardTemplate.cloneNode(true);
  const cardTitleEl = cardElement.querySelector(".card__title");
  const cardImageEl = cardElement.querySelector(".card__image");

  cardImageEl.src = data.link;
  cardImageEl.alt = data.name;
  cardTitleEl.textContent = data.name;

  const cardLikeBtnEl = cardElement.querySelector(".card__like-button");
  cardLikeBtnEl.addEventListener("click", () => {
    cardLikeBtnEl.classList.toggle("card__like-button_active");
  });

  const cardDeleteBtnEl = cardElement.querySelector(".card__delete-button");
  cardDeleteBtnEl.addEventListener("click", () => {
    cardElement.remove();
  });

  cardImageEl.addEventListener("click", () => {
    previewImageEl.src = data.link;
    previewImageEl.alt = data.name;
    previewCaptionEl.textContent = data.name;
    openModal(previewModal);
  });

  return cardElement;
}

function handleCardSubmit(evt) {
  evt.preventDefault();
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
    .catch(console.error);
}

// ========== EVENT LISTENERS: MODALS ==========
const modals = document.querySelectorAll(".modal");
modals.forEach((modal) => {
  modal.addEventListener("mousedown", (evt) => {
    if (evt.target.classList.contains("modal")) {
      closeModal(modal);
    }
  });
});

// ========== EVENT LISTENERS: EDIT PROFILE ==========
editProfileBtn.addEventListener("click", function () {
  editProfileNameInput.value = profileNameEl.textContent;
  editProfileDescriptionInput.value = profileDescriptionEl.textContent;
  resetValidation(editProfileForm, [editProfileNameInput, editProfileDescriptionInput]);
  openModal(editProfileModal);
});

editProfileCloseBtn.addEventListener("click", function () {
  closeModal(editProfileModal);
});

function handleEditProfileSubmit(evt) {
  evt.preventDefault();
  api.editUserInfo({
    name: editProfileNameInput.value,
    about: editProfileDescriptionInput.value
  })
    .then((data) => {
      profileNameEl.textContent = data.name;
      profileDescriptionEl.textContent = data.about;
      closeModal(editProfileModal);
    })
    .catch(console.error);
}

editProfileForm.addEventListener("submit", handleEditProfileSubmit);

// ========== EVENT LISTENERS: AVATAR EDIT ==========
avatarEditBtn.addEventListener("click", function () {
  avatarInput.value = profileAvatarEl.src;
  resetValidation(avatarForm, [avatarInput]);
  openModal(avatarEditModal);
});

avatarEditCloseBtn.addEventListener("click", function () {
  closeModal(avatarEditModal);
});

avatarForm.addEventListener("submit", handleAvatarSubmit);
function handleAvatarSubmit(evt) {
  evt.preventDefault();
  api.editUserInfo({ avatar: avatarInput.value })
    .then((data) => {
      profileAvatarEl.src = data.avatar;
      closeModal(avatarEditModal);
    })
    .catch(console.error);
}

// ========== EVENT LISTENERS: NEW POST ==========
newPostBtn.addEventListener("click", function () {
  openModal(newPostModal);
});

newPostCloseBtn.addEventListener("click", function () {
  closeModal(newPostModal);
});

addCardFormElement.addEventListener("submit", handleCardSubmit);

// ========== EVENT LISTENERS: PREVIEW ==========
previewModalCloseBtn.addEventListener('click', () => closeModal(previewModal));

// ========== INITIALIZATION ==========
enableValidation(validationConfig);

api.getAppInfo()
  .then(([cards, userInfo]) => {
    profileNameEl.textContent = userInfo.name;
    profileDescriptionEl.textContent = userInfo.about;
    profileAvatarEl.src = userInfo.avatar;
    cards.forEach(function (item) {
      const cardElement = getCardElement(item);
      cardsList.append(cardElement);
    });
  })
  .catch(console.error);

