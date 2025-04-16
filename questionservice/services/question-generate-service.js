const axios = require('axios');
const dataService = require('./question-data-service');
const utils = require('../utils/utils');
const Question = require('../models/question-model');

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

let wikidataCategoriesQueries;

async function init() {
    const json = await utils.readFromFile("../utils/queryCategories.json");
    wikidataCategoriesQueries = JSON.parse(json);
}

// Obtener imágenes de una categoría en Wikidata
async function getImagesFromWikidata(category, numImages) {
 
    if(!numImages || numImages <= 0 || isNaN(numImages)){
        // Verifica si numImages es un número positivo{
        console.error(`numImages must be a positive number`);
        throw new Error("numImages must be a positive number");
    }
    
    //const categoryQueries = wikidataCategoriesQueries[category];

    // Acceder directamente a la consulta correspondiente a la categoría dada
    const categoryQueries = wikidataCategoriesQueries[category]?.query;

    if (!categoryQueries) {
        throw new Error(`The given category does not exist:  ${category}`);
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
            const fields = wikidataCategoriesQueries[category]?.fields;
            if (!fields) {
                throw new Error(`Fields not defined for category: ${category}`);
            }
            const { label, image, extra } = fields;

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
        return []; // Retornar un array vacío si no hay datos

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
    let questions=[];
    for (const image of images) {
        const incorrectAnswers = await getIncorrectOptions(image.country);
        if (incorrectAnswers.length < 3) continue; // Si no hay suficientes respuestas incorrectas, saltamos

        // Crear opciones y mezclarlas
        const options = [image.country, ...incorrectAnswers].sort(() => 0.5 - Math.random());

        // Generar pregunta
        const questionText = wikidataCategoriesQueries[category]?.question;
        
        const newQuestion = {
            question: questionText,
            options: options,
            correctAnswer: image.country,
            category: category,
            imageUrl: image.imageUrl
        };
        console.log(newQuestion);
        questions.push(newQuestion);

        await dataService.saveQuestion(newQuestion);
        console.log("Question saved:", newQuestion);

    }
    console.error("Images retrieved:", questions);
    return questions;
}

// Generate questions
async function generateQuestionsByCategory(category, numImages) {
    try{
        await init();
        const images = await getImagesFromWikidata(category, numImages);
        if (images.length === 0) {
            console.error(`No images found for category ${category}`);
            return [];
        }

        processQuestions(images, category);
    }catch (error) {
        console.error("Error generating questions:", error.message);
        throw new Error(error.message);
    }
    return [];
}

module.exports = {
    generateQuestionsByCategory
};
 