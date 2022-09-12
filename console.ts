import {main, Task} from "./app";

const argv = process.argv.slice(2);

const task = argv[0] as Task;

if (!task) {
    console.log('no task provided');
    process.exit(1);
} else {
    console.log(`task: ${task}`);
    await main(task);
}
