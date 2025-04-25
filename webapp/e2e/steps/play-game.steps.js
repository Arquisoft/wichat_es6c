const puppeteer = require('puppeteer');
const { defineFeature, loadFeature } = require('jest-cucumber');
const setDefaultOptions = require('expect-puppeteer').setDefaultOptions
const feature = loadFeature('./features/play-game.feature');


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

        });

        when('I press "PLAY" and select normal game option "Países"', async () => {
            await expect(page).toClick('button', { text: "Play" });
            await expect(page).toClick('button:nth-child(1) > img');
            await expect(page).toClick('#root > div > div > div > button > img');
        });
        then('A new game starts', async () => {
            await page.waitForSelector('h5', { timeout: 20000 });
        
            await expect(page).toMatchElement("h5", { text: 'Which country does this image belong to?' });
        });
    })

    afterAll(async () => {
        browser.close()
    })

});