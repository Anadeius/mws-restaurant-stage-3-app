import DBHelper from "./dbhelper";
import dbPromise from "./dbHandler"

function markFavorite() {
	const id = Number(this.dataset.id);
	const favStatus = this.getAttribute('aria-pressed') == 'true';
	this.setAttribute('aria-pressed', !favStatus);
	
	/*return fetch(`${DBHelper.DATABASE_URL}/${id}/?is_favorite=${!favStatus}`, { method: 'PUT' })
				.then((response) => response.json())
				.then((favoritedRestaurant) => {
				  dbPromise.storeRestaurants(favoritedRestaurant);
				  this.setAttribute('aria-pressed', !favStatus);
				});*/

	dbPromise.db.then((db) => {
		const restaurantStore = db.transaction('restaurants', 'readwrite').objectStore('restaurants');
		
		restaurantStore.get(id).then((restaurant) => {
			const updatedTimestamp = new Date().toISOString();
			restaurant.is_favorite = !favStatus;
			restaurant.updatedAt = updatedTimestamp; 
			restaurantStore.put(restaurant);
		});
	
		return restaurantStore.complete;
	}).catch((err) => {
		console.log(`Error storing favorite status in Restaurant IDB. Error: ${err}`);
	});

	return dbPromise.db.then((db) => {
		const offlineFavoritesStore = db.transaction('offlineFavorites', 'readwrite').objectStore('offlineFavorites');
		offlineFavoritesStore.put({ 'id': id, 'isFavorite': !favStatus });
		return offlineFavoritesStore.complete;
	}).then(() => {
		navigator.serviceWorker.ready.then((worker) => {
			worker.sync.register('syncOfflineFavorites');
		}).catch((err) => {
			console.log(`Could not register Favorites Sync. Error: ${err}`);
		});
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