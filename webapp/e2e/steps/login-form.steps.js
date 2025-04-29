const puppeteer = require('puppeteer');
const { defineFeature, loadFeature } = require('jest-cucumber');
const setDefaultOptions = require('expect-puppeteer').setDefaultOptions
const feature = loadFeature('./features/login-form.feature');


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
    });




    test('The user is already registered in the system', ({ given, when, then }) => {

        let username;
        let password;
        let name;
        let surname;
        given('A registered user', async () => {
            username = "PRUEBA12345678"
            password = "P1234567"
            name = "german"
            surname = "de la llana"

            await expect(page).toClick('a[href="/register"]');

            await expect(page).toFill('input[name="username"]', username);
            await expect(page).toFill('input[name="password"]', password);
            await expect(page).toFill('input[name="name"]', name);
            await expect(page).toFill('input[name="surname"]', surname);
            await expect(page).toClick('button', { text: 'Submit' })

            await expect(page).toClick('button', { text: 'Sign out' }); 


        });

        when('I fill the data in the form and press sign in', async () => {
            await expect(page).toFill('input[name="username"]', username);
            await expect(page).toFill('input[name="password"]', password);
            
            await expect(page).toClick('button', { text: 'Sign In' })
        });

        then('I should be redirect to the homepage', async () => {
            await expect(page).toMatchElement('button', { text: "Play" });

        });
    },60000)

    afterAll(async () => {
        browser.close()
    })

});