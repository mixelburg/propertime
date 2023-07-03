import {main, Task, taskOptions} from "./app.js";

const argv = process.argv.slice(2);

const task = argv[0] as Task;

if (!task) {
    console.log('no task provided');
} else if (!taskOptions.includes(task)) {
    console.log(`invalid task provided: ${task}`);
} else {
    console.log(`task: ${task}`)
    await main(task)
}
