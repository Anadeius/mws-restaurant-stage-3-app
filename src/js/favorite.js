import DBHelper from "./dbhelper";
import dbPromise from "./dbHandler"

function markFavorite() {
	const id = this.dataset.id;
	const favStatus = this.getAttribute('aria-pressed') == 'true';
	
	return fetch(`${DBHelper.DATABASE_URL}/${id}/?is_favorite=${!favStatus}`, { method: 'PUT' })
				.then((response) => response.json())
				.then((favoritedRestaurant) => {
				  dbPromise.storeRestaurants(favoritedRestaurant);
				  this.setAttribute('aria-pressed', !favStatus);
				});
};

export default function favorite(restaurant) {
	const favoriteButton = document.createElement('button');
	favoriteButton.dataset.id = restaurant.id;
	favoriteButton.innerHTML = "&#x2764;";
	favoriteButton.className = "favorite";
	favoriteButton.setAttribute('aria-pressed', restaurant.is_favorite);
	favoriteButton.onclick = markFavorite;
	return favoriteButton;
}