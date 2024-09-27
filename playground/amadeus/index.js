const Amadeus = require('amadeus');

// get credentials from .env
require('dotenv').config();

const AMADEUS_API_KEY = process.env.AMADEUS_API_KEY;
const AMADEUS_API_SECRET = process.env.AMADEUS_API_SECRET;

console.log(AMADEUS_API_KEY, AMADEUS_API_SECRET);


const amadeus = new Amadeus({
  clientId: AMADEUS_API_KEY,
  clientSecret: AMADEUS_API_SECRET,
});

const date = '2024-12-11';
const iataCode = 'KIV'; // IATA code for Chisinau International Airport

// amadeus.shopping.flightOffersSearch.get({
//   originLocationCode: 'VLC',
//   destinationLocationCode: 'KIV',
//   departureDate: date,
//   adults: '1'
// }).then(function (response) {
//   console.log(response.data);
// }).catch(function (responseError) {
//   console.log(responseError.code);
// });

// amadeus.airport.directDestinations.get({
//   departureAirportCode: 'KIV',
// }).then(function (response) {
//   console.log(response.data);
// }).catch(function (responseError) {
//   console.log(responseError.code);
// });


amadeus.shopping.flightOffersSearch.get({
  originLocationCode: 'KIV',
  // destinationLocationCode: 'KIV',
  departureDate: date,
  adults: '1'
}).then(function (response) {
  console.log(response.data);
}).catch(function (responseError) {
  console.error(responseError);
  console.log(responseError.code);
});