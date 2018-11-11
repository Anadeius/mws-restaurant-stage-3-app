import idb from 'idb';

const dbPromise = {
	db: idb.open('restaurant-db', 3, (upgradeDB) => {
		switch(upgradeDB.oldVersion) {
			case 0:
				let restaurantStore = upgradeDB.createObjectStore('restaurants', { keyPath : 'id' });
			case 1:
				let reviewStore = upgradeDB.createObjectStore('reviews', { keyPath : 'id' });
				reviewStore.createIndex('restaurant_id', 'restaurant_id');
			case 2:
				let offlineFavoritesStore = upgradeDB.createObjectStore('offlineFavorites', { keyPath : 'id'});
				let offlineReviewsStore = upgradeDB.createObjectStore('offlineReviews', { keypath: 'id', autoIncrement: true });
				offlineReviewsStore.createIndex('restaurant_id', 'restaurant_id');
		}
	}),

	retrieveRestaurants(restaurantID = undefined) {
		return this.db.then(db => {
			if(!Number.isInteger(restaurantID) && restaurantID){
				restaurantID = Number(restaurantID);
			}
			let store = db.transaction('restaurants').objectStore('restaurants');
			console.log(`RestaurantID: ${restaurantID}`);
			if(restaurantID) return store.get(restaurantID)
			return store.getAll();
		});
	},

	storeRestaurants(restaurants) {
		if(!Array.isArray(restaurants)) restaurants = [restaurants];
		return this.db.then(db => {
			console.log('DB Connected');
			let store = db.transaction('restaurants', 'readwrite').objectStore('restaurants');
			Promise.all(restaurants.map((restaurant) => {
				console.log(`Attempting to store ${restaurant.name} to DB`);
				return store.get(restaurant.id).then((storeRestaurantValue) => {
					return store.put(restaurant);
				});
			})).then(() => {
				console.log(`All Restaurants stored successfully.`);
				return store.complete;
			});
		});
	},

	retrieveReviews(restaurantID) {
		return this.db.then(db => {
			if(!Number.isInteger(restaurantID) && !restaurantID) {
				restaurantID = Number(restaurantID);
			}
			let store = db.transaction('reviews').objectStore('reviews');
			let reviewIndex = store.index('restaurant_id');

			return reviewIndex.getAll(restaurantID);
		});
	},
	
	storeReviews(reviews) {
		if(!Array.isArray(reviews)) reviews = [reviews];
		return this.db.then(db => {
			console.log('DB Connected');
			let store = db.transaction('reviews', 'readwrite').objectStore('reviews');
			Promise.all(reviews.map((review) => {
				console.log(`Attempt to store reviews for ${review.restaurant_id} to DB`);
				return store.get(review.id).then((storeReviewValue) => {
					return store.put(review);
				});
			})).then(() => {
				console.log('All Reviews stored successfully');
				return store.complete;
			});
		});
	}
};

export default dbPromise;