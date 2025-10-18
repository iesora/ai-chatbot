FROM node:18 AS builder
WORKDIR /ai-chatbot-api
COPY ./api/package*.json /ai-chatbot-api/
RUN npm install
COPY ./api /ai-chatbot-api/
RUN npm run build

# for ncc

# FROM node:14-alpine
# WORKDIR /eo-api-v2
# COPY --from=builder /eo-api-v2/dist ./
# COPY --from=builder /eo-api-v2/package.json ./
# RUN yarn add typeorm@0.2.43

# CMD ["yarn", "start:prod-new"]
CMD ["yarn", "start:prod"]