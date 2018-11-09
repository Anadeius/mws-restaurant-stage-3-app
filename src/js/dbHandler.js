import idb from 'idb';

const dbPromise = {
	db: idb.open('restaurant-db', 1, (upgradeDB) => {
		switch(upgradeDB.oldVersion) {
			case 0:
				let restaurantStore = upgradeDB.createObjectStore('restaurants', { keyPath : 'id' });
		}
	}),

	retrieveRestaurants(restaurantID = undefined) {
		return this.db.then(db => {
			if(!Number.isInteger(restaurantID) && !restaurantID){
				restaurantID = Number(restaurantID);
			}
			let store = db.transaction('restaurants').objectStore('restaurants');
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
					if(!storeRestaurantValue) return store.put(restaurant);
				});
			})).then(() => {
				console.log(`All Restaurants stored successfully.`);
				return store.complete;
			});
		});
	},
};

export default dbPromise;