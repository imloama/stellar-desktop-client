// 使用sqlite保存数据
var Promise = require('es6-promise').Promise
var Base64 = require('js-base64').Base64
import Datastore from 'nedb'
import path from 'path'
import { remote } from 'electron'

export const DB_NAME = 'firefly.db'
export const CREATE_TABLE = `CREATE TABLE IF NOT EXISTS firefly (K TEXT PRIMARY KEY NOT NULL,V TEXT)`

let db =  new Datastore({
  filename: path.join(remote.app.getPath('userData'), 'db/'+DB_NAME)
})
db.loadDatabase(err=>{
  console.log('load data--')
  console.error(err)
})
// export function initDB(){
//   if(db){
//     return Promise.resolve()
//   }
//   db = new Datastore({
//     filename: path.join(remote.app.getPath('userData'), 'db/'+DB_NAME)
//   })
//   return new Promise((resolve,reject)=>{
//     db.loadDatabase(err=>{

//     })
//   })

// }

// delete file
export function deleteFile(file){
  console.log('-------------------------delete file-----' + file)
  return new Promise((resolve,reject) => {
    db.remove({K: file},{multi: true}, (err, numRemoved)=>{
      if(err){
        reject(err)
        return;
      }
      if(numRemoved>0){
        resolve()
        return;
      }
      reject('no data removed')
    });//end of db.remove
  });
}

// read file into string
export function readFile(key){
  console.log('-------------------------read file-----' + key)
    return new Promise((resolve,reject) => {
      db.find({ K: key },  (err, items) => {
        console.log('--------find data-------' + key)
        console.error(err)
        console.log(items)
        if(err){
          reject(err)
        }else{
          try{
            let value = items[0].V
            value = Base64.decode(value)
            resolve(value)
          }catch(err){
            reject(err)
          }
        }
      });
    });//end of promise
}

// save file content
export function saveFile(key,value){
  if(typeof value === 'object'){
    value = JSON.stringify(value)
  }
  value = Base64.encode(value)

  return new Promise((resolve,reject) => {
    db.count({K: key}, (err, count)=>{
      if(err){
        reject(err)
        return
      }
      if(count === 0){
        db.insert({K: key, V: value}, (err, item) => {
          if(err){
            reject(err)
            return
          }
          resolve(item)
        });//end of db.insert
      }else{
        db.update({K: key}, {V: value}, {}, (err, numReplaced)=>{
          if(err){
            reject(err)
            return
          }
          if(numReplaced >0){
            resolve()
            return
          }
          reject('no data updated')
        })//end of db.update
      }
    });//end of db
  });//end of promise
}

