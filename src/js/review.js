import DBHelper from './dbhelper';
import dbPromise from './dbHandler';

const createReviewHTML = (review) => {
	const li = document.createElement('li');
  
	const section = document.createElement('section');
	section.className = "review-header";
	li.appendChild(section);
  
	const name = document.createElement('p');
	name.className = "review-name";
	name.innerHTML = review.name;
	name.tabIndex = 0;
	section.appendChild(name);
  
	const date = document.createElement('p');
	date.className = "review-date";
	date.innerHTML = new Date(review.createdAt).toLocaleDateString();
	date.tabIndex = 0;
	section.appendChild(date);
  
	const rating = document.createElement('p');
	rating.className = "review-rating";
	rating.innerHTML = `Rating: ${review.rating}`;
	rating.tabIndex = 0;
	li.appendChild(rating);
  
	const comments = document.createElement('p');
	comments.className = "review-comments";
	comments.innerHTML = review.comments;
	comments.tabIndex = 0;
	li.appendChild(comments);
  
	return li;
};

const validateForm = () => {
	const submittedData = {};

	let restaurantID = document.getElementById('review-submission-form').dataset.restaurantID;
	submittedData.restaurant_id = Number(restaurantID);

	let formName = document.getElementById('reviewName');
	if (formName.value === '') {
		formName.focus();
		return;
	}
	submittedData.name = formName.value;

	submittedData.createdAt = new Date().toISOString();

	let formRating = document.getElementById('reviewRating');
	let rating = formRating.options[formRating.selectedIndex].value;
	if (rating == '--') {
		formRating.focus();
		return;
	}
	submittedData.rating = Number(rating);

	let formComment = document.getElementById('reviewComment');
	if (formComment.value === '') {
		formComment.focus();
		return;
	}
	submittedData.comments = formComment.value;

	console.log(`Validated Form Data Object: ${submittedData}`);
	return submittedData;
};

const submitNewReview = (e) => {
	e.preventDefault(); // Prevents default form submission event, allows custom functionality to parse the form and handle submission.
	const submittedReview = validateForm();
	if(!submittedReview) return;

	console.log(`Submitted Review Data Object: ${submittedReview}`);

	/* return fetch(`${DBHelper.REVIEWS_URL}`, { method: 'POST', body: JSON.stringify(submittedReview) })
			.then((response) => response.json())
			.then((reviewSubmission) => {
				dbPromise.storeReviews(reviewSubmission);

				const reviewList = document.getElementById('reviews-list');
				const review = createReviewHTML(reviewSubmission);
				reviewList.appendChild(review);

				document.getElementById('review-submission-form').reset();
			}); */

	return dbPromise.db.then((db) => {
		const offlineReviewsStore = db.transaction('offlineReviews', 'readwrite').objectStore('offlineReviews');
		offlineReviewsStore.put(submittedReview);
		return offlineReviewsStore.complete;
	}).then(() => {
		navigator.serviceWorker.ready.then((worker) => {
			worker.sync.register('syncOfflineReviews');
		}).catch((err) => {
			console.log(`Could not register Offline Reviews Sync. Error: ${err}`);
		});

		const reviewList = document.getElementById('reviews-list');
		const review = createReviewHTML(submittedReview);
		reviewList.appendChild(review)

		document.getElementById('review-submission-form').reset();

		return;
	});
};

export default function reviewForm(restaurantID) {
	const form = document.createElement('form');
	form.id = "review-submission-form";
	form.dataset.restaurantID = restaurantID;

	//let p = document.createElement('p');
	const name = document.createElement('input');
	name.id = 'reviewName';
	name.setAttribute('type', 'text');
	name.setAttribute('placeholder', 'Name');
	//p.appendChild(name);
	form.appendChild(name);

	//p = document.createElement('p');
	const selectLabel = document.createElement('label');
	selectLabel.setAttribute('for', 'rating');
	selectLabel.innerText = 'Your Rating: ';
	//p.appendChild(selectLabel);
	form.appendChild(selectLabel);
	  
	const select = document.createElement('select');
	select.id = 'reviewRating';
	select.name = 'rating';
	select.classList.add('rating');
	['--', 1,2,3,4,5].forEach((selectValue) => {
		const option = document.createElement('option');
		option.value = selectValue;
		option.innerHTML = selectValue;
		if (selectValue === "--") option.selected = true;
		select.appendChild(option);
	});
	//p.appendChild(select);
	form.appendChild(select);

	//p = document.createElement('p');
	const textarea = document.createElement('textarea');
	textarea.id = "reviewComment";
	textarea.setAttribute('placeholder', 'Insert Comment');
	textarea.setAttribute('rows', '10');
	//p.appendChild(textarea);
	form.appendChild(textarea);

	//p = document.createElement('p');
	const submitButton = document.createElement('button');
	submitButton.setAttribute('type', 'submit');
	submitButton.classList.add('submitReview');
	submitButton.innerHTML = "Submit";
	//p.appendChild(submitButton);
	form.appendChild(submitButton);

	form.onsubmit = submitNewReview;

	return form;
};