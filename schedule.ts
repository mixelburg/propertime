import {config} from "dotenv";

config();

// run main with task=punchIn on weekdays at 9:00
import {schedule} from "node-cron";
import {main} from "./app.js";

const PUNCH_IN_SCHEDULE = process.env.PUNCH_IN_SCHEDULE as string;
const PUNCH_OUT_SCHEDULE = process.env.PUNCH_OUT_SCHEDULE as string;

console.log('scheduling punch in', PUNCH_IN_SCHEDULE)
schedule(PUNCH_IN_SCHEDULE, () => main('punchIn'));

// run main with task=punchOut on weekdays at 18:00
console.log('scheduling punch out', PUNCH_OUT_SCHEDULE)
schedule(PUNCH_OUT_SCHEDULE, () => main('punchOut'));
