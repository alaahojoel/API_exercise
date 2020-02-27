let listings = [
  {
    id: 1,
    title: "test listing",
    description: "just a test",
    category: "testing",
    location: "testland",
    images: null,
    price: 21,
    date: "2020",
    delivery: "Shipping",
    seller: "tester",
    userId: 1
  },
  {
    id: 2,
    title: "test listing2",
    description: "just a test2",
    category: "testing",
    location: "testland",
    images: null,
    price: 21,
    date: "2020",
    delivery: "Shipping",
    seller: "tester",
    userId: 1
  },
  {
    id: 3,
    title: "test listing2",
    description: "just a test2",
    category: "testing",
    location: "testland",
    images: null,
    price: 21,
    date: "2020",
    delivery: "Shipping",
    seller: "tester",
    userId: 1
  }
  

];

//Exporting some arrow functions to be used in the api methods
module.exports = {
  //Pushing given information into the array
  addListing: (title, description, category, location, images, price, date, delivery, seller, userId) => {
    listings.push({
      id: listings.length + 1,
      title,
      description,
      category,
      location,
      images,
      price,
      date,
      delivery,
      seller,
      userId
    });
  },

  //Filtering listings with given values
  getListingsByCategory: (category) => listings.filter(l => l.category == category),
  getListingsByLocation: (location) => listings.filter(l => l.location == location),
  getListingsByDate: (date) => listings.filter(l => l.date == date),

  //Obvious
  getAllListings: () => listings,

  //Getting all listings from a given user
  getAllUserlistings: (userId) => listings.filter(t => t.userId == userId),

  //Getting listings per listing id
  getListing: (listingId) => listings.find(t => t.id == listingId),

  //Deleting listings from the array with given listing id
  delListing: (listingId) => listings.splice(listingId-1)
}