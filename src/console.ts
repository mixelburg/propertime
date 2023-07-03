import {main, Task, taskOptions} from "./app.js";
import logger from "./logger.js";

const argv = process.argv.slice(2);
const task = argv[0] as Task;

try {
    if (!task) throw new Error('no task provided')
    if (!taskOptions.includes(task)) throw new Error(`invalid task provided: ${task}`)

    await main(task)
} catch (e: any) {
    logger.error(e.message);
    console.log(e)
}

