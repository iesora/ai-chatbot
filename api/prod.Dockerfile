FROM node:18 AS builder
WORKDIR /labor-management-api
COPY ./api/package*.json /labor-management-api/
COPY ./api/yarn.lock /labor-management-api/
RUN yarn
COPY ./api /labor-management-api/
RUN yarn build

# for ncc

# FROM node:14-alpine
# WORKDIR /eo-api-v2
# COPY --from=builder /eo-api-v2/dist ./
# COPY --from=builder /eo-api-v2/package.json ./
# RUN yarn add typeorm@0.2.43

# CMD ["yarn", "start:prod-new"]
CMD ["yarn", "start:prod"]