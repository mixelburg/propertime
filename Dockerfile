FROM node:slim as builder

RUN apt-get update && apt-get install -y tzdata
ENV TZ=Asia/Jerusalem
RUN ln -snf /usr/share/zoneinfo/$TZ /etc/localtime && echo $TZ > /etc/timezone

WORKDIR /app

COPY package.json /app
RUN npm install
RUN npm i -g typescript

COPY src /app/src
COPY tsconfig.json /app
RUN tsc


FROM node:slim

WORKDIR /app
COPY package.json /app

COPY --from=builder /app/dist /app
RUN npm install --omit=dev
RUN ls -la

# run node from binary
CMD ["node", "schedule.js"]
