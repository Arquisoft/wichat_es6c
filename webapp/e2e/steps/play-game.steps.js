const puppeteer = require('puppeteer');
const { defineFeature, loadFeature } = require('jest-cucumber');
const setDefaultOptions = require('expect-puppeteer').setDefaultOptions
const feature = loadFeature('./features/play-game.feature');
const axios = require('axios');
let page;
let browser;

const questions = [
    {
        question: "Which country does this image belong to?",
        options: ["France", "Italy", "Germany", "Spain"],
        correctAnswer: "France",
        category: "country",
        language: "en",
        imageUrl: 'http://commons.wikimedia.org/wiki/Special:FilePath/Eiffel_Tower.jpg'
    },
    {
        question: "Which country does this image belong to?",
        options: ["Japan", "China", "South Korea", "Thailand"],
        correctAnswer: "Japan",
        category: "country",
        language: "en",
        imageUrl: 'http://commons.wikimedia.org/wiki/Special:FilePath/Mount_Fuji.jpg'
    },
    {
        question: "Which country does this image belong to?",
        options: ["Brazil", "Argentina", "Chile", "Colombia"],
        correctAnswer: "Brazil",
        category: "country",
        language: "en",
        imageUrl: 'http://commons.wikimedia.org/wiki/Special:FilePath/Christ_the_Redeemer.jpg'
    },
    {
        question: "Which country does this image belong to?",
        options: ["United States", "Canada", "Mexico", "Cuba"],
        correctAnswer: "United States",
        category: "country",
        language: "en",
        imageUrl: 'http://commons.wikimedia.org/wiki/Special:FilePath/Statue_of_Liberty.jpg'
    },
    {
        question: "Which country does this image belong to?",
        options: ["Egypt", "Morocco", "South Africa", "Kenya"],
        correctAnswer: "Egypt",
        category: "country",
        language: "en",
        imageUrl: 'http://commons.wikimedia.org/wiki/Special:FilePath/Great_Pyramids.jpg'
    },
    {
        question: "Which country does this image belong to?",
        options: ["Australia", "New Zealand", "Fiji", "Papua New Guinea"],
        correctAnswer: "Australia",
        category: "country",
        language: "en",
        imageUrl: 'http://commons.wikimedia.org/wiki/Special:FilePath/Sydney_Opera_House.jpg'
    },
    {
        question: "Which country does this image belong to?",
        options: ["India", "Pakistan", "Bangladesh", "Sri Lanka"],
        correctAnswer: "India",
        category: "country",
        language: "en",
        imageUrl: 'http://commons.wikimedia.org/wiki/Special:FilePath/Taj_Mahal.jpg'
    },
    {
        question: "Which country does this image belong to?",
        options: ["Russia", "Ukraine", "Poland", "Belarus"],
        correctAnswer: "Russia",
        category: "country",
        language: "en",
        imageUrl: 'http://commons.wikimedia.org/wiki/Special:FilePath/St_Basils_Cathedral.jpg'
    },
    {
        question: "Which country does this image belong to?",
        options: ["Italy", "Greece", "Turkey", "Croatia"],
        correctAnswer: "Italy",
        category: "country",
        language: "en",
        imageUrl: 'http://commons.wikimedia.org/wiki/Special:FilePath/Colosseum.jpg'
    },
    {
        question: "Which country does this image belong to?",
        options: ["United Kingdom", "Ireland", "Scotland", "Wales"],
        correctAnswer: "United Kingdom",
        category: "country",
        language: "en",
        imageUrl: 'http://commons.wikimedia.org/wiki/Special:FilePath/Big_Ben.jpg'
    },
    {
        question: "Which country does this image belong to?",
        options: ["Canada", "United States", "Norway", "Sweden"],
        correctAnswer: "Canada",
        category: "country",
        language: "en",
        imageUrl: 'http://commons.wikimedia.org/wiki/Special:FilePath/Niagara_Falls.jpg'
    }
];

defineFeature(feature, test => {

    beforeAll(async () => {
        browser = process.env.GITHUB_ACTIONS
            ? await puppeteer.launch({ headless: "new", args: ['--no-sandbox', '--disable-setuid-sandbox'] })
            : await puppeteer.launch({ headless: false, slowMo: 100 });
        page = await browser.newPage();
        //Way of setting up the timeout
        setDefaultOptions({ timeout: 10000 })

        await page
            .goto("http://localhost:3000", {
                waitUntil: "networkidle0",
            })
            .catch(() => { });

        let username = "PARTIDA12345678"
        let password = "P1234567"
        let name = "german"
        let surname = "de la llana"

        await expect(page).toClick('a[href="/register"]');

        await expect(page).toFill('input[name="username"]', username);
        await expect(page).toFill('input[name="password"]', password);
        await expect(page).toFill('input[name="name"]', name);
        await expect(page).toFill('input[name="surname"]', surname);
        await expect(page).toClick('button', { text: 'Submit' })

       
    });




    test('A registered user starts a new game', ({ given, when, then }) => {



        given('A logged user in play view', async () => {
            await expect(page).toMatchElement('button', { text: "Play" });
            await axios.post('http://localhost:8000/questions', { questions });

        });

        when('I press "PLAY" and select normal game option "Países"', async () => {
            await expect(page).toClick('button', { text: "Play" });
            await expect(page).toClick('button:nth-child(1) > img');
            await expect(page).toClick('#root > div > div > div > button > img');
        });
        then('A new game starts and the user can play', async () => {
            for (let i = 0; i < 10; i++) {
                await expect(page).toMatchElement("h5", { text: 'Which country does this image belong to?' });

                await page.click('[data-testid="option-0"]');


                await page.waitForTimeout(3000);
            }


        });
    }, 80000)

    afterAll(async () => {

        browser.close();

    })

});