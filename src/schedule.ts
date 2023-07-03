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

logger.info(`scheduling punch in ${config.PUNCH_IN_SCHEDULE}`)
schedule(config.PUNCH_IN_SCHEDULE, async () => captureErrors(() => main('punchIn')));

logger.info(`scheduling punch out ${config.PUNCH_OUT_SCHEDULE}`)
schedule(config.PUNCH_OUT_SCHEDULE, async () => captureErrors(() => main('punchOut')));


