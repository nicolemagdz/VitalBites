package main

import (
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"github.com/graphql-go/graphql"
	"github.com/graphql-go/handler"
)

// Nutrient-fetching logic
func fetchFoodData(foodID string) (map[string]interface{}, error) {
	// API key and base URL
	apiKey := "FtBPJ1szonFLDYUrYeDhFkE2RGOlrQEQzHdJdohg"
	baseURL := "https://api.nal.usda.gov/fdc/v1/food/"

	// Construct the URL
	url := fmt.Sprintf("%s%s?api_key=%s", baseURL, foodID, apiKey)

	// Make the HTTP GET request
	resp, err := http.Get(url)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	// Read and parse the response
	body, err := io.ReadAll(resp.Body)  // Replaced ioutil.ReadAll with io.ReadAll
	if err != nil {
		return nil, err
	}

	var result map[string]interface{}
	err = json.Unmarshal(body, &result)
	if err != nil {
		return nil, err
	}

	return result, nil
}

// GraphQL Schema and Root Query (the new part)
var foodType = graphql.NewObject(graphql.ObjectConfig{
	Name: "Food",
	Fields: graphql.Fields{
		"energy": &graphql.Field{
			Type: graphql.Int,
		},
		"totalFat": &graphql.Field{
			Type: graphql.Int,
		},
		"saturatedFat": &graphql.Field{
			Type: graphql.Int,
		},
		"transFat": &graphql.Field{
			Type: graphql.Int,
		},
		"cholesterol": &graphql.Field{
			Type: graphql.Int,
		},
		"sodium": &graphql.Field{
			Type: graphql.Int,
		},
		"totalCarbs": &graphql.Field{
			Type: graphql.Int,
		},
		"dietaryFiber": &graphql.Field{
			Type: graphql.Int,
		},
		"totalSugar": &graphql.Field{
			Type: graphql.Int,
		},
		"protein": &graphql.Field{
			Type: graphql.Int,
		},
		"vitamins": &graphql.Field{
			Type: graphql.NewList(graphql.String),
		},
		"minerals": &graphql.Field{
			Type: graphql.NewList(graphql.String),
		},
	},
})

var rootQuery = graphql.NewObject(graphql.ObjectConfig{
	Name: "RootQuery",
	Fields: graphql.Fields{
		"foodData": &graphql.Field{
			Type: graphql.NewList(foodType),
			Args: graphql.FieldConfigArgument{
				"foodID": &graphql.ArgumentConfig{
					Type: graphql.String,
				},
			},
			Resolve: func(params graphql.ResolveParams) (interface{}, error) {
				foodID, ok := params.Args["foodID"].(string)
				if !ok {
					return nil, fmt.Errorf("foodID argument is required")
				}

				// Fetch food data from the FoodData Central API
				data, err := fetchFoodData(foodID)
				if err != nil {
					return nil, err
				}

				// Process nutrients and return
				nutrients := data["foodNutrients"].([]interface{})
				var totalCalories, totalFat, totalSaturatedFat, totalTransFat, totalCholesterol, totalSodium, totalCarbs, totalFiber, totalSugar, totalProtein int
				var vitamins, minerals []string

				for _, nutrientRaw := range nutrients {
					nutrient := nutrientRaw.(map[string]interface{})
					nutrientName := nutrient["nutrientName"].(string)
					value := nutrient["value"].(float64)

					switch nutrientName {
					case "Energy":
						totalCalories += int(value)
					case "Total Fat":
						totalFat += int(value)
					case "Saturated Fatty Acids":
						totalSaturatedFat += int(value)
					case "Trans Fatty Acids":
						totalTransFat += int(value)
					case "Cholesterol":
						totalCholesterol += int(value)
					case "Sodium":
						totalSodium += int(value)
					case "Total Carbohydrate":
						totalCarbs += int(value)
					case "Dietary Fiber":
						totalFiber += int(value)
					case "Total Sugars":
						totalSugar += int(value)
					case "Protein":
						totalProtein += int(value)
					case "Vitamin A", "Vitamin C", "Vitamin D", "Vitamin E", "Vitamin K":
						if value >= 10 {
							vitamins = append(vitamins, fmt.Sprintf("%s: %d%%", nutrientName, int(value)))
						}
					case "Calcium", "Iron", "Magnesium", "Potassium":
						minerals = append(minerals, fmt.Sprintf("%s: %d%%", nutrientName, int(value)))
					}
				}

				return []map[string]interface{}{
					{
						"energy":       totalCalories,
						"totalFat":     totalFat,
						"saturatedFat": totalSaturatedFat,
						"transFat":     totalTransFat,
						"cholesterol":  totalCholesterol,
						"sodium":       totalSodium,
						"totalCarbs":   totalCarbs,
						"dietaryFiber": totalFiber,
						"totalSugar":   totalSugar,
						"protein":      totalProtein,
						"vitamins":     vitamins,
						"minerals":     minerals,
					},
				}, nil
			},
		},
	},
})

// Main function to start the server
func main() {
	// Initialize GraphQL schema
	schema, err := graphql.NewSchema(graphql.SchemaConfig{
		Query: rootQuery,
	})
	if err != nil {
		fmt.Println("Error creating GraphQL schema:", err)
		return
	}

	// Set up GraphQL HTTP handler
	http.Handle("/graphql", handler.New(&handler.Config{
		Schema: &schema,
		Pretty: true,
	}))

	// Serve on port 8080 (or any port you like)
	http.ListenAndServe(":8080", nil)
}
