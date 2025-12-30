// ========== CONFIGURATION ==========
export const config = {
  formSelector: ".modal__form",
  inputSelector: ".modal__input",
  submitButtonSelector: ".modal__submit-btn",
  inactiveButtonClass: "modal__submit-btn-error",
  inputErrorClass: "modal__input_type_error",
  errorClass: "modal__error"
};

// ========== ERROR HANDLING ==========
const showInputError = (formEl, inputEl, errorMsg) => {
  const errorMsgEl = formEl.querySelector(`#${inputEl.id}-error`);
  if (!errorMsgEl) return;
  errorMsgEl.textContent = errorMsg;
  inputEl.classList.add(config.inputErrorClass);
};

const hideInputError = (formEl, inputEl) => {
  const errorMsgEl = formEl.querySelector(`#${inputEl.id}-error`);
  if (!errorMsgEl) return;
  errorMsgEl.textContent = "";
  inputEl.classList.remove(config.inputErrorClass);
};

// ========== VALIDATION CHECKS ==========
const checkInputValidity = (formEl, inputEl) => {
  if (!inputEl.validity.valid) {
    showInputError(formEl, inputEl, inputEl.validationMessage);
  } else {
    hideInputError(formEl, inputEl);
  }
};

const hasInvalidInput = (inputList) => {
  return inputList.some((input) => !input.validity.valid);
};

// ========== BUTTON STATE ==========
const disableButton = (buttonEl, cfg) => {
  buttonEl.disabled = true;
  buttonEl.classList.add(cfg.inactiveButtonClass);
};

const enableButton = (buttonEl, cfg) => {
  buttonEl.disabled = false;
  buttonEl.classList.remove(cfg.inactiveButtonClass);
};

const toggleButtonState = (inputList, buttonEl, cfg) => {
  if (hasInvalidInput(inputList)) {
    disableButton(buttonEl, cfg);
  } else {
    enableButton(buttonEl, cfg);
  }
};

// ========== FORM RESET & INITIALIZATION ==========
const resetValidation = (formEl, inputList, cfg = config) => {
  inputList.forEach((input) => {
    hideInputError(formEl, input);
  });
  const button = formEl.querySelector(cfg.submitButtonSelector);
  if (button) toggleButtonState(inputList, button, cfg);
};

const setEventListeners = (formEl, cfg) => {
  const inputList = Array.from(formEl.querySelectorAll(cfg.inputSelector));
  const buttonElement = formEl.querySelector(cfg.submitButtonSelector);

  if (!buttonElement) return;

  toggleButtonState(inputList, buttonElement, cfg);

  inputList.forEach((inputElement) => {
    inputElement.addEventListener("input", () => {
      checkInputValidity(formEl, inputElement);
      toggleButtonState(inputList, buttonElement, cfg);
    });
  });
};

export const enableValidation = (cfg = config) => {
  const formList = document.querySelectorAll(cfg.formSelector);
  formList.forEach((formEl) => {
    setEventListeners(formEl, cfg);
  });
};

// ========== EXPORTS ==========
export { resetValidation, disableButton };
