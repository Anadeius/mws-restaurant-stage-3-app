import DBHelper from './dbhelper';
import dbPromise from './dbHandler';
export default class syncHandler {
	static syncOfflineFavorites() {
		return dbPromise.db.then((db) => {
			const offlineFavoritesStore = db.transaction('offlineFavorites').objectStore('offlineFavorites');
			return offlineFavoritesStore.getAll().then((favorites) => {
				return Promise.all(favorites.map((favorite) => {
					return fetch(`${DBHelper.DATABASE_URL}/${favorite.id}/?is_favorite=${favorite.isFavorite}`, { method: 'PUT' })
							.then((response) => response.json())
							.then((favoritedRestaurant) => {
								return dbPromise.db.then((db) => {
									const restaurantStore = db.transaction('restaurants', 'readwrite').objectStore('restaurants');
									restaurantStore.put(favoritedRestaurant);
									return restaurantStore.complete;
								});
							}).then(() => {
								let id = Number(favorite.id);
								return dbPromise.db.then((db) => {
									const removeFavoriteStore = db.transaction('offlineFavorites', 'readwrite').objectStore('offlineFavorites');
									removeFavoriteStore.delete(id);
									return removeFavoriteStore.complete;
								});
							});
				}));
			});
		});
	};

	static syncOfflineReviews() {
		return dbPromise.db.then((db) => {
			const offlineReviewsStore = db.transaction('offlineReviews').objectStore('offlineReviews');
			return offlineReviewsStore.getAll().then((reviews) => {
				console.log(reviews);
				return Promise.all(reviews.map((review) => {
					console.log(review);
					let offlineID = Number(review.id); // Save id of review in the offline Store to remove
					delete review.id; // Because the reviews database on the server keeps its own ids, and you can't sync it up with the offlineReviews store, delete the id that the offlineReviews store created so there's no collision problems when POST-ing.
					return fetch(`${DBHelper.REVIEWS_URL}`, { method: 'POST', body: JSON.stringify(review) })
							.then((response) => response.json())
							.then((offlineReview) => {
								return dbPromise.db.then((db) => {
									const reviewStore = db.transaction('reviews', 'readwrite').objectStore('reviews');
									reviewStore.put(offlineReview);
									return reviewStore.complete;
								});
							}).then(() => {
								return dbPromise.db.then((db) => {
									const offlineReviewsStore = db.transaction('offlineReviews', 'readwrite').objectStore('offlineReviews');
									offlineReviewsStore.delete(offlineID);
									return offlineReviewsStore.complete;
								});
							});
				}));
			});
		});
	};
}