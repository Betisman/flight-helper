import { airports, fares, flights } from '@2bad/ryanair';
import fs from 'fs';
import path from 'path';

const startDate = '2024-10-01';
const endDate = '2024-10-03';
const filterDate = '2024-10-02';

const toCSV = (obj) => Object.values(obj).join(",");

const directFromToAny = async (ORIGIN) => {
  const destinations = await airports.getDestinations(ORIGIN);
  const cheapest = [];

  for await (const destination of destinations) {
    console.log(ORIGIN, destination.arrivalAirport.code);
    let ch = await fares.findDailyFaresInRange(ORIGIN, destination.arrivalAirport.code, startDate, endDate);

    for (let c in ch) {
      if (ch[c].day > filterDate) continue;
      cheapest.push({
        origin: ORIGIN,
        destination: destination.arrivalAirport.code,
        destinationLong: destination.arrivalAirport.name,
        day: ch[c].day,
        price: ch[c].price?.value,
        currency: ch[c].price?.currencySymbol
      });
    }
  }

  const sortedByPrice = cheapest.sort((a, b) => a.price - b.price);

  fs.writeFileSync(path.resolve('playground/fr/output', `${ORIGIN}_flights.csv`), sortedByPrice.map((flight) => toCSV(flight)).join("\n"));
};

const directFromAnyTo = async (ORIGIN) => {
  return;
  const destinations = await airports.getDestinations(ORIGIN);
  const cheapest = [];

  for await (const destination of destinations) {
    console.log(ORIGIN, destination.arrivalAirport.code);
    let ch = await fares.findDailyFaresInRange(ORIGIN, destination.arrivalAirport.code, startDate, endDate);

    for (let c in ch) {
      if (ch[c].day > filterDate) continue;
      cheapest.push({
        origin: ORIGIN,
        destination: destination.arrivalAirport.code,
        destinationLong: destination.arrivalAirport.name,
        day: ch[c].day,
        price: ch[c].price?.value,
        currency: ch[c].price?.currencySymbol
      });
    }
  }

  const sortedByPrice = cheapest.sort((a, b) => a.price - b.price);

  fs.writeFileSync(path.resolve('playground/fr/output', `${ORIGIN}_flights.csv`), sortedByPrice.map((flight) => toCSV(flight)).join("\n"));
};

const stop_1 = async (ORIGIN, DESTINATION) => {
  const destinations = await airports.getDestinations(ORIGIN);
  const firstLeg = [];
  const secondLeg = [];

  for await (const destination of destinations) {
    console.log('destination', destination.arrivalAirport.code, destination.arrivalAirport.name, destination.arrivalAirport.country.name);

    let fl = await fares.findDailyFaresInRange(ORIGIN, destination.arrivalAirport.code, startDate, endDate);
    console.log(ORIGIN, destination.arrivalAirport.code, fl.length);

    let sl = await fares.findDailyFaresInRange(destination.arrivalAirport.code, DESTINATION, startDate, endDate);
    console.log(destination.arrivalAirport.code, DESTINATION, sl.length);

    for (let c in fl) {
      if (fl[c].day < startDate || fl[c].day > endDate) continue;
      firstLeg.push({
        origin: ORIGIN,
        destination: destination.arrivalAirport.code,
        destinationLong: destination.arrivalAirport.name,
        day: fl[c].day,
        price: fl[c].price?.value,
        currency: fl[c].price?.currencySymbol
      });
    }

    for (let c in sl) {
      if (sl[c].day < startDate || sl[c].day > endDate) continue;
      secondLeg.push({
        origin: destination.arrivalAirport.code,
        destination: DESTINATION,
        destinationLong: destination.arrivalAirport.name,
        day: sl[c].day,
        price: sl[c].price?.value,
        currency: sl[c].price?.currencySymbol
      });
    }
  }

  const FLsortedByPrice = firstLeg.sort((a, b) => a.price - b.price);
  const SLsortedByPrice = secondLeg.sort((a, b) => a.price - b.price);

  fs.writeFileSync(path.resolve('playground/fr/output', `${ORIGIN}_${DESTINATION}_1stop_first_leg_flights.csv`), FLsortedByPrice.map((flight) => toCSV(flight)).join("\n"));
  fs.writeFileSync(path.resolve('playground/fr/output', `${ORIGIN}_${DESTINATION}_1stop_second_leg_flights.csv`), SLsortedByPrice.map((flight) => toCSV(flight)).join("\n"));
}

const findRoute = async (ORIGIN, DESTINATION) => {
  const routes = await airports.findRoutes(ORIGIN, DESTINATION);
  console.log('routes', routes);
}

(async () => {
  // await directFromToAny('PMI');
  // await directFromAnyTo('PMI');
  // await findRoute('PMI', 'BER');
  await stop_1('LGW', 'WMI');
})();
