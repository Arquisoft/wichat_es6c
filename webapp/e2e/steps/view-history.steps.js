const puppeteer = require('puppeteer');
const { defineFeature, loadFeature } = require('jest-cucumber');
const setDefaultOptions = require('expect-puppeteer').setDefaultOptions
const feature = loadFeature('./features/view-history.feature');

const axios = require('axios');
jest.setTimeout(60000); // <-- Aumentar timeout global
let page;
let browser;

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

        let username = "cucumber-historial"
        let password = "P1234567"
        let name = "batman"
        let surname = "de la llana"

        await expect(page).toClick('a[href="/register"]');

        await expect(page).toFill('input[name="username"]', username);
        await expect(page).toFill('input[name="password"]', password);
        await expect(page).toFill('input[name="name"]', name);
        await expect(page).toFill('input[name="surname"]', surname);
        await expect(page).toClick('button', { text: 'Submit' })

        
        await axios.post('http://localhost:8000/createUserHistory', {
            username: "cucumber-historial",
            games: [
                {
                    date: "2025-04-26",
                    score: 85,
                    correctAnswers: 8,
                    incorrectAnswers: 2,
                    time: "5:30",
                    gameMode: "country"
                },
                {
                    date: "2025-04-25",
                    score: 90,
                    correctAnswers: 9,
                    incorrectAnswers: 1,
                    time: "4:50",
                    gameMode: "country"
                }
            ]
        });
    });

    test('Viewing history as a registered user', ({ given, when, then }) => {
        given('a logged-in user on the homepage', async () => {
            await expect(page).toMatchElement('button', { text: "More game modes" });

           
        });

        when('the user clicks on "PROFILE"', async () => {
            await expect(page).toClick('button', { text: 'Profile' });
        });

        then("the user's history should be displayed", async () => {
             
             await expect(page).toClick('button', { text: 'View History' });
             
 
             await expect(page).toClick('button', { text: 'View Stats' });
             
 
             await expect(page).toClick('button', { text: 'View Ranking' });
             

        });
    }); // Increased timeout to 300000 ms (5 minutes)

    afterAll(async () => {
        await browser.close();
    });

}); // Increased timeout to 300000 ms (5 minutes)