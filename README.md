## **Phala Token Circulation Visualization**
<img width="1271" alt="截屏2023-08-25 23 45 06" src="https://github.com/Marvin-Cypher/pha-circulation/assets/57211675/f321939b-824d-465b-a002-1e4510b79060">

This project provides a visual representation of the Phala token circulation based on the Phala tokenomic [wiki](https://docs.phala.network/pha-token/introduction) & [V0.9 Tokenomic Whitepaper](https://files.phala.network/phala-token-economics-en.pdf).


### **Features**

1. **Dynamic Visualization**: Data-driven visualization of token allocations over time using a stacked area chart.
2. **Tooltip**: Provides detailed allocation data when hovering over a specific area of the chart.
3. **Interactive**: Responsive design and tooltip adjustments ensure an intuitive user experience.
4. **Styling**: Custom color scheme and styling using CSS properties and D3.js.

### **Allocation Algorithms**

- Total Supply of $PHA = 10,000,000,000
- Allocation
    - Compute Reward = 70%
    - Stakedrop = 2.1%
    - Testnet Reward = 1%
    - Investors = 15%
    - Slot Auction = 6.9%
    - Founder Team = 5%

#### 1. **Investors**

- 60% of the allocation ratio is unlocked on 2020/09/10.
- 20% of the total ratio is unlocked after 6 months from the initial unlock date.
- The remaining 20% of the total ratio is unlocked after another 6 months.
- 100% of the ratio is unlocked after 1 year from 2020/09/10.
[source](https://files.phala.network/phala-token-economics-en.pdf)

```javascript
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
```

#### 2. **Computation Reward**

There'a [project](https://github.com/Marvin-Cypher/pha_distribution) for detailed $PHA token halving graph.

The "Real" compute tokenomic launch on both Khala & Phala

- Start with an initial daily reward of 720k on 2022-04-08. 
- After each 180 days, reduce the daily reward by 25%.
- Continue until the daily reward becomes negligible or virtually 0
- [Source](https://khala.subsquare.io/democracy/referenda/27)

The "canary" computate tokenomic launch on Khala

- Start with an initial daily reward of 60k on 2021-09-20.
- After each 45 days, reduce the daily reward by 25%.
- Continue until the data 2022-04-08
- [Source](https://medium.com/phala-network/reading-phala-network-economic-paper-preview-5f33b7019861)

Compute "Halving" Data
```javascript
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
```

Processing data since 2022-04-08

```javascript
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
```
#### 3. **Stakedrop**

100% of the ratio is unlocked on 2020/09/10.
[Source](https://medium.com/phala-network/meet-the-first-of-its-kind-ksm-stakedrop-by-phala-10f0bc73432a)

```javascript
if (newDate >= new Date(2020, 8, 10)) {
        datum["Stakedrop"] = RATIOS["Stakedrop"] * TOTAL_SUPPLY;
    }
```

#### 4. **Testnet Incentive**
100% of the ratio is unlocked on 2021/06/30
[source](https://files.phala.network/phala-token-economics-en.pdf)

```javascript
if (newDate >= new Date(2021, 5, 30)) {
        datum["Testnet Reward"] = RATIOS["Testnet Reward"] * TOTAL_SUPPLY;
    }
```

#### 5. **Parachain Slot Auction**


- Kusama (2.5% of all supply) 
    - 34% of this ratio is released on 2021/7/31.
    - The remaining 66% is vested monthly over 11 months.
    - [Source](https://medium.com/phala-network/ann-khala-crowdloan-and-vendetta-testnet-rewards-distribution-done-check-them-now-b77547d9a469)
- Polkadot  (2.21% of all supply)
    - 15% of this ratio is unlocked on 2022-06-03.
    - The remaining 85% will be linearly vested over 96 weeks.
    - [Source](https://medium.com/phala-network/phalas-polkadot-slot-auction-strategy-d7432e73b6c)

- Reserved (21,826,465) = Locked

```javascript
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
```

#### 6. **Founder Team**

- 20% is unlocked initially on 2020/09/10.
- For each of the next 16 months, 5% of the total "Founder team" tokens will be unlocked.

[source](https://files.phala.network/phala-token-economics-en.pdf)

```javascript
if (newDate >= new Date(2020, 8, 10)) {
        datum["Founder Team"] = 0.2 * RATIOS["Founder Team"] * TOTAL_SUPPLY;
    if (i > 12 && i <= 28) {  // For the subsequent 16 months
        datum["Founder Team"] += (i - 12) * 0.05 * RATIOS["Founder Team"] * TOTAL_SUPPLY;  // 5% unlocked every month
    } else if (i > 28) {
        datum["Founder Team"] = RATIOS["Founder Team"] * TOTAL_SUPPLY;  // All tokens are unlocked after 16 months
    }
```

### **Technologies Used**

- **D3.js**: For data-driven visualizations.
- **JavaScript**: To handle interactivity and data processing.
- **CSS**: For styling the SVG and chart elements.

### **How to Run the Project**

1. Clone the repository.
2. Open `index.html` in a web browser to view the visualization.
3. The data used for the visualization is located in `data.json`. You can update or replace this data as needed.



### **Credits**

This project was inspired by the Phala Network's tokenomics. The D3.js library was crucial in bringing this visualization to life.

### **License**

MIT License. Feel free to use, modify, and distribute as needed.

