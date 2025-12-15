class Api {
  constructor({ baseUrl, headers }) {
    this._baseUrl = baseUrl;
    this._headers = headers;
  }

  // ========== UTILITY METHOD ==========
  _handleResponse(res) {
    if (res.ok) return res.json();
    return Promise.reject(`Error: ${res.status}`);
  }

  // ========== GET REQUESTS ==========
  getAppInfo() {
    return Promise.all([this.getInitialCards(), this.getUserInfo()]);
  }

  getInitialCards() {
    return fetch(`${this._baseUrl}/cards`, {
      headers: this._headers,
    }).then((res) => {
      if (res.ok) {
        return res.json();
      }
      return Promise.reject(`Error: ${res.status}`);
    });
  }

  getUserInfo() {
    return fetch(`${this._baseUrl}/users/me`, {
      headers: this._headers,
    }).then((res) => {
      if (res.ok) {
        return res.json();
      }
      return Promise.reject(`Error: ${res.status}`);
    });
  }

  // ========== PATCH REQUESTS ==========
  editUserInfo({ name, about }) {
    return fetch(`${this._baseUrl}/users/me`, {
      method: "PATCH",
      headers: Object.assign({ "Content-Type": "application/json" }, this._headers),
      body: JSON.stringify({ name, about }),
    }).then((res) => this._handleResponse(res));
  }

  editAvatarInfo(avatar) {
    return fetch(`${this._baseUrl}/users/me/avatar`, {
      method: "PATCH",
      headers: Object.assign({ "Content-Type": "application/json" }, this._headers),
      body: JSON.stringify({ avatar }),
    }).then((res) => this._handleResponse(res));
  }

  // ========== POST REQUESTS ==========
  addCard({ name, link }) {
    return fetch(`${this._baseUrl}/cards`, {
      method: "POST",
      headers: Object.assign({ "Content-Type": "application/json" }, this._headers),
      body: JSON.stringify({ name, link }),
    }).then((res) => this._handleResponse(res));
  }

  // ========== DELETE REQUESTS ==========
  deleteCard(cardId) {
    return fetch(`${this._baseUrl}/cards/${cardId}`, {
      method: "DELETE",
      headers: this._headers,
    }).then((res) => {
      if (res.ok) {
        return res.json();
      }
      return Promise.reject(`Error: ${res.status}`);
    });
  }

  // ========== PUT REQUESTS (LIKES) ==========
  addLike(cardId) {
    return fetch(`${this._baseUrl}/cards/${cardId}/likes`, {
      method: "PUT",
      headers: this._headers,
    }).then((res) => {
      if (res.ok) {
        return res.json();
      }
      return Promise.reject(`Error: ${res.status}`);
    });
  }

  removeLike(cardId) {
    return fetch(`${this._baseUrl}/cards/${cardId}/likes`, {
      method: "DELETE",
      headers: this._headers,
    }).then((res) => {
      if (res.ok) {
        return res.json();
      }
      return Promise.reject(`Error: ${res.status}`);
    });
  }
}

export default Api;
