import { resolve } from 'dns';

// import electron, { net } from 'electron'

export function ajaxGet(url,options){
  let opt = Object.assign({
    method: 'GET'
  },options, {url})
  console.log(net)
  return new Promise((resolve,reject)=>{
    console.log('----dd----')
    const { net } = require('electron')
    console.log(net)
    let request = net.request(opt)
    console.log(request)
    request.on('response', (response) => {
      console.log(`STATUS: ${response.statusCode}`)
      console.log(`HEADERS: ${JSON.stringify(response.headers)}`)
      response.on('data', (chunk) => {
        // console.log(`BODY: ${chunk}`)
        resolve(chunk)
      })
      response.on('end', () => {
        console.log('response请求中没有更多数据。')
      })
      if(response.statusCode !== 200){
        reject(response)
      }
    })
    request.end()
  })
}

export function ajaxPOST(url,options){
  let opt = Object.assign({
    method: 'POST'
  },options, {url})
  return new Promise((resolve,reject)=>{
    const request = net.request(opt)
    request.on('response', (response) => {
      console.log(`STATUS: ${response.statusCode}`)
      console.log(`HEADERS: ${JSON.stringify(response.headers)}`)
      response.on('data', (chunk) => {
        // console.log(`BODY: ${chunk}`)
        resolve(chunk)
      })
      response.on('end', () => {
        console.log('response请求中没有更多数据。')
      })
      if(response.statusCode !== 200){
        reject(response)
      }
    })
    request.end()
  })
}