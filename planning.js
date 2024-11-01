const fs = require('fs');

function readCsv(filename, delimiter = ',') {
  try {
    const fileContent = fs.readFileSync(filename, { encoding: 'utf-8' });
    const rows = fileContent.split('\n');
    const data = [];
    const headers = rows[0].trim().split(delimiter);
    for (let i = 1; i < rows.length; i++) {
      const row = rows[i].trim();
      if (row) {
        const columns = row.split(delimiter);
        const rowData = {};
        for (let j = 0; j < columns.length; j++) {
          rowData[headers[j]] = columns[j];
        }
        data.push(rowData);
      }
    }
    return data;
  } catch (err) {
    console.error("Error reading file:", err.message);
    return null;
  }
}

// Function to calculate profit from flights
function flightProfit(flightData, airports, aircraft) {
  const results = [];
  flightData.forEach(flight => {
    // Find airport data
    const airport = airports.find(a => a.Code === flight["Overseas Airport"]);
    if (!airport) {
      results.push({ error: `Error: Invalid Overseas Airport code: ${flight["Overseas Airport"]}` });
      return; 
    }

    // Find aircraft data
    const aeroplaneData = aircraft.find(a => a["Type of Aircraft"] === flight["Type of aircraft"]);
    if (!aeroplaneData) {
      results.push({ error: `Error: Invalid aircraft type: ${flight["Type of aircraft"]}` });
      return;
    }

    // Calculate distance
    const distance = flight["UK Airport"] === "MAN" ? parseInt(airport["Distance from MAN"]) : parseInt(airport["Distance from LGW"]);

    // Calculate income
    const income = (parseInt(flight["Number of economy seats booked"]) * parseFloat(flight["Price of economy class seat"])) +
      (parseInt(flight["Number of business seats booked"]) * parseFloat(flight["Price of business class seat"])) +
      (parseInt(flight["Number of first class seats booked"]) * parseFloat(flight["Price of first class seat"]));

    // Calculate total passengers
    const totalPassengers = parseInt(flight["Number of economy seats booked"]) +
      parseInt(flight["Number of business seats booked"]) +
      parseInt(flight["Number of first class seats booked"]);

    // Calculate cost
    const costPerSeat = parseFloat(aeroplaneData["Running cost per seat per 100km"]) * (distance / 100);
    const totalCost = costPerSeat * totalPassengers;

    // Calculate profit
    const profit = income - totalCost;

    results.push({
      flightDetails: flight,
      profit: parseFloat(profit.toFixed(2))
    });
  });
  return results;
}

// Formats and displays the results 
function displayResults(results) {
    let outputText = "";

  results.forEach(result => {
    if (result.error) {
      console.log(result.error);
      outputText += result.error + "\n";
      return;
    }

    // If no error, output below will be displayed
    const flight = result.flightDetails;
    const profit = result.profit;

    let output = `
      Flight Details:
      UK Airport: ${flight["UK Airport"]}
      Overseas Airport: ${flight["Overseas Airport"]}
      Type of aircraft: ${flight["Type of aircraft"]}
      Number of economy seats booked: ${flight["Number of economy seats booked"]}
      Number of business seats booked: ${flight["Number of business seats booked"]}
      Number of first class seats booked: ${flight["Number of first class seats booked"]}
      Price of economy class seat: £${flight["Price of economy class seat"]}
      Price of business class seat: £${flight["Price of business class seat"]}
      Price of first class seat: £${flight["Price of first class seat"]}
      Profit: £${profit}
    `;

    console.log(output);
    outputText += output;
  });

  // Writes the output to a .txt file
  try {
    fs.writeFileSync('flight_profit.txt', outputText);
  } catch (err) {
    console.error("Error writing to file:", err);
  }
}

const airportsData = readCsv('airports.csv');
const aeroplaneData = readCsv('aeroplanes.csv');
const flightData = readCsv('valid_flight_data.csv');

// Calculate flight profitability and display results
const flightProfitability = flightProfit(flightData, airportsData, aeroplaneData);
displayResults(flightProfitability);

console.log(airportsData)
console.log(aeroplaneData)
console.log(flightData)