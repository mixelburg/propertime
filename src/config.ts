import {Permission} from "puppeteer";

import {config as envConfig} from 'dotenv'

envConfig()

const config = {
    VERSION: '2.0.0',
    LOG_LEVEL: process.env.LOG_LEVEL || 'debug',
    APP_NAME: 'propertime',
    HOST: process.env.HOST,
    HEADED: process.env.HEADED === 'true',

    PROPERTIME_URL: 'https://app.propertime.co.il/UserLogin.aspx',
    USERNAME: process.env.USERNAME_VALUE as string,
    PASSWORD: process.env.PASSWORD_VALUE as string,

    USERNAME_INPUT_SELECTOR: 'input#ctl00_Content2_txtUsername',
    PASSWORD_INPUT_SELECTOR: 'input#ctl00_Content2_txtPassword',
    LOGIN_BUTTON_SELECTOR: 'input#ctl00_Content2_btnEntry',

    LOADING_SPINNER_SELECTOR: 'div#loadingFrame',

    PUNCH_IN_BUTTON_SELECTOR: 'div#punchInNow',
    PUNCH_OUT_BUTTON_SELECTOR: 'div#punchOutNow',

    ADD_ROW_BUTTON_SELECTOR: 'input[type="button"][value="Add row"]',

    SAVE_ROW_BUTTON_SELECTOR: 'input[type="button"][value="Save"]',

    IN_TIME_VALUE_SELECTOR: 'input[title="Enter"]',
    OUT_TIME_VALUE_SELECTOR: 'input[type="text"][title="Exit"].punch-input',

    START_TIME_FIELD_SELECTOR: 'input[type="text"].start.timeField',
    END_TIME_FIELD_SELECTOR: 'input[type="text"].end.timeField',

    TASK_SELECT_SELECTOR: 'select.tasks',
    TASK_CELL_VALUE: '8d4821c6-30a2-4676-8599-0c7f1a862136',

    LATITUDE: parseFloat(process.env.LATITUDE || '0'),
    LONGITUDE: parseFloat(process.env.LONGITUDE || '0'),

    PUNCH_IN_HOUR: parseInt(process.env.PUNCH_IN_HOUR as string || '0'),
    PUNCH_OUT_HOUR: parseInt(process.env.PUNCH_OUT_HOUR as string || '0'),
} as const

// check that all config values are defined
for (const [key, value] of Object.entries(config)) {
    if (!value) {
        throw new Error(`Missing config value for key: ${key}`)
    }
}

export {config}
