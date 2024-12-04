export async function fetchFoodData(foodName) {
    const apiKey = 'FtBPJ1szonFLDYUrYeDhFkE2RGOlrQEQzHdJdohg';
    const url = `https://api.nal.usda.gov/fdc/v1/foods/search?api_key=${apiKey}&query=${encodeURIComponent(foodName)}&pageSize=1`;

    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error('Error fetching data');
        const data = await response.json();
        return data.foods[0];
    } catch (error) {
        console.error('FoodData Central API error:', error);
        return null;
    }
}