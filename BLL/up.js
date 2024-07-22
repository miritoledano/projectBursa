async function update() {
    try {
        // const names=['zyxi','zyme','zws','zvsa','zvra','zvia','zura','zuo'];
         const stockNames = await getStockNames();
        const chunks = divideArrToChunks(stockNames);
        const allQuotes = [];
        for (const chunk of chunks) {
            for (const item of chunk) {
                try {
                    const quotes = await currentStock(item);
                    if (!quotes) {
                        console.error(`No quotes returned for ${item}`);
                        continue;
                    }
                    allQuotes.push(...quotes);
                  
                    let data = readFromCsv(`C:/ProjectBursa/BLL/Stocks/${item}.csv`);

                    let csvData = parseCsvDataToJson(data);

                    if (!csvData) {
                        console.error(`No CSV data found for ${item}`);
                        csvData = [];
                    }

                    csvData = [...csvData, ...quotes];
                  
                    writeToCsv(item, csvData);
                    await delay(1000); // Delay between API calls
                } catch (error) {
                    console.error(`Error processing ${item}:`, error);
                }
            }
        }
        return allQuotes;
    } catch (error) {
        console.error('Error updating stocks:', error);
        return [];
    }
}



