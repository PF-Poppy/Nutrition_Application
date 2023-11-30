import 'reflect-metadata';
import  {App} from './app';
import dotenv from 'dotenv';

async function main(){
  dotenv.config();
  const app = new App(3000);
  await app.initializeApp();
}

main();