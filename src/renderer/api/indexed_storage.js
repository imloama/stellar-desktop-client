// 使用sqlite保存数据
var Promise = require('es6-promise').Promise
var Base64 = require('js-base64').Base64
import localforage from 'localforage'

export const DB_NAME = 'firefly.db'


localforage.config({
  driver      : localforage.INDEXEDDB, // Force WebSQL; same as using setDriver()
  name        : 'firefly',
  version     : 1.0,
  storeName   : 'k', // Should be alphanumeric, with underscores.
  description : 'database'
});

// delete file
export function deleteFile(file){
  return localforage.removeItem(file)
}

// read file into string
export function readFile(key){
  return localforage.getItem(key)
    .then(value=>{
      return Promise.resolve(Base64.decode(value))      
    })
}

// save file content
export function saveFile(key,value){
  if(typeof value === 'object'){
    value = JSON.stringify(value)
  }
  value = Base64.encode(value)
  return localforage.setItem(key,value)
}

