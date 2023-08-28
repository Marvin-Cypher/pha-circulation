// 1. Define constants and helper functions

// Define margins, width, and height
const margin = {top: 10, right: 30, bottom: 30, left: 60},
    width = 1200 - margin.left - margin.right,
    height = 700 - margin.top - margin.bottom;

const keys = ["Compute Reward", "Stakedrop", "Testnet Reward", "Investors", "Slot Auction", "Founder Team"];
let color = d3.scaleOrdinal()
    .domain([
        "Compute Reward", 
        "Stakedrop", 
        "Testnet Reward", 
        "Investors", 
        "Slot Auction", 
        "Founder Team"
    ])
    .range([
        "#CDFA50", 
        "#7F52FA", 
        "#FFFFFFA3", 
        "#2DD2B5", 
        "#E6007A", 
        "#90CDF4"
    ]);


const TOTAL_SUPPLY = 1000000000;
const RATIOS = {
    "Compute Reward": 0.7,
    "Stakedrop": 0.021,
    "Testnet Reward": 0.01,
    "Investors": 0.15,
    "Slot Auction": 0.069,
    "Founder Team": 0.05
};

function customTimeFormat(date) {
    if (date.getMonth() === 0) {  // If it's January
        return d3.timeFormat('%Y')(date);
    } else if ([0, 3, 6, 9].includes(date.getMonth())) {  // If it's one of the quarterly months
        return d3.timeFormat('%m')(date);
    }
    return "";  // This ensures other months don't get displayed
}

function formatMillions(n) {
    return (n / 1e6) + "mln";
}

function computeCumulative(day, halvingPeriod, halvingDiscount) {
    let periodsElapsed = Math.floor(day / halvingPeriod);
    let daysInCurrentPeriod = day % halvingPeriod;

    let cumulative = 0;
    let currentReward = 720 * 1000;  // Initial reward

    for (let i = 0; i < periodsElapsed; i++) {
        cumulative += currentReward * halvingPeriod;
        currentReward *= (1 - halvingDiscount);
    }

    cumulative += currentReward * daysInCurrentPeriod;
    return cumulative;
}

function computeDate(dayNum) {
    const start = new Date(2022, 3, 8);
    return new Date(start.getTime() + dayNum * 24 * 60 * 60 * 1000);
}

function getDailyReward(day, halvingPeriod, halvingDiscount) {
    let periodsElapsed = Math.floor(day / halvingPeriod);
    let currentReward = 720 * 1000;  // Initial reward

    for (let i = 0; i < periodsElapsed; i++) {
        currentReward *= (1 - halvingDiscount);
    }

    return currentReward / 1000; // Return in 'k'
}

// Calculate rewards with halving behavior
const halvingPeriod = 180;  // in days
const halvingDiscount = 0.25;

let day = 1;
let currentReward = 720 * 1000;

function inspectDataForNaN(stackedData) {
    stackedData.forEach((keyData, keyIndex) => {
        keyData.forEach((monthData, monthIndex) => {
            if (isNaN(monthData[0]) || isNaN(monthData[1])) {
                console.log("Found NaN for key index", keyIndex, "and month index", monthIndex);
            }
        });
    });
}



// Test the functions together
for (let day = 1; day <= 365; day++) { 
    let dailyReward;
    if (day <= 180) dailyReward = 720;
    else if (day <= 360) dailyReward = 540;
    else dailyReward = 405;
}

// 2. Generate processed data

const data = [];
let cumulativeSpecialReward = 0;
for (let i = 0; i < 120; i++) {
    let newDate = new Date(2020, 8, 10);
    newDate.setMonth(newDate.getMonth() + i);
    let datum = { date: newDate };


    // Computation reward
    if (newDate >= new Date(2021, 8, 20) && newDate <= new Date(2022, 3, 8)) {
        console.log("Special reward computation for date: ", newDate);
        const startSpecialDate = new Date(2021, 8, 20);
        let dayDifference = Math.floor((newDate - startSpecialDate) / (1000 * 60 * 60 * 24)); 

        let dailyReward = 60000;
        for (let day = 0; day <= dayDifference; day++) {
            let rewardReductionPeriods = Math.floor(day / 45); 
            let currentDayReward = dailyReward;
            for (let j = 0; j < rewardReductionPeriods; j++) {
                currentDayReward *= 0.75; // Reduce reward by 25% for each 45-day period
            }
            cumulativeSpecialReward += currentDayReward;
        }
        
        datum["Compute Reward"] = cumulativeSpecialReward;
        cumulativeSpecialReward = 0;  // Reset for the next iteration
    } else if (newDate >= new Date(2022, 3, 8)) {
        console.log("Original reward computation for date: ", newDate);
        let dayDiff = Math.floor((newDate - new Date(2022, 3, 8)) / (1000 * 60 * 60 * 24));
        datum["Compute Reward"] = computeCumulative(dayDiff, halvingPeriod, halvingDiscount);
    } else {
        datum["Compute Reward"] = 0;
    }
    data.push(datum);


    // Stakedrop
    datum["Stakedrop"] = 0;
    if (newDate >= new Date(2020, 8, 10)) {
        datum["Stakedrop"] = RATIOS["Stakedrop"] * TOTAL_SUPPLY;
    }

    // Testnet Incentive
    datum["Testnet Reward"] = 0;
   if (newDate >= new Date(2021, 5, 30)) {
        datum["Testnet Reward"] = RATIOS["Testnet Reward"] * TOTAL_SUPPLY;
    } 

    // Private Sale

    datum["Investors"] = 0;
    if (newDate >= new Date(2020, 8, 10)) {
         // Initial 60% unlocked
         datum["Investors"] = 0.6 * RATIOS["Investors"] * TOTAL_SUPPLY;

        // Calculate the number of 6-month periods since the initial unlock date, adjusting for the exact 6-month mark
        let adjustedDate = new Date(newDate);
        adjustedDate.setDate(newDate.getDate() - 1);
        let monthsSinceStart = (adjustedDate.getFullYear() - 2020) * 12 + adjustedDate.getMonth() - 8;
        let sixMonthPeriodsSinceStart = Math.floor(monthsSinceStart / 6);

        // If 6 months have passed, unlock an additional 20%
        if (sixMonthPeriodsSinceStart == 1) {
            datum["Investors"] += 0.2 * RATIOS["Investors"] * TOTAL_SUPPLY;
        }
        // If 12 months (or more) have passed, unlock the remaining 20%
        else if (sixMonthPeriodsSinceStart >= 2) {
            datum["Investors"] += 0.4 * RATIOS["Investors"] * TOTAL_SUPPLY;  // This accounts for the previous 20% and the final 20%
        }
    }


    // Parachain slot auction
    datum["Slot Auction"] = 0;

    // Kusama release logic
    if (newDate >= new Date(2021, 6, 31)) {  
        // Initial release
        datum["Slot Auction"] = 0.34 * 0.025 * TOTAL_SUPPLY;
    
        // Days since initial release
        let daysFromKusamaStart = (newDate - new Date(2021, 6, 31)) / (24 * 60 * 60 * 1000);
        
        if (daysFromKusamaStart <= 330) {  // If within the 11 month vesting period
            datum["Slot Auction"] += (0.66 * 0.025 * daysFromKusamaStart / 330) * TOTAL_SUPPLY;
        } else {
            datum["Slot Auction"] += (0.66 * 0.025) * TOTAL_SUPPLY;  // Max amount after vesting period
        }
    }
    
    // Polkadot release logic
    if (newDate >= new Date(2022, 5, 3)) {  
        // Initial release
        datum["Slot Auction"] += 0.15 * 0.0221 * TOTAL_SUPPLY;
    
        // Days since initial release
        let daysFromPolkadotStart = (newDate - new Date(2022, 5, 3)) / (24 * 60 * 60 * 1000);
        
        if (daysFromPolkadotStart <= 672) {  // If within the 96 week vesting period
            datum["Slot Auction"] += (0.85 * 0.0221 * daysFromPolkadotStart / 672) * TOTAL_SUPPLY;
        } else {
            datum["Slot Auction"] += (0.85 * 0.0221) * TOTAL_SUPPLY;  // Max amount after vesting period
        }
    }
    
    

    // Founder team
    datum["Founder Team"] = 0;
    if (newDate >= new Date(2020, 8, 10)) {
        datum["Founder Team"] = 0.2 * RATIOS["Founder Team"] * TOTAL_SUPPLY;
    if (i > 12 && i <= 28) {  // For the subsequent 16 months
        datum["Founder Team"] += (i - 12) * 0.05 * RATIOS["Founder Team"] * TOTAL_SUPPLY;  // 5% unlocked every month
    } else if (i > 28) {
        datum["Founder Team"] = RATIOS["Founder Team"] * TOTAL_SUPPLY;  // All tokens are unlocked after 16 months
    }
}
}



// log 
console.log(data);



// 3. Set up SVG container and associated elements

// Stacked area chart

// Create SVG container
const svg = d3.select("#my_dataviz")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

// Tooltip


let tooltip = d3.select("#my_dataviz")
    .append("div")
    .attr("class", "tooltip")
    .style("visibility", "hidden");


let bisectDate = d3.bisector(d => d.date).left;

svg

  .on("mouseover", function(event) { tooltip.style("visibility", "visible"); })
  .on("mousemove", function(event, d) {
      let x0 = x.invert(d3.pointer(event, this)[0]), // Use this to reference the SVG
          i = bisectDate(data, x0, 1),
          selectedData = data[i];
      populateTooltip(selectedData);

      let tooltipWidth = tooltip.node().getBoundingClientRect().width;
      let tooltipHeight = tooltip.node().getBoundingClientRect().height;
      let leftPosition = d3.pointer(event, this)[0] + 10;
      let topPosition = d3.pointer(event, this)[1] - 10;


      // Ensure tooltip doesn't exceed right boundary of the container
      if (leftPosition + tooltipWidth > width) {
          leftPosition = d3.pointer(event, this)[0] - tooltipWidth - 5;
      }

      // Ensure tooltip doesn't exceed bottom boundary of the container
      if (topPosition + tooltipHeight > height) {
          topPosition = d3.pointer(event, this)[1] - tooltipHeight - 5;
      }

      tooltip
          .style("top", topPosition + "px")
          .style("left", leftPosition + "px");
  })
  .on("mouseout", function() { tooltip.style("visibility", "hidden"); });

function populateTooltip(d) {
    const formatDate = d3.timeFormat("%b %d %Y"); 
    let content = `<strong>Date:</strong> ${formatDate(d.date)}<br>`;
    const totalCirculation = Math.round(d3.sum(keys, k => d[k]));
    content += `<strong>Total Circulation:</strong> ${totalCirculation}<br><hr>`;
    keys.forEach(k => {
        content += `<strong>${k}:</strong> ${Math.round(d[k])}<br>`;
    });
    tooltip.html(content);
}

// 4. Append axes, areas, legend, and other elements to SVG

// X-axis setup
let x = d3.scaleTime()
    .domain(d3.extent(data, function(d) { return d.date; }))
    .range([0, width]);

let xAxis = d3.axisBottom(x)
    .ticks(d3.timeMonth.every(3))  // This ensures ticks every 3 months
    .tickFormat(customTimeFormat);

svg.append('g')
    .attr("transform", "translate(0," + height + ")")
    .call(xAxis);

// Y-axis setup

let y = d3.scaleLinear().domain([0, TOTAL_SUPPLY]).range([height, 0]);
svg.append("g").call(d3.axisLeft(y).tickFormat(formatMillions));

svg.selectAll(".tick line").style("stroke", "#FFF");
svg.selectAll(".tick text").style("fill", "#FFF").attr("font-family", "Montserrat");
svg.selectAll("g.axis text")
    .style("fill", "#FFF");


// Stacked area chart setup
let dates = data.map(d => d.date);
let stackedData = d3.stack().keys(keys)(data);

svg
  .selectAll("mylayers")
  .data(stackedData)
  .enter()
  .append("path")
    .attr("class", "myArea")
    .style("fill", function(d) { return color(d.key); })
    .attr("d", d3.area()
        .x(function(d, i) { return x(d.data.date); })
        .y0(function(d) { return y(d[0]); })
        .y1(function(d) { return y(d[1]); })
    )

svg.append("text")
    .attr("x", 10)
    .attr("y", 40)
    .attr("font-family", "Montserrat")
    .attr("font-size", "40px")
    .attr("font-weight", "700")
    .attr("fill", "#FFF")
    .text("$PHA Token Circulation");

svg.append("text")
    .attr("x", 10)
    .attr("y", 70)
    .attr("font-family", "Montserrat")
    .attr("font-size", "16px")
    .attr("font-weight", "400")
    .attr("fill", "#A0AEC0")
    .text("Based on Phala tokenomic wiki & whitepaper");

inspectDataForNaN(stackedData);





// Legend settings
const legendRectSize = 10; // Defines the size of the square color boxes in the legend
const legendSpacing = 5;   // Defines the spacing between the square and the text
const legendTopMargin = 60; // Adjust based on desired top spacing
const legendRightMargin = 130; // Adjust based on desired right spacing

const legend = svg.selectAll('.legend')
  .data(keys)
  .enter()
  .append('g')
  .attr('class', 'legend')
  .attr('transform', function(d, i) {
    const height = legendRectSize + legendSpacing;
    const offset = -keys.length * height / 2 + (legendRectSize / 2);
    const horz = width - legendRightMargin; // Positioning to the right
    const vert = i * height + offset + legendTopMargin; // Adjusted for top margin
    return 'translate(' + horz + ',' + vert + ')';
  });

// Draw the colored rectangles
legend.append('rect')
  .attr('width', legendRectSize)
  .attr('height', legendRectSize)
  .style('fill', color)
  .style('stroke', color);

// Draw the text descriptions

legend.append("text")
    .attr("x", legendRectSize + legendSpacing)
    .attr("y", legendRectSize / 2)
    .attr("dy", "0.35em")
    .style("font-family", "Montserrat")
    .style("font-size", "14px")  // Adjust the size as necessary
    .style("text-anchor", "start")
    .style("fill", "#FFF")  // Assuming you want white color
    .text(function(d) { return d; });


/*
legend.append('text')
  .attr('x', legendRectSize + legendSpacing)
  .attr('y', legendRectSize - legendSpacing)
  .attr("dy", ".35em")
  .style("text-anchor", "end")
  .attr("font-family", "Montserrat")
  .text(function(d) { return d; });
*/

// Debugging logs (Optional)
