const axios = require('axios');
const dataService = require('./question-data-service');

/*const wikidataCategoriesQueries = {   
    "country": {  // Eliminar el punto al final del nombre de la categoría
        query: `
        SELECT ?city ?cityLabel ?country ?countryLabel ?image
        WHERE {
            ?city wdt:P31 wd:Q515.  # Ciudad
            ?city wdt:P17 ?country.  # País de la ciudad
            OPTIONAL { ?city wdt:P18 ?image. }  # Imagen de la ciudad (opcional)
            SERVICE wikibase:label {
                bd:serviceParam wikibase:language "[AUTO_LANGUAGE],es".
            }
        }
        ORDER BY RAND()
        LIMIT ?limit
        `,
    }   
};

const titlesQuestionsCategories = {
    "country": "¿A qué país pertenece esta imagen?"
};*/

const urlApiWikidata = 'https://query.wikidata.org/sparql';

let json = await utils.readFromFile("../questions/utils/question.json");
const wikidataCategoriesQueries = JSON.parse(json);


// Obtener imágenes de una categoría en Wikidata
async function getImagesFromWikidata(category, numImages) {

    // Acceder directamente a la consulta correspondiente a la categoría dada
    const categoryQueries = wikidataCategoriesQueries[category]?.query;

    if (!categoryQueries) {
        throw new Error(`No se encontró una consulta para la categoría: ${category}`);
    }

    // Obtención de la consulta directamente de la categoría dada
    const sparqlQuery = categoryQueries.replace('?limit', numImages);

    try {
        const response = await axios.get(urlApiWikidata, {
            params: {
                query: sparqlQuery,
                format: 'json'
            },
            headers: {
                'User-Agent': 'QuestionGeneration/1.0',
                'Accept': 'application/json'
            }
        });

        const data = response.data.results.bindings;
        if (data.length > 0) {
            const { label, image, extra } = categoryData.fields;

            const filteredImages = data
                .filter(item => item[label] && item[image])  
                .slice(0, numImages)  
                .map(item => ({
                    label: item[label].value,
                    imageUrl: item[image].value,
                    country: item[extra].value
                }));

            return filteredImages;
        }

    } catch (error) {
        console.error(`Error retrieving images: ${error.message}`);
        return [];
    }
}

async function getIncorrectOptions(correctCountry) {
    const sparqlQuery = `
        SELECT DISTINCT ?countryLabel
        WHERE {
            ?country wdt:P31 wd:Q6256.  # Q6256 = país
            SERVICE wikibase:label { bd:serviceParam wikibase:language "es". }
        }
        LIMIT 100
    `;

    try {
        const response = await axios.get(urlApiWikidata, {
            params: {
                query: sparqlQuery,
                format: 'json'
            },
            headers: {
                'User-Agent': 'QuestionGeneration/1.0',
                'Accept': 'application/json'
            }
        });

        const data = response.data.results.bindings.map(item => item.countryLabel.value);
        const incorrectOptions = data.filter(country => country !== correctCountry);
        
        // Seleccionamos aleatoriamente 3 opciones incorrectas
        return incorrectOptions.sort(() => 0.5 - Math.random()).slice(0, 3);
    } catch (error) {
        console.error(`Error retrieving countries: ${error.message}`);
        return [];
    }
}

async function processQuestions(images,category) {
    for (const image of images) {
        const incorrectAnswers = await getIncorrectOptions(image.country);
        if (incorrectAnswers.length < 3) continue; // Si no hay suficientes respuestas incorrectas, saltamos

        // Crear opciones y mezclarlas
        const options = [image.country, ...incorrectAnswers].sort(() => 0.5 - Math.random());

        // Generar pregunta
        const questionText = titlesQuestionsCategories[category]?.question; 
        
        const newQuestion = {
            question: questionText,
            options: options,
            correctAnswer: image.country,
            category: category,
            imageUrl: image.imageUrl
        };

        await dataService.saveQuestion(newQuestion);
        console.log("Question saved:", newQuestion);
    }

}

// Generate questions
async function generateQuestionsByCategory(category, numImages) {
    const images = await getImagesFromWikidata(category, numImages);
 
    processQuestions(images, category);
}

module.exports = {
    generateQuestionsByCategory
};
