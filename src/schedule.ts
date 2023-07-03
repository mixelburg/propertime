import {schedule} from "node-cron";
import {main} from "./app";
import {config} from "./config";
import logger from "./logger";

logger.info(`scheduling punch in ${config.PUNCH_IN_SCHEDULE}`)
schedule(config.PUNCH_IN_SCHEDULE, () => main('punchIn'));

logger.info(`scheduling punch out ${config.PUNCH_OUT_SCHEDULE}`)
schedule(config.PUNCH_OUT_SCHEDULE, () => main('punchOut'));
