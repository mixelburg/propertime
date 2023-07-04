import puppeteer, {Page, WaitForSelectorOptions} from 'puppeteer';
import {config} from "./config.js";
import logger from "./logger.js";


export const taskOptions = [
    'punchIn',
    'punchOut'
] as const

export type Task = typeof taskOptions[number]

const typeWithRandomDelay = async (page: Page, selector: string, value: string) => {
    logger.info(`typing ${value} into ${selector}`)
    // time each letter with a random delay between 50 and 150 ms
    for (const letter of value.split('')) {
        await page.type(selector, letter, {delay: Math.random() * 100 + 20});
    }
}

const randomDelay = async () => {
    // wait a random delay between 0.3 and 1 seconds
    await new Promise(resolve => setTimeout(resolve, Math.random() * 700 + 300));
}

const delay = async (ms: number) => {
    await new Promise(resolve => setTimeout(resolve, ms));
}

const waitSelector = async (title: string, page: Page, selector: string, options?: WaitForSelectorOptions) => {
    logger.info(`waiting for ${title} ${selector}`)
    await page.waitForSelector(selector, options);
}

const type = async (title: string, page: Page, selector: string, value: string) => {
    await randomDelay()
    logger.info(`typing ${title} ${value}`)
    await typeWithRandomDelay(page, selector, value)
}

const click = async (title: string, page: Page, selector: string) => {
    await randomDelay()
    logger.info(`clicking ${title} ${selector}`)
    await page.click(selector);
}

const waitLoader = async (page: Page) => {
    logger.info('waiting for loading spinner to disappear', config.LOADING_SPINNER_SELECTOR)
    await page.waitForSelector(config.LOADING_SPINNER_SELECTOR, {hidden: true});
}

const getSelectorValue = async (title: string, page: Page, selector: string): Promise<string> => {
    logger.info(`retrieving ${title} ${selector}`)
    return await page.$eval(selector, (el: any) => el.value)
}

const select = async (title: string, page: Page, selector: string, value: string) => {
    await randomDelay()

    // find the task select element
    const taskSelect = await page.$(selector)
    if (!taskSelect) throw new Error(`could not find ${title} ${selector}`)
    // make it visible

    logger.info(`making visible ${title} ${selector}`)
    await taskSelect?.evaluate((el: any) => el.style.display = 'block')

    logger.info(`selecting ${title} ${value}`)
    await page.select(selector, value)
    await page.$eval(selector, el => el.dispatchEvent(new Event('change', {bubbles: true})))
}

const login = async (page: Page) => {
    logger.info(`going to propertime login page at ${config.PROPERTIME_URL}`)
    await page.goto(config.PROPERTIME_URL);

    await waitSelector('username input', page, config.USERNAME_INPUT_SELECTOR)
    await waitSelector('login button', page, config.LOGIN_BUTTON_SELECTOR)

    await type('username', page, config.USERNAME_INPUT_SELECTOR, config.USERNAME)
    await type('password', page, config.PASSWORD_INPUT_SELECTOR, config.PASSWORD)
    await click('login button', page, config.LOGIN_BUTTON_SELECTOR)

    logger.info('waiting for page navigation')
    await page.waitForNavigation();

    await waitLoader(page)
}

const punchIn = async (page: Page) => {
    const inValueExists = await page.$(config.IN_TIME_VALUE_SELECTOR)
    if (inValueExists) {
        const inTime = await getSelectorValue('in time', page, config.IN_TIME_VALUE_SELECTOR);
        logger.info(`already punched in at ${inTime}`)
        return
    }
    await click('punch in button', page, config.PUNCH_IN_BUTTON_SELECTOR)
    await waitLoader(page)
    await delay(5000)
}

const punchOut = async (page: Page) => {
    await waitSelector('in time value field', page, config.IN_TIME_VALUE_SELECTOR)

    // check if already punched out
    const outValueExists = await page.$(config.OUT_TIME_VALUE_SELECTOR)
    if (outValueExists) {
        const outTime = await getSelectorValue('out time', page, config.OUT_TIME_VALUE_SELECTOR);
        logger.info(`already punched out at ${outTime}`)
        return
    }

    await click('punch out button', page, config.PUNCH_OUT_BUTTON_SELECTOR)
    await waitLoader(page)

    await delay(5000)

    const inTime = await getSelectorValue('in time', page, config.IN_TIME_VALUE_SELECTOR)
    const outTime = await getSelectorValue('out time', page, config.OUT_TIME_VALUE_SELECTOR);

    await click('add row button', page, config.ADD_ROW_BUTTON_SELECTOR)
    await waitSelector('start time field', page, config.START_TIME_FIELD_SELECTOR)
    await type('in time', page, config.START_TIME_FIELD_SELECTOR, inTime);
    await type('end time', page, config.END_TIME_FIELD_SELECTOR, outTime);
    await select('task', page, config.TASK_SELECT_SELECTOR, config.TASK_CELL_VALUE)

    await click('save button', page, config.SAVE_ROW_BUTTON_SELECTOR)
    await waitLoader(page)
    await delay(5000)
}

export const main = async (task: Task) => {
    const browser = await puppeteer.launch({
        headless: !config.HEADED,
        args: ['--no-sandbox']
    });
    const page = await browser.newPage();

    page.on('dialog', async dialog => {
        logger.info(`dialog message: ${dialog.message()}`);
        await dialog.accept();
    });


    const context = browser.defaultBrowserContext();
    await context.overridePermissions(config.PROPERTIME_URL, ['geolocation']);
    await page.setGeolocation({latitude: config.LATITUDE, longitude: config.LONGITUDE})


    logger.info(`Starting task: ${task}`)

    await login(page)

    // wait 3 seconds for the page to load
    await delay(5000)

    logger.info(`Processing task: ${task}`)
    switch (task) {
        case 'punchIn':
            await punchIn(page)
            break;
        case 'punchOut':
            await punchOut(page)
            break;
    }
    logger.info(`Finished task: ${task}, closing browser`)
    await browser.close();
}

