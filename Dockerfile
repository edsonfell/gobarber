FROM node:10.21-alpine

WORKDIR /usr/src/app

COPY package.json yarn.* ./

#Instalar todas as dependencias, inclusive de desenvolvimento
#RUN yarn

#Instalar apenas dependencias de prod
RUN yarn install --prod

#Copia código da API
COPY . .

EXPOSE 3333

ENTRYPOINT ["./init.sh"]
