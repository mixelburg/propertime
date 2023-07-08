import {schedule} from "node-cron";
import {main} from "./app.js";
import {config} from "./config.js";
import logger from "./logger.js";

const captureErrors = async (fn: () => Promise<void>) => {
    try {
        await fn()
    } catch (e: any) {
        console.error(e)
        logger.error(e.message)
    }
}

const punchInSchedule = config.PUNCH_IN_SCHEDULE.split(':').join(' ')
logger.info(`scheduling punch in ${punchInSchedule}`)
schedule(punchInSchedule, async () => captureErrors(() => main('punchIn')));

const punchOutSchedule = config.PUNCH_OUT_SCHEDULE.split(':').join(' ')
logger.info(`scheduling punch out ${punchOutSchedule}`)
schedule(punchOutSchedule, async () => captureErrors(() => main('punchOut')));
