import { airports, fares, flights } from '@2bad/ryanair';
import fs from 'fs';

// transform an array of objects into a CSV
const toCSV = (obj) => Object.values(obj).join(",");

const directFromToAny = async (ORIGIN) => {
  const destinations = await airports.getDestinations(ORIGIN);

  // console.log('destinations', destinations)

  const cheapest = [];
  for await (const destination of destinations) {
    console.log(ORIGIN, destination.arrivalAirport.code)
    let ch = await fares.findDailyFaresInRange(ORIGIN, destination.arrivalAirport.code, '2024-08-21', '2024-08-22')

    for (let c in ch) {
      if (ch[c].day > '2024-08-23') continue;
      cheapest.push({ origin: ORIGIN, destination: destination.arrivalAirport.code, destinationLong: destination.arrivalAirport.name, day: ch[c].day, price: ch[c].price?.value, currency: ch[c].price?.currencySymbol })
    }
  }

  const sortedByPrice = cheapest.sort((a, b) => a.price - b.price);

  fs.writeFileSync(`./ryanair/output/${ORIGIN}_flights.csv`, sortedByPrice.map((flight) => toCSV(flight)).join("\n"));
};

const directFromAnyTo = async (ORIGIN) => {
  return;
  const destinations = await airports.getDestinations(ORIGIN);

  // console.log('destinations', destinations)

  const cheapest = [];
  for await (const destination of destinations) {
    console.log(ORIGIN, destination.arrivalAirport.code)
    let ch = await fares.findDailyFaresInRange(ORIGIN, destination.arrivalAirport.code, '2024-08-21', '2024-08-22')

    for (let c in ch) {
      if (ch[c].day > '2024-07-23') continue;
      cheapest.push({ origin: ORIGIN, destination: destination.arrivalAirport.code, destinationLong: destination.arrivalAirport.name, day: ch[c].day, price: ch[c].price?.value, currency: ch[c].price?.currencySymbol })
    }
  }

  const sortedByPrice = cheapest.sort((a, b) => a.price - b.price);

  fs.writeFileSync(`./ryanair/output/${ORIGIN}_flights.csv`, sortedByPrice.map((flight) => toCSV(flight)).join("\n"));
};

const stop_1 = async (ORIGIN, DESTINATION) => {
  const destinations = await airports.getDestinations(ORIGIN);
  destinations.forEach(async (destination) => {
    console.log('destination', destination.arrivalAirport.code, destination.arrivalAirport.name, destination.arrivalAirport.country.name)
  });

  const firstLeg = [];
  const secondLeg = [];
  for await (const destination of destinations) {
    console.log('destination', destination.arrivalAirport.code, destination.arrivalAirport.name, destination.arrivalAirport.country.name)
    let fl = await fares.findDailyFaresInRange(ORIGIN, destination.arrivalAirport.code, '2024-08-21', '2024-08-22')
    console.log(ORIGIN, destination.arrivalAirport.code, fl.length)
    let sl = await fares.findDailyFaresInRange(destination.arrivalAirport.code, DESTINATION, '2024-08-21', '2024-08-22')
    console.log(destination.arrivalAirport.code, DESTINATION, sl.length)

    console.log('fl');
    for (let c in fl) {
      console.log(`${fl[c].day} ${(fl[c].day < '2024-08-21' || fl[c].day > '2024-08-22') ? '*' : '<----'}`)
      if (fl[c].day < '2024-08-21' || fl[c].day > '2024-08-22') continue;
      firstLeg.push({ origin: ORIGIN, destination: destination.arrivalAirport.code, destinationLong: destination.arrivalAirport.name, day: fl[c].day, price: fl[c].price?.value, currency: fl[c].price?.currencySymbol })
    }

    console.log('sl');
    for (let c in sl) {
      console.log(`${sl[c].day} ${(sl[c].day < '2024-08-21' || sl[c].day > '2024-08-22') ? '*' : '<----'}`)
      if (sl[c].day < '2024-08-21' || sl[c].day > '2024-08-22') continue;
      secondLeg.push({ origin: destination.arrivalAirport.code, destination: DESTINATION, destinationLong: destination.arrivalAirport.name, day: sl[c].day, price: sl[c].price?.value, currency: sl[c].price?.currencySymbol })
    }

    console.log(firstLeg.length, secondLeg.length)
  }
  console.log(firstLeg.length, secondLeg.length)
  const FLsortedByPrice = firstLeg.sort((a, b) => a.price - b.price);
  const SLsortedByPrice = secondLeg.sort((a, b) => a.price - b.price);

  fs.writeFileSync(`./ryanair/output/${ORIGIN}_${DESTINATION}_1stop_first_leg_flights.csv`, FLsortedByPrice.map((flight) => toCSV(flight)).join("\n"));
  fs.writeFileSync(`./ryanair/output/${ORIGIN}_${DESTINATION}_1stop_second_leg_flights.csv`, SLsortedByPrice.map((flight) => toCSV(flight)).join("\n"));
}

const findRoute = async (ORIGIN, DESTINATION) => {
  const routes = await airports.findRoutes(ORIGIN, DESTINATION);
  console.log('routes', routes)
  // for await (const route of routes) {
  //   console.log('route', route)
  //   let fl = await fares.findDailyFaresInRange(route[0], route[1], '2024-08-21', '2024-08-22')
  //   console.log('fl', fl)
  // }
}

(async () => {
  // await main();
  // await directFromToAny('PMI');
  // await directFromAnyTo('PMI');
  // await findRoute('PMI', 'BER');
  await stop_1('LGW', 'WMI');
})();
