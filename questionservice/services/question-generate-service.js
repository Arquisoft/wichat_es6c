const axios = require('axios');
const dataService = require('./question-data-service');
const utils = require('../utils/utils');
const Question = require('../models/question-model');

const urlApiWikidata = 'https://query.wikidata.org/sparql';

let wikidataCategoriesQueries;

async function init() {
    const json = await utils.readFromFile("../utils/queryCategories.json");
    wikidataCategoriesQueries = JSON.parse(json);
}

init();

// Obtener imágenes de una categoría en Wikidata
async function getImagesFromWikidata(category, language, numImages) {
    
    if(!numImages || numImages <= 0 || isNaN(numImages)){
        // Verifica si numImages es un número positivo{
        console.error(`numImages must be a positive number: ${numImages}`);
        throw new Error("numImages must be a positive number");
    }
    
    //const categoryQueries = wikidataCategoriesQueries[category];

    // Acceder directamente a la consulta correspondiente a la categoría dada
    const categoryQueries = wikidataCategoriesQueries[category]?.query;

    if (!categoryQueries) {
       
        throw new Error(`The given category does not exist:  ${category}`);
    }

    // Obtención de la consulta directamente de la categoría dada
    const sparqlQuery = categoryQueries.replace('?limit', numImages).replace('[AUTO_LANGUAGE]', language);
    

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
            const { label, image, solution } = fields;

            const filteredImages = data
                .filter(item => item[label] && item[image])  
                .slice(0, numImages)  
                .map(item => ({
                    label: item[label].value,
                    imageUrl: item[image].value,
                    solution: item[solution].value
                }));

            return filteredImages;
        }
        return []; // Retornar un array vacío si no hay datos

    } catch (error) {
        console.error(`Error retrieving images: ${error.message}`);
        return [];
    }
}

function buildSparqlQuery(type, lang) {
    if (type === 'country') {
        `
        SELECT DISTINCT ?label WHERE {
            ?country wdt:P31 wd:Q6256.  # Q6256 = país
            ?country rdfs:label ?label.
            FILTER (LANG(?label) = "${lang}")
        }
        LIMIT 50
    `;
    }

    if (type === 'famous_people') {
        return `
            SELECT DISTINCT ?label WHERE {
                ?person wdt:P31 wd:Q5;
                        wdt:P106 ?occupation;
                        rdfs:label ?label.
                FILTER (LANG(?label) = "${lang}")
                VALUES ?occupation {
                    wd:Q33999 wd:Q937857 wd:Q82955 wd:Q36180
                    wd:Q188146 wd:Q49757 wd:Q3282637 wd:Q82913 wd:Q937 wd:Q901
                }
            }
            LIMIT 50
        `;
    }

    console.warn(`Unsupported type: ${type}`);
    return '';
}


async function getIncorrectOptions(correctCountry, lang) {
    const sparqlQuery = buildSparqlQuery(type, lang);
    if (!sparqlQuery) return [];
    
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

        const data = response.data.results.bindings
                    .map(item => item.label.value) 
                    .filter(label => label && !/\d/.test(label));  
    
        const incorrectOptions = data.filter(option => option !== correctAnswer);
    
        return incorrectOptions.sort(() => 0.5 - Math.random()).slice(0, 3);
    } catch (error) {
        console.error(`Error retrieving countries: ${error.message}`);
        return [];
    }
}

async function processQuestions(images,category, language) {
    let questions=[];
    for (const image of images) {
        const incorrectAnswers = await getIncorrectOptions(image.country,language);
        if (incorrectAnswers.length < 3) continue; // Si no hay suficientes respuestas incorrectas, saltamos

        // Crear opciones y mezclarlas
        const options = [image.solution, ...incorrectAnswers].sort(() => 0.5 - Math.random());

        // Generar pregunta
        //const questionText = wikidataCategoriesQueries[category]?.question;
        
        const questionText = wikidataCategoriesQueries[category]?.question?.[language]
        || "Which country does this image belong to?";

        const newQuestion = {
            question: questionText,
            options: options,
            correctAnswer: image.solution,
            category: category,
            language: language,
            imageUrl: image.imageUrl
        };
        console.log(newQuestion);
        questions.push(newQuestion);

        await dataService.saveQuestion(newQuestion);
        console.log("Question saved:", newQuestion);

    }
    return questions;
}

// Generate questions
async function generateQuestionsByCategory(category, language, numImages) {
    try {
        const images = await getImagesFromWikidata(category, language, numImages);
        if (images.length === 0) {
            console.error(`No images found for category ${category}`);
            return [];
        }

        const questions=await processQuestions(images, category, language);
        return questions;
    }catch (error) {
        console.error("Error generating questions:", error.message);
        throw new Error(error.message);
    }
    return [];
}

module.exports = {
    generateQuestionsByCategory
};
 