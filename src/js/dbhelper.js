import dbPromise from './dbHandler';

const image_alt_tags = {
	1: "This is a picture of a party enjoying a meal at Mission Chinese Food",
	2: "This is a picture of a toasty pizza fresh out of the oven from Emily's",
	3: "This is a picture of the empty, wooden tables inside of Kang Ho Dong Baekjeong restaurant",
	4: "This is a picture of the outside storefront of Katz's Delicatessen",
	5: "This is a view across the crowded tables of Roberta's Pizza, facing the kitchen",
	6: "This is a picture of Hometwon BBQ, full of occupied tables",
	7: "This is a black and white photograph of the Superiority Burger storefront",
	8: "This is a photograph of The Dutch's front entrance",
	9: "This is a black and white picture of couples enjoying a meal at Mu Ramen",
	10: "This is a picture of the empty inside of Casa Enrique in front of the bar"
  }
/**
 * Common database helper functions.
 */
export default class DBHelper {

  /**
   * Database URL.
   * Returns URL for connecting to API server 
   */
  static get DATABASE_URL() {
    const port = 1337 // Change this to your server port
    return `http://localhost:${port}/restaurants`;
  }

  /** 
   * Reviews URL
   * Returns reviews for a specified restaurant
  */
  static get REVIEWS_URL() {
	  const port = 1337;
	  return `http://localhost:${port}/reviews`;
  }
  

  /**
   * Fetch all restaurants.
   */
  static fetchRestaurants(callback) {
	fetch(DBHelper.DATABASE_URL)
		.then((response) => response.json())
		.then((restaurants) => {
			dbPromise.storeRestaurants(restaurants);
			callback(null, restaurants);
		}).catch((err) => {
			console.log(`Error fetching Restaurants, Error Code: ${err}.`);
			console.log(`Attempting to pull from IndexedDB`);
			dbPromise.retrieveRestaurants().then((dbRestaurants) => {
				if(dbRestaurants){
					console.log('Restaurants successfully retrieved from IndexedDB');
					callback(null, dbRestaurants);
				}
				else{
					callback('No Restaurants Found.', null);
				}
			});
		});
  }

  /**
   * Fetch a restaurant by its ID.
   */
  static fetchRestaurantById(id, callback) {
    // fetch all restaurants with proper error handling.
	fetch(`${DBHelper.DATABASE_URL}/${id}`)
		.then((response) => response.json())
		.then((networkRestaurant) => {
			dbPromise.storeRestaurants(networkRestaurant);
			callback(null, networkRestaurant);
		}).catch((err) =>{
			console.log(`Error fetching Restaurant ${id}, Error Code: ${err}`);
			console.log(`Attempting to pull from IndexedDB`);
			console.log(id);
			dbPromise.retrieveRestaurants(id).then((dbRestaurant) => {
				if(!dbRestaurant) {
					callback('No Restaurants found', null);
				}
				else{
					console.log(`Restaurant successfully retrieved from IndexedDB`);
					callback(null, dbRestaurant);
				}
			});
		})
}

  /**
   * Fetch restaurants by a cuisine type with proper error handling.
   */
  static fetchRestaurantByCuisine(cuisine, callback) {
    // Fetch all restaurants  with proper error handling
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        // Filter restaurants to have only given cuisine type
        const results = restaurants.filter(r => r.cuisine_type == cuisine);
        callback(null, results);
      }
    });
  }

  /**
   * Fetch restaurants by a neighborhood with proper error handling.
   */
  static fetchRestaurantByNeighborhood(neighborhood, callback) {
    // Fetch all restaurants
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        // Filter restaurants to have only given neighborhood
        const results = restaurants.filter(r => r.neighborhood == neighborhood);
        callback(null, results);
      }
    });
  }

  /**
   * Fetch restaurants by a cuisine and a neighborhood with proper error handling.
   */
  static fetchRestaurantByCuisineAndNeighborhood(cuisine, neighborhood, callback) {
    // Fetch all restaurants
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        let results = restaurants
        if (cuisine != 'all') { // filter by cuisine
          results = results.filter(r => r.cuisine_type == cuisine);
        }
        if (neighborhood != 'all') { // filter by neighborhood
          results = results.filter(r => r.neighborhood == neighborhood);
        }
        callback(null, results);
      }
    });
  }

  /**
   * Fetch all neighborhoods with proper error handling.
   */
  static fetchNeighborhoods(callback) {
    // Fetch all restaurants
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        // Get all neighborhoods from all restaurants
        const neighborhoods = restaurants.map((v, i) => restaurants[i].neighborhood)
        // Remove duplicates from neighborhoods
        const uniqueNeighborhoods = neighborhoods.filter((v, i) => neighborhoods.indexOf(v) == i)
        callback(null, uniqueNeighborhoods);
      }
    });
  }

  /**
   * Fetch all cuisines with proper error handling.
   */
  static fetchCuisines(callback) {
    // Fetch all restaurants
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        // Get all cuisines from all restaurants
        const cuisines = restaurants.map((v, i) => restaurants[i].cuisine_type)
        // Remove duplicates from cuisines
        const uniqueCuisines = cuisines.filter((v, i) => cuisines.indexOf(v) == i)
        callback(null, uniqueCuisines);
      }
    });
  }

  /**
   * Fetch all reviews for a given restaurant by id
   */
  static fetchReviewsByRestaurantID(restaurant_id, callback){
	fetch(`${DBHelper.REVIEWS_URL}/?restaurant_id=${restaurant_id}`)
		.then((response) => response.json())
		.then((reviews) => {
			dbPromise.storeReviews(reviews);
			dbPromise.db.then((db) => {
				const offlineReviewsStore = db.transaction('offlineReviews').objectStore('offlineReviews');
				const offlineReviewsStoreIndex = offlineReviewsStore.index('restaurant_id');

				offlineReviewsStoreIndex.getAll(restaurant_id).then((offlineReviews) => {
					if(!offlineReviews) offlineReviews = [];
					let combinedReviews = reviews.concat(offlineReviews);
					callback(null, combinedReviews);
				});
			});
		}).catch((err) => {
			console.log(`Error fetching Reviews, Error Code: ${err}.`);
			console.log(`Attempting to pull from IndexedDB`);
			dbPromise.retrieveReviews(restaurant_id).then((dbReviews => {
				if(!dbReviews){
					callback(err, null);
				}
				dbPromise.db.then((db) => {
					const offlineReviewsStore = db.transaction('offlineReviews').objectStore('offlineReviews');
					const offlineReviewsStoreIndex = offlineReviewsStore.index('restaurant_id');
	
					offlineReviewsStoreIndex.getAll(restaurant_id).then((offlineReviews) => {
						console.log(dbReviews);
						console.log(offlineReviews);
						if(!offlineReviews) offlineReviews = [];
						let combinedReviews = dbReviews.concat(offlineReviews);
						callback(null, combinedReviews);
					});
				});
			}));
		});
	}

  /**
   * Restaurant page URL.
   */
  static urlForRestaurant(restaurant) {
    return (`./restaurant.html?id=${restaurant.id}`);
  }

  /**
   * Restaurant image URL.
   */
  static imageUrlForRestaurant(restaurant) {
    return (`/images/${restaurant.photograph ? restaurant.photograph : restaurant.id}`);
  }

  static imageAltCode(restaurant_id) {
	  return image_alt_tags[restaurant_id];
  }


  /**
   * Map marker for a restaurant.
   */
   static mapMarkerForRestaurant(restaurant, map) {
    // https://leafletjs.com/reference-1.3.0.html#marker  
    const marker = new L.marker([restaurant.latlng.lat, restaurant.latlng.lng],
      {title: restaurant.name,
      alt: restaurant.name,
      url: DBHelper.urlForRestaurant(restaurant)
      })
      marker.addTo(map);
    return marker;
  } 

}