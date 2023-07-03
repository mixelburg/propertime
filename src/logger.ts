import {createSyslogFormatter, levelToSyslog} from 'winston-syslog-formatter'
import {createLogger, format, transports} from 'winston'
import {config} from "./config.js";

const logger = createLogger({
    levels: levelToSyslog,
    level: config.LOG_LEVEL,

    format: format.combine(
        format.colorize({message: true}),
        createSyslogFormatter({
            facility: 20,
            appName: config.APP_NAME,
            host: config.HOST,
            procId: process.pid.toString(),
            version: config.VERSION,
            dateFormatter: (date: Date) => date.toLocaleString(),
        }),
    ),
    transports: [new transports.Console()],
})

export default logger