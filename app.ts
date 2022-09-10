import {join} from 'path';
import {config} from 'dotenv';
import puppeteer, {Page, Permission} from 'puppeteer';

// read .env file
config();

const SCREENSHOTS_PATH = process.env.SCREENSHOTS_PATH as string;

const PROPERTIME_URL = process.env.PROPERTIME_URL as string
const ALLOWED_PERMISSIONS: Permission[] = JSON.parse(process.env.ALLOWED_PERMISSIONS || '[]');

const USERNAME = process.env.USERNAME_VALUE as string;
const PASSWORD = process.env.PASSWORD_VALUE as string;
const CUSTOMER = process.env.CUSTOMER as string;
const PROJECT = process.env.PROJECT as string;
const TASK = process.env.TASK as string;

const USERNAME_SELECTOR = process.env.USERNAME_SELECTOR as string;
const PASSWORD_SELECTOR = process.env.PASSWORD_SELECTOR as string;
const LOGIN_BUTTON_SELECTOR = process.env.LOGIN_BUTTON_SELECTOR as string;
const LOADING_SPINNER_SELECTOR = process.env.LOADING_SPINNER_SELECTOR as string;
const PUNCH_IN_BUTTON_SELECTOR = process.env.PUNCH_IN_BUTTON_SELECTOR as string;
const PUNCH_OUT_BUTTON_SELECTOR = process.env.PUNCH_OUT_BUTTON_SELECTOR as string;


const ADD_ROW_BUTTON_SELECTOR = process.env.ADD_ROW_BUTTON_SELECTOR as string;
const SAVE_ROW_BUTTON_SELECTOR = process.env.SAVE_ROW_BUTTON_SELECTOR as string;

const START_TIME_FIELD_SELECTOR = process.env.START_TIME_FIELD_SELECTOR as string;
const END_TIME_FIELD_SELECTOR = process.env.END_TIME_FIELD_SELECTOR as string;
const CUSTOMER_CELL_SELECT_SELECTOR = process.env.CUSTOMER_CELL_SELECT_SELECTOR as string;
const PROJECT_CELL_SELECT_SELECTOR = process.env.PROJECT_CELL_SELECT_SELECTOR as string;
const TASK_CELL_SELECT_SELECTOR = process.env.TASK_CELL_SELECT_SELECTOR as string;


type Task = 'punchIn' | 'punchOut'
const argv = process.argv.slice(2) as [Task]
const task = argv[0]

const LATITUDE = 32.10875791175589
const LONGITUDE = 34.838625732746685

const browser = await puppeteer.launch({headless: false});
const page = await browser.newPage();

const context = browser.defaultBrowserContext()
await context.overridePermissions(PROPERTIME_URL, ALLOWED_PERMISSIONS)
await page.setGeolocation({latitude: LATITUDE, longitude: LONGITUDE})

const getScreenshot = async (page: Page, fileName: string) => {
    await page.screenshot({path: join(SCREENSHOTS_PATH, `${fileName}.png`)});
}

const fillInCell = async (page: Page, selector: string, value: string) => {
    console.log(`filling in cell ${selector} with value ${value}`)
    for (const child of await page.$$(selector)) {
        const chosenSingle = await child.$('[class="chosen-container chosen-container-single"]')
        if (chosenSingle) {
            await chosenSingle.click()

            console.log('waiting for dropdown to be visible')
            await page.waitForSelector('[class="chosen-drop"]', {visible: false})

            const input = await (await (await child.$('[class="chosen-drop"]'))?.$('[class="chosen-search"]'))?.$('input')
            if (input) {
                input.click()
                console.log(`typing ${value}`)
                await page.keyboard.type(value, {delay: 100});
                await page.keyboard.type(' ', {delay: 100});
                await page.keyboard.press('Enter');
            } else {
                console.log(`input not found for ${selector}`)
            }
            break
        } else {
            console.log(`could not find ${selector}`)
        }
    }
}


const main = async () => {
    console.log(`Starting task: ${task}`)

    console.log('going to propertime login page')
    await page.goto(PROPERTIME_URL);
    console.log('getting screenshot of login page')
    await getScreenshot(page, 'login-page');

    console.log('waiting for username input', USERNAME_SELECTOR)
    await page.waitForSelector(USERNAME_SELECTOR);
    console.log('waiting for password input', PASSWORD_SELECTOR)
    await page.waitForSelector(PASSWORD_SELECTOR)

    console.log('typing username', USERNAME)
    await page.type(USERNAME_SELECTOR, USERNAME);
    console.log('typing password', PASSWORD)
    await page.type(PASSWORD_SELECTOR, PASSWORD);

    console.log('taking screenshot of login page with username and password')
    await getScreenshot(page, 'login-page-before-submit');

    console.log('clicking login button', LOGIN_BUTTON_SELECTOR)
    await page.click(LOGIN_BUTTON_SELECTOR);

    console.log('waiting for page navigation')
    await page.waitForNavigation();

    await getScreenshot(page, 'main-page-loading');

    console.log('waiting for loading spinner to disappear', LOADING_SPINNER_SELECTOR)
    await page.waitForSelector(LOADING_SPINNER_SELECTOR, {hidden: true});
    await getScreenshot(page, 'main-page');


    console.log(`Processing task: ${task}`)
    switch (task) {
        case 'punchIn':
            console.log('pressing punch in button', PUNCH_IN_BUTTON_SELECTOR)
            await page.click(PUNCH_IN_BUTTON_SELECTOR);
            console.log('waiting for loading spinner to disappear', LOADING_SPINNER_SELECTOR)
            await page.waitForSelector(LOADING_SPINNER_SELECTOR, {hidden: true});

            console.log('taking screenshot after punch in')
            await getScreenshot(page, 'punch-in');
            break;
        case 'punchOut':
            console.log('pressing punch out button', PUNCH_OUT_BUTTON_SELECTOR)
            await page.click(PUNCH_OUT_BUTTON_SELECTOR);
            console.log('waiting for loading spinner to disappear', LOADING_SPINNER_SELECTOR)
            await page.waitForSelector(LOADING_SPINNER_SELECTOR, {hidden: true});

            console.log('pressing add row button', ADD_ROW_BUTTON_SELECTOR)
            await page.click(ADD_ROW_BUTTON_SELECTOR);

            console.log('taking screenshot after punch out')
            await getScreenshot(page, 'punch-out');

            console.log('waiting for start time field', START_TIME_FIELD_SELECTOR)
            await page.waitForSelector(START_TIME_FIELD_SELECTOR);
            console.log('typing start time', START_TIME_FIELD_SELECTOR)
            await page.type(START_TIME_FIELD_SELECTOR, '09:00');
            console.log('typing end time', END_TIME_FIELD_SELECTOR)
            await page.type(END_TIME_FIELD_SELECTOR, '18:00');

            console.log('filling in customer cell', CUSTOMER_CELL_SELECT_SELECTOR)
            await fillInCell(page, CUSTOMER_CELL_SELECT_SELECTOR, CUSTOMER)
            console.log('filling in project cell', PROJECT_CELL_SELECT_SELECTOR)
            await fillInCell(page, PROJECT_CELL_SELECT_SELECTOR, PROJECT)
            console.log('filling in task cell', TASK_CELL_SELECT_SELECTOR)
            await fillInCell(page, TASK_CELL_SELECT_SELECTOR, TASK)

            console.log('taking screenshot before adding row')
            await getScreenshot(page, 'add-row');

            console.log('pressing save button', SAVE_ROW_BUTTON_SELECTOR)
            await page.click(SAVE_ROW_BUTTON_SELECTOR);
            break;
    }
    console.log(`Finished task: ${task}, closing browser`)
    // await browser.close();
}

await main()


export {}
