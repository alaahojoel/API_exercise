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
    }
];

module.exports = {
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
  getAllListings: () => listings,
  getAllUserlistings: (userId) => listings.filter(t => t.userId == userId),
  getListing: (listingId) => listings.find(t => t.id == listingId)
}